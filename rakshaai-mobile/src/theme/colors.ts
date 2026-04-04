// ─── RakshaAI Mobile — Design Tokens ─────────────────────────────────────────
// Single source of truth for the Light Theme.

export const Colors = {
  // Backgrounds
  darkBase:   '#F8F9FA', // Main light background
  darkPanel:  '#F1F5F9', // Slightly darker pane
  surface:    '#FFFFFF', // Card background
  surface2:   '#F8FAFC', // Secondary UI elements

  // Guardian / Stealth mode (Remains dark for secrecy)
  guardian:   '#1C1C2E',
  guardianPanel: '#14142B',

  // SOS / Emergency (Vibrant Pink/Red Gradient base)
  crimson:   '#E11D48',
  emergency: '#D946EF', // Fuchsia/Pink
  emergencyLight: '#F472B6',

  // Sahayak (Teal/Green accent based on Dashboard cards)
  sahayak:   '#0D9488', // Teal
  sahayakLight: '#5EEAD4',

  // Text
  textPrimary:   '#0F172A', // Slate 900
  textSecondary: '#64748B', // Slate 500
  textMuted:     '#94A3B8', // Slate 400

  // Status
  success: '#10B981', // Emerald
  warning: '#F59E0B',
  danger:  '#E11D48', // Rose
  info:    '#3B82F6', // Blue

  // Borders / Dividers
  border:       '#E2E8F0', // Slate 200
  borderLight:  '#F1F5F9', // Slate 100

  // Transparent overlays
  overlay:      'rgba(15, 23, 42, 0.4)', // Dimmed overlay
  overlayLight: 'rgba(255, 255, 255, 0.6)',
} as const;

export type ColorKey = keyof typeof Colors;
