"use client";

import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTenantConfig } from '@/lib/tenants.config';
import { useMemo } from 'react';

export default function ThemeProvider({ children, initialTenant = 'food' }: { children: React.ReactNode, initialTenant?: string }) {
  
  const theme = useMemo(() => {
    const tenant = getTenantConfig(initialTenant);
    
    return createTheme({
      cssVariables: true, 
      palette: {
        mode: 'light',
        primary: { 
          main: tenant.palette.primary,
        },
        secondary: {
          main: tenant.palette.secondary,
        },
        background: { 
          default: tenant.palette.background, 
          paper: '#ffffff' 
        },
      },
      typography: {
        fontFamily: 'var(--font-ysabeau), sans-serif', // Default Body
        h1: { fontFamily: 'var(--font-dosis), sans-serif' },
        h2: { fontFamily: 'var(--font-dosis), sans-serif' },
        h3: { fontFamily: 'var(--font-dosis), sans-serif' },
        h4: { fontFamily: 'var(--font-edu), cursive' }, // Playful headers
        h5: { fontFamily: 'var(--font-edu), cursive' },
        h6: { fontFamily: 'var(--font-edu), cursive' },
        button: {
          fontFamily: 'var(--font-quicksand), sans-serif',
          fontWeight: 700,
        }
      },
      shape: { borderRadius: 16 }, 
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 100,
              textTransform: 'none', 
            },
          },
        },
      },
    });
  }, [initialTenant]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
