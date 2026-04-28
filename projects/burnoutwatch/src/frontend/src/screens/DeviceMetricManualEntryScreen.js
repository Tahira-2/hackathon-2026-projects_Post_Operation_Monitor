import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';

const { normalizeManualForm } = require('../metrics/manualForm');
const { ScreenShell, SectionCard, Pill, COLORS } = require('./DeviceMetricChrome');
const { formatLocalDate } = require('../metrics/dateUtils');

const RATING_OPTIONS = {
  sleepQualityManual: [1, 2, 3, 4, 5],
  fatigueRating: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  stressRating: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
};

function NumericField({ label, value, onChangeText, placeholder }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        keyboardType="decimal-pad"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        style={styles.input}
        value={value}
      />
    </View>
  );
}

function RatingField({ label, value, options, onSelect }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.ratingWrap}>
        {options.map((option) => {
          const selected = String(option) === String(value);
          return (
            <Pressable
              accessibilityRole="button"
              android_ripple={{ color: selected ? '#5A9BA1' : '#dbeff1' }}
              key={option}
              onPress={() => onSelect(String(option))}
              style={({ pressed }) => [
                styles.ratingButton,
                selected && styles.ratingButtonSelected,
                pressed && styles.ratingButtonPressed,
              ]}
            >
              <Text style={[styles.ratingText, selected && styles.ratingTextSelected]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function createDefaultManualForm() {
  return {
    localDate: formatLocalDate(new Date()),
    sleepDurationHours: '',
    sleepQualityManual: '',
    shiftCount: '',
    overtimeHours: '',
    fatigueRating: '',
    stressRating: '',
  };
}

export function DeviceMetricManualEntryScreen({
  form,
  onChange,
  onSubmit,
  onCancel,
  submitState,
  tabs,
  activeTab,
  onTabChange,
}) {
  const { width } = useWindowDimensions();
  const validation = normalizeManualForm(form);
  const canSubmit = !submitState.submitting && validation.errors.length === 0;
  const compactActions = width < 420;

  return (
    <ScreenShell
      title="Manual Entry"
      subtitle="Capture work and recovery metrics when device data is partial or unavailable."
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <SectionCard title="Daily details" subtitle="Use the worker's local date." accent="brand">
          <View style={styles.dateRow}>
            <View style={styles.dateCopy}>
              <Text style={styles.label}>Local date</Text>
              <TextInput
                autoCapitalize="none"
                onChangeText={(value) => onChange({ localDate: value })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                value={form.localDate}
              />
            </View>
            <Pill label="manual" tone="warning" />
          </View>
        </SectionCard>

        <SectionCard title="Recovery" subtitle="Manual health fields only fill device gaps." accent="success">
          <NumericField
            label="Sleep duration hours"
            onChangeText={(value) => onChange({ sleepDurationHours: value })}
            placeholder="7.5"
            value={form.sleepDurationHours}
          />
          <RatingField
            label="Sleep quality"
            onSelect={(value) => onChange({ sleepQualityManual: value })}
            options={RATING_OPTIONS.sleepQualityManual}
            value={form.sleepQualityManual}
          />
        </SectionCard>

        <SectionCard title="Workload" subtitle="These work metrics are authoritative in v1." accent="warning">
          <NumericField
            label="Shift count"
            onChangeText={(value) => onChange({ shiftCount: value })}
            placeholder="1"
            value={form.shiftCount}
          />
          <NumericField
            label="Overtime hours"
            onChangeText={(value) => onChange({ overtimeHours: value })}
            placeholder="2"
            value={form.overtimeHours}
          />
        </SectionCard>

        <SectionCard title="Self report" subtitle="Keep ratings quick and consistent." accent="brand">
          <RatingField
            label="Fatigue rating"
            onSelect={(value) => onChange({ fatigueRating: value })}
            options={RATING_OPTIONS.fatigueRating}
            value={form.fatigueRating}
          />
          <RatingField
            label="Stress rating"
            onSelect={(value) => onChange({ stressRating: value })}
            options={RATING_OPTIONS.stressRating}
            value={form.stressRating}
          />
        </SectionCard>

        {submitState.error ? <Text style={styles.errorText}>{submitState.error}</Text> : null}
        {validation.errors.length ? (
          <View style={styles.validationBox}>
            {validation.errors.map((error) => (
              <Text key={error} style={styles.validationText}>{error}</Text>
            ))}
          </View>
        ) : null}

        <View style={[styles.actionRow, compactActions && styles.actionRowCompact]}>
          <Pressable
            accessibilityRole="button"
            android_ripple={{ color: '#cbd5e1' }}
            onPress={onCancel}
            style={({ pressed }) => [
              styles.secondaryButton,
              compactActions && styles.actionButtonCompact,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            android_ripple={{ color: '#5A9BA1' }}
            disabled={!canSubmit}
            onPress={() => onSubmit(validation.manualInput)}
            style={({ pressed }) => [
              styles.primaryButton,
              compactActions && styles.actionButtonCompact,
              !canSubmit && styles.buttonDisabled,
              pressed && canSubmit && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {submitState.submitting ? 'Saving...' : 'Save Manual Metrics'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  dateRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 12,
  },
  dateCopy: {
    flex: 1,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  ratingWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingButton: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: COLORS.border,
    borderRadius: 14,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    minWidth: 42,
    paddingHorizontal: 12,
  },
  ratingButtonSelected: {
    backgroundColor: COLORS.brand,
    borderColor: COLORS.brand,
  },
  ratingButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.96 }],
  },
  ratingText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '800',
  },
  ratingTextSelected: {
    color: '#ffffff',
  },
  validationBox: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  validationText: {
    color: '#9a3412',
    fontSize: 12,
    lineHeight: 18,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionRowCompact: {
    flexDirection: 'column',
  },
  actionButtonCompact: {
    flex: 0,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: COLORS.brand,
    borderRadius: 16,
    flex: 1.4,
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
    flex: 0.8,
    justifyContent: 'center',
    minHeight: 48,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
});
