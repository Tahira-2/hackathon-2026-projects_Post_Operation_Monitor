import { View, Text, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Foundation from '@expo/vector-icons/Foundation';
import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';

export default function AppointmentDetails() {
  const appointment = {
    doctor: {
      name: 'Dr. Sarah Lee',
      specialty: 'Dermatologist',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200',
    },
    date: '12 Apr 2026',
    time: '10:30 AM',
    status: 'Completed',
    diagnosis: 'Mild skin allergy caused by seasonal change',
    notes:
      'Patient showed signs of mild allergic reaction on arms and neck. Recommended avoiding harsh soaps and using hypoallergenic moisturizer twice daily. Condition is not severe but should be monitored for 7–10 days.',
    prescriptions: [
      'Cetirizine 10mg – once daily',
      'Hydrocortisone cream – apply twice daily',
      'Drink more water and avoid allergens',
    ],
  };

  return (
    <SafeAreaView className="flex-1 bg-pink-50/30">
      <ScrollView className="flex-1 px-6 pb-10 pt-6">
        <AppCard className="mb-6 p-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              <Image source={{ uri: appointment.doctor.image }} className="h-14 w-14 rounded-2xl" />

              <View>
                <Text className="font-bold text-gray-900">{appointment.doctor.name}</Text>
                <Text className="text-xs text-gray-500">{appointment.doctor.specialty}</Text>
              </View>
            </View>

            <View className="rounded-full bg-green-100 px-3 py-1">
              <Text className="text-xs font-bold text-green-700">{appointment.status}</Text>
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-gray-500">Date & Time</Text>
              <Text className="font-bold text-gray-900">
                {appointment.date} • {appointment.time}
              </Text>
            </View>

            <Foundation name="calendar" size={22} color="#fb923c" />
          </View>
        </AppCard>

        <AppCard className="mb-6 p-5">
          <Text className="mb-2 text-sm font-bold uppercase text-gray-700">Diagnosis</Text>

          <Text className="text-gray-800">{appointment.diagnosis}</Text>
        </AppCard>

        <AppCard bordered={false} className="mb-6 border border-pink-100 p-5">
          <View className="mb-2 flex-row items-center gap-2">
            <Foundation name="clipboard-notes" size={20} color="#ec4899" />
            <Text className="text-sm font-bold uppercase text-gray-700">Doctor Notes</Text>
          </View>

          <Text className="leading-5 text-gray-700">{appointment.notes}</Text>
        </AppCard>

        <AppCard className="mb-6 p-5">
          <Text className="mb-3 text-sm font-bold uppercase text-gray-700">Prescription</Text>

          {appointment.prescriptions.map((item, index) => (
            <View key={index} className="mb-2 flex-row items-start gap-2">
              <View className="mt-1 h-2 w-2 rounded-full bg-orange-400" />
              <Text className="flex-1 text-gray-700">{item}</Text>
            </View>
          ))}
        </AppCard>

        <View className="flex-row gap-3">
          <AppButton label="Download Report" variant="secondary" className="flex-1" />

          <AppButton label="Rebook" variant="accent" className="flex-1" />
        </View>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
