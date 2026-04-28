import { StyleSheet, Switch, Text, View } from 'react-native';

import { CheckInSection } from '@/components/checkin/check-in-section';

type BreathingCardProps = {
  hasIssues: boolean;
  onHasIssuesChange: (value: boolean) => void;
};

export function BreathingCard({ hasIssues, onHasIssuesChange }: BreathingCardProps) {
  return (
    <CheckInSection title="Breathing Issues">
      <Text style={styles.description}>Shortness of breath or difficulty breathing?</Text>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Experiencing issues</Text>
        <Switch
          value={hasIssues}
          onValueChange={onHasIssuesChange}
          trackColor={{ false: '#D7DEE8', true: '#9CC7F5' }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#D7DEE8"
        />
      </View>
    </CheckInSection>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: 13,
    lineHeight: 20,
    color: '#111827',
    marginBottom: 14,
  },
  toggleRow: {
    height: 56,
    borderRadius: 14,
    backgroundColor: '#F3F6FA',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: 14,
    color: '#111827',
  },
});
