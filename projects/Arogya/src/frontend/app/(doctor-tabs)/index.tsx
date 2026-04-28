import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { DoctorHeader } from '@/components/doctor/doctor-header';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <DoctorHeader brandName="Recovery Care" showAvatarLeft rightIcon="notifications" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.welcomeText}>Welcome back, Dr. Miller</Text>
          <Text style={styles.title}>Your Dashboard</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: '#EBF3FB' }]}>
            <Text style={[styles.statNumber, { color: '#0284C7' }]}>12</Text>
            <Text style={styles.statLabel}>ACTIVE</Text>
          </View>
          <View style={[styles.statCard, { borderColor: '#F0FDF4' }]}>
            <Text style={[styles.statNumber, { color: '#16A34A' }]}>04</Text>
            <Text style={styles.statLabel}>NEW</Text>
          </View>
          <View style={[styles.statCard, { borderColor: '#FEF2F2' }]}>
            <Text style={[styles.statNumber, { color: '#DC2626' }]}>02</Text>
            <Text style={styles.statLabel}>TASKS</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Urgent Alerts</Text>
          <View style={styles.badgeCritical}>
            <Text style={styles.badgeCriticalText}>2 Critical</Text>
          </View>
        </View>

        <View style={styles.alertsContainer}>
          <View style={[styles.alertCard, { borderLeftColor: '#DC2626' }]}>
            <View style={styles.alertIconWrapperRed}>
              <MaterialIcons name="warning" size={24} color="#DC2626" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertName}>Sarah J.</Text>
              <Text style={styles.alertDescRed}>Warning: High Pain (Lvl 9)</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.reviewButton}>Review</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.alertCard, { borderLeftColor: '#0284C7' }]}>
            <View style={styles.alertIconWrapperBlue}>
              <MaterialIcons name="air" size={24} color="#0284C7" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertName}>Alex W.</Text>
              <Text style={styles.alertDescDark}>Emergency: Low O2 (88%)</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.reviewButton}>Review</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Consultations</Text>
        </View>

        <View style={styles.consultationsContainer}>
          <View style={styles.consultationRow}>
            <View style={styles.timeBlock}>
              <Text style={styles.timeText}>09:30</Text>
              <Text style={styles.ampmText}>AM</Text>
            </View>
            <View style={styles.consultContent}>
              <Text style={styles.consultName}>Elena Rodriguez</Text>
              <View style={styles.consultTypeRow}>
                <MaterialIcons name="videocam" size={14} color="#64748B" />
                <Text style={styles.consultType}>Video Consultation</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
          </View>
          <View style={styles.divider} />
          <View style={styles.consultationRow}>
            <View style={styles.timeBlock}>
              <Text style={styles.timeText}>11:15</Text>
              <Text style={styles.ampmText}>AM</Text>
            </View>
            <View style={styles.consultContent}>
              <Text style={styles.consultName}>Mark Thompson</Text>
              <View style={styles.consultTypeRow}>
                <MaterialIcons name="local-hospital" size={14} color="#64748B" />
                <Text style={styles.consultType}>In-Clinic Visit</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reports to Verify</Text>
        </View>

        <View style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <MaterialIcons name="description" size={24} color="#475569" style={styles.reportIcon} />
            <View style={styles.reportContent}>
              <View style={styles.reportTitleRow}>
                <Text style={styles.reportTitle} numberOfLines={1}>Discharge Summary - LabCorp</Text>
                <View style={styles.badgeAI}>
                  <Text style={styles.badgeAIText}>AI ASSISTED</Text>
                </View>
              </View>
              <Text style={styles.reportSubtitle}>Patient: Henry G. • Extracted 2h ago</Text>
            </View>
          </View>
          <View style={styles.reportActions}>
            <TouchableOpacity style={styles.verifyButton}>
              <Text style={styles.verifyButtonText}>Verify</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.eyeButton}>
              <MaterialIcons name="visibility" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollView: { flex: 1, backgroundColor: '#FAFBFC' },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 },
  hero: { marginBottom: 24 },
  welcomeText: { fontSize: 16, color: '#64748B', fontWeight: '600', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '700', color: '#0F172A', letterSpacing: -0.5 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '600', color: '#64748B', letterSpacing: 0.5 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  badgeCritical: { backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeCriticalText: { color: '#DC2626', fontSize: 12, fontWeight: '700' },

  alertsContainer: { marginBottom: 32 },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  alertIconWrapperRed: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  alertIconWrapperBlue: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  alertContent: { flex: 1 },
  alertName: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  alertDescRed: { fontSize: 14, color: '#DC2626', fontWeight: '500' },
  alertDescDark: { fontSize: 14, color: '#0F172A', fontWeight: '500' },
  reviewButton: { color: '#0284C7', fontWeight: '700', fontSize: 15 },

  consultationsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  consultationRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 8, marginLeft: 64 },
  timeBlock: { alignItems: 'center', width: 48, marginRight: 16 },
  timeText: { fontSize: 16, fontWeight: '700', color: '#0284C7' },
  ampmText: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
  consultContent: { flex: 1 },
  consultName: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  consultTypeRow: { flexDirection: 'row', alignItems: 'center' },
  consultType: { fontSize: 14, color: '#64748B', marginLeft: 6 },

  reportCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  reportHeader: { flexDirection: 'row', marginBottom: 16 },
  reportIcon: { marginTop: 2, marginRight: 12 },
  reportContent: { flex: 1 },
  reportTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  reportTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', flex: 1, marginRight: 8 },
  badgeAI: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeAIText: { color: '#16A34A', fontSize: 10, fontWeight: '700' },
  reportSubtitle: { fontSize: 13, color: '#64748B' },
  reportActions: { flexDirection: 'row', gap: 12 },
  verifyButton: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#0284C7', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  verifyButtonText: { color: '#0284C7', fontWeight: '700', fontSize: 15 },
  eyeButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, width: 44, alignItems: 'center', justifyContent: 'center' },
});
