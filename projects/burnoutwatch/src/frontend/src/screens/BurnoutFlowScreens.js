import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useEffect, useState } from 'react';

const { COLORS, SHADOW } = require('./deviceMetricTheme');

function BrandMark({ inverted = false }) {
  return (
    <View style={[styles.brandMark, inverted && styles.brandMarkInverted]}>
      <Text style={[styles.brandText, inverted && styles.brandTextInverted]}>BW</Text>
      <Text style={[styles.brandPulse, inverted && styles.brandPulseInverted]}>+</Text>
    </View>
  );
}

function PrimaryButton({ label, onPress, muted = false, disabled = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      android_ripple={{ color: muted ? '#cbd5e1' : '#5A9BA1' }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        muted ? styles.mutedButton : styles.primaryButton,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text style={muted ? styles.mutedButtonText : styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function Shell({ children, bright = false }) {
  return (
    <View style={[styles.shell, bright && styles.shellBright]}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      {children}
    </View>
  );
}

function BurnoutLoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const canContinue = email.trim() && password.trim() && role.trim();

  return (
    <Shell>
      <ScrollView contentContainerStyle={styles.centerScroll} keyboardShouldPersistTaps="handled">
        <View style={styles.loginHeader}>
          <BrandMark />
          <Text style={styles.loginTitle}>Sign in to BurnoutWatch</Text>
          <Text style={styles.loginSubtitle}>We're here to support you.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={COLORS.textSoft}
            style={styles.input}
            value={email}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor={COLORS.textSoft}
            secureTextEntry
            style={styles.input}
            value={password}
          />

          <Text style={styles.label}>Role</Text>
          <View style={styles.roleGrid}>
            {['Nurse', 'Doctor', 'Resident', 'Supervisor'].map((item) => (
              <Pressable
                accessibilityRole="button"
                android_ripple={{ color: '#dbeff1' }}
                key={item}
                onPress={() => setRole(item)}
                style={({ pressed }) => [
                  styles.rolePill,
                  role === item && styles.rolePillActive,
                  pressed && styles.chipPressed,
                ]}
              >
                <Text style={[styles.roleText, role === item && styles.roleTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <PrimaryButton
            disabled={!canContinue}
            label="Start Burnout Check-In"
            onPress={onLogin}
          />
          {!canContinue ? <Text style={styles.helper}>Enter email, password, and role to continue.</Text> : null}
        </View>
      </ScrollView>
    </Shell>
  );
}

function formatRiskTier(tier) {
  if (!tier) {
    return 'Pending';
  }
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

function BurnoutDashboardScreen({ burnoutScoreResult, onStartCheckIn, onOpenDeviceSync }) {
  const steps = [
    { label: 'Morning reflection', complete: true },
    { label: 'Energy check', complete: true },
    { label: 'Evening wind-down', complete: false },
  ];
  const riskTier = formatRiskTier(burnoutScoreResult?.risk_tier);
  const scoreText = burnoutScoreResult ? `${burnoutScoreResult.burnout_score}/100` : 'Sync device metrics';
  const confidenceText = burnoutScoreResult
    ? `${Math.round(burnoutScoreResult.confidence * 100)}% confidence`
    : 'Open Device Metric Sync to calculate your current score.';

  return (
    <Shell bright>
      <ScrollView contentContainerStyle={styles.dashboardScroll}>
        <View style={styles.dashboardHeader}>
          <Text style={styles.dashboardTitle}>Welcome back, Jon</Text>
          <Text style={styles.dashboardSubtitle}>Let's check in with how you're doing today.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusOrb}>
              <Text style={styles.statusOrbText}>{riskTier.charAt(0)}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.mutedText}>Burnout Level</Text>
              <Text style={styles.statusText}>{riskTier}</Text>
            </View>
          </View>
          <Text style={styles.bodyText}>{scoreText}</Text>
          <Text style={styles.timestampText}>{confidenceText}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Today's Check-in</Text>
          {steps.map((step) => (
            <View key={step.label} style={styles.checkRow}>
              <View style={[styles.checkDot, step.complete && styles.checkDotComplete]} />
              <Text style={[styles.checkText, step.complete && styles.checkTextComplete]}>{step.label}</Text>
            </View>
          ))}
          <PrimaryButton label="Complete Next Check-in" onPress={onStartCheckIn} />
        </View>

        <View style={styles.weekGrid}>
          <MiniStat value="5" label="Check-ins" />
          <MiniStat value="3" label="Good days" tone="success" />
          <MiniStat
            value={burnoutScoreResult ? `${Math.round(burnoutScoreResult.burnout_score)}` : '--'}
            label="Risk score"
            tone="dark"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Device Metrics</Text>
          <Text style={styles.bodyText}>
            Sync HealthKit or Health Connect data and add manual work metrics for scoring readiness.
          </Text>
          <PrimaryButton label="Open Device Metric Sync" onPress={onOpenDeviceSync} muted />
        </View>
      </ScrollView>
    </Shell>
  );
}

function MiniStat({ value, label, tone = 'brand' }) {
  const color = tone === 'success' ? COLORS.success : tone === 'dark' ? COLORS.text : COLORS.brand;
  return (
    <View style={styles.miniStat}>
      <Text style={[styles.miniStatValue, { color }]}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

function BurnoutCheckInPrepScreen({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Shell bright>
      <View style={styles.prepCenter}>
        <BrandMark inverted />
        <Text style={styles.prepTitle}>Preparing your check-in</Text>
        <Text style={styles.prepSubtitle}>This will take less than a minute.</Text>
      </View>
    </Shell>
  );
}

function BurnoutCheckInScreen({ onComplete, onBack, onFaceScan }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showCameraRequest, setShowCameraRequest] = useState(false);
  const [cameraState, setCameraState] = useState({ loading: false, error: null });
  const questions = [
    { text: 'How would you rate your energy level today?', subtitle: 'Be honest with yourself.' },
    { text: 'How much stress are you feeling?', subtitle: "There's no right or wrong answer." },
    { text: 'How connected do you feel to your work?', subtitle: 'Your feelings matter.' },
  ];
  const options = ['Very Low', 'Low', 'Moderate', 'Good', 'Great'];

  function handleAnswer() {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((value) => value + 1);
      return;
    }
    setShowCameraRequest(true);
  }

  async function handleCameraCapture() {
    setCameraState({ loading: true, error: null });
    try {
      let ImagePicker = null;
      try {
        ImagePicker = require('expo-image-picker');
      } catch (error) {
        throw new Error('Camera module is unavailable. Install expo-image-picker in the frontend app.');
      }

      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== 'granted') {
        throw new Error('Camera permission was denied.');
      }

      const launchResult = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.85,
      });
      if (launchResult.canceled || !launchResult.assets?.length) {
        throw new Error('Camera capture was cancelled.');
      }

      const asset = launchResult.assets[0];
      if (onFaceScan) {
        await onFaceScan({
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          fileSizeBytes: asset.fileSize ?? null,
        });
      }
      setCameraState({ loading: false, error: null });
      onComplete();
    } catch (error) {
      setCameraState({ loading: false, error: error.message });
    }
  }

  if (showCameraRequest) {
    return (
      <Shell bright>
        <View style={styles.checkInContainer}>
          <PrimaryButton label="Back" onPress={() => setShowCameraRequest(false)} muted />
          <View style={styles.cameraCard}>
            <Text style={styles.cameraIcon}>CAM</Text>
            <Text style={styles.questionTitle}>One more thing...</Text>
            <Text style={styles.bodyText}>Complete your check-in with a quick face scan.</Text>
            <Text style={styles.helper}>Images are processed securely and never stored.</Text>
            {cameraState.error ? <Text style={styles.helper}>{cameraState.error}</Text> : null}
            <PrimaryButton
              label={cameraState.loading ? 'Capturing...' : 'Allow Camera Access'}
              onPress={handleCameraCapture}
              disabled={cameraState.loading}
            />
            <PrimaryButton label="Skip for now" onPress={onComplete} muted />
          </View>
        </View>
      </Shell>
    );
  }

  return (
    <Shell bright>
      <ScrollView contentContainerStyle={styles.checkInContainer}>
        <PrimaryButton label="Back" onPress={onBack} muted />
        <View style={styles.progressRow}>
          {questions.map((question, index) => (
            <View
              key={question.text}
              style={[styles.progressBar, index <= currentQuestion && styles.progressBarActive]}
            />
          ))}
        </View>
        <View style={styles.questionHeader}>
          <BrandMark inverted />
          <Text style={styles.questionTitle}>{questions[currentQuestion].text}</Text>
          <Text style={styles.prepSubtitle}>{questions[currentQuestion].subtitle}</Text>
        </View>
        {options.map((option, index) => (
          <Pressable
            accessibilityRole="button"
            android_ripple={{ color: '#dbeff1' }}
            key={option}
            onPress={handleAnswer}
            style={({ pressed }) => [styles.answerCard, pressed && styles.answerCardPressed]}
          >
            <Text style={styles.answerIndex}>{index + 1}</Text>
            <Text style={styles.answerText}>{option}</Text>
          </Pressable>
        ))}
        <Text style={styles.helper}>
          Question {currentQuestion + 1} of {questions.length}
        </Text>
      </ScrollView>
    </Shell>
  );
}

function BurnoutStatusCheckScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 250);
          return 100;
        }
        return current + 5;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <Shell>
      <View style={styles.prepCenter}>
        <BrandMark />
        <Text style={styles.loginTitle}>Checking burnout status</Text>
        <View style={styles.statusProgressTrack}>
          <View style={[styles.statusProgressFill, { width: `${progress}%` }]} />
        </View>
      </View>
    </Shell>
  );
}

