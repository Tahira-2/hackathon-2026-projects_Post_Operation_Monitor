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
import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AiRecommendationCard from '../components/AiRecommendationCard';
import AppButton from '../components/AppButton';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const CATEGORIES = ['All', 'Pain', 'Allergy', 'Immunity'];

const MEDICINES = [
  {
    id: 1,
    name: 'Paracetamol 500mg',
    category: 'Pain',
    price: 5,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200',
  },
  {
    id: 2,
    name: 'Cetirizine 10mg',
    category: 'Allergy',
    price: 7,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200',
  },
  {
    id: 3,
    name: 'Ibuprofen 400mg',
    category: 'Pain',
    price: 6,
    image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=200',
  },
  {
    id: 4,
    name: 'Vitamin C Tablets',
    category: 'Immunity',
    price: 10,
    image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=200',
  },
];

export default function OTCMedicinesScreen() {
  const [cart, setCart] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const addToCart = (id: number) => {
    setCart((prev) => [...prev, id]);
  };

  const filteredMedicines = useMemo(() => {
    return MEDICINES.filter((item) => {
      const matchCategory = activeCategory === 'All' || item.category === activeCategory;

      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [search, activeCategory]);

  const nav: any = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-red-50/30">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pb-24 pt-6">
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">OTC Medicines</Text>
            <Text className="text-xs text-gray-500">Search & buy safe medicines</Text>
          </View>

          <TouchableOpacity className="relative rounded-2xl bg-white p-3">
            <Foundation name="shopping-cart" size={22} color="#f87171" />
            {cart.length > 0 && (
              <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-red-400">
                <Text className="text-[10px] font-bold text-white">{cart.length}</Text>
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
          onPress={() => {
            nav.navigate('chat');
          }}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          className="mb-6">
          <View className="flex-row gap-3">
            {CATEGORIES.map((cat) => {
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
          {filteredMedicines.map((item) => (
            <TouchableOpacity
              onPress={() => nav.navigate('MedicineDetails', { medicine: item })}
              key={item.id}
              style={{ width: CARD_WIDTH }}
              className="mb-4 rounded-3xl bg-white p-3">
              <Image source={{ uri: item.image }} className="h-28 w-full rounded-2xl" />

              <Text numberOfLines={1} className="mt-3 font-bold text-gray-900">
                {item.name}
              </Text>

              <Text className="text-[10px] text-gray-500">{item.category}</Text>

              <View className="mt-3 flex-row items-center justify-between">
                <Text className="font-bold text-red-500">${item.price}</Text>

                <AppButton
                  onPress={() => addToCart(item.id)}
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
