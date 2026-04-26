import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Foundation from '@expo/vector-icons/Foundation';
import { useState } from 'react';

export default function UserProfileScreen() {
  const [user, setUser] = useState({
    name: 'Alex Johnson',
    email: 'alex@example.com',
    password: '********',
    age: '28',
    height: '175 cm',
    weight: '72 kg',
  });

  const [modal, setModal] = useState<null | keyof typeof user>(null);
  const [tempValue, setTempValue] = useState('');

  const openEdit = (key: keyof typeof user) => {
    setTempValue(user[key]);
    setModal(key);
  };

  const saveChanges = () => {
    if (modal) {
      setUser({ ...user, [modal]: tempValue });
    }
    setModal(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-red-50/30">
      <ScrollView className="flex-1 px-6 pb-10 pt-6">
        {/* Header */}
        <View className="mb-6 items-center">
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
            }}
            className="h-24 w-24 rounded-full"
          />

          <Text className="mt-3 text-2xl font-bold text-gray-900">{user.name}</Text>

          <Text className="text-xs text-gray-500">{user.email}</Text>
        </View>

        {/* Editable Info */}
        <View className="mb-6 gap-4 rounded-3xl bg-white p-5">
          <ProfileRow label="Name" value={user.name} onEdit={() => openEdit('name')} />
          <ProfileRow label="Email" value={user.email} onEdit={() => openEdit('email')} />
          <ProfileRow label="Password" value={user.password} onEdit={() => openEdit('password')} />
          <ProfileRow label="Age" value={user.age} onEdit={() => openEdit('age')} />
          <ProfileRow label="Height" value={user.height} onEdit={() => openEdit('height')} />
          <ProfileRow label="Weight" value={user.weight} onEdit={() => openEdit('weight')} />
        </View>

        {/* Logout */}
        <TouchableOpacity className="rounded-3xl bg-red-400 py-4">
          <Text className="text-center font-bold text-white">Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL */}
      <Modal visible={modal !== null} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full rounded-3xl bg-white p-5">
            <Text className="mb-3 text-lg font-bold text-gray-900">Edit {modal}</Text>

            <TextInput
              value={tempValue}
              onChangeText={setTempValue}
              className="rounded-2xl bg-gray-100 px-4 py-3 text-gray-900"
              secureTextEntry={modal === 'password'}
            />

            <View className="mt-4 flex-row gap-3">
              <TouchableOpacity
                onPress={() => setModal(null)}
                className="flex-1 rounded-2xl bg-gray-100 py-3">
                <Text className="text-center font-bold text-gray-700">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={saveChanges}
                className="flex-1 rounded-2xl bg-red-400 py-3">
                <Text className="text-center font-bold text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* 🔧 Reusable row component */
function ProfileRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <TouchableOpacity onPress={onEdit} className="flex-row items-center justify-between">
      <View>
        <Text className="text-xs uppercase text-gray-500">{label}</Text>
        <Text className="font-bold text-gray-900">{value}</Text>
      </View>

      <Foundation name="pencil" size={18} color="#f87171" />
    </TouchableOpacity>
  );
}
