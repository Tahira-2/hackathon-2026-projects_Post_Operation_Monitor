import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import { getOrderDetail } from 'api/orders-service';
import type { Order } from 'api/models';
import AppCard from '../components/AppCard';
import { ProfileSkeleton } from '../components/SkeletonLoader';

function statusColor(status: string) {
  switch (status) {
    case 'confirmed': return 'bg-green-100 text-green-700';
    case 'cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-blue-100 text-blue-700';
  }
}

export default function OrderDetailScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          const data = await getOrderDetail(orderId);
          if (!cancelled) setOrder(data);
        } catch { /* silent */ }
        finally { if (!cancelled) setLoading(false); }
      })();
      return () => { cancelled = true; };
    }, [orderId]),
  );

  return (
    <SafeAreaView className="flex-1 bg-red-50/30">
      <View className="flex-row items-center gap-3 px-6 pt-4 pb-2">
        <TouchableOpacity onPress={() => nav.goBack()} className="rounded-xl bg-white p-2">
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Order Details</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {loading || !order ? (
          <ProfileSkeleton />
        ) : (
          <>
            <AppCard className="mb-4 p-5">
              <View className="flex-row items-center justify-between mb-4 border-b border-gray-100 pb-4">
                <View>
                  <Text className="text-sm text-gray-500">Order ID</Text>
                  <Text className="font-bold text-gray-900">#{order.id}</Text>
                </View>
                <View className={`rounded-full px-3 py-1 ${statusColor(order.status)}`}>
                  <Text className="text-xs font-bold">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-gray-500">Date</Text>
                <Text className="font-bold text-gray-900">
                  {new Date(order.created_at).toLocaleString('en-US', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </Text>
              </View>
              
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-500">Total</Text>
                <Text className="text-lg font-extrabold text-red-500">
                  ${parseFloat(order.total).toFixed(2)}
                </Text>
              </View>
            </AppCard>

            <Text className="mb-3 text-lg font-bold text-gray-900">Items ({order.items.length})</Text>
            
            <View className="gap-3">
              {order.items.map((item) => (
                <AppCard key={item.id} className="p-4 flex-row items-center gap-4">
                  {item.medicine_detail.image_url ? (
                    <Image source={{ uri: item.medicine_detail.image_url }} className="h-16 w-16 rounded-xl" />
                  ) : (
                    <View className="h-16 w-16 items-center justify-center rounded-xl bg-gray-100">
                      <Ionicons name="medkit-outline" size={24} color="#9ca3af" />
                    </View>
                  )}
                  
                  <View className="flex-1">
                    <Text className="font-bold text-gray-900" numberOfLines={1}>{item.medicine_detail.name}</Text>
                    <Text className="text-xs text-gray-500">{item.medicine_detail.category}</Text>
                    <View className="mt-1 flex-row justify-between">
                      <Text className="text-sm font-bold text-gray-600">Qty: {item.quantity}</Text>
                      <Text className="text-sm font-bold text-gray-900">${parseFloat(item.price).toFixed(2)}</Text>
                    </View>
                  </View>
                </AppCard>
              ))}
            </View>
            <View className="h-24" />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
