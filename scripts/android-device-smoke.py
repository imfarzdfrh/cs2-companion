"""ADB smoke test for CS2 Companion's demo-only Android APK.

Requires an already booted emulator; relies on Android accessibility hierarchy
rather than screenshots or OCR. Saves useful evidence even on failure.
"""
from __future__ import annotations

import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET
from pathlib import Path

OUT = Path("artifacts/android-emulator")
OUT.mkdir(parents=True, exist_ok=True)
APK = Path("apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk")
PACKAGE = "com.cs2companion.app"


def adb(*args: str, check: bool = True) -> subprocess.CompletedProcess[bytes]:
    return subprocess.run(["adb", *args], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=check, timeout=30)


def screen(name: str) -> None:
    try:
        (OUT / f"{name}.png").write_bytes(adb("exec-out", "screencap", "-p").stdout)
    except Exception as error:
        print(f"screenshot error: {error}", file=sys.stderr)


def dump(name: str) -> list[ET.Element]:
    adb("shell", "uiautomator", "dump", "/sdcard/cs2window.xml")
    raw = adb("exec-out", "cat", "/sdcard/cs2window.xml").stdout
    (OUT / f"{name}.xml").write_bytes(raw)
    root = ET.fromstring(raw)
    return list(root.iter("node"))


def search(nodes: list[ET.Element], phrase: str) -> ET.Element | None:
    return next((node for node in nodes if phrase.lower() in (
        node.attrib.get("text", "") + " " + node.attrib.get("content-desc", "")
    ).lower()), None)


def wait_for(phrase: str, name: str, seconds: int = 15) -> ET.Element:
    end = time.monotonic() + seconds
    latest: list[ET.Element] = []
    while time.monotonic() < end:
        try:
            latest = dump(name)
            found = search(latest, phrase)
            if found is not None:
                screen(name)
                return found
        except (subprocess.CalledProcessError, ET.ParseError, subprocess.TimeoutExpired):
            pass
        time.sleep(1)
    screen(f"{name}-failed")
    texts = [node.attrib.get("text", "") for node in latest if node.attrib.get("text")]
    raise AssertionError(f"Android screen missing {phrase!r}. Accessibility text: {texts[:60]}")


def tap(node: ET.Element) -> None:
    bounds = node.attrib.get("bounds", "")
    values = [int(value) for value in re.findall(r"\d+", bounds)]
    if len(values) != 4:
        raise AssertionError(f"Clickable element has no usable bounds: {bounds!r}")
    x = (values[0] + values[2]) // 2
    y = (values[1] + values[3]) // 2
    adb("shell", "input", "tap", str(x), str(y))


def start() -> None:
    adb("shell", "am", "force-stop", PACKAGE)
    adb("shell", "am", "start", "-n", PACKAGE + "/.MainActivity")


def main() -> None:
    if not APK.is_file():
        raise AssertionError(f"Missing APK: {APK}")
    adb("install", "-r", str(APK))
    adb("shell", "pm", "clear", PACKAGE)
    start()
    welcome = wait_for("Explore demo", "welcome")
    tap(welcome)
    wait_for("DEMO MODE", "dashboard")
    # Offline reopen must not contact the placeholder backend.
    adb("shell", "svc", "wifi", "disable", check=False)
    start()
    wait_for("DEMO MODE", "offline-reopen")
    assert adb("shell", "pidof", PACKAGE).stdout.strip(), "App crashed after offline reload"
    print("Android native WebView demo launch, interaction and offline reopen: PASS")


if __name__ == "__main__":
    try:
        main()
    finally:
        screen("final")
        try:
            (OUT / "logcat.txt").write_bytes(adb("logcat", "-d", "-v", "time").stdout[-2_000_000:])
        except Exception as error:
            print(f"logcat error: {error}", file=sys.stderr)
