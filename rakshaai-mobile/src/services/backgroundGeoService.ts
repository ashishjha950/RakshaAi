/**
 * backgroundGeoService.ts — Location tracking using expo-location + expo-task-manager.
 *
 * Replaces react-native-background-geolocation (paid) with the free Expo equivalent.
 * Exports startTracking(), stopTracking(), getCurrentLocation().
 * Implements 5-minute stop detection (delta < 20m over 5 min).
 *
 * ⚠️ PLATFORM NOTE (iOS): Requires UIBackgroundModes: ["location"] in app.json
 * and ACCESS_BACKGROUND_LOCATION permission.
 *
 * ⚠️ PLATFORM NOTE (Android): Requires ACCESS_BACKGROUND_LOCATION + FOREGROUND_SERVICE.
 */
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import {
  GEO_TASK_NAME,
  STOP_DETECTION_DISTANCE_M,
  STOP_DETECTION_TIME_MS,
} from '@/utils/constants';
import { haversineMetres } from '@/utils/haversine';

export interface GeoCoords {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

// Callbacks registered by SafetyContext
let _onLocation: ((coords: GeoCoords) => void) | null = null;
let _onStopDetected: (() => void) | null = null;

// Stop detection state
let _lastMovedCoords: GeoCoords | null = null;
let _lastMovedTime: number | null = null;
let _stopAlertFired = false;

// ─── Task Definition ─────────────────────────────────────────────────────────
// Must be defined at module top level (expo-task-manager requirement)
TaskManager.defineTask(GEO_TASK_NAME, async ({ data, error }: TaskManager.TaskManagerTaskBody) => {
  if (error) return;
  const locations = (data as { locations: Location.LocationObject[] }).locations;
  if (!locations?.length) return;

  const loc = locations[locations.length - 1];
  const coords: GeoCoords = {
    lat: loc.coords.latitude,
    lng: loc.coords.longitude,
    accuracy: loc.coords.accuracy ?? undefined,
    timestamp: loc.timestamp,
  };

  _onLocation?.(coords);
  _checkStopDetection(coords);
});

function _checkStopDetection(coords: GeoCoords): void {
  const now = Date.now();

  if (!_lastMovedCoords || !_lastMovedTime) {
    _lastMovedCoords = coords;
    _lastMovedTime = now;
    _stopAlertFired = false;
    return;
  }

  const distM = haversineMetres(
    _lastMovedCoords.lat,
    _lastMovedCoords.lng,
    coords.lat,
    coords.lng,
  );

  if (distM >= STOP_DETECTION_DISTANCE_M) {
    // User moved — reset
    _lastMovedCoords = coords;
    _lastMovedTime = now;
    _stopAlertFired = false;
  } else {
    // User hasn't moved enough — check elapsed time
    const elapsed = now - _lastMovedTime;
    if (elapsed >= STOP_DETECTION_TIME_MS && !_stopAlertFired) {
      _stopAlertFired = true;
      _onStopDetected?.();
    }
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Starts background location tracking.
 * @param onLocation Called with each new location update.
 * @param onStopDetected Called when user has been stationary for 5+ minutes.
 */
export const startTracking = async (
  onLocation: (coords: GeoCoords) => void,
  onStopDetected: () => void,
): Promise<void> => {
  _onLocation = onLocation;
  _onStopDetected = onStopDetected;
  _lastMovedCoords = null;
  _lastMovedTime = null;
  _stopAlertFired = false;

  const already = await Location.hasStartedLocationUpdatesAsync(GEO_TASK_NAME).catch(() => false);
  if (already) return;

  await Location.startLocationUpdatesAsync(GEO_TASK_NAME, {
    accuracy: Location.Accuracy.High,
    distanceInterval: 10,          // fire every 10m moved
    timeInterval: 15000,           // or every 15s
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'RakshaAI SafeJourney Active',
      notificationBody: 'Your journey is being monitored for your safety.',
      notificationColor: '#DC143C',
    },
  });
};

/**
 * Stops background location tracking and clears all callbacks.
 */
export const stopTracking = async (): Promise<void> => {
  _onLocation = null;
  _onStopDetected = null;

  const running = await Location.hasStartedLocationUpdatesAsync(GEO_TASK_NAME).catch(() => false);
  if (running) {
    await Location.stopLocationUpdatesAsync(GEO_TASK_NAME);
  }
};

/**
 * Returns the device's current GPS coordinates (one-shot).
 */
export const getCurrentLocation = async (): Promise<GeoCoords | null> => {
  try {
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return {
      lat: loc.coords.latitude,
      lng: loc.coords.longitude,
      accuracy: loc.coords.accuracy ?? undefined,
      timestamp: loc.timestamp,
    };
  } catch {
    return null;
  }
};
