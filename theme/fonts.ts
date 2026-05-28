import { Edu_NSW_ACT_Foundation, Dosis, Quicksand, Ysabeau_Infant, Playfair_Display } from 'next/font/google';

export const playfairDisplay = Playfair_Display({
    weight: ['400', '500', '600', '700', '800', '900'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-playfair-display',
});

export const eduNswActFoundation = Edu_NSW_ACT_Foundation({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-edu-nsw-act-foundation',
});

export const dosis = Dosis({
    weight: ['400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-dosis',
});

export const quicksand = Quicksand({
    weight: ['400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-quicksand',
});

export const ysabeauInfant = Ysabeau_Infant({
    weight: ['400', '500', '700'],
    style: ['normal', 'italic'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-ysabeau-infant',
});
