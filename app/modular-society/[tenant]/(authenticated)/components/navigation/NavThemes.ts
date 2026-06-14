export const subtleDotPattern = "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTEgMWgxLjE0NnYxLjE0Nkgyem0wIDBoMi4yOTJWMi4yOTJIMnoiIGZpbGw9InJnYmEoMCwwLDAsMC4wMikiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==')";

const createBackground = (pattern: string, base: string) => `${pattern}, ${base}`;

export const PAGE_THEMES = {
    TRADE: {
        desktopBg: createBackground(subtleDotPattern, 'linear-gradient(180deg, rgba(16,185,129,0.08) 0%, rgba(248,250,252,1) 100%)'),
        mobileBg: 'rgba(255,255,255,0.95)',
        main: '#10b981',
        contrastText: '#ffffff',
    },
    MEET: {
        desktopBg: createBackground(subtleDotPattern, 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, rgba(248,250,252,1) 100%)'),
        mobileBg: 'rgba(255,255,255,0.95)',
        main: '#6366f1',
        contrastText: '#ffffff',
    },
    LEARN: {
        desktopBg: createBackground(subtleDotPattern, 'linear-gradient(180deg, rgba(245,158,11,0.08) 0%, rgba(248,250,252,1) 100%)'),
        mobileBg: 'rgba(255,255,255,0.95)',
        main: '#f59e0b',
        contrastText: '#ffffff',
    },
    SUPPORT: {
        desktopBg: createBackground(subtleDotPattern, 'linear-gradient(180deg, rgba(236,72,153,0.08) 0%, rgba(248,250,252,1) 100%)'),
        mobileBg: 'rgba(255,255,255,0.95)',
        main: '#ec4899',
        contrastText: '#ffffff',
    },
    DEFAULT: {
        desktopBg: createBackground(subtleDotPattern, 'linear-gradient(180deg, rgba(248,250,252,1) 0%, #f1f5f9 100%)'),
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
