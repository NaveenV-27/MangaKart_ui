// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // You can add your custom colors, fonts, etc., here
    },
  },
  plugins: [
    // 💡 Add the scrollbar plugin here
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
}

export default config