import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  as?: 'button' | 'a';
  href?: string;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-primary-600)',
    color: '#ffffff',
    border: '1px solid transparent',
  },
  secondary: {
    backgroundColor: 'var(--color-green-600)',
    color: '#ffffff',
    border: '1px solid transparent',
  },
  outline: {
    backgroundColor: 'transparent',
    color: 'var(--color-primary-600)',
    border: '1.5px solid var(--color-primary-600)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-gray-700)',
    border: '1px solid transparent',
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '0.375rem 0.875rem', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)' },
  md: { padding: '0.625rem 1.375rem', fontSize: '0.9375rem', borderRadius: 'var(--radius-md)' },
  lg: { padding: '0.8125rem 2rem',    fontSize: '1.0625rem', borderRadius: 'var(--radius-md)' },
};

const hoverMap: Record<ButtonVariant, string> = {
  primary:   'rgba(29, 78, 216, 1)',
  secondary: 'rgba(21, 128, 61, 1)',
  outline:   'rgba(37, 99, 235, 0.06)',
  ghost:     'rgba(0,0,0,0.04)',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', children, style, as, href, ...props }, ref) => {
    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontFamily: 'inherit',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background-color 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease',
      outline: 'none',
      userSelect: 'none',
      whiteSpace: 'nowrap',
      letterSpacing: '-0.01em',
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...style,
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
      const el = e.currentTarget as HTMLElement;
      if (variant === 'primary' || variant === 'secondary') {
        el.style.backgroundColor = hoverMap[variant];
        el.style.boxShadow = 'var(--shadow-md)';
      } else if (variant === 'outline') {
        el.style.backgroundColor = hoverMap[variant];
      } else {
        el.style.backgroundColor = hoverMap[variant];
      }
      el.style.transform = 'translateY(-1px)';
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
      const el = e.currentTarget as HTMLElement;
      el.style.backgroundColor = variantStyles[variant].backgroundColor as string;
      el.style.boxShadow = 'none';
      el.style.transform = 'translateY(0)';
    };

    if (as === 'a' && href) {
      return (
        <a
          href={href}
          style={baseStyle as React.CSSProperties}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {children}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        style={baseStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
