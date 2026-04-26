import './global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import * as Location from 'expo-location';

import 'react-native-gesture-handler';

import Navigation from './navigation';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from 'store/auth-store';
import { updateLocation } from 'api/users-service';

export default function App() {
  const colorScheme = useColorScheme();
  const hydrate = useAuthStore((s) => s.hydrate);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Hydrate auth on app launch
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  // Send device location to backend after login
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted' || cancelled) return;

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (cancelled) return;

        await updateLocation({
          latitude: String(loc.coords.latitude),
          longitude: String(loc.coords.longitude),
        });
      } catch {
        // Location permission denied or unavailable — silent fail
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  return (
    <SafeAreaProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardProvider>
        <Navigation />
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
