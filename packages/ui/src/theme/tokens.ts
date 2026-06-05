export const colors = {
  bg: '#f3f5f2',
  surface: '#ffffff',
  fg: '#1a2420',
  muted: '#647a70',
  border: '#dce2dc',
  accent: '#2a8f7a',
  accentSoft: 'rgba(42, 143, 122, 0.14)',
  fgSoft: 'rgba(26, 36, 32, 0.06)',
  danger: '#c0392b',
  dangerSoft: 'rgba(192, 57, 43, 0.12)',
} as const;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 20,
  lg: 32,
  xl: 56,
  xxl: 96,
  cardPadding: 16,
  screenPadding: 20,
} as const;

export const fontSize = {
  h1: 26,
  h2: 20,
  h3: 16,
  body: 15,
  meta: 12,
  small: 11,
  tiny: 10,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  pill: 999,
} as const;
