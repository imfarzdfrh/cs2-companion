import hashlib
import json
import secrets
import time
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, Depends, HTTPException, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy import select, text, delete
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session as DBSession
from app.core.config import settings
from app.models.database import (
    User,
    Session,
    LoginState,
    Favorite,
    Snapshot,
    Notification,
    db_session,
)
from app.api.security import current_user, digest, utc
from app.services.steam import auth, profiles
from app.services.faceit import players, statistics, matches, matchmaking
from app.services.faceit.webhooks import verify_header, SUPPORTED_EVENTS

app = FastAPI(title="CS2 Companion", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.mobile_url, "https://localhost"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "X-CSRF-Token"],
)
buckets = defaultdict(deque)


@app.middleware("http")
async def guards(request, call_next):
    key = request.client.host if request.client else "unknown"
    now = time.monotonic()
    if len(buckets) > 10000:
        buckets.clear()
    q = buckets[key]
    while q and q[0] < now - 60:
        q.popleft()
    if len(q) >= 120:
        return JSONResponse(
            {"detail": "Rate limit exceeded"},
            status_code=429,
            headers={"Retry-After": "60"},
        )
    q.append(now)
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Cache-Control"] = "no-store"
    return response


@app.get("/health")
def health(db: DBSession = Depends(db_session)):
    db.execute(text("SELECT 1"))
    return {"status": "ok"}


@app.get("/v1/capabilities")
def capabilities():
    return {
        "demo": settings.demo_mode,
        "steam": True,
        "faceit": bool(settings.faceit_api_key),
        "inventory": "catalog-only",
        "push": False,
        "matchCompanion": matchmaking.capability(),
    }


@app.get("/v1/auth/steam")
def steam_login(db: DBSession = Depends(db_session)):
    state = secrets.token_urlsafe(32)
    db.add(
        LoginState(
            token_hash=digest(state),
            expires=datetime.now(timezone.utc) + timedelta(minutes=5),
        )
    )
    db.commit()
    callback = settings.app_base_url + "/v1/auth/steam/callback?state=" + state
    response = RedirectResponse(auth.login_url(callback, settings.app_base_url + "/"))
    response.set_cookie(
        "cs2_login",
        state,
        httponly=True,
        secure=settings.secure_cookies,
        samesite="lax",
        max_age=300,
    )
    return response


@app.get("/v1/auth/steam/callback")
async def steam_callback(request: Request, db: DBSession = Depends(db_session)):
    params = dict(request.query_params)
    state = params.get("state", "")
    saved = db.get(LoginState, digest(state))
    if (
        not saved
        or not secrets.compare_digest(state, request.cookies.get("cs2_login", ""))
        or utc(saved.expires) < datetime.now(timezone.utc)
    ):
        raise HTTPException(400, "Login expired; try again")
    # Consume before network verification: a callback may only be used once.
    result = db.execute(
        delete(LoginState).where(LoginState.token_hash == digest(state))
    )
    db.commit()
    if result.rowcount != 1:
        raise HTTPException(400, "Login already consumed")
    steam_id = await auth.verify(
        params, settings.app_base_url + "/v1/auth/steam/callback?state=" + state
    )
    user = db.scalar(select(User).where(User.steam_id == steam_id))
    if not user:
        user = User(steam_id=steam_id)
        db.add(user)
    try:
        info = await profiles.profile(steam_id)
        user.nickname = info.get("personaname", "Player")
        user.avatar = info.get("avatarfull", "")
    except Exception:
        # Profile availability must not change a verified identity.
        pass
    db.flush()
    token = secrets.token_urlsafe(40)
    db.add(
        Session(
            token_hash=digest(token),
            user_id=user.id,
            csrf=secrets.token_urlsafe(32),
            expires=datetime.now(timezone.utc) + timedelta(days=7),
        )
    )
    db.commit()
    response = RedirectResponse(settings.mobile_url + "/profile")
    response.delete_cookie("cs2_login")
    response.set_cookie(
        "cs2_session",
        token,
        httponly=True,
        secure=settings.secure_cookies,
        samesite="lax",
        max_age=604800,
    )
    return response


