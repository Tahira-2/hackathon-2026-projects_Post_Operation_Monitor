import { View, Text, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Foundation from '@expo/vector-icons/Foundation';
import { useNavigation } from '@react-navigation/native';
import AiRecommendationCard from '../components/AiRecommendationCard';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';

const APPOINTMENTS = [
  {
    id: 1,
    doctor: {
      name: 'Dr. Sarah Lee',
      specialty: 'Dermatologist',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200',
    },
    date: '12 Apr 2026',
    time: '10:30 AM',
    status: 'Completed',
  },
  {
    id: 2,
    doctor: {
      name: 'Dr. John Doe',
      specialty: 'Cardiologist',
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200',
    },
    date: '20 Mar 2026',
    time: '9:00 AM',
    status: 'Cancelled',
  },
  {
    id: 3,
    doctor: {
      name: 'Dr. Emily Watson',
      specialty: 'Neurologist',
      image: 'https://images.unsplash.com/photo-1594824475317-d0f5c2b6c7b4?w=200',
    },
    date: '28 Apr 2026',
    time: '2:00 PM',
    status: 'Upcoming',
  },
];

function getStatusStyle(status: string) {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-700';
    case 'Cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-blue-100 text-blue-700';
  }
}

export default function AppointmentHistory() {
  const nav = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-pink-50/30">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pb-10 pt-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">Appointment History</Text>
          <Text className="text-xs text-gray-500">Your past and upcoming consultations</Text>
        </View>

        {/* Stats */}
        <View className="mb-6 flex-row gap-4">
          <AppCard className="flex-1 p-4">
            <Text className="text-xs font-bold uppercase text-gray-500">Total</Text>
            <Text className="mt-1 text-2xl font-extrabold text-gray-900">12</Text>
          </AppCard>

          <AppCard className="flex-1 p-4">
            <Text className="text-xs font-bold uppercase text-gray-500">Completed</Text>
            <Text className="mt-1 text-2xl font-extrabold text-green-600">8</Text>
          </AppCard>

          <AppCard className="flex-1 p-4">
            <Text className="text-xs font-bold uppercase text-gray-500">Upcoming</Text>
            <Text className="mt-1 text-2xl font-extrabold text-blue-600">2</Text>
          </AppCard>
        </View>

        <AiRecommendationCard
          title="AI Doctor Assistant"
          description="Tell us your symptoms and we’ll recommend the right specialist"
          onPress={() => {
            nav.navigate('chat');
          }}
        />

        {/* Appointment List */}
        <View className="gap-4">
          {APPOINTMENTS.map((item) => (
            <AppCard key={item.id} className="p-5">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-4">
                  <Image source={{ uri: item.doctor.image }} className="h-14 w-14 rounded-2xl" />

                  <View>
                    <Text className="font-bold text-gray-900">{item.doctor.name}</Text>
                    <Text className="text-xs text-gray-500">{item.doctor.specialty}</Text>
                  </View>
                </View>

                <View className={`rounded-full px-3 py-1 ${getStatusStyle(item.status)}`}>
                  <Text className="text-xs font-bold">{item.status}</Text>
                </View>
              </View>

              <View className="mt-4 flex-row items-center justify-between">
                <View>
                  <Text className="text-xs text-gray-500">Date</Text>
                  <Text className="font-bold text-gray-900">
                    {item.date} • {item.time}
                  </Text>
                </View>

                <Foundation name="calendar" size={22} color="#fb923c" />
              </View>

              <View className="mt-4 flex-row gap-3">
                <AppButton
                  onPress={() => {
                    nav.navigate('AppointmentDetails');
                  }}
                  label="View Details"
                  variant="secondary"
                  className="flex-1"
                  textClassName="text-xs"
                />

                {item.status !== 'Cancelled' && (
                  <AppButton
                    onPress={() => {
                      nav.navigate('RebookAppointment');
                    }}
                    label="Rebook"
                    variant="accent"
                    className="flex-1"
                    textClassName="text-xs"
                  />
                )}
              </View>
            </AppCard>
          ))}
        </View>

        <View className="h-18 mb-32" />
      </ScrollView>
    </SafeAreaView>
  );
}
