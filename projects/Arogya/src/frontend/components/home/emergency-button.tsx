import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

type EmergencyButtonProps = {
  label: string;
};

export function EmergencyButton({ label }: EmergencyButtonProps) {
  return (
    <View style={styles.button}>
      <MaterialIcons name="wifi-tethering" size={28} color="#FFFFFF" />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-end',
    minWidth: 220,
    height: 62,
    borderRadius: 31,
    paddingHorizontal: 28,
    backgroundColor: '#CD181A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#7F1D1D',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    marginTop: -22,
    marginRight: 2,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#FFFFFF',
  },
});
