import { alpha } from '@mui/material';

// We map our 4 pillars to specific themes
// TRADE: Emerald (#10b981)
// MEET: Indigo (#6366f1)
// LEARN: Amber (#f59e0b)
// SUPPORT: Pink (#ec4899)

export const PAGE_THEMES = {
    TRADE: {
        desktopBg: 'linear-gradient(180deg, rgba(16,185,129,0.08) 0%, rgba(248,250,252,1) 100%)',
        mobileBg: 'rgba(255,255,255,0.95)',
        main: '#10b981',
        contrastText: '#ffffff',
    },
    MEET: {
        desktopBg: 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, rgba(248,250,252,1) 100%)',
        mobileBg: 'rgba(255,255,255,0.95)',
        main: '#6366f1',
        contrastText: '#ffffff',
    },
    LEARN: {
        desktopBg: 'linear-gradient(180deg, rgba(245,158,11,0.08) 0%, rgba(248,250,252,1) 100%)',
        mobileBg: 'rgba(255,255,255,0.95)',
        main: '#f59e0b',
        contrastText: '#ffffff',
    },
    SUPPORT: {
        desktopBg: 'linear-gradient(180deg, rgba(236,72,153,0.08) 0%, rgba(248,250,252,1) 100%)',
        mobileBg: 'rgba(255,255,255,0.95)',
        main: '#ec4899',
        contrastText: '#ffffff',
    },
    DEFAULT: {
        desktopBg: '#f8fafc',
        mobileBg: 'rgba(255,255,255,0.95)',
        main: '#1b5e20',
        contrastText: '#ffffff',
    }
};

export const getActiveTheme = (pathname: string) => {
    if (pathname.includes('/trade')) return PAGE_THEMES.TRADE;
    if (pathname.includes('/meet')) return PAGE_THEMES.MEET;
    if (pathname.includes('/learn')) return PAGE_THEMES.LEARN;
    if (pathname.includes('/support')) return PAGE_THEMES.SUPPORT;
    return PAGE_THEMES.DEFAULT;
};
