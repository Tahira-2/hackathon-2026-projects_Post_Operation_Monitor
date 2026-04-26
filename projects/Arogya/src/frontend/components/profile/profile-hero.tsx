import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

type ProfileHeroProps = {
  name: string;
  patientId: string;
};

export function ProfileHero({ name, patientId }: ProfileHeroProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatarRing}>
          <View style={styles.avatarCore}>
            <MaterialIcons name="person" size={60} color="#7A8594" />
          </View>
        </View>
        <View style={styles.editBadge}>
          <MaterialIcons name="edit" size={18} color="#FFFFFF" />
        </View>
      </View>

      <Text style={styles.name}>{name}</Text>
      <Text style={styles.patientId}>PATIENT ID: {patientId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarWrap: {
    marginBottom: 20,
  },
  avatarRing: {
    width: 146,
    height: 146,
    borderRadius: 73,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  avatarCore: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: '#0F2532',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#0B66AE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.7,
    marginBottom: 8,
    textAlign: 'center',
  },
  patientId: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: '#6B7280',
  },
});
