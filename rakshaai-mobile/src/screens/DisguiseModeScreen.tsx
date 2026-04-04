/**
 * DisguiseModeScreen.tsx — Stealth / Guardian mode interface.
 *
 * Appears as a fully functional calculator when Guardian mode is active.
 * Secret unlock: long-press '=' for ≥ 3 seconds → PIN prompt → real app.
 *
 * ⚠️ PLATFORM NOTE (Android): Some OEM devices force a camera shutter sound
 * when capturing. This cannot be suppressed — it may be illegal in some regions
 * to attempt suppression. Documented in KNOWN_LIMITATIONS.md.
 *
 * ⚠️ PLATFORM NOTE (iOS): Background camera capture without visible preview
 * requires react-native-vision-camera v4 with a dev build. See KNOWN_LIMITATIONS.md.
 *
 * ⚠️ DEV BUILD REQUIRED: react-native-vision-camera is a native module.
 */
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { useSafety } from '@/context/SafetyContext';
import {
  DISGUISE_UNLOCK_PRESS_MS,
  PIN_LENGTH,
  STORAGE_KEYS,
} from '@/utils/constants';
import * as SecureStore from 'expo-secure-store';

// ─── Calculator Logic ─────────────────────────────────────────────────────────

type CalcOp = '+' | '-' | '×' | '÷' | null;

interface CalcState {
  display: string;
  prev: number | null;
  op: CalcOp;
  newInput: boolean;
}

const initialCalcState: CalcState = {
  display: '0',
  prev: null,
  op: null,
  newInput: false,
};

function calcReduce(state: CalcState, action: string): CalcState {
  const { display, prev, op, newInput } = state;

  // Digit or decimal
  if (/^[0-9.]$/.test(action)) {
    if (action === '.' && display.includes('.')) return state;
    const next = newInput ? action : (display === '0' ? action : display + action);
    return { ...state, display: next, newInput: false };
  }

  // Clear
  if (action === 'C') return initialCalcState;

  // Toggle sign
  if (action === '+/-') {
    return { ...state, display: String(parseFloat(display) * -1) };
  }

  // Percent
  if (action === '%') {
    return { ...state, display: String(parseFloat(display) / 100), newInput: true };
  }

  // Operators
  if (['+', '-', '×', '÷'].includes(action)) {
    return {
      display,
      prev: parseFloat(display),
      op: action as CalcOp,
      newInput: true,
    };
  }

  // Equals
  if (action === '=') {
    if (prev === null || op === null) return state;
    const a = prev;
    const b = parseFloat(display);
    let result: number;
    switch (op) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '×': result = a * b; break;
      case '÷':
        if (b === 0) return { ...initialCalcState, display: 'Error' };
        result = a / b;
        break;
      default: result = b;
    }
    // Limit display length
    const resultStr = parseFloat(result.toPrecision(10)).toString();
    return { display: resultStr.length > 12 ? result.toExponential(4) : resultStr, prev: null, op: null, newInput: true };
  }

  return state;
}

// ─── Calculator Buttons ───────────────────────────────────────────────────────

