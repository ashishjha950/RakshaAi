/**
 * App.tsx — Root of the RakshaAI Mobile app.
 *
 * Mount order (outer → inner):
 *   GestureHandlerRootView
 *   └── SafeAreaProvider
 *       └── SafetyProvider (global context)
 *           └── NavigationContainer (with navigationRef for 401 redirects)
 *               ├── RootNavigator (routes)
 *               ├── GlobalSOSBanner (zIndex 9999, above everything)
 *               ├── SOSCountdownModal
 *               └── FakeCallOverlay
 */
import './global.css';
import React, { useRef, useCallback, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import {
  useFonts,
  Rajdhani_700Bold,
  Rajdhani_600SemiBold,
} from '@expo-google-fonts/rajdhani';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
} from '@expo-google-fonts/nunito';
import { View, ActivityIndicator } from 'react-native';

import { SafetyProvider } from '@/context/SafetyContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import { SOSCountdownModal } from '@/components/SOSCountdownModal';
import { FakeCallOverlay } from '@/components/FakeCallOverlay';
import { setNavigationRef } from '@/services/api';
import { Colors } from '@/theme/colors';

// ── Notification handler (must be set at module level) ────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NavigationContainer ref is typed loosely
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  // Load fonts
  const [fontsLoaded] = useFonts({
    Rajdhani_700Bold,
    Rajdhani_600SemiBold,
    Nunito_400Regular,
    Nunito_600SemiBold,
  });

  // Wire navigationRef to API service for 401 redirects
  const handleNavigationReady = useCallback(() => {
    setNavigationRef(navigationRef.current);
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.darkBase, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.emergency} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.darkBase }}>
      <SafeAreaProvider>
        <SafetyProvider>
          <NavigationContainer
            ref={navigationRef}
            onReady={handleNavigationReady}
            theme={{
              dark: true,
              fonts: {
                regular:   { fontFamily: 'Nunito_400Regular',   fontWeight: '400' },
                medium:    { fontFamily: 'Nunito_600SemiBold',  fontWeight: '600' },
                bold:      { fontFamily: 'Rajdhani_700Bold',    fontWeight: '700' },
                heavy:     { fontFamily: 'Rajdhani_700Bold',    fontWeight: '700' },
              },
              colors: {
                primary:        Colors.emergency,
                background:     Colors.darkBase,
                card:           Colors.surface,
                text:           Colors.textPrimary,
                border:         Colors.border,
                notification:   Colors.emergency,
              },
            }}
          >
            {/* Main navigation tree */}
            <RootNavigator />

            {/* Global overlays — rendered above everything */}
            <SOSCountdownModal />
            <FakeCallOverlay />
          </NavigationContainer>
          <StatusBar style="light" backgroundColor={Colors.surface} />
        </SafetyProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
