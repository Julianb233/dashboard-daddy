# Dashboard Daddy Design Framework
## Based on The Wizard of AI Brand Guidelines

This document defines the design system for Dashboard Daddy, matching The Wizard of AI brand identity.

---

## 1. Color Palette

### Primary Colors - Emerald Greens
| Name | Hex Code | CSS Variable | Usage |
|------|----------|--------------|-------|
| Emerald 900 | `#0a4d3c` | `--emerald-900` | Primary background, darkest |
| Emerald 800 | `#0d6b4f` | `--emerald-800` | Cards, sidebar, secondary bg |
| Emerald 700 | `#1a8b6b` | `--emerald-700` | Borders, secondary elements |
| Emerald 600 | `#2aad8a` | `--emerald-600` | Highlights, hover states |

### Secondary Colors - Golds
| Name | Hex Code | CSS Variable | Usage |
|------|----------|--------------|-------|
| Gold 600 | `#8b6914` | `--gold-600` | Dark gold, deep accents |
| Gold 500 | `#d4a84b` | `--gold-500` | Primary accent, CTAs, links |
| Gold 400 | `#e8c55a` | `--gold-400` | Lighter accent, highlights |
| Gold 300 | `#f0d98c` | `--gold-300` | Muted text, subtle accents |

### Accent Colors
| Name | Hex Code | CSS Variable | Usage |
|------|----------|--------------|-------|
| Teal | `#1e5f74` | `--teal` | Secondary accent |
| Coral | `#e07a5f` | `--coral` | Alerts, notifications |
| Cream | `#fdf8e8` | `--cream` | Text, foreground |
| Navy | `#1a2f4a` | `--navy` | Alternative dark |

### Semantic Tokens
```css
:root {
  /* Backgrounds */
  --background: var(--emerald-900);      /* #0a4d3c */
  --card: var(--emerald-800);            /* #0d6b4f */
  --muted: var(--emerald-800);           /* #0d6b4f */
  
  /* Foregrounds */
  --foreground: var(--cream);            /* #fdf8e8 */
  --muted-foreground: var(--gold-300);   /* #f0d98c */
  
  /* Primary Actions */
  --primary: var(--gold-500);            /* #d4a84b */
  --primary-foreground: var(--emerald-900);
  
  /* Secondary */
  --secondary: var(--emerald-700);       /* #1a8b6b */
  --secondary-foreground: var(--cream);
  
  /* Accents */
  --accent: var(--coral);                /* #e07a5f */
  --accent-foreground: var(--cream);
  
  /* Borders & Inputs */
  --border: var(--emerald-700);          /* #1a8b6b */
  --input: var(--emerald-800);           /* #0d6b4f */
  --ring: var(--gold-500);               /* #d4a84b */
  
  /* Charts */
  --chart-1: var(--gold-500);
  --chart-2: var(--emerald-700);
  --chart-3: var(--gold-400);
  --chart-4: var(--emerald-800);
  --chart-5: var(--gold-600);
  
  /* Sidebar */
  --sidebar: var(--emerald-800);
  --sidebar-foreground: var(--cream);
  --sidebar-primary: var(--gold-500);
  --sidebar-border: var(--emerald-700);
}
```

---

## 2. Typography

### Font Stack
```css
--font-sans: "Roboto", "Helvetica Neue", Arial, sans-serif;
--font-serif: "Libre Baskerville", Georgia, serif;
--font-mono: "Geist Mono", monospace;
--font-display: "Brier", sans-serif;      /* Headlines */
--font-body: "Mona Sans", sans-serif;     /* Body text */
```

### Font Sizes
| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| xs | 0.75rem (12px) | 1rem | Labels, captions |
| sm | 0.875rem (14px) | 1.25rem | Secondary text |
| base | 1rem (16px) | 1.5rem | Body text |
| lg | 1.125rem (18px) | 1.75rem | Large body |
| xl | 1.25rem (20px) | 1.75rem | Subheadings |
| 2xl | 1.5rem (24px) | 2rem | Section headings |
| 3xl | 1.875rem (30px) | 2.25rem | Page titles |
| 4xl | 2.25rem (36px) | 2.5rem | Hero text |

### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## 3. Spacing & Layout

### Border Radius
```css
--radius: 0.75rem;  /* 12px - Standard radius */
--radius-sm: 0.5rem;
--radius-lg: 1rem;
--radius-full: 9999px;
```

