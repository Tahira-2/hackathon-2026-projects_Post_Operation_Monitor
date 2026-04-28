import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';

import { DoctorHeader } from '@/components/doctor/doctor-header';

export default function ScheduleScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <DoctorHeader brandName="ClinicalHub" leftIcon="menu" rightIcon="search" showAvatarRight />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerRow}>
          <Text style={styles.title}>Daily Schedule</Text>
          <View style={styles.toggleGroup}>
            <TouchableOpacity style={[styles.toggleBtn, styles.toggleBtnActive]}>
              <Text style={styles.toggleBtnTextActive}>Day</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toggleBtn}>
              <Text style={styles.toggleBtnText}>Week</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.dateSubtitle}>Monday, October 23, 2023</Text>

        <View style={styles.dayPicker}>
          <TouchableOpacity style={styles.dayItem}>
            <Text style={styles.dayItemLabel}>SUN</Text>
            <Text style={styles.dayItemNumber}>22</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dayItem, styles.dayItemActive]}>
            <Text style={styles.dayItemLabelActive}>MON</Text>
            <Text style={styles.dayItemNumberActive}>23</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dayItem}>
            <Text style={styles.dayItemLabel}>TUE</Text>
            <Text style={styles.dayItemNumber}>24</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dayItem}>
            <Text style={styles.dayItemLabel}>WED</Text>
            <Text style={styles.dayItemNumber}>25</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dayItemCal}>
            <Text style={styles.dayItemLabel}>THU</Text>
            <View style={styles.calRow}>
              <Text style={styles.dayItemNumber}>26</Text>
              <MaterialIcons name="calendar-month" size={18} color="#0284C7" style={{marginLeft: 4}} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.timelineContainer}>
          
          {/* Timeline Item 1 */}
          <View style={styles.timelineRow}>
            <View style={styles.timeColumn}>
              <View style={[styles.timelineDot, { backgroundColor: '#16A34A' }]} >
                <MaterialIcons name="check" size={14} color="#FFFFFF" />
              </View>
              <Text style={styles.timeText}>09:00</Text>
              <View style={styles.timelineLine} />
            </View>
            <View style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <Image source={{ uri: 'https://i.pravatar.cc/150?img=1' }} style={styles.eventAvatar} />
                <View style={styles.eventTitleCol}>
                  <Text style={styles.eventName}>Eleanor Shellstrop</Text>
                  <View style={styles.eventTypeRow}>
                    <MaterialIcons name="home" size={14} color="#475569" />
                    <Text style={styles.eventTypeText}>Home Visit</Text>
                  </View>
                </View>
                <View style={styles.badgeCompleted}>
                  <Text style={styles.badgeCompletedText}>Completed</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>View Notes</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Timeline Item 2 */}
          <View style={styles.timelineRow}>
            <View style={styles.timeColumn}>
              <View style={[styles.timelineDot, { backgroundColor: '#0284C7' }]} >
                <MaterialIcons name="schedule" size={14} color="#FFFFFF" />
              </View>
              <Text style={styles.timeText}>10:30</Text>
              <View style={styles.timelineLine} />
            </View>
            <View style={[styles.eventCard, styles.eventCardActive]}>
              <View style={styles.eventHeader}>
                <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={styles.eventAvatar} />
                <View style={styles.eventTitleCol}>
                  <Text style={styles.eventName}>Arthur Miller</Text>
                  <View style={styles.eventTypeRow}>
                    <MaterialIcons name="videocam" size={14} color="#475569" />
                    <Text style={styles.eventTypeText}>Video Consultation</Text>
                  </View>
                </View>
                <View style={styles.badgeConfirmed}>
                  <Text style={styles.badgeConfirmedText}>Confirmed</Text>
                </View>
              </View>
              <View style={styles.eventActionsRow}>
                <TouchableOpacity style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Start Video Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <MaterialIcons name="more-vert" size={20} color="#475569" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Timeline Item 3 */}
          <View style={styles.timelineRow}>
            <View style={styles.timeColumn}>
              <View style={[styles.timelineDot, { backgroundColor: '#E2E8F0' }]} >
                <MaterialIcons name="business-center" size={14} color="#64748B" />
              </View>
              <Text style={styles.timeText}>13:00</Text>
            </View>
            <View style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View style={styles.placeholderAvatar}>
                  <MaterialIcons name="person" size={24} color="#64748B" />
                </View>
                <View style={styles.eventTitleCol}>
                  <Text style={styles.eventName}>Chidi Anagonye</Text>
                  <View style={styles.eventTypeRow}>
                    <MaterialIcons name="business" size={14} color="#475569" />
                    <Text style={styles.eventTypeText}>In-Clinic Visit</Text>
                  </View>
                </View>
                <View style={styles.badgePending}>
                  <Text style={styles.badgePendingText}>Pending</Text>
                </View>
              </View>
            </View>
          </View>

        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.summaryCard, { backgroundColor: '#F0F9FF', borderColor: '#E0F2FE' }]}>
            <MaterialIcons name="event" size={24} color="#0284C7" style={styles.summaryIcon} />
            <Text style={[styles.summaryValue, { color: '#0284C7' }]}>08</Text>
            <Text style={[styles.summaryLabel, { color: '#0369A1' }]}>Appointments Today</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }]}>
            <MaterialIcons name="timer" size={24} color="#16A34A" style={styles.summaryIcon} />
            <Text style={[styles.summaryValue, { color: '#16A34A' }]}>4.5h</Text>
            <Text style={[styles.summaryLabel, { color: '#15803D' }]}>Total Duration</Text>
          </View>
        </View>

      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <MaterialIcons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollView: { flex: 1, backgroundColor: '#FAFBFC' },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '700', color: '#0F172A', letterSpacing: -0.5 },
  toggleGroup: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 8, padding: 4, borderWidth: 1, borderColor: '#F1F5F9' },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  toggleBtnActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  toggleBtnText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  toggleBtnTextActive: { fontSize: 13, fontWeight: '600', color: '#0284C7' },
  dateSubtitle: { fontSize: 16, color: '#475569', marginBottom: 24 },

  dayPicker: { flexDirection: 'row', gap: 8, marginBottom: 32 },
  dayItem: { flex: 1, alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingVertical: 12 },
  dayItemCal: { flex: 1.5, alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingVertical: 12 },
  dayItemActive: { backgroundColor: '#0284C7', borderColor: '#0284C7' },
  dayItemLabel: { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 4 },
  dayItemLabelActive: { fontSize: 12, fontWeight: '600', color: '#E0F2FE', marginBottom: 4 },
  dayItemNumber: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  dayItemNumberActive: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  calRow: { flexDirection: 'row', alignItems: 'center' },

  timelineContainer: { marginBottom: 24 },
  timelineRow: { flexDirection: 'row', marginBottom: 16 },
  timeColumn: { width: 44, alignItems: 'center', marginRight: 12 },
  timelineDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', zIndex: 2, marginBottom: 8 },
  timeText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  timelineLine: { position: 'absolute', top: 28, bottom: -24, width: 2, backgroundColor: '#E2E8F0', zIndex: 1 },

  eventCard: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 16 },
  eventCardActive: { borderColor: '#BAE6FD', shadowColor: '#0284C7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 3 },
  eventHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  eventAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  placeholderAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  eventTitleCol: { flex: 1 },
  eventName: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 4 },
  eventTypeRow: { flexDirection: 'row', alignItems: 'center' },
  eventTypeText: { fontSize: 13, color: '#64748B', marginLeft: 4 },

  badgeCompleted: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeCompletedText: { color: '#16A34A', fontSize: 11, fontWeight: '600' },
  badgeConfirmed: { backgroundColor: '#E0F2FE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeConfirmedText: { color: '#0284C7', fontSize: 11, fontWeight: '600' },
  badgePending: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgePendingText: { color: '#64748B', fontSize: 11, fontWeight: '600' },

  secondaryButton: { backgroundColor: '#FAFBFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  secondaryButtonText: { color: '#0F52BA', fontSize: 14, fontWeight: '600' },
  
  eventActionsRow: { flexDirection: 'row', gap: 8 },
  primaryButton: { flex: 1, backgroundColor: '#0284C7', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  iconButton: { backgroundColor: '#F1F5F9', borderRadius: 8, width: 44, alignItems: 'center', justifyContent: 'center' },

  statsContainer: { flexDirection: 'row', gap: 12 },
  summaryCard: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 16 },
  summaryIcon: { marginBottom: 12 },
  summaryValue: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  summaryLabel: { fontSize: 13, fontWeight: '500' },

  fab: { position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#0284C7', alignItems: 'center', justifyContent: 'center', shadowColor: '#0284C7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
});
