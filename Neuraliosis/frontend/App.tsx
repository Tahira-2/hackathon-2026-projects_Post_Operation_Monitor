import './global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import { useHealthConnect } from 'hooks/useHealthData';

import 'react-native-gesture-handler';

import Navigation from './navigation';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardProvider>
        <Navigation />
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
