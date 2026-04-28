import { StyleSheet, TextInput } from 'react-native';

import { CheckInSection } from '@/components/checkin/check-in-section';

type NotesCardProps = {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
};

export function NotesCard({ placeholder, value, onChangeText }: NotesCardProps) {
  return (
    <CheckInSection title="Notes">
      <TextInput
        multiline
        numberOfLines={4}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6B7280"
        style={styles.input}
        textAlignVertical="top"
      />
    </CheckInSection>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 132,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 13,
    lineHeight: 26,
    color: '#111827',
  },
});
