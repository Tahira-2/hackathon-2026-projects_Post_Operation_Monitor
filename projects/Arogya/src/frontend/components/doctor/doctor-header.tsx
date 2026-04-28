import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View, Image } from 'react-native';

type DoctorHeaderProps = {
  brandName: string;
  leftIcon?: 'menu' | 'person';
  rightIcon?: 'notifications' | 'search' | 'person';
  showAvatarLeft?: boolean;
  showAvatarRight?: boolean;
};

export function DoctorHeader({ brandName, leftIcon, rightIcon, showAvatarLeft, showAvatarRight }: DoctorHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.leftGroup}>
        {leftIcon === 'menu' && (
          <MaterialIcons name="menu" size={28} color="#475569" style={styles.menuIcon} />
        )}
        {showAvatarLeft && (
          <View style={styles.avatarLeft}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={styles.avatarImage} />
          </View>
        )}
        <Text style={styles.logoText}>{brandName}</Text>
      </View>
      <View style={styles.rightGroup}>
        {rightIcon === 'search' && (
          <MaterialIcons name="search" size={28} color="#475569" style={styles.rightIcon} />
        )}
        {rightIcon === 'notifications' && (
          <MaterialIcons name="notifications" size={28} color="#475569" />
        )}
        {showAvatarRight && (
          <View style={styles.avatarRight}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={styles.avatarImage} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 16,
  },
  rightIcon: {
    marginRight: 16,
  },
  avatarLeft: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  avatarRight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F52BA',
    letterSpacing: -0.5,
  },
});
