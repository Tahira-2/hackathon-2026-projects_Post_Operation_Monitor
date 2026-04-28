import { Heart } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';

interface BurnoutStatusCheckProps {
  onComplete: () => void;
  isAnalyzing?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onSkip?: () => void;
}

export function BurnoutStatusCheck({
  onComplete,
  isAnalyzing = false,
  errorMessage = '',
  onRetry,
  onSkip,
}: BurnoutStatusCheckProps) {
  const [progress, setProgress] = useState(0);

  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (errorMessage) {
          return prev;
        }

        if (isAnalyzing && prev >= 94) {
          return 94;
        }

        if (!isAnalyzing && prev < 100) {
          return prev + 2;
        }

        if (!isAnalyzing && prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [errorMessage, isAnalyzing, onComplete]);

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    pulseAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, [pulse, spin]);

  const spinInterpolate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.screen}>
      <View style={styles.container}>

        {/* Loader */}
        <View style={styles.loaderWrapper}>

          {/* Spinning ring */}
          <Animated.View
            style={[
              styles.spinner,
              { transform: [{ rotate: spinInterpolate }] },
            ]}
          />

          {/* Glow pulse */}
          <Animated.View
            style={[
              styles.glow,
              { transform: [{ scale: pulse }] },
            ]}
          />

          {/* Heart */}
          <Heart size={30} color="#FFFFFF" fill="#FFFFFF" />
        </View>

        {/* Text */}
        <Text style={styles.title}>
          Analyzing face scan
        </Text>
        <Text style={styles.subtitle}>
          {errorMessage ? 'We could not update your score from the scan.' : 'Updating your burnout score'}
        </Text>

        {errorMessage ? (
          <>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={onRetry ?? onComplete} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onSkip ?? onComplete} style={styles.skipButton}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : null}

        {/* Optional progress display */}
        <Text style={styles.progress}>{progress}%</Text>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#6FAFB5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    alignItems: 'center',
  },
  loaderWrapper: {
    width: 80,
    height: 80,
    marginBottom: 20,
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
    borderTopColor: '#FFFFFF',
    borderRightColor: 'transparent',
  },
  glow: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    opacity: 0.2,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.82,
    textAlign: 'center',
  },
  progress: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 13,
    opacity: 0.9,
    marginTop: 12,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  retryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: {
    color: '#2C3E50',
    fontWeight: '600',
  },
  skipButton: {
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  skipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
