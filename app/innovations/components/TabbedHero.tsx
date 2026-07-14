'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Container, Button, Chip, Stack } from '@mui/material';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { CategoryTabMenu, Category } from './CategoryTabMenu';
import { EcosystemCard } from './EcosystemCard';

export type EcosystemType = 'Intelligence' | 'Innovations' | 'Community' | 'Activities' | 'Jobs' | 'Internships' | 'Volunteering' | 'Opportunities';

export interface EcosystemItem {
  id: string;
  type: EcosystemType;
  title: string;
  slug?: string;
  thumbnailUrl: string;
  link: string;
  authorOrOperator: string;
  metaInfo: string; // date added, read time, or traction metric
}

export interface TabCategory {
  id: string;
  title: string;
  items: EcosystemItem[];
  themeColor?: string;
}

interface TabbedHeroProps {
  headline: string;
  subheadline: string;
  categories: TabCategory[];
  globalAlerts?: any[];
}

const PILLARS: ('All' | EcosystemType)[] = ['All', 'Intelligence', 'Innovations', 'Community', 'Activities', 'Jobs', 'Internships', 'Volunteering', 'Opportunities'];

function GlobalAlertBanner({ alerts, activeCategoryId }: { alerts: any[], activeCategoryId?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredAlerts = useMemo(() => {
    return alerts
      .filter(a => a.challengeId === 'global' || a.challengeId === activeCategoryId)
      .slice(0, 5)
      .map((a, idx) => ({ ...a, uniqueKey: a.id || a.title || `alert-${idx}` }));
  }, [alerts, activeCategoryId]);

  const getCardTheme = (state: string) => {
    switch (state) {
      case 'live': return { color: '#ef4444', soft: 'rgba(159, 28, 69, 0.95)' };
      case 'imminent': return { color: '#f59e0b', soft: 'rgba(180, 93, 19, 0.95)' };
      case 'today': return { color: '#eab308', soft: 'rgba(161, 108, 17, 0.95)' };
      case 'scheduled': return { color: '#6366f1', soft: 'rgba(77, 66, 192, 0.95)' };
      case 'ended': return { color: '#64748b', soft: 'rgba(51, 65, 85, 0.95)' };
      default: return { color: '#10b981', soft: 'rgba(14, 130, 97, 0.95)' };
    }
  };

  useEffect(() => {
    if (filteredAlerts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % filteredAlerts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [filteredAlerts.length]);

  if (filteredAlerts.length === 0) return null;

  // ──── Systematic Time-Based Color Scheme ────
  const getAlertStatus = (alert: any) => {
    const now = new Date();
    const start = alert.startDate ? new Date(alert.startDate) : null;
    const end = alert.endDate ? new Date(alert.endDate) : null;

    // Future start
    if (start && start > now) {
      const diffMs = start.getTime() - now.getTime();
      const diffMins = diffMs / (1000 * 60);
      const diffHours = diffMs / (1000 * 3600);
      const diffDays = diffHours / 24;

      if (diffMins < 60) return { label: `${Math.ceil(diffMins)}M`, fullLabel: `STARTS IN ${Math.ceil(diffMins)}M`, color: '#f59e0b', dotColor: '#f59e0b', state: 'imminent' as const };
      if (diffHours < 24) return { label: `${Math.floor(diffHours)}H`, fullLabel: `STARTS IN ${Math.floor(diffHours)}H`, color: '#eab308', dotColor: '#eab308', state: 'today' as const };
      return { label: `${Math.floor(diffDays)}D`, fullLabel: `STARTS IN ${Math.floor(diffDays)}D`, color: '#6366f1', dotColor: '#818cf8', state: 'scheduled' as const };
    }
    // Currently live
    if (start && now >= start && (!end || now <= end)) return { label: 'LIVE', fullLabel: 'HAPPENING NOW', color: '#ef4444', dotColor: '#ef4444', state: 'live' as const };
    // Ended
    if (end && now > end) return { label: 'ENDED', fullLabel: 'ENDED', color: '#94a3b8', dotColor: '#94a3b8', state: 'ended' as const };
    // No start, has end (closing soon)
    if (!start && end && now < end) {
      const diffMs = end.getTime() - now.getTime();
      const diffMins = diffMs / (1000 * 60);
      const diffHours = diffMs / (1000 * 3600);
      const diffDays = diffHours / 24;

      if (diffMins < 60) return { label: `${Math.ceil(diffMins)}M`, fullLabel: `ENDS IN ${Math.ceil(diffMins)}M`, color: '#f59e0b', dotColor: '#f59e0b', state: 'imminent' as const };
      if (diffHours < 24) return { label: `${Math.floor(diffHours)}H`, fullLabel: `ENDS IN ${Math.floor(diffHours)}H`, color: '#eab308', dotColor: '#eab308', state: 'today' as const };
      return { label: `${Math.floor(diffDays)}D`, fullLabel: `ENDS IN ${Math.floor(diffDays)}D`, color: '#6366f1', dotColor: '#818cf8', state: 'scheduled' as const };
    }
    return { label: 'NEW', fullLabel: 'ACTIVE', color: '#10b981', dotColor: '#34d399', state: 'new' as const };
  };

  return (
    <Box sx={{
      py: 1.5,
      position: 'relative',
      zIndex: 2,
      // Subtle separator from category tabs above
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '60%',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(15,23,42,0.05) 30%, rgba(15,23,42,0.05) 70%, transparent)',
      },
    }}>
      <Container maxWidth="lg">
        {/* Constrain width on desktop to look like a premium notification stack rather than a massive banner */}
        <Box sx={{ maxWidth: { md: '850px' }, mx: { md: 'auto' } }}>
          {/* Section Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, pl: 0.5 }}>
            <Box sx={{
              width: 6, height: 6, borderRadius: '50%', bgcolor: 'rgba(15,23,42,0.4)'
            }} />
            <Typography sx={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'rgba(15,23,42,0.7)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              Global Alerts & Updates
            </Typography>
          </Box>
          {/* Viewport for the stack */}
          <Box 
            component={motion.div}
          animate={{
            height: filteredAlerts.length > 0
              ? 52 + (currentIndex * 64) + ((filteredAlerts.length - 1 - currentIndex) * 10)
              : 52
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          sx={{
            position: 'relative',
            borderRadius: '14px',
            mb: filteredAlerts.length > 1 ? 1 : 0, 
        }}>
          {/* Vertical conveyor stack */}
          <AnimatePresence>
            {filteredAlerts.map((currentAlert, i) => {
              const currentStatus = getAlertStatus(currentAlert);
              const theme = getCardTheme(currentStatus.state);
              
              const isCurrent = i === currentIndex;
              const isPast = i < currentIndex;
              const isTucked = i > currentIndex;
              const isActive = isCurrent;

              // Positioning logic (Accumulating Stack)
              const CARD_HEIGHT = 52;
              const GAP = 12;
              const TUCK_OFFSET = 8;
              let y, scale, opacity, zIndex;

              if (isCurrent) {
                zIndex = 50;
              } else if (isPast) {
                zIndex = 40 - i;
              } else {
                zIndex = 30 - i;
              }

              if (isPast || isCurrent) {
                y = i * (CARD_HEIGHT + GAP);
                scale = 1;
                opacity = 1;
              } else {
                const tuckedIndex = i - currentIndex;
                y = currentIndex * (CARD_HEIGHT + GAP) + tuckedIndex * TUCK_OFFSET;
                scale = 1 - tuckedIndex * 0.05;
                opacity = 1; // Keep stack fully opaque to prevent extreme translucency bleed
              }

              // Determine the 3-tier visual state of the cards
              let cardBg = 'rgba(15, 23, 35, 0.4)'; // Past cards (Translucent)
              let cardBlur = 'blur(12px)';
              
              if (isActive) {
                cardBg = theme.color; // Active card gets the sharp semantic color
                cardBlur = 'none';
              } else if (isTucked) {
                cardBg = theme.soft; // Future cards get opaque, softer semantic color
                cardBlur = 'none';
              }

              return (
                <Box
                  component={motion.div}
                  key={currentAlert.uniqueKey}
                  initial={false}
                  animate={{ y, scale, opacity, zIndex }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 28,
                  }}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '52px',
                    transformOrigin: 'center bottom',
                    willChange: 'transform, opacity',
                  }}
                >
              {/* The card itself */}
              <Box sx={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                height: '100%',
                borderRadius: '14px',
                overflow: 'hidden',
                background: cardBg,
                backdropFilter: cardBlur,
                border: 'none',
                transition: 'background 0.4s ease, backdrop-filter 0.4s ease',
                boxShadow: isActive ? `
                  0 20px 40px -10px rgba(0,0,0,0.5),
                  0 0 0 1px rgba(255,255,255,0.05),
                  inset 0 1px 0 rgba(255,255,255,0.15)
                ` : `
                  0 10px 20px -5px rgba(0,0,0,0.3),
                  0 0 0 1px rgba(255,255,255,0.02),
                  inset 0 1px 0 rgba(255,255,255,0.05)
                `,
              }}>
                
                {/* Ambient Internal Glow (Only for inactive dark cards to hint at color) */}
                {!isActive && (
                  <Box sx={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-10%',
                    width: '150px',
                    height: '150px',
                    background: `radial-gradient(circle, ${theme.color} 0%, transparent 70%)`,
                    opacity: 0.15,
                    filter: 'blur(30px)',
                    pointerEvents: 'none',
                    zIndex: 0,
                    transition: 'opacity 0.4s ease'
                  }} />
                )}
                {/* Progress wave */}
                {isActive && filteredAlerts.length > 1 && (
                  <Box
                    key={`wave-${currentAlert.uniqueKey}`}
                    sx={{
                      position: 'absolute',
                      bottom: 0, left: 0,
                      height: '3px',
                      background: 'rgba(255,255,255,0.9)',
                      animation: 'waveSweep 6s linear forwards',
                      pointerEvents: 'none',
                      zIndex: 10,
                      '@keyframes waveSweep': {
                        '0%': { width: '0%' },
                        '100%': { width: '100%' },
                      },
                    }}
                  />
                )}

                {/* Content row */}
                <Box
                  component={Link}
                  href={currentAlert.link || '#'}
                  sx={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                    gap: { xs: 1.5, md: 2 },
                    px: { xs: 2, md: 3 },
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {/* Status badge */}
                  <Box sx={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    bgcolor: 'rgba(0,0,0,0.25)',
                    borderRadius: '10px',
                    px: 1.5, py: 0.5,
                    backdropFilter: 'blur(8px)',
                    border: isTucked ? '1px solid rgba(255,255,255,0.02)' : '1px solid rgba(255,255,255,0.06)',
                  }}>
                    {currentStatus.state === 'live' && (
                      <Box sx={{
                        width: 7, height: 7,
                        borderRadius: '50%',
                        bgcolor: currentStatus.color,
                        animation: 'urgentPulse 1.5s ease-in-out infinite',
                        '@keyframes urgentPulse': {
                          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                          '50%': { opacity: 0.4, transform: 'scale(0.6)' },
                        },
                      }} />
                    )}
                    <Typography sx={{
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      color: currentStatus.color,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      lineHeight: 1,
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    }}>
                      {currentStatus.fullLabel}
                    </Typography>
                  </Box>

                  {/* Thumbnail */}
                  {currentAlert.imageUrl && (
                    <Box
                      component="img"
                      src={currentAlert.imageUrl}
                      alt={currentAlert.title}
                      sx={{
                        width: 32, height: 32,
                        borderRadius: '8px',
                        objectFit: 'cover',
                        flexShrink: 0,
                        display: { xs: 'none', sm: 'block' },
                        border: '1.5px solid rgba(255,255,255,0.15)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        opacity: isTucked ? 0.6 : 1,
                        transition: 'opacity 0.4s ease',
                      }}
                    />
                  )}

                  {/* Title */}
                  <Typography sx={{
                    fontFamily: 'var(--font-dosis)',
                    fontSize: { xs: '0.75rem', md: '0.92rem' }, // Smaller on mobile to fit more text
                    fontWeight: 700,
                    color: isTucked ? 'rgba(255,255,255,0.5)' : '#ffffff',
                    flexGrow: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    letterSpacing: '0.01em',
                    textShadow: '0 1px 3px rgba(0,0,0,0.12)',
                  }}>
                    {currentAlert.title}
                  </Typography>

                  {/* Pagination dots + CTA */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                    {/* CTA */}
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      flexShrink: 0,
                      bgcolor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      px: 1.25, py: 0.4,
                      border: '1px solid rgba(255,255,255,0.06)',
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                    }}>
                      <Typography sx={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: 'rgba(255,255,255,0.85)',
                        display: { xs: 'none', sm: 'block' },
                        letterSpacing: '0.03em',
                      }}>
                        VIEW
                      </Typography>
                      <ArrowForwardIcon sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)' }} />
                    </Box>
                  </Box>
                </Box>
              </Box>
                </Box>
              );
            })}
          </AnimatePresence>
        </Box>

        {/* Premium Pill Counter */}
        {filteredAlerts.length > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2.5 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              px: 2,
              py: 0.6,
              borderRadius: '20px',
              bgcolor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
            }}>
              <Typography sx={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.9)',
                letterSpacing: '0.15em',
              }}>
                {String(currentIndex + 1).padStart(2, '0')}
              </Typography>
              <Typography sx={{
                fontSize: '0.65rem',
                fontWeight: 400,
                color: 'rgba(255,255,255,0.3)',
              }}>
                /
              </Typography>
              <Typography sx={{
                fontSize: '0.65rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.15em',
              }}>
                {String(filteredAlerts.length).padStart(2, '0')}
              </Typography>
            </Box>
          </Box>
        )}
        </Box>
      </Container>
    </Box>
  );
}

