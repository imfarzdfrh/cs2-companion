from datetime import datetime, timezone
import httpx
import pytest
from fastapi import HTTPException
from app.services.steam.auth import verify, ENDPOINT, NS


def callback():
    return {
        "openid.ns": NS,
        "openid.mode": "id_res",
        "openid.op_endpoint": ENDPOINT,
        "openid.return_to": "https://example.test/callback?state=abc",
        "openid.identity": "https://steamcommunity.com/openid/id/76561198000000000",
        "openid.claimed_id": "https://steamcommunity.com/openid/id/76561198000000000",
        "openid.signed": "op_endpoint,claimed_id,identity,return_to,response_nonce,assoc_handle",
        "openid.response_nonce": datetime.now(timezone.utc).strftime(
            "%Y-%m-%dT%H:%M:%SZ"
        )
        + "nonce",
        "openid.assoc_handle": "handle",
    }


@pytest.mark.asyncio
async def test_valid_callback():
    data = callback()

    def handler(request):
        assert request.url == ENDPOINT
        assert b"check_authentication" in request.content
        return httpx.Response(200, text="ns:" + NS + "\nis_valid:true\n")

    assert (
        await verify(data, data["openid.return_to"], httpx.MockTransport(handler))
        == "76561198000000000"
    )


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "field,value",
    [
        ("openid.identity", "https://evil.test/id/123"),
        ("openid.op_endpoint", "https://evil.test"),
        ("openid.signed", "identity"),
        ("openid.response_nonce", "2000-01-01T00:00:00Zabc"),
        ("openid.return_to", "https://evil.test"),
    ],
)
async def test_invalid_callback(field, value):
    data = callback()
    data[field] = value
    with pytest.raises(HTTPException):
        await verify(data, "https://example.test/callback?state=abc")


@pytest.mark.asyncio
async def test_provider_rejects_signature():
    data = callback()
    with pytest.raises(HTTPException) as error:
        await verify(
            data,
            data["openid.return_to"],
            httpx.MockTransport(lambda r: httpx.Response(200, text="is_valid:false")),
        )
    assert error.value.status_code == 401