const styles = StyleSheet.create({
  answerCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
    padding: 18,
    ...SHADOW,
  },
  answerCardPressed: {
    borderColor: COLORS.brand,
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  answerIndex: {
    color: COLORS.brandDark,
    fontSize: 18,
    fontWeight: '900',
  },
  answerText: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  bodyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    height: 80,
    justifyContent: 'center',
    width: 80,
    ...SHADOW,
  },
  brandMarkInverted: {
    backgroundColor: '#e6f7f8',
  },
  brandPulse: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    position: 'absolute',
  },
  brandPulseInverted: {
    color: COLORS.surface,
  },
  brandText: {
    color: COLORS.brand,
    fontSize: 24,
    fontWeight: '900',
  },
  brandTextInverted: {
    color: COLORS.brandDark,
  },
  cameraCard: {
    alignItems: 'center',
    marginTop: 70,
  },
  cameraIcon: {
    backgroundColor: '#dbeff1',
    borderRadius: 999,
    color: COLORS.brandDark,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 24,
    overflow: 'hidden',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 18,
    padding: 20,
    ...SHADOW,
  },
  buttonDisabled: {
    opacity: 0.48,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  centerScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 22,
  },
  checkDot: {
    borderColor: COLORS.neutral,
    borderRadius: 999,
    borderWidth: 2,
    height: 20,
    width: 20,
  },
  checkDotComplete: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkInContainer: {
    flexGrow: 1,
    padding: 22,
  },
  checkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  checkText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  checkTextComplete: {
    color: COLORS.textSoft,
    textDecorationLine: 'line-through',
  },
  dashboardHeader: {
    marginBottom: 24,
    paddingTop: 26,
  },
  dashboardScroll: {
    padding: 22,
    paddingBottom: 36,
  },
  dashboardSubtitle: {
    color: COLORS.textMuted,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 8,
  },
  dashboardTitle: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '800',
  },
  flex: {
    flex: 1,
  },
  glowOne: {
    backgroundColor: '#ffffff',
    borderRadius: 240,
    height: 240,
    opacity: 0.08,
    position: 'absolute',
    right: -90,
    top: 40,
    width: 240,
  },
  glowTwo: {
    backgroundColor: COLORS.brand,
    borderRadius: 360,
    height: 360,
    left: -140,
    opacity: 0.12,
    position: 'absolute',
    top: 260,
    width: 360,
  },
  helper: {
    color: COLORS.textSoft,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loginSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
  loginTitle: {
    color: COLORS.surface,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 18,
    textAlign: 'center',
  },
  miniStat: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    padding: 16,
    ...SHADOW,
  },
  miniStatLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  miniStatValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  mutedButton: {
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 48,
    paddingVertical: 14,
  },
  mutedButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '900',
  },
  mutedText: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginBottom: 2,
  },
  prepCenter: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  prepSubtitle: {
    color: COLORS.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
  },
  prepTitle: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: '800',
    marginTop: 22,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: COLORS.brand,
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 50,
    paddingVertical: 15,
    ...SHADOW,
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '900',
  },
  progressBar: {
    backgroundColor: '#dbe4ee',
    borderRadius: 999,
    flex: 1,
    height: 5,
  },
  progressBarActive: {
    backgroundColor: COLORS.brand,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 24,
  },
  questionHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  questionTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 31,
    marginTop: 18,
    textAlign: 'center',
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  rolePill: {
    backgroundColor: '#f8fafc',
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  chipPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.97 }],
  },
  rolePillActive: {
    backgroundColor: '#dbeff1',
    borderColor: COLORS.brand,
  },
  roleText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '800',
  },
  roleTextActive: {
    color: COLORS.brandDark,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 14,
  },
  shell: {
    backgroundColor: COLORS.brandDeep,
    flex: 1,
  },
  shellBright: {
    backgroundColor: COLORS.background,
  },
  statusOrb: {
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 999,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  statusOrbText: {
    color: '#92400e',
    fontSize: 26,
    fontWeight: '900',
  },
  statusProgressFill: {
    backgroundColor: COLORS.surface,
    borderRadius: 999,
    height: '100%',
  },
  statusProgressTrack: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 999,
    height: 10,
    marginTop: 24,
    overflow: 'hidden',
    width: '78%',
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
  },
  statusText: {
    color: COLORS.warning,
    fontSize: 25,
    fontWeight: '900',
  },
  timestampText: {
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    color: COLORS.textSoft,
    fontSize: 12,
    marginTop: 4,
    paddingTop: 14,
  },
  weekGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
});

module.exports = {
  BurnoutCheckInPrepScreen,
  BurnoutCheckInScreen,
  BurnoutDashboardScreen,
  BurnoutLoginScreen,
  BurnoutStatusCheckScreen,
};