@app.get("/v1/me")
def me(request: Request, user: User = Depends(current_user)):
    return {
        "id": user.id,
        "nickname": user.nickname,
        "avatar": user.avatar,
        "steamId": user.steam_id,
        "faceitId": user.faceit_id,
        "settings": user.settings,
        "csrf": request.state.session.csrf,
    }


@app.post("/v1/auth/logout")
def logout(
    request: Request,
    user: User = Depends(current_user),
    db: DBSession = Depends(db_session),
):
    db.delete(db.get(Session, request.state.session.token_hash))
    db.commit()
    response = JSONResponse({"ok": True})
    response.delete_cookie("cs2_session")
    return response


@app.post("/v1/accounts/faceit")
async def link_faceit(
    user: User = Depends(current_user), db: DBSession = Depends(db_session)
):
    found = await players.by_steam(user.steam_id)
    if not found.get("player_id"):
        raise HTTPException(502, "Invalid player response")
    user.faceit_id = found["player_id"]
    db.add(user)
    db.commit()
    return {
        "faceitId": user.faceit_id,
        "method": "public SteamID association; not OAuth authorization",
    }


@app.delete("/v1/accounts/faceit")
def unlink_faceit(
    user: User = Depends(current_user), db: DBSession = Depends(db_session)
):
    user.faceit_id = None
    db.add(user)
    db.commit()
    return {"ok": True}


def faceit_id(user):
    if not user.faceit_id:
        raise HTTPException(409, "Connect FACEIT in Profile")
    return user.faceit_id


@app.get("/v1/stats")
async def stats(user: User = Depends(current_user)):
    pid = faceit_id(user)
    profile = await players.player(pid)
    data = await statistics.statistics(pid)
    game = profile.get("games", {}).get("cs2", {})
    return {
        **data,
        "elo": game.get("faceit_elo"),
        "level": game.get("skill_level"),
        "nickname": profile.get("nickname"),
    }


@app.get("/v1/snapshots")
def snapshots(
    days: int = Query(30, ge=0, le=36500),
    user: User = Depends(current_user),
    db: DBSession = Depends(db_session),
):
    query = select(Snapshot).where(Snapshot.user_id == user.id)
    if days:
        query = query.where(
            Snapshot.recorded_at >= datetime.now(timezone.utc) - timedelta(days=days)
        )
    rows = db.scalars(query.order_by(Snapshot.recorded_at)).all()
    return [{"elo": s.elo, "date": s.recorded_at.isoformat()} for s in rows]


@app.get("/v1/matches")
async def match_history(
    offset: int = Query(0, ge=0, le=1000),
    limit: int = Query(20, ge=1, le=100),
    user: User = Depends(current_user),
):
    raw = await matches.history(faceit_id(user), offset, limit)
    return {
        "source": "faceit",
        "items": [
            {
                "id": m["match_id"],
                "date": m.get("finished_at"),
                "status": m.get("status"),
                "score": m.get("results", {}).get("score"),
                "url": "https://www.faceit.com/en/cs2/room/" + m["match_id"],
            }
            for m in raw.get("items", [])
        ],
        "offset": offset,
        "limit": limit,
    }


@app.get("/v1/matches/{match_id}")
async def match_detail(match_id: str, user: User = Depends(current_user)):
    if len(match_id) > 100:
        raise HTTPException(422, "Invalid match ID")
    return matches.normalize_details(
        await matches.details(match_id),
        await matches.statistics(match_id),
        user.faceit_id,
    )


CATALOG = [
    {
        "id": "amber",
        "name": "Amber Circuit",
        "weapon": "Rifle",
        "rarity": "Concept",
        "exterior": "Not applicable",
        "image": "/art/rifle.svg",
        "owned": False,
        "price": None,
    },
    {
        "id": "blue",
        "name": "Midnight Signal",
        "weapon": "Sniper",
        "rarity": "Concept",
        "exterior": "Not applicable",
        "image": "/art/sniper.svg",
        "owned": False,
        "price": None,
    },
    {
        "id": "gold",
        "name": "Golden Hour",
        "weapon": "Rifle",
        "rarity": "Concept",
        "exterior": "Not applicable",
        "image": "/art/rifle.svg",
        "owned": False,
        "price": None,
    },
]


