import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from 'store/cart-store';
import { placeOrder } from 'api/orders-service';
import { getErrorMessage } from 'api/contracts';
import AppCard from '../components/AppCard';

export default function CartScreen() {
  const nav = useNavigation<any>();
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCartStore();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    Alert.alert('Place Order', `Confirm order of $${totalPrice().toFixed(2)}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          setLoading(true);
          try {
            await placeOrder({
              items: items.map((i) => ({
                medicine_id: i.medicine.id,
                quantity: i.quantity,
              })),
            });
            clearCart();
            Alert.alert('Order Placed!', 'Your order has been confirmed.', [
              { text: 'View Orders', onPress: () => nav.navigate('Orders') },
              { text: 'OK', onPress: () => nav.goBack() },
            ]);
          } catch (err) {
            Alert.alert('Error', getErrorMessage(err));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-red-50/30">
      {/* Header */}
      <View className="flex-row items-center gap-3 px-6 pt-4 pb-2">
        <TouchableOpacity onPress={() => nav.goBack()} className="rounded-xl bg-white p-2">
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">My Cart</Text>
        <Text className="ml-auto text-sm text-gray-500">{totalItems()} item{totalItems() !== 1 ? 's' : ''}</Text>
      </View>

      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="cart-outline" size={64} color="#d1d5db" />
          <Text className="mt-4 text-lg font-bold text-gray-400">Your cart is empty</Text>
          <TouchableOpacity
            onPress={() => nav.goBack()}
            className="mt-4 rounded-2xl bg-red-400 px-6 py-3">
            <Text className="font-bold text-white">Browse Medicines</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
            <View className="gap-4">
              {items.map((item) => (
                <AppCard key={item.medicine.id} className="p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-bold text-gray-900" numberOfLines={1}>
                        {item.medicine.name}
                      </Text>
                      <Text className="text-xs text-gray-500">{item.medicine.category}</Text>
                      <Text className="mt-1 font-bold text-red-500">
                        ${(parseFloat(item.medicine.price) * item.quantity).toFixed(2)}
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-3">
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.medicine.id, item.quantity - 1)}
                        className="h-8 w-8 items-center justify-center rounded-full bg-red-100">
                        <Text className="font-bold text-red-600">-</Text>
                      </TouchableOpacity>
                      <Text className="w-6 text-center font-bold text-gray-900">
                        {item.quantity}
                      </Text>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.medicine.id, item.quantity + 1)}
                        className="h-8 w-8 items-center justify-center rounded-full bg-red-100">
                        <Text className="font-bold text-red-600">+</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => removeItem(item.medicine.id)}
                        className="ml-2 rounded-xl bg-gray-100 p-2">
                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </AppCard>
              ))}
            </View>
            <View className="h-40" />
          </ScrollView>

          {/* Footer */}
          <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-6 py-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-base text-gray-500">Total</Text>
              <Text className="text-2xl font-extrabold text-gray-900">
                ${totalPrice().toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleCheckout}
              disabled={loading}
              className={`rounded-2xl py-4 ${loading ? 'bg-red-300' : 'bg-red-400'}`}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center text-base font-bold text-white">
                  Place Order
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
