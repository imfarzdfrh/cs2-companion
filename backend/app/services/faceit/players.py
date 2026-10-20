from pydantic import ValidationError
from fastapi import HTTPException
from .schemas import Player
from urllib.parse import quote
from .client import faceit


async def by_steam(steam_id):
    return validate(
        await faceit.get("players", {"game": "cs2", "game_player_id": steam_id})
    )


async def player(player_id):
    return validate(await faceit.get(f"players/{quote(player_id, safe='')}"))


def validate(data):
    try:
        return Player.model_validate(data).model_dump()
    except ValidationError:
        raise HTTPException(502, "Invalid FACEIT Player response") from None
