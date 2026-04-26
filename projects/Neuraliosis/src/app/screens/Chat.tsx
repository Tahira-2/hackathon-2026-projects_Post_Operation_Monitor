import { View, Text, TouchableOpacity, TextInput, Animated, Keyboard } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import Foundation from '@expo/vector-icons/Foundation';
import { KeyboardChatScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { sendChatMessage } from 'api/chat-service';
import { getErrorMessage } from 'api/contracts';
import AppCard from '../components/AppCard';
import type { ChatDoctorRecommendation, ChatMedicineSuggestion, ChatOption } from 'api/models';

type Message = {
  id: string;
  role: 'user' | 'ai';
  text: string;
  options?: ChatOption[];
  predictedCondition?: string;
  doctors?: ChatDoctorRecommendation[];
  medicines?: ChatMedicineSuggestion[];
};

export default function AiChatView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-ai',
      role: 'ai',
      text: 'Hi, I am your health assistant. Tell me your symptoms and I will ask follow-up questions with choices when needed.',
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const sessionIdRef = useRef(`mobile-${Date.now()}`);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const sendMessage = async (overrideText?: string) => {
    const content = (overrideText ?? input).trim();
    if (!content || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: content,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!overrideText) {
      setInput('');
    }
    setIsTyping(true);

    try {
      const response = await sendChatMessage({
        session_id: sessionIdRef.current,
        message: content,
      });

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: response.response,
        options: response.options,
        predictedCondition: response.predicted_condition,
        doctors: response.doctor_recommendations,
        medicines: response.medicine_suggestions,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const fallbackMsg: Message = {
        id: `ai-fallback-${Date.now()}`,
        role: 'ai',
        text: `AI is currently not available. Please try again later.\n\n(${getErrorMessage(error)})`,
      };

      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const inset = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-pink-50/30">
      <SafeAreaView className="flex-1">
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4">
            <View>
              <Text className="text-2xl font-bold text-gray-900">AI Assistant</Text>
              <Text className="text-xs uppercase text-gray-500">Health Companion</Text>
            </View>

            <View className="rounded-2xl bg-white p-3">
              <Foundation name="lightbulb" size={22} color="#f87171" />
            </View>
          </View>

          {/* Chat */}
          <KeyboardChatScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}>
            {messages.map((msg) => (
              <Animated.View
                key={msg.id}
                style={{ opacity: fadeAnim }}
                className={`mb-3 flex ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <View
                  className={`max-w-[86%] rounded-3xl px-4 py-3 ${
                    msg.role === 'user' ? 'bg-red-400' : 'border border-gray-100 bg-white'
                  }`}>
                  <Text
                    className={
                      msg.role === 'user' ? 'text-sm text-white' : 'text-sm text-gray-800'
                    }>
                    {msg.text}
                  </Text>

                  {msg.role === 'ai' && Boolean(msg.options?.length) && (
                    <View className="mt-3 gap-2">
                      {msg.options?.map((option) => (
                        <TouchableOpacity
                          key={`${msg.id}-${option.id}`}
                          onPress={() => void sendMessage(option.value)}
                          disabled={isTyping}
                          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2">
                          <Text className="text-sm font-medium text-red-500">{`${option.id}. ${option.label}`}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {msg.role === 'ai' && msg.predictedCondition ? (
                    <View className="mt-3 rounded-xl bg-gray-50 px-3 py-2">
                      <Text className="text-xs uppercase text-gray-500">Predicted Condition</Text>
                      <Text className="mt-1 text-sm font-semibold text-gray-800">
                        {msg.predictedCondition}
                      </Text>
                    </View>
                  ) : null}

                  {msg.role === 'ai' && Boolean(msg.doctors?.length) && (
                    <View className="mt-3 gap-2">
                      <Text className="text-xs uppercase text-gray-500">Recommended Doctors</Text>
                      {msg.doctors?.map((doctor) => (
                        <AppCard key={`${msg.id}-doctor-${doctor.id}`} className="p-3">
                          <View className="flex-row items-center gap-3">
                            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-blue-100">
                              <Foundation name="first-aid" size={18} color="#3b82f6" />
                            </View>
                            <View className="flex-1">
                              <Text className="text-sm font-bold text-gray-900">
                                {doctor.doctor_name}
                              </Text>
                              <Text className="text-[11px] text-gray-600">
                                {doctor.specialization}
                              </Text>
                              <Text className="text-[11px] text-gray-500">
                                {doctor.hospital_name}
                              </Text>
                            </View>
                          </View>
                        </AppCard>
                      ))}
                    </View>
                  )}

                  {msg.role === 'ai' && Boolean(msg.medicines?.length) && (
                    <View className="mt-3 gap-2">
                      <Text className="text-xs uppercase text-gray-500">Suggested Medicines</Text>
                      {msg.medicines?.map((medicine) => (
                        <AppCard key={`${msg.id}-medicine-${medicine.id}`} className="p-3">
                          <View className="flex-row items-center gap-3">
                            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-red-100">
                              <Foundation name="plus" size={16} color="#f87171" />
                            </View>
                            <View className="flex-1">
                              <Text className="text-sm font-bold text-gray-900">
                                {medicine.name}
                              </Text>
                              <Text className="text-[11px] text-gray-600" numberOfLines={2}>
                                {medicine.description}
                              </Text>
                              <Text className="text-[11px] text-gray-500">{medicine.category}</Text>
                            </View>
                          </View>
                        </AppCard>
                      ))}
                    </View>
                  )}
                </View>
              </Animated.View>
            ))}

            {isTyping && (
              <View className="mb-3 items-start">
                <View className="rounded-3xl border border-gray-100 bg-white px-4 py-3">
                  <Text className="text-sm text-gray-500">AI is typing...</Text>
                </View>
              </View>
            )}
          </KeyboardChatScrollView>
        </View>
      </SafeAreaView>
      {/* Input */}
      <KeyboardStickyView>
        <View className=" bg-white px-4 py-3">
          <View className="flex-row items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask something..."
              placeholderTextColor="#9ca3af"
              className="flex-1 text-gray-900"
              multiline
            />

            <TouchableOpacity
              onPress={() => void sendMessage()}
              disabled={isTyping}
              className="ml-3 rounded-xl bg-red-400 px-4 py-2">
              <Text className="font-bold text-white">Send</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: keyboardVisible ? 0 : inset.bottom }}></View>
      </KeyboardStickyView>
    </View>
  );
}
