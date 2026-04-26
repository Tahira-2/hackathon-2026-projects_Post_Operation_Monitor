import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

const PRIMARY = '#2A7B88'; 
const LIGHT = '#F8F9FB';
const BORDER = '#E5E7EB';
const GRAY = '#7A8CA3';
const ACTIVE_BG = '#1F5C66'; // Slightly darker for active states

export default function DoctorBookingScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(13);
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');

  const handleBackNavigation = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/doctor-profile' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackNavigation} style={styles.headerIconBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CareLoop</Text>
        <View style={styles.headerRight}>
          <MaterialIcons name="notifications-none" size={24} color={PRIMARY} style={{ marginRight: 16 }} />
          <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }} 
            style={styles.headerAvatar} 
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Doctor Card */}
        <View style={styles.doctorCard}>
          <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
            style={styles.doctorImage} 
          />
          <View style={styles.specialtyPill}>
            <Text style={styles.specialtyText}>Cardiologist</Text>
          </View>
          <Text style={styles.doctorName}>Dr. Sarah Richardson</Text>
          <Text style={styles.doctorDesc}>Specialist in Preventive Cardiology - 12 years exp.</Text>
          <View style={styles.doctorStatsRow}>
            <View style={styles.statItem}>
              <MaterialIcons name="star" size={16} color="#2A7B88" />
              <Text style={styles.statText}>4.9 <Text style={styles.statSub}>(1.2k reviews)</Text></Text>
            </View>
          </View>
          <View style={styles.doctorLocation}>
            <MaterialIcons name="location-on" size={16} color="#2A7B88" />
            <Text style={styles.statText}>City General Hospital</Text>
          </View>
        </View>

        {/* Select Date */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <Text style={styles.sectionLink}>October 2024</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
          {[12, 13, 14, 15].map((date, idx) => {
            const isSelected = selectedDate === date;
            const days = ['MON', 'TUE', 'WED', 'THU'];
            return (
              <TouchableOpacity 
                key={date} 
                style={[styles.dateBox, isSelected && styles.dateBoxSelected]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dateDay, isSelected && styles.textWhite]}>{days[idx]}</Text>
                <Text style={[styles.dateNumber, isSelected && styles.textWhite]}>{date}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Available Slots */}
        <Text style={styles.sectionTitle}>Available Slots</Text>
        
        {/* Morning */}
        <View style={styles.slotCategory}>
          <MaterialIcons name="wb-sunny" size={16} color="#555" />
          <Text style={styles.slotCategoryText}>MORNING</Text>
        </View>
        <View style={styles.slotsGrid}>
          {['09:00 AM', '09:30 AM', '10:00 AM'].map(time => (
            <SlotButton 
              key={time} time={time} 
              active={selectedSlot === time} 
              onPress={() => setSelectedSlot(time)} 
            />
          ))}
          <SlotButton time="10:30 AM" disabled />
        </View>

        {/* Afternoon */}
        <View style={styles.slotCategory}>
          <MaterialIcons name="wb-sunny" size={16} color="#555" />
          <Text style={styles.slotCategoryText}>AFTERNOON</Text>
        </View>
        <View style={styles.slotsGrid}>
          {['01:00 PM', '01:30 PM', '02:30 PM', '04:00 PM'].map(time => (
            <SlotButton 
              key={time} time={time} 
              active={selectedSlot === time} 
              onPress={() => setSelectedSlot(time)} 
            />
          ))}
        </View>

        {/* Evening */}
        <View style={styles.slotCategory}>
          <MaterialIcons name="nights-stay" size={16} color="#555" />
          <Text style={styles.slotCategoryText}>EVENING</Text>
        </View>
        <View style={styles.slotsGrid}>
          {['06:00 PM', '07:00 PM'].map(time => (
            <SlotButton 
              key={time} time={time} 
              active={selectedSlot === time} 
              onPress={() => setSelectedSlot(time)} 
            />
          ))}
        </View>

        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>APPOINTMENT DATE</Text>
              <Text style={styles.summaryValue}>Tuesday, 13 Oct 2024</Text>
            </View>
            <MaterialIcons name="calendar-today" size={20} color="#2A7B88" />
          </View>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>TIME SLOT</Text>
              <Text style={styles.summaryValue}>10:00 AM (Morning)</Text>
            </View>
            <MaterialIcons name="access-time" size={20} color="#2A7B88" />
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>CONSULTATION FEE</Text>
              <Text style={styles.summaryValue}>$120.00</Text>
            </View>
            <MaterialIcons name="payments" size={20} color="#2A7B88" />
          </View>

          <View style={styles.divider} />
          
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Subtotal</Text>
            <Text style={styles.feeValue}>$120.00</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Service Fee</Text>
            <Text style={styles.feeValue}>$5.00</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>$125.00</Text>
          </View>

          <TouchableOpacity style={styles.confirmBtn}>
            <Text style={styles.confirmBtnText}>Confirm Appointment</Text>
          </TouchableOpacity>
          <Text style={styles.policyText}>Cancellation policy: Full refund if cancelled 24 hours prior.</Text>
        </View>

        {/* Insurance */}
        <View style={styles.insuranceCard}>
          <MaterialIcons name="info" size={20} color="#2A7B88" />
          <Text style={styles.insuranceText}>Insurance coverage can be applied at checkout.</Text>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

function SlotButton({ time, active, disabled, onPress }: any) {
  return (
    <TouchableOpacity 
      style={[
        styles.slotBtn, 
        active && styles.slotBtnActive,
        disabled && styles.slotBtnDisabled
      ]} 
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[
        styles.slotText, 
        active && styles.slotTextActive,
        disabled && styles.slotTextDisabled
      ]}>{time}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: BORDER
  },
  headerIconBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2A7B88' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerAvatar: { width: 32, height: 32, borderRadius: 16 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  
  doctorCard: { 
    backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center',
    marginBottom: 24, borderWidth: 1, borderColor: '#Eef0f5'
  },
  doctorImage: { width: 80, height: 80, borderRadius: 16, marginBottom: 12 },
  specialtyPill: { 
    backgroundColor: '#E6F2F4', paddingHorizontal: 12, paddingVertical: 4, 
    borderRadius: 12, marginBottom: 12 
  },
  specialtyText: { color: '#2A7B88', fontSize: 12, fontWeight: 'bold' },
  doctorName: { fontSize: 20, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  doctorDesc: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 12 },
  doctorStatsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  statItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 },
  statText: { fontSize: 13, fontWeight: '600', color: '#333', marginLeft: 4 },
  statSub: { color: '#888', fontWeight: 'normal' },
  doctorLocation: { flexDirection: 'row', alignItems: 'center' },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  sectionLink: { fontSize: 13, color: '#2A7B88', fontWeight: '600' },
  
  dateScroll: { marginBottom: 24 },
  dateBox: { 
    width: 64, height: 80, borderRadius: 12, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center',
    marginRight: 12
  },
  dateBoxSelected: { backgroundColor: '#1F5C66', borderColor: '#1F5C66' },
  dateDay: { fontSize: 12, color: '#666', marginBottom: 4, fontWeight: '600' },
  dateNumber: { fontSize: 22, fontWeight: 'bold', color: '#111' },
  textWhite: { color: '#fff' },
  
  strokePill: { backgroundColor: '#E6F2F4', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12 },
  
  slotCategory: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 8 },
  slotCategoryText: { fontSize: 12, fontWeight: 'bold', color: '#555', marginLeft: 6, letterSpacing: 0.5 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  slotBtn: { 
    width: '31%', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', 
    borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginRight: '2%', marginBottom: 10
  },
  slotBtnActive: { backgroundColor: '#2A7B88', borderColor: '#2A7B88' },
  slotBtnDisabled: { backgroundColor: '#F3F4F6', borderColor: '#F3F4F6' },
  slotText: { fontSize: 13, color: '#333', fontWeight: '500' },
  slotTextActive: { color: '#fff', fontWeight: 'bold' },
  slotTextDisabled: { color: '#aaa' },
  
  summaryCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: '#Eef0f5'
  },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  summaryInfo: { flex: 1 },
  summaryLabel: { fontSize: 11, color: '#666', fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 4 },
  summaryValue: { fontSize: 14, color: '#111', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  feeLabel: { fontSize: 14, color: '#555' },
  feeValue: { fontSize: 14, color: '#111', fontWeight: '500' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 20 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#2A7B88' },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: '#2A7B88' },
  
  confirmBtn: { backgroundColor: '#1F5C66', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  policyText: { fontSize: 11, color: '#888', textAlign: 'center' },
  
  insuranceCard: {
    flexDirection: 'row', backgroundColor: '#F0F9F8', padding: 16, borderRadius: 12,
    alignItems: 'center', marginBottom: 20
  },
  insuranceText: { fontSize: 13, color: '#555', marginLeft: 12, flex: 1 },
});