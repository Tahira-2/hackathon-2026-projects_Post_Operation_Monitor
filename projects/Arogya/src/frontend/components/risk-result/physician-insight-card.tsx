import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

type PhysicianInsightCardProps = {
  title: string;
  message: string;
};

export function PhysicianInsightCard({ title, message }: PhysicianInsightCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <MaterialIcons name="info" size={22} color="#F59E0B" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF9ED',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F8DCA4',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#FFECC6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: 1.2,
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    color: '#334155',
  },
});
