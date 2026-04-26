import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'pink';

type AppButtonProps = TouchableOpacityProps & {
  label: string;
  variant?: ButtonVariant;
  className?: string;
  textClassName?: string;
};

const CONTAINER_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-red-400',
  secondary: 'bg-gray-50',
  accent: 'bg-orange-400',
  pink: 'bg-pink-500',
};

const TEXT_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-gray-700',
  accent: 'text-white',
  pink: 'text-white',
};

export default function AppButton({
  label,
  variant = 'primary',
  className = '',
  textClassName = '',
  disabled,
  ...props
}: AppButtonProps) {
  return (
    <TouchableOpacity
      {...props}
      disabled={disabled}
      className={`rounded-2xl py-3 ${CONTAINER_VARIANTS[variant]} ${disabled ? 'opacity-50' : ''} ${className}`.trim()}>
      <Text className={`text-center font-bold ${TEXT_VARIANTS[variant]} ${textClassName}`.trim()}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
