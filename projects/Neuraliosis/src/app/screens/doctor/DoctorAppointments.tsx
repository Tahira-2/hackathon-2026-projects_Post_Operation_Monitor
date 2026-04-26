import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getDoctorAppointments, updateAppointmentStatus } from '../../api/appointments-service';
import type { Appointment } from '../../api/models';
import AppCard from '../../components/AppCard';
import { CardSkeleton } from '../../components/SkeletonLoader';

function statusColor(status: string) {
  switch (status) {
    case 'confirmed': return 'bg-green-100 text-green-700';
    case 'completed': return 'bg-blue-100 text-blue-700';
    case 'cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-yellow-100 text-yellow-700';
  }
}

export default function DoctorAppointmentsScreen() {
  const nav = useNavigation<any>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await getDoctorAppointments();
      setAppointments(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [])
  );

  const handleStatusChange = (id: number, currentStatus: string) => {
    Alert.alert('Update Status', 'Select new status for this appointment:', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Confirm', 
        onPress: async () => {
          try {
            await updateAppointmentStatus(id, { status: 'confirmed' });
            fetchAppointments();
          } catch (err: any) { Alert.alert('Error', err.message); }
        }
      },
      { 
        text: 'Mark Completed', 
        onPress: async () => {
          try {
            await updateAppointmentStatus(id, { status: 'completed' });
            fetchAppointments();
          } catch (err: any) { Alert.alert('Error', err.message); }
        }
      },
      { 
        text: 'Cancel Appointment', 
        style: 'destructive',
        onPress: async () => {
          try {
            await updateAppointmentStatus(id, { status: 'cancelled' });
            fetchAppointments();
          } catch (err: any) { Alert.alert('Error', err.message); }
        }
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-red-50/30">
      <View className="flex-row items-center gap-3 px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Appointments</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="gap-4">
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
          </View>
        ) : appointments.length === 0 ? (
          <View className="mt-20 items-center">
            <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
            <Text className="mt-4 text-gray-400">No appointments scheduled</Text>
          </View>
        ) : (
          <View className="gap-4">
            {appointments.map((appt) => (
              <AppCard key={appt.id} className="p-5">
                <View className="flex-row justify-between mb-3 border-b border-gray-100 pb-3">
                   <View>
                     <Text className="text-xs text-gray-500 font-bold uppercase tracking-wider">Scheduled for</Text>
                     <Text className="font-bold text-gray-900 mt-1">
                       {new Date(appt.scheduled_time).toLocaleString('en-US', {
                         day: '2-digit', month: 'short', year: 'numeric',
                         hour: '2-digit', minute: '2-digit'
                       })}
                     </Text>
                   </View>
                   <TouchableOpacity onPress={() => handleStatusChange(appt.id, appt.status)}>
                     <View className={`rounded-full px-3 py-1 ${statusColor(appt.status)}`}>
                       <Text className="text-xs font-bold uppercase">
                         {appt.status}
                       </Text>
                     </View>
                   </TouchableOpacity>
                </View>
                
                <Text className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Reason</Text>
                <Text className="text-gray-700 leading-5 mb-4">{appt.reason}</Text>

                <View className="flex-row gap-2">
                  {(appt.status === 'confirmed' || appt.status === 'completed') && (
                     <TouchableOpacity 
                        onPress={() => nav.navigate('DoctorReport', { appointmentId: appt.id })}
                        className="flex-1 bg-red-50 py-3 rounded-xl items-center border border-red-100">
                        <Text className="font-bold text-red-600">Medical Report</Text>
                     </TouchableOpacity>
                  )}
                </View>
              </AppCard>
            ))}
          </View>
        )}
        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
