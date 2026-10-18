import asyncio
import time
from copy import deepcopy
import httpx
from fastapi import HTTPException
from app.core.config import settings


class FaceitClient:
    def __init__(self, key=None, transport=None):
        self.key = settings.faceit_api_key if key is None else key
        self.transport = transport
        self.cache = {}

    async def get(self, path, params=None):
        if not self.key:
            raise HTTPException(503, "FACEIT is not configured")
        cache_key = (path, tuple(sorted((params or {}).items())))
        cached = self.cache.get(cache_key)
        if cached and cached[0] > time.monotonic():
            return deepcopy(cached[1])
        async with httpx.AsyncClient(
            base_url="https://open.faceit.com/data/v4/",
            headers={"Authorization": f"Bearer {self.key}"},
            timeout=10,
            transport=self.transport,
        ) as client:
            for attempt in range(3):
                try:
                    response = await client.get(path, params=params)
                except httpx.RequestError:
                    if attempt == 2:
                        raise HTTPException(502, "FACEIT is unreachable") from None
                    await asyncio.sleep(0.2 * 2**attempt)
                    continue
                if response.status_code == 429 or response.status_code >= 500:
                    if attempt < 2:
                        try:
                            delay = min(
                                float(response.headers.get("Retry-After", "0.2")), 2
                            )
                        except ValueError:
                            delay = 0.2
                        await asyncio.sleep(max(0, delay) * 2**attempt)
                        continue
                    raise HTTPException(
                        503, "FACEIT temporarily unavailable; retry later"
                    )
                if response.status_code == 404:
                    raise HTTPException(404, "FACEIT record not found")
                if response.is_error:
                    raise HTTPException(502, "FACEIT rejected the request")
                try:
                    data = response.json()
                except ValueError:
                    raise HTTPException(502, "Invalid FACEIT response") from None
                if not isinstance(data, dict):
                    raise HTTPException(502, "Invalid FACEIT response")
                if len(self.cache) > 500:
                    self.cache.clear()
                self.cache[cache_key] = (time.monotonic() + 60, data)
                return deepcopy(data)


faceit = FaceitClient()
