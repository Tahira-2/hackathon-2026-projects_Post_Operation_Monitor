import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'ghost' | 'text'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover disabled:opacity-60',
  ghost: 'border border-border bg-transparent text-primary hover:bg-base disabled:opacity-60',
  text: 'bg-transparent text-accent hover:underline h-auto px-0',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors',
        'focus:ring-accent focus:ring-offset-1 focus:outline-none focus:ring-2',
        variant !== 'text' ? sizeClasses[size] : '',
        variantClasses[variant],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading ? 'Loading…' : children}
    </button>
  )
}
