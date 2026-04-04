# RakshaAI Mobile

> Production-grade React Native Expo app converting the RakshaAI web safety platform to mobile.

---

## Quick Start

```bash
# 1. Clone and navigate
cd rakshaai-mobile

# 2. Install dependencies (already done if following plan.md)
npm install

# 3. Copy env file
cp .env.example .env
# Edit .env — set EXPO_PUBLIC_API_BASE_URL to your backend URL
# For local dev on physical device: use your machine's LAN IP
# e.g. EXPO_PUBLIC_API_BASE_URL=http://192.168.1.x:5000/api

# 4. Start Expo (Expo Go — limited features)
npx expo start

# 5. Start with dev client (full features including Voice, Camera)
npx expo start --dev-client
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:5000/api` |
| `EXPO_PUBLIC_ENV` | Environment name | `development` |

> ⚠️ For testing on a **physical device**, replace `localhost` with your computer's LAN IP address (e.g. `192.168.1.100`). The device and computer must be on the same Wi-Fi network.

---

## EAS Build Commands

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Development build (includes all native modules)
eas build --profile development --platform android
eas build --profile development --platform ios

# Preview build (for internal testing)
eas build --profile preview --platform android

# Production build
eas build --profile production --platform android
eas build --profile production --platform ios
```

> Note: Update `extra.eas.projectId` in `app.json` with your EAS project ID after running `eas build` for the first time.

---

## Architecture Overview

```
App.tsx                    # Root: GestureHandler + SafeArea + SafetyContext + Navigation
├── src/context/
│   └── SafetyContext.tsx  # 🔴 CORE: all safety state, mode, SOS, voice, geo
├── src/navigation/
│   ├── RootNavigator.tsx  # Conditional: Guardian → DisguiseModeScreen | Normal → Drawer
│   ├── DrawerNavigator.tsx
│   └── BottomTabNavigator.tsx
├── src/screens/           # 7 full screens (see below)
├── src/components/        # GlobalSOSBanner, SOSCountdownModal, FakeCallOverlay, MapHeatmapLayer
├── src/services/          # api.ts, voiceWatchService, screamDetection, backgroundGeo, sosService
├── src/hooks/             # usePermissions, useSafetyContext, useBackgroundTasks
├── src/theme/colors.ts    # Design tokens
└── src/utils/             # constants.ts, haversine.ts
```

### Screens

| Screen | Route | Description |
|---|---|---|
| `HomeScreen` | `/` (Drawer) | Dashboard: mode toggle, quick access, SOS watch |
| `SafeJourneyScreen` | `SafeJourney` (Tab) | OSM map, live tracking, route polyline, heatmap |
| `DisguiseModeScreen` | Guardian mode root | Functional calculator + secret unlock via long-press `=` |
| `EvidenceScreen` | `Evidence` (Drawer) | Biometric vault, upload to backend, grid view |
| `CommunityScreen` | `Community` (Tab) | Volunteer map + list, Haversine sorted, FCM alerts |
| `InnerCircleScreen` | `InnerCircle` (Tab) | Trusted contacts, swipe-to-delete, trust levels |
| `SahayakScreen` | `Sahayak` (Tab) | AI chat, quick replies, persistent history |

---

## Safety Modes

| Mode | Behaviour |
|---|---|
| **Normal** | Standard UI + background geo + scream detection |
| **Sahayak** | AI-assistant themed UI + amber accents + all services |
| **Guardian** | Full stealth — app appears as calculator. Long-press `=` (3s) + PIN to reveal |

---

## Backend API Routes (unchanged from web)

| Method | Route | Usage |
|---|---|---|
| `POST` | `/api/contacts/sos` | Fire SOS alert with GPS + user ID |
| `POST` | `/api/evidence/upload` | Upload evidence file (multipart) |
| `GET` | `/api/community/nearby` | Fetch nearby volunteers (`?lat=&lng=&radius=`) |
| `POST` | `/api/sahayak/chat` | Sahayak AI chat (message + history) |
| `POST` | `/api/contacts/sos-test` | Send test SOS to individual contact |

---

## Permissions Required

### iOS
- Microphone — Voice SOS watch
- Camera — Evidence capture in DisguiseMode
- Location (Always) — SafeJourney background tracking
- Face ID — Evidence vault biometric gate
- Notifications — FCM SOS alerts

### Android
- `RECORD_AUDIO`, `CAMERA`, `ACCESS_FINE_LOCATION`
- `ACCESS_BACKGROUND_LOCATION`, `FOREGROUND_SERVICE`
- `RECEIVE_BOOT_COMPLETED`, `VIBRATE`
- `USE_BIOMETRIC`, `USE_FINGERPRINT`

---

## Known Limitations

See [`KNOWN_LIMITATIONS.md`](./KNOWN_LIMITATIONS.md) for full details on:
- iOS background microphone requirements
- Android OEM shutter sounds (cannot suppress — may be illegal)
- FLAG_SECURE (recent apps masking) — deferred to V2
- Dev build requirements for native modules

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Expo SDK | 54 | Managed workflow base |
| React Native | 0.76+ | Native app framework |
| TypeScript | Strict | Type safety |
| NativeWind | v4 | Tailwind utility classes for RN |
| React Navigation | v6 | Stack + Drawer + Bottom Tabs |
| react-native-maps | latest | OSM + heatmap (no API key) |
| expo-av | SDK 54 | Audio recording + scream detection |
| expo-location | SDK 54 | Background GPS tracking |
| expo-task-manager | SDK 54 | Background tasks |
| @react-native-voice/voice | latest | SOS keyword detection |
| react-native-reanimated | v3 | Animations |
| expo-local-authentication | SDK 54 | Biometric vault gate |
| expo-secure-store | SDK 54 | Encrypted sensitive data |
| AsyncStorage | latest | Non-sensitive persistent data |
| Axios | latest | HTTP client with JWT interceptor |
