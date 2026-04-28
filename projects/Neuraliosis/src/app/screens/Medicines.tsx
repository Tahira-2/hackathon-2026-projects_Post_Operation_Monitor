import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Foundation from '@expo/vector-icons/Foundation';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AiRecommendationCard from '../components/AiRecommendationCard';
import AppButton from '../components/AppButton';
import { listMedicines } from 'api/medicines-service';
import type { Medicine } from 'api/models';
import { useCartStore } from 'store/cart-store';
import { CardSkeleton } from '../components/SkeletonLoader';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function OTCMedicinesScreen() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  const { items, addItem } = useCartStore();
  const nav: any = useNavigation();

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          const data = await listMedicines();
          if (!cancelled) setMedicines(data);
        } catch { /* silent */ }
        finally { if (!cancelled) setLoading(false); }
      })();
      return () => { cancelled = true; };
    }, [])
  );

  const categories = useMemo(() => {
    const cats = new Set(medicines.map((m) => m.category));
    return ['All', ...Array.from(cats)];
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    return medicines.filter((item) => {
      const matchCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [search, activeCategory, medicines]);

  return (
    <SafeAreaView className="flex-1 bg-red-50/30">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pb-24 pt-6">
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">OTC Medicines</Text>
            <Text className="text-xs text-gray-500">Search & buy safe medicines</Text>
          </View>

          <TouchableOpacity 
            onPress={() => nav.navigate('Cart')}
            className="relative rounded-2xl bg-white p-3">
            <Foundation name="shopping-cart" size={22} color="#f87171" />
            {items.length > 0 && (
              <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-red-400">
                <Text className="text-[10px] font-bold text-white">{items.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className="mb-4 flex-row items-center gap-3 rounded-2xl bg-white px-4 py-3">
          <Foundation name="magnifying-glass" size={18} color="#f87171" />
          <TextInput
            placeholder="Search medicines..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 text-gray-700"
          />
        </View>
        <AiRecommendationCard
          title="AI Medicine Assistant"
          description="Tell us your symptoms and we’ll recommend the right medicine"
          onPress={() => nav.navigate('chat')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          className="mb-6">
          <View className="flex-row gap-3">
            {categories.map((cat) => {
              const active = cat === activeCategory;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setActiveCategory(cat)}
                  className={`rounded-full px-4 py-2 ${active ? 'bg-red-400' : 'bg-red-100'}`}>
                  <Text className={`text-xs font-bold ${active ? 'text-white' : 'text-red-600'}`}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View className="flex-row flex-wrap justify-between">
          {loading ? (
            <>
              <CardSkeleton /><CardSkeleton />
            </>
          ) : filteredMedicines.map((item) => (
            <TouchableOpacity
              onPress={() => nav.navigate('MedicineDetails', { medicineId: item.id })}
              key={item.id}
              style={{ width: CARD_WIDTH }}
              className="mb-4 rounded-3xl bg-white p-3">
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} className="h-28 w-full rounded-2xl" />
              ) : (
                <View className="h-28 w-full rounded-2xl bg-gray-100 items-center justify-center">
                   <Ionicons name="medkit-outline" size={32} color="#9ca3af" />
                </View>
              )}

              <Text numberOfLines={1} className="mt-3 font-bold text-gray-900">
                {item.name}
              </Text>

              <Text className="text-[10px] text-gray-500" numberOfLines={1}>{item.category}</Text>

              <View className="mt-3 flex-row items-center justify-between">
                <Text className="font-bold text-red-500">${item.price}</Text>

                <AppButton
                  onPress={() => addItem(item)}
                  label="Add"
                  className="rounded-xl px-3 py-2"
                  textClassName="text-[10px]"
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
