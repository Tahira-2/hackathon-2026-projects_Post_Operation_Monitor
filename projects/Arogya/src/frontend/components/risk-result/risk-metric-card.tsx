import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

import type { RiskMetric } from '@/types/app-data';

type RiskMetricCardProps = {
  metric: RiskMetric;
};

export function RiskMetricCard({ metric }: RiskMetricCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <MaterialIcons name={metric.icon} size={22} color={metric.iconColor} />
        <Text style={[styles.title, { color: metric.iconColor }]}>{metric.title}</Text>
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.value}>{metric.value}</Text>
        {metric.unit ? <Text style={styles.unit}>{metric.unit}</Text> : null}
      </View>

      <View style={[styles.badge, { backgroundColor: metric.badgeBackground }]}>
        <Text style={[styles.badgeText, { color: metric.badgeColor }]}>{metric.badgeLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 164,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D6E2EF',
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  title: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 1.2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 18,
  },
  value: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '500',
    color: '#111827',
  },
  unit: {
    marginLeft: 6,
    marginBottom: 3,
    fontSize: 12,
    color: '#334155',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
