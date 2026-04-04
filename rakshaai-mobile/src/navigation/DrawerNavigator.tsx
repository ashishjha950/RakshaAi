/**
 * DrawerNavigator.tsx — Side drawer for the main app.
 *
 * Contains all main screens directly.
 * Custom light-themed drawer with app branding and mode toggle.
 */
import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/theme/colors';
import { useSafety } from '@/context/SafetyContext';

import HomeScreen from '@/screens/HomeScreen';
import SafeJourneyScreen from '@/screens/SafeJourneyScreen';
import CommunityScreen from '@/screens/CommunityScreen';
import SahayakScreen from '@/screens/SahayakScreen';
import EvidenceScreen from '@/screens/EvidenceScreen';

export type DrawerParamList = {
  Dashboard: undefined;
  SafeJourney: undefined;
  Community: undefined;
  Evidence: undefined;
  MyData: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { safetyMode, setSafetyMode } = useSafety();

  const modes = [
    { key: 'normal',   label: 'Normal',   icon: 'shield-outline',  color: Colors.info },
    { key: 'sahayak',  label: 'Sahayak',  icon: 'robot-happy',     color: Colors.sahayak },
    { key: 'guardian', label: 'Guardian', icon: 'eye-off-outline',  color: Colors.textMuted },
  ] as const;

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContent}
    >
      {/* Brand header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="shield-star" size={36} color={Colors.emergency} />
        <Text style={styles.brandName}>RakshaAI</Text>
        <Text style={styles.brandSub}>Your Safety, Always On</Text>
      </View>

      {/* Nav items */}
      <DrawerItemList {...props} />

      {/* Mode switcher */}
      <View style={styles.modeSwitcher}>
        <Text style={styles.modeLabel}>Safety Mode</Text>
        {modes.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[styles.modeBtn, safetyMode === m.key && { borderColor: m.color, backgroundColor: m.color + '1A' }]}
            onPress={() => setSafetyMode(m.key)}
            accessibilityLabel={`Switch to ${m.label} mode`}
          >
            <MaterialCommunityIcons name={m.icon} size={18} color={m.color} />
            <Text style={[styles.modeBtnText, { color: m.color }]}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  drawerContent: { flex: 1, paddingTop: 16, paddingBottom: 24, backgroundColor: Colors.surface },
  header: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: 8, gap: 4 },
  brandName: { fontFamily: 'Rajdhani_700Bold', fontSize: 26, color: Colors.textPrimary, letterSpacing: 2 },
  brandSub: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: Colors.textSecondary },
  modeSwitcher: { paddingHorizontal: 12, paddingTop: 16, gap: 8 },
  modeLabel: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: Colors.textSecondary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  modeBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border },
  modeBtnText: { fontFamily: 'Nunito_600SemiBold', fontSize: 14 },
});

export const DrawerNavigator: React.FC = () => (
  <Drawer.Navigator
    drawerContent={(props) => <CustomDrawerContent {...props} />}
    screenOptions={{
      headerShown: false,
      drawerStyle: { backgroundColor: Colors.surface, width: 280 },
      drawerActiveTintColor: Colors.emergency,
      drawerInactiveTintColor: Colors.textSecondary,
      drawerLabelStyle: { fontFamily: 'Nunito_600SemiBold', fontSize: 15 },
      drawerActiveBackgroundColor: Colors.emergency + '1A', // transparent pink
    }}
  >
    <Drawer.Screen
      name="Dashboard"
      component={SahayakScreen}
      options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard-outline" size={22} color={color} /> }}
    />
    <Drawer.Screen
      name="SafeJourney"
      component={SafeJourneyScreen}
      options={{
        title: 'Safe Journey',
        drawerIcon: ({ color }) => <MaterialCommunityIcons name="map-marker-distance" size={22} color={color} />,
      }}
    />
    <Drawer.Screen
      name="Community"
      component={CommunityScreen}
      options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="account-group-outline" size={22} color={color} /> }}
    />
    <Drawer.Screen
      name="MyData"
      component={HomeScreen}
      options={{
        title: 'My Data',
        drawerIcon: ({ color }) => <MaterialCommunityIcons name="chart-box-outline" size={22} color={color} />,
      }}
    />
    <Drawer.Screen
      name="Evidence"
      component={EvidenceScreen}
      options={{
        title: 'Evidence Capture',
        drawerIcon: ({ color }) => <MaterialCommunityIcons name="folder-lock-outline" size={22} color={color} />,
      }}
    />
  </Drawer.Navigator>
);