### Spacing Scale
| Name | Value | Pixels |
|------|-------|--------|
| 1 | 0.25rem | 4px |
| 2 | 0.5rem | 8px |
| 3 | 0.75rem | 12px |
| 4 | 1rem | 16px |
| 5 | 1.25rem | 20px |
| 6 | 1.5rem | 24px |
| 8 | 2rem | 32px |
| 10 | 2.5rem | 40px |
| 12 | 3rem | 48px |

---

## 4. Component Styles

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: var(--gold-500);
  color: var(--emerald-900);
  border-radius: var(--radius);
  font-weight: 600;
}
.btn-primary:hover {
  background: var(--gold-400);
}

/* Secondary Button */
.btn-secondary {
  background: var(--emerald-700);
  color: var(--cream);
  border-radius: var(--radius);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--gold-500);
  border: 1px solid var(--emerald-700);
}
```

### Cards
```css
.card {
  background: var(--emerald-800);
  border: 1px solid var(--emerald-700);
  border-radius: var(--radius);
  padding: 1.5rem;
}
.card-header {
  color: var(--cream);
  font-weight: 600;
}
.card-description {
  color: var(--gold-300);
}
```

### Input Fields
```css
.input {
  background: var(--emerald-800);
  border: 1px solid var(--emerald-700);
  border-radius: var(--radius);
  color: var(--cream);
}
.input:focus {
  border-color: var(--gold-500);
  outline: none;
  ring: 2px var(--gold-500);
}
```

---

## 5. Status Colors

| Status | Color | Hex | Usage |
|--------|-------|-----|-------|
| Success | Emerald 600 | `#2aad8a` | Completed, active |
| Warning | Gold 500 | `#d4a84b` | Pending, attention |
| Error | Coral | `#e07a5f` | Failed, error states |
| Info | Teal | `#1e5f74` | Information |
| Idle | Emerald 700 | `#1a8b6b` | Inactive, standby |

---

## 6. Shadows & Effects

```css
/* Card shadow */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);

/* Elevated card */
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);

/* Glow effect (gold) */
box-shadow: 0 0 20px rgba(212, 168, 75, 0.3);

/* Hover glow */
box-shadow: 0 0 30px rgba(212, 168, 75, 0.4);
```

---

## 7. Icons & Imagery

- **Icon style**: Lucide React icons (consistent with shadcn/ui)
- **Icon color**: Match text color (cream for normal, gold for accent)
- **Icon size**: 
  - Small: 16px
  - Default: 20px
  - Large: 24px

---

## 8. Animation & Transitions

```css
/* Default transition */
transition: all 0.2s ease-in-out;

/* Hover effects */
transition: transform 0.2s, box-shadow 0.2s;

/* Page transitions */
animation: fadeIn 0.3s ease-out;

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## 9. Chart Colors (for visualizations)

```javascript
const chartColors = {
  gold: '#d4a84b',      // Primary data
  emerald: '#1a8b6b',   // Secondary data
  lightGold: '#e8c55a', // Tertiary data
  darkEmerald: '#0d6b4f', // Background
  deepGold: '#8b6914',  // Accent data
  coral: '#e07a5f',     // Alerts/errors
  teal: '#1e5f74',      // Information
};
```

---

## 10. Dark Mode

The Wizard of AI uses the **same emerald/gold theme** for both light and dark modes. The design is inherently dark-themed with:
- Dark emerald backgrounds
- Light cream text
- Gold accents

No separate light mode color scheme needed - the brand is always "dark mode."

---

## 11. Implementation Notes

### Tailwind Classes
```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        emerald: {
          900: '#0a4d3c',
          800: '#0d6b4f',
          700: '#1a8b6b',
          600: '#2aad8a',
        },
        gold: {
          600: '#8b6914',
          500: '#d4a84b',
          400: '#e8c55a',
          300: '#f0d98c',
        },
        cream: '#fdf8e8',
        coral: '#e07a5f',
        teal: '#1e5f74',
        navy: '#1a2f4a',
      }
    }
  }
}
```

### CSS Variables in globals.css
Copy the CSS variables from section 1 into your `globals.css` file.

---

## Quick Reference

| Element | Background | Text | Border | Accent |
|---------|------------|------|--------|--------|
| Page | emerald-900 | cream | - | - |
| Card | emerald-800 | cream | emerald-700 | gold-500 |
| Sidebar | emerald-800 | cream | emerald-700 | gold-500 |
| Button Primary | gold-500 | emerald-900 | - | - |
| Button Secondary | emerald-700 | cream | - | - |
| Input | emerald-800 | cream | emerald-700 | gold-500 (focus) |

---

*Document created: 2026-01-30*
*Based on: https://www.thewizzardof.ai/*
*GitHub: Julianb233/OFFICIAL-the-wizard-of-ai*
