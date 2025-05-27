import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './stores/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Ethereal Design System Colors
        ethereal: {
          DEFAULT: '#B1FA63', // Inchworm - main brand color
          50: '#F5FDE8',
          100: '#EAFBD0',
          200: '#D6F7A1',
          300: '#C1F372',
          400: '#B1FA63',
          500: '#8FE833',
          600: '#6FC413',
          700: '#549511',
          800: '#3A660C',
          900: '#1F3707',
        },
        // Soft, organic secondary colors
        sage: {
          DEFAULT: '#87A878',
          50: '#F4F7F3',
          100: '#E8EFE6',
          200: '#D1DFCD',
          300: '#BACFB4',
          400: '#A3BF9B',
          500: '#87A878',
          600: '#6B8F5C',
          700: '#507542',
          800: '#3A5430',
          900: '#24341E',
        },
        mist: {
          DEFAULT: '#B8C5D0',
          50: '#F5F7F9',
          100: '#EBEFF3',
          200: '#D7DFE7',
          300: '#C3CFDB',
          400: '#B8C5D0',
          500: '#9DADB9',
          600: '#8295A3',
          700: '#677D8C',
          800: '#4C5F6B',
          900: '#31404A',
        },
        // Semantic colors (softer versions)
        success: {
          DEFAULT: '#7BC67B',
          50: '#F0F9F0',
          100: '#E1F3E1',
          200: '#C8E8C8',
          300: '#A8D8A8',
          400: '#92CE92',
          500: '#7BC67B',
          600: '#4E9F4E',
          700: '#3E7F3E',
          800: '#2E5F2E',
          900: '#1E3F1E',
          light: '#A8D8A8',
          dark: '#4E9F4E',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#F0C674',
          50: '#FEFCF0',
          100: '#FDF9E1',
          200: '#FBF3C3',
          300: '#F8ECA5',
          400: '#F5D896',
          500: '#F0C674',
          600: '#E0A843',
          700: '#C08A2F',
          800: '#906520',
          900: '#604010',
          light: '#F5D896',
          dark: '#E0A843',
          foreground: '#3A2B0A',
        },
        error: {
          DEFAULT: '#E08B8B',
          50: '#FDF0F0',
          100: '#FBE1E1',
          200: '#F7C3C3',
          300: '#F0B3B3',
          400: '#E8A3A3',
          500: '#E08B8B',
          600: '#CC5757',
          700: '#A04444',
          800: '#703030',
          900: '#401C1C',
          light: '#F0B3B3',
          dark: '#CC5757',
          foreground: '#FFFFFF',
        },
        info: {
          DEFAULT: '#8BB8E0',
          light: '#B3D0F0',
          dark: '#5790CC',
        },
        // Keep original Ethereal colors for backward compatibility
        inchworm: '#B1FA63',
        gunmetal: '#243837',
        orange: '#FE7733',
        'pale-violet': '#B2A1FF',
        'american-silver': '#D1D1D1',
        
        // Extended palette
        'grey-100': '#F5F5F5',
        'grey-300': '#E0E0E0',
        'grey-500': '#9E9E9E',
        'grey-700': '#616161',
        'grey-800': '#424242',
        'grey-900': '#212121',
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        display: ['Plus Jakarta Sans', ...fontFamily.sans],
      },
      letterSpacing: {
        tight: '-0.015em',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      transitionDuration: {
        'quick': '200ms',
        'standard': '300ms',
        'slow': '500ms',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config