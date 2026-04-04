import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/theme/colors';
import { Header } from '@/components/Header';
import { LinearGradient } from 'expo-linear-gradient';

const SahayakScreen: React.FC = () => {
  const [shakeEnabled, setShakeEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [screamEnabled, setScreamEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.root}>
      <Header />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <Text style={styles.title}>SOS Triggers</Text>
        <Text style={styles.subtitle}>
          Choose how to activate emergency alerts.
        </Text>

        {/* Big Central Power Button */}
        <View style={styles.powerBtnContainer}>
          <LinearGradient
            colors={[Colors.emergency, Colors.emergencyLight]}
            style={styles.powerOuter}
          >
            <View style={styles.powerInner}>
              <MaterialCommunityIcons name="power" size={48} color={Colors.emergency} />
            </View>
          </LinearGradient>
          <Text style={styles.powerTitle}>Power Button</Text>
          <Text style={styles.powerSub}>Press 5 times</Text>
        </View>

        {/* Active Triggers */}
        <Text style={styles.sectionTitle}>Active Triggers</Text>
        
        <View style={styles.triggerCard}>
          <View style={[styles.iconBox, { backgroundColor: Colors.info + '1A' }]}>
            <MaterialCommunityIcons name="vibrate" size={24} color={Colors.info} />
          </View>
          <View style={styles.triggerBody}>
            <Text style={styles.triggerTitle}>Shake Device</Text>
            <Text style={styles.triggerDesc}>Shake vigorously</Text>
          </View>
          <Switch
            value={shakeEnabled}
            onValueChange={setShakeEnabled}
            trackColor={{ false: Colors.border, true: Colors.success }}
            thumbColor="#FFF"
          />
        </View>

        <View style={styles.triggerCard}>
          <View style={[styles.iconBox, { backgroundColor: Colors.warning + '1A' }]}>
            <MaterialCommunityIcons name="microphone-outline" size={24} color={Colors.warning} />
          </View>
          <View style={styles.triggerBody}>
            <Text style={styles.triggerTitle}>Voice Command</Text>
            <Text style={styles.triggerDesc}>Say "Help me"</Text>
          </View>
          <Switch
            value={voiceEnabled}
            onValueChange={setVoiceEnabled}
            trackColor={{ false: Colors.border, true: Colors.success }}
            thumbColor="#FFF"
          />
        </View>

        <View style={styles.triggerCard}>
          <View style={[styles.iconBox, { backgroundColor: Colors.emergency + '1A' }]}>
            <MaterialCommunityIcons name="waveform" size={24} color={Colors.emergency} />
          </View>
          <View style={styles.triggerBody}>
            <Text style={styles.triggerTitle}>Scream Detection</Text>
            <Text style={styles.triggerDesc}>Detects distress sounds</Text>
          </View>
          <Switch
            value={screamEnabled}
            onValueChange={setScreamEnabled}
            trackColor={{ false: Colors.border, true: Colors.success }}
            thumbColor="#FFF"
          />
        </View>

        {/* Configure */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Configure</Text>
        <TouchableOpacity style={styles.configureCard}>
          <MaterialCommunityIcons name="account-heart-outline" size={24} color={Colors.textSecondary} />
          <View style={styles.configBody}>
            <Text style={styles.configTitle}>Set primary emergency contact</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.border} />
        </TouchableOpacity>

      </ScrollView>

      {/* Floating Voice Input Button */}
      <View style={styles.fabContainer}>
        <View style={styles.fabLabel}>
          <Text style={styles.fabLabelText}>Voice Input</Text>
        </View>
        <TouchableOpacity style={styles.fabBtn}>
          <MaterialCommunityIcons name="microphone" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.darkBase },
  content: { padding: 20, paddingBottom: 100 },
  
  title: { fontFamily: 'Rajdhani_700Bold', fontSize: 32, color: Colors.textPrimary, marginBottom: 8 },
  subtitle: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: Colors.textSecondary, marginBottom: 32 },

  powerBtnContainer: { alignItems: 'center', marginBottom: 40 },
  powerOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.emergencyLight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  powerInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerTitle: { fontFamily: 'Nunito_600SemiBold', fontSize: 18, color: Colors.textPrimary },
  powerSub: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: Colors.textSecondary, marginTop: 4 },

  sectionTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 20, color: Colors.textPrimary, marginBottom: 16 },

  triggerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  triggerBody: { flex: 1, marginLeft: 16 },
  triggerTitle: { fontFamily: 'Nunito_600SemiBold', fontSize: 15, color: Colors.textPrimary },
  triggerDesc: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  configureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  configBody: { flex: 1, marginLeft: 16 },
  configTitle: { fontFamily: 'Nunito_600SemiBold', fontSize: 15, color: Colors.textPrimary },

  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'flex-end',
    gap: 8,
  },
  fabLabel: {
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fabLabelText: { fontFamily: 'Nunito_600SemiBold', fontSize: 11, color: '#FFF' },
  fabBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.emergency,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.emergencyLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default SahayakScreen;
