import { View, Text } from 'react-native';
import Foundation from '@expo/vector-icons/Foundation';
import AppButton from './AppButton';
import AppCard from './AppCard';

type AiRecommendationCardProps = {
  title: string;
  description: string;
  placeholder?: string;
  buttonLabel?: string;
  onPress: () => void;
};

export default function AiRecommendationCard({
  title,
  description,
  placeholder = 'e.g. chest pain, headache, skin rash...',
  buttonLabel = 'Get AI Recommendation',
  onPress,
}: AiRecommendationCardProps) {
  return (
    <AppCard bordered={false} className="mb-6 border border-pink-200 bg-pink-50 p-5">
      <View className="flex-row items-center gap-3">
        <View className="rounded-2xl bg-white p-3">
          <Foundation name="lightbulb" size={22} color="#ec4899" />
        </View>

        <View className="flex-1">
          <Text className="text-lg font-extrabold text-gray-900">{title}</Text>
          <Text className="text-xs text-gray-600">{description}</Text>
        </View>
      </View>

      <View className="mt-4 rounded-2xl border border-gray-100 bg-white px-4 py-3">
        <Text className="text-xs text-gray-400">{placeholder}</Text>
      </View>

      <AppButton onPress={onPress} label={buttonLabel} variant="pink" className="mt-4" />
    </AppCard>
  );
}
