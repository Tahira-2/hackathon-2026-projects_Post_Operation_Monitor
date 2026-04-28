import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Sun, Moon, Clock } from 'lucide-react-native';

interface BurnoutQuestionnaireProps {
  onComplete: () => void;
  onBack: () => void;
}

export function BurnoutQuestionnaire({
  onComplete,
  onBack,
}: BurnoutQuestionnaireProps) {
  const [step, setStep] = useState(1);
  const [shift, setShift] = useState('');
  const [duration, setDuration] = useState('');
  const [sleep, setSleep] = useState('');

  const shifts = [
    { value: 'day', label: 'Day', icon: Sun },
    { value: 'night', label: 'Night', icon: Moon },
    { value: 'rotating', label: 'Rotating', icon: Clock },
  ];

  const durations = ['4-6 hrs', '6-8 hrs', '8-10 hrs', '10-12 hrs', '12+ hrs'];

  const sleepLevels = [
    { value: 'excellent', label: '😊', desc: 'Excellent' },
    { value: 'good', label: '🙂', desc: 'Good' },
    { value: 'fair', label: '😐', desc: 'Fair' },
    { value: 'poor', label: '😔', desc: 'Poor' },
    { value: 'very-poor', label: '😩', desc: 'Very Poor' },
  ];

  const handleNext = () => {
    if (step === 1 && shift) setStep(2);
    else if (step === 2 && duration) setStep(3);
    else if (step === 3 && sleep) onComplete();
  };

  const handleBack = () => {
    if (step === 1) onBack();
    else setStep(step - 1);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>

        {/* Progress */}
        <View style={styles.progressRow}>
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                step === i && styles.progressActive,
              ]}
            />
          ))}
        </View>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <Text style={styles.title}>What shift did you work?</Text>

            {shifts.map(({ value, label, icon: Icon }) => (
              <TouchableOpacity
                key={value}
                onPress={() => setShift(value)}
                style={[
                  styles.option,
                  shift === value && styles.optionSelected,
                ]}
              >
                <Icon size={22} color={shift === value ? '#6FAFB5' : '#9CA3AF'} />
                <Text style={styles.optionText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <Text style={styles.title}>How long was your shift?</Text>

            {durations.map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setDuration(d)}
                style={[
                  styles.option,
                  duration === d && styles.optionSelected,
                ]}
              >
                <Text style={styles.optionText}>{d}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <Text style={styles.title}>How was your sleep?</Text>

            {sleepLevels.map(({ value, label, desc }) => (
              <TouchableOpacity
                key={value}
                onPress={() => setSleep(value)}
                style={[
                  styles.option,
                  sleep === value && styles.optionSelected,
                ]}
              >
                <Text style={{ fontSize: 20 }}>{label}</Text>
                <Text style={styles.optionText}>{desc}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Text>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            style={styles.nextBtn}
          >
            <Text style={{ color: '#fff' }}>
              {step === 3 ? 'Continue' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    gap: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 6,
  },
  progressDot: {
    width: 8,
    height: 8,
    backgroundColor: '#D1D5DB',
    borderRadius: 4,
  },
  progressActive: {
    width: 20,
    backgroundColor: '#0F2A3A',
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  optionSelected: {
    borderWidth: 2,
    borderColor: '#6FAFB5',
  },
  optionText: {
    fontSize: 14,
  },
  navRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  backBtn: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  nextBtn: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#0F2A3A',
    borderRadius: 8,
  },
});