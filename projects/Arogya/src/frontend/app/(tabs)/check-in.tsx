import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import { BreathingCard } from '@/components/checkin/breathing-card';
import { HomeHeader } from '@/components/home/home-header';
import { CheckInSection } from '@/components/checkin/check-in-section';
import { FeverCard } from '@/components/checkin/fever-card';
import { NotesCard } from '@/components/checkin/notes-card';
import { PainLevelCard } from '@/components/checkin/pain-level-card';
import { SubmitCheckInButton } from '@/components/checkin/submit-checkin-button';
import { SymptomChip } from '@/components/checkin/symptom-chip';
import { useAsyncData } from '@/hooks/use-asynce-data';
import { getCheckInForm } from '@/services/checkin';

export default function DailyCheckInScreen() {
  const { data, isLoading, error } = useAsyncData(getCheckInForm);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [painLevel, setPainLevel] = useState(5);
  const [hasFever, setHasFever] = useState(false);
  const [temperature, setTemperature] = useState('98.6');
  const [hasBreathingIssues, setHasBreathingIssues] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!data) return;
    setSelectedSymptoms(data.selectedSymptoms);
    setPainLevel(data.painLevel);
    setHasFever(data.hasFever);
    setTemperature(data.temperature);
    setHasBreathingIssues(data.hasBreathingIssues);
    setNotes(data.notes);
  }, [data]);

  const symptomSet = useMemo(() => new Set(selectedSymptoms), [selectedSymptoms]);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <HomeHeader brandName="CareLoop" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.title}>{data?.title ?? 'Daily Check-in'}</Text>
          <Text style={styles.subtitle}>
            {data?.subtitle ?? 'How are you feeling today?'}
          </Text>
        </View>

        {error ? <Text style={styles.errorText}>Unable to load check-in form right now.</Text> : null}
        {isLoading && !data ? (
          <Text style={styles.loadingText}>Loading check-in form...</Text>
        ) : null}

        <CheckInSection title="Current Symptoms">
          <View style={styles.symptomGrid}>
            {(data?.symptomOptions ?? []).map((symptom) => (
              <SymptomChip
                key={symptom.id}
                label={symptom.label}
                icon={symptom.icon}
                selected={symptomSet.has(symptom.id)}
                onPress={() => toggleSymptom(symptom.id)}
              />
            ))}
          </View>
        </CheckInSection>

        <PainLevelCard value={painLevel} onValueChange={setPainLevel} />

        <FeverCard
          hasFever={hasFever}
          temperature={temperature}
          onHasFeverChange={setHasFever}
          onTemperatureChange={setTemperature}
        />

        <BreathingCard
          hasIssues={hasBreathingIssues}
          onHasIssuesChange={setHasBreathingIssues}
        />

        <NotesCard
          placeholder="How are you managing? Any specific concerns for your doctor?"
          value={notes}
          onChangeText={setNotes}
        />

        <SubmitCheckInButton label="Submit Check-in" />
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
  hero: {
    marginBottom: 2,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
  },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: -14,
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
