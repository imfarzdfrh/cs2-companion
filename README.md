# CS2 Companion

A working **development foundation**, not a production-complete release. A phone-first Nuxt 4 mobile web app, an independent Nuxt website, FastAPI, SQLAlchemy, Alembic and PostgreSQL deployment configuration.

- Mobile: `apps/mobile` — a dedicated Nuxt experience designed for phone browsers, with dashboard, stats, match history/details, concept catalog, favorites, notifications and profile.
- Website: `apps/website` — independent SSR marketing experience, theme showcase, download/status, FAQ and preliminary policy pages.
- Backend: `backend` — Steam OpenID verification, server-side FACEIT adapters, cookie sessions/CSRF, persistence, snapshots and authenticated webhook intake.
- Shared: `packages/types`, `packages/api-client`, `packages/ui`, `packages/config`.

**No remote match acceptance, no fabricated live statistics, no trading, no paid randomized rewards.**

## Start on Ubuntu

Install Node 24 and Python 3.12 (including `python3.12-venv`) first. Then:

```bash
git clone https://github.com/imfarzdfrh/cs2-companion.git
cd cs2-companion
git switch main
npm install -g pnpm@11.25.0
pnpm install --frozen-lockfile
cp .env.example backend/.env
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.lock.txt
alembic upgrade head
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

In separate terminals from the repository root:

```bash
pnpm dev:mobile
```

```bash
pnpm dev:website
```

Mobile Nuxt app: http://localhost:3000 — choose **Explore demo**. Website: http://localhost:3001. API docs: http://localhost:8000/docs. The mobile app is tested in a phone browser; Android Studio is not part of this Nuxt development workflow.

For scheduled snapshots, with the backend environment active:

```bash
cd backend
source .venv/bin/activate
python -m app.workers.sync
```

Use consistent `localhost` hostnames during browser authentication. Mixing `127.0.0.1` and `localhost` changes cookie scope.

## Verify

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
cd backend
source .venv/bin/activate
pytest -q
```

Browser tests (require supported browser tooling):

```bash
pnpm exec playwright install chromium
pnpm exec playwright test
```

## Documents

- [Setup, environment and deployment](docs/SETUP.md)
- [راهنمای اجرای اوبونتو](docs/SETUP_FA.md)
- [FACEIT and Steam setup](docs/PROVIDERS.md)
- [Match acceptance feasibility](docs/MATCH_ACCEPT_FEASIBILITY.md)
- [Test the Nuxt mobile app on a real phone](docs/MOBILE_TESTING.md)
- [API and data model](docs/API.md)
- [Architecture and notifications](docs/ARCHITECTURE.md)
- [Verification and known limitations](docs/VERIFICATION.md)

The original repository `cs2-companion-site` returned 404 through the connected GitHub account during audit. Its contents were not inspected, copied or changed. Supplied images guided layout and color only; all bundled illustration SVGs are original development concepts.
