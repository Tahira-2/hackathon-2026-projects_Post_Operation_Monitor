import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

type CheckInHeaderProps = {
  brandName: string;
};

export function CheckInHeader({ brandName }: CheckInHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={styles.avatarRing}>
          <View style={styles.avatarInner}>
            <MaterialIcons name="person" size={18} color="#5B6474" />
          </View>
        </View>
        <Text style={styles.logoText}>{brandName}</Text>
      </View>
      <MaterialIcons name="notifications" size={24} color="#64748B" />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5EAF1',
    backgroundColor: '#FFFFFF',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
  },
});
