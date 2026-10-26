'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Snackbar,
  Alert,
  Collapse,
  Slider,
  alpha,
} from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Tune as TuneIcon,
  CompareArrows as CompareArrowsIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';

export type BodyFontKey = 'lexend' | 'jakarta' | 'sourceSerif' | 'literata' | 'legacy';
export type HeadingFontKey = 'outfit' | 'spaceGrotesk' | 'jakartaBold' | 'newsreader' | 'legacy';
export type StylisedFontKey = 'dmSerif' | 'playfairBold' | 'sora' | 'kalam' | 'legacy';
export type SizePresetKey = 'standard' | 'comfort' | 'large';

export interface FontOption<T extends string> {
  key: T;
  label: string;
  subtitle: string;
  sampleText: string;
  cssFamily: string;
  weight?: number;
}

export const BODY_FONT_OPTIONS: FontOption<BodyFontKey>[] = [
  {
    key: 'lexend',
    label: 'Lexend',
    subtitle: 'Open shapes · Zero eye strain',
    sampleText: 'Every week during harvest, ventilated crates preserve 95% of fruit weight.',
    cssFamily: 'var(--font-lexend), system-ui, sans-serif',
  },
  {
    key: 'jakarta',
    label: 'Plus Jakarta Sans',
    subtitle: 'Tall lowercase · Modern executive',
    sampleText: 'Every week during harvest, ventilated crates preserve 95% of fruit weight.',
    cssFamily: 'var(--font-jakarta), system-ui, sans-serif',
  },
  {
    key: 'sourceSerif',
    label: 'Source Serif 4',
    subtitle: 'Financial Times · Classic journal',
    sampleText: 'Every week during harvest, ventilated crates preserve 95% of fruit weight.',
    cssFamily: 'var(--font-source-serif), Georgia, serif',
  },
  {
    key: 'literata',
    label: 'Literata',
    subtitle: 'Kindle screen serif · Warm & sturdy',
    sampleText: 'Every week during harvest, ventilated crates preserve 95% of fruit weight.',
    cssFamily: 'var(--font-literata), Georgia, serif',
  },
];

export const HEADING_FONT_OPTIONS: FontOption<HeadingFontKey>[] = [
  {
    key: 'outfit',
    label: 'Outfit',
    subtitle: 'Bold geometric authority',
    sampleText: 'The 42% Mile 12 Tomato Rot Trap:',
    cssFamily: 'var(--font-outfit), system-ui, sans-serif',
    weight: 800,
  },
  {
    key: 'spaceGrotesk',
    label: 'Space Grotesk',
    subtitle: 'Crisp intelligence briefing',
    sampleText: 'The 42% Mile 12 Tomato Rot Trap:',
    cssFamily: 'var(--font-space-grotesk), system-ui, sans-serif',
    weight: 700,
  },
  {
    key: 'jakartaBold',
    label: 'Jakarta ExtraBold',
    subtitle: 'Commanding corporate sans',
    sampleText: 'The 42% Mile 12 Tomato Rot Trap:',
    cssFamily: 'var(--font-jakarta), system-ui, sans-serif',
    weight: 800,
  },
  {
    key: 'newsreader',
    label: 'Newsreader Bold',
    subtitle: 'Prestige editorial headline',
    sampleText: 'The 42% Mile 12 Tomato Rot Trap:',
    cssFamily: 'var(--font-newsreader), Georgia, serif',
    weight: 700,
  },
];

export const STYLISED_FONT_OPTIONS: FontOption<StylisedFontKey>[] = [
  {
    key: 'dmSerif',
    label: 'DM Serif Display',
    subtitle: 'Boardroom prestige serif',
    sampleText: 'and why woven baskets must be retired',
    cssFamily: 'var(--font-dm-serif), Georgia, serif',
    weight: 400,
  },
  {
    key: 'playfairBold',
    label: 'Playfair Bold',
    subtitle: 'Luxury magazine cover',
    sampleText: 'and why woven baskets must be retired',
    cssFamily: 'var(--font-playfair-display), Georgia, serif',
    weight: 700,
  },
  {
    key: 'sora',
    label: 'Sora',
    subtitle: 'Modern architectural display',
    sampleText: 'and why woven baskets must be retired',
    cssFamily: 'var(--font-sora), system-ui, sans-serif',
    weight: 700,
  },
  {
    key: 'kalam',
    label: 'Kalam Bold',
    subtitle: 'High-clarity handcrafted note',
    sampleText: 'and why woven baskets must be retired',
    cssFamily: 'var(--font-kalam), cursive, sans-serif',
    weight: 700,
  },
];

