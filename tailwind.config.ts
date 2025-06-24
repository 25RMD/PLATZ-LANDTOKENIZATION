import type { Config } from 'tailwindcss';
// No need to import colors for V3 extend

const config: Config = {
  // Enable class-based dark mode
  darkMode: ['class', 'class'],

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
  	extend: {
  		colors: {
  			'primary-light': '#FFFFFF',
  			'secondary-light': '#FAFAFA',
  			'text-light': '#000000',
  			'primary-dark': '#000000',
  			'secondary-dark': '#0A0A0A',
  			'text-dark': '#FFFFFF',
  			'cyber-accent': '#FFFFFF',
  			'cyber-glow': '#FFFFFF',
  			'glass-light': 'rgba(255, 255, 255, 0.1)',
  			'glass-dark': 'rgba(0, 0, 0, 0.1)',
  			'success-minimal': '#22C55E',
  			'warning-minimal': '#F59E0B',
  			'error-minimal': '#EF4444',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-geist-sans)'
  			],
  			mono: [
  				'var(--font-geist-mono)'
  			]
  		},
  		animation: {
  			'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
  			'slide-up': 'slide-up 0.3s ease-out',
  			'fade-in-up': 'fade-in-up 0.5s ease-out',
  			'cyber-scan': 'cyber-scan 3s ease-in-out infinite'
  		},
  		keyframes: {
  			'glow-pulse': {
  				'0%, 100%': {
  					boxShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
  				},
  				'50%': {
  					boxShadow: '0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.3)'
  				}
  			},
  			'slide-up': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'fade-in-up': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(30px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
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
  				}
  			}
  		},
  		backdropBlur: {
  			cyber: '12px'
  		},
  		borderRadius: {
  			cyber: '8px',
  			'cyber-lg': '12px',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },

  // Add any plugins (optional)
  plugins: [require("tailwindcss-animate")],
};

export default config; 