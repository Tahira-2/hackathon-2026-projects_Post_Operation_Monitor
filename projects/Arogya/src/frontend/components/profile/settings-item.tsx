import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

type SettingsItemProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  iconBackground: string;
  iconColor: string;
  badgeLabel?: string;
  danger?: boolean;
};

export function SettingsItem({
  icon,
  title,
  iconBackground,
  iconColor,
  badgeLabel,
  danger = false,
}: SettingsItemProps) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={[styles.iconBox, { backgroundColor: iconBackground }]}>
          <MaterialIcons name={icon} size={24} color={iconColor} />
        </View>
        <Text style={[styles.title, danger ? styles.dangerTitle : null]}>{title}</Text>
      </View>

      <View style={styles.right}>
        {badgeLabel ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeLabel}</Text>
          </View>
        ) : null}
        {!danger ? (
          <MaterialIcons name="chevron-right" size={28} color="#6B7280" />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  title: {
    flex: 1,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '500',
    color: '#111827',
  },
  dangerTitle: {
    color: '#B91C1C',
  },
  badge: {
    backgroundColor: '#8BF07E',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#116F22',
    letterSpacing: 0.7,
  },
});
