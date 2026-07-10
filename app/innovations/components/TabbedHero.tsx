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
}

const PILLARS: ('All' | EcosystemType)[] = ['All', 'Intelligence', 'Innovations', 'Community', 'Activities', 'Jobs', 'Internships', 'Volunteering', 'Opportunities'];

export default function TabbedHero({ headline, subheadline, categories }: TabbedHeroProps) {
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
