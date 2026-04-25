import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingMap = {
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
};

export const Card: React.FC<CardProps> = ({
  children,
  hover = false,
  style,
  padding = 'md',
}) => {
  const baseStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
    padding: paddingMap[padding],
    transition: hover ? 'box-shadow 0.22s ease, transform 0.18s ease' : undefined,
    ...style,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hover) return;
    const el = e.currentTarget;
    el.style.boxShadow = 'var(--shadow-lg)';
    el.style.transform = 'translateY(-3px)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hover) return;
    const el = e.currentTarget;
    el.style.boxShadow = 'var(--shadow-sm)';
    el.style.transform = 'translateY(0)';
  };

  return (
    <div
      style={baseStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <div style={{ marginBottom: '0.75rem', ...style }}>{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <h3
    style={{
      fontSize: '1.0625rem',
      fontWeight: 700,
      color: 'var(--color-gray-900)',
      letterSpacing: '-0.015em',
      ...style,
    }}
  >
    {children}
  </h3>
);

export const CardContent: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <div style={{ color: 'var(--color-muted)', fontSize: '0.9375rem', lineHeight: 1.65, ...style }}>
    {children}
  </div>
);
