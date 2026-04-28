import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PhysicianInsightCard } from '@/components/risk-result/physician-insight-card';
import { RiskActionButton } from '@/components/risk-result/risk-action-button';
import { RiskMetricCard } from '@/components/risk-result/risk-metric-card';
import { RiskResultHeader } from '@/components/risk-result/risk-result-header';
import { RiskResultHero } from '@/components/risk-result/risk-result-hero';
import { SupportNoteCard } from '@/components/risk-result/support-note-card';
import { useAsyncData } from '@/hooks/use-asynce-data';
import { getRiskResultSummary } from '@/services/risk';

export default function RiskResultScreen() {
  const { data, isLoading, error } = useAsyncData(getRiskResultSummary);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <RiskResultHeader brandName="CareLoop" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <RiskResultHero
          title={data?.title ?? 'Warning'}
          message={data?.message ?? 'Loading risk result...'}
        />

        {error ? <Text style={styles.errorText}>Unable to load risk result right now.</Text> : null}
        {isLoading && !data ? (
          <Text style={styles.loadingText}>Loading risk result...</Text>
        ) : null}

        <View style={styles.metricRow}>
          {(data?.metrics ?? []).map((metric) => (
            <RiskMetricCard key={metric.id} metric={metric} />
          ))}
        </View>

        <PhysicianInsightCard
          title={data?.physicianInsightTitle ?? "Physician's Insight"}
          message={data?.physicianInsightMessage ?? ''}
        />

        <RiskActionButton
          icon="medical-services"
          label={data?.primaryActionLabel ?? 'Chat with Doctor'}
        />

        <RiskActionButton
          icon="emergency"
          label={data?.secondaryActionLabel ?? 'View Emergency Info'}
          variant="secondary"
        />

        <SupportNoteCard
          message={data?.supportMessage ?? 'Support message unavailable at the moment.'}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFEFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 24,
    gap: 18,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 14,
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
});
