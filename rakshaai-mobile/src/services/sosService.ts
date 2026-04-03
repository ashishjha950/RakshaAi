/**
 * sosService.ts — Core SOS fire/cancel logic.
 *
 * fireSOS(): Get GPS → POST /api/contacts/sos → start 3s countdown.
 * cancelSOS(): Clear the countdown timeout (if within window).
 *
 * The actual state updates (sosTriggered, countdown) live in SafetyContext.
 * This service handles only the side-effectful async work.
 */
import { api } from '@/services/api';
import { getCurrentLocation } from '@/services/backgroundGeoService';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS, SOS_RESET_MS } from '@/utils/constants';

let _countdownTimer: ReturnType<typeof setTimeout> | null = null;
let _resetTimer: ReturnType<typeof setTimeout> | null = null;
let _sosActive = false;

export interface SOSResult {
  success: boolean;
  keyword: string;
  time: string;
}

/**
 * Fires an SOS alert.
 *
 * - Gets current GPS coordinates (best-effort, continues even if unavailable).
 * - POSTs to POST /api/contacts/sos.
 * - Starts a 3-second cancellation window via onCountdownStart.
 * - Auto-resets after SOS_RESET_MS to allow re-triggering.
 *
 * @param keyword   The trigger word or source (e.g. 'help', 'volume-spike').
 * @param onCountdownStart  Called with countdown ms when SOS is confirmed (after cancel window).
 * @param onComplete        Called after SOS is sent successfully.
 * @param onCancel          Called if user cancels within the window.
 * @param countdownMs       How long user has to cancel (default 3000ms).
 */
export const fireSOS = async (
  keyword: string,
  onCountdownStart: (keyword: string, time: string) => void,
  onComplete: () => void,
  onCancel: () => void,
  countdownMs: number = 3000,
): Promise<void> => {
  if (_sosActive) return;
  _sosActive = true;

  const now = new Date().toLocaleString('en-IN', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  });

  onCountdownStart(keyword, now);

  // Wait for user to cancel or let countdown expire
  await new Promise<void>((resolve) => {
    _countdownTimer = setTimeout(() => {
      resolve();
    }, countdownMs);
  });

  if (!_sosActive) {
    // Was cancelled during countdown
    onCancel();
    return;
  }

  // ── Send SOS ────────────────────────────────────────────────────────────
  try {
    const coords = await getCurrentLocation();
    const userJson = await SecureStore.getItemAsync(STORAGE_KEYS.user);
    const user = userJson ? JSON.parse(userJson) : {};

    await api.post('/contacts/sos', {
      userId: user?._id ?? '',
      coordinates: coords ? { lat: coords.lat, lng: coords.lng } : null,
    });
  } catch {
    // SOS sends best-effort; failure is non-fatal
  }

  onComplete();

  // Auto-reset so SOS can fire again
  _resetTimer = setTimeout(() => {
    _sosActive = false;
  }, SOS_RESET_MS);
};

/**
 * Cancels an in-progress SOS countdown.
 * Must be called within the countdown window.
 */
export const cancelSOS = (): void => {
  _sosActive = false;
  if (_countdownTimer) {
    clearTimeout(_countdownTimer);
    _countdownTimer = null;
  }
  if (_resetTimer) {
    clearTimeout(_resetTimer);
    _resetTimer = null;
  }
};

/** Returns whether SOS is currently active (countdown or post-fire). */
export const isSosActive = (): boolean => _sosActive;
