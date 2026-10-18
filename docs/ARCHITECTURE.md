# Architecture

The two Nuxt applications share TypeScript contracts, a fetch-based typed client and base color tokens, but own their pages, layouts and styles. The mobile application is a client-rendered static build suitable for Capacitor. The website is an independent SSR Node build.

FastAPI isolates Steam identity verification from FACEIT public data. The browser receives an opaque HttpOnly cookie. Session hashes and CSRF tokens live in the database. FACEIT uses a server-side bearer key, 10-second timeouts, bounded retries and a 60-second process-local cache. Public lookup uses the verified SteamID, never a client-provided nickname as proof of ownership.

The worker snapshots observed ELO hourly. It cannot reconstruct historical ELO before collection started. Period controls filter snapshots; lifetime cards remain explicitly lifetime metrics.

## Notification pipeline

Implemented: provider callback header verification → allowlisted event → provider-side participant lookup → local account association → unique notification record → authenticated notification center → user read acknowledgment.

The synchronization worker also creates in-app notifications after successful snapshots. Demo messages exist only in explicitly selected local demo mode. No match-found signal is fabricated.

Pending push architecture: authenticated device enrollment, token rotation/revocation, platform token encryption/access restrictions, transactional outbox with unique event/device keys, FCM dispatcher, retry/dead-letter handling and delivery logs. These components are not claimed as operational. Current sound/vibration settings are persisted preferences only.

## Boundaries and operations

- A single worker is assumed. Multi-worker locking and distributed throttling are release work.
- Provider failure never switches a live account into invented metrics.
- Concept catalog favorites are not ownership or trading transactions.
- All art in this repository is original SVG development illustration, with no screenshot asset extraction.
- Monetization is intentionally undecided. There is no billing schema or payment flow.
- Production privacy, account deletion/export, ingress limits, observability and live provider testing are outstanding.
