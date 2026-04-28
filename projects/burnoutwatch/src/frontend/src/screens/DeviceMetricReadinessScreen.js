import { ScrollView, StyleSheet, Text, View } from 'react-native';

const { EmptyState, Pill, ScreenShell, SectionCard, COLORS } = require('./DeviceMetricChrome');

function StatusRow({ label, value, tone = 'neutral' }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Pill label={value} tone={tone} />
    </View>
  );
}

export function DeviceMetricReadinessScreen({
  availability,
  permissions,
  tabs,
  activeTab,
  onTabChange,
}) {
  const metrics = availability?.metrics ?? {};
  const permissionMetrics = permissions ?? {};
  const isAvailable = availability?.providerAvailable === true;
  const platformMode = availability?.demoMode
    ? 'demo mode'
    : isAvailable
      ? 'development build'
      : 'Expo Go or missing native module';

  return (
    <ScreenShell
      title="Readiness"
      subtitle="A concise view of connector availability, permission state, and missing data."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <SectionCard
          title="Connector state"
          subtitle="Whether the phone can read native health data."
          accent={isAvailable ? 'success' : 'warning'}
        >
          <StatusRow
            label="Provider availability"
            value={isAvailable ? 'available' : 'unavailable'}
            tone={isAvailable ? 'success' : 'warning'}
          />
          <StatusRow
            label="Platform mode"
            value={platformMode}
            tone={availability?.demoMode ? 'warning' : isAvailable ? 'brand' : 'danger'}
          />
        </SectionCard>

        <SectionCard title="Metric availability" subtitle="What came from device vs what is missing." accent="brand">
          {Object.keys(metrics).length ? (
            Object.entries(metrics).map(([key, value]) => (
              <StatusRow
                key={key}
                label={key}
                value={value}
                tone={value === 'present' ? 'success' : value === 'missing' ? 'warning' : 'danger'}
              />
            ))
          ) : (
            <EmptyState
              title="No data yet"
              subtitle="Request permissions and sync to populate the readiness view."
            />
          )}
        </SectionCard>

        <SectionCard title="Permission state" subtitle="Per-metric grant/deny status." accent="warning">
          {Object.keys(permissionMetrics).length ? (
            Object.entries(permissionMetrics).map(([key, value]) => (
              <StatusRow
                key={key}
                label={key}
                value={value}
                tone={value === 'granted' ? 'success' : value === 'denied' ? 'danger' : 'neutral'}
              />
            ))
          ) : (
            <EmptyState
              title="Permissions not requested"
              subtitle="Tap Request Permissions on the Overview screen to populate this list."
            />
          )}
        </SectionCard>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  row: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  label: {
    color: COLORS.text,
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    paddingRight: 12,
  },
});
