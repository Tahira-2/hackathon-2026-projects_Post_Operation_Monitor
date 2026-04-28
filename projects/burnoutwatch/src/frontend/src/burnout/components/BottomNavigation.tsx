import { Home, Calendar, Activity, User } from 'lucide-react-native';
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const navItems = [
  { icon: Home, label: 'Home' },
  { icon: Calendar, label: 'Appointments' },
  { icon: Activity, label: 'Health' },
  { icon: User, label: 'Profile' },
];

export function BottomNavigation() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={styles.container}>
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeIndex === index;

        return (
          <TouchableOpacity
            key={index}
            onPress={() => setActiveIndex(index)}
            style={styles.navItem}
          >
            <Icon
              size={24}
              color={isActive ? '#6FAFB5' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.label,
                { color: isActive ? '#6FAFB5' : '#6B7280' },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',   // like "fixed bottom"
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 12,
  },
});
