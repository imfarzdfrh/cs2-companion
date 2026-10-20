from pydantic import ValidationError
from fastapi import HTTPException
from .schemas import Statistics
from urllib.parse import quote
from .client import faceit


async def statistics(player_id):
    raw = await faceit.get(f"players/{quote(player_id, safe='')}/stats/cs2")
    raw = validate(raw)
    lifetime = raw.get("lifetime", {})
    return {
        "source": "faceit",
        "kd": lifetime.get("Average K/D Ratio"),
        "winRate": lifetime.get("Win Rate %"),
        "hs": lifetime.get("Average Headshots %"),
        "matches": lifetime.get("Matches"),
        "streak": lifetime.get("Current Win Streak"),
        "maps": raw.get("segments", []),
    }


def validate(data):
    try:
        return Statistics.model_validate(data).model_dump()
    except ValidationError:
        raise HTTPException(502, "Invalid FACEIT Statistics response") from None
