import { ReactNode } from 'react';
import { TouchableOpacity, View, ViewProps } from 'react-native';

type AppCardProps = ViewProps & {
  children: ReactNode;
  className?: string;
  bordered?: boolean;
  onPress?: () => void;
  activeOpacity?: number;
};

export default function AppCard({
  children,
  className = '',
  bordered = true,
  onPress,
  activeOpacity = 0.9,
  ...props
}: AppCardProps) {
  const mergedClassName =
    `rounded-3xl bg-white ${bordered ? 'border border-gray-100' : ''} ${className}`.trim();

  if (onPress) {
    return (
      <TouchableOpacity
        {...(props as any)}
        onPress={onPress}
        activeOpacity={activeOpacity}
        className={mergedClassName}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View {...props} className={mergedClassName}>
      {children}
    </View>
  );
}
