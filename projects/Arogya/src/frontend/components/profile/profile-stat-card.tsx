import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

type ProfileStatCardProps = {
  title: string;
  value: string;
  valueColor?: string;
  trend?: boolean;
};

export function ProfileStatCard({
  title,
  value,
  valueColor = '#0B63B0',
  trend = false,
}: ProfileStatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
        {trend ? <MaterialIcons name="trending-up" size={22} color="#0A7A25" /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E4EBF3',
    paddingHorizontal: 18,
    paddingVertical: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 1.1,
    color: '#6B7280',
    marginBottom: 12,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    marginRight: 8,
  },
});