export const SIZE_OPTIONS: {
  key: SizePresetKey;
  step: number;
  label: string;
  shortLabel: string;
  bodySize: string;
  lineHeight: number;
  headingScale: number;
}[] = [
  {
    key: 'standard',
    step: 0,
    label: 'Standard (18px)',
    shortLabel: '18px',
    bodySize: '1.125rem',
    lineHeight: 1.75,
    headingScale: 1,
  },
  {
    key: 'comfort',
    step: 1,
    label: 'Comfort+ (20px)',
    shortLabel: '20px',
    bodySize: '1.25rem',
    lineHeight: 1.82,
    headingScale: 1.06,
  },
  {
    key: 'large',
    step: 2,
    label: 'Large++ (22px)',
    shortLabel: '22px',
    bodySize: '1.375rem',
    lineHeight: 1.88,
    headingScale: 1.12,
  },
];

export interface CuratedFontSet {
  id: 1 | 2 | 3 | 4;
  name: string;
  mood: string;
  body: BodyFontKey;
  heading: HeadingFontKey;
  stylised: StylisedFontKey;
  showcaseSlug: string;
}

export const CURATED_FONT_SETS: CuratedFontSet[] = [
  {
    id: 1,
    name: 'Clarity Sans',
    mood: 'Open letter shapes engineered for effortless screen reading',
    body: 'lexend',
    heading: 'outfit',
    stylised: 'dmSerif',
    showcaseSlug: 'font-showcase-1-lexend-clarity',
  },
  {
    id: 2,
    name: 'Modern Executive',
    mood: 'Crisp corporate intelligence with tall lowercase letters',
    body: 'jakarta',
    heading: 'spaceGrotesk',
    stylised: 'playfairBold',
    showcaseSlug: 'font-showcase-2-jakarta-executive',
  },
  {
    id: 3,
    name: 'Classic Editorial',
    mood: 'Financial Times & medical journal authority for long analysis',
    body: 'sourceSerif',
    heading: 'newsreader',
    stylised: 'sora',
    showcaseSlug: 'font-showcase-3-sourceserif-editorial',
  },
  {
    id: 4,
    name: 'Kindle Comfort',
    mood: 'Warm digital book serif paired with bold modern headers',
    body: 'literata',
    heading: 'jakartaBold',
    stylised: 'kalam',
    showcaseSlug: 'font-showcase-4-literata-comfort',
  },
];

const STORAGE_KEY = 'foodnerve_article_typography_v1';

function detectArticlePresetSet(articleSlug?: string, tags?: string[]): CuratedFontSet | null {
  const normalizedSlug = (articleSlug || '').toLowerCase();
  const normalizedTags = Array.isArray(tags) ? tags.map((t) => String(t).toLowerCase()) : [];

  for (const set of CURATED_FONT_SETS) {
    if (
      normalizedSlug.includes(`font-showcase-${set.id}`) ||
      normalizedTags.includes(`font-set-${set.id}`)
    ) {
      return set;
    }
  }
  return null;
}

interface ArticleTypographyScopeProps {
  children?: React.ReactNode;
  articleSlug?: string;
  tags?: string[];
  themeMode?: 'light' | 'dark';
  accentColor?: string;
  compactTopMargin?: boolean;
}

export const ArticleTypographyBar: React.FC<Omit<ArticleTypographyScopeProps, 'children'>> = (
  props
) => <ArticleTypographyScope {...props} />;

