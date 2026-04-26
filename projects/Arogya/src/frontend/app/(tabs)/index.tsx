import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckInCard } from '@/components/home/check-in-card';
import { DoctorMessageCard } from '@/components/home/doctor-message-card';
import { EmergencyButton } from '@/components/home/emergency-button';
import { HomeHeader } from '@/components/home/home-header';
import { MedicationCard } from '@/components/home/medication-card';
import { SectionCard } from '@/components/home/section-card';
import { StatusCard } from '@/components/home/status-card';
import { VitalsGrid } from '@/components/home/vitals-grid';
import { useAsyncData } from '@/hooks/use-asynce-data';
import { getHomeSummary } from '@/services/home';

export default function HomeScreen() {
  const router = useRouter();
  const { data, isLoading, error } = useAsyncData(getHomeSummary);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <HomeHeader brandName="CareLoop" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.title}>Hello, {data?.greetingName ?? '...'}</Text>
          <Text style={styles.subtitle}>
            {data?.summaryText ?? 'Loading your health summary...'}
          </Text>
        </View>

        {error ? <Text style={styles.errorText}>Unable to load home data right now.</Text> : null}

        {isLoading || !data ? (
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>Loading home summary...</Text>
          </View>
        ) : (
          <>
            <MedicationCard
              label={data.medication.label}
              medication={data.medication.name}
              dueText={data.medication.dueText}
              actionLabel={data.medication.actionLabel}
            />

            <StatusCard title={data.recoveryStatus.title} value={data.recoveryStatus.value} />

            <CheckInCard
              title={data.checkIn.title}
              value={data.checkIn.value}
              actionLabel={data.checkIn.actionLabel}
              onPress={() => router.push('/check-in')}
            />

            <SectionCard title="Vitals History" actionLabel="View Details">
              <VitalsGrid items={data.vitals} />
            </SectionCard>

            <DoctorMessageCard
              title={data.doctorMessage.title}
              message={data.doctorMessage.message}
            />

            <EmergencyButton label={data.emergencyLabel} />
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
    paddingTop: 28,
    paddingBottom: 24,
    gap: 18,
  },
  hero: {
    marginBottom: 2,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.7,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
  },
  placeholderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E4EBF3',
    padding: 18,
  },
  placeholderText: {
    fontSize: 15,
    color: '#64748B',
  },
  errorText: {
    fontSize: 14,
    color: '#B91C1C',
    marginBottom: 4,
  },
});
