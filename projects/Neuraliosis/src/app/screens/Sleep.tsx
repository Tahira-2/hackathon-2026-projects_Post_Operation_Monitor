import { View, Text, Image, TouchableOpacity, ScrollView, LayoutChangeEvent } from 'react-native';
import Foundation from '@expo/vector-icons/Foundation';
import { LineChart } from 'react-native-gifted-charts';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SleepView() {
  const [chartWidth, setChartWidth] = useState(0);

  const onChartLayout = (e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width);
  };

  const sleepHistory = [
    { day: 'Mon', hours: 6.5 },
    { day: 'Tue', hours: 7.2 },
    { day: 'Wed', hours: 5.8 },
    { day: 'Thu', hours: 8.1 },
    { day: 'Fri', hours: 7.5 },
    { day: 'Sat', hours: 6.9 },
    { day: 'Sun', hours: 8.0 },
  ];

  const avgSleep = sleepHistory.reduce((acc, cur) => acc + cur.hours, 0) / sleepHistory.length;

  const shouldSleepMore = avgSleep < 7;

  return (
    <SafeAreaView className="flex flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-pink-50/30 px-6 pb-24 pt-6">
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Sleep Tracker</Text>
            <Text className="text-xs uppercase text-gray-500">Weekly Overview</Text>
          </View>

          <View className="rounded-2xl bg-white p-3">
            <Foundation name="lightbulb" size={22} color="#f87171" />
          </View>
        </View>

        {shouldSleepMore && (
          <View className="mb-6 rounded-3xl border border-pink-100 bg-pink-50 p-5">
            <Text className="text-lg font-bold text-pink-900">You should sleep more</Text>
            <Text className="mt-1 text-xs text-red-400">
              Your average sleep is {avgSleep.toFixed(1)} hrs. Try to reach 7–8 hrs for better
              recovery.
            </Text>
          </View>
        )}

        <View className="mb-6 rounded-3xl border border-gray-100 bg-white p-5">
          <Text className="text-xs font-bold uppercase text-gray-500">Average Sleep</Text>

          <View className="mt-3 flex-row items-end">
            <Text className="text-5xl font-extrabold text-gray-900">{avgSleep.toFixed(1)}</Text>
            <Text className="ml-2 text-sm text-gray-500">hrs / day</Text>
          </View>

          <View className="mt-4 h-2 rounded-full bg-gray-100">
            <View
              className="h-full rounded-full bg-red-400"
              style={{ width: `${(avgSleep / 10) * 100}%` }}
            />
          </View>
        </View>

        <View className="mb-6 rounded-3xl border border-gray-100 bg-white p-0">
          <View className="mb-4 flex-row items-center justify-between p-5">
            <Text className="text-xs font-bold uppercase text-gray-500">Sleep Trend</Text>
            <Foundation name="graph-trend" size={18} color="#ec4899" />
          </View>

          <View className="-ml-3" onLayout={onChartLayout}>
            {chartWidth > 0 && (
              <LineChart
                data={sleepHistory.map((d) => ({ value: d.hours }))}
                width={chartWidth - 12}
                height={140}
                initialSpacing={0}
                endSpacing={0}
                curved
                isAnimated
                hideDataPoints
                hideYAxisText
                hideAxesAndRules
                textShiftY={-8}
                textShiftX={-10}
                textFontSize={0}
                hideRules
                thickness={2}
                color="#f87171"
                areaChart
                startFillColor="rgba(248, 113, 113, 0.5)"
                endFillColor="rgba(255, 255, 255, 1)"
                startOpacity={1}
                endOpacity={0.2}
                spacing={chartWidth / 6}
              />
            )}
          </View>
        </View>

        <View className="mb-6">
          <Text className="mb-4 text-lg font-bold text-gray-900">Sleep History</Text>

          <View className="gap-3">
            {sleepHistory.map((item) => (
              <View
                key={item.day}
                className="flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4">
                <Text className="font-bold text-gray-900">{item.day}</Text>

                <View className="flex-row items-end">
                  <Text className="text-2xl font-extrabold text-gray-900">
                    {item.hours.toFixed(1)}
                  </Text>
                  <Text className="ml-1 text-xs text-gray-500">hrs</Text>
                </View>

                <View className="h-2 w-24 rounded-full bg-gray-100">
                  <View
                    className="h-full rounded-full bg-red-400"
                    style={{ width: `${(item.hours / 10) * 100}%` }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity className="mb-12 rounded-3xl bg-red-400 p-6">
          <Text className="mb-1 text-xl font-bold text-white">Improve Your Sleep</Text>
          <Text className="text-sm text-white/80">Get personalized sleep recommendations</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
