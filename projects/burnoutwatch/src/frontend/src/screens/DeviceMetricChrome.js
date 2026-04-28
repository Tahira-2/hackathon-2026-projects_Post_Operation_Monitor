import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

const { COLORS, SHADOW } = require('./deviceMetricTheme');

function BrandMark() {
  return (
    <View style={styles.brandMark}>
      <Text style={styles.brandText}>BW</Text>
      <Text style={styles.brandPlus}>+</Text>
    </View>
  );
}

function ScreenShell({ children, title, subtitle, tabs, activeTab, onTabChange }) {
  return (
    <View style={styles.screen}>
      <View style={styles.backdropGlow} />
      <View style={styles.backdropOrbOne} />
      <View style={styles.backdropOrbTwo} />
      <View style={styles.inner}>
        <View style={styles.hero}>
          <BrandMark />
          <Text style={styles.eyebrow}>BurnoutWatch</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {tabs?.length ? <SegmentedTabs tabs={tabs} value={activeTab} onChange={onTabChange} /> : null}
        {children}
      </View>
    </View>
  );
}

function SectionCard({ title, subtitle, children, accent = 'brand' }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardAccent, { backgroundColor: COLORS[accent] ?? COLORS.brand }]} />
        <View style={styles.cardHeaderText}>
          <Text style={styles.cardTitle}>{title}</Text>
          {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

function Pill({ label, tone = 'neutral' }) {
  const toneStyles = {
    success: { backgroundColor: '#dcfce7', color: '#166534' },
    warning: { backgroundColor: '#fef3c7', color: '#92400e' },
    danger: { backgroundColor: '#fee2e2', color: '#991b1b' },
    neutral: { backgroundColor: '#e2e8f0', color: '#334155' },
    brand: { backgroundColor: '#dbeff1', color: COLORS.brandDark },
  };

  const activeTone = toneStyles[tone] ?? toneStyles.neutral;
  return (
    <View style={[styles.pill, { backgroundColor: activeTone.backgroundColor }]}>
      <Text style={[styles.pillText, { color: activeTone.color }]}>{label}</Text>
    </View>
  );
}

function SegmentedTabs({ tabs, value, onChange }) {
  const { width } = useWindowDimensions();
  const compact = width < 420;

  return (
    <View style={[styles.segmentWrap, compact && styles.segmentWrapCompact]}>
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <Pressable
            accessibilityRole="button"
            android_ripple={{ color: selected ? '#dbeff1' : 'rgba(255,255,255,0.18)' }}
            key={tab.value}
            onPress={() => onChange(tab.value)}
            style={({ pressed }) => [
              styles.segment,
              selected && styles.segmentSelected,
              compact && styles.segmentCompact,
              pressed && styles.segmentPressed,
            ]}
          >
            <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MetricTile({ label, value, subtext, tone = 'brand' }) {
  const toneStyles = {
    brand: { backgroundColor: '#ecfeff', borderColor: '#99f6e4', color: COLORS.brandDark },
    success: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', color: '#166534' },
    warning: { backgroundColor: '#fffbeb', borderColor: '#fde68a', color: '#92400e' },
    danger: { backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#991b1b' },
    neutral: { backgroundColor: '#f8fafc', borderColor: '#dbe4ee', color: COLORS.text },
  };

  const active = toneStyles[tone] ?? toneStyles.neutral;

  return (
    <View style={[styles.tile, { backgroundColor: active.backgroundColor, borderColor: active.borderColor }]}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={[styles.tileValue, { color: active.color }]}>{value}</Text>
      {subtext ? <Text style={styles.tileSubtext}>{subtext}</Text> : null}
    </View>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.brandDeep,
    flex: 1,
  },
  backdropGlow: {
    backgroundColor: COLORS.brand,
    borderRadius: 420,
    height: 420,
    opacity: 0.22,
    position: 'absolute',
    right: -160,
    top: -120,
    width: 420,
  },
  backdropOrbOne: {
    backgroundColor: '#ffffff',
    borderRadius: 320,
    height: 320,
    opacity: 0.08,
    position: 'absolute',
    right: -60,
    top: 40,
    width: 320,
  },
  backdropOrbTwo: {
    backgroundColor: '#ffffff',
    borderRadius: 220,
    height: 220,
    opacity: 0.08,
    position: 'absolute',
    left: -100,
    top: 240,
    width: 220,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 20,
    width: '100%',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 16,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    height: 84,
    justifyContent: 'center',
    marginBottom: 10,
    width: 84,
    ...SHADOW,
  },
  brandText: {
    color: COLORS.brand,
    fontSize: 25,
    fontWeight: '900',
    position: 'absolute',
    top: 24,
  },
  brandPlus: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    position: 'absolute',
    top: 35,
  },
  eyebrow: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.6,
    opacity: 0.88,
    textTransform: 'uppercase',
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 560,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
    ...SHADOW,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 14,
  },
  cardAccent: {
    borderRadius: 999,
    height: 12,
    marginRight: 10,
    width: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  segmentWrap: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    padding: 8,
  },
  segmentWrapCompact: {
    flexDirection: 'column',
  },
  segment: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 14,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingVertical: 11,
  },
  segmentCompact: {
    flex: 0,
  },
  segmentSelected: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  segmentPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  segmentText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    fontWeight: '800',
  },
  segmentTextSelected: {
    color: COLORS.brandDark,
  },
  tile: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
  },
  tileLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  tileValue: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 8,
  },
  tileSubtext: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  emptyState: {
    backgroundColor: COLORS.surfaceSoft,
    borderColor: COLORS.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
});

module.exports = {
  EmptyState,
  MetricTile,
  Pill,
  ScreenShell,
  SegmentedTabs,
  SectionCard,
  COLORS,
  SHADOW,
};
