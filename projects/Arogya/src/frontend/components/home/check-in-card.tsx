import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type CheckInCardProps = {
  title: string;
  value: string;
  actionLabel: string;
  onPress?: () => void;
};

export function CheckInCard({ title, value, actionLabel, onPress }: CheckInCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.iconBadge}>
          <MaterialIcons name="assignment" size={30} color="#4B5563" />
        </View>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>

      <Pressable hitSlop={8} onPress={onPress}>
        <Text style={styles.action}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E4EBF3',
    paddingHorizontal: 18,
    paddingVertical: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    marginRight: 14,
  },
  title: {
    fontSize: 15,
    letterSpacing: 0.7,
    color: '#374151',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
  },
  action: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0B63B0',
  },
});
