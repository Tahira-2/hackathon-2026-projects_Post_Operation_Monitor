import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getMySlots, createSlot, deleteSlot } from '../../api/appointments-service';
import type { AppointmentSlot } from '../../api/models';
import AppCard from '../../components/AppCard';
import AppButton from '../../components/AppButton';
import { CardSkeleton } from '../../components/SkeletonLoader';

export default function DoctorSlotsScreen() {
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Simple form state (ideally use a date picker, but keeping it simple with strings for now to ensure it works cross-platform)
  // Format expected: YYYY-MM-DD and HH:MM
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:30');

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const data = await getMySlots();
      setSlots(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSlots();
    }, [])
  );

  const handleDelete = (id: number) => {
    Alert.alert('Delete Slot', 'Are you sure you want to remove this slot?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSlot(id);
            fetchSlots();
          } catch (err: any) { Alert.alert('Error', err.message); }
        }
      },
    ]);
  };

  const handleCreate = async () => {
    if (!date || !startTime || !endTime) {
       Alert.alert('Validation Error', 'All fields are required.');
       return;
    }
    setSubmitting(true);
    try {
       await createSlot({ date, start_time: startTime + ':00', end_time: endTime + ':00' });
       setShowModal(false);
       fetchSlots();
    } catch (err: any) {
       Alert.alert('Error', err.message);
    } finally {
       setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-red-50/30">
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">My Slots</Text>
        <TouchableOpacity 
           onPress={() => setShowModal(true)}
           className="bg-red-400 w-10 h-10 rounded-full items-center justify-center shadow-sm">
           <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="gap-4">
            <CardSkeleton /><CardSkeleton />
          </View>
        ) : slots.length === 0 ? (
          <View className="mt-20 items-center">
            <Ionicons name="time-outline" size={64} color="#d1d5db" />
            <Text className="mt-4 text-gray-400">No slots available</Text>
          </View>
        ) : (
          <View className="gap-4">
            {slots.map((slot) => (
              <AppCard key={slot.id} className="p-4 flex-row items-center justify-between">
                <View>
                  <View className="flex-row items-center gap-2 mb-1">
                     <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                     <Text className="font-bold text-gray-900">{slot.date}</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                     <Ionicons name="time-outline" size={16} color="#6b7280" />
                     <Text className="text-gray-600">{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3">
                   {slot.is_booked ? (
                      <View className="bg-red-100 px-2 py-1 rounded">
                         <Text className="text-xs font-bold text-red-600">BOOKED</Text>
                      </View>
                   ) : (
                      <View className="bg-green-100 px-2 py-1 rounded">
                         <Text className="text-xs font-bold text-green-600">FREE</Text>
                      </View>
                   )}
                   
                   {!slot.is_booked && (
                      <TouchableOpacity onPress={() => handleDelete(slot.id)} className="bg-gray-100 p-2 rounded-xl">
                         <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      </TouchableOpacity>
                   )}
                </View>
              </AppCard>
            ))}
          </View>
        )}
        <View className="h-24" />
      </ScrollView>

      {/* CREATE SLOT MODAL */}
      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
           <View className="bg-white rounded-t-3xl p-6 h-3/4">
              <View className="flex-row justify-between items-center mb-6">
                 <Text className="text-xl font-bold text-gray-900">Create New Slot</Text>
                 <TouchableOpacity onPress={() => setShowModal(false)}>
                    <Ionicons name="close-circle" size={28} color="#d1d5db" />
                 </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                 <Text className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Date (YYYY-MM-DD)</Text>
                 <TextInput 
                    value={date}
                    onChangeText={setDate}
                    placeholder="2026-04-30"
                    className="bg-gray-50 p-4 rounded-xl mb-4 text-gray-900 font-bold"
                 />

                 <Text className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Start Time (HH:MM)</Text>
                 <TextInput 
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="09:00"
                    className="bg-gray-50 p-4 rounded-xl mb-4 text-gray-900 font-bold"
                 />

                 <Text className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">End Time (HH:MM)</Text>
                 <TextInput 
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="09:30"
                    className="bg-gray-50 p-4 rounded-xl mb-6 text-gray-900 font-bold"
                 />

                 <AppButton 
                    label={submitting ? "Creating..." : "Create Slot"} 
                    onPress={handleCreate} 
                    disabled={submitting} 
                 />
                 <View className="h-10" />
              </ScrollView>
           </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
