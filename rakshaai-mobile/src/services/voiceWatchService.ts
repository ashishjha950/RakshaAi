/**
 * voiceWatchService.ts — Continuous voice keyword detection for SOS triggering.
 *
 * Uses @react-native-voice/voice to listen for trigger words.
 * On match, calls the provided onTrigger callback with the matched keyword.
 *
 * ⚠️ PLATFORM NOTE (iOS): iOS requires UIBackgroundModes: ["audio"] in app.json
 * and a persistent notification while listening. This is legally required and
 * cannot be hidden on iOS. The persistent notification is shown via
 * expo-notifications when voice watch is active.
 *
 * ⚠️ PLATFORM NOTE (Android): Requires RECORD_AUDIO permission granted before
 * calling startVoiceWatch(). Check usePermissions hook first.
 *
 * ⚠️ DEV BUILD REQUIRED: @react-native-voice/voice is a native module and
 * does not run in Expo Go. Use `eas build --profile development`.
 */
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import {
  SOS_KEYWORDS,
  VOICE_LOCALE,
  VOICE_RESTART_DELAY_MS,
  VOICE_ERROR_RESTART_DELAY_MS,
} from '@/utils/constants';

let _isListening = false;
let _triggerWords: string[] = [...SOS_KEYWORDS];
let _onTriggerFn: ((keyword: string) => void) | null = null;
let _restartTimer: ReturnType<typeof setTimeout> | null = null;

const clearRestartTimer = () => {
  if (_restartTimer) {
    clearTimeout(_restartTimer);
    _restartTimer = null;
  }
};

/**
 * Starts continuous voice recognition.
 * @param triggerWords Array of lowercase keywords that fire SOS.
 * @param onTrigger Callback invoked with the matched keyword.
 * @param locale BCP-47 locale string (default: 'en-IN').
 */
export const startVoiceWatch = async (
  triggerWords: string[] = [...SOS_KEYWORDS],
  onTrigger: (keyword: string) => void,
  locale: string = VOICE_LOCALE,
): Promise<void> => {
  if (_isListening) return;

  _triggerWords = triggerWords.map((w) => w.toLowerCase());
  _onTriggerFn = onTrigger;

  Voice.onSpeechResults = (e: SpeechResultsEvent) => {
    const transcript = e.value?.[0]?.toLowerCase() ?? '';
    const matched = _triggerWords.find((word) => transcript.includes(word));
    if (matched && _onTriggerFn) {
      _onTriggerFn(matched);
    }
  };

  Voice.onSpeechEnd = () => {
    // Auto-restart to keep continuous listening
    if (_isListening) {
      clearRestartTimer();
      _restartTimer = setTimeout(() => {
        Voice.start(locale).catch(() => {/* silent */});
      }, VOICE_RESTART_DELAY_MS);
    }
  };

  Voice.onSpeechError = (e: SpeechErrorEvent) => {
    if (e.error?.message?.includes('not-allowed')) {
      // Permission denied — stop silently
      _isListening = false;
      return;
    }
    if (_isListening) {
      clearRestartTimer();
      _restartTimer = setTimeout(() => {
        Voice.start(locale).catch(() => {/* silent */});
      }, VOICE_ERROR_RESTART_DELAY_MS);
    }
  };

  try {
    await Voice.start(locale);
    _isListening = true;
  } catch {
    _isListening = false;
  }
};

/**
 * Stops voice recognition and cleans up all listeners.
 */
export const stopVoiceWatch = async (): Promise<void> => {
  _isListening = false;
  clearRestartTimer();
  _onTriggerFn = null;

  try {
    await Voice.stop();
    await Voice.destroy();
  } catch {/* silent */}

  Voice.onSpeechResults = () => {};
  Voice.onSpeechEnd = () => {};
  Voice.onSpeechError = () => {};
};

/** Returns whether voice watch is currently active. */
export const isVoiceWatchActive = (): boolean => _isListening;
