// ─── RakshaAI Mobile — All Constants ─────────────────────────────────────────
// No magic numbers in screen or service files — all sourced from here.

// ── SOS ──────────────────────────────────────────────────────────────────────
/** How long (ms) the user has to cancel an SOS after triggering it. */
export const SOS_COUNTDOWN_MS = 3000;

/** Milliseconds after SOS fires before the state resets (allows re-trigger). */
export const SOS_RESET_MS = 12000;

/** Keywords that trigger SOS voice detection. Matches web SafetyContext. */
export const SOS_KEYWORDS = [
  'sos', 'help', 'danger', 'bachao', 'save me', 'attack',
  'emergency', 'rape', 'harassment', 'chodo', 'maroge',
] as const;

// ── Scream / Volume Detection ─────────────────────────────────────────────────
/** dBFS threshold above which audio is classified as a scream/spike. */
export const SCREAM_DB_THRESHOLD = -10;

/** How often (ms) the audio metering polls for volume spikes. */
export const SCREAM_POLL_MS = 500;

// ── Background Geolocation ───────────────────────────────────────────────────
/** Distance in metres below which movement is considered "stopped". */
export const STOP_DETECTION_DISTANCE_M = 20;

/** Time in milliseconds user must be stationary before stop alert fires. */
export const STOP_DETECTION_TIME_MS = 5 * 60 * 1000; // 5 minutes

/** Background location task name for expo-task-manager. */
export const GEO_TASK_NAME = 'raksha-background-geo';

// ── Voice Watch ──────────────────────────────────────────────────────────────
/** Default speech recognition locale. */
export const VOICE_LOCALE = 'en-IN';

/** Delay (ms) before restarting voice recognition after it ends (auto-restart). */
export const VOICE_RESTART_DELAY_MS = 400;

/** Delay (ms) before restarting after a non-fatal speech error. */
export const VOICE_ERROR_RESTART_DELAY_MS = 1200;

// ── Storage Keys ─────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  authToken:    'auth_token',        // expo-secure-store (sensitive)
  user:         'raksha_user',       // expo-secure-store (sensitive)
  safetyMode:   'raksha_mode',       // expo-secure-store
  sosWatch:     'raksha_sos_watch',  // expo-secure-store
  pin:          'raksha_pin_hash',   // expo-secure-store (hashed)
  evidencePrefix: 'evidence:',       // AsyncStorage prefix
  chatHistory:  'sahayak_history',   // AsyncStorage
} as const;

// ── Map ──────────────────────────────────────────────────────────────────────
/** CartoDB Voyager tile URL template (looks like OSM, no User-Agent block). */
export const OSM_TILE_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';

/** Carto tile subdomains for load balancing. */
export const OSM_SUBDOMAINS = ['a', 'b', 'c', 'd'];

/** Default map region (India – centred on New Delhi). */
export const DEFAULT_MAP_REGION = {
  latitude:       28.6139,
  longitude:      77.2090,
  latitudeDelta:  0.05,
  longitudeDelta: 0.05,
};

// ── Community ────────────────────────────────────────────────────────────────
/** Default search radius in km for nearby helpers. */
export const DEFAULT_COMMUNITY_RADIUS_KM = 5;

// ── Disguise Mode ────────────────────────────────────────────────────────────
/** How long (ms) user must long-press '=' to trigger secret unlock. */
export const DISGUISE_UNLOCK_PRESS_MS = 3000;

/** PIN length for Evidence vault and Disguise unlock. */
export const PIN_LENGTH = 4;
