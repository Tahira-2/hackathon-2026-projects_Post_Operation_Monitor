import React from "react";
import { cn } from "../../lib/utils";

type BadgeVariant = "blue" | "green" | "gray" | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
  blue: "border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]",
  green:
    "border border-[var(--color-green-100)] bg-[var(--color-green-50)] text-[var(--color-green-700)]",
  gray: "border border-[var(--color-gray-200)] bg-[var(--color-gray-100)] text-[var(--color-gray-600)]",
  outline: "border border-[var(--color-gray-300)] text-[var(--color-gray-700)]",
};

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "blue",
  className,
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        variantMap[variant],
        className,
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
