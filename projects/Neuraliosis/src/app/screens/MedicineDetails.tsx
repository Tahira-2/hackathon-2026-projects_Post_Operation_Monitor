import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Foundation from '@expo/vector-icons/Foundation';
import { useState, useCallback } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { getMedicineDetail } from 'api/medicines-service';
import type { Medicine } from 'api/models';
import { useCartStore } from 'store/cart-store';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import { ProfileSkeleton } from '../components/SkeletonLoader';

export default function MedicineDetailsScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { medicineId } = route.params;

  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  const { addItem, items } = useCartStore();

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          const data = await getMedicineDetail(medicineId);
          if (!cancelled) setMedicine(data);
        } catch { /* silent */ }
        finally { if (!cancelled) setLoading(false); }
      })();
      return () => { cancelled = true; };
    }, [medicineId])
  );

  const handleAddToCart = () => {
    if (!medicine) return;
    for (let i = 0; i < qty; i++) {
      addItem(medicine);
    }
    nav.goBack();
  };

  if (loading || !medicine) {
    return (
      <SafeAreaView className="flex-1 bg-red-50/30">
        <View className="p-6">
           <TouchableOpacity onPress={() => nav.goBack()} className="mb-4 self-start rounded-xl bg-white p-2">
             <Ionicons name="arrow-back" size={20} color="#374151" />
           </TouchableOpacity>
           <ProfileSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-red-50/30">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pb-28 pt-6">
        <TouchableOpacity onPress={() => nav.goBack()} className="mb-4 self-start rounded-xl bg-white p-2 shadow-sm">
           <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>

        <AppCard bordered={false} className="p-0 overflow-hidden bg-white items-center justify-center">
          {medicine.image_url ? (
             <Image source={{ uri: medicine.image_url }} className="h-64 w-full" resizeMode="contain" />
          ) : (
             <View className="h-64 w-full items-center justify-center bg-gray-50">
               <Ionicons name="medkit-outline" size={64} color="#9ca3af" />
             </View>
          )}
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

        {medicine.requires_prescription && (
          <AppCard bordered={false} className="mt-4 border border-red-100 bg-red-50 p-5">
            <View className="mb-2 flex-row items-center gap-2">
              <Foundation name="alert" size={18} color="#f87171" />
              <Text className="text-sm font-bold uppercase text-gray-700">Prescription Required</Text>
            </View>
            <Text className="text-gray-700">You must provide a valid prescription from a doctor to order this medicine.</Text>
          </AppCard>
        )}

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

          <AppButton 
             onPress={handleAddToCart}
             className="px-6" 
             label={`Add to Cart • $${(parseFloat(medicine.price) * qty).toFixed(2)}`} 
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
