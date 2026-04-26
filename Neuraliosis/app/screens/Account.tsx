import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Foundation from '@expo/vector-icons/Foundation';
import { useEffect, useState } from 'react';
import { useAuthStore } from 'store/auth-store';
import { updateProfile } from 'api/users-service';
import { getErrorMessage } from 'api/contracts';
import SkeletonLoader, { ProfileSkeleton } from '../components/SkeletonLoader';

type EditableField = 'full_name' | 'email';

export default function UserProfileScreen() {
  const { user, setUser, logout, fetchProfile, isAuthenticated } = useAuthStore();

  const [loading, setLoading] = useState(!user);
  const [saving, setSaving] = useState(false);

  const [modal, setModal] = useState<EditableField | null>(null);
  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    if (!user && isAuthenticated) {
      setLoading(true);
      fetchProfile().finally(() => setLoading(false));
    }
  }, [user, isAuthenticated, fetchProfile]);

  const openEdit = (key: EditableField) => {
    if (!user) return;
    const value = key === 'full_name' ? user.full_name : user.email;
    setTempValue(value);
    setModal(key);
  };

  const saveChanges = async () => {
    if (!modal || !user) return;

    setSaving(true);
    try {
      const updated = await updateProfile({
        [modal]: tempValue.trim(),
      });

      setUser(updated);
      setModal(null);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const displayFields: {
    label: string;
    value: string;
    editable?: EditableField;
  }[] = [
    { label: 'Name', value: user?.full_name ?? '—', editable: 'full_name' },
    { label: 'Email', value: user?.email ?? '—', editable: 'email' },
    {
      label: 'Role',
      value: (user?.role ?? '—').charAt(0).toUpperCase() + (user?.role ?? '').slice(1),
    },
    {
      label: 'Location',
      value:
        user?.latitude && user?.longitude
          ? `${Number(user.latitude).toFixed(4)}, ${Number(user.longitude).toFixed(4)}`
          : 'Not set',
    },
    {
      label: 'Member Since',
      value: user?.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : '—',
    },
  ];

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-red-50/30">
        <ScrollView className="flex-1 px-6 pb-10 pt-6">
          <ProfileSkeleton />
          <View className="mt-6 gap-4 rounded-3xl bg-white p-5">
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className="flex-row items-center justify-between">
                <View className="gap-1">
                  <SkeletonLoader width={60} height={10} />
                  <SkeletonLoader width={140} height={16} />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-red-50/30">
      <ScrollView className="flex-1 px-6 pb-10 pt-6">
        {/* Header */}
        <View className="mb-6 items-center">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-red-400">
            <Text className="text-3xl font-bold text-white">
              {(user?.full_name ?? 'U')
                .split(' ')
                .map((w) => w[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </Text>
          </View>

          <Text className="mt-3 text-2xl font-bold text-gray-900">
            {user?.full_name}
          </Text>

          <Text className="text-xs text-gray-500">{user?.email}</Text>
        </View>

        {/* Fields */}
        <View className="mb-6 gap-4 rounded-3xl bg-white p-5">
          {displayFields.map((field: any) => (
            <ProfileRow
              key={field.label}
              label={field.label}
              value={field.value}
              onEdit={
                field.editable ? () => openEdit(field.editable) : undefined
              }
            />
          ))}
        </View>
        <TouchableOpacity
        onPress={logout}
        className="flex-1 rounded-2xl bg-gray-100 py-3">
          <Text className="text-center font-bold text-red-700">Logout</Text>
        </TouchableOpacity>
        <View className="h-32" />
      </ScrollView>

      {/* Modal */}
      <Modal visible={!!modal} transparent animationType="fade">
        <View className="flex-1 justify-center bg-black/40 px-6">
          <View className="rounded-2xl bg-white p-5">
            <Text className="mb-3 text-lg font-bold text-gray-900">
              Edit {modal === 'full_name' ? 'Name' : 'Email'}
            </Text>

            <TextInput
              value={tempValue}
              onChangeText={setTempValue}
              className="rounded-2xl bg-gray-100 px-4 py-3 text-gray-900"
              autoCapitalize={modal === 'full_name' ? 'words' : 'none'}
              keyboardType={modal === 'email' ? 'email-address' : 'default'}
            />

            <View className="mt-4 flex-row gap-3">
              <TouchableOpacity
                onPress={() => setModal(null)}
                disabled={saving}
                className="flex-1 rounded-2xl bg-gray-100 py-3"
              >
                <Text className="text-center font-bold text-gray-700">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={saveChanges}
                disabled={saving}
                className={`flex-1 rounded-2xl py-3 ${
                  saving ? 'bg-red-300' : 'bg-red-400'
                }`}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-center font-bold text-white">
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* Reusable Row */
function ProfileRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
}) {
  const Wrapper = onEdit ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onEdit}
      className="flex-row items-center justify-between"
    >
      <View>
        <Text className="text-xs uppercase text-gray-500">{label}</Text>
        <Text className="font-bold text-gray-900">{value}</Text>
      </View>

      {onEdit && <Foundation name="pencil" size={18} color="#f87171" />}
    </Wrapper>
  );
}