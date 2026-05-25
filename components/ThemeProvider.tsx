"use client";

import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const m3Theme = createTheme({
  cssVariables: true, // MUI v9 CSS variables feature
  palette: {
    mode: 'light',
    primary: { 
      main: '#2E7D32', // Food Nerve Green
      light: '#60ad5e',
      dark: '#005005',
      contrastText: '#ffffff'
    },
    background: { default: '#f4f6f8', paper: '#ffffff' },
  },
  shape: { borderRadius: 16 }, // M3 rounder corners
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 100, // Fully rounded capsules
          textTransform: 'none', // Abandon all-caps
        },
      },
    },
  },
});

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MuiThemeProvider theme={m3Theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
