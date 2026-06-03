/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Mobile app-shell constraints (390x844 reference; 375-430 supported)
      maxWidth: { shell: '430px' },
      minHeight: { screen: '100dvh' },
      height: { screen: '100dvh' },
      spacing: {
        'safe-t': 'env(safe-area-inset-top)',
        'safe-b': 'env(safe-area-inset-bottom)',
        'safe-l': 'env(safe-area-inset-left)',
        'safe-r': 'env(safe-area-inset-right)',
        touch: '44px', // minimum touch target
      },
      colors: {
        // status palette (icon+label backed, never color-alone per UX guidelines)
        status: {
          assigned: '#64748b',
          active: '#2563eb',
          done: '#16a34a',
          warn: '#d97706',
          danger: '#dc2626',
          offline: '#7c3aed',
        },
        brand: {
          DEFAULT: '#0f172a',
          accent: '#2563eb',
        },
      },
      minWidth: { touch: '44px' },
      minHeight: { touch: '44px' },
    },
  },
  plugins: [],
};
