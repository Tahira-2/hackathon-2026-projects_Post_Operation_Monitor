import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import Foundation from '@expo/vector-icons/Foundation';
import { KeyboardChatScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';

type Message = {
  id: number;
  role: 'user' | 'ai';
  text: string;
};

export default function AiChatView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'ai',
      text: 'Hi, I am your health assistant. Ask me anything about sleep, habits, or health.',
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

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

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      text: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: 'ai',
        text: 'Analyzing your input... This is a simulated health response.',
      };

      setMessages((prev) => [...prev, aiMsg]);
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
    }, 900);
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
                  className={`max-w-[80%] rounded-3xl px-4 py-3 ${
                    msg.role === 'user' ? 'bg-red-400' : 'border border-gray-100 bg-white'
                  }`}>
                  <Text
                    className={
                      msg.role === 'user' ? 'text-sm text-white' : 'text-sm text-gray-800'
                    }>
                    {msg.text}
                  </Text>
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
              onPress={sendMessage}
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
