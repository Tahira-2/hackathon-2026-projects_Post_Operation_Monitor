/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0f1f35', mid: '#1a3050', light: '#243d5c' },
        slate: { DEFAULT: '#4a6585', light: '#7a97b8' },
        paper: '#f4f6f9',
        line: { DEFAULT: '#dde3ec', mid: '#c4cdd9' },
        teal: { DEFAULT: '#0d9488', light: '#14b8a6', bg: '#f0fdfa' },
        amber: { DEFAULT: '#d97706', bg: '#fffbeb' },
        red: { DEFAULT: '#dc2626', bg: '#fff1f1' },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
        serif: ['"Lora"', 'serif'],
      },
      animation: {
        ecg: 'ecg-scroll 3s linear infinite',
        spinner: 'spin 1s linear infinite',
      },
      keyframes: {
        'ecg-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
