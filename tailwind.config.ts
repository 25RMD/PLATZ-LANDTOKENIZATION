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
      // Modern black and white color scheme with cyber accents
      colors: {
        // Light theme: white dominant, black accents
        'primary-light': '#FFFFFF',
        'secondary-light': '#FAFAFA', // Subtle off-white for cards
        'text-light': '#000000',

        // Dark theme: black dominant, white accents
        'primary-dark': '#000000',
        'secondary-dark': '#0A0A0A', // Subtle off-black for cards
        'text-dark': '#FFFFFF',
        
        // Cyber-themed accents - changed to white
        'cyber-accent': '#FFFFFF', // White for active states (was electric green)
        'cyber-glow': '#FFFFFF', // White for hover effects (was cyan)
        'glass-light': 'rgba(255, 255, 255, 0.1)',
        'glass-dark': 'rgba(0, 0, 0, 0.1)',
        
        // Minimal status colors for when absolutely needed
        'success-minimal': '#22C55E',
        'warning-minimal': '#F59E0B',
        'error-minimal': '#EF4444',
      },
       // Add font families for Geist
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      // Cyber-themed animations
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'cyber-scan': 'cyber-scan 3s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 5px rgba(255, 255, 255, 0.3)' // Changed to white
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.3)' // Changed to white
          },
        },
        'slide-up': {
          'from': { 
            opacity: '0', 
            transform: 'translateY(20px)' 
          },
          'to': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        'fade-in-up': {
          'from': { 
            opacity: '0', 
            transform: 'translateY(30px)' 
          },
          'to': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        'cyber-scan': {
          '0%': { 
            transform: 'translateX(-100%)' 
          },
          '50%': { 
            transform: 'translateX(100%)' 
          },
          '100%': { 
            transform: 'translateX(-100%)' 
          },
        },
      },
      // Modern glassmorphism and cyber effects
      backdropBlur: {
        'cyber': '12px',
      },
      borderRadius: {
        'cyber': '8px',
        'cyber-lg': '12px',
      },
    },
  },

  // Add any plugins (optional)
  plugins: [],
};

export default config; 