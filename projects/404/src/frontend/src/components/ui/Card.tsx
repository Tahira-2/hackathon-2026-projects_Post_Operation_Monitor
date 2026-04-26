import React from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, padding = "md", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm",
        paddingMap[padding],
        hover && "transition hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mb-4 flex items-start justify-between gap-3", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-base font-semibold tracking-tight text-[var(--color-gray-900)]",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-sm leading-relaxed text-[var(--color-muted)]",
      className,
    )}
    {...props}
  />
));
CardContent.displayName = "CardContent";
