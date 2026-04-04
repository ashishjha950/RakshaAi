import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/theme/colors';
import { Header } from '@/components/Header';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafety } from '@/context/SafetyContext';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList } from '@/navigation/DrawerNavigator';

type NavProp = DrawerNavigationProp<DrawerParamList>;

const SahayakScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { fireSOS, globalSosWatch, setGlobalSosWatch, currentLocation, setSafetyMode } = useSafety();

  const [shakeEnabled, setShakeEnabled] = useState(true);
  const [screamEnabled, setScreamEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.root}>
      <Header />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <Text style={styles.title}>Sahayak Dashboard</Text>
        <Text style={styles.subtitle}>
          Your quick access emergency triggers and status.
        </Text>

        {/* System Status Panel */}
        <View style={styles.statusPanel}>
          <Text style={styles.statusTitle}>System Status</Text>
          <View style={styles.statusRow}>
            <MaterialCommunityIcons name="shield-check-outline" size={20} color={globalSosWatch ? Colors.success : Colors.textMuted} />
            <Text style={styles.statusText}>Monitoring: {globalSosWatch ? 'ACTIVE' : 'INACTIVE'}</Text>
          </View>
          <View style={styles.statusRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={20} color={currentLocation ? Colors.info : Colors.textMuted} />
            <Text style={styles.statusText}>
              Location: {currentLocation ? new Date(currentLocation.timestamp || Date.now()).toLocaleTimeString() : 'Unknown'}
            </Text>
          </View>
        </View>

        {/* Big Central Power Button */}
        <TouchableOpacity style={styles.powerBtnContainer} onPress={() => { Alert.alert('SOS Initialized', 'Sending alert to your inner circle...'); fireSOS('manual_button'); }}>
          <LinearGradient
            colors={[Colors.emergency, Colors.emergencyLight]}
            style={styles.powerOuter}
          >
            <View style={styles.powerInner}>
              <MaterialCommunityIcons name="power" size={48} color={Colors.emergency} />
            </View>
          </LinearGradient>
          <Text style={styles.powerTitle}>Tap for SOS</Text>
          <Text style={styles.powerSub}>Immediately alert contacts</Text>
        </TouchableOpacity>

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
            <Text style={styles.triggerTitle}>Global Monitoring (Voice & Scream)</Text>
            <Text style={styles.triggerDesc}>Enable background audio watch</Text>
          </View>
          <Switch
            value={globalSosWatch}
            onValueChange={(val) => setGlobalSosWatch(val)}
            trackColor={{ false: Colors.border, true: Colors.success }}
            thumbColor="#FFF"
          />
        </View>



        {/* Quick Shortcuts */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Quick Shortcuts</Text>
        <TouchableOpacity style={styles.configureCard} onPress={() => navigation.navigate('SafeJourney')}>
          <MaterialCommunityIcons name="navigation-outline" size={24} color={Colors.textSecondary} />
          <View style={styles.configBody}>
            <Text style={styles.configTitle}>Start Safe Journey</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.border} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.configureCard, { marginTop: 12 }]} 
          onPress={() => { setSafetyMode('guardian'); Alert.alert('Guardian Mode', 'App entering calculator disguise...'); }}>
          <MaterialCommunityIcons name="calculator" size={24} color={Colors.textSecondary} />
          <View style={styles.configBody}>
            <Text style={styles.configTitle}>Open Disguise Mode</Text>
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
  subtitle: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: Colors.textSecondary, marginBottom: 24 },

  statusPanel: { backgroundColor: Colors.surface, padding: 16, borderRadius: 16, marginBottom: 32, borderWidth: 1, borderColor: Colors.border },
  statusTitle: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  statusText: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: Colors.textPrimary },

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
