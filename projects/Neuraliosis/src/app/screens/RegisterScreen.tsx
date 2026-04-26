import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from 'store/auth-store';
import { getErrorMessage } from 'api/contracts';
import type { RegisterRole } from 'api/models';

export default function RegisterScreen() {
  const nav = useNavigation<any>();
  const { register, isLoading } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RegisterRole>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');

    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      await register({
        email: email.trim().toLowerCase(),
        full_name: fullName.trim(),
        password,
        role,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-pink-50/30">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="px-6">
          {/* Top spacer */}
          <View className="mt-8" />

          {/* Header */}
          <View className="mb-8 items-center">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-3xl bg-red-400">
              <Ionicons name="person-add" size={36} color="white" />
            </View>
            <Text className="text-3xl font-extrabold text-gray-900">Create Account</Text>
            <Text className="mt-1 text-sm text-gray-500">
              Join Neuraliosis for better health
            </Text>
          </View>

          {/* Error */}
          {!!error && (
            <View className="mb-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3">
              <Text className="text-sm text-red-600">{error}</Text>
            </View>
          )}

          {/* Inputs */}
          <View className="gap-4">
            <View>
              <Text className="mb-1 text-xs font-bold uppercase text-gray-500">Full Name</Text>
              <View className="flex-row items-center rounded-2xl bg-white border border-gray-100 px-4 py-3">
                <Ionicons name="person-outline" size={20} color="#9ca3af" />
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="John Doe"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                  className="ml-3 flex-1 text-gray-900"
                />
              </View>
            </View>

            <View>
              <Text className="mb-1 text-xs font-bold uppercase text-gray-500">Email</Text>
              <View className="flex-row items-center rounded-2xl bg-white border border-gray-100 px-4 py-3">
                <Ionicons name="mail-outline" size={20} color="#9ca3af" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="ml-3 flex-1 text-gray-900"
                />
              </View>
            </View>

            <View>
              <Text className="mb-1 text-xs font-bold uppercase text-gray-500">Password</Text>
              <View className="flex-row items-center rounded-2xl bg-white border border-gray-100 px-4 py-3">
                <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min. 8 characters"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  className="ml-3 flex-1 text-gray-900"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Role selector */}
            <View>
              <Text className="mb-2 text-xs font-bold uppercase text-gray-500">
                I am a...
              </Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setRole('user')}
                  className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl border py-3 ${
                    role === 'user'
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-100 bg-white'
                  }`}>
                  <Ionicons
                    name="person"
                    size={18}
                    color={role === 'user' ? '#f87171' : '#9ca3af'}
                  />
                  <Text
                    className={`font-bold ${
                      role === 'user' ? 'text-red-400' : 'text-gray-500'
                    }`}>
                    Patient
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setRole('doctor')}
                  className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl border py-3 ${
                    role === 'doctor'
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-100 bg-white'
                  }`}>
                  <Ionicons
                    name="medkit"
                    size={18}
                    color={role === 'doctor' ? '#f87171' : '#9ca3af'}
                  />
                  <Text
                    className={`font-bold ${
                      role === 'doctor' ? 'text-red-400' : 'text-gray-500'
                    }`}>
                    Doctor
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Register button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            className={`mt-6 rounded-2xl py-4 ${isLoading ? 'bg-red-300' : 'bg-red-400'}`}>
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center text-base font-bold text-white">Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login link */}
          <View className="mt-6 flex-row items-center justify-center">
            <Text className="text-sm text-gray-500">Already have an account? </Text>
            <TouchableOpacity onPress={() => nav.goBack()}>
              <Text className="text-sm font-bold text-red-400">Sign In</Text>
            </TouchableOpacity>
          </View>

          <View className="h-8" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
