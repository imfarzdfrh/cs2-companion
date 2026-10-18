def capability():
    return {
        "status": "unsupported",
        "canAccept": False,
        "reason": "No authorized, tested remote match acceptance interface is configured. Confirm matches in your game or FACEIT client.",
        "notifications": "Only configured, authenticated FACEIT match-status events. These are not native CS2 queue prompts.",
    }
