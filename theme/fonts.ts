import {
    Edu_NSW_ACT_Foundation,
    Dosis,
    Quicksand,
    Ysabeau_Infant,
    Playfair_Display,
    Lexend,
    Plus_Jakarta_Sans,
    Source_Serif_4,
    Literata,
    Outfit,
    Space_Grotesk,
    Newsreader,
    DM_Serif_Display,
    Sora,
    Kalam,
} from 'next/font/google';

// ── Legacy / Existing Theme Fonts (Variable fonts omit weight arrays for Turbopack stability) ──
export const playfairDisplay = Playfair_Display({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-playfair-display',
});

export const eduNswActFoundation = Edu_NSW_ACT_Foundation({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-edu-nsw-act-foundation',
});

export const dosis = Dosis({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-dosis',
});

export const quicksand = Quicksand({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-quicksand',
});

export const ysabeauInfant = Ysabeau_Infant({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-ysabeau-infant',
});

// ── 4 High-Clarity Body Fonts (45+ Optical Comfort) ──
export const lexend = Lexend({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-lexend',
});

export const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-jakarta',
});

export const sourceSerif4 = Source_Serif_4({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-source-serif',
});

export const literata = Literata({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-literata',
});

// ── Main Heading Fonts (H1 - H6) ──
export const outfit = Outfit({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-outfit',
});

export const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-space-grotesk',
});

export const newsreader = Newsreader({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-newsreader',
});

// ── Stylised Heading / Display Fonts ──
export const dmSerifDisplay = DM_Serif_Display({
    weight: ['400'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-dm-serif',
});

export const sora = Sora({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-sora',
});

export const kalam = Kalam({
    weight: ['400', '700'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-kalam',
});

export const allFontVariables = [
    playfairDisplay.variable,
    eduNswActFoundation.variable,
    dosis.variable,
    quicksand.variable,
    ysabeauInfant.variable,
    lexend.variable,
    plusJakartaSans.variable,
    sourceSerif4.variable,
    literata.variable,
    outfit.variable,
    spaceGrotesk.variable,
    newsreader.variable,
    dmSerifDisplay.variable,
    sora.variable,
    kalam.variable,
].join(' ');
