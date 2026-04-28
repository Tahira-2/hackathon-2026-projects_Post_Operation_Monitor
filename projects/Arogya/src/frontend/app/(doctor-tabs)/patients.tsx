import { ScrollView, StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';

import { DoctorHeader } from '@/components/doctor/doctor-header';

export default function PatientsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <DoctorHeader brandName="ClinicalHub" leftIcon="menu" showAvatarRight />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.title}>Patient Directory</Text>
          <Text style={styles.subtitle}>Monitor and manage your active patient list.</Text>
        </View>

        <TouchableOpacity style={styles.newPatientButton}>
          <MaterialIcons name="person-add" size={20} color="#FFFFFF" />
          <Text style={styles.newPatientText}>New Patient</Text>
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, ID, or condition..."
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.filtersRow}>
          <TouchableOpacity style={styles.filterChip}>
            <MaterialIcons name="filter-list" size={18} color="#475569" />
            <Text style={styles.filterChipText}>Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <MaterialIcons name="sort" size={18} color="#475569" />
            <Text style={styles.filterChipText}>Sort</Text>
          </TouchableOpacity>
        </View>

        {/* Patient Cards */}
        <View style={styles.patientCard}>
          <View style={styles.patientHeader}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=5' }} style={styles.patientAvatar} />
            <View style={styles.patientNameCol}>
              <Text style={styles.patientName}>Elena Richardson</Text>
              <Text style={styles.patientId}>ID: #PT-8821</Text>
            </View>
            <View style={styles.badgeEmergency}>
              <MaterialIcons name="error" size={10} color="#DC2626" style={styles.badgeIcon} />
              <Text style={styles.badgeEmergencyText}>Emergency</Text>
            </View>
          </View>
          <View style={styles.patientDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Condition</Text>
              <Text style={styles.detailValue}>Atrial Fibrillation</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Check-in</Text>
              <Text style={styles.detailValue}>15 mins ago</Text>
            </View>
          </View>
          <View style={styles.patientActions}>
            <TouchableOpacity style={styles.viewRecordsButton}>
              <Text style={styles.viewRecordsText}>View Records</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageButton}>
              <MaterialIcons name="mail" size={20} color="#0284C7" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.patientCard}>
          <View style={styles.patientHeader}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={styles.patientAvatar} />
            <View style={styles.patientNameCol}>
              <Text style={styles.patientName}>Marcus Thorne</Text>
              <Text style={styles.patientId}>ID: #PT-9012</Text>
            </View>
            <View style={styles.badgeWarning}>
              <MaterialIcons name="warning" size={10} color="#D97706" style={styles.badgeIcon} />
              <Text style={styles.badgeWarningText}>Warning</Text>
            </View>
          </View>
          <View style={styles.patientDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Condition</Text>
              <Text style={styles.detailValue}>Type 2 Diabetes</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Check-in</Text>
              <Text style={styles.detailValue}>Today, 08:30 AM</Text>
            </View>
          </View>
          <View style={styles.patientActions}>
            <TouchableOpacity style={styles.viewRecordsButton}>
              <Text style={styles.viewRecordsText}>View Records</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageButton}>
              <MaterialIcons name="mail" size={20} color="#0284C7" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.patientCard}>
          <View style={styles.patientHeader}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=9' }} style={styles.patientAvatar} />
            <View style={styles.patientNameCol}>
              <Text style={styles.patientName}>Sarah Jenkins</Text>
              <Text style={styles.patientId}>ID: #PT-4429</Text>
            </View>
            <View style={styles.badgeNormal}>
              <MaterialIcons name="check-circle" size={10} color="#16A34A" style={styles.badgeIcon} />
              <Text style={styles.badgeNormalText}>Normal</Text>
            </View>
          </View>
          <View style={styles.patientDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Condition</Text>
              <Text style={styles.detailValue}>Post-Op Recovery</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Check-in</Text>
              <Text style={styles.detailValue}>Yesterday</Text>
            </View>
          </View>
          <View style={styles.patientActions}>
            <TouchableOpacity style={styles.viewRecordsButton}>
              <Text style={styles.viewRecordsText}>View Records</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageButton}>
              <MaterialIcons name="mail" size={20} color="#0284C7" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.patientCard}>
          <View style={styles.patientHeader}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=12' }} style={styles.patientAvatar} />
            <View style={styles.patientNameCol}>
              <Text style={styles.patientName}>David Wilson</Text>
              <Text style={styles.patientId}>ID: #PT-1109</Text>
            </View>
            <View style={styles.badgeNormal}>
              <MaterialIcons name="check-circle" size={10} color="#16A34A" style={styles.badgeIcon} />
              <Text style={styles.badgeNormalText}>Normal</Text>
            </View>
          </View>
          <View style={styles.patientDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Condition</Text>
              <Text style={styles.detailValue}>Hypertension</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Check-in</Text>
              <Text style={styles.detailValue}>Oct 12, 2023</Text>
            </View>
          </View>
          <View style={styles.patientActions}>
            <TouchableOpacity style={styles.viewRecordsButton}>
              <Text style={styles.viewRecordsText}>View Records</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageButton}>
              <MaterialIcons name="mail" size={20} color="#0284C7" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.patientCard}>
          <View style={styles.patientHeader}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=13' }} style={styles.patientAvatar} />
            <View style={styles.patientNameCol}>
              <Text style={styles.patientName}>Arthur Vance</Text>
              <Text style={styles.patientId}>ID: #PT-3320</Text>
            </View>
            <View style={styles.badgeWarning}>
              <MaterialIcons name="warning" size={10} color="#D97706" style={styles.badgeIcon} />
              <Text style={styles.badgeWarningText}>Warning</Text>
            </View>
          </View>
          <View style={styles.patientDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Condition</Text>
              <Text style={styles.detailValue}>COPD</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Check-in</Text>
              <Text style={styles.detailValue}>2 hours ago</Text>
            </View>
          </View>
          <View style={styles.patientActions}>
            <TouchableOpacity style={styles.viewRecordsButton}>
              <Text style={styles.viewRecordsText}>View Records</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageButton}>
              <MaterialIcons name="mail" size={20} color="#0284C7" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.addPatientCard}>
          <View style={styles.addPatientIconCircle}>
            <MaterialIcons name="add" size={24} color="#64748B" />
          </View>
          <Text style={styles.addPatientTitle}>Add New Patient</Text>
          <Text style={styles.addPatientSub}>Register a new patient into the clinical system.</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollView: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  hero: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#0F172A', letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#64748B' },
  
  newPatientButton: {
    backgroundColor: '#0284C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  newPatientText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#0F172A' },

  filtersRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  filterChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  filterChipText: { fontSize: 14, fontWeight: '600', color: '#475569' },

  patientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  patientHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  patientAvatar: { width: 48, height: 48, borderRadius: 12, marginRight: 12 },
  patientNameCol: { flex: 1 },
  patientName: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  patientId: { fontSize: 13, color: '#64748B' },
  
  badgeEmergency: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  badgeEmergencyText: { color: '#DC2626', fontSize: 11, fontWeight: '600' },
  badgeWarning: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  badgeWarningText: { color: '#D97706', fontSize: 11, fontWeight: '600' },
  badgeNormal: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  badgeNormalText: { color: '#16A34A', fontSize: 11, fontWeight: '600' },
  badgeIcon: { marginTop: 1 },

  patientDetails: { marginBottom: 16, gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 14, color: '#64748B' },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#0F172A' },

  patientActions: { flexDirection: 'row', gap: 12 },
  viewRecordsButton: { flex: 1, backgroundColor: '#E0F2FE', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  viewRecordsText: { color: '#0284C7', fontSize: 14, fontWeight: '600' },
  messageButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, width: 48, alignItems: 'center', justifyContent: 'center' },

  addPatientCard: {
    backgroundColor: '#FAFBFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  addPatientIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  addPatientTitle: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 4 },
  addPatientSub: { fontSize: 13, color: '#64748B', textAlign: 'center' },
});
