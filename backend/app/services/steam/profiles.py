import httpx
from app.core.config import settings


async def profile(steam_id):
    if not settings.steam_api_key:
        return {"personaname": "Steam player", "avatarfull": ""}
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(
            "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/",
            params={"key": settings.steam_api_key, "steamids": steam_id},
        )
        response.raise_for_status()
        players = response.json().get("response", {}).get("players", [])
        return (
            players[0]
            if players
            else {"personaname": "Private player", "avatarfull": ""}
        )
