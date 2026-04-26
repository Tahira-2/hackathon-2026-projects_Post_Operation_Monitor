import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getMyOrders } from 'api/orders-service';
import type { Order } from 'api/models';
import AppCard from '../components/AppCard';
import { CardSkeleton } from '../components/SkeletonLoader';

function statusColor(status: string) {
  switch (status) {
    case 'confirmed': return 'bg-green-100 text-green-700';
    case 'cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-blue-100 text-blue-700';
  }
}

export default function OrdersScreen() {
  const nav = useNavigation<any>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          const data = await getMyOrders();
          if (!cancelled) setOrders(data);
        } catch { /* silent */ }
        finally { if (!cancelled) setLoading(false); }
      })();
      return () => { cancelled = true; };
    }, []),
  );

  return (
    <SafeAreaView className="flex-1 bg-red-50/30">
      <View className="flex-row items-center gap-3 px-6 pt-4 pb-2">
        <TouchableOpacity onPress={() => nav.goBack()} className="rounded-xl bg-white p-2">
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">My Orders</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="gap-4">
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
          </View>
        ) : orders.length === 0 ? (
          <View className="mt-20 items-center">
            <Ionicons name="bag-outline" size={64} color="#d1d5db" />
            <Text className="mt-4 text-gray-400">No orders yet</Text>
          </View>
        ) : (
          <View className="gap-4">
            {orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                onPress={() => nav.navigate('OrderDetail', { orderId: order.id })}>
                <AppCard className="p-5">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="font-bold text-gray-900">Order #{order.id}</Text>
                      <Text className="text-xs text-gray-500">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </Text>
                      <Text className="mt-1 text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </Text>
                    </View>
                    <View className="items-end gap-2">
                      <Text className="text-lg font-extrabold text-gray-900">
                        ${parseFloat(order.total).toFixed(2)}
                      </Text>
                      <View className={`rounded-full px-3 py-1 ${statusColor(order.status)}`}>
                        <Text className="text-xs font-bold">
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </AppCard>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
