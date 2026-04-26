import { useEffect, useRef } from 'react';
import { Animated, View, type ViewProps } from 'react-native';

type SkeletonLoaderProps = ViewProps & {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
};

export default function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 12,
  className = '',
  style,
  ...props
}: SkeletonLoaderProps) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      {...props}
      className={className}
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: '#e5e7eb',
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
}

/* Prebuilt skeleton layouts */

export function CardSkeleton() {
  return (
    <View className="rounded-3xl border border-gray-100 bg-white p-5">
      <View className="flex-row items-center gap-4">
        <SkeletonLoader width={56} height={56} borderRadius={16} />
        <View className="flex-1 gap-2">
          <SkeletonLoader width="60%" height={16} />
          <SkeletonLoader width="40%" height={12} />
        </View>
      </View>
      <View className="mt-4 gap-2">
        <SkeletonLoader width="80%" height={12} />
        <SkeletonLoader width="50%" height={12} />
      </View>
    </View>
  );
}

export function StatsSkeleton() {
  return (
    <View className="flex-row gap-4">
      {[1, 2, 3].map((i) => (
        <View key={i} className="flex-1 rounded-3xl border border-gray-100 bg-white p-4">
          <SkeletonLoader width="50%" height={10} />
          <SkeletonLoader width="40%" height={24} borderRadius={8} className="mt-2" />
        </View>
      ))}
    </View>
  );
}

export function ProfileSkeleton() {
  return (
    <View className="items-center">
      <SkeletonLoader width={96} height={96} borderRadius={48} />
      <SkeletonLoader width={140} height={20} className="mt-3" />
      <SkeletonLoader width={180} height={12} className="mt-2" />
    </View>
  );
}
