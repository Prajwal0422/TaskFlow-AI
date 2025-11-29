/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        accent: '#7C3AED',
        background: '#F9FAFB',
        card: '#FFFFFF',
        text: '#1F2937',
        'ai-glow': 'rgba(0, 246, 255, 0.4)',
      },
      borderRadius: {
        'xl': '16px',
      },
    },
  },
  plugins: [],
}