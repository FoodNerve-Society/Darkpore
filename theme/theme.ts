'use client';
import { createTheme, alpha, Palette as MuiPalette } from '@mui/material/styles';
import { eduNswActFoundation, dosis, quicksand, ysabeauInfant, playfairDisplay, inter, outfit } from './fonts';
import { getTenantConfig } from '@/lib/cms';

const subtleDotPattern = "url('data:image/svg+xml;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAgMBgQKQnAAAAABJRU5ErkJggg==')";
const createBackground = (base: string) => `${subtleDotPattern}, ${base}`;
const createMobileBackground = (base: string) => base.replace('180deg', '90deg'); // Helper for mobile gradient

// **THE FIX:** Define our custom palette shape first.
interface CustomPalette {
  watch: { main: string; contrastText: string; background: string; mobileBackground: string; };
  meet: { main: string; contrastText: string; background: string; mobileBackground: string; };
  manage: { main: string; contrastText: string; background: string; mobileBackground: string; };
  default: { main: string; contrastText: string; background: string; mobileBackground: string; };
}
export type CustomPaletteKey = keyof CustomPalette;

// --- TYPE AUGMENTATION ---
declare module '@mui/material/styles' {
  interface Palette {
    custom: CustomPalette;
    surface: { main: string; variant: string; };
  }
  interface PaletteOptions {
    custom?: Partial<CustomPalette>;
    surface?: { main: string; variant: string; };
  }
  interface PaletteColor {
    container?: string;
    onContainer?: string;
  }
  interface SimplePaletteColorOptions {
    container?: string;
    onContainer?: string;
  }
  interface TypographyVariants {
    stylishHeader: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    stylishHeader?: React.CSSProperties;
  }
}

// Augment the Typography component to accept the new variant
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    stylishHeader: true;
  }
}

export const getTheme = (mode: 'light' | 'dark', tenantId: string = 'food') => {
  const tenant = getTenantConfig(tenantId);
  const p = tenant.palette[mode];

  return createTheme({
    palette: {
      mode,
      primary: p.primary,
      secondary: p.secondary,
      background: p.background,
      text: p.text,
      custom: {
        watch: { 
          main: p.custom.watch.main, 
          contrastText: p.custom.watch.contrastText, 
          background: createBackground(`linear-gradient(180deg, ${p.custom.watch.gradientStart} 0%, ${p.custom.watch.gradientEnd} 100%)`), 
          mobileBackground: createMobileBackground(`linear-gradient(180deg, ${p.custom.watch.gradientStart} 0%, ${p.custom.watch.gradientEnd} 100%)`) 
        },
        meet: { 
          main: p.custom.meet.main, 
          contrastText: p.custom.meet.contrastText, 
          background: createBackground(`linear-gradient(180deg, ${p.custom.meet.gradientStart} 0%, ${p.custom.meet.gradientEnd} 100%)`), 
          mobileBackground: createMobileBackground(`linear-gradient(180deg, ${p.custom.meet.gradientStart} 0%, ${p.custom.meet.gradientEnd} 100%)`) 
        },
        manage: { 
          main: p.custom.manage.main, 
          contrastText: p.custom.manage.contrastText, 
          background: createBackground(`linear-gradient(180deg, ${p.custom.manage.gradientStart} 20%, ${p.custom.manage.gradientEnd} 90%)`), 
          mobileBackground: createMobileBackground(`linear-gradient(180deg, ${p.custom.manage.gradientStart} 20%, ${p.custom.manage.gradientEnd} 90%)`) 
        },
        default: { 
          main: p.custom.default.main, 
          contrastText: p.custom.default.contrastText, 
          background: createBackground(`linear-gradient(180deg, ${p.custom.default.gradientStart} 0%, ${p.custom.default.gradientEnd} 100%)`), 
          mobileBackground: createMobileBackground(`linear-gradient(180deg, ${p.custom.default.gradientStart} 0%, ${p.custom.default.gradientEnd} 100%)`) 
        },
      },
    },
    typography: {
      fontFamily: `${outfit.style.fontFamily}, ${inter.style.fontFamily}, ${ysabeauInfant.style.fontFamily}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
      h1: { fontFamily: `${outfit.style.fontFamily}, ${dosis.style.fontFamily}, sans-serif`, fontWeight: 800 },
      h2: { fontFamily: `${outfit.style.fontFamily}, ${dosis.style.fontFamily}, sans-serif`, fontWeight: 800 },
      h3: { fontFamily: `${outfit.style.fontFamily}, ${dosis.style.fontFamily}, sans-serif`, fontWeight: 800 },
      h4: { fontFamily: `${outfit.style.fontFamily}, ${dosis.style.fontFamily}, sans-serif`, fontWeight: 700 },
      h5: { fontFamily: `${outfit.style.fontFamily}, ${dosis.style.fontFamily}, sans-serif`, fontWeight: 700 },
      h6: { fontFamily: `${outfit.style.fontFamily}, ${dosis.style.fontFamily}, sans-serif`, fontWeight: 600 },
      button: {
        fontFamily: `${outfit.style.fontFamily}, ${quicksand.style.fontFamily}, sans-serif`,
        fontWeight: 800,
        textTransform: 'none',
      },
      body1: { fontFamily: `${inter.style.fontFamily}, ${ysabeauInfant.style.fontFamily}, sans-serif`, lineHeight: 1.5 },
      body2: { fontFamily: `${inter.style.fontFamily}, ${ysabeauInfant.style.fontFamily}, sans-serif`, lineHeight: 1.4 },
      caption: { fontFamily: `${inter.style.fontFamily}, ${ysabeauInfant.style.fontFamily}, sans-serif`, fontStyle: 'italic' },
      overline: { fontFamily: `${outfit.style.fontFamily}, ${quicksand.style.fontFamily}, sans-serif` },
      stylishHeader: {
        fontFamily: eduNswActFoundation.style.fontFamily,
        fontWeight: 700,
      }
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          body {
            background-color: ${p.background.default};
          }
        `,
      },
      // Global override to preventing buttons from growing too wide or cutting off text on large fonts
      MuiButton: {
        styleOverrides: {
          root: {
            height: 'auto', // Never fixed height
            minHeight: 40, // Ensure touch target
            paddingTop: 8,
            paddingBottom: 8,
            whiteSpace: 'normal', // Allow wrapping
            lineHeight: 1.2, // Tighter leading for multi-line
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            height: 'auto', // Allow growth
            minHeight: 32,
            paddingTop: 4,
            paddingBottom: 4,
            whiteSpace: 'normal',
          },
          label: {
            whiteSpace: 'normal', // Wrap text inside chip
            display: 'block',
            paddingLeft: 8,
            paddingRight: 8,
          }
        }
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 24,
            backgroundImage: 'none',
          }
        }
      }
    },
  });
};
