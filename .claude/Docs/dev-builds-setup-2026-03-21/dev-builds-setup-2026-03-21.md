---
title: Expo Development Builds — Setup Guide
project: GymCom
generated: 2026-03-21
type: documentation
tags: [expo, dev-build, android, ios, eas, deployment, setup]
---

# Expo Development Builds — Setup Guide

## What Are Dev Builds?

- **Expo Go** is a pre-built universal app with a fixed set of native modules — fast for prototyping but limited (e.g. `expo-notifications` removed since SDK 53)
- **Development Build** is a custom-compiled app that includes your project's specific native dependencies
- You compile it once, then develop against it identically to Expo Go (QR code, hot reload)
- Only rebuild when you add or remove a **native dependency** — pure JS changes hot-reload instantly

## Prerequisites

- Node.js installed
- Expo account (free at expo.dev)
- EAS CLI: `npm install -g eas-cli`
- Logged in: `eas login`
- For iOS physical devices: Apple Developer account ($99/year)
- For Android: no paid account needed

## Project Configuration

### `eas.json` — Build Profiles

- `development` profile: includes `"developmentClient": true` to enable the dev client
- `"buildType": "apk"` for Android produces a directly installable APK
- `"NPM_CONFIG_LEGACY_PEER_DEPS": "true"` in env to handle peer dep conflicts (required for GymCom's `react@19.1.0`)

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "env": { "NPM_CONFIG_LEGACY_PEER_DEPS": "true" }
    }
  }
}
```

### `app.json` — Native Plugins

- Any native module needs its plugin registered in `app.json` under `"plugins"`
- Example: `expo-notifications` requires a plugin entry with sound assets specified
- Android resource names must use underscores only (no hyphens): `timer_done.mp3` not `timer-done.mp3`

## Building for Android

### Steps

1. Run: `eas build --platform android --profile development`
2. EAS uploads your project and builds in the cloud (5-15 minutes)
3. On completion, you get a download link for the APK
4. Transfer APK to your Android device and install
5. Enable "Install from unknown sources" in Android settings if prompted

### Running After Install

1. Start dev server: `npx expo start`
2. Open the dev build app on your phone
3. Scan the QR code — same workflow as Expo Go

## Building for iOS

### Simulator

- `eas build --platform ios --profile development` produces a `.app` for simulator
- Drag and drop onto simulator to install

### Physical Device

- Requires Apple Developer account ($99/year)
- EAS handles provisioning profiles automatically
- Register devices with `eas device:create`
- Build with: `eas build --platform ios --profile development`
- Install via QR code link from EAS

## Building for Both Platforms

```bash
eas build --platform ios --profile development
eas build --platform android --profile development
```

- Each produces a separate installable artifact
- Both connect to the same `npx expo start` dev server
- Hot reload works on both simultaneously

## When to Rebuild

- **Rebuild required**: Adding/removing native dependencies (e.g. `expo-notifications`, `expo-camera`)
- **No rebuild needed**: JavaScript/TypeScript changes, styling, component updates, new screens
- Rule of thumb: if `npx expo install` installs something with native code, rebuild

## Production Builds and Store Submission

```bash
# Production builds
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

- EAS handles code signing (iOS) and keystores (Android)
- `app.json` must have `ios.bundleIdentifier` and `android.package` configured

## Common Issues

### Android Resource Name Errors

- Android resource names only allow lowercase letters, numbers, and underscores
- Rename files like `timer-done.mp3` to `timer_done.mp3`
- Update all code references to match

### Notification Channels (Android 8+)

- Notification sounds are tied to channels, not individual notifications
- Create channels with `Notifications.setNotificationChannelAsync()` specifying the sound
- Channels are cached by the OS — uninstall and reinstall if changing channel config

### Expo Go Incompatibility

- Some native modules don't work in Expo Go (SDK 53+: notifications, etc.)
- Use `try { require('expo-notifications') } catch {}` to gracefully degrade
- App works in Expo Go without notifications; full functionality in dev build

## Key Takeaways

- Dev builds = custom Expo Go with your native deps compiled in
- One-time setup: install EAS CLI, configure `eas.json`, build once per platform
- Day-to-day workflow is identical to Expo Go (QR code + hot reload)
- Only rebuild when native dependencies change
- Android is simpler (no paid account, direct APK install); iOS needs Apple Developer account for physical devices
- Always use `--legacy-peer-deps` for GymCom installs
- Android resource names: underscores only, no hyphens
