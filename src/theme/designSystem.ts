/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EngiHub Unified Theme Tokens
 * Aesthetic: Warm, lively Nigerian campus study space.
 * 
 * Palette:
 * - Light: Warm cream background, deep forest green primary, sunny yellow-gold accent.
 * - Dark: Deep green-black background, deep forest green surfaces, sunny yellow-gold accent.
 * - Strict bans: No purple, no neon, no gradients behind text.
 * 
 * Typography:
 * - Headings: Fraunces / Lora (warm, readable serif)
 * - Body: DM Sans / Inter (clean, humanist sans)
 * - Math/Data: JetBrains Mono / monospace (only for formulas and numbers)
 * 
 * Geometry:
 * - Corners: 8px to 12px (gently rounded)
 * - Shadows: Soft paper-like elevations
 * - Touch Targets: >= 44px on mobile
 */

export const designSystem = {
  colors: {
    // Light mode: Warm campus study hall
    light: {
      background: '#FDFBF7',     // Warm cream paper background
      surface: '#F5EFE6',        // Soft secondary cream surface
      card: '#FFFFFF',           // Crisp white card paper
      cardSubtle: '#FAF6EE',     // Subtle paper contrast
      border: '#E8E1D3',         // Gentle warm hairline border
      borderStrong: '#D1C6B4',   // Stronger outline for cards
      
      // Main brand identity
      forest: '#1B4332',         // Deep forest green (dominant brand tone)
      forestHover: '#143427',    // Deep forest dark hover
      forestSubtle: '#E8F1EC',   // Soft pale green tint for selections
      
      // Sparingly used warm accent
      gold: '#C67D0A',           // Sunny yellow-gold accent
      goldHover: '#A86604',      // Deep warm amber hover
      goldSubtle: '#FDF4E5',     // Soft sunny tint for highlights
      
      // High-contrast legible text
      textPrimary: '#142E22',    // Deepest forest green ink
      textSecondary: '#405449',  // Medium muted green-charcoal
      textMuted: '#687D72',      // Low-emphasis captions & dividers
      
      // Functional states
      success: '#2D6A4F',
      successSubtle: '#D8F3DC',
      warning: '#B45309',
      warningSubtle: '#FEF3C7',
      danger: '#B91C1C',
      dangerSubtle: '#FEE2E2',
    },
    // Dark mode: Deep forest green-black night study
    dark: {
      background: '#0B1612',     // Deep green-black ground
      surface: '#11221B',        // Muted forest surface
      card: '#162C23',           // Elevated forest study card
      cardSubtle: '#1C362B',     // Card header / nested surface
      border: '#234436',         // Subdued forest border
      borderStrong: '#325C4B',   // Prominent divider
      
      // Main brand identity
      forest: '#2D6A4F',         // Forest green primary
      forestHover: '#40916C',    // Vibrant forest hover
      forestSubtle: '#1B3B2E',   // Soft green tint
      
      // Sunny yellow-gold accent
      gold: '#E0A844',           // Warm radiant gold on dark
      goldHover: '#F2BC56',      // Bright gold highlight
      goldSubtle: '#2E220D',     // Deep warm amber shadow
      
      // Text
      textPrimary: '#F6F3EE',    // Warm cream text
      textSecondary: '#AEC1B6',  // Soft sage body text
      textMuted: '#6E8578',      // Dim label text
      
      // Functional states
      success: '#52B788',
      successSubtle: '#153526',
      warning: '#F59E0B',
      warningSubtle: '#332306',
      danger: '#EF4444',
      dangerSubtle: '#381313',
    }
  },
  typography: {
    fontSerif: 'Fraunces, Georgia, serif',
    fontSans: 'Inter, system-ui, -apple-system, sans-serif',
    fontMono: '"JetBrains Mono", Menlo, monospace',
  },
  radii: {
    sm: '8px',
    md: '10px',
    lg: '12px',
    pill: '9999px',
  },
  shadows: {
    paperSm: '0 1px 3px rgba(20, 46, 34, 0.05)',
    paperMd: '0 4px 12px rgba(20, 46, 34, 0.06), 0 1px 3px rgba(20, 46, 34, 0.04)',
    paperLg: '0 10px 24px rgba(20, 46, 34, 0.08), 0 2px 6px rgba(20, 46, 34, 0.04)',
  }
} as const;

export type ThemeMode = 'light' | 'dark';
