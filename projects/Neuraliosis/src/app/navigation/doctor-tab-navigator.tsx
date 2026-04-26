import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DoctorDashboardScreen from '../screens/doctor/DoctorDashboard';
import DoctorAppointmentsScreen from '../screens/doctor/DoctorAppointments';
import DoctorSlotsScreen from '../screens/doctor/DoctorSlots';
import UserProfileScreen from '../screens/Account';

const Tab = createBottomTabNavigator();

export default function DoctorTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: '#ffffff',
          borderRadius: 30,
          height: 70,
          shadowColor: '#f87171',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          paddingHorizontal: 10,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'DoctorAppointments') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'DoctorSlots') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-circle-outline';
          }

          const iconColor = focused ? '#ffffff' : '#9ca3af';
          const bgColor = focused ? '#f87171' : 'transparent';

          return (
            <View
              className={`items-center justify-center rounded-2xl ${
                focused ? 'h-12 w-12 shadow-sm shadow-red-200' : 'h-10 w-10'
              }`}
              style={{ backgroundColor: bgColor }}>
              <Ionicons name={iconName} size={focused ? 24 : 22} color={iconColor} />
            </View>
          );
        },
      })}>
      <Tab.Screen name="Dashboard" component={DoctorDashboardScreen} />
      <Tab.Screen name="DoctorAppointments" component={DoctorAppointmentsScreen} />
      <Tab.Screen name="DoctorSlots" component={DoctorSlotsScreen} />
      <Tab.Screen name="Account" component={UserProfileScreen} />
    </Tab.Navigator>
  );
}
