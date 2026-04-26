import React from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  as?: "button" | "a";
  href?: string;
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-600)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary-600)] text-white shadow-sm hover:bg-[var(--color-primary-700)]",
  secondary:
    "bg-[var(--color-green-600)] text-white shadow-sm hover:bg-[var(--color-green-700)]",
  outline:
    "border border-[var(--color-primary-600)] text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)]",
  ghost: "text-[var(--color-gray-700)] hover:bg-[var(--color-gray-100)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      children,
      className,
      as,
      href,
      type,
      ...props
    },
    ref,
  ) => {
    const classes = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className,
    );

    if (as === "a" && href) {
      return (
        <a href={href} className={classes}>
          {children}
        </a>
      );
    }

    return (
      <button ref={ref} type={type ?? "button"} className={classes} {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
