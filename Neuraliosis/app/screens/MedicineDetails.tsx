import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Foundation from '@expo/vector-icons/Foundation';
import { useState } from 'react';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';

export default function MedicineDetailsScreen() {
  const [qty, setQty] = useState(1);

  const medicine = {
    name: 'Paracetamol 500mg',
    category: 'Pain Relief',
    price: 5,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    description:
      'Paracetamol is used to treat mild to moderate pain and reduce fever. It is commonly used for headaches, muscle aches, and cold symptoms.',
    dosage: '1–2 tablets every 6 hours as needed. Do not exceed 8 tablets per day.',
    sideEffects: 'Rare: nausea, rash, liver issues if overdosed.',
    warning: 'Avoid alcohol. Do not use if you have severe liver disease.',
  };

  return (
    <SafeAreaView className="flex-1 bg-red-50/30">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pb-28 pt-6">
        <AppCard bordered={false} className="p-0">
          <Image source={{ uri: medicine.image }} className="h-56 w-full rounded-2xl" />
        </AppCard>

        <View className="mt-5">
          <Text className="text-2xl font-bold text-gray-900">{medicine.name}</Text>
          <Text className="text-xs text-gray-500">{medicine.category}</Text>

          <Text className="mt-2 text-xl font-extrabold text-red-500">${medicine.price}</Text>
        </View>

        <AppCard bordered={false} className="mt-6 p-5">
          <Text className="mb-2 text-sm font-bold uppercase text-gray-700">Description</Text>
          <Text className="leading-5 text-gray-700">{medicine.description}</Text>
        </AppCard>

        <AppCard bordered={false} className="mt-4 p-5">
          <Text className="mb-2 text-sm font-bold uppercase text-gray-700">Dosage</Text>
          <Text className="text-gray-700">{medicine.dosage}</Text>
        </AppCard>

        <AppCard bordered={false} className="mt-4 p-5">
          <Text className="mb-2 text-sm font-bold uppercase text-gray-700">Side Effects</Text>
          <Text className="text-gray-700">{medicine.sideEffects}</Text>
        </AppCard>

        <AppCard bordered={false} className="mt-4 border border-red-100 bg-red-50 p-5">
          <View className="mb-2 flex-row items-center gap-2">
            <Foundation name="alert" size={18} color="#f87171" />
            <Text className="text-sm font-bold uppercase text-gray-700">Warning</Text>
          </View>
          <Text className="text-gray-700">{medicine.warning}</Text>
        </AppCard>
        <View className="mb-28" />
      </ScrollView>

      <View className="absolute bottom-10 left-0 right-0 border-t border-gray-100 bg-white px-6 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => setQty(Math.max(1, qty - 1))}
              className="h-8 w-8 items-center justify-center rounded-full bg-red-100">
              <Text className="font-bold text-red-600">-</Text>
            </TouchableOpacity>

            <Text className="font-bold text-gray-900">{qty}</Text>

            <TouchableOpacity
              onPress={() => setQty(qty + 1)}
              className="h-8 w-8 items-center justify-center rounded-full bg-red-100">
              <Text className="font-bold text-red-600">+</Text>
            </TouchableOpacity>
          </View>

          <AppButton className="px-6" label={`Add to Cart • $${medicine.price * qty}`} />
        </View>
      </View>
    </SafeAreaView>
  );
}
