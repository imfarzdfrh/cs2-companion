import hashlib
import secrets
from datetime import datetime, timezone
from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session as DBSession
from app.models.database import Session, User, db_session


def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()


def utc(dt):
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt


def current_user(request: Request, db: DBSession = Depends(db_session)):
    token = request.cookies.get("cs2_session", "")
    session = db.get(Session, digest(token)) if token else None
    if not session or utc(session.expires) < datetime.now(timezone.utc):
        raise HTTPException(401, "Sign in with Steam")
    if request.method not in {"GET", "HEAD", "OPTIONS"}:
        if not secrets.compare_digest(
            session.csrf, request.headers.get("x-csrf-token", "")
        ):
            raise HTTPException(403, "Invalid CSRF token")
    request.state.session = session
    return db.get(User, session.user_id)
