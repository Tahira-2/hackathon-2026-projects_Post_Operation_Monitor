import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

type MedicationCardProps = {
  label: string;
  medication: string;
  dueText: string;
  actionLabel: string;
};

export function MedicationCard({
  label,
  medication,
  dueText,
  actionLabel,
}: MedicationCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.content}>
          <Text style={styles.eyebrow}>{label}</Text>
          <Text style={styles.medication}>{medication}</Text>
          <View style={styles.timeRow}>
            <MaterialIcons name="access-time-filled" size={18} color="#374151" />
            <Text style={styles.dueText}>{dueText}</Text>
          </View>
        </View>

        <View style={styles.iconWrap}>
          <MaterialIcons name="medical-services" size={30} color="#E5E7EB" />
        </View>
      </View>

      <View style={styles.button}>
        <MaterialIcons name="check-circle" size={24} color="#FFFFFF" />
        <Text style={styles.buttonText}>{actionLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  content: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrow: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#0B63B0',
    marginBottom: 10,
  },
  medication: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#374151',
  },
  iconWrap: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    height: 54,
    borderRadius: 12,
    backgroundColor: '#0B66AE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
