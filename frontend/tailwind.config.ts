import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Wizard of AI Color Palette - Exact matches from thewizzardof.ai
        wizard: {
          'dark-emerald': '#041f1a',      // Deepest background
          'emerald': '#0A4D3C',           // Primary emerald
          'medium-emerald': '#0D5A45',    // Medium emerald
          'light-emerald': '#0D6B4F',     // Light emerald
          'bright-emerald': '#1A8B6B',    // Bright emerald accents
          'gold': '#D4A84B',              // Primary gold
          'gold-light': '#E8C55A',        // Light gold
          'gold-pale': '#F0D98C',         // Pale gold
          'gold-bright': '#FFD700',       // Bright gold accents
          'cream': '#FDF8E8',             // Cream text
        },
        // Aliases for easy use
        primary: '#0A4D3C',
        secondary: '#D4A84B',
        accent: '#E8C55A',
        background: '#041f1a',
        foreground: '#FDF8E8',
      },
      backgroundImage: {
        'gradient-wizard': 'linear-gradient(135deg, #0A4D3C 0%, #0D6B4F 50%, #1A8B6B 100%)',
        'gradient-gold': 'radial-gradient(circle, rgba(212,168,75,0.2) 0%, rgba(232,197,90,0.1) 40%, transparent 70%)',
        'gradient-emerald': 'linear-gradient(135deg, #041f1a 0%, #0A4D3C 50%, #0D6B4F 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(4,31,26,0.9) 0%, rgba(10,77,60,0.7) 100%)',
        'gradient-border': 'linear-gradient(90deg, #D4A84B, #E8C55A, #FFD700)',
      },
      fontFamily: {
        'serif': ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        'sans': ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'wizard': '0 4px 20px rgba(10, 77, 60, 0.3)',
        'wizard-glow': '0 0 20px rgba(212, 168, 75, 0.3)',
        'wizard-inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(212, 168, 75, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(212, 168, 75, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
