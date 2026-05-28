'use client';

import React, { createContext, useState, useMemo, useContext } from 'react';
import { ThemeProvider as MUIThemeProvider, Theme, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GlobalStyles } from '@mui/material';
import { getTheme } from './theme';

// --- THEME CONTEXT ---
interface ThemeContextType {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
  tenantId: string;
}

export const ThemeManagerContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => console.error("toggleTheme() called outside of a ThemeProvider"),
  tenantId: 'food'
});

export const useThemeManager = () => useContext(ThemeManagerContext);

// --- GLOBAL STYLES ---
const globalScrollbarStyles = (theme: Theme) => ({
  '::-webkit-scrollbar': { width: '8px', height: '8px' },
  '::-webkit-scrollbar-track': { background: 'transparent' },
  '::-webkit-scrollbar-thumb': {
    backgroundColor: alpha(theme.palette.text.primary, 0.25),
    borderRadius: '10px',
    border: '2px solid transparent',
    backgroundClip: 'content-box',
  },
  '::-webkit-scrollbar-thumb:hover': {
    backgroundColor: alpha(theme.palette.text.primary, 0.45),
  },
  '*': {
    scrollbarWidth: 'thin',
    scrollbarColor: `${alpha(theme.palette.text.primary, 0.25)} transparent`,
  },
  'html, body': {
    width: '100%',
    margin: 0,
    padding: 0,
  },
});

// --- THE DEFINITIVE THEME REGISTRY COMPONENT ---
export default function ThemeRegistry({ children, initialTenant = 'food' }: { children: React.ReactNode, initialTenant?: string }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Memoize the theme object so it's only recreated when the mode or tenant changes.
  const theme = useMemo(() => getTheme(mode, initialTenant), [mode, initialTenant]);

  // The value for our context provider.
  const contextValue = useMemo(() => ({
    mode,
    toggleTheme,
    tenantId: initialTenant
  }), [mode, initialTenant]);

  return (
    <ThemeManagerContext.Provider value={contextValue}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles styles={globalScrollbarStyles(theme)} />
        {children}
      </MUIThemeProvider>
    </ThemeManagerContext.Provider>
  );
}
