import { StyleSheet, Text, View } from 'react-native';

type VitalItem = {
  id: string;
  label: string;
  value: string;
  unit: string;
};

type VitalsGridProps = {
  items: VitalItem[];
};

export function VitalsGrid({ items }: VitalsGridProps) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.label}>{item.label}</Text>
          <View style={styles.valueRow}>
            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.unit}>{item.unit}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 14,
  },
  card: {
    flex: 1,
    backgroundColor: '#F2F0F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  label: {
    fontSize: 15,
    letterSpacing: 0.6,
    color: '#374151',
    marginBottom: 12,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '700',
    color: '#111827',
  },
  unit: {
    marginLeft: 6,
    marginBottom: 2,
    fontSize: 14,
    color: '#374151',
  },
});
