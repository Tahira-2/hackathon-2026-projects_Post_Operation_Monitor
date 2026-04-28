import type { SVGAttributes } from 'react'

interface LogoProps extends SVGAttributes<SVGElement> {
  size?: number
}

export function Logo({ size = 28, className = '', ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="RefAI logo"
      role="img"
      {...props}
    >
      <rect width="28" height="28" rx="6" fill="#2563EB" />
      <path d="M14 7v14M7 14h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
