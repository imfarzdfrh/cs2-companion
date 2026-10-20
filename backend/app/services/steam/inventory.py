"""Do not expose undocumented community inventory endpoints as supported APIs."""


def availability():
    return {
        "supported": False,
        "items": [],
        "reason": "No authorized CS2 inventory provider is configured. Catalog concepts do not represent ownership.",
    }