export default function TabbedHero({ headline, subheadline, categories, globalAlerts = [] }: TabbedHeroProps) {
  // State
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '');
  const [activeSubPillar, setActiveSubPillar] = useState<'All' | EcosystemType>('All');
  const [slideDirection, setSlideDirection] = useState<number>(0);
  const [heroAnimationDone, setHeroAnimationDone] = useState(false);

  const activeCatData = categories.find(c => c.id === activeCategory) || categories[0];
  const themeColor = activeCatData?.themeColor || '#166534'; // Earthy green default

  const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
  };
  const rgb = hexToRgb(themeColor);
  const mixWithWhite = (c: number) => Math.round(c * 0.03 + 255 * 0.97);
  const tintedBg = `rgb(${mixWithWhite(rgb.r)}, ${mixWithWhite(rgb.g)}, ${mixWithWhite(rgb.b)})`;

  // Mesh Background Generator
  const MeshBackground = useMemo(() => {
      const baseColor = themeColor;
      const colors = [baseColor, `${baseColor}99`, `${baseColor}44`];
      return (
          <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden', bgcolor: tintedBg, transition: 'background-color 0.8s ease' }}>
              {[...Array(3)].map((_, i) => (
                  <Box
                      key={i}
                      component={motion.div}
                      animate={{ x: [0, 100, -100, 0], y: [0, -150, 150, 0], scale: [1, 1.2, 0.8, 1] }}
                      transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "linear" }}
                      sx={{ position: 'absolute', width: '60vw', height: '60vw', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.15, bgcolor: colors[i % colors.length], top: `${20 + i * 20}%`, left: `${10 + i * 25}%`, transition: 'background-color 0.8s ease' }}
                  />
              ))}
              <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.05) 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.5 }} />
          </Box>
      );
  }, [themeColor, tintedBg]);

  const tabCategories: Category[] = categories.map(cat => ({
      id: cat.id,
      title: cat.title,
      count: cat.items.length,
      themeColor: cat.themeColor
  }));
  
  // Filter by Category -> Pillar
  const filteredItems = useMemo(() => {
      if (!activeCatData) return [];
      let result = activeCatData.items;
      
      if (activeSubPillar !== 'All') {
          result = result.filter(item => item.type === activeSubPillar);
      }
      
      return result;
  }, [activeCatData, activeSubPillar]);

  // Map Pillar Types to distinct colors
  const getBadgeColor = (type: EcosystemType) => {
    switch (type) {
      case 'Intelligence': return '#3b82f6'; // Blue
      case 'Innovations': return '#10b981'; // Green
      case 'Community': return '#8b5cf6'; // Purple
      case 'Activities': return '#f59e0b'; // Orange
      case 'Jobs': return '#ef4444'; // Red
      case 'Internships': return '#f59e0b'; // Amber
      case 'Volunteering': return '#ec4899'; // Pink
      case 'Opportunities': return '#fbbf24'; // Premium Gold
      default: return '#0f172a';
    }
  };

  return (
      <Box sx={{ minHeight: '100vh', width: '100%', maxWidth: '100vw', bgcolor: '#ffffff', color: '#0f172a', position: 'relative', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
          
          <Box sx={{ position: 'relative', zIndex: 1, bgcolor: '#ffffff' }}>
              <Container maxWidth="lg" sx={{ pt: { xs: 12, md: 16 }, pb: 2 }}>
                  
                  {/* Premium Hero Header */}
                  <Box component={motion.div} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }} onAnimationComplete={() => setHeroAnimationDone(true)} sx={{ pt: { xs: 4, md: 6 }, pb: 4, textAlign: 'center', maxWidth: 900, mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography variant="h2" component="h1" sx={{ fontFamily: 'var(--font-inter), sans-serif', fontWeight: 900, color: '#0f172a', mb: 2.5, fontSize: { xs: '2.5rem', md: '4.5rem' }, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
                          Explore the <Box component="span" sx={{ background: `linear-gradient(135deg, ${themeColor} 0%, #0f172a 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ecosystem</Box>
                      </Typography>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }}>
                          <Typography variant="h6" sx={{ color: '#475569', mb: 2, px: 2, fontSize: { xs: '1rem', md: '1.25rem' }, lineHeight: 1.6, fontWeight: 500, maxWidth: 650, mx: 'auto' }}>
                              Discover new projects, community updates, and activities across the network. Choose a category below to see what's happening.
                          </Typography>
                      </motion.div>
                  </Box>
              </Container>

              {/* ═══════════════════════════════════════════════════════════
                  CYCLING GLOBAL ALERT BANNER (Moved ABOVE Categories)
              ═══════════════════════════════════════════════════════════ */}
              <GlobalAlertBanner alerts={globalAlerts} activeCategoryId={activeCatData?.id} />

              <Container maxWidth="lg" sx={{ pb: 2, pt: 1 }}>
                  {/* Staggered Reveal Content */}
                  <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={heroAnimationDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.8, ease: "easeOut" }}>

                      {/* Main Category Tabs */}
                      <CategoryTabMenu
                          categories={tabCategories}
                          selectedCategoryId={activeCategory}
                          onSelectCategory={(newCategory) => {
                              if (newCategory === activeCategory) return;
                              const currentIndex = tabCategories.findIndex(c => c.id === activeCategory);
                              const newIndex = tabCategories.findIndex(c => c.id === newCategory);
                              setSlideDirection(newIndex > currentIndex ? 1 : -1);
                              setActiveCategory(newCategory);
                              setActiveSubPillar('All'); // Reset sub-pillar when changing main category
                          }}
                          themeColor={themeColor}
                      />
                  </Box>
              </Container>
          </Box>

          {/* NEW Tinted Content Area */}
          <Box sx={{ 
              position: 'relative', flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', 
              borderTopLeftRadius: { xs: '32px', md: '48px' }, borderTopRightRadius: { xs: '32px', md: '48px' },
              mx: { xs: 1.5, md: 'auto' }, maxWidth: '1440px', width: { xs: 'calc(100% - 24px)', md: '100%' }
          }}>
             <AnimatePresence mode="popLayout" custom={slideDirection}>
                <Box
                    component={motion.div}
                    key={activeCategory}
                    custom={slideDirection}
                    variants={{
                        initial: (dir: number) => ({ opacity: 0, x: dir > 0 ? '50vw' : '-50vw', scale: 0.95 }),
                        animate: { opacity: 1, x: 0, scale: 1 },
                        exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? '-50vw' : '50vw', scale: 0.95 })
                    }}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.5, ease: [0.25, 1, 0.35, 1] }}
                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: 'auto', minHeight: { xs: '60vh', md: '50vh' } }}
                >
                    {/* The tinted background and mesh go here */}
                    <Box sx={{ position: 'absolute', inset: 0, bgcolor: tintedBg }}>
                        {MeshBackground}
                    </Box>
                    
                    <Container maxWidth={false} sx={{ py: { xs: 4, md: 8 }, px: { xs: 2, md: 8 }, position: 'relative', zIndex: 1, flexGrow: 1 }}>
                        {/* Content Area: Sidebar + Stage */}
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 4 }, alignItems: { xs: 'flex-start', md: 'flex-start' } }}>
                        
                        {/* Premium Sub-Pillar Filters (Left on Desktop, Top on Mobile) */}
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: { xs: 'row', md: 'column' }, 
                            flexWrap: { xs: 'wrap', md: 'nowrap' },
                            gap: 1,
                            width: { xs: '100%', md: '200px' },
                            flexShrink: 0,
                            pb: { xs: 1, md: 0 },
                            px: { xs: 2, md: 0 },
                        }}>
                            {PILLARS.map(pillar => {
                                const isActive = activeSubPillar === pillar;
                                return (
                                    <Box 
                                        key={pillar}
                                        onClick={() => setActiveSubPillar(pillar)}
                                        sx={{
                                            position: 'relative',
                                            px: 2,
                                            py: 0.75,
                                            cursor: 'pointer',
                                            borderRadius: '12px',
                                            color: isActive ? themeColor : 'rgba(15, 23, 42, 0.6)',
                                            fontWeight: isActive ? 800 : 600,
                                            fontSize: '0.8rem',
                                            whiteSpace: 'nowrap',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                color: isActive ? themeColor : '#0f172a'
                                            }
                                        }}
                                    >
                                        <Box sx={{ position: 'relative', zIndex: 1 }}>{pillar}</Box>
                                        {isActive && (
                                            <motion.div
                                                layoutId={`active-subpillar-${activeCategory}`}
                                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                style={{
                                                    position: 'absolute', 
                                                    inset: 0,
                                                    borderRadius: '12px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                    backdropFilter: 'blur(8px)',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255,255,255,0.5)',
                                                    zIndex: 0
                                                }}
                                            />
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Animated Content Stage */}
                        <Box sx={{ flex: 1, minWidth: 0, width: '100%', pb: 8 }}>
                            <Box sx={{ 
                                display: 'grid', 
                                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, 
                                gap: 4, 
                                px: { xs: 0, md: 2 } 
                            }}>
                                        {filteredItems.length === 0 ? (
                                            <Typography sx={{ color: '#94a3b8', fontStyle: 'italic', my: 4 }}>
                                                No {activeSubPillar !== 'All' ? activeSubPillar.toLowerCase() : 'items'} found in this category.
                                            </Typography>
                                        ) : (
                                            filteredItems.slice(0, 6).map(item => (
                                                <EcosystemCard key={item.id} item={item} themeColor={themeColor} />
                                            ))
                                        )}
                            </Box>
                            
                            {/* CTA Block at Bottom */}
                            {filteredItems.length > 0 && activeCatData && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 8, textAlign: 'center', p: 4, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.6)' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                                        Looking for more {activeCatData.title.replace(/^\d+\.\s*/, '')}?
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#475569', mb: 3, maxWidth: 500 }}>
                                        Explore our dedicated repository to discover all the latest insights, deployments, and resources within this category.
                                    </Typography>
                                    <Button 
                                        variant="contained" 
                                        endIcon={<ArrowForwardIcon />}
                                        component={Link}
                                        href={`/innovations/${activeCatData.id}`}
                                        sx={{ borderRadius: '999px', bgcolor: themeColor, color: '#ffffff', textTransform: 'none', fontWeight: 800, fontSize: '1rem', px: 4, py: 1.5, boxShadow: `0 8px 24px ${themeColor}40`, '&:hover': { bgcolor: '#0f172a', transform: 'translateY(-2px)', boxShadow: '0 12px 32px rgba(15,23,42,0.3)' }, transition: 'all 0.3s ease' }}
                                    >
                                        Explore the {activeCatData.title.replace(/^\d+\.\s*/, '')} Hub
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Box>
                    </Container>
                </Box>
             </AnimatePresence>
          </Box>
      </Box>
  );
}
