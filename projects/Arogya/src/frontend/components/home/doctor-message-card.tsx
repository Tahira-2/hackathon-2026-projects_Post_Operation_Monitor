import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

type DoctorMessageCardProps = {
  title: string;
  message: string;
};

export function DoctorMessageCard({ title, message }: DoctorMessageCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatarCircle}>
          <MaterialIcons name="medical-services" size={36} color="#4B5563" />
        </View>
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
    backgroundColor: '#D8E8F4',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarWrap: {
    marginRight: 14,
    marginTop: 4,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9DE2DF',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    letterSpacing: 1,
    color: '#111827',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    lineHeight: 28,
    fontStyle: 'italic',
    color: '#111827',
  },
});
