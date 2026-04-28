import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

type RiskResultHeaderProps = {
  brandName: string;
};

export function RiskResultHeader({ brandName }: RiskResultHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={styles.avatarRing}>
          <View style={styles.avatarInner}>
            <MaterialIcons name="medical-services" size={18} color="#355A76" />
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
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D8EDF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '500',
    color: '#111827',
  },
});
