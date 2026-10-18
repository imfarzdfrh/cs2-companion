from datetime import datetime, timedelta, timezone
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app, buckets
from app.models.database import Base, User, Session, db_session
from app.api.security import digest


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    factory = sessionmaker(engine)
    with factory() as db:
        user = User(steam_id="76561198000000000", nickname="Test")
        db.add(user)
        db.flush()
        db.add(
            Session(
                token_hash=digest("token"),
                user_id=user.id,
                csrf="csrf",
                expires=datetime.now(timezone.utc) + timedelta(hours=1),
            )
        )
        db.commit()

    def override():
        with factory() as db:
            yield db

    app.dependency_overrides[db_session] = override
    buckets.clear()
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()
    engine.dispose()


def test_health_and_capabilities(client):
    assert client.get("/health").json() == {"status": "ok"}
    result = client.get("/v1/capabilities").json()
    assert result["matchCompanion"]["status"] == "unsupported"
    assert result["matchCompanion"]["canAccept"] is False


def test_auth_required(client):
    assert client.get("/v1/me").status_code == 401
    assert client.get("/v1/favorites").status_code == 401


def test_csrf_and_favorite_persistence(client):
    client.cookies.set("cs2_session", "token")
    assert client.put("/v1/favorites/amber").status_code == 403
    headers = {"x-csrf-token": "csrf"}
    assert client.put("/v1/favorites/amber", headers=headers).status_code == 200
    assert client.get("/v1/favorites").json() == ["amber"]
    assert client.put("/v1/favorites/amber", headers=headers).status_code == 200
    assert client.get("/v1/favorites").json() == ["amber"]
    assert client.put("/v1/favorites/unknown", headers=headers).status_code == 404
    assert client.delete("/v1/favorites/amber", headers=headers).status_code == 200
    assert client.get("/v1/favorites").json() == []


def test_settings_and_logout(client):
    client.cookies.set("cs2_session", "token")
    headers = {"x-csrf-token": "csrf"}
    assert (
        client.put(
            "/v1/settings", headers=headers, json={"theme": "purple"}
        ).status_code
        == 422
    )
    assert (
        client.put(
            "/v1/settings", headers=headers, json={"theme": "light", "sound": False}
        ).status_code
        == 200
    )
    assert client.get("/v1/me").json()["settings"]["sound"] is False
    assert client.post("/v1/auth/logout", headers=headers).status_code == 200
    client.cookies.set("cs2_session", "token")
    assert client.get("/v1/me").status_code == 401


def test_no_fabricated_inventory(client):
    data = client.get("/v1/catalog").json()
    assert all(i["price"] is None and i["owned"] is False for i in data["items"])


def test_callback_rejects_missing_state(client):
    assert client.get("/v1/auth/steam/callback?state=fake").status_code == 400


def test_webhook_requires_secret(client):
    assert client.post("/v1/webhooks/faceit", json={}).status_code == 401


def test_no_cross_user_notification_access(client):
    client.cookies.set("cs2_session", "token")
    assert (
        client.post(
            "/v1/notifications/999/read", headers={"x-csrf-token": "csrf"}
        ).status_code
        == 404
    )


def test_rate_limit(client):
    for _ in range(120):
        assert client.get("/v1/capabilities").status_code == 200
    assert client.get("/v1/capabilities").status_code == 429
