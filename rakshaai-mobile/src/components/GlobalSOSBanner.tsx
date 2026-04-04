/**
 * GlobalSOSBanner.tsx — Always-on SOS trigger button rendered above the Navigator.
 *
 * - Absolutely positioned at top of screen, zIndex 9999.
 * - Pulsing red dot animation via react-native-reanimated.
 * - Shows current safety mode label.
 * - SOS button calls fireSOS() from SafetyContext.
 */
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeArea } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/theme/colors';
import { useSafety } from '@/context/SafetyContext';

const MODE_LABELS: Record<string, string> = {
  normal:   'Protected',
  sahayak:  'Sahayak Active',
  guardian: 'Guardian Mode',
};

const MODE_COLORS: Record<string, string> = {
  normal:   Colors.info,
  sahayak:  Colors.sahayak,
  guardian: Colors.textMuted,
};

export const GlobalSOSBanner: React.FC = () => {
  const { fireSOS, safetyMode } = useSafety();
  const insets = useSafeArea();

  // Pulse animation for the status dot
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(1,   { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: pulse.value > 1.2 ? 0.7 : 1,
  }));

  const modeColor = MODE_COLORS[safetyMode] ?? Colors.info;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Status dot + label */}
      <View style={styles.statusRow}>
        <Animated.View style={[styles.dot, { backgroundColor: modeColor }, pulseStyle]} />
        <Text style={[styles.modeText, { color: modeColor }]}>
          {MODE_LABELS[safetyMode] ?? 'Active'}
        </Text>
      </View>

      {/* SOS button */}
      <TouchableOpacity
        style={styles.sosButton}
        onPress={() => fireSOS('manual')}
        accessibilityLabel="Trigger SOS alert"
        accessibilityRole="button"
      >
        <MaterialCommunityIcons name="alert-octagon" size={16} color={Colors.textPrimary} />
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: Colors.surface + 'EE',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  modeText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.emergency,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: Colors.emergency,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  sosText: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 14,
    color: Colors.textPrimary,
    letterSpacing: 1.5,
  },
});
