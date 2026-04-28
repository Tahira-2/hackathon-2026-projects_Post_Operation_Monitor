import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';

const {
  EmptyState,
  MetricTile,
  Pill,
  ScreenShell,
  SectionCard,
  COLORS,
} = require('./DeviceMetricChrome');

function formatMetric(value, suffix = '') {
  if (value === null || value === undefined) {
    return '--';
  }

  return `${value}${suffix}`;
}

function MetricGrid({ summary }) {
  const { width } = useWindowDimensions();
  const compact = width < 520;
  const columns = compact ? 1 : 2;
  const tiles = [
    { label: 'Sleep', value: formatMetric(summary?.sleep_duration_hours, 'h'), tone: 'brand' },
    { label: 'Steps', value: summary?.step_count ?? '--', tone: 'success' },
    { label: 'Resting HR', value: summary?.resting_heart_rate_bpm ?? '--', tone: 'warning' },
    { label: 'HRV', value: summary?.heart_rate_variability_ms ?? '--', tone: 'neutral' },
    { label: 'Activity', value: formatMetric(summary?.activity_minutes, 'm'), tone: 'brand' },
    { label: 'Workouts', value: summary?.workout_count ?? '--', tone: 'success' },
  ];

  return (
    <View style={styles.metricGrid}>
      {tiles.map((tile) => (
        <View key={tile.label} style={{ width: `${100 / columns}%`, padding: 6 }}>
          <MetricTile {...tile} />
        </View>
      ))}
    </View>
  );
}

