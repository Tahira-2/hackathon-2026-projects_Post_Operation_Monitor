import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type CheckInSectionProps = {
  title: string;
  children: ReactNode;
};

export function CheckInSection({ title, children }: CheckInSectionProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DFE8F2',
    padding: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
});
