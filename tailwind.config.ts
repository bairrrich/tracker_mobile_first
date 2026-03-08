import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // OKLCH Color System
      colors: {
        // Primary (Linear style blue)
        primary: {
          50: 'oklch(97% 0.02 260)',
          100: 'oklch(92% 0.04 260)',
          200: 'oklch(86% 0.06 260)',
          300: 'oklch(78% 0.10 260)',
          400: 'oklch(70% 0.14 260)',
          500: 'oklch(62% 0.19 260)',
          600: 'oklch(55% 0.18 260)',
          700: 'oklch(48% 0.16 260)',
          800: 'oklch(40% 0.14 260)',
          900: 'oklch(32% 0.12 260)',
        },
        // Neutral (gray scale)
        neutral: {
          50: 'oklch(99% 0.01 260)',
          100: 'oklch(96% 0.01 260)',
          200: 'oklch(90% 0.01 260)',
          300: 'oklch(82% 0.02 260)',
          400: 'oklch(68% 0.02 260)',
          500: 'oklch(54% 0.02 260)',
          600: 'oklch(44% 0.02 260)',
          700: 'oklch(36% 0.02 260)',
          800: 'oklch(26% 0.02 260)',
          900: 'oklch(18% 0.02 260)',
        },
        // Semantic colors
        success: 'oklch(65% 0.18 150)',
        warning: 'oklch(75% 0.17 80)',
        error: 'oklch(62% 0.22 25)',
      },
      // Theme CSS variables
      backgroundColor: {
        'theme-bg': 'var(--bg)',
        'theme-card': 'var(--card)',
        'theme-border': 'var(--border)',
      },
      textColor: {
        'theme-text': 'var(--text)',
        'theme-text-muted': 'var(--text-muted)',
      },
      // Spacing (8px grid)
      spacing: {
        '4': '1rem',
        '8': '2rem',
        '16': '4rem',
        '24': '6rem',
        '32': '8rem',
        '48': '12rem',
        '64': '16rem',
        '96': '24rem',
      },
      // Typography
      fontSize: {
        'xs': '0.75rem',    // 12px
        'sm': '0.875rem',   // 14px
        'base': '1rem',     // 16px
        'lg': '1.125rem',   // 18px
        'xl': '1.25rem',    // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '1.875rem',  // 30px
        '4xl': '2.25rem',   // 36px
      },
      // Border radius
      borderRadius: {
        'none': '0',
        'sm': '0.375rem',   // 6px
        'DEFAULT': '0.5rem', // 8px
        'md': '0.625rem',   // 10px
        'lg': '0.875rem',   // 14px
        'xl': '1rem',       // 16px
        '2xl': '1.5rem',    // 24px
        'full': '9999px',
      },
      // Animation
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
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
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
