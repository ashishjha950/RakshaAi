/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary danger / SOS
        crimson:   '#8B0000',
        emergency: '#DC143C',
        // Backgrounds
        'dark-base':  '#0A0A0F',
        'dark-panel': '#0D1B2A',
        // Guardian / Stealth
        guardian: '#1C1C2E',
        // Sahayak accent
        sahayak: '#F59E0B',
        // Surfaces
        surface:  '#12121A',
        'surface-2': '#1A1A28',
        // Text
        'text-primary':   '#F1F1F8',
        'text-secondary': '#9A9AB0',
        'text-muted':     '#5A5A78',
        // Status
        success: '#22C55E',
        warning: '#F59E0B',
        danger:  '#DC143C',
        info:    '#38BDF8',
      },
      fontFamily: {
        heading:       ['Rajdhani_700Bold'],
        'heading-semi':['Rajdhani_600SemiBold'],
        body:          ['Nunito_400Regular'],
        'body-semi':   ['Nunito_600SemiBold'],
      },
    },
  },
  plugins: [],
};
