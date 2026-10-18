import secrets
from fastapi import HTTPException


def verify_header(expected: str, received: str):
    # FACEIT documents a configurable header, not a universal HMAC signature.
    if not expected or not secrets.compare_digest(expected, received):
        raise HTTPException(401, "Invalid webhook secret")


SUPPORTED_EVENTS = {
    "match_status_ready",
    "match_status_finished",
    "match_status_cancelled",
}
