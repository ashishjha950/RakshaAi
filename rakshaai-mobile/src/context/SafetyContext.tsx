/**
 * SafetyContext.tsx — Primary global state for all RakshaAI safety features.
 *
 * Port of client/src/context/SafetyContext.jsx with full mobile replacements:
 *
 * | Web API                        | Mobile Replacement                    |
 * |--------------------------------|---------------------------------------|
 * | window.SpeechRecognition       | @react-native-voice/voice             |
 * | AudioContext + AnalyserNode    | expo-av Audio with metering           |
 * | navigator.geolocation          | expo-location (backgroundGeoService)  |
 * | window.speechSynthesis         | expo-speech                           |
 * | localStorage                   | expo-secure-store                     |
 * | fetch /api/contacts/sos        | services/api.ts (same route)          |
 *
 * Guardian Mode behaviour (matches web):
 *   - isGuardianMode true → RootNavigator renders ONLY DisguiseModeScreen
 *   - No RakshaAI branding visible; appears as a calculator app
 *   - Secret unlock: long-press '=' for 3s → PIN → real app
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Speech from 'expo-speech';
import { Alert } from 'react-native';

import {
  startVoiceWatch,
  stopVoiceWatch,
} from '@/services/voiceWatchService';
import {
  startScreamDetection,
  stopScreamDetection,
} from '@/services/screamDetectionService';
import {
  startTracking,
  stopTracking,
  type GeoCoords,
} from '@/services/backgroundGeoService';
import { fireSOS as fireSosService, cancelSOS as cancelSosService } from '@/services/sosService';
import {
  SOS_KEYWORDS,
  STORAGE_KEYS,
  SOS_COUNTDOWN_MS,
} from '@/utils/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SafetyMode = 'normal' | 'guardian' | 'sahayak';

export interface SOSTriggeredState {
  keyword: string;
  time: string;
}

export interface SafetyContextValue {
  // Mode
  safetyMode: SafetyMode;
  setSafetyMode: (mode: SafetyMode) => Promise<void>;
  isGuardianMode: boolean;

  // SOS Watch (global background listener)
  globalSosWatch: boolean;
  setGlobalSosWatch: (val: boolean) => Promise<void>;

  // SOS State
  sosTriggered: SOSTriggeredState | null;
  detectedKeyword: string;
  sosCountdownActive: boolean;
  fireSOS: (keyword?: string) => void;
  cancelSOS: () => void;

  // Current GPS
  currentLocation: GeoCoords | null;

  // Fake Call
  fakeCallActive: boolean;
  fakeCallContact: string;
  startFakeCall: (contactName?: string) => void;
  endFakeCall: () => void;

  // Journey tracking
  isJourneyActive: boolean;
  startJourney: () => Promise<void>;
  stopJourney: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const SafetyContext = createContext<SafetyContextValue | null>(null);

export const useSafety = (): SafetyContextValue => {
  const ctx = useContext(SafetyContext);
  if (!ctx) throw new Error('useSafety must be used inside SafetyProvider');
  return ctx;
};

// ─── Provider ────────────────────────────────────────────────────────────────

export const SafetyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // ── Mode ─────────────────────────────────────────────────────────────────
  const [safetyMode, setSafetyModeState] = useState<SafetyMode>('normal');

  const setSafetyMode = useCallback(async (mode: SafetyMode) => {
    setSafetyModeState(mode);
    await SecureStore.setItemAsync(STORAGE_KEYS.safetyMode, mode);
  }, []);

  const isGuardianMode = safetyMode === 'guardian';

  // ── Global SOS Watch ─────────────────────────────────────────────────────
  const [globalSosWatch, setGlobalSosWatchState] = useState(false);

  const setGlobalSosWatch = useCallback(async (val: boolean) => {
    setGlobalSosWatchState(val);
    await SecureStore.setItemAsync(STORAGE_KEYS.sosWatch, String(val));
  }, []);

  // ── SOS State ────────────────────────────────────────────────────────────
  const [sosTriggered, setSosTriggered] = useState<SOSTriggeredState | null>(null);
  const [detectedKeyword, setDetectedKeyword] = useState('');
  const [sosCountdownActive, setSosCountdownActive] = useState(false);
  const sosActiveRef = useRef(false);

  // ── Current Location ─────────────────────────────────────────────────────
  const [currentLocation, setCurrentLocation] = useState<GeoCoords | null>(null);

  // ── Journey ──────────────────────────────────────────────────────────────
  const [isJourneyActive, setIsJourneyActive] = useState(false);

  // ── Fake Call ────────────────────────────────────────────────────────────
  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [fakeCallContact, setFakeCallContact] = useState('Mom 💛');

  // ─── Load persisted settings on mount ────────────────────────────────────
  useEffect(() => {
    const loadSettings = async () => {
      const [mode, watch] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.safetyMode),
        SecureStore.getItemAsync(STORAGE_KEYS.sosWatch),
      ]);
      if (mode) setSafetyModeState(mode as SafetyMode);
      if (watch === 'true') setGlobalSosWatchState(true);
    };
    loadSettings();
  }, []);

  // ─── fireSOS ─────────────────────────────────────────────────────────────
  const fireSOS = useCallback((keyword = 'sos') => {
    if (sosActiveRef.current) return;
    sosActiveRef.current = true;
    setSosCountdownActive(true);
    setDetectedKeyword(keyword);

    fireSosService(
      keyword,
      (kw, time) => {
        setSosTriggered({ keyword: kw, time });
      },
      () => {
        setSosCountdownActive(false);
        // Auto-clear triggered state after reset window
        setTimeout(() => {
          setSosTriggered(null);
          setDetectedKeyword('');
          sosActiveRef.current = false;
        }, 12000);
      },
      () => {
        // Cancelled
        setSosCountdownActive(false);
        setSosTriggered(null);
        setDetectedKeyword('');
        sosActiveRef.current = false;
      },
      SOS_COUNTDOWN_MS,
    );
  }, []);

  // ─── cancelSOS ───────────────────────────────────────────────────────────
  const cancelSOS = useCallback(() => {
    cancelSosService();
    sosActiveRef.current = false;
    setSosCountdownActive(false);
    setSosTriggered(null);
    setDetectedKeyword('');
  }, []);

  // ─── Voice watch ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (globalSosWatch) {
      startVoiceWatch([...SOS_KEYWORDS], (kw) => fireSOS(kw));
    } else {
      stopVoiceWatch();
    }
    return () => { stopVoiceWatch(); };
  }, [globalSosWatch, fireSOS]);

  // ─── Scream detection ─────────────────────────────────────────────────────
  useEffect(() => {
    if (globalSosWatch) {
      startScreamDetection(() => fireSOS('volume-spike'));
    } else {
      stopScreamDetection();
    }
    return () => { stopScreamDetection(); };
  }, [globalSosWatch, fireSOS]);

  // ─── Journey tracking ─────────────────────────────────────────────────────
  const startJourney = useCallback(async () => {
    setIsJourneyActive(true);
    await startTracking(
      (coords) => setCurrentLocation(coords),
      () => {
        Alert.alert(
          '⚠️ Are you okay?',
          'You haven\'t moved in 5 minutes. Do you need help?',
          [
            { text: "I'm fine", style: 'cancel' },
            { text: 'Send SOS', style: 'destructive', onPress: () => fireSOS('stop-detected') },
          ],
        );
      },
    );
  }, [fireSOS]);

  const stopJourney = useCallback(async () => {
    setIsJourneyActive(false);
    await stopTracking();
  }, []);

  // ─── Fake Call ────────────────────────────────────────────────────────────
  const startFakeCall = useCallback((contactName = 'Mom 💛') => {
    setFakeCallContact(contactName);
    setFakeCallActive(true);
  }, []);

  const endFakeCall = useCallback(() => {
    Speech.stop();
    setFakeCallActive(false);
  }, []);

  // ─── Context Value ────────────────────────────────────────────────────────
  const value: SafetyContextValue = {
    safetyMode,
    setSafetyMode,
    isGuardianMode,
    globalSosWatch,
    setGlobalSosWatch,
    sosTriggered,
    detectedKeyword,
    sosCountdownActive,
    fireSOS,
    cancelSOS,
    currentLocation,
    fakeCallActive,
    fakeCallContact,
    startFakeCall,
    endFakeCall,
    isJourneyActive,
    startJourney,
    stopJourney,
  };

  return (
    <SafetyContext.Provider value={value}>
      {children}
    </SafetyContext.Provider>
  );
};
