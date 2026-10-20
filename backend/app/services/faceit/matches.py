from pydantic import ValidationError
from fastapi import HTTPException
from .schemas import History
from urllib.parse import quote
from .client import faceit


async def history(player_id, offset=0, limit=20):
    return validate(
        await faceit.get(
            f"players/{quote(player_id, safe='')}/history",
            {"game": "cs2", "offset": offset, "limit": limit},
        )
    )


async def details(match_id):
    return await faceit.get(f"matches/{quote(match_id, safe='')}")


async def statistics(match_id):
    return await faceit.get(f"matches/{quote(match_id, safe='')}/stats")


def validate(data):
    try:
        return History.model_validate(data).model_dump()
    except ValidationError:
        raise HTTPException(502, "Invalid FACEIT History response") from None


def normalize_details(record, stats, player_id):
    results = record.get("results") or {}
    score = results.get("score") or {}
    picked = record.get("voting", {}).get("map", {}).get("pick", [])
    rows = []
    for round_ in stats.get("rounds", []):
        for team in round_.get("teams", []):
            for player in team.get("players", []):
                data = player.get("player_stats", {})
                rows.append(
                    {
                        "id": player.get("player_id"),
                        "nickname": player.get("nickname"),
                        "map": round_.get("round_stats", {}).get("Map"),
                        "kills": data.get("Kills"),
                        "deaths": data.get("Deaths"),
                        "assists": data.get("Assists"),
                        "kd": data.get("K/D Ratio"),
                        "hs": data.get("Headshots %"),
                    }
                )
    team_id = next(
        (
            key
            for key, team in record.get("teams", {}).items()
            if any(p.get("player_id") == player_id for p in team.get("roster", []))
        ),
        None,
    )
    result = None
    if team_id and results.get("winner"):
        result = "Victory" if results["winner"] == team_id else "Defeat"
    return {
        "source": "faceit",
        "id": record.get("match_id"),
        "map": picked[0] if picked else None,
        "result": result,
        "status": record.get("status"),
        "score": score,
        "date": record.get("finished_at") or record.get("started_at"),
        "players": rows,
        "eloChange": None,
        "timeline": None,
    }
