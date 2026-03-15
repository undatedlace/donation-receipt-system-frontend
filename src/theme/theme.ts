import type { Theme } from '@react-navigation/native';
import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Scale a font size proportionally to the device screen width. */
export const fs = (size: number): number => {
  const scaled = size * (SCREEN_WIDTH / 390);
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

export const palette = {
  // ── Neutrals (zinc) ── clean, non-tinted
  background:     '#FAFAFA',
  surface:        '#FFFFFF',
  surfaceMuted:   '#F4F4F5',
  surfaceStrong:  '#E4E4E7',
  border:         '#E4E4E7',
  borderStrong:   '#D4D4D8',
  text:           '#18181B',
  textMuted:      '#71717A',
  textSoft:       '#A1A1AA',

  // ── Green brand ──
  primary:        '#085524',
  primaryDark:    '#15803D',
  primarySoft:    '#F0FDF4',
  primarySurface: '#DCFCE7',
  accent:         '#22C55E',
  accentSoft:     '#BBF7D0',

  // ── Semantic ──
  warning:        '#D97706',
  warningSoft:    '#FFFBEB',
  info:           '#0F766E',
  infoSoft:       '#F0FDFA',
  danger:         '#DC2626',
  dangerSoft:     '#FEF2F2',

  shadow:         '#000000',
  overlay:        'rgba(0, 0, 0, 0.45)',
};

export const radius = {
  sm:   6,
  md:   8,
  lg:   10,
  xl:   14,
  pill: 9999,
};

export const spacing = {
  xs:     6,
  sm:     10,
  md:     14,
  lg:     18,
  xl:     24,
  xxl:    32,
  screen: 20,
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
  sm: shadow(iosShadow(0.04, 3, 1),  { elevation: 1 }),
  md: shadow(iosShadow(0.06, 6, 2),  { elevation: 2 }),
  lg: shadow(iosShadow(0.08, 10, 4), { elevation: 4 }),
};

export const navigationTheme: Theme = {
  dark: false,
  colors: {
    primary:      palette.primary,
    background:   palette.background,
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
