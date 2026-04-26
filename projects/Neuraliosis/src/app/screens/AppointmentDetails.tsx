import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Foundation from '@expo/vector-icons/Foundation';
import { useCallback, useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

import { getMyAppointments, updateAppointment } from 'api/appointments-service';
import { listDoctors, checkDoctorAvailability } from 'api/doctors-service';
import type { Appointment, DoctorProfile } from 'api/models';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import { CardSkeleton } from '../components/SkeletonLoader';

function getStatusStyle(status: string) {
  switch (status) {
    case 'confirmed':
      return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'cancelled':
      return { bg: 'bg-red-100', text: 'text-red-700' };
    default:
      return { bg: 'bg-blue-100', text: 'text-blue-700' };
  }
}

export default function AppointmentDetails() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const appointmentId = route.params?.appointmentId as number | undefined;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [availability, setAvailability] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const [appts, docs] = await Promise.all([getMyAppointments(), listDoctors()]);

        if (cancelled) return;

        const found = appts.find((a) => a.id === appointmentId);
        if (found) {
          setAppointment(found);
          const doc = docs.find((d) => d.id === found.doctor);
          setDoctor(doc ?? null);

          // Check availability for the scheduled time
          if (doc) {
            try {
              const av = await checkDoctorAvailability(
                doc.id,
                found.scheduled_time,
              );
              if (!cancelled) setAvailability(av.is_available);
            } catch {
              // silent
            }
          }
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [appointmentId]);

  const handleCancel = () => {
    if (!appointment) return;

    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              const updated = await updateAppointment(appointment.id, {
                status: 'cancelled',
              });
              setAppointment(updated);
            } catch {
              Alert.alert('Error', 'Failed to cancel appointment');
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-pink-50/30">
        <ScrollView className="flex-1 px-6 pb-10 pt-6">
          <CardSkeleton />
          <View className="mt-4">
            <CardSkeleton />
          </View>
          <View className="mt-4">
            <CardSkeleton />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-pink-50/30">
        <Text className="text-gray-500">Appointment not found</Text>
      </SafeAreaView>
    );
  }

  const statusStyle = getStatusStyle(appointment.status);

  return (
    <SafeAreaView className="flex-1 bg-pink-50/30">
      <ScrollView className="flex-1 px-6 pb-10 pt-6">
        {/* Doctor + Status */}
        <AppCard className="mb-6 p-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                <Foundation name="first-aid" size={24} color="#3b82f6" />
              </View>

              <View>
                <Text className="font-bold text-gray-900">
                  {doctor?.specialization ?? 'Doctor'}
                </Text>
                <Text className="text-xs text-gray-500">
                  {doctor?.hospital_name ?? '—'}
                </Text>
              </View>
            </View>

            <View className={`rounded-full px-3 py-1 ${statusStyle.bg}`}>
              <Text className={`text-xs font-bold ${statusStyle.text}`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-gray-500">Date & Time</Text>
              <Text className="font-bold text-gray-900">
                {formatDate(appointment.scheduled_time)} •{' '}
                {formatTime(appointment.scheduled_time)}
              </Text>
            </View>

            <Foundation name="calendar" size={22} color="#fb923c" />
          </View>
        </AppCard>

        {/* Reason */}
        <AppCard className="mb-6 p-5">
          <Text className="mb-2 text-sm font-bold uppercase text-gray-700">Reason</Text>
          <Text className="text-gray-800">{appointment.reason || 'No reason provided'}</Text>
        </AppCard>

        {/* Doctor Info */}
        {doctor && (
          <AppCard bordered={false} className="mb-6 border border-pink-100 p-5">
            <View className="mb-2 flex-row items-center gap-2">
              <Foundation name="clipboard-notes" size={20} color="#ec4899" />
              <Text className="text-sm font-bold uppercase text-gray-700">Doctor Details</Text>
            </View>

            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-xs text-gray-500">Specialization</Text>
                <Text className="text-xs font-bold text-gray-800">
                  {doctor.specialization}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-gray-500">Hospital</Text>
                <Text className="text-xs font-bold text-gray-800">
                  {doctor.hospital_name}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-gray-500">Available</Text>
                <Text className="text-xs font-bold text-gray-800">
                  {doctor.available_from} — {doctor.available_to}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-gray-500">Phone</Text>
                <Text className="text-xs font-bold text-gray-800">
                  {doctor.phone_number}
                </Text>
              </View>
              {availability !== null && (
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-500">Currently Available</Text>
                  <Text
                    className={`text-xs font-bold ${availability ? 'text-green-600' : 'text-red-500'}`}>
                    {availability ? 'Yes' : 'No'}
                  </Text>
                </View>
              )}
            </View>
          </AppCard>
        )}

        {/* Actions */}
        {appointment.status !== 'cancelled' && (
          <View className="flex-row gap-3">
            <AppButton
              label="Rebook"
              variant="secondary"
              className="flex-1"
              onPress={() => nav.navigate('chat')}
            />

            <AppButton
              label={cancelling ? 'Cancelling...' : 'Cancel Appointment'}
              variant="accent"
              className="flex-1"
              disabled={cancelling}
              onPress={handleCancel}
            />
          </View>
        )}

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
