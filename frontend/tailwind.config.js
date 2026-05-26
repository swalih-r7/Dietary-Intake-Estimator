/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6C63FF',
          light: '#EEEDFE',
          dark: '#534AB7',
          hover: '#5B53E0',
        },
        teal: {
          DEFAULT: '#1D9E75',
          light: '#E1F5EE',
          dark: '#0F6E56',
        },
        amber: {
          DEFAULT: '#EF9F27',
          light: '#FAEEDA',
          dark: '#854F0B',
        },
        coral: {
          DEFAULT: '#D85A30',
          light: '#FAECE7',
          dark: '#712B13',
        },
        protein: '#1D9E75',
        carbs: '#EF9F27',
        fat: '#D85A30',
        canvas: '#F8F8FC',
        'nf-text': '#1E1E2F',
        'nf-mute': '#6B7280',
        'nf-card': '#FFFFFF',
        'nf-border': 'rgba(0,0,0,0.1)',
        // Legacy aliases so existing Tailwind classes don't break
        'modern-indigo': {
          DEFAULT: '#6C63FF',
          light: '#EEEDFE',
          hover: '#5B53E0',
        },
        'modern-text': '#1E1E2F',
        'modern-mute': '#6B7280',
        'modern-border': 'rgba(0,0,0,0.1)',
        'modern-emerald': {
          DEFAULT: '#1D9E75',
          light: '#ECFDF5',
        },
        'modern-rose': {
          DEFAULT: '#E11D48',
          light: '#FFF1F2',
        },
      },
      borderRadius: {
        'component': '8px',
        'card': '12px',
        'pill': '20px',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
      },
      boxShadow: {
        'nf': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
        'nf-hover': '0 4px 20px rgba(108,99,255,0.08)',
        'nf-focus': '0 0 0 3px rgba(108,99,255,0.33)',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease both',
        'pop-in': 'popIn 0.4s ease both',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 2.4s ease-in-out infinite',
        'spin-fast': 'spin 0.8s linear infinite',
        'slide-up': 'slideUp 0.5s ease both',
        'shake': 'shake 0.4s ease both',
        'bar-grow': 'barGrow 0.6s cubic-bezier(0.4,0,0.2,1) forwards',
        'dot-bounce': 'dotBounce 2.4s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        barGrow: {
          from: { width: '0%' },
          to: { width: 'var(--final-width, 100%)' },
        },
        dotBounce: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.animation-delay-0': { 'animation-delay': '0ms' },
        '.animation-delay-80': { 'animation-delay': '80ms' },
        '.animation-delay-160': { 'animation-delay': '160ms' },
      };
      addUtilities(newUtilities);
    },
    // Prefers-reduced-motion safe rule
    function({ addBase }) {
      addBase({
        '@media (prefers-reduced-motion: reduce)': {
          '*': {
            animation: 'none !important',
            transition: 'none !important',
          },
        },
      });
    },
  ],
}
