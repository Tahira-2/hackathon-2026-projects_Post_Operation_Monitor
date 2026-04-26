import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

type HomeHeaderProps = {
  brandName: string;
};

export function HomeHeader({ brandName }: HomeHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={styles.avatarFrame}>
          <View style={styles.avatarCircle}>
            <MaterialIcons name="person" size={28} color="#355A76" />
          </View>
        </View>
        <Text style={styles.logoText}>{brandName}</Text>
      </View>
      <MaterialIcons name="notifications" size={28} color="#64748B" />
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
  avatarFrame: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DCEAF7',
    backgroundColor: '#FFFFFF',
    marginRight: 12,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D8EDF6',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: -0.3,
  },
});
