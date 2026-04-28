import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

type RiskResultHeroProps = {
  title: string;
  message: string;
};

export function RiskResultHero({ title, message }: RiskResultHeroProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconHalo}>
        <MaterialIcons name="warning" size={54} color="#F59E0B" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 14,
  },
  iconHalo: {
    width: 134,
    height: 134,
    borderRadius: 67,
    backgroundColor: '#FFF6E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
    letterSpacing: -0.6,
  },
  message: {
    maxWidth: 330,
    fontSize: 16,
    lineHeight: 22,
    color: '#334155',
    textAlign: 'center',
  },
});
