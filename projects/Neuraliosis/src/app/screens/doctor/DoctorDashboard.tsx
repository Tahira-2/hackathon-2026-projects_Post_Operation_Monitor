import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth-store';
import AppCard from '../../components/AppCard';
import { useNavigation } from '@react-navigation/native';

export default function DoctorDashboardScreen() {
  const { user } = useAuthStore();
  const nav = useNavigation<any>();

  if (!user) return null;

  return (
    <SafeAreaView className="flex-1 bg-red-50/30">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-6">
        
        <View className="mb-8 flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider">Welcome Back</Text>
            <Text className="text-2xl font-extrabold text-gray-900 mt-1">Dr. {user.full_name.split(' ')[0]}</Text>
          </View>
          
          <TouchableOpacity onPress={() => nav.navigate('Account')}>
             {user.photo_url ? (
                <Image source={{ uri: user.photo_url }} className="h-12 w-12 rounded-full border-2 border-white" />
             ) : (
                <View className="h-12 w-12 items-center justify-center rounded-full bg-red-100 border-2 border-white">
                  <Text className="text-xl font-bold text-red-500">
                    {user.full_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
             )}
          </TouchableOpacity>
        </View>

        <Text className="mb-4 text-lg font-bold text-gray-900">Quick Actions</Text>
        
        <View className="flex-row flex-wrap justify-between gap-y-4">
          <TouchableOpacity 
             onPress={() => nav.navigate('DoctorAppointments')}
             style={{ width: '48%' }} 
             className="rounded-3xl bg-blue-500 p-5 shadow-sm shadow-blue-200">
             <View className="mb-4 h-10 w-10 items-center justify-center rounded-full bg-white/20">
               <Ionicons name="calendar" size={24} color="white" />
             </View>
             <Text className="font-bold text-white text-lg">Appointments</Text>
             <Text className="text-blue-100 text-xs mt-1">View patient bookings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
             onPress={() => nav.navigate('DoctorSlots')}
             style={{ width: '48%' }} 
             className="rounded-3xl bg-emerald-500 p-5 shadow-sm shadow-emerald-200">
             <View className="mb-4 h-10 w-10 items-center justify-center rounded-full bg-white/20">
               <Ionicons name="time" size={24} color="white" />
             </View>
             <Text className="font-bold text-white text-lg">My Slots</Text>
             <Text className="text-emerald-100 text-xs mt-1">Manage availability</Text>
          </TouchableOpacity>

          <TouchableOpacity 
             onPress={() => nav.navigate('Account')}
             style={{ width: '48%' }} 
             className="rounded-3xl bg-indigo-500 p-5 shadow-sm shadow-indigo-200">
             <View className="mb-4 h-10 w-10 items-center justify-center rounded-full bg-white/20">
               <Ionicons name="person" size={24} color="white" />
             </View>
             <Text className="font-bold text-white text-lg">Profile</Text>
             <Text className="text-indigo-100 text-xs mt-1">Update details</Text>
          </TouchableOpacity>

          <TouchableOpacity 
             style={{ width: '48%' }} 
             className="rounded-3xl bg-orange-500 p-5 shadow-sm shadow-orange-200">
             <View className="mb-4 h-10 w-10 items-center justify-center rounded-full bg-white/20">
               <Ionicons name="stats-chart" size={24} color="white" />
             </View>
             <Text className="font-bold text-white text-lg">Stats</Text>
             <Text className="text-orange-100 text-xs mt-1">View performance</Text>
          </TouchableOpacity>
        </View>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
