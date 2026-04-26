import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/auth-store';

import LoginScreen from 'screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TabNavigator from './tab-navigator';
import DoctorTabNavigator from './doctor-tab-navigator';
import ChatScreen from '../screens/Chat';
import AppointmentDetailsScreen from '../screens/AppointmentDetails';
import MedicineDetailsScreen from '../screens/MedicineDetails';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import DoctorReportScreen from '../screens/doctor/DoctorReport';
import AppointmentHistory from '../screens/Appointments';
import UserProfileScreen from '../screens/Account';

const Stack = createStackNavigator();

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Root: undefined;
  DoctorRoot: undefined;
  chat: undefined;
  Booking: undefined;
  AppointmentDetails: undefined;
  MedicineDetails: undefined;
  Cart: undefined;
  Orders: undefined;
  OrderDetail: undefined;
  DoctorReport: undefined;
  Account: undefined;
};

export default function RootNavigator() {
  const { isHydrated, isAuthenticated, user } = useAuthStore();

  if (!isHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-red-50/30">
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            {user?.role === 'doctor' ? (
              <Stack.Screen name="DoctorRoot" component={DoctorTabNavigator} />
            ) : (
              <Stack.Screen name="Root" component={TabNavigator} />
            )}

            <Stack.Screen name="chat" component={ChatScreen} />
            <Stack.Screen name="Booking" component={AppointmentHistory} />
            <Stack.Screen
              name="AppointmentDetails"
              component={AppointmentDetailsScreen}
            />
            <Stack.Screen
              name="MedicineDetails"
              component={MedicineDetailsScreen}
            />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
            <Stack.Screen name="DoctorReport" component={DoctorReportScreen} />
            <Stack.Screen name="Account" component={UserProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}


declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}