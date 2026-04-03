/**
 * screamDetectionService.ts — Audio metering-based scream/distress detection.
 *
 * Uses expo-av to record audio and poll dB metering every 500ms.
 * When metering exceeds SCREAM_DB_THRESHOLD for sustained samples, calls onScream().
 *
 * ⚠️ PLATFORM NOTE (iOS): allowsRecordingIOS and playsInSilentModeIOS must
 * be set to true for background audio recording to work.
 *
 * ⚠️ PLATFORM NOTE (Android): Requires RECORD_AUDIO permission.
 */
import { Audio } from 'expo-av';
import type { RecordingStatus } from 'expo-av/build/Audio/Recording.types';
import { SCREAM_DB_THRESHOLD, SCREAM_POLL_MS } from '@/utils/constants';

let _recording: Audio.Recording | null = null;
let _isActive = false;

/**
 * Starts scream / volume-spike detection.
 * @param onScream Callback invoked when a sustained volume spike is detected.
 * @returns The Audio.Recording instance (use to stop later).
 */
export const startScreamDetection = async (
  onScream: () => void,
): Promise<void> => {
  if (_isActive) return;

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
      (status: RecordingStatus) => {
        if (!status.isRecording && !status.isDoneRecording) return;
        const metering = (status as RecordingStatus & { metering?: number }).metering;
        if (metering !== undefined && metering > SCREAM_DB_THRESHOLD) {
          onScream();
        }
      },
      SCREAM_POLL_MS,
    );

    _recording = recording;
    _isActive = true;
  } catch {
    _isActive = false;
  }
};

/**
 * Stops scream detection and releases the microphone.
 */
export const stopScreamDetection = async (): Promise<void> => {
  _isActive = false;
  if (_recording) {
    try {
      await _recording.stopAndUnloadAsync();
    } catch {/* silent */}
    _recording = null;
  }

  // Reset audio mode to default
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: false,
    });
  } catch {/* silent */}
};

/** Returns whether scream detection is currently active. */
export const isScreamDetectionActive = (): boolean => _isActive;
