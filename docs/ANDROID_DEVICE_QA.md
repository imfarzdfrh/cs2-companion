# Android phone and emulator QA — runtime gate

## What this build does

The shipped CI debug APK is **demo-only**, with static Nuxt assets and a deliberately unreachable API hostname. On a fresh installation it must open the welcome screen quickly and allow **Explore demo**, without accessing the network. After choosing demo it must reopen directly to the sample dashboard without network requests. Steam login, live FACEIT, remote match acceptance and push are NOT supported by this demo APK.

A Gradle `assembleDebug` success is not proof of a working Android app. The physical/emulator run below is still mandatory.

## Update your Ubuntu checkout

```bash
cd ~/Desktop/dev/cs2-companion
git fetch origin
git switch feat/ui-motion-quality-pass
git pull --ff-only origin feat/ui-motion-quality-pass
pnpm install --frozen-lockfile
```

## Build a demo-only Android APK

Requires JDK 21, Android SDK and build tools (use Android Studio on Ubuntu).

```bash
export NUXT_PUBLIC_API_BASE=https://cs2-companion.example.invalid
export CS2_ANDROID_DEMO_ONLY=1
node scripts/android-prepare.mjs
cd apps/mobile/android
./gradlew assembleDebug --no-daemon
```

Result: `apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`. **Never describe this APK as live/production.** The reserved `.invalid` hostname is allowed only when `CS2_ANDROID_DEMO_ONLY=1`; normal packaging requires a reachable HTTPS API.

Open `apps/mobile/android` in Android Studio (not the Nuxt repository root). For physical testing, connect a USB device and enable developer options/USB debugging. Or run an Android emulator with a supported system image.

## Install and smoke test

```bash
adb devices
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell am force-stop com.cs2companion.app
adb shell am start -n com.cs2companion.app/.MainActivity
adb shell pidof com.cs2companion.app
```

Test after clearing app data (this removes local demo favorites/preferences):

```bash
adb shell pm clear com.cs2companion.app
adb shell am start -n com.cs2companion.app/.MainActivity
```

**Expected on a real phone/emulator:**

1. Startup leads to the welcome screen without a lengthy network spinner.
2. `Explore demo` enters the dashboard. The sample data warning stays visible; sample stats, matches, inventory and profile work offline.
3. Close and reopen the app, including after disabling Wi-Fi/mobile data: demo still opens and navigates without contacting the backend.
4. Inventory > View illustration opens a centered full-screen-overlay modal; Close and Back return as expected.
5. Bottom navigation is above the Android navigation bar on gesture and three-button modes. Top header stays clear of status bar, camera cutout and display notch.
6. Soft keyboard does not obscure inputs; touch areas remain usable on 360px and 390px screens. Repeat in light/dark and landscape if relevant.
7. Turn on Android's Remove animations preference and verify no animation is required to reach content.
8. Sign-in is not presented as usable in the native build until secure native account exchange is implemented.

For diagnostics:

```bash
adb logcat -c
adb shell am force-stop com.cs2companion.app
adb shell am start -n com.cs2companion.app/.MainActivity
adb logcat -d -v time -s chromium Capacitor Console AndroidRuntime > /tmp/cs2-companion-android.log
```

Android Studio **Logcat** can also filter by `com.cs2companion.app`. For inspecting the actual WebView, open Chrome on your Ubuntu computer at `chrome://inspect/#devices`, connect your phone and inspect the app WebView. Report the device/API level, whether it is APK or phone browser, precise failure/screenshot, logcat excerpts and whether the demo flow works in airplane mode.

## Browser on a phone is a different deployment

Opening `http://localhost:3000` **on the phone** points to the phone, not your Ubuntu computer. To test Nuxt from the same trusted Wi-Fi network, use your Ubuntu machine LAN IP (example only: `192.168.1.50`), set both API and mobile allowed origin to that IP, and bind the services to non-loopback interfaces:

```bash
# Terminal A, from backend/ with active venv
export MOBILE_URL=http://192.168.1.50:3000
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Terminal B, from repository root
export NUXT_PUBLIC_API_BASE=http://192.168.1.50:8000
pnpm --filter @cs2/mobile exec nuxt dev --host 0.0.0.0 --port 3000
```

Browse to `http://192.168.1.50:3000` from the phone and confirm your actual LAN IP. Do not expose these development endpoints to the public internet. Mobile browser cookies, CORS and HTTPS vary from the isolated native APK and must be tested separately.

## Release gates

Before any claim of 'works on Android', record a successful emulator/physical smoke test with screenshot and log. For a live native app, complete the one-time secure Steam session exchange, server deployment with HTTPS, push design, proper permissions, account lifecycle and release signing. A browser cookie session cannot be assumed to transfer from Chrome into the Android WebView.
