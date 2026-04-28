import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeHeader } from '@/components/home/home-header';
import { ProfileHero } from '@/components/profile/profile-hero';
import { ProfileStatCard } from '@/components/profile/profile-stat-card';
import { SettingsCard } from '@/components/profile/settings-card';
import { SettingsItem } from '@/components/profile/settings-item';
import { useAsyncData } from '@/hooks/use-asynce-data';
import { getProfileSummary } from '@/services/profile';

export default function ProfileScreen() {
  const { data, isLoading, error } = useAsyncData(getProfileSummary);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <HomeHeader brandName="CareLoop" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <ProfileHero name={data?.name ?? 'Loading...'} patientId={data?.patientId ?? '--'} />

        {error ? <Text style={styles.errorText}>Unable to load profile right now.</Text> : null}

        {isLoading || !data ? (
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>Loading profile details...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              {data.stats.map((stat) => (
                <ProfileStatCard
                  key={stat.title}
                  title={stat.title}
                  value={stat.value}
                  valueColor={stat.valueColor}
                  trend={stat.trend}
                />
              ))}
            </View>

            <SettingsCard>
              {data.settingsItems.map((item, index) => (
                <View key={item.id}>
                  <SettingsItem
                    icon={item.icon}
                    title={item.title}
                    iconBackground={item.iconBackground}
                    iconColor={item.iconColor}
                    badgeLabel={item.badgeLabel}
                    danger={item.danger}
                  />
                  {index < data.settingsItems.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              ))}
            </SettingsCard>

            <Text style={styles.footer}>{data.footerText}</Text>
          </>
        )}
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
    paddingTop: 24,
    paddingBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#E7EDF4',
    marginLeft: 68,
  },
  footer: {
    marginTop: 26,
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  placeholderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E4EBF3',
    padding: 18,
    marginBottom: 22,
  },
  placeholderText: {
    fontSize: 15,
    color: '#64748B',
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
    marginBottom: 12,
  },
});
