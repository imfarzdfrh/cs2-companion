# Test the Nuxt mobile app on a real phone

The mobile product is the Nuxt app in `apps/mobile`. For this workflow, you do **not** open Android Studio, build an APK or use an emulator. Open the Nuxt development server in the phone's browser.

## 1. Put the computer and phone on the same Wi-Fi

On Ubuntu, run:

```bash
hostname -I
```

Choose the computer's Wi-Fi/LAN IPv4 address, usually in a private range such as `192.168.x.x` or `10.x.x.x`. Do not choose a Docker bridge address such as `172.17.x.x`. In the commands below, replace `192.168.1.20` with the actual address.

## 2. Configure the API address

In `backend/.env`, set the mobile origin and API callback base to the same LAN address:

```env
APP_BASE_URL=http://192.168.1.20:8000
MOBILE_URL=http://192.168.1.20:3000
SECURE_COOKIES=false
```

Keep your existing database and Steam/FACEIT secrets. Do not overwrite them or commit `backend/.env`.

Create `apps/mobile/.env`:

```env
NUXT_PUBLIC_API_BASE=http://192.168.1.20:8000
```

The value must be the computer's reachable LAN address, not `localhost`. Nuxt reads this value when its dev server starts; restart Nuxt after changing it.

## 3. Start the backend so the phone can reach it

Terminal 1:

```bash
cd ~/Desktop/dev/cs2-companion/backend
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The backend's `MOBILE_URL` must exactly match the browser origin, including scheme and port. This is used by the CORS allowlist and the Steam login redirect.

## 4. Start the Nuxt mobile app

Terminal 2, from the repository root:

```bash
cd ~/Desktop/dev/cs2-companion
pnpm install --frozen-lockfile
pnpm dev:mobile:lan
```

The LAN script binds Nuxt to `0.0.0.0:3000`. It does not convert the project into a native Android application.

## 5. Open it on the phone

In Chrome, Firefox or Safari on the phone, open:

```text
http://192.168.1.20:3000
```

Choose **Explore demo** to verify the mobile UI without a Steam/FACEIT account. The demo is local sample data and is clearly labeled. For authenticated provider data, configure the backend keys and test the Steam login flow separately.

## 6. What to verify

- The welcome page fits short and tall screens; buttons are visible and tappable.
- Home, Stats, Matches, Inventory, Notifications and Profile navigate without horizontal scrolling.
- The bottom navigation stays above the Android/iOS system gesture area.
- The page can scroll behind the bottom navigation without the last row being hidden.
- Search and select controls do not zoom the page unexpectedly when focused.
- Inventory preview opens centered in the phone viewport; close it with its button or Escape (where a keyboard is available).
- Light, dark and system themes persist after reload.
- Demo mode still opens after a refresh and does not need a reachable API.
- On an authenticated session, the phone can reach `/v1/me`, `/v1/stats` and `/v1/matches`.

## Troubleshooting

- **The phone cannot open port 3000:** confirm both devices are on the same Wi-Fi, use the correct computer IP, and make sure Nuxt was started with `pnpm dev:mobile:lan`.
- **The app opens but reports the API is unavailable:** confirm the phone can open `http://192.168.1.20:8000/health`; check that Uvicorn is bound to `0.0.0.0`; check `NUXT_PUBLIC_API_BASE` in `apps/mobile/.env`; restart Nuxt.
- **CORS error:** set backend `MOBILE_URL` to the exact Nuxt origin, e.g. `http://192.168.1.20:3000`, then restart FastAPI.
- **Steam redirects to localhost or the wrong address:** set backend `APP_BASE_URL` to `http://192.168.1.20:8000` and `MOBILE_URL` to `http://192.168.1.20:3000`, then restart FastAPI.
- **Firewall blocks LAN:** if UFW is enabled, allow ports 3000 and 8000 only from your trusted local subnet. Do not expose the development server or database to the public internet.

This is a development-only HTTP setup for a trusted local network. Production requires HTTPS, secure cookies, a public API origin, and a reviewed deployment configuration.
