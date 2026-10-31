# Setup and deployment

## Development

Use the exact commands in README. SQLite is a convenient local fallback; PostgreSQL is the configured deployment database. Environment is loaded relative to the backend working directory. Do not commit `.env` files.

Provider-free exploration runs entirely through an explicitly selected demo mode. There is no server demo login that could impersonate a real account. Real sessions do not silently substitute demo data when a provider fails.

## Docker Compose

Install Docker Engine and the Compose plugin separately. Set a database password in the current shell, avoiding shell history:

```bash
read -rsp 'PostgreSQL password: ' POSTGRES_PASSWORD
export POSTGRES_PASSWORD
printf '\n'
docker compose up --build -d
docker compose ps
```

For this simple connection-string configuration, use a long random alphanumeric password; URL-reserved characters require URL encoding. Ports bind to loopback. Postgres data persists in a named volume. The backend migrates before Uvicorn; the worker waits for its health check.

`docker compose down` retains data. Do not add `--volumes` unless you explicitly intend to delete it.

## Production preparation

This branch is not production approved. Before deployment:

- Configure real public HTTPS API and mobile origins. Build mobile with `NUXT_PUBLIC_API_BASE`; configure website with `NUXT_PUBLIC_MOBILE_URL`. The localhost defaults are development-only.
- Prefer same-site API/mobile origins for the current SameSite=Lax cookie flow. Cross-site browser cookies and native WebView authentication require an additional tested design.
- Set `SECURE_COOKIES=true`, `APP_BASE_URL`, `MOBILE_URL`, and backend-only provider keys. CORS is an exact allowlist, never a wildcard credential origin.
- Terminate HTTPS in a trusted proxy; enforce body-size limits before buffering, shared rate limits, log redaction, backups and secret rotation.
- Run one synchronization worker until locking/retry coordination is added. Current rate limiting and provider cache are per-process.
- Register and test webhooks; do not describe events as native CS2 queue detection.
- Complete the unresolved release gates in VERIFICATION.md. The preliminary policy pages are not final operator policies.

## Troubleshooting

- `401`: no active Steam session. Sign in through the web app.
- `403`: missing/invalid CSRF token. Restore `/v1/me` after login.
- `409`: connect FACEIT in Profile first.
- `503`: missing FACEIT key or provider rate limit/unavailability. Do not enable fake live results.
- `404` player: no accessible CS2 FACEIT record for the verified SteamID.
- Private profiles: display name/avatar may be unavailable; verified identity is separate from profile visibility.


## Test the mobile Nuxt app on a real phone

The mobile app is a Nuxt web application. Run it in the phone's browser over the same trusted Wi-Fi network; do not open `localhost` on the phone, because that points to the phone itself. Follow [MOBILE_TESTING.md](MOBILE_TESTING.md) for exact LAN setup, environment values and troubleshooting. Android Studio is not required for this workflow.
