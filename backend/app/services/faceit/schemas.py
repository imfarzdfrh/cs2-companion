from pydantic import BaseModel, ConfigDict, Field


class Game(BaseModel):
    skill_level: int | None = None
    faceit_elo: int | None = None


class Player(BaseModel):
    player_id: str
    nickname: str = ""
    games: dict[str, Game] = Field(default_factory=dict)
    model_config = ConfigDict(extra="ignore")


class Statistics(BaseModel):
    lifetime: dict[str, str] = Field(default_factory=dict)
    segments: list[dict] = Field(default_factory=list)


class HistoryItem(BaseModel):
    match_id: str
    finished_at: int | None = None
    status: str | None = None
    results: dict = Field(default_factory=dict)


class History(BaseModel):
    items: list[HistoryItem] = Field(default_factory=list)
