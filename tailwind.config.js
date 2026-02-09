/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#7c3aed',
          green: '#22c55e',
          red: '#ef4444',
          yellow: '#eab308',
        },
      },
    },
  },
  plugins: [],
}
