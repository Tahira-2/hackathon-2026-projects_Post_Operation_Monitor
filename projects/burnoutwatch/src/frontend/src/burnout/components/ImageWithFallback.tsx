import { useState } from 'react';
import { Image, View, StyleSheet, Text } from 'react-native';

interface Props {
  source: { uri: string };
  style?: any;
}

export function ImageWithFallback({ source, style }: Props) {
  const [error, setError] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {!error ? (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onError={() => setError(true)}
        />
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>Image failed</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  fallback: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#6B7280',
    fontSize: 12,
  },
});