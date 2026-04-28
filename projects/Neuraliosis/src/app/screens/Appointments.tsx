import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Foundation from '@expo/vector-icons/Foundation';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';

import { getMyAppointments } from 'api/appointments-service';
import { listDoctors } from 'api/doctors-service';
import type { Appointment, DoctorProfile } from 'api/models';
import AiRecommendationCard from '../components/AiRecommendationCard';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import { CardSkeleton, StatsSkeleton } from '../components/SkeletonLoader';

function getStatusStyle(status: string) {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-700';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-blue-100 text-blue-700';
  }
}

function formatStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function AppointmentHistory() {
  const nav = useNavigation<any>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      (async () => {
        setLoading(true);
        try {
          const [appts, docs] = await Promise.all([getMyAppointments(), listDoctors()]);
          if (!cancelled) {
            setAppointments(appts);
            setDoctors(docs);
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
    }, []),
  );

  const getDoctorForAppointment = useCallback(
    (doctorId: number) => doctors.find((d) => d.id === doctorId),
    [doctors],
  );

  const stats = useMemo(() => {
    const total = appointments.length;
    const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
    const pending = appointments.filter((a) => a.status === 'pending').length;
    return { total, confirmed, pending };
  }, [appointments]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView className="flex-1 bg-pink-50/30">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pb-10 pt-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">Appointment History</Text>
          <Text className="text-xs text-gray-500">Your past and upcoming consultations</Text>
        </View>

        {/* Stats */}
        {loading ? (
          <View className="mb-6">
            <StatsSkeleton />
          </View>
        ) : (
          <View className="mb-6 flex-row gap-4">
            <AppCard className="flex-1 p-4">
              <Text className="text-xs font-bold uppercase text-gray-500">Total</Text>
              <Text className="mt-1 text-2xl font-extrabold text-gray-900">{stats.total}</Text>
            </AppCard>

            <AppCard className="flex-1 p-4">
              <Text className="text-xs font-bold uppercase text-gray-500">Confirmed</Text>
              <Text className="mt-1 text-2xl font-extrabold text-green-600">
                {stats.confirmed}
              </Text>
            </AppCard>

            <AppCard className="flex-1 p-4">
              <Text className="text-xs font-bold uppercase text-gray-500">Pending</Text>
              <Text className="mt-1 text-2xl font-extrabold text-blue-600">{stats.pending}</Text>
            </AppCard>
          </View>
        )}

        <AiRecommendationCard
          title="AI Doctor Assistant"
          description="Tell us your symptoms and we'll recommend the right specialist"
          onPress={() => {
            nav.navigate('chat');
          }}
        />

        {/* Appointment List */}
        {loading ? (
          <View className="gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </View>
        ) : appointments.length === 0 ? (
          <AppCard className="items-center p-8">
            <Foundation name="calendar" size={40} color="#d1d5db" />
            <Text className="mt-3 text-sm text-gray-500">No appointments yet</Text>
          </AppCard>
        ) : (
          <View className="gap-4">
            {appointments.map((item) => {
              const doctor = getDoctorForAppointment(item.doctor);

              return (
                <AppCard key={item.id} className="p-5">
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

                    <View className={`rounded-full px-3 py-1 ${getStatusStyle(item.status)}`}>
                      <Text className="text-xs font-bold">{formatStatusLabel(item.status)}</Text>
                    </View>
                  </View>

                  <View className="mt-4 flex-row items-center justify-between">
                    <View>
                      <Text className="text-xs text-gray-500">Date</Text>
                      <Text className="font-bold text-gray-900">
                        {formatDate(item.scheduled_time)} • {formatTime(item.scheduled_time)}
                      </Text>
                    </View>

                    <Foundation name="calendar" size={22} color="#fb923c" />
                  </View>

                  <View className="mt-4 flex-row gap-3">
                    <AppButton
                      onPress={() => {
                        nav.navigate('AppointmentDetails', { appointmentId: item.id });
                      }}
                      label="View Details"
                      variant="secondary"
                      className="flex-1"
                      textClassName="text-xs"
                    />

                    {item.status !== 'cancelled' && (
                      <AppButton
                        onPress={() => {
                          nav.navigate('chat');
                        }}
                        label="Rebook"
                        variant="accent"
                        className="flex-1"
                        textClassName="text-xs"
                      />
                    )}
                  </View>
                </AppCard>
              );
            })}
          </View>
        )}

        <View className="h-18 mb-32" />
      </ScrollView>
    </SafeAreaView>
  );
}
