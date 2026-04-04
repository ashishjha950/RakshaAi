/**
 * FakeCallOverlay.tsx — Full-screen fake incoming call UI.
 *
 * Displays an incoming call screen with caller name from user settings.
 * On "accept" — expo-speech reads a fake conversation script.
 * On "end call" — dismisses and stops speech.
 */
import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/theme/colors';
import { useSafety } from '@/context/SafetyContext';

const FAKE_SCRIPT = [
  'Hey, are you okay? I was worried.',
  'Just stay on the call with me.',
  'I am on my way, just 5 minutes.',
  'Can you see any landmarks nearby?',
  'Okay, keep talking to me. I am here.',
];

export const FakeCallOverlay: React.FC = () => {
  const { fakeCallActive, fakeCallContact, endFakeCall } = useSafety();
  const [accepted, setAccepted] = React.useState(false);

  useEffect(() => {
    if (!fakeCallActive) {
      setAccepted(false);
      Speech.stop();
    }
  }, [fakeCallActive]);

  const handleAccept = () => {
    setAccepted(true);
    // Read the full script sequentially using expo-speech
    const fullScript = FAKE_SCRIPT.join(' ... ');
    Speech.speak(fullScript, {
      language: 'en-IN',
      pitch: 1.05,
      rate: 0.9,
      onDone: () => { /* call continues until user ends */ },
    });
  };

  const handleDecline = () => {
    Speech.stop();
    setAccepted(false);
    endFakeCall();
  };

  return (
    <Modal
      visible={fakeCallActive}
      transparent={false}
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Caller info */}
        <View style={styles.callerSection}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account-circle" size={96} color={Colors.surface2} />
          </View>
          <Text style={styles.callerName}>{fakeCallContact}</Text>
          <Text style={styles.callStatus}>
            {accepted ? 'Ongoing call…' : 'Incoming Call…'}
          </Text>
        </View>

        {/* Call controls */}
        <View style={styles.controls}>
          {!accepted ? (
            <>
              {/* Decline */}
              <TouchableOpacity
                style={[styles.callBtn, styles.declineBtn]}
                onPress={handleDecline}
                accessibilityLabel="Decline fake call"
              >
                <MaterialCommunityIcons name="phone-hangup" size={32} color={Colors.textPrimary} />
              </TouchableOpacity>

              {/* Accept */}
              <TouchableOpacity
                style={[styles.callBtn, styles.acceptBtn]}
                onPress={handleAccept}
                accessibilityLabel="Accept fake call"
              >
                <MaterialCommunityIcons name="phone" size={32} color={Colors.textPrimary} />
              </TouchableOpacity>
            </>
          ) : (
            /* End call */
            <TouchableOpacity
              style={[styles.callBtn, styles.declineBtn]}
              onPress={handleDecline}
              accessibilityLabel="End fake call"
            >
              <MaterialCommunityIcons name="phone-hangup" size={32} color={Colors.textPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkPanel,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  callerSection: {
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  callerName: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 32,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  callStatus: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: Colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    gap: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtn: { backgroundColor: Colors.success },
  declineBtn: { backgroundColor: Colors.danger },
});
