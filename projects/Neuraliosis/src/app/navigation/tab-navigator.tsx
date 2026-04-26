import React, { use } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeView from 'screens/Home';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AppointmentHistory from 'screens/Appointments';
import OTCMedicinesScreen from 'screens/Medicines';
import UserProfileScreen from 'screens/Account';

const CalendarScreen = () => (
  <View>
    <Text>Calendar</Text>
  </View>
);
const SpecialistsScreen = () => (
  <View>
    <Text>Specialists</Text>
  </View>
);

const ProfileScreen = () => (
  <View>
    <Text>Profile</Text>
  </View>
);

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}>
      <Tab.Screen name="HOME" component={HomeView} />
      <Tab.Screen name="Appointments" component={AppointmentHistory} />
      <Tab.Screen name="SPECIALISTS" component={SpecialistsScreen} />
      <Tab.Screen name="PHARMACY" component={OTCMedicinesScreen} />
      <Tab.Screen name="Profile" component={UserProfileScreen} />
    </Tab.Navigator>
  );
}

function CustomTabBar({ state, navigation }: any) {
  const tabs = [
    { name: 'HOME', icon: 'home-outline', activeIcon: 'home', label: 'Home' },
    {
      name: 'Appointments',
      icon: 'calendar-outline',
      activeIcon: 'calendar',
      label: 'Appointments',
    },
    { name: 'PLUS', icon: 'add', label: 'Plus' },
    { name: 'PHARMACY', icon: 'medkit-outline', activeIcon: 'medkit', label: 'Pharmacy' },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person', label: 'Profile' },
  ];

  const offsets = useSafeAreaInsets();

  const nav = useNavigation();

  return (
    <View className="absolute bottom-12 left-0 right-0 flex-row items-center justify-between border-t border-gray-100 bg-white px-6 py-3">
      {tabs.map((tab, index) => {
        if (tab.name === 'PLUS') {
          return (
            <TouchableOpacity
              key="plus"
              onPress={() => nav.navigate('chat')}
              className="-mt-10 h-16 w-16 items-center justify-center rounded-full bg-red-400">
              <Ionicons name="sparkles" size={28} color="white" />
            </TouchableOpacity>
          );
        }

        const routeIndex = state.routes.findIndex((r: any) => r.name === tab.name);

        const isActive = state.index === routeIndex;

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => navigation.navigate(tab.name)}
            className="items-center">
            <Ionicons
              name={isActive ? (tab.activeIcon as any) : (tab.icon as any)}
              size={24}
              color={isActive ? '#f87171' : '#9ca3af'}
            />

            <Text className={`mt-1 text-[10px] ${isActive ? 'text-red-400' : 'text-gray-400'}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
