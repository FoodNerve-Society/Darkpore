'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { CategoryTabMenu, Category } from './CategoryTabMenu';
import { SearchBar } from './SearchBar';

export interface TabArticle {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  link: string;
  author: string;
  dateAdded: Date | string;
}

export interface TabCategory {
  id: string;
  title: string;
  articles: TabArticle[];
}

interface TabbedHeroProps {
  headline: string;
  subheadline: string;
  categories: TabCategory[];
}

export default function TabbedHero({ headline, subheadline, categories }: TabbedHeroProps) {
  const themeColor = '#166534'; // Earthy green for FoodNerve

  // Convert hex to RGB for tinted background
  const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
  };
  const rgb = hexToRgb(themeColor);

  // Create a solid pastel background by mixing with white (3% tint)
  const mixWithWhite = (c: number) => Math.round(c * 0.03 + 255 * 0.97);
  const tintedBg = `rgb(${mixWithWhite(rgb.r)}, ${mixWithWhite(rgb.g)}, ${mixWithWhite(rgb.b)})`;

  // State
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '');
  const [slideDirection, setSlideDirection] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [heroAnimationDone, setHeroAnimationDone] = useState(false);

  // Mesh Background Generator
  const MeshBackground = useMemo(() => {
      const baseColor = themeColor;
      const colors = [
          baseColor,
          `${baseColor}99`,
          `${baseColor}44`,
      ];

      return (
          <Box sx={{
              position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
              overflow: 'hidden', bgcolor: tintedBg,
          }}>
              {/* Moving Blobs */}
              {[...Array(3)].map((_, i) => (
                  <Box
                      key={i}
                      component={motion.div}
                      animate={{
                          x: [0, 100, -100, 0],
                          y: [0, -150, 150, 0],
                          scale: [1, 1.2, 0.8, 1],
                      }}
                      transition={{
                          duration: 15 + i * 5,
                          repeat: Infinity,
                          ease: "linear"
                      }}
                      sx={{
                          position: 'absolute',
                          width: '60vw',
                          height: '60vw',
                          borderRadius: '50%',
                          filter: 'blur(100px)',
                          opacity: 0.15,
                          bgcolor: colors[i % colors.length],
                          top: `${20 + i * 20}%`,
                          left: `${10 + i * 25}%`,
                      }}
                  />
              ))}
              {/* Subtle Dot Overlay */}
              <Box sx={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.05) 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                  opacity: 0.5
              }} />
          </Box>
      );
  }, [themeColor, tintedBg]);

  // Format categories for TabMenu
  const tabCategories: Category[] = categories.map(cat => ({
      id: cat.id,
      title: cat.title,
      count: cat.articles.length
  }));

  // Filtered Articles based on Search & Category
  const activeCatData = categories.find(c => c.id === activeCategory);
  const filteredArticles = useMemo(() => {
      if (!activeCatData) return [];
      let result = activeCatData.articles;
      if (searchTerm) {
          const lower = searchTerm.toLowerCase();
          result = result.filter(a => a.title.toLowerCase().includes(lower) || a.author.toLowerCase().includes(lower));
      }
      return result;
  }, [activeCatData, searchTerm]);

  return (
      <Box sx={{
          minHeight: '100vh',
          width: '100%',
          maxWidth: '100vw',
          bgcolor: tintedBg,
          color: '#0f172a',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden'
      }}>
          {/* Elite Atmospheric Background */}
          {MeshBackground}

          {/* Content Layer */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Container maxWidth="lg" sx={{ py: 4, overflowX: 'hidden' }} id="products-section">

                  {/* Elite Hero Section */}
                  <Box 
                      component={motion.div}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      onAnimationComplete={() => setHeroAnimationDone(true)}
                      sx={{ pt: { xs: 6, md: 10 }, pb: 4, textAlign: 'center', maxWidth: 900, mx: 'auto' }}
                  >
                      <Typography 
                          variant="h3" 
                          component="h1" 
                          fontWeight="950" 
                          sx={{
                              background: `linear-gradient(to bottom, ${themeColor} 20%, #0f172a 100%)`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              mb: 2.5,
                              fontSize: { xs: '2.4rem', md: '4.5rem' },
                              letterSpacing: '-0.05em',
                              lineHeight: 1.1,
                              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.05))'
                          }}
                      >
                          {headline || "Intelligence Hub"}
                      </Typography>
                      
                      <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6, duration: 1 }}
                      >
                          <Typography variant="h6" sx={{
                              color: 'rgba(15, 23, 42, 0.6)',
                              mb: 6,
                              px: 2,
                              fontSize: { xs: '1rem', md: '1.25rem' },
                              lineHeight: 1.6,
                              fontWeight: 600,
                              maxWidth: 700,
                              mx: 'auto'
                          }}>
                              {subheadline || "Select an area of focus to explore our latest deployments and insights."}
                          </Typography>
                      </motion.div>
                  </Box>

                  {/* Staggered Reveal Content */}
                  <Box 
                      component={motion.div}
                      initial={{ opacity: 0, y: 20 }}
                      animate={heroAnimationDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                  >

                      {/* Sticky Search Bar - Anchored for Scroll */}
                      <Box id="products-search-anchor" sx={{ position: 'sticky', top: { xs: 20, md: 20 }, zIndex: 10, pb: 2, scrollMarginTop: '160px' }}>
                          <Box sx={{ mx: 2, py: 1, px: 2 }}>
                              <SearchBar
                                  value={searchTerm}
                                  onChange={setSearchTerm}
                                  themeColor={themeColor}
                              />
                          </Box>
                      </Box>

                      {/* Categories */}
                      <CategoryTabMenu
                          categories={tabCategories}
                          selectedCategoryId={activeCategory}
                          onSelectCategory={(newCategory) => {
                              if (newCategory === activeCategory) return;
                              const currentIndex = tabCategories.findIndex(c => c.id === activeCategory);
                              const newIndex = tabCategories.findIndex(c => c.id === newCategory);
                              setSlideDirection(newIndex > currentIndex ? 1 : -1);
                              setActiveCategory(newCategory);
                          }}
                          themeColor={themeColor}
                      />

                      {/* Animated Content Stage */}
                      <AnimatePresence mode="wait" custom={slideDirection}>
                          <motion.div
                              key={activeCategory + (searchTerm || '')}
                              custom={slideDirection}
                              variants={{
                                  initial: (dir: number) => ({ opacity: 0, x: dir > 0 ? 30 : -30 }),
                                  animate: { opacity: 1, x: 0 },
                                  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -30 : 30 })
                              }}
                              initial="initial"
                              animate="animate"
                              exit="exit"
                              transition={{ duration: 0.3, ease: 'easeOut' }}
                          >
                              <Box sx={{ 
                                  display: 'flex',
                                  gap: 4,
                                  overflowX: 'auto',
                                  pb: 4,
                                  px: 2,
                                  scrollbarWidth: 'none',
                                  '&::-webkit-scrollbar': { display: 'none' }
                              }}>
                                  {filteredArticles.length === 0 ? (
                                      <Typography sx={{ color: '#94a3b8', fontStyle: 'italic', my: 4, mx: 'auto' }}>
                                          No recent updates in this category.
                                      </Typography>
                                  ) : (
                                      filteredArticles.slice(0, 5).map(article => (
                                          <Box 
                                              key={article.id} 
                                              component={Link}
                                              href={article.link}
                                              sx={{ 
                                                  minWidth: { xs: '280px', md: '380px' },
                                                  maxWidth: '380px',
                                                  textDecoration: 'none',
                                                  color: 'inherit',
                                                  display: 'flex',
                                                  flexDirection: 'column',
                                                  gap: 2,
                                                  group: 'true'
                                              }}
                                          >
                                              <Box sx={{ 
                                                  width: '100%', 
                                                  aspectRatio: '16/9', 
                                                  borderRadius: 3,
                                                  overflow: 'hidden',
                                                  position: 'relative',
                                                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                              }}>
                                                  <Box 
                                                      component="img" 
                                                      src={article.thumbnailUrl} 
                                                      alt={article.title}
                                                      sx={{ 
                                                          width: '100%', 
                                                          height: '100%', 
                                                          objectFit: 'cover',
                                                          transition: 'transform 0.5s',
                                                          '&:hover': {
                                                              transform: 'scale(1.05)'
                                                          }
                                                      }} 
                                                  />
                                              </Box>
                                              <Box>
                                                  <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'serif', lineHeight: 1.3, mb: 1, color: '#0f172a', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                      {article.title}
                                                  </Typography>
                                                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                                                      By {article.author}
                                                  </Typography>
                                              </Box>
                                          </Box>
                                      ))
                                  )}
                                  
                                  {filteredArticles.length > 0 && activeCatData && (
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '250px' }}>
                                          <Button 
                                              variant="outlined" 
                                              endIcon={<ArrowForwardIcon />}
                                              component={Link}
                                              href={`/innovations/${activeCatData.id}`}
                                              sx={{ 
                                                  borderRadius: '999px',
                                                  borderColor: themeColor,
                                                  color: themeColor,
                                                  textTransform: 'none',
                                                  fontWeight: 700,
                                                  fontSize: '1.1rem',
                                                  px: 4,
                                                  py: 1.5,
                                                  '&:hover': {
                                                      bgcolor: themeColor,
                                                      color: '#ffffff'
                                                  }
                                              }}
                                          >
                                              View all {activeCatData.title}
                                          </Button>
                                      </Box>
                                  )}
                              </Box>
                          </motion.div>
                      </AnimatePresence>
                  </Box>
              </Container>
          </Box>
      </Box>
  );
}
