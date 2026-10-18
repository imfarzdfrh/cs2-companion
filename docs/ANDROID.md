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
- Gradle/APK/emulator/device run: **not executed**, Android SDK unavailable in this environment.
- Native Steam login: deliberately disabled in the UI. A system-browser callback cannot simply reuse its cookies in the Capacitor WebView. Implement and test an HTTPS-associated-link/one-use PKCE exchange and secure native credential storage before enabling it.
- Native push: not configured. FCM setup, token registration, dispatch and delivery receipts are still required.
- iOS: preparation only. Add `@capacitor/ios`, run `cap add ios` on an appropriate environment, and validate using macOS/Xcode. No iOS build was performed.
