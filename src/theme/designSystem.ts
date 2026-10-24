/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EngiHub Design System
 * Aesthetic: Engineer's drafting notebook.
 * Clean, tactile, purposeful. 1px technical rules, warm off-white paper & deep ink charcoal,
 * safety orange single accent, Fraunces serif headings, Inter body, JetBrains Mono technical notations.
 */

export const designSystem = {
  colors: {
    // Light mode: Warm drafting paper
    light: {
      background: '#FBF9F5',
      paper: '#FFFFFF',
      surface: '#F4F1EA',
      border: '#E2DCD2',
      borderStrong: '#C5BCAC',
      textPrimary: '#1C1917',
      textSecondary: '#57534E',
      textMuted: '#78716C',
      accent: '#EA580C', // Safety orange
      accentHover: '#C2410C',
      accentSubtle: '#FFEDD5',
      danger: '#DC2626',
      dangerSubtle: '#FEE2E2',
    },
    // Dark mode: Deep ink-charcoal drafting surface
    dark: {
      background: '#121316',
      paper: '#181A1F',
      surface: '#1F2228',
      border: '#2C3038',
      borderStrong: '#404552',
      textPrimary: '#F5F5F4',
      textSecondary: '#A8A29E',
      textMuted: '#78716C',
      accent: '#F97316', // Vibrant safety orange on dark
      accentHover: '#EA580C',
      accentSubtle: '#431407',
      danger: '#EF4444',
      dangerSubtle: '#450A0A',
    }
  },
  typography: {
    fontSerif: 'Fraunces, Georgia, serif',
    fontSans: 'Inter, system-ui, -apple-system, sans-serif',
    fontMono: '"JetBrains Mono", Menlo, monospace',
  },
  radii: {
    none: '0px',
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
  }
} as const;

export type ThemeMode = 'light' | 'dark';
