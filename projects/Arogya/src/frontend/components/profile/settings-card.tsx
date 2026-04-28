import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

type SettingsCardProps = {
  children: ReactNode;
};

export function SettingsCard({ children }: SettingsCardProps) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E4EBF3',
    paddingHorizontal: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
});