function SummaryList({ summaries }) {
  if (!summaries.length) {
    return (
      <EmptyState
        title="No synced summaries yet"
        subtitle="Set a worker ID and tap Sync Last 7 Days to pull the latest HealthKit or Health Connect data into the backend."
      />
    );
  }

  return (
    <View style={styles.summaryList}>
      {summaries.slice(0, 3).map((summary) => (
        <View key={`${summary.worker_id}-${summary.local_date}`} style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <Text style={styles.summaryDate}>{summary.local_date}</Text>
            <Pill
              label={summary.source_platform.replace('_', ' ')}
              tone={summary.source_platform === 'manual' ? 'neutral' : 'brand'}
            />
          </View>
          <Text style={styles.summaryMeta}>
            device fields: {summary.field_sources ? Object.values(summary.field_sources).length : 0}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function DeviceMetricOverviewScreen({
  workerId,
  onWorkerIdChange,
  onRequestPermissions,
  onSync,
  syncState,
  metricsApiClient,
  statusMessage,
  availability,
  canonicalSummaries,
  burnoutScoreResult,
  tabs,
  activeTab,
  onTabChange,
}) {
  const { width } = useWindowDimensions();
  const latestSummary = canonicalSummaries[0];
  const compactActions = width < 420;
  const requestingDisabled = syncState.requesting || syncState.loading;
  const syncingDisabled = syncState.syncing || syncState.loading;
  const connectorTone =
    availability?.providerAvailable === true ? 'success' : syncState.loading ? 'warning' : 'danger';
  const connectorLabel =
    availability?.demoMode
      ? 'Demo connector'
      : availability?.providerAvailable === true
      ? 'Connector ready'
      : syncState.loading
        ? 'Checking connector'
        : 'Connector unavailable';

  return (
    <ScreenShell
      title="Device Metric Sync"
      subtitle="A calm, responsive dashboard for health ingestion, manual fallback, and backend sync."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <SectionCard
          title="Sync status"
          subtitle="The worker sees exactly what the system is doing."
          accent="brand"
        >
          <View style={styles.statusRow}>
            <Pill label={connectorLabel} tone={connectorTone} />
            <Pill label={Platform.OS} tone="neutral" />
          </View>
          <Text style={styles.statusText}>{statusMessage}</Text>
          <Text style={styles.helper}>API base URL: {metricsApiClient.baseUrl}</Text>
        </SectionCard>

        <SectionCard title="Worker identity" subtitle="Stored locally until real auth exists." accent="brand">
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={onWorkerIdChange}
            placeholder="worker-123"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={workerId}
          />
          <View style={[styles.buttonRow, compactActions && styles.buttonRowCompact]}>
            <Pressable
              accessibilityRole="button"
              android_ripple={{ color: '#cbd5e1' }}
              disabled={requestingDisabled}
              onPress={onRequestPermissions}
              style={({ pressed }) => [
                styles.secondaryButton,
                compactActions && styles.buttonCompact,
                requestingDisabled && styles.buttonDisabled,
                pressed && !requestingDisabled && styles.buttonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>
                {syncState.requesting ? 'Requesting...' : 'Request Permissions'}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              android_ripple={{ color: '#5A9BA1' }}
              disabled={syncingDisabled}
              onPress={onSync}
              style={({ pressed }) => [
                styles.primaryButton,
                compactActions && styles.buttonCompact,
                syncingDisabled && styles.buttonDisabled,
                pressed && !syncingDisabled && styles.buttonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {syncState.syncing ? 'Syncing...' : 'Sync Last 7 Days'}
              </Text>
            </Pressable>
          </View>
        </SectionCard>

        <SectionCard title="Today at a glance" subtitle="Canonical device data returned from the backend." accent="success">
          <MetricGrid summary={latestSummary} />
        </SectionCard>

        <SectionCard title="Burnout score" subtitle="Final aggregate score from device and manual metrics." accent="warning">
          <View style={styles.scoreRow}>
            <View>
              <Text style={styles.scoreValue}>
                {burnoutScoreResult ? `${burnoutScoreResult.burnout_score}/100` : '--'}
              </Text>
              <Text style={styles.scoreMeta}>
                {burnoutScoreResult
                  ? `${burnoutScoreResult.risk_tier} risk - ${Math.round(burnoutScoreResult.confidence * 100)}% confidence`
                  : 'Sync metrics to calculate risk'}
              </Text>
            </View>
            <Pill label={burnoutScoreResult?.risk_tier ?? 'pending'} tone={burnoutScoreResult ? 'warning' : 'neutral'} />
          </View>
        </SectionCard>

        <SectionCard title="Merge timeline" subtitle="How the app handles each sync." accent="warning">
          <View style={styles.timelineRow}>
            <TimelineStep active label="Request permissions" detail="HealthKit or Health Connect" />
            <TimelineStep active label="Read device data" detail="Phone-only health store" />
            <TimelineStep active label="Merge canonical summary" detail="Device wins for health" />
            <TimelineStep active label="Upload backend record" detail="Ready for scoring" />
          </View>
        </SectionCard>

        <SectionCard title="Recent summaries" subtitle="Latest days returned from the API." accent="brand">
          <SummaryList summaries={canonicalSummaries} />
        </SectionCard>
      </ScrollView>
    </ScreenShell>
  );
}

function TimelineStep({ label, detail, active }) {
  return (
    <View style={styles.timelineStep}>
      <View style={[styles.timelineDot, active && styles.timelineDotActive]} />
      <Text style={styles.timelineLabel}>{label}</Text>
      <Text style={styles.timelineDetail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  statusText: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
  },
  helper: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonRowCompact: {
    flexDirection: 'column',
  },
  buttonCompact: {
    flex: 0,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: COLORS.brand,
    borderRadius: 16,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  buttonDisabled: {
    opacity: 0.48,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  summaryList: {
    gap: 10,
  },
  summaryCard: {
    backgroundColor: '#f8fafc',
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
  },
  summaryTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryDate: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },
  summaryMeta: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 8,
  },
  scoreMeta: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  scoreRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreValue: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '900',
  },
  timelineRow: {
    gap: 10,
  },
  timelineStep: {
    backgroundColor: '#f8fafc',
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
  },
  timelineDot: {
    backgroundColor: COLORS.neutral,
    borderRadius: 999,
    height: 10,
    marginBottom: 10,
    width: 10,
  },
  timelineDotActive: {
    backgroundColor: COLORS.brand,
  },
  timelineLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  timelineDetail: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
});
