import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        brand: '#2563eb',   // ReviewSnap blue
        accent: '#16a34a',  // "leave a review" green
      },
    },
  },
  plugins: [],
}
export default config
