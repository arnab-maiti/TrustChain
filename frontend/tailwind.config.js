/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark mode
        'dark-bg': '#0B1E2D',
        'dark-card': '#112B3C',
        'dark-accent': '#3BAFDA',
        'dark-text': '#E6F1FF',
        'dark-success': '#22C55E',
        'dark-warning': '#F59E0B',
        'dark-error': '#EF4444',
        
        // Light mode
        'light-bg': '#F5F7FA',
        'light-card': '#FFFFFF',
        'light-accent': '#2563EB',
        'light-text': '#1F2937',
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out',
        'slideUp': 'slideUp 0.4s ease-out',
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
      },
      boxShadow: {
        'card': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 25px rgba(0, 0, 0, 0.15)',
      },
      transition: {
        'smooth': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
