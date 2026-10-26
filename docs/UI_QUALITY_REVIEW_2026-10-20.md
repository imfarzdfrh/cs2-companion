# CS2 Companion — UI and quality audit (2026-10-20)

Scope: targeted source review of both Nuxt apps, shared API client, state management, authentication boundaries, backend routes, CI and documented verification. This is not a complete production/security audit or a claim of live-provider acceptance.

## Corrected in this branch

- Handle empty 204 responses and non-JSON gateway failures safely in the shared API client; normalize trailing base URL slash.
- Show real zero-valued percentage metrics instead of placeholder dashes.
- Tolerate invalid JSON in saved demo profile preferences.
- Improve website mobile navigation with labeled toggle, accessible state, Escape handling and keyboard skip link.
- Expose selected navigation, appearance and period states using aria-current / aria-pressed.
- Add responsive premium styling, larger labels, richer contrast, card interaction and scroll/entrance animations to both apps.
- Respect reduced-motion preferences. Content remains readable before client-side enhancements.
- Add regression tests for API edge cases, website mobile navigation and corrupted saved settings.

## Architecture observations

- Mobile and promotional website are intentionally distinct Nuxt 4 applications.
- FastAPI, SQLAlchemy/Alembic and shared packages are already present.
- Current source separates explicit demo data from live provider values.
- FACEIT status events are not proof of an official native game acceptance prompt; remote acceptance remains disabled.
- Project includes GitHub Actions for type checking, linting, unit/API tests, browser E2E, builds, backend pytest, migrations and packaging.

## Verify this branch before merging

Run the GitHub Actions jobs on the proposed PR. From Ubuntu, with Node 24, pnpm 11, Python 3.12 and browser tooling:

```bash
pnpm install --frozen-lockfile
pnpm typecheck && pnpm lint && pnpm test && pnpm build
pnpm exec playwright install chromium
pnpm exec playwright test
cd backend && python -m pytest -q
```

Manually inspect mobile/website widths 360, 390, 768, 900 and 1440px; light/dark appearance, keyboard-only interactions, slow/error network states, safe areas, the reduced-motion preference, contrast and reduced-performance Android devices.

## Follow-up priorities

1. Test actual Steam and FACEIT flows with authorized accounts and provider credentials.
2. Finish secure native login, supported push delivery, real Android device QA and signed distribution.
3. Finalize account deletion/export, data retention, published policy copy, privacy compliance, secure production cookie/CORS/HTTPS configuration and accessible error recovery.
4. Implement operational monitoring, backups, distributed rate limiting and worker concurrency protection before public launch.
5. Complete independent WCAG/accessibility and performance audits. Verify the provenance and permissions of any future artwork/assets.

Do not infer that a previous successful workflow run validates new commits. Keep this PR unmerged until current CI and manual visual checks are reviewed.

## 2026-10-26 native runtime follow-up

- Avoided a 15-second blocked startup against the demo APK's deliberately non-routable API; persisted sample mode now boots offline without probing the server.
- Delayed rendering data-fetching routes until unauthenticated users reach welcome.
- Fixed small-screen safe-area layout and viewport handling, and removed a page transform that could misposition fixed dialogs.
- Added Android emulator execution and offline reopening smoke test on API 35. [Emulator success and screenshots](https://github.com/imfarzdfrh/cs2-companion/actions/runs/40357905383).
- GitHub Actions Playwright jobs pinned to Ubuntu 24.04 because this lockfile's Playwright cannot install Chromium on Ubuntu 26.04.
- Device-specific manual QA and live Steam/FACEIT/native authentication remain unverified. See [Android test runbook](ANDROID_DEVICE_QA.md).
