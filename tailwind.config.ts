/** @type {import('tailwindcss').Config} */
const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const scale = (name: string) => Object.fromEntries(steps.map((s) => [s, `oklch(var(--${name}-${s}) / <alpha-value>)`]));

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: scale('background'),
        primary: scale('primary'),
        accent: scale('accent'),
        secondary: scale('secondary'),
        foreground: scale('foreground'),
      },
      fontFamily: {
        sans: ['var(--font-body)'],
        body: ['var(--font-body)'],
        heading: ['var(--font-heading)'],
        display: ['var(--font-heading)'],
        serif: ['var(--font-heading)'],
        label: ['var(--font-label)'],
      },
    },
  },
  plugins: [],
};