export const ArticleTypographyScope: React.FC<ArticleTypographyScopeProps> = ({
  children,
  articleSlug,
  tags,
  themeMode = 'light',
  accentColor = '#10b981',
  compactTopMargin = false,
}) => {
  const isDark = themeMode === 'dark';
  const matchedPreset = useMemo(
    () => detectArticlePresetSet(articleSlug, tags),
    [articleSlug, tags]
  );

  const [bodyFont, setBodyFont] = useState<BodyFontKey>(matchedPreset?.body || 'lexend');
  const [headingFont, setHeadingFont] = useState<HeadingFontKey>(
    matchedPreset?.heading || 'outfit'
  );
  const [stylisedFont, setStylisedFont] = useState<StylisedFontKey>(
    matchedPreset?.stylised || 'dmSerif'
  );
  const [sizePreset, setSizePreset] = useState<SizePresetKey>('comfort');
  const [isLegacyCompare, setIsLegacyCompare] = useState<boolean>(false);

  // Progressive disclosure states:
  // 1. studioOpen = false -> tucked away as a sleek minimal pill
  // 2. studioOpen = true  -> shows the Specimen Slide Preview + 1-at-a-time Set Slider + Size Slider
  // 3. customMixOpen = true -> progressively reveals the 3-tab individual slot mixer
  const [studioOpen, setStudioOpen] = useState<boolean>(false);
  const [customMixOpen, setCustomMixOpen] = useState<boolean>(false);
  const [activeSlotTab, setActiveSlotTab] = useState<'body' | 'heading' | 'stylised'>('body');
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  useEffect(() => {
    if (matchedPreset) {
      setBodyFont(matchedPreset.body);
      setHeadingFont(matchedPreset.heading);
      setStylisedFont(matchedPreset.stylised);
      setIsLegacyCompare(false);
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.bodyFont) setBodyFont(parsed.bodyFont);
        if (parsed.headingFont) setHeadingFont(parsed.headingFont);
        if (parsed.stylisedFont) setStylisedFont(parsed.stylisedFont);
        if (parsed.sizePreset) setSizePreset(parsed.sizePreset);
      }
    } catch {
      // ignore storage errors
    }
  }, [matchedPreset]);

  const persistChoice = (
    nextBody: BodyFontKey,
    nextHeading: HeadingFontKey,
    nextStylised: StylisedFontKey,
    nextSize: SizePresetKey
  ) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          bodyFont: nextBody,
          headingFont: nextHeading,
          stylisedFont: nextStylised,
          sizePreset: nextSize,
        })
      );
    } catch {
      // ignore
    }
  };

  const handleApplySet = (set: CuratedFontSet) => {
    setIsLegacyCompare(false);
    setBodyFont(set.body);
    setHeadingFont(set.heading);
    setStylisedFont(set.stylised);
    persistChoice(set.body, set.heading, set.stylised, sizePreset);
  };

  const activeBodyOption =
    BODY_FONT_OPTIONS.find((o) => o.key === bodyFont) || BODY_FONT_OPTIONS[0];
  const activeHeadingOption =
    HEADING_FONT_OPTIONS.find((o) => o.key === headingFont) || HEADING_FONT_OPTIONS[0];
  const activeStylisedOption =
    STYLISED_FONT_OPTIONS.find((o) => o.key === stylisedFont) || STYLISED_FONT_OPTIONS[0];
  const activeSizeOption =
    SIZE_OPTIONS.find((s) => s.key === sizePreset) || SIZE_OPTIONS[1];

  const resolvedBodyFamily = isLegacyCompare
    ? 'var(--font-ysabeau-infant), serif'
    : activeBodyOption.cssFamily;
  const resolvedHeadingFamily = isLegacyCompare
    ? 'var(--font-dosis), sans-serif'
    : activeHeadingOption.cssFamily;
  const resolvedStylisedFamily = isLegacyCompare
    ? 'var(--font-edu-nsw-act-foundation), cursive'
    : activeStylisedOption.cssFamily;
  const resolvedBodySize = isLegacyCompare ? '1rem' : activeSizeOption.bodySize;
  const resolvedLineHeight = isLegacyCompare ? 1.6 : activeSizeOption.lineHeight;

  const activeSetIndex = useMemo(() => {
    const idx = CURATED_FONT_SETS.findIndex(
      (s) => s.body === bodyFont && s.heading === headingFont && s.stylised === stylisedFont
    );
    return idx >= 0 ? idx : 0;
  }, [bodyFont, headingFont, stylisedFont]);

  const isCustomMix =
    !isLegacyCompare &&
    !CURATED_FONT_SETS.some(
      (s) => s.body === bodyFont && s.heading === headingFont && s.stylised === stylisedFont
    );

  const handleStepSlide = (direction: -1 | 1) => {
    const nextIndex =
      (activeSetIndex + direction + CURATED_FONT_SETS.length) % CURATED_FONT_SETS.length;
    handleApplySet(CURATED_FONT_SETS[nextIndex]);
  };

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--article-body-font', resolvedBodyFamily);
    root.style.setProperty('--article-heading-font', resolvedHeadingFamily);
    root.style.setProperty('--article-stylised-font', resolvedStylisedFamily);
    root.style.setProperty('--article-body-size', resolvedBodySize);
    root.style.setProperty('--article-line-height', String(resolvedLineHeight));
    root.style.setProperty(
      '--article-heading-scale',
      String(isLegacyCompare ? 1 : activeSizeOption.headingScale)
    );
  }, [
    resolvedBodyFamily,
    resolvedHeadingFamily,
    resolvedStylisedFamily,
    resolvedBodySize,
    resolvedLineHeight,
    isLegacyCompare,
    activeSizeOption.headingScale,
  ]);

  const handleCopySelection = () => {
    const summary = `Preferred FoodNerve Typography:\n• Body Text: ${activeBodyOption.label}\n• Main Headings: ${activeHeadingOption.label}\n• Stylised Headings: ${activeStylisedOption.label}\n• Reading Size: ${activeSizeOption.label}`;
    navigator.clipboard.writeText(summary);
    setCopiedToast(true);
  };

  const currentSet = CURATED_FONT_SETS[activeSetIndex];

  return (
    <Box
      className="article-typography-scope"
      sx={{
        '--article-body-font': resolvedBodyFamily,
        '--article-heading-font': resolvedHeadingFamily,
        '--article-stylised-font': resolvedStylisedFamily,
        '--article-body-size': resolvedBodySize,
        '--article-line-height': String(resolvedLineHeight),
        '--article-heading-scale': String(isLegacyCompare ? 1 : activeSizeOption.headingScale),
        fontFamily: 'var(--article-body-font)',
      } as React.CSSProperties}
    >
      {/* ═══════════════════ UNIFIED MORPHING TYPOGRAPHY STUDIO PILL / CARD ═══════════════════ */}
      <Box
        sx={{
          mx: 'auto',
          maxWidth: 720,
          mb: compactTopMargin ? 2.5 : 4,
          borderRadius: studioOpen ? '28px' : '100px',
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.92) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: `1.5px solid ${alpha(accentColor, isDark ? 0.45 : 0.35)}`,
          boxShadow: isDark
            ? `0 16px 40px rgba(0, 0, 0, 0.52), 0 0 0 4px ${alpha(accentColor, 0.08)}`
            : `0 14px 34px rgba(15, 23, 42, 0.08), 0 0 0 4px ${alpha(accentColor, 0.06)}`,
          overflow: 'hidden',
          transition: 'border-radius 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.28s ease',
        }}
      >
        {/* Top Pill Header Row */}
        <Box
          sx={{
            p: 1,
            pl: { xs: 1.5, sm: 2 },
            pr: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.25,
            borderBottom: studioOpen
              ? `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.07)'}`
              : 'none',
          }}
        >
          {/* Left: Glowing "Aa" Emblem + Title */}
          <Box
            onClick={() => setStudioOpen((prev) => !prev)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              cursor: 'pointer',
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: studioOpen ? '12px' : '50%',
                bgcolor: accentColor,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: resolvedHeadingFamily,
                fontWeight: 900,
                fontSize: '0.98rem',
                boxShadow: `0 4px 14px ${alpha(accentColor, 0.4)}`,
                flexShrink: 0,
                transition: 'border-radius 0.28s ease',
              }}
            >
              Aa
            </Box>
            <Box>
              <Typography
                sx={{
                  fontFamily: 'var(--font-jakarta), sans-serif !important',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em !important',
                  color: accentColor,
                  lineHeight: 1.1,
                }}
              >
                Typography Studio
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'var(--font-jakarta), sans-serif !important',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: isDark ? '#f8fafc' : '#0f172a',
                  lineHeight: 1.25,
                }}
              >
                {isLegacyCompare
                  ? 'Old Website Fonts'
                  : isCustomMix
                  ? `${activeBodyOption.label} + Custom`
                  : `${currentSet.name} (${activeBodyOption.label})`}
              </Typography>
            </Box>
          </Box>

          {/* Center: 4 One-Tap Set Pills right on the Dock */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              p: 0.4,
              borderRadius: '100px',
              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
            }}
          >
            {CURATED_FONT_SETS.map((set, idx) => {
              const active = !isLegacyCompare && !isCustomMix && idx === activeSetIndex;
              return (
                <Box
                  key={set.id}
                  onClick={() => handleApplySet(set)}
                  sx={{
                    px: { xs: 1.1, sm: 1.4 },
                    py: 0.5,
                    borderRadius: '100px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-jakarta), sans-serif !important',
                    fontSize: '0.76rem',
                    fontWeight: active ? 800 : 600,
                    bgcolor: active ? accentColor : 'transparent',
                    color: active ? '#ffffff' : isDark ? '#cbd5e1' : '#475569',
                    boxShadow: active ? `0 2px 10px ${alpha(accentColor, 0.35)}` : 'none',
                    transition: 'all 0.18s ease',
                    '&:hover': {
                      color: active ? '#ffffff' : accentColor,
                    },
                  }}
                >
                  Set {set.id}
                </Box>
              );
            })}
          </Box>

          {/* Right: Dropdown / Dropup Icon Button */}
          <IconButton
            size="small"
            onClick={() => setStudioOpen((prev) => !prev)}
            aria-label={studioOpen ? 'Collapse Typography Studio' : 'Expand Typography Studio'}
            sx={{
              width: 36,
              height: 36,
              borderRadius: studioOpen ? '12px' : '50%',
              bgcolor: studioOpen
                ? accentColor
                : isDark
                ? 'rgba(255,255,255,0.08)'
                : alpha(accentColor, 0.12),
              color: studioOpen ? '#ffffff' : accentColor,
              transition: 'all 0.24s ease',
              '&:hover': {
                bgcolor: studioOpen ? alpha(accentColor, 0.88) : alpha(accentColor, 0.22),
                transform: 'scale(1.05)',
              },
            }}
          >
            {studioOpen ? (
              <KeyboardArrowUpIcon sx={{ fontSize: 22 }} />
            ) : (
              <KeyboardArrowDownIcon sx={{ fontSize: 22 }} />
            )}
          </IconButton>
        </Box>

        {/* ═══════════════════ 2. PROGRESSIVE REVEAL: STUDIO BODY INSIDE UNIFIED SHELL ═══════════════════ */}
        <Collapse in={studioOpen} timeout={280}>
          <Box
            sx={{
              p: { xs: 2.25, sm: 3 },
            }}
          >
          {/* ── STAGE A: LIVE SPECIMEN PREVIEW SLIDE (With Prev / Next Carousel) ── */}
          <Box
            sx={{
              position: 'relative',
              borderRadius: '18px',
              p: { xs: 2.25, sm: 3 },
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
              border: `1px solid ${
                isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(15, 23, 42, 0.06)'
              }`,
              mb: 2.5,
            }}
          >
            {/* Slide Top Bar: Set Navigation & Dots */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  component="span"
                  sx={{
                    px: 1.2,
                    py: 0.3,
                    borderRadius: '100px',
                    bgcolor: alpha(accentColor, isDark ? 0.2 : 0.12),
                    color: accentColor,
                    fontFamily: 'var(--font-jakarta), sans-serif !important',
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {isLegacyCompare
                    ? 'Legacy Theme'
                    : isCustomMix
                    ? 'Custom Mix'
                    : `Style ${activeSetIndex + 1} of 4 · ${currentSet.name}`}
                </Box>

                {/* Carousel Dots */}
                {!isLegacyCompare && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, ml: 0.5 }}>
                    {CURATED_FONT_SETS.map((s, idx) => {
                      const active = !isCustomMix && idx === activeSetIndex;
                      return (
                        <Box
                          key={s.id}
                          onClick={() => handleApplySet(s)}
                          sx={{
                            width: active ? 18 : 6,
                            height: 6,
                            borderRadius: '100px',
                            bgcolor: active
                              ? accentColor
                              : isDark
                              ? 'rgba(255,255,255,0.2)'
                              : 'rgba(15,23,42,0.18)',
                            cursor: 'pointer',
                            transition: 'all 0.25s ease',
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
              </Box>

              {/* Prev / Next Slide Arrows */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <IconButton
                  size="small"
                  onClick={() => handleStepSlide(-1)}
                  sx={{
                    width: 30,
                    height: 30,
                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
                    border: `1px solid ${
                      isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)'
                    }`,
                    color: isDark ? '#f8fafc' : '#0f172a',
                    '&:hover': { borderColor: accentColor, color: accentColor },
                  }}
                >
                  <ChevronLeftIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleStepSlide(1)}
                  sx={{
                    width: 30,
                    height: 30,
                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
                    border: `1px solid ${
                      isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)'
                    }`,
                    color: isDark ? '#f8fafc' : '#0f172a',
                    '&:hover': { borderColor: accentColor, color: accentColor },
                  }}
                >
                  <ChevronRightIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>

            {/* The Live Specimen Preview Content */}
            <Box sx={{ py: 0.5 }}>
              <Box
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.45rem' },
                  lineHeight: 1.3,
                  mb: 1.25,
                  color: isDark ? '#f8fafc' : '#0f172a',
                }}
              >
                <span
                  style={{
                    fontFamily: resolvedHeadingFamily,
                    fontWeight: activeHeadingOption.weight || 800,
                    color: accentColor,
                  }}
                >
                  The 42% Mile 12 Tomato Rot Trap:{' '}
                </span>
                <span
                  style={{
                    fontFamily: resolvedStylisedFamily,
                    fontWeight: activeStylisedOption.weight || 400,
                    fontStyle: 'italic',
                    color: isDark ? '#cbd5e1' : '#334155',
                  }}
                >
                  and why woven baskets must be retired
                </span>
              </Box>

              <Box
                sx={{
                  fontFamily: `${resolvedBodyFamily} !important`,
                  fontSize: resolvedBodySize,
                  lineHeight: resolvedLineHeight,
                  color: isDark ? '#e2e8f0' : '#1e293b',
                }}
              >
                Switching from conical raffia baskets to stackable 25kg ventilated crates drops
                Kano–Lagos haulage spoilage below 5% on the very first trip.
              </Box>
            </Box>

            {/* Active Trio Caption */}
            <Box
              sx={{
                mt: 2,
                pt: 1.5,
                borderTop: `1px dashed ${
                  isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'
                }`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'var(--font-jakarta), sans-serif !important',
                  fontSize: '0.78rem',
                  color: isDark ? '#94a3b8' : '#64748b',
                }}
              >
                Body: <strong style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}>{isLegacyCompare ? 'Ysabeau Infant' : activeBodyOption.label}</strong>
                {'  ·  '}
                Heading: <strong style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}>{isLegacyCompare ? 'Dosis' : activeHeadingOption.label}</strong>
                {'  ·  '}
                Stylised: <strong style={{ color: isDark ? '#e2e8f0' : '#0f172a' }}>{isLegacyCompare ? 'Edu NSW' : activeStylisedOption.label}</strong>
              </Typography>
            </Box>
          </Box>

          {/* ── STAGE B: COMPACT TEXT SIZE SLIDER + PROGRESSIVE MIXER TRIGGER ── */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            {/* Tactile A- / A+ Reading Size Pill */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 0.6,
                borderRadius: '100px',
                bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                border: `1px solid ${
                  isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'
                }`,
                minWidth: 220,
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'var(--font-jakarta), sans-serif !important',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: isDark ? '#94a3b8' : '#64748b',
                }}
              >
                A−
              </Typography>
              <Slider
                size="small"
                min={0}
                max={2}
                step={1}
                marks
                value={activeSizeOption.step}
                onChange={(_, val) => {
                  const found = SIZE_OPTIONS.find((s) => s.step === val);
                  if (found) {
                    setIsLegacyCompare(false);
                    setSizePreset(found.key);
                    persistChoice(bodyFont, headingFont, stylisedFont, found.key);
                  }
                }}
                sx={{
                  color: accentColor,
                  mx: 1,
                  '& .MuiSlider-thumb': {
                    width: 14,
                    height: 14,
                  },
                }}
              />
              <Typography
                sx={{
                  fontFamily: 'var(--font-jakarta), sans-serif !important',
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  color: isDark ? '#f8fafc' : '#0f172a',
                }}
              >
                A+
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'var(--font-jakarta), sans-serif !important',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: accentColor,
                  ml: 0.5,
                }}
              >
                {activeSizeOption.shortLabel}
              </Typography>
            </Box>

            {/* Right Actions: Fine-Tune Mixer + Copy */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Button
                size="small"
                startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
                onClick={() => setCustomMixOpen((prev) => !prev)}
                sx={{
                  borderRadius: '100px',
                  textTransform: 'none',
                  fontFamily: 'var(--font-jakarta), sans-serif !important',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  px: 1.75,
                  py: 0.6,
                  color: customMixOpen ? accentColor : isDark ? '#cbd5e1' : '#475569',
                  bgcolor: customMixOpen
                    ? alpha(accentColor, 0.12)
                    : isDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(15,23,42,0.04)',
                }}
              >
                {customMixOpen ? 'Hide Individual Fonts' : 'Mix Individual Fonts'}
              </Button>

              <Button
                size="small"
                startIcon={<CompareArrowsIcon sx={{ fontSize: 16 }} />}
                onClick={() => setIsLegacyCompare((prev) => !prev)}
                sx={{
                  borderRadius: '100px',
                  textTransform: 'none',
                  fontFamily: 'var(--font-jakarta), sans-serif !important',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  px: 1.5,
                  py: 0.6,
                  color: isLegacyCompare ? '#fff' : isDark ? '#94a3b8' : '#64748b',
                  bgcolor: isLegacyCompare ? '#ef4444' : 'transparent',
                  border: `1px solid ${
                    isLegacyCompare
                      ? '#ef4444'
                      : isDark
                      ? 'rgba(255,255,255,0.12)'
                      : 'rgba(15,23,42,0.12)'
                  }`,
                }}
              >
                {isLegacyCompare ? 'Old Font On' : 'Old Font'}
              </Button>

              <Button
                size="small"
                variant="contained"
                startIcon={<ContentCopyIcon sx={{ fontSize: 15 }} />}
                onClick={handleCopySelection}
                sx={{
                  borderRadius: '100px',
                  textTransform: 'none',
                  fontFamily: 'var(--font-jakarta), sans-serif !important',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  px: 2,
                  py: 0.65,
                  bgcolor: accentColor,
                  color: '#fff',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: alpha(accentColor, 0.88), boxShadow: 'none' },
                }}
              >
                Copy Choice
              </Button>
            </Box>
          </Box>

          {/* ── STAGE C: PROGRESSIVE REVEAL — 3-TAB INDIVIDUAL FONT MIXER ── */}
          <Collapse in={customMixOpen} timeout={240}>
            <Box
              sx={{
                mt: 2.5,
                pt: 2.25,
                borderTop: `1px solid ${
                  isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'
                }`,
              }}
            >
              {/* Segmented 3-Slot Tab Pill */}
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 0.5,
                  borderRadius: '100px',
                  bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                  mb: 2,
                }}
              >
                {(
                  [
                    { id: 'body', label: `1. Body (${activeBodyOption.label})` },
                    { id: 'heading', label: `2. Main Heading (${activeHeadingOption.label})` },
                    { id: 'stylised', label: `3. Stylised (${activeStylisedOption.label})` },
                  ] as const
                ).map((tab) => {
                  const active = activeSlotTab === tab.id;
                  return (
                    <Box
                      key={tab.id}
                      onClick={() => setActiveSlotTab(tab.id)}
                      sx={{
                        px: 2,
                        py: 0.6,
                        borderRadius: '100px',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-jakarta), sans-serif !important',
                        fontSize: '0.8rem',
                        fontWeight: active ? 800 : 600,
                        bgcolor: active ? (isDark ? '#1e293b' : '#ffffff') : 'transparent',
                        color: active ? accentColor : isDark ? '#94a3b8' : '#64748b',
                        boxShadow: active ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      {tab.label}
                    </Box>
                  );
                })}
              </Box>

              {/* 4 Specimen Cards for the Active Slot Only */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 1.25,
                }}
              >
                {activeSlotTab === 'body' &&
                  BODY_FONT_OPTIONS.map((opt) => {
                    const selected = !isLegacyCompare && bodyFont === opt.key;
                    return (
                      <Box
                        key={opt.key}
                        onClick={() => {
                          setIsLegacyCompare(false);
                          setBodyFont(opt.key);
                          persistChoice(opt.key, headingFont, stylisedFont, sizePreset);
                        }}
                        sx={{
                          p: 1.75,
                          borderRadius: '16px',
                          cursor: 'pointer',
                          border: selected
                            ? `2px solid ${accentColor}`
                            : `1px solid ${
                                isDark ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.09)'
                              }`,
                          bgcolor: selected
                            ? alpha(accentColor, isDark ? 0.14 : 0.06)
                            : isDark
                            ? 'rgba(255,255,255,0.02)'
                            : '#fff',
                          transition: 'all 0.18s ease',
                          '&:hover': { borderColor: accentColor },
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 0.5,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: opt.cssFamily,
                              fontWeight: 700,
                              fontSize: '1rem',
                              color: isDark ? '#f8fafc' : '#0f172a',
                            }}
                          >
                            {opt.label}
                          </span>
                          {selected && <CheckIcon sx={{ fontSize: 18, color: accentColor }} />}
                        </Box>
                        <div
                          style={{
                            fontFamily: opt.cssFamily,
                            fontSize: '0.88rem',
                            lineHeight: 1.5,
                            color: isDark ? '#cbd5e1' : '#334155',
                          }}
                        >
                          {opt.sampleText}
                        </div>
                      </Box>
                    );
                  })}

                {activeSlotTab === 'heading' &&
                  HEADING_FONT_OPTIONS.map((opt) => {
                    const selected = !isLegacyCompare && headingFont === opt.key;
                    return (
                      <Box
                        key={opt.key}
                        onClick={() => {
                          setIsLegacyCompare(false);
                          setHeadingFont(opt.key);
                          persistChoice(bodyFont, opt.key, stylisedFont, sizePreset);
                        }}
                        sx={{
                          p: 1.75,
                          borderRadius: '16px',
                          cursor: 'pointer',
                          border: selected
                            ? `2px solid ${accentColor}`
                            : `1px solid ${
                                isDark ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.09)'
                              }`,
                          bgcolor: selected
                            ? alpha(accentColor, isDark ? 0.14 : 0.06)
                            : isDark
                            ? 'rgba(255,255,255,0.02)'
                            : '#fff',
                          transition: 'all 0.18s ease',
                          '&:hover': { borderColor: accentColor },
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 0.5,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-jakarta), sans-serif',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              color: isDark ? '#94a3b8' : '#64748b',
                            }}
                          >
                            {opt.label} · {opt.subtitle}
                          </span>
                          {selected && <CheckIcon sx={{ fontSize: 18, color: accentColor }} />}
                        </Box>
                        <div
                          style={{
                            fontFamily: opt.cssFamily,
                            fontWeight: opt.weight || 800,
                            fontSize: '1.12rem',
                            lineHeight: 1.3,
                            color: isDark ? '#f8fafc' : '#0f172a',
                          }}
                        >
                          {opt.sampleText}
                        </div>
                      </Box>
                    );
                  })}

                {activeSlotTab === 'stylised' &&
                  STYLISED_FONT_OPTIONS.map((opt) => {
                    const selected = !isLegacyCompare && stylisedFont === opt.key;
                    return (
                      <Box
                        key={opt.key}
                        onClick={() => {
                          setIsLegacyCompare(false);
                          setStylisedFont(opt.key);
                          persistChoice(bodyFont, headingFont, opt.key, sizePreset);
                        }}
                        sx={{
                          p: 1.75,
                          borderRadius: '16px',
                          cursor: 'pointer',
                          border: selected
                            ? `2px solid ${accentColor}`
                            : `1px solid ${
                                isDark ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.09)'
                              }`,
                          bgcolor: selected
                            ? alpha(accentColor, isDark ? 0.14 : 0.06)
                            : isDark
                            ? 'rgba(255,255,255,0.02)'
                            : '#fff',
                          transition: 'all 0.18s ease',
                          '&:hover': { borderColor: accentColor },
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 0.5,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-jakarta), sans-serif',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              color: isDark ? '#94a3b8' : '#64748b',
                            }}
                          >
                            {opt.label} · {opt.subtitle}
                          </span>
                          {selected && <CheckIcon sx={{ fontSize: 18, color: accentColor }} />}
                        </Box>
                        <div
                          style={{
                            fontFamily: opt.cssFamily,
                            fontWeight: opt.weight || 400,
                            fontStyle: 'italic',
                            fontSize: '1.12rem',
                            lineHeight: 1.35,
                            color: isDark ? '#f8fafc' : '#0f172a',
                          }}
                        >
                          {opt.sampleText}
                        </div>
                      </Box>
                    );
                  })}
              </Box>
            </Box>
          </Collapse>
        </Box>
      </Collapse>
      </Box>

      {/* ═══════════════════ SCOPED ARTICLE CONTENT ═══════════════════ */}
      <style>{`
        .article-typography-scope p,
        .article-typography-scope li,
        .article-typography-scope .MuiTypography-body1,
        .article-typography-scope .MuiTypography-body2 {
          font-family: var(--article-body-font) !important;
        }
        .article-typography-scope h1,
        .article-typography-scope h2,
        .article-typography-scope h3,
        .article-typography-scope h4,
        .article-typography-scope h5,
        .article-typography-scope h6,
        .article-typography-scope .MuiTypography-h1,
        .article-typography-scope .MuiTypography-h2,
        .article-typography-scope .MuiTypography-h3,
        .article-typography-scope .MuiTypography-h4,
        .article-typography-scope .MuiTypography-h5,
        .article-typography-scope .MuiTypography-h6 {
          font-family: var(--article-heading-font) !important;
          letter-spacing: ${isLegacyCompare ? '-0.02em' : '0em'} !important;
        }
      `}</style>
      {children}

      <Snackbar
        open={copiedToast}
        autoHideDuration={4000}
        onClose={() => setCopiedToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setCopiedToast(false)}
          severity="success"
          variant="filled"
          sx={{
            fontWeight: 700,
            fontSize: '0.92rem',
            borderRadius: '12px',
            fontFamily: 'var(--font-jakarta), sans-serif !important',
          }}
        >
          Preferred font combination copied! Paste it in WhatsApp or Email.
        </Alert>
      </Snackbar>
    </Box>
  );
};
