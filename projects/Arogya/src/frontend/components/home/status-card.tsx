import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

type StatusCardProps = {
  title: string;
  value: string;
};

export function StatusCard({ title, value }: StatusCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.iconBadge}>
          <MaterialIcons name="verified" size={28} color="#FFFFFF" />
        </View>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>

      <MaterialIcons name="trending-up" size={30} color="#047857" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E4F8DF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#B4E1AF',
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#067A16',
    marginRight: 14,
  },
  title: {
    fontSize: 16,
    letterSpacing: 1.1,
    color: '#046C1E',
    marginBottom: 2,
  },
  value: {
    fontSize: 20,
    fontWeight: '500',
    color: '#067A16',
  },
});