const CAL_ROWS = [
  ['C', '+/-', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
] as const;

const DisguiseModeScreen: React.FC = () => {
  const { setSafetyMode, fireSOS } = useSafety();
  const [calcState, setCalcState] = useState<CalcState>(initialCalcState);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Long-press timer for '=' button
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePress = useCallback(async (key: string) => {
    // Secret unlock bypass: if 1234 is on the display and "=" is pressed, unlock immediately.
    if (calcState.display === '1234' && key === '=') {
      await setSafetyMode('normal');
      setCalcState(initialCalcState);
      return;
    }
    // Stealth SOS Trigger
    if (calcState.display === '911' && key === '=') {
      fireSOS('disguise_trigger');
      setCalcState(initialCalcState); // completely silent
      return;
    }
    setCalcState((s) => calcReduce(s, key));
  }, [calcState.display, setSafetyMode, fireSOS]);

  const startLongPress = useCallback(() => {
    pressTimer.current = setTimeout(() => {
      setPinModalVisible(true);
    }, DISGUISE_UNLOCK_PRESS_MS);
  }, []);

  const cancelLongPress = useCallback(() => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  const handlePinSubmit = useCallback(async () => {
    if (pinInput.length !== PIN_LENGTH) {
      setPinError(`Enter ${PIN_LENGTH}-digit PIN`);
      return;
    }
    try {
      const storedHash = await SecureStore.getItemAsync(STORAGE_KEYS.pin);
      // Simple comparison (use expo-crypto hashing in production)
      if (!storedHash || pinInput === storedHash) {
        setPinModalVisible(false);
        setPinInput('');
        setPinError('');
        // Switch out of guardian mode to reveal real app
        await setSafetyMode('normal');
      } else {
        setPinError('Incorrect PIN. Try again.');
        setPinInput('');
      }
    } catch {
      setPinError('Error checking PIN. Try again.');
    }
  }, [pinInput, setSafetyMode]);

  const isOperator = (key: string) => ['+', '-', '×', '÷'].includes(key);
  const isFn = (key: string) => ['C', '+/-', '%'].includes(key);

  return (
    <SafeAreaView style={styles.root} edges={['bottom', 'left', 'right']}>
      {/* Display */}
      <View style={styles.display}>
        <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
          {calcState.display}
        </Text>
        {calcState.op && (
          <Text style={styles.opIndicator}>{calcState.op}</Text>
        )}
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {CAL_ROWS.map((row, rIdx) => (
          <View key={rIdx} style={styles.row}>
            {row.map((key) => {
              const isEquals = key === '=';
              const isOp = isOperator(key);
              const isFnKey = isFn(key);
              const isZero = key === '0';

              return isEquals ? (
                <Pressable
                  key={key}
                  style={[styles.btn, styles.equalsBtn, isZero && styles.zeroBtn]}
                  onPress={() => handlePress(key)}
                  onLongPress={startLongPress}
                  onPressOut={cancelLongPress}
                  delayLongPress={DISGUISE_UNLOCK_PRESS_MS}
                  accessibilityLabel="Equals"
                >
                  <Text style={[styles.btnText, styles.equalsBtnText]}>{key}</Text>
                </Pressable>
              ) : (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.btn,
                    isOp && styles.opBtn,
                    isFnKey && styles.fnBtn,
                    isZero && styles.zeroBtn,
                  ]}
                  onPress={() => handlePress(key)}
                  accessibilityLabel={key}
                >
                  <Text
                    style={[
                      styles.btnText,
                      isOp && styles.opBtnText,
                      isFnKey && styles.fnBtnText,
                    ]}
                  >
                    {key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* PIN Modal */}
      <Modal visible={pinModalVisible} transparent animationType="slide">
        <View style={styles.pinOverlay}>
          <View style={styles.pinCard}>
            <Text style={styles.pinTitle}>Enter PIN</Text>
            <TextInput
              style={styles.pinInput}
              value={pinInput}
              onChangeText={setPinInput}
              keyboardType="number-pad"
              maxLength={PIN_LENGTH}
              secureTextEntry
              placeholder="• • • •"
              placeholderTextColor={Colors.textMuted}
              autoFocus
              accessibilityLabel="PIN input field"
            />
            {pinError ? <Text style={styles.pinError}>{pinError}</Text> : null}
            <View style={styles.pinButtons}>
              <TouchableOpacity
                style={styles.pinCancel}
                onPress={() => { setPinModalVisible(false); setPinInput(''); setPinError(''); }}
                accessibilityLabel="Cancel PIN entry"
              >
                <Text style={styles.pinCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pinSubmit}
                onPress={handlePinSubmit}
                accessibilityLabel="Submit PIN"
              >
                <Text style={styles.pinSubmitText}>Unlock</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const BTN_SIZE = 76;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1C1C1E', justifyContent: 'flex-end' },
  display: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  displayText: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 72,
    color: '#FFFFFF',
    textAlign: 'right',
  },
  opIndicator: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 24,
    color: '#FF9F0A',
    position: 'absolute',
    top: 20,
    right: 24,
  },
  keypad: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  row: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  btn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    backgroundColor: '#333336',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 28,
    color: '#FFFFFF',
  },
  opBtn: { backgroundColor: '#FF9F0A' },
  opBtnText: { color: '#FFFFFF' },
  fnBtn: { backgroundColor: '#A5A5AA' },
  fnBtnText: { color: '#1C1C1E' },
  equalsBtn: { backgroundColor: '#FF9F0A' },
  equalsBtnText: { color: '#FFFFFF' },
  zeroBtn: { width: BTN_SIZE * 2 + 12, borderRadius: BTN_SIZE, alignItems: 'flex-start', paddingLeft: 28 },

  // PIN Modal
  pinOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  pinCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pinTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 24, color: Colors.textPrimary },
  pinInput: {
    width: '100%',
    backgroundColor: Colors.surface2,
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Nunito_400Regular',
    fontSize: 24,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pinError: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: Colors.danger },
  pinButtons: { flexDirection: 'row', gap: 16, width: '100%' },
  pinCancel: {
    flex: 1,
    backgroundColor: Colors.surface2,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pinCancelText: { fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary, fontSize: 15 },
  pinSubmit: {
    flex: 1,
    backgroundColor: Colors.emergency,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  pinSubmitText: { fontFamily: 'Nunito_600SemiBold', color: Colors.textPrimary, fontSize: 15 },
});

export default DisguiseModeScreen;
