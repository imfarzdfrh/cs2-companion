"""Public account association uses the verified SteamID, not nickname claims.
OAuth account authorization is deliberately disabled until FACEIT Connect
application registration and end-to-end callback validation are configured.
"""


def oauth_capability():
    return {
        "enabled": False,
        "reason": "FACEIT Connect OAuth is not implemented in this foundation; Data API uses a server-side key.",
    }
