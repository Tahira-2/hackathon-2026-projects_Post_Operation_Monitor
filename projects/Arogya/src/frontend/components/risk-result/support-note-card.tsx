import { StyleSheet, Text, View } from 'react-native';

type SupportNoteCardProps = {
  message: string;
};

export function SupportNoteCard({ message }: SupportNoteCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F7F6F4',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6E7EB',
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  message: {
    fontSize: 14,
    lineHeight: 28,
    fontStyle: 'italic',
    color: '#334155',
    textAlign: 'center',
  },
});
