'use client';

import { dosis, ysabeauInfant, quicksand } from '@/theme/fonts';

export const slideFonts = {
  heading: `${dosis.style.fontFamily}, sans-serif`,
  body: `${ysabeauInfant.style.fontFamily}, sans-serif`,
  label: `${quicksand.style.fontFamily}, sans-serif`,
};

/**
 * Slide Heading Typography Style (Dosis 700 default)
 */
export const slideHeadingSx = (fontSize?: any, customWeight: number | string = 700) => ({
  fontFamily: slideFonts.heading,
  fontWeight: customWeight,
  letterSpacing: '-0.02em',
  ...(fontSize !== undefined ? { fontSize } : {}),
});

/**
 * Slide Body Typography Style (Ysabeau Infant 500 default)
 */
export const slideBodySx = (fontSize?: any, customWeight: number | string = 500) => ({
  fontFamily: slideFonts.body,
  fontWeight: customWeight,
  lineHeight: 1.45,
  ...(fontSize !== undefined ? { fontSize } : {}),
});

/**
 * Slide Label / Overline / Category Tag Typography Style (Quicksand 700 uppercase default)
 */
export const slideLabelSx = (fontSize?: any, customWeight: number | string = 700) => ({
  fontFamily: slideFonts.label,
  fontWeight: customWeight,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  ...(fontSize !== undefined ? { fontSize } : {}),
});

/**
 * Slide Chip / Badge Typography Style (Quicksand 700)
 */
export const slideChipSx = (fontSize?: any) => ({
  fontFamily: slideFonts.label,
  fontWeight: 700,
  letterSpacing: '0.03em',
  ...(fontSize !== undefined ? { fontSize } : {}),
});
