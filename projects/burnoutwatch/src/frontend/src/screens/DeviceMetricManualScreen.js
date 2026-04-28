import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

const { EmptyState, MetricTile, Pill, ScreenShell, SectionCard, COLORS } = require('./DeviceMetricChrome');

export function DeviceMetricManualScreen({
  canonicalSummaries,
  onOpenManualEntry,
  tabs,
  activeTab,
  onTabChange,
}) {
  const { width } = useWindowDimensions();
  const latestSummary = canonicalSummaries[0];
  const compactGrid = width < 420;

  return (
    <ScreenShell
      title="Manual Fallback"
      subtitle="Work metrics stay usable even when device health access is missing or denied."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <SectionCard
          title="Why this matters"
          subtitle="The worker should never be blocked by a missing connector."
          accent="warning"
        >
          <View style={styles.headerRow}>
            <Pill label="manual first" tone="warning" />
            <Pill label="health gap aware" tone="brand" />
          </View>
          <Text style={styles.body}>
            Shift count, overtime hours, fatigue rating, and stress rating are always available manually.
            If device health is unavailable, this screen becomes the worker's fallback path.
          </Text>
        </SectionCard>

        <SectionCard title="Manual metrics" subtitle="Fields captured outside device integrations." accent="brand">
          <View style={styles.grid}>
            <View style={[styles.gridItem, compactGrid && styles.gridItemCompact]}>
              <MetricTile label="Shift count" value={latestSummary?.shift_count ?? '--'} tone="brand" />
            </View>
            <View style={[styles.gridItem, compactGrid && styles.gridItemCompact]}>
              <MetricTile label="Overtime" value={latestSummary?.overtime_hours ?? '--'} tone="warning" />
            </View>
            <View style={[styles.gridItem, compactGrid && styles.gridItemCompact]}>
              <MetricTile label="Fatigue" value={latestSummary?.fatigue_rating ?? '--'} tone="success" />
            </View>
            <View style={[styles.gridItem, compactGrid && styles.gridItemCompact]}>
              <MetricTile label="Stress" value={latestSummary?.stress_rating ?? '--'} tone="danger" />
            </View>
          </View>
        </SectionCard>

        <SectionCard title="Fallback summary" subtitle="What the backend will keep canonical." accent="success">
          {latestSummary ? (
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLine}>Latest local date: {latestSummary.local_date}</Text>
              <Text style={styles.summaryLine}>Source platform: {latestSummary.source_platform}</Text>
              <Text style={styles.summaryLine}>
                Manual source fields: {Object.keys(latestSummary.field_sources ?? {}).length}
              </Text>
            </View>
          ) : (
            <EmptyState
              title="No summary yet"
              subtitle="Sync or manually enter work data to see the canonical fallback state."
            />
          )}
        </SectionCard>

        <Pressable
          accessibilityRole="button"
          android_ripple={{ color: '#5A9BA1' }}
          onPress={onOpenManualEntry}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <Text style={styles.ctaText}>Enter Manual Metrics</Text>
        </Pressable>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  body: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 23,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridItem: {
    padding: 6,
    width: '50%',
  },
  gridItemCompact: {
    width: '100%',
  },
  summaryBox: {
    backgroundColor: '#f8fafc',
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  summaryLine: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  cta: {
    alignItems: 'center',
    backgroundColor: COLORS.brand,
    borderRadius: 18,
    minHeight: 50,
    justifyContent: 'center',
    paddingVertical: 15,
  },
  ctaPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
