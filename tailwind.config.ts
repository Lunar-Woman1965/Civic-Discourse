import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        'creamy-tan': {
          50: '#fdfcf9',
          100: '#faf7f0',
          200: '#f5ede0',
          300: '#ede0c8',
          400: '#e4cfaa',
          500: '#d9bb8c',
          600: '#c9a66f',
          700: '#b08d58',
          800: '#8f744a',
          900: '#75603f',
        },
        'earth-brown': {
          50: '#f7f5f3',
          100: '#ede7e1',
          200: '#dccfc2',
          300: '#c5af9b',
          400: '#b19077',
          500: '#9e7a60',
          600: '#8a6854',
          700: '#725647',
          800: '#5f483d',
          900: '#503d34',
        },
        'pale-copper': {
          50: '#fdf7f5',
          100: '#fbeee9',
          200: '#f7dcd2',
          300: '#efc0b0',
          400: '#e59d86',
          500: '#d97c5e',
          600: '#c55f43',
          700: '#a54d37',
          800: '#894233',
          900: '#723a2f',
        },
        'turquoise': {
          50: '#f0fdfc',
          100: '#ccfbf6',
          200: '#99f6ed',
          300: '#5eead3',
          400: '#2dd4b8',
          500: '#14b8a0',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        'coffee-cream': {
          50: '#fdfcfb',
          100: '#faf8f5',
          200: '#f5f0e8',
          300: '#ede5d6',
          400: '#e3d5bd',
          500: '#d6c3a2',
          600: '#c5ad87',
          700: '#a8926f',
          800: '#8b795d',
          900: '#73654e',
        },
        'mocha-mist': {
          50: '#faf8f7',
          100: '#f3efec',
          200: '#e6ddd7',
          300: '#d4c4ba',
          400: '#bea598',
          500: '#a88a7a',
          600: '#947366',
          700: '#7a5f55',
          800: '#655048',
          900: '#54433d',
        },
        'muted-sage': {
          50: '#f7f9f7',
          100: '#edf2ed',
          200: '#d9e4d9',
          300: '#bdd0bd',
          400: '#9cb69c',
          500: '#7d9a7d',
          600: '#658265',
          700: '#516b51',
          800: '#445844',
          900: '#3a4a3a',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
