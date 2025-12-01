module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff5f8',
          100: '#ffeef3',
          200: '#ffcbe3',
          300: '#ff9ac6',
          400: '#ff6fb5',
          500: '#ff4d95',
          600: '#e63b80',
          700: '#b72b60',
          800: '#8e1f48',
          900: '#602030'
        },
        accent: '#6C5CE7'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial'],
        display: ['Poppins', 'Inter']
      },
      boxShadow: {
        'soft-lg': '0 10px 30px rgba(17,24,39,0.08), 0 4px 8px rgba(17,24,39,0.04)'
      }
    }
  },
  plugins: [],
};
