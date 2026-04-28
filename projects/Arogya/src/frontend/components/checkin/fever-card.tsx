import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { CheckInSection } from '@/components/checkin/check-in-section';

type FeverCardProps = {
  hasFever: boolean;
  temperature: string;
  onHasFeverChange: (value: boolean) => void;
  onTemperatureChange: (value: string) => void;
};

export function FeverCard({
  hasFever,
  temperature,
  onHasFeverChange,
  onTemperatureChange,
}: FeverCardProps) {
  return (
    <CheckInSection title="Fever">
      <View style={styles.choiceRow}>
        <Pressable style={styles.choice} onPress={() => onHasFeverChange(true)}>
          <View style={[styles.radio, hasFever ? styles.radioActive : null]} />
          <Text style={styles.choiceLabel}>Yes</Text>
        </Pressable>

        <Pressable style={styles.choice} onPress={() => onHasFeverChange(false)}>
          <View style={[styles.radio, !hasFever ? styles.radioActive : null]} />
          <Text style={styles.choiceLabel}>No</Text>
        </Pressable>
      </View>

      <Text style={styles.inputLabel}>Temperature (deg F)</Text>
      <TextInput
        value={temperature}
        onChangeText={onTemperatureChange}
        keyboardType="decimal-pad"
        style={styles.input}
      />
    </CheckInSection>
  );
}

const styles = StyleSheet.create({
  choiceRow: {
    flexDirection: 'row',
    marginBottom: 26,
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#64748B',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  radioActive: {
    borderWidth: 7,
    borderColor: '#0B63B0',
  },
  choiceLabel: {
    fontSize: 14,
    color: '#111827',
  },
  inputLabel: {
    fontSize: 13,
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#6B7280',
  },
});
