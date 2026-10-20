import httpx
import pytest
from fastapi import HTTPException
from app.services.faceit.client import FaceitClient


@pytest.mark.asyncio
async def test_player_response_and_cache():
    calls = []

    def handler(request):
        calls.append(request)
        assert request.headers["Authorization"] == "Bearer test-key"
        assert request.url.path == "/data/v4/players"
        return httpx.Response(
            200, json={"player_id": "test", "games": {"cs2": {"faceit_elo": 1500}}}
        )

    client = FaceitClient("test-key", httpx.MockTransport(handler))
    first = await client.get("players", {"game": "cs2"})
    first["player_id"] = "mutated"
    second = await client.get("players", {"game": "cs2"})
    assert second["player_id"] == "test"
    assert len(calls) == 1


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "status,expected", [(401, 502), (403, 502), (404, 404), (429, 503), (500, 503)]
)
async def test_errors(status, expected):
    client = FaceitClient(
        "test",
        httpx.MockTransport(
            lambda r: httpx.Response(status, headers={"Retry-After": "0"}, json={})
        ),
    )
    with pytest.raises(HTTPException) as error:
        await client.get("players")
    assert error.value.status_code == expected


@pytest.mark.asyncio
async def test_retry_recovers():
    calls = []

    def handler(request):
        calls.append(request)
        return (
            httpx.Response(429, headers={"Retry-After": "0"})
            if len(calls) == 1
            else httpx.Response(200, json={"items": []})
        )

    client = FaceitClient("test", httpx.MockTransport(handler))
    assert await client.get("players/test/history", {"offset": 20, "limit": 20}) == {
        "items": []
    }
    assert len(calls) == 2
    assert calls[1].url.params["offset"] == "20"


@pytest.mark.asyncio
async def test_invalid_json():
    client = FaceitClient(
        "test", httpx.MockTransport(lambda r: httpx.Response(200, text="invalid"))
    )
    with pytest.raises(HTTPException) as error:
        await client.get("players")
    assert error.value.status_code == 502


@pytest.mark.asyncio
async def test_missing_credentials():
    with pytest.raises(HTTPException) as error:
        await FaceitClient("").get("players")
    assert error.value.status_code == 503


def test_match_normalization_preserves_unknown_elo():
    from app.services.faceit.matches import normalize_details

    record = {
        "match_id": "m",
        "results": {"winner": "faction1", "score": {"faction1": 13, "faction2": 9}},
        "teams": {"faction1": {"roster": [{"player_id": "p"}]}},
        "voting": {"map": {"pick": ["de_dust2"]}},
    }
    result = normalize_details(record, {"rounds": []}, "p")
    assert result["result"] == "Victory"
    assert result["map"] == "de_dust2"
    assert result["eloChange"] is None
    assert result["players"] == []
