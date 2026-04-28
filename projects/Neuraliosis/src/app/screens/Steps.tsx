import { View, Text, ScrollView, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Foundation from '@expo/vector-icons/Foundation';
import { LineChart } from 'react-native-gifted-charts';
import { useState } from 'react';

export default function StepsView() {
  const [chartWidth, setChartWidth] = useState(0);

  const onChartLayout = (e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width);
  };

  const DAILY_GOAL = 8000;
  const steps = 4880;
  const miles = (steps / 2200).toFixed(2);
  const progress = steps / DAILY_GOAL;

  const goalStatus =
    steps >= DAILY_GOAL ? 'completed' : steps >= DAILY_GOAL * 0.6 ? 'close' : 'low';

  const statusColor =
    goalStatus === 'completed'
      ? 'bg-green-100 text-green-700'
      : goalStatus === 'close'
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-red-100 text-red-700';

  const history = [
    { day: 'Mon', steps: 7200 },
    { day: 'Tue', steps: 8100 },
    { day: 'Wed', steps: 6400 },
    { day: 'Thu', steps: 9000 },
    { day: 'Fri', steps: 3000 },
    { day: 'Sat', steps: 10500 },
    { day: 'Sun', steps: 4880 },
  ];

  const streak = history.filter((d) => d.steps >= DAILY_GOAL).length;

  return (
    <SafeAreaView className="flex-1 bg-pink-50/30">
      <ScrollView className="flex-1 px-6 pb-10 pt-6">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">Steps Activity</Text>
          <Text className="text-xs text-gray-500">Track your movement, distance & goals</Text>
        </View>

        <View className="mb-6 flex-row gap-4">
          <View className="flex-1 rounded-3xl border border-gray-100 bg-white p-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-bold uppercase text-gray-500">Steps</Text>
              <View className="rounded-lg bg-orange-50 p-2">
                <Foundation name="foot" size={18} color="#fb923c" />
              </View>
            </View>

            <Text className="mt-3 text-3xl font-extrabold text-gray-900">{steps}</Text>

            <Text className="mt-1 text-xs text-gray-500">Goal: {DAILY_GOAL}</Text>

            <View className="mt-3 h-2 w-full rounded-full bg-gray-100">
              <View
                className="h-full rounded-full bg-red-400"
                style={{ width: `${Math.min(progress * 100, 100)}%` }}
              />
            </View>

            <Text className="mt-2 text-[10px] text-gray-500">
              {Math.round(progress * 100)}% completed
            </Text>
          </View>
          <View className="flex-1 rounded-3xl border border-gray-100 bg-white p-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-bold uppercase text-gray-500">Distance</Text>
              <View className="rounded-lg bg-blue-50 p-2">
                <Foundation name="marker" size={18} color="#60a5fa" />
              </View>
            </View>

            <Text className="mt-3 text-3xl font-extrabold text-gray-900">
              {miles}
              <Text className="text-sm text-gray-500"> mi</Text>
            </Text>

            <Text className="mt-1 text-xs text-gray-500">Estimated today</Text>
          </View>
        </View>

        <View className="mb-6 rounded-3xl border border-gray-100 bg-white p-0">
          <Text className="mb-4 p-5 text-sm font-bold uppercase text-gray-700">Steps Trend</Text>

          <View className="-ml-3" onLayout={onChartLayout}>
            {chartWidth > 0 && (
              <LineChart
                data={history.map((d) => ({ value: d.steps }))}
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

        <View className="mb-6 rounded-3xl border border-gray-100 bg-white p-5">
          <Text className="mb-4 text-sm font-bold uppercase text-gray-700">Weekly History</Text>

          {history.map((item, index) => {
            const reached = item.steps >= DAILY_GOAL;

            return (
              <View
                key={index}
                className="mb-3 flex-row items-center justify-between rounded-2xl bg-gray-50 p-3">
                <Text className="font-bold text-gray-700">{item.day}</Text>

                <Text className="text-gray-900">{item.steps} steps</Text>

                <View
                  className={`rounded-full px-3 py-1 ${reached ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Text
                    className={`text-xs font-bold ${reached ? 'text-green-700' : 'text-red-700'}`}>
                    {reached ? 'Goal ✓' : 'Missed'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View className="mb-12 rounded-3xl border border-red-100 bg-red-50 p-5">
          <Text className="text-lg font-bold text-gray-900">
            {goalStatus === 'completed' ? 'Amazing Work' : 'Keep Moving'}
          </Text>

          <Text className="mt-1 text-sm text-gray-600">
            {goalStatus === 'completed'
              ? 'You hit your goal today. Keep the streak going!'
              : `You need ${DAILY_GOAL - steps} more steps to reach your goal.`}
          </Text>

          <TouchableOpacity className="mt-4 rounded-2xl bg-red-400 px-4 py-3">
            <Text className="text-center font-bold text-white">Start Walking</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
