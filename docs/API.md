# API and persistence

Interactive documentation is generated at `/docs`; OpenAPI JSON is at `/openapi.json`. The committed `openapi.json` is generated from this branch.

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Database liveness check |
| `GET /v1/capabilities` | Provider availability and unsupported acceptance state |
| `GET /v1/auth/steam` | Begin browser-bound Steam OpenID login |
| `GET /v1/auth/steam/callback` | Validate and consume callback state, issue session |
| `GET /v1/me` | Current identity and CSRF token |
| `POST /v1/auth/logout` | Revoke active session |
| `POST, DELETE /v1/accounts/faceit` | Resolve public association / unlink |
| `GET /v1/stats` | Normalized FACEIT lifetime statistics and current ELO |
| `GET /v1/snapshots?days=30` | User-owned ELO snapshots; 0 means all |
| `GET /v1/matches?offset=0&limit=20` | Paginated FACEIT history |
| `GET /v1/matches/{id}` | Normalized match and player performance |
| `GET /v1/catalog` | Original concept catalog, no owned/priced claims |
| `GET /v1/favorites` | User-owned favorites |
| `PUT, DELETE /v1/favorites/{id}` | Idempotent favorites mutations |
| `PUT /v1/settings` | Validated appearance/notification preferences |
| `GET /v1/notifications` | Latest 100 user-owned notifications |
| `POST /v1/notifications/{id}/read` | Owner-only read status |
| `POST /v1/webhooks/faceit` | Provider-secret-authenticated event intake |

Authenticated browser requests use credentials and `X-CSRF-Token` for writes. Provider keys never appear in frontend runtime config. Error responses use FastAPI `detail`; 401 auth, 403 CSRF, 404 missing record, 409 missing account association, 422 validation, 429 local throttling, 502/503 provider errors.

Tables: users, sessions (token hashes), login_states (hashed short-lived state), favorites, snapshots, notifications. Foreign keys, identity uniqueness, favorite composite keys and notification deduplication constraints are defined in immutable Alembic revision 0001. PostgreSQL is configured for deployment; SQLite is the local/test fallback.

Not present: device registration/delivery-log tables, account deletion/export API, Redis/distributed cache, user-authorized FACEIT OAuth tokens. See release gaps.
