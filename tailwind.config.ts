import type { Config } from 'tailwindcss'

const config: Config = {
  // Always dark — no media query toggle
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Alpha-carrying tokens use static rgba() to preserve Tailwind opacity modifier compatibility
        border: 'rgba(6, 182, 212, 0.12)',
        'border-strong': 'rgba(6, 182, 212, 0.24)',
        input: 'rgba(6, 182, 212, 0.12)',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        surface: 'hsl(var(--surface))',
        'surface-raised': 'hsl(var(--surface-raised))',
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
          subtle: 'rgba(6, 182, 212, 0.10)',
          hover: 'hsl(var(--accent-hover))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        signal: {
          low:              'hsl(var(--signal-low))',
          'low-bg':         'rgba(16, 185, 129, 0.12)',
          'low-border':     'rgba(16, 185, 129, 0.30)',
          high:             'hsl(var(--signal-high))',
          'high-bg':        'rgba(244, 63, 94, 0.12)',
          'high-border':    'rgba(244, 63, 94, 0.30)',
          neutral:          'hsl(var(--signal-neutral))',
          'neutral-bg':     'rgba(107, 127, 163, 0.12)',
          'neutral-border': 'rgba(107, 127, 163, 0.25)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 8px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },
      fontFamily: {
        // DM Sans — body, labels, UI text
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        // Space Grotesk — headings, prices, stats
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        xs:    ['0.75rem',  { lineHeight: '1rem' }],
        sm:    ['0.875rem', { lineHeight: '1.25rem' }],
        base:  ['1rem',     { lineHeight: '1.5rem' }],
        lg:    ['1.125rem', { lineHeight: '1.75rem' }],
        xl:    ['1.25rem',  { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem',   { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem',  { lineHeight: '2.5rem' }],
      },
      spacing: {
        nav: '4rem',
        header: '3.5rem',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
      },
      animation: {
        'skeleton-pulse': 'skeleton-pulse 1.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'float': 'float 20s ease-in-out infinite',
        'float-delayed': 'float 24s ease-in-out infinite 8s',
        'float-slow': 'float 28s ease-in-out infinite 4s',
      },
      keyframes: {
        'skeleton-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
