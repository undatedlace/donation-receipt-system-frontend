import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import {
  createNavigationTheme,
  createShadows,
  darkPalette,
  lightPalette,
  type Palette,
} from './theme';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  palette: Palette;
  shadows: ReturnType<typeof createShadows>;
  navigationTheme: ReturnType<typeof createNavigationTheme>;
  setMode: (mode: ThemeMode) => void;
}

const STORAGE_KEY = 'app.themeMode';

const ThemeContext = createContext<ThemeContextValue>({} as ThemeContextValue);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  // Load persisted preference on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(saved => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setModeState(saved);
        }
      })
      .catch(e => console.warn('Failed to load theme preference:', e));
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(e =>
      console.warn('Failed to save theme preference:', e),
    );
  }, []);

  const isDark = useMemo(() => {
    if (mode === 'system') return systemScheme === 'dark';
    return mode === 'dark';
  }, [mode, systemScheme]);

  const palette = useMemo<Palette>(
    () => (isDark ? darkPalette : lightPalette),
    [isDark],
  );

  const shadows = useMemo(() => createShadows(palette), [palette]);

  const navigationTheme = useMemo(
    () => createNavigationTheme(palette, isDark),
    [palette, isDark],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, isDark, palette, shadows, navigationTheme, setMode }),
    [mode, isDark, palette, shadows, navigationTheme, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
