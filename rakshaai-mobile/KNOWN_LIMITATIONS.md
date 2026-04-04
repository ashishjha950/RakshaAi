# RakshaAI Mobile — Known Limitations

> Version 1.0 | React Native Expo SDK 54

---

## iOS Limitations

### 1. Continuous Background Microphone (Voice SOS Watch)
- **Limitation**: iOS does not allow continuous background microphone usage without declaring `UIBackgroundModes: ["audio"]` in `Info.plist` and showing a persistent notification while listening.
- **Workaround**: `UIBackgroundModes: ["audio"]` is set in `app.json`. A foreground service notification ("RakshaAI is listening for your safety") is shown via `expo-notifications` while voice watch is active.
- **User Impact**: A persistent notification banner will always appear when Voice SOS Watch is enabled. This is legally required on iOS and cannot be hidden.

### 2. Background Voice Recognition
- **Limitation**: `@react-native-voice/voice` may be terminated by iOS when the app is fully backgrounded for extended periods. iOS speech recognition requires active audio sessions.
- **Workaround**: The `voiceWatchService` auto-restarts recognition after termination with a 400ms delay. This covers most backgrounding scenarios.
- **Status**: Partial — voice watch may drop for a few seconds during restart.

### 3. Camera in DisguiseMode (No Preview)
- **Limitation**: iOS requires the Camera permission dialog to explain why the camera is used. The NSCameraUsageDescription ("RakshaAI captures evidence discreetly in DisguiseMode") appears in Settings, which could reveal the disguise to an attacker inspecting the device.
- **Workaround**: The permission string is kept vague. The camera is not initialized until after PIN unlock.

---

## Android Limitations

### 4. OEM Camera Shutter Sound
- **Limitation**: Some Android OEMs (Samsung, Xiaomi on certain regions) enforce a mandatory shutter sound when capturing photos or video, regardless of device silent mode. This is enforced at the kernel/HAL level.
- **Workaround**: **None available**. Attempting to suppress the shutter sound may be illegal in South Korea and Japan. **Do not attempt suppression.**
- **Documented in**: `KNOWN_LIMITATIONS.md` (this file)

### 5. Background Location on Android 12+
- **Limitation**: Android 12+ requires a two-step permission grant — users must first grant foreground location, then separately grant background location in Settings. The permission dialog cannot grant both simultaneously.
- **Workaround**: `usePermissions` hook requests foreground first, then redirects to Settings for background. A clear explanation screen is shown before requesting.

### 6. FLAG_SECURE (Recent Apps Masking)
- **Limitation**: Hiding the app from the recent-apps switcher requires `FLAG_SECURE` set on the Activity window. In Expo managed workflow, this requires a custom native plugin or bare workflow ejection.
- **Status**: 🔄 Deferred — requires ejection from managed workflow. Add custom plugin in Phase 2 of mobile release.
- **TODO**: `android-flag-secure` Expo plugin or bare workflow ejection.

---

## Platform-Agnostic Limitations

### 7. Development Build Required
The following features **do not work in Expo Go** and require a development build (`eas build --profile development`):
- `@react-native-voice/voice` — native speech recognition
- `react-native-vision-camera` — native camera access
- `react-native-background-geolocation` (if added later)

### 8. Scream Detection Accuracy
- The `-10 dBFS` threshold in `screamDetectionService.ts` is a starting point. Quiet environments will require a lower (more negative) threshold; noisy environments a higher one.
- **Recommendation**: Tune `SCREAM_DB_THRESHOLD` in `src/utils/constants.ts` during QA on physical devices.

### 9. Offline SOS
- If the device has no internet when SOS fires, the POST to `/api/contacts/sos` will fail silently (non-fatal). The failure is caught and `emailSentRef` is reset to allow retry.
- **TODO BACKEND NEEDED**: An offline queue (AsyncStorage + retry-on-reconnect) would improve reliability.

---

## Deferred Features

| Feature | Reason | Phase |
|---|---|---|
| FLAG_SECURE in recent apps | Requires native plugin / ejection | Mobile V2 |
| Covert video recording (no preview) | react-native-vision-camera dev build needed | Mobile V2 |
| SSE streaming for Sahayak | Depends on backend SSE endpoint availability | Post-backend |
| Push notification deep-linking to map pin | FCM topic subscription set up; deep link handler pending | Mobile V2 |
