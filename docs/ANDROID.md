# Android delivery

The generated Capacitor 8 Android source is in `apps/mobile/android`. App ID: `com.cs2companion.app`. SDK configuration: min 24, compile/target 36. The project uses Java 21 source compatibility. Install the matching Android SDK/build tools through Android Studio and use an appropriate JDK 21 toolchain.

The project contains original vector launcher/splash resources, safe-area CSS, back-button handling and `cs2companion://open/notifications` deep-link navigation. This is a notification navigation link, **not an authentication callback**.

## Prepare

Set a reachable HTTPS backend URL (not localhost); then from the root:

```bash
export NUXT_PUBLIC_API_BASE=https://YOUR_API_HOST
node scripts/android-prepare.mjs
pnpm --filter @cs2/mobile exec cap open android
```

`android-prepare.mjs` rejects absent, non-HTTPS and loopback endpoints. The normal web development build uses localhost; do not directly ship those development assets. No Capacitor `server.url` or cleartext override is enabled.

In Android Studio, let Gradle sync, select an emulator or USB device and run. Or:

```bash
cd apps/mobile/android
./gradlew assembleDebug
```

Expected output after a successful local build: `app/build/outputs/apk/debug/app-debug.apk`. A debug APK is not a signed production release.

## Verified versus pending

- Android project generation and `cap sync android`: executed successfully.
- Gradle `assembleDebug`: passed in [GitHub Actions](https://github.com/imfarzdfrh/cs2-companion/actions/runs/39235327425).
- [Download demo debug APK artifact](https://github.com/imfarzdfrh/cs2-companion/actions/runs/39235327425/artifacts/12179545372), unzip, then install `app-debug.apk`. GitHub sign-in may be required; artifacts have finite retention. The demo uses `https://cs2-companion.example.invalid` intentionally; choose **Explore demo**. It does not connect to a live backend.
- An Android **API 35 / Pixel 6 emulator smoke test passed** on 2026-10-26 for commit `0f7c999f`: native WebView welcome, selecting the explicitly labeled demo, and reopening offline. [CI run and screenshots](https://github.com/imfarzdfrh/cs2-companion/actions/runs/40357905383). This is a demo-only test, not live backend/device certification.
- **Physical Android handset testing, multi-device safe area/keyboard QA and production release signing remain pending.**
- Native Steam login: deliberately disabled in the UI. A system-browser callback cannot simply reuse its cookies in the Capacitor WebView. Implement and test an HTTPS-associated-link/one-use PKCE exchange and secure native credential storage before enabling it.
- Native push: not configured. FCM setup, token registration, dispatch and delivery receipts are still required.
- iOS: preparation only. Add `@capacitor/ios`, run `cap add ios` on an appropriate environment, and validate using macOS/Xcode. No iOS build was performed.

See [physical device QA and troubleshooting](ANDROID_DEVICE_QA.md) before declaring an Android release ready.
