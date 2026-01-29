import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Wizard of AI Color Palette
        wizard: {
          emerald: '#0A4D3C',
          dark: '#041f1a',
          medium: '#0D6B4F',
          light: '#1A8B6B',
          gold: '#D4A84B',
          'gold-light': '#E8C55A',
          'gold-pale': '#F0D98C',
          cream: '#FDF8E8',
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
      },
    },
  },
  plugins: [],
};
export default config;
