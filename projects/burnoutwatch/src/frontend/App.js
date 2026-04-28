import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';

import AppFlow from './src/burnout/navigation/AppFlow';

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <AppFlow />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#5A9BA1',
  },
  container: {
    flex: 1,
  },
});
