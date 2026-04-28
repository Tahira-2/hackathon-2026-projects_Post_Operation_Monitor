import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text } from 'react-native';

type SubmitCheckInButtonProps = {
  label: string;
};

export function SubmitCheckInButton({ label }: SubmitCheckInButtonProps) {
  return (
    <Pressable style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}>
      <MaterialIcons name="check-circle" size={22} color="#FFFFFF" />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: 12,
    backgroundColor: '#0B66AE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