@app.get("/v1/catalog")
def catalog():
    return {
        "source": "original concept illustrations; not tradable CS2 items",
        "items": CATALOG,
    }


@app.get("/v1/favorites")
def favorites(user: User = Depends(current_user), db: DBSession = Depends(db_session)):
    return list(db.scalars(select(Favorite.item_id).where(Favorite.user_id == user.id)))


@app.put("/v1/favorites/{item_id}")
def favorite(
    item_id: str,
    user: User = Depends(current_user),
    db: DBSession = Depends(db_session),
):
    if item_id not in [i["id"] for i in CATALOG]:
        raise HTTPException(404, "Item not found")
    if not db.get(Favorite, (user.id, item_id)):
        db.add(Favorite(user_id=user.id, item_id=item_id))
        db.commit()
    return {"ok": True}


@app.delete("/v1/favorites/{item_id}")
def unfavorite(
    item_id: str,
    user: User = Depends(current_user),
    db: DBSession = Depends(db_session),
):
    row = db.get(Favorite, (user.id, item_id))
    if row:
        db.delete(row)
        db.commit()
    return {"ok": True}


class Preferences(BaseModel):
    sound: bool = True
    vibration: bool = True
    sync_alerts: bool = True
    theme: str = Field("system", pattern="^(system|dark|light)$")


@app.put("/v1/settings")
def preferences(
    body: Preferences,
    user: User = Depends(current_user),
    db: DBSession = Depends(db_session),
):
    user.settings = body.model_dump()
    db.add(user)
    db.commit()
    return user.settings


@app.get("/v1/notifications")
def notifications(
    user: User = Depends(current_user), db: DBSession = Depends(db_session)
):
    rows = db.scalars(
        select(Notification)
        .where(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc())
        .limit(100)
    ).all()
    return [
        {"id": n.id, "title": n.title, "read": n.read, "date": n.created_at.isoformat()}
        for n in rows
    ]


@app.post("/v1/notifications/{notification_id}/read")
def read_notification(
    notification_id: int,
    user: User = Depends(current_user),
    db: DBSession = Depends(db_session),
):
    row = db.get(Notification, notification_id)
    if not row or row.user_id != user.id:
        raise HTTPException(404, "Notification not found")
    row.read = True
    db.commit()
    return {"ok": True}


@app.post("/v1/webhooks/faceit")
async def webhook(request: Request, db: DBSession = Depends(db_session)):
    expected = settings.faceit_webhook_secret
    verify_header(expected, request.headers.get("x-faceit-secret", ""))
    body = await request.body()
    if len(body) > 65536:
        raise HTTPException(413, "Payload too large")
    try:
        event = json.loads(body)
    except ValueError:
        raise HTTPException(400, "Invalid JSON") from None
    if not isinstance(event, dict):
        raise HTTPException(422, "Invalid event")
    event_type = event.get("event")
    if event_type not in SUPPORTED_EVENTS:
        return {"ignored": True}
    payload = event.get("payload", {})
    match_id = payload.get("id") if isinstance(payload, dict) else None
    if not isinstance(match_id, str) or len(match_id) > 100:
        raise HTTPException(422, "Missing match ID")
    # Resolve participants from the authenticated provider API, never from submitted user IDs.
    record = await matches.details(match_id)
    participant_ids = {
        p.get("player_id")
        for team in record.get("teams", {}).values()
        for p in team.get("roster", [])
    }
    users = db.scalars(select(User).where(User.faceit_id.in_(participant_ids))).all()
    for user in users:
        key = f"{event_type}:{match_id}"
        if db.scalar(
            select(Notification).where(
                Notification.user_id == user.id, Notification.event_id == key
            )
        ):
            continue
        db.add(
            Notification(
                user_id=user.id,
                event_id=key,
                title=f"FACEIT {event_type.removeprefix('match_status_')}: {match_id}",
            )
        )
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
    return {"ok": True, "delivery": "in-app only"}
