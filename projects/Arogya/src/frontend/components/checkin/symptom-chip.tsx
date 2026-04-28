import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text } from 'react-native';

type SymptomChipProps = {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  selected?: boolean;
  onPress?: () => void;
};

export function SymptomChip({ label, icon, selected = false, onPress }: SymptomChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected ? styles.cardSelected : null,
        pressed ? styles.cardPressed : null,
      ]}>
      <MaterialIcons name={icon} size={28} color={selected ? '#0B63B0' : '#111827'} />
      <Text style={[styles.label, selected ? styles.labelSelected : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '30%',
    minWidth: 88,
    backgroundColor: '#F8FBFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4EBF3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  cardSelected: {
    backgroundColor: '#EAF3FF',
    borderColor: '#B8D4FB',
  },
  cardPressed: {
    opacity: 0.85,
  },
  label: {
    marginTop: 10,
    fontSize: 12,
    color: '#111827',
  },
  labelSelected: {
    color: '#0B63B0',
    fontWeight: '600',
  },
});
