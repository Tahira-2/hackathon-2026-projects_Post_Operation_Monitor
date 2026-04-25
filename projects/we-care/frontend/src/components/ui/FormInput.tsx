import type { InputHTMLAttributes, ReactNode } from 'react'

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: ReactNode
}

export function FormInput({
  label,
  error,
  hint,
  id,
  className = '',
  ...props
}: FormInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-widest text-muted"
        >
          {label}
        </label>
        {hint && <span className="text-xs">{hint}</span>}
      </div>
      <input
        id={inputId}
        className={[
          'h-10 w-full rounded-lg border border-border px-3 text-sm text-primary',
          'placeholder:text-placeholder focus:border-transparent focus:ring-2 focus:ring-accent focus:outline-none',
          error ? 'border-red-400 focus:ring-red-400' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-describedby={error ? `${inputId}-error` : undefined}
        aria-invalid={!!error}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
