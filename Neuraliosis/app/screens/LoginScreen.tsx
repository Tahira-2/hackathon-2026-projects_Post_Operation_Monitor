import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from 'store/auth-store';
import { getErrorMessage } from 'api/contracts';

export default function LoginScreen() {
  const nav = useNavigation<any>();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    try {
      await login({ email: email.trim().toLowerCase(), password });
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
          <View className="flex-1" />

          {/* Header */}
          <View className="mb-10 items-center">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-3xl bg-red-400">
              <Ionicons name="heart" size={40} color="white" />
            </View>
            <Text className="text-3xl font-extrabold text-gray-900">Welcome Back</Text>
            <Text className="mt-1 text-sm text-gray-500">
              Sign in to continue your health journey
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
                  placeholder="••••••••"
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
          </View>

          {/* Login button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className={`mt-6 rounded-2xl py-4 ${isLoading ? 'bg-red-300' : 'bg-red-400'}`}>
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center text-base font-bold text-white">Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Register link */}
          <View className="mt-6 flex-row items-center justify-center">
            <Text className="text-sm text-gray-500">Don't have an account? </Text>
            <TouchableOpacity onPress={() => nav.navigate('Register')}>
              <Text className="text-sm font-bold text-red-400">Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom spacer */}
          <View className="flex-1" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
