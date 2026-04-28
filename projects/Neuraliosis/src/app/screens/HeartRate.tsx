import { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Foundation from '@expo/vector-icons/Foundation';
import { LineChart } from 'react-native-gifted-charts';

import { useHealthConnect } from 'hooks/useHealthData';
import AppCard from '../components/AppCard';

const HEALTH_WINDOW_MS = 24 * 60 * 60 * 1000;

export default function HeartRateView() {
  const [chartWidth, setChartWidth] = useState(0);
  const { data: heartRateData, fetchHealthData: fetchHeartRate } = useHealthConnect();

  const fetchLatestHeartRate = useCallback(async () => {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - HEALTH_WINDOW_MS);

    await fetchHeartRate({
      recordType: 'HeartRate',
      timeRangeFilter: {
        operator: 'between',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      },
    });
  }, [fetchHeartRate]);

  useFocusEffect(
    useCallback(() => {
      void fetchLatestHeartRate();
    }, [fetchLatestHeartRate])
  );

  const samples = useMemo(() => {
    return heartRateData?.[0]?.samples ?? [];
  }, [heartRateData]);

  const latestHeartRate = useMemo(() => {
    return samples[0]?.beatsPerMinute ?? 78;
  }, [samples]);

  const averageHeartRate = useMemo(() => {
    if (!samples.length) {
      return 74;
    }

    const total = samples.reduce((sum: number, item: any) => {
      return sum + (item.beatsPerMinute ?? 0);
    }, 0);

    return Math.round(total / samples.length);
  }, [samples]);

  const restingHeartRate = useMemo(() => {
    if (!samples.length) {
      return 65;
    }

    return Math.round(Math.min(...samples.map((item: any) => item.beatsPerMinute ?? 0)));
  }, [samples]);

  const maxHeartRate = useMemo(() => {
    if (!samples.length) {
      return 92;
    }

    return Math.round(Math.max(...samples.map((item: any) => item.beatsPerMinute ?? 0)));
  }, [samples]);

  const chartData = useMemo(() => {
    if (!samples.length) {
      return [{ value: 62 }, { value: 70 }, { value: 75 }, { value: 82 }, { value: 78 }];
    }

    return samples.slice(0, 18).map((item: any) => ({ value: item.beatsPerMinute }));
  }, [samples]);

  const onChartLayout = (e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width);
  };

  return (
    <SafeAreaView className="flex-1 bg-pink-50/30">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pb-10 pt-6">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">Heart Rate</Text>
          <Text className="text-xs text-gray-500">Live and daily summary</Text>
        </View>

        <AppCard className="mb-6 p-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase text-gray-500">Current</Text>
            <View className="rounded-lg bg-red-50 p-2">
              <Foundation name="heart" size={18} color="#f87171" />
            </View>
          </View>

          <View className="flex-row items-end">
            <Text className="text-5xl font-extrabold text-gray-900">{latestHeartRate}</Text>
            <Text className="ml-2 text-sm text-gray-500">bpm</Text>
          </View>
        </AppCard>

        <View className="mb-6 flex-row gap-4">
          <AppCard className="flex-1 p-4">
            <Text className="text-xs font-bold uppercase text-gray-500">Average</Text>
            <Text className="mt-1 text-2xl font-extrabold text-gray-900">{averageHeartRate}</Text>
          </AppCard>

          <AppCard className="flex-1 p-4">
            <Text className="text-xs font-bold uppercase text-gray-500">Resting</Text>
            <Text className="mt-1 text-2xl font-extrabold text-gray-900">{restingHeartRate}</Text>
          </AppCard>

          <AppCard className="flex-1 p-4">
            <Text className="text-xs font-bold uppercase text-gray-500">Peak</Text>
            <Text className="mt-1 text-2xl font-extrabold text-gray-900">{maxHeartRate}</Text>
          </AppCard>
        </View>

        <AppCard className="p-0">
          <View className="flex-row items-center justify-between p-5">
            <Text className="text-xs font-bold uppercase text-gray-500">Trend (24h)</Text>
            <Foundation name="graph-trend" size={18} color="#f87171" />
          </View>

          <View className="-ml-3" onLayout={onChartLayout}>
            {chartWidth > 0 && (
              <LineChart
                data={chartData}
                width={chartWidth - 12}
                height={140}
                initialSpacing={0}
                endSpacing={0}
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
                spacing={Math.max(16, (chartWidth - 12) / Math.max(chartData.length, 1))}
              />
            )}
          </View>
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}
