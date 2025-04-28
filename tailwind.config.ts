import type { Config } from 'tailwindcss';
// No need to import colors for V3 extend

const config: Config = {
  // Enable class-based dark mode
  darkMode: 'class',

  // Specify the paths to all of your template files
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // If using the pages directory
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './mainpages/**/*.{js,ts,jsx,tsx,mdx}', // Added mainpages
    // Add other directories containing Tailwind classes here
  ],

  // Define your theme customizations
  theme: {
    // Base theme settings (defaults are inherited)
    extend: {
      // Add custom theme colors here for V3
      colors: {
        'primary-light': '#FFFFFF', // White
        'secondary-light': '#FFFFFF', // White (was light gray)
        'text-light': '#000000', // Black (was dark gray)

        'primary-dark': '#000000', // Black (was very dark gray)
        'secondary-dark': '#000000', // Black (was dark gray)
        'text-dark': '#FFFFFF', // White (was light gray)
        
        'card-dark': '#0c0c0c', // Custom dark gray for cards
      },
      // Add other extensions like fonts, spacing etc. if needed
       // Add font families for Geist
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },

  // Add any plugins (optional)
  plugins: [],
};

export default config; 