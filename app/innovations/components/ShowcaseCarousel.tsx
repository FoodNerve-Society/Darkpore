'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, Grid, Chip, Button, IconButton } from '@mui/material';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function ShowcaseCarousel({ projects }: { projects: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    
    // Instead of raw scrollLeft, calculate center point to find active slide
    const centerPoint = scrollLeft + clientWidth / 2;
    const children = Array.from(scrollRef.current.children);
    
    let closestIndex = 0;
    let closestDistance = Infinity;

    children.forEach((child, index) => {
      const el = child as HTMLElement;
      // Skip pagination dots and arrows if they are in the children
      if (!el.dataset.index) return;
      const childCenter = el.offsetLeft + el.clientWidth / 2;
      const distance = Math.abs(centerPoint - childCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = parseInt(el.dataset.index || '0');
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  const scrollTo = (index: number) => {
    if (!scrollRef.current) return;
    const children = Array.from(scrollRef.current.children);
    const target = children.find(c => (c as HTMLElement).dataset.index === String(index)) as HTMLElement;
    if (target) {
      scrollRef.current.scrollTo({
        left: target.offsetLeft - (scrollRef.current.clientWidth - target.clientWidth) / 2,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Horizontal Scroll Container */}
      <Box 
        ref={scrollRef}
        onScroll={handleScroll}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          gap: { xs: 2, md: 4 },
          px: { xs: 2, md: 'max(24px, calc((100vw - 1200px) / 2))' }, // Align first item with container
          pb: 8, // Added large padding bottom so box-shadow won't clip
          pt: 4, // Added top padding so cards can scale without clipping
          // Hide standard scrollbar
          msOverflowStyle: 'none', 
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {projects.map((project, idx) => {
          const isActive = idx === activeIndex;
          return (
          <Box key={idx} data-index={idx} sx={{
            minWidth: { xs: '85vw', md: '75vw' },
            scrollSnapAlign: 'center',
            flexShrink: 0,
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: isActive ? 1 : 0.6,
            transform: isActive ? 'scale(1)' : 'scale(0.95)',
          }}>
            <Link href={project.link} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
              <Box sx={{
                position: 'relative',
                minHeight: { xs: 450, md: 550 },
                display: 'flex',
                alignItems: 'flex-end',
                overflow: 'hidden',
                borderRadius: 6,
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.4s',
                // Updated box shadow logic: visible by default on active, deeper on hover
                boxShadow: isActive ? '0 30px 60px rgba(0,0,0,0.5)' : 'none',
                '&:hover': { borderColor: 'rgba(255,255,255,0.3)', boxShadow: '0 40px 80px rgba(0,0,0,0.7)' },
                '&:hover .project-image': { transform: 'scale(1.05)' },
                '&:hover .project-overlay': { background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)' },
              }}>
                {/* Background Image */}
                <Box className="project-image" sx={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: `url(${project.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transition: 'transform 0.6s ease',
                }} />
                {/* Gradient Overlay */}
                <Box className="project-overlay" sx={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
                  transition: 'background 0.4s',
                }} />
                {/* Content */}
                <Box sx={{ position: 'relative', zIndex: 2, p: { xs: 4, md: 6 }, width: '100%' }}>
                  <Grid container spacing={4} alignItems="flex-end">
                    <Grid item xs={12} md={7}>
                      <Chip label={idx === 0 ? 'FLAGSHIP' : 'ACTIVE'} size="small" sx={{ bgcolor: idx === 0 ? 'error.main' : 'primary.main', color: 'white', fontWeight: 'bold', mb: 2, letterSpacing: 1 }} />
                      <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, lineHeight: 1.1 }}>
                        {project.title}
                      </Typography>
                      <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 400, lineHeight: 1.6, mb: 4, maxWidth: 500 }}>
                        {project.desc}
                      </Typography>
                      <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />} sx={{
                        bgcolor: 'white', color: '#0a0a0a', borderRadius: 8, px: 4, py: 1.5, fontWeight: 'bold',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                      }}>
                        View Deployment
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                        {[
                          { label: 'Minimum to invest', value: idx === 0 ? '$50K' : '$25K' },
                          { label: 'Minimum to launch', value: idx === 0 ? '$1M' : '$500K' },
                        ].map((stat, sidx) => (
                          <Box key={sidx} sx={{
                            bgcolor: 'rgba(255,255,255,0.08)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 4,
                            px: 3, py: 2,
                            minWidth: 140,
                          }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                              {stat.label}
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                              {stat.value}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Link>
          </Box>
        )})}

        {/* See All Projects Trailing Banner */}
        <Box sx={{
          minWidth: { xs: '85vw', md: '30vw' },
          scrollSnapAlign: 'center',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Link href="/projects" passHref style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
            <Box sx={{
              minHeight: { xs: 450, md: 550 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6,
              cursor: 'pointer',
              border: '1px dashed rgba(255,255,255,0.2)',
              bgcolor: 'rgba(255,255,255,0.02)',
              transition: 'all 0.4s',
              '&:hover': { 
                borderColor: 'rgba(255,255,255,0.5)', 
                bgcolor: 'rgba(255,255,255,0.05)',
                transform: 'scale(0.98)'
              },
            }}>
              <Box sx={{ p: 3, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)', mb: 3 }}>
                <ArrowForwardIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', mb: 1 }}>
                Tap to see all
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                Explore the complete deployment portfolio
              </Typography>
            </Box>
          </Link>
        </Box>
      </Box>

      {/* Controls: Dots and Arrows */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 4, 
        mt: 4,
        px: { xs: 2, md: 'max(24px, calc((100vw - 1200px) / 2))' }, 
        pb: 4
      }}>
        {/* Left Arrow */}
        <IconButton 
          onClick={() => scrollTo(Math.max(0, activeIndex - 1))}
          disabled={activeIndex === 0}
          sx={{ 
            color: 'white', 
            bgcolor: 'rgba(255,255,255,0.05)', 
            border: '1px solid rgba(255,255,255,0.1)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
            '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)', borderColor: 'transparent' }
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        {/* Dots */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {projects.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => scrollTo(idx)}
              sx={{
                width: activeIndex === idx ? 32 : 8,
                height: 8,
                borderRadius: 4,
                bgcolor: activeIndex === idx ? 'white' : 'rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: activeIndex === idx ? 'white' : 'rgba(255,255,255,0.5)',
                }
              }}
            />
          ))}
        </Box>

        {/* Right Arrow */}
        <IconButton 
          onClick={() => scrollTo(Math.min(projects.length - 1, activeIndex + 1))}
          disabled={activeIndex === projects.length - 1}
          sx={{ 
            color: 'white', 
            bgcolor: 'rgba(255,255,255,0.05)', 
            border: '1px solid rgba(255,255,255,0.1)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
            '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)', borderColor: 'transparent' }
          }}
        >
          <ArrowForwardIcon />
        </IconButton>
      </Box>
    </Box>
  );
}