import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text } from 'react-native';

type RiskActionButtonProps = {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  variant?: 'primary' | 'secondary';
};

export function RiskActionButton({
  label,
  icon,
  variant = 'primary',
}: RiskActionButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable style={({ pressed }) => [styles.button, isPrimary ? styles.primary : styles.secondary, pressed ? styles.pressed : null]}>
      <MaterialIcons
        name={icon}
        size={22}
        color={isPrimary ? '#FFFFFF' : '#C81E1E'}
      />
      <Text style={[styles.label, isPrimary ? styles.primaryLabel : styles.secondaryLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 58,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  primary: {
    backgroundColor: '#0B66AE',
    borderColor: '#0B66AE',
  },
  secondary: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D6E2EF',
  },
  pressed: {
    opacity: 0.88,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  primaryLabel: {
    color: '#FFFFFF',
  },
  secondaryLabel: {
    color: '#C81E1E',
  },
});
