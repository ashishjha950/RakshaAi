/**
 * usePermissions.ts — Central permissions management hook.
 *
 * Checks and requests: microphone, camera, location (always), notifications.
 * Returns { allGranted, missingPermissions, requestAll }.
 * Must be called before accessing any hardware service.
 */
import { useState, useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';

export interface PermissionState {
  microphone: boolean;
  camera: boolean;
  locationAlways: boolean;
  notifications: boolean;
}

export interface UsePermissionsReturn {
  permissions: PermissionState;
  allGranted: boolean;
  missingPermissions: (keyof PermissionState)[];
  requestAll: () => Promise<PermissionState>;
  openSettings: () => void;
}

const DEFAULT_PERMISSIONS: PermissionState = {
  microphone: false,
  camera: false,
  locationAlways: false,
  notifications: false,
};

/**
 * usePermissions — hook to check and request all app permissions.
 */
export const usePermissions = (): UsePermissionsReturn => {
  const [permissions, setPermissions] = useState<PermissionState>(DEFAULT_PERMISSIONS);

  const requestAll = useCallback(async (): Promise<PermissionState> => {
    // Microphone
    const { status: micStatus } = await Audio.requestPermissionsAsync();

    // Camera
    const { status: camStatus } = await Camera.requestCameraPermissionsAsync();

    // Location — first foreground, then background
    const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
    let bgGranted = false;
    if (fgStatus === 'granted') {
      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      bgGranted = bgStatus === 'granted';
    }

    // Notifications
    const { status: notifStatus } = await Notifications.requestPermissionsAsync();

    const result: PermissionState = {
      microphone:      micStatus === 'granted',
      camera:          camStatus === 'granted',
      locationAlways:  bgGranted,
      notifications:   notifStatus === 'granted',
    };

    setPermissions(result);
    return result;
  }, []);

  const openSettings = useCallback(() => {
    Alert.alert(
      'Permission Required',
      'Please open Settings and grant the required permissions for RakshaAI to keep you safe.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ],
    );
  }, []);

  const missingPermissions = (
    Object.keys(permissions) as (keyof PermissionState)[]
  ).filter((key) => !permissions[key]);

  return {
    permissions,
    allGranted: missingPermissions.length === 0,
    missingPermissions,
    requestAll,
    openSettings,
  };
};
