/**
 * SOSCountdownModal.tsx — 3-second cancellation window after SOS trigger.
 *
 * Renders a full-screen modal with animated countdown bar.
 * CANCEL clears the SOS via cancelSOS() from SafetyContext.
 * Auto-dismisses when countdown completes (SOS confirmed).
 */
import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/theme/colors';
import { useSafety } from '@/context/SafetyContext';
import { SOS_COUNTDOWN_MS } from '@/utils/constants';

export const SOSCountdownModal: React.FC = () => {
  const { sosCountdownActive, cancelSOS, detectedKeyword } = useSafety();
  const progress = useSharedValue(1);

  useEffect(() => {
    if (sosCountdownActive) {
      progress.value = 1;
      progress.value = withTiming(0, {
        duration: SOS_COUNTDOWN_MS,
        easing: Easing.linear,
      });
    } else {
      progress.value = 1;
    }
  }, [sosCountdownActive, progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <Modal
      visible={sosCountdownActive}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.container}>
        <MaterialCommunityIcons name="alert-octagon" size={72} color={Colors.emergency} />
        <Text style={styles.title}>SOS TRIGGERED</Text>
        <Text style={styles.keyword}>
          Keyword: <Text style={styles.kw}>{detectedKeyword || 'manual'}</Text>
        </Text>
        <Text style={styles.subtitle}>
          Sending alert to your Inner Circle…
        </Text>

        {/* Countdown bar */}
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, barStyle]} />
        </View>
        <Text style={styles.cancelHint}>Sending in {(SOS_COUNTDOWN_MS / 1000).toFixed(0)}s</Text>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={cancelSOS}
          accessibilityLabel="Cancel SOS"
          accessibilityRole="button"
        >
          <Text style={styles.cancelText}>✕  CANCEL SOS</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBase,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  title: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 36,
    color: Colors.emergency,
    letterSpacing: 4,
    textAlign: 'center',
  },
  keyword: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  kw: {
    color: Colors.emergency,
    fontFamily: 'Nunito_600SemiBold',
  },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  barTrack: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.surface2,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 24,
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.emergency,
    borderRadius: 4,
  },
  cancelHint: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
  cancelBtn: {
    marginTop: 32,
    borderWidth: 2,
    borderColor: Colors.emergency,
    borderRadius: 12,
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  cancelText: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 18,
    color: Colors.emergency,
    letterSpacing: 2,
  },
});
