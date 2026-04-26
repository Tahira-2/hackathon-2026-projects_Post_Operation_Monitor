import { View, Text, Image, TouchableOpacity, ScrollView, LayoutChangeEvent } from 'react-native';
import Foundation from '@expo/vector-icons/Foundation';
import { LineChart } from 'react-native-gifted-charts';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { useHealthConnect } from 'hooks/useHealthData';
import { useAuthStore } from 'store/auth-store';
import { getMyAppointments } from 'api/appointments-service';
import { listDoctors } from 'api/doctors-service';
import type { Appointment, DoctorProfile } from 'api/models';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import SkeletonLoader, { CardSkeleton } from '../components/SkeletonLoader';

const HEALTH_POLL_INTERVAL_MS = 10000;
const HEALTH_WINDOW_MS = 24 * 60 * 60 * 1000;

export default function HomeView() {
  const nav: any = useNavigation();
  const user = useAuthStore((s) => s.user);
  const [chartWidth, setChartWidth] = useState(0);
  const [stress, setStress] = useState(35);
  const [calories, setCalories] = useState(320);
  const pollInFlightRef = useRef(false);

  // API state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(true);

  const { data: heartRateData, fetchHealthData: fetchHeartRate } = useHealthConnect();
  const { data: stepsData, fetchHealthData: fetchSteps } = useHealthConnect();
  const { data: sleepData, fetchHealthData: fetchSleep } = useHealthConnect();

  // Fetch appointments + doctors from API
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      (async () => {
        setLoadingAppts(true);
        try {
          const [appts, docs] = await Promise.all([
            getMyAppointments(),
            listDoctors(),
          ]);

          if (!cancelled) {
            setAppointments(appts);
            setDoctors(docs);
          }
        } catch {
          // silent fail — data stays empty
        } finally {
          if (!cancelled) setLoadingAppts(false);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, []),
  );

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter(
        (a) =>
          a.status !== 'cancelled' && new Date(a.scheduled_time) >= now,
      )
      .slice(0, 3);
  }, [appointments]);

  const getDoctorForAppointment = useCallback(
    (doctorId: number) => doctors.find((d) => d.id === doctorId),
    [doctors],
  );

  const fetchAllHealthData = useCallback(async () => {
    if (pollInFlightRef.current) return;

    pollInFlightRef.current = true;

    try {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - HEALTH_WINDOW_MS);

      const timeRangeFilter = {
        operator: 'between' as const,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };

      await Promise.allSettled([
        fetchHeartRate({ recordType: 'HeartRate', timeRangeFilter }),
        fetchSteps({ recordType: 'Steps', timeRangeFilter }),
        fetchSleep({ recordType: 'SleepSession', timeRangeFilter }),
      ]);
    } finally {
      pollInFlightRef.current = false;
    }
  }, [fetchHeartRate, fetchSleep, fetchSteps]);

  useFocusEffect(
    useCallback(() => {
      void fetchAllHealthData();

      const intervalId = setInterval(() => {
        void fetchAllHealthData();
      }, HEALTH_POLL_INTERVAL_MS);

      return () => clearInterval(intervalId);
    }, [fetchAllHealthData])
  );

  useEffect(() => {
    const steps = stepsData?.reduce((sum: number, item: any) => sum + (item.count ?? 0), 0) ?? 0;

    const samples = heartRateData?.[0]?.samples ?? [];
    const latestHr = samples?.[0]?.beatsPerMinute ?? 75;

    const variation =
      samples.length > 5
        ? Math.abs(
            samples[0].beatsPerMinute - samples[Math.min(5, samples.length - 1)].beatsPerMinute
          )
        : 5;

    const stressValue = Math.min(100, variation * 8 + (latestHr > 90 ? 20 : 0));

    setStress(Math.round(stressValue));

    const baseCalories = steps * 0.04 + latestHr * 0.8;
    setCalories(Math.round(baseCalories));
  }, [heartRateData, stepsData]);

  const onChartLayout = (e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width);
  };

  const latestHeartRate = useMemo(() => {
    if (!heartRateData?.length) return 78;

    const allSamples = heartRateData.flatMap((r: any) => r.samples || []);
    if (!allSamples.length) return 78;

    const sorted = allSamples.sort(
      (a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    return sorted[0].beatsPerMinute;
  }, [heartRateData]);

  const lastUpdatedTime = useMemo(() => {
    if (!heartRateData?.length) return '';

    const allSamples = heartRateData.flatMap((r: any) => r.samples || []);
    if (!allSamples.length) return '';

    const sorted = allSamples.sort(
      (a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    const latestTime = new Date(sorted[0].time);

    return latestTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [heartRateData]);

  const heartRateChart = useMemo(() => {
    if (!heartRateData?.length) {
      return [{ value: 60 }, { value: 70 }, { value: 75 }, { value: 80 }, { value: 78 }];
    }

    const allSamples = heartRateData.flatMap((r: any) => r.samples || []);
    if (!allSamples.length) return [];

    const sorted = allSamples.sort(
      (a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    const lastSamples = sorted.slice(-14);

    return lastSamples.map((s: any) => ({
      value: s.beatsPerMinute,
    }));
  }, [heartRateData]);

  const totalSteps = useMemo(() => {
    if (!stepsData?.length) return 4880;

    return stepsData.reduce((sum: number, item: any) => {
      return sum + (item.count ?? 0);
    }, 0);
  }, [stepsData]);

  const sleepHours = useMemo(() => {
    const session = sleepData?.[0];
    if (!session?.startTime || !session?.endTime) return 8;

    const start = new Date(session.startTime).getTime();
    const end = new Date(session.endTime).getTime();

    return Math.round(((end - start) / (1000 * 60 * 60)) * 10) / 10;
  }, [sleepData]);

  const formatApptTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const displayName = user?.full_name?.split(' ')[0] ?? 'User';
  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'long',
  });

  return (
    <SafeAreaView className="flex flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-pink-50/30 px-6 pb-24 pt-6">
        <View className="mb-8 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-red-400">
              <Text className="text-lg font-bold text-white">
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text className="text-xl font-bold text-gray-900">Hello, {displayName}!</Text>
              <Text className="font-mono text-xs uppercase text-gray-500">{todayLabel}</Text>
            </View>
          </View>
          <TouchableOpacity className="rounded-2xl border border-gray-100 bg-white p-3" />
        </View>

        <View className="mb-8">
          <Text className="mb-4 text-lg font-bold text-gray-900">Upcoming Appointments</Text>

          {loadingAppts ? (
            <View className="gap-4">
              <CardSkeleton />
            </View>
          ) : upcomingAppointments.length === 0 ? (
            <AppCard className="items-center p-6">
              <Text className="text-sm text-gray-500">No upcoming appointments</Text>
            </AppCard>
          ) : (
            <View className="gap-4">
              {upcomingAppointments.map((appt) => {
                const doctor = getDoctorForAppointment(appt.doctor);
                return (
                  <AppCard key={appt.id} className="flex-row items-center justify-between p-5">
                    <View className="flex-row items-center gap-4">
                      <View className="h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
                        <Foundation name="first-aid" size={28} color="#3b82f6" />
                      </View>
                      <View>
                        <Text className="font-bold text-gray-900">
                          {doctor?.specialization ?? 'Doctor'}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          {doctor?.hospital_name ?? 'Hospital'}
                        </Text>
                        <Text className="mt-1 text-xs text-red-400">
                          {formatApptTime(appt.scheduled_time)}, Today
                        </Text>
                      </View>
                    </View>

                    <AppButton
                      onPress={() =>
                        nav.navigate('AppointmentDetails', { appointmentId: appt.id })
                      }
                      label="View"
                      variant="secondary"
                      className="px-4 py-2"
                      textClassName="text-xs"
                    />
                  </AppCard>
                );
              })}
            </View>
          )}
        </View>

        <View className="mb-4">
          <Text className="mb-4 text-lg font-bold text-gray-900">Health Vitals & Activity</Text>

          <View className="flex-row gap-4">
            <AppCard className="flex-1" onPress={() => nav.navigate('HeartRate')}>
              <View className="pl-5 pr-5 pt-5">
                <View className="mb-4 flex-row items-center justify-between">
                  <Text className="text-xs font-bold uppercase">Health Vitals</Text>
                  <View className="aspect-square rounded-lg bg-red-50 p-1.5">
                    <Foundation name="heart" size={16} color="#f87171" />
                  </View>
                </View>

                <View className="mt-auto">
                  <View className="flex-row items-end">
                    <Text className="text-4xl font-extrabold">{latestHeartRate}</Text>
                    <Text className="text-md ml-1 text-gray-500">bpm</Text>
                  </View>

                  {!!lastUpdatedTime && (
                    <Text className="mt-1 text-[10px] text-gray-400">
                      Last updated: {lastUpdatedTime}
                    </Text>
                  )}
                </View>
              </View>

              <View
                onLayout={onChartLayout}
                className="ml-[-0.8rem] w-[calc(100%+0.8rem)] overflow-hidden">
                {chartWidth > 10 && (
                  <LineChart
                    data={heartRateChart}
                    width={chartWidth}
                    height={60}
                    curved
                    isAnimated
                    hideDataPoints
                    hideYAxisText
                    hideAxesAndRules
                    hideRules
                    thickness={2}
                    color="#f87171"
                    areaChart
                    startFillColor="rgba(248, 113, 113, 0.5)"
                    endFillColor="rgba(255, 255, 255, 1)"
                    startOpacity={1}
                    endOpacity={0.2}
                    spacing={chartWidth / 14}
                  />
                )}
              </View>
            </AppCard>

            <View className="flex-1 gap-4">
              <AppCard className="flex-1 p-4" onPress={() => nav.navigate('sleep')}>
                <View className="flex-row justify-between">
                  <View className="flex-1">
                    <Text className="text-[10px] font-bold uppercase">Sleep</Text>
                    <Text className="mt-1 text-2xl font-extrabold">
                      {sleepHours} <Text className="text-[10px] text-gray-500">Hrs</Text>
                    </Text>
                  </View>

                  <View className="aspect-square w-9 items-center justify-center rounded-lg bg-green-50">
                    <Foundation name="lightbulb" size={24} color="#009C35" />
                  </View>
                </View>
              </AppCard>

              <AppCard className="flex-1 p-4" onPress={() => nav.navigate('Steps')}>
                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-[10px] font-bold uppercase">Daily Steps</Text>
                    <Text className="mt-1 text-2xl font-extrabold">{totalSteps}</Text>
                  </View>

                  <View className="aspect-square w-9 items-center justify-center rounded-lg bg-orange-50">
                    <Foundation name="foot" size={24} color="#fb923c" />
                  </View>
                </View>
              </AppCard>
            </View>
          </View>
        </View>

        <View className="flex-row gap-4">
          <AppCard bordered={false} className="flex-1 p-4">
            <Text className="text-[10px] font-bold uppercase">Calories Burned</Text>
            <Text className="mt-1 text-2xl font-extrabold text-blue-400">{calories} kcal</Text>
          </AppCard>

          <AppCard bordered={false} className="flex-1 p-4">
            <Text className="text-[10px] font-bold uppercase">Stress Level</Text>
            <Text className="mt-1 text-2xl font-extrabold">{stress}/100</Text>

            <View className="mt-2 h-1 rounded-full bg-gray-200">
              <View className="h-full rounded-full bg-purple-500" style={{ width: `${stress}%` }} />
            </View>
          </AppCard>
        </View>

        <TouchableOpacity
          onPress={() => nav.navigate('chat')}
          className="mt-6 rounded-3xl bg-red-400 p-6">
          <Text className="mb-1 text-xl font-bold text-white">Not Feeling Well?</Text>
          <Text className="text-sm text-white/80">Find a specialist now</Text>
        </TouchableOpacity>

        <View className="h-32 w-full" />
      </ScrollView>
    </SafeAreaView>
  );
}
