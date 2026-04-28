import { ArrowLeft, Camera } from 'lucide-react-native';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

interface BurnoutCameraAccessProps {
  onAnalyzeFaceScan: (photoPayload: {
    width?: number;
    height?: number;
    fileSizeBytes?: number | null;
    uri?: string;
  }) => void;
  onSkip: () => void;
  onBack: () => void;
}

export function BurnoutCameraAccess({
  onAnalyzeFaceScan,
  onSkip,
  onBack,
}: BurnoutCameraAccessProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCameraPermission = async () => {
    setErrorMessage('');
    setIsAnalyzing(true);

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage('Camera permission was not granted. You can retry or skip this scan.');
        return;
      }

      const capture = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.7,
      });

      if (capture.canceled) {
        setErrorMessage('Photo capture was cancelled. You can retry or skip this scan.');
        return;
      }

      const asset = capture.assets?.[0] ?? {};
      onAnalyzeFaceScan({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileSizeBytes: asset.fileSize ?? null,
      });
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown camera error';
      setErrorMessage(`Face scan failed: ${message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color="#4B5563" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Camera size={48} color="#6FAFB5" />
          </View>

          <Text style={styles.title}>Complete your check-in</Text>
          <Text style={styles.subtitle}>Quick face scan for burnout detection</Text>
          <Text style={styles.description}>
            This helps us better understand your well-being
          </Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              onPress={handleCameraPermission}
              disabled={isAnalyzing}
              style={[styles.primaryButton, isAnalyzing && styles.disabledButton]}
            >
              <Camera size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>
                {isAnalyzing ? 'Analyzing face scan...' : 'Allow Camera Access'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onSkip}
              disabled={isAnalyzing}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <Text style={styles.privacyText}>
            Your privacy matters. Images are processed securely and never stored.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  backText: {
    color: '#4B5563',
    fontSize: 16,
  },
  content: {
    alignItems: 'center',
    marginTop: 80,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#6FAFB520',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: '#4B5563',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 32,
    textAlign: 'center',
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#6FAFB5',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4B5563',
    fontSize: 16,
  },
  privacyText: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
  errorText: {
    color: '#B45309',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
