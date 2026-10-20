# Provider setup and boundaries

Research date: 2026-10-18. No provider credentials were supplied or used for live verification.

## FACEIT Data API v4

Sources: [authentication and public data](https://docs.faceit.com/docs/data-api/), [endpoint reference](https://docs.faceit.com/docs/data-api/data/), [developer portal](https://developers.faceit.com/).

1. Create an application in App Studio and obtain a **server-side** Data API key.
2. Put it only in backend `FACEIT_API_KEY`.
3. Sign in with Steam, then select Connect FACEIT. The backend resolves public CS2 player data using the verified SteamID via `GET /players?game=cs2&game_player_id=...`.
4. Inspect statistics and history. Keep not-found/private/unavailable states visible.
5. Start the worker to collect ELO snapshots hourly. The first snapshot is the beginning of our history; no backfilled ELO is invented.

Implemented upstream endpoints: player lookup and profile; `/players/{id}/stats/cs2`; `/players/{id}/history`; `/matches/{id}`; `/matches/{id}/stats`. Pagination, timeouts, bounded retry, cache and normalized errors are implemented. Pydantic validates player, lifetime statistics and history DTOs. Match detail normalization is intentionally tolerant of missing fields.

Public SteamID association is **not** FACEIT OAuth consent. FACEIT Connect credentials are reserved in `.env.example`, but OAuth code/token flows are not implemented. [FACEIT Connect](https://docs.faceit.com/getting-started/authentication/oauth2/) requires an application consent screen, client, redirect URI and authorization-code/PKCE implementation before user-authorized scopes are used.

## FACEIT webhooks

Source: [official webhook reference](https://docs.faceit.com/docs/webhooks/).

Choose an available User/Organizer/Game subscription appropriate to your application. Configure callback `https://YOUR_API/v1/webhooks/faceit` and custom header `X-Faceit-Secret` with the same randomly generated value as `FACEIT_WEBHOOK_SECRET`. The provider documents configurable callback authentication, not a universal HMAC scheme; this code therefore uses constant-time header-secret verification.

Only `match_status_ready`, `match_status_finished`, and `match_status_cancelled` are processed. Participants are re-resolved through the server-side Data API. Notifications go only to associated local users and deduplicate by user + event type + match ID. This may collapse repeated legitimate transitions of the same type; do not use it as a complete event audit stream.

HTTPS, restricted ingress, secret rotation and a real provider delivery test are required before enabling this in production. Match-ready status is not native queue-ready detection. Delivery is in-app only; FCM is not configured.

## Steam

Sources: [Steam community API and OpenID](https://steamcommunity.com/dev), [Steamworks authentication](https://partner.steamgames.com/doc/features/auth).

Steam OpenID uses the provider endpoint and server-side `check_authentication` verification. This application checks endpoint/namespace, identity consistency, signed fields, exact return URL, a short nonce age and a single-use browser-bound login state. Session tokens are stored hashed; cookies are HttpOnly and SameSite=Lax, Secure when configured. CSRF tokens protect mutations.

Set `APP_BASE_URL` to your backend origin and `MOBILE_URL` to the mobile web origin. A Web API key is needed for profile summaries, but not to make up a Steam password flow. Missing profile data does not invalidate a successfully verified identity.

No publisher-only inventory/ownership API access is assumed. No unsupported CS2 inventory endpoint is called.
