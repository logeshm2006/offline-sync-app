module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7c3aed'
        }
      },
      backdropBlur: {
        xs: '4px'
      }
    }
  },
  plugins: []
}
