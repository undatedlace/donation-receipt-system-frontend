import type { Theme } from '@react-navigation/native';
import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Scale a font size proportionally to the device screen width. */
export const fs = (size: number): number => {
  const scaled = size * (SCREEN_WIDTH / 390) * 0.93;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

export const palette = {
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

const iosShadow = (opacity: number, radiusValue: number, height: number) => ({
  shadowColor: palette.shadow,
  shadowOpacity: opacity,
  shadowRadius: radiusValue,
  shadowOffset: { width: 0, height },
});

type ShadowStyle = { elevation?: number; shadowColor?: string; shadowOpacity?: number; shadowRadius?: number; shadowOffset?: { width: number; height: number } };

const shadow = (ios: ShadowStyle, android: ShadowStyle): ShadowStyle =>
  Platform.OS === 'android' ? android : ios;

export const shadows: Record<'sm' | 'md' | 'lg', ShadowStyle> = {
  sm: shadow(iosShadow(0.08, 8, 3),   { elevation: 2 }),
  md: shadow(iosShadow(0.12, 16, 8),  { elevation: 4 }),
  lg: shadow(iosShadow(0.16, 22, 12), { elevation: 8 }),
};

export const navigationTheme: Theme = {
  dark: false,
  colors: {
    primary:      palette.primary,
    background:   'transparent',
    card:         palette.surface,
    text:         palette.text,
    border:       palette.border,
    notification: palette.accent,
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
