import re
from datetime import datetime, timezone
from urllib.parse import urlencode
import httpx
from fastapi import HTTPException

ENDPOINT = "https://steamcommunity.com/openid/login"
NS = "http://specs.openid.net/auth/2.0"


def login_url(return_to, realm):
    return (
        ENDPOINT
        + "?"
        + urlencode(
            {
                "openid.ns": NS,
                "openid.mode": "checkid_setup",
                "openid.return_to": return_to,
                "openid.realm": realm,
                "openid.identity": NS + "/identifier_select",
                "openid.claimed_id": NS + "/identifier_select",
            }
        )
    )


async def verify(params, return_to, transport=None):
    required = {
        "op_endpoint",
        "claimed_id",
        "identity",
        "return_to",
        "response_nonce",
        "assoc_handle",
    }
    if (
        params.get("openid.ns") != NS
        or params.get("openid.mode") != "id_res"
        or params.get("openid.op_endpoint") != ENDPOINT
    ):
        raise HTTPException(400, "Invalid Steam callback")
    if params.get("openid.return_to") != return_to or not required.issubset(
        set(params.get("openid.signed", "").split(","))
    ):
        raise HTTPException(400, "Invalid Steam signed fields")
    claimed = params.get("openid.claimed_id", "")
    if claimed != params.get("openid.identity") or not re.fullmatch(
        r"https://steamcommunity.com/openid/id/[0-9]{17}", claimed
    ):
        raise HTTPException(400, "Invalid Steam identity")
    try:
        timestamp = datetime.strptime(
            params["openid.response_nonce"][:20], "%Y-%m-%dT%H:%M:%SZ"
        ).replace(tzinfo=timezone.utc)
    except (ValueError, KeyError):
        raise HTTPException(400, "Invalid nonce") from None
    if abs((datetime.now(timezone.utc) - timestamp).total_seconds()) > 300:
        raise HTTPException(400, "Expired callback")
    payload = {k: v for k, v in params.items() if k.startswith("openid.")}
    payload["openid.mode"] = "check_authentication"
    try:
        async with httpx.AsyncClient(timeout=10, transport=transport) as client:
            response = await client.post(ENDPOINT, data=payload)
            response.raise_for_status()
    except httpx.HTTPError:
        raise HTTPException(502, "Steam verification unavailable") from None
    if "is_valid:true" not in response.text.splitlines():
        raise HTTPException(401, "Steam verification failed")
    return claimed.rsplit("/", 1)[1]
