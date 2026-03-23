import type { Theme } from '@react-navigation/native';
import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Scale a font size proportionally to the device screen width. */
export const fs = (size: number): number => {
  const scaled = size * (SCREEN_WIDTH / 390) * 0.93;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

export const lightPalette = {
  background:     '#FFFFFF',
  surface:        '#FFFFFF',
  surfaceMuted:   '#F5F8F6',
  surfaceStrong:  '#E4EEE8',
  border:         '#D7E2DD',
  borderStrong:   '#C3D4CC',
  text:           '#18322B',
  textMuted:      '#6A7F77',
  textSoft:       '#98A9A1',

  // ── Green brand ──
  primary:        '#045E53',
  primaryDark:    '#03473F',
  primarySoft:    '#E5F1EB',
  primarySurface: '#CFE3D8',
  accent:         '#2B8A6B',
  accentSoft:     '#B7D5C5',

  // ── Semantic ──
  warning:        '#D97706',
  warningSoft:    '#FFF7E8',
  info:           '#0D7666',
  infoSoft:       '#ECFBF7',
  danger:         '#DC2626',
  dangerSoft:     '#FFF1F1',

  shadow:         '#0D271F',
  overlay:        'rgba(4, 24, 19, 0.5)',
};

export const darkPalette = {
  background:     '#0D1A16',
  surface:        '#152019',
  surfaceMuted:   '#1C2B24',
  surfaceStrong:  '#223630',
  border:         '#2A3F38',
  borderStrong:   '#355149',
  text:           '#E4F1EB',
  textMuted:      '#7EADA0',
  textSoft:       '#4E7268',

  // ── Green brand ──
  primary:        '#045E53',
  primaryDark:    '#03473F',
  primarySoft:    '#122E28',
  primarySurface: '#183B33',
  accent:         '#2B8A6B',
  accentSoft:     '#163B2D',

  // ── Semantic ──
  warning:        '#F59E0B',
  warningSoft:    '#271B07',
  info:           '#14B8A6',
  infoSoft:       '#0A2824',
  danger:         '#F87171',
  dangerSoft:     '#2A1010',

  shadow:         '#000000',
  overlay:        'rgba(0, 0, 0, 0.7)',
};

/** Default (light) palette — kept for static / non-themed usage */
export const palette = lightPalette;

export type Palette = typeof lightPalette;

export const radius = {
  sm:   12,
  md:   16,
  lg:   22,
  xl:   30,
  pill: 9999,
};

export const spacing = {
  xs:     8,
  sm:     12,
  md:     16,
  lg:     20,
  xl:     28,
  xxl:    36,
  screen: 22,
};

type ShadowStyle = { elevation?: number; shadowColor?: string; shadowOpacity?: number; shadowRadius?: number; shadowOffset?: { width: number; height: number } };

const iosShadow = (shadowColor: string, opacity: number, radiusValue: number, height: number): ShadowStyle => ({
  shadowColor,
  shadowOpacity: opacity,
  shadowRadius: radiusValue,
  shadowOffset: { width: 0, height },
});

const shadow = (ios: ShadowStyle, android: ShadowStyle): ShadowStyle =>
  Platform.OS === 'android' ? android : ios;

export function createShadows(p: Palette): Record<'sm' | 'md' | 'lg', ShadowStyle> {
  return {
    sm: shadow(iosShadow(p.shadow, 0.08, 8,  3),  { elevation: 2 }),
    md: shadow(iosShadow(p.shadow, 0.12, 16, 8),  { elevation: 4 }),
    lg: shadow(iosShadow(p.shadow, 0.16, 22, 12), { elevation: 8 }),
  };
}

/** Static shadows for light mode — used where dynamic theme isn't available */
export const shadows = createShadows(lightPalette);

export function createNavigationTheme(p: Palette, dark: boolean): Theme {
  return {
    dark,
    colors: {
      primary:      p.primary,
      background:   'transparent',
      card:         p.surface,
      text:         p.text,
      border:       p.border,
      notification: p.accent,
    },
    fonts: {
      regular: {
        fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
        fontWeight: '400',
      },
      medium: {
        fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
        fontWeight: '500',
      },
      bold: {
        fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
        fontWeight: '700',
      },
      heavy: {
        fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
        fontWeight: '800',
      },
    },
  };
}

/** Static navigation theme for light mode — kept for non-themed usage */
export const navigationTheme = createNavigationTheme(lightPalette, false);
