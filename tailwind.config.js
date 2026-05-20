/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Asimetrix brand palette
        ax: {
          primary: '#040939',
          primaryHover: '#0b1252',
          secondary: '#0E567B',
          secondaryHover: '#0a4a6b',
          electric: '#4BA2FF',
          electricHover: '#3690ee',
          aqua: '#00E3FF',
          aquaSoft: '#7EC6DE',
          text: '#050B49',
          textMuted: '#5b637e',
          textDim: '#8b91a7',
          surface: '#FFFFFF',
          surfaceAlt: '#F8F9FA',
          surfaceMuted: '#EEF2F6',
          border: '#E1E6EE',
          borderStrong: '#CBD3E0',
          success: '#4BA2FF',
          error: '#C0062B',
          warning: '#FFD600',
        },
      },
      fontFamily: {
        display: ['Roboto', 'system-ui', 'sans-serif'],
        sans: ['Roboto', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        h1: ['56px', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        h2: ['44px', { lineHeight: '1.1', letterSpacing: '-0.015em', fontWeight: '700' }],
        h3: ['32px', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '700' }],
        body: ['16px', { lineHeight: '1.55', fontWeight: '400' }],
      },
      boxShadow: {
        soft: '0 8px 24px -8px rgba(4, 9, 57, 0.12)',
        card: '0 12px 36px -12px rgba(4, 9, 57, 0.18), 0 1px 2px rgba(4, 9, 57, 0.04)',
        elevated: '0 24px 60px -20px rgba(4, 9, 57, 0.28)',
        electric: '0 12px 32px -12px rgba(75, 162, 255, 0.55)',
      },
      animation: {
        'fade-in': 'fadeIn 280ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
