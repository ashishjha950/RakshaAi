/**
 * RootNavigator.tsx — Top-level navigator.
 *
 * Guardian Mode: renders ONLY DisguiseModeScreen (stealth calculator).
 * Normal/Sahayak: renders DrawerNavigator (full app).
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafety } from '@/context/SafetyContext';
import { DrawerNavigator } from './DrawerNavigator';
import DisguiseModeScreen from '@/screens/DisguiseModeScreen';

export type RootStackParamList = {
  Main: undefined;
  Disguise: undefined;
  Login: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isGuardianMode } = useSafety();

  if (isGuardianMode) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
        <Stack.Screen name="Disguise" component={DisguiseModeScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={DrawerNavigator} />
    </Stack.Navigator>
  );
};
