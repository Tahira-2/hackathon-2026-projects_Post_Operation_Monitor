import {
  createStaticNavigation,
  NavigationContainer,
  StaticParamList,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Tabs from './tab-navigator';
import SleepView from 'screens/Sleep';
import AiChatView from 'screens/Chat';
import StepsView from 'screens/Steps';
import AppointmentHistory from 'screens/Appointments';
import AppointmentDetails from 'screens/AppointmentDetails';
import MedicineDetailsScreen from 'screens/MedicineDetails';
import HeartRateView from 'screens/HeartRate';

const Stack = createStackNavigator();

function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Tabs} />
        <Stack.Screen name="sleep" component={SleepView} />
        <Stack.Screen name="chat" component={AiChatView} />
        <Stack.Screen name="Steps" component={StepsView} />
        <Stack.Screen name="HeartRate" component={HeartRateView} />
        <Stack.Screen name="Appointments" component={AppointmentHistory} />
        <Stack.Screen name="AppointmentDetails" component={AppointmentDetails} />
        <Stack.Screen name="MedicineDetails" component={MedicineDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

type RootNavigatorParamList = StaticParamList<typeof Stack>;

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootNavigatorParamList {}
  }
}

export default Navigation;
