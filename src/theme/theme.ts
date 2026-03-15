import type { Theme } from '@react-navigation/native';
import { Platform } from 'react-native';

export const palette = {
  background: '#F4F8F3',
  surface: '#FFFFFF',
  surfaceMuted: '#F7FBF7',
  surfaceStrong: '#ECF5ED',
  border: '#D7E4D8',
  borderStrong: '#C1D4C3',
  text: '#142018',
  textMuted: '#5E7064',
  textSoft: '#859387',
  primary: '#1F7A45',
  primaryDark: '#14532D',
  primarySoft: '#E8F5EC',
  primarySurface: '#F1FAF3',
  accent: '#34D399',
  accentSoft: '#D1FAE5',
  warning: '#D97706',
  warningSoft: '#FEF3C7',
  info: '#0F766E',
  infoSoft: '#CCFBF1',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  shadow: '#102116',
  overlay: 'rgba(16, 33, 22, 0.28)',
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  screen: 20,
};

const iosShadow = (opacity: number, radiusValue: number, height: number) => ({
  shadowColor: palette.shadow,
  shadowOpacity: opacity,
  shadowRadius: radiusValue,
  shadowOffset: { width: 0, height },
});

export const shadows = {
  sm: Platform.select({
    ios: iosShadow(0.06, 10, 4),
    android: { elevation: 2 },
    default: {},
  }),
  md: Platform.select({
    ios: iosShadow(0.08, 16, 8),
    android: { elevation: 4 },
    default: {},
  }),
  lg: Platform.select({
    ios: iosShadow(0.12, 24, 14),
    android: { elevation: 7 },
    default: {},
  }),
};

export const navigationTheme: Theme = {
  dark: false,
  colors: {
    primary: palette.primary,
    background: palette.background,
    card: palette.surface,
    text: palette.text,
    border: palette.border,
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
