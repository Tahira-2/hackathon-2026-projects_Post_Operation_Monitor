import { Heart } from 'lucide-react-native';
import { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

interface BurnoutCheckInPrepProps {
  onComplete: () => void;
}

export function BurnoutCheckInPrep({ onComplete }: BurnoutCheckInPrepProps) {
  const spinValue = new Animated.Value(0);
  const pulseValue = new Animated.Value(1);

  useEffect(() => {
    // Auto move to next screen
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    // Spin animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearTimeout(timer);
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.loaderContainer}>
          
          {/* Spinning ring */}
          <Animated.View
            style={[
              styles.spinner,
              { transform: [{ rotate: spin }] },
            ]}
          />

          {/* Glow pulse */}
          <Animated.View
            style={[
              styles.glow,
              { transform: [{ scale: pulseValue }] },
            ]}
          />

          {/* Heart icon */}
          <Heart size={32} color="#6FAFB5" fill="#6FAFB5" />
        </View>

        <Text style={styles.title}>Preparing your check-in</Text>
        <Text style={styles.subtitle}>This will only take a moment</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    alignItems: 'center',
  },
  loaderContainer: {
    width: 80,
    height: 80,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopColor: '#6FAFB5',
    borderRightColor: 'transparent',
  },
  glow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6FAFB5',
    opacity: 0.3,
  },
  title: {
    fontSize: 22,
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});