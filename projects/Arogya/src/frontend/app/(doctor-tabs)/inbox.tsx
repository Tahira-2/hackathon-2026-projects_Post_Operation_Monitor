import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { DoctorHeader } from '@/components/doctor/doctor-header';

export default function InboxScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <DoctorHeader brandName="ClinicalHub" leftIcon="menu" showAvatarRight />

      <View style={styles.container}>
        <View style={styles.emptyState}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="mark-email-read" size={48} color="#94A3B8" />
          </View>
          <Text style={styles.title}>All caught up!</Text>
          <Text style={styles.subtitle}>You have no new messages in your inbox.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', paddingHorizontal: 40 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', lineHeight: 24 },
});
