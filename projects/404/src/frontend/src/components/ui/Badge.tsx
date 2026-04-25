import React from 'react';

type BadgeVariant = 'blue' | 'green' | 'gray' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: React.CSSProperties;
}

const variantMap: Record<BadgeVariant, React.CSSProperties> = {
  blue: {
    backgroundColor: 'var(--color-primary-50)',
    color: 'var(--color-primary-700)',
    border: '1px solid var(--color-primary-200)',
  },
  green: {
    backgroundColor: 'var(--color-green-50)',
    color: 'var(--color-green-700)',
    border: '1px solid var(--color-green-100)',
  },
  gray: {
    backgroundColor: 'var(--color-gray-100)',
    color: 'var(--color-gray-600)',
    border: '1px solid var(--color-gray-200)',
  },
  outline: {
    backgroundColor: 'transparent',
    color: 'var(--color-gray-700)',
    border: '1px solid var(--color-gray-300)',
  },
};

const Badge: React.FC<BadgeProps> = ({ children, variant = 'blue', style }) => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '99px',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        ...variantMap[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export default Badge;
