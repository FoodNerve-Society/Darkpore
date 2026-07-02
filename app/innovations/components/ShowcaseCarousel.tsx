'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, Grid, Chip, IconButton } from '@mui/material';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PremiumButton from '@/components/PremiumButton';
import PremiumChip from '@/components/PremiumChip';

export default function ShowcaseCarousel({ projects }: { projects: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Scroll handler to determine which item is in the center
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    
    const centerPoint = scrollLeft + clientWidth / 2;
    const children = Array.from(scrollRef.current.children);
    
    let closestIndex = 0;
    let closestDistance = Infinity;

    children.forEach((child) => {
      const el = child as HTMLElement;
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

  // Auto-looping functionality
  useEffect(() => {
    if (isHovered || !projects || projects.length === 0) return;
    
    const interval = setInterval(() => {
      // Calculate next index, including the "See All" card which is projects.length
      const nextIndex = (activeIndex + 1) % (projects.length + 1);
      scrollTo(nextIndex);
    }, 5000); // 5 seconds per slide
    
    return () => clearInterval(interval);
  }, [activeIndex, isHovered, projects]);

  if (!projects || projects.length === 0) return null;

  return (
    <Box 
      sx={{ position: 'relative' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Horizontal Scroll Container */}
      <Box 
        ref={scrollRef}
        onScroll={handleScroll}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          gap: { xs: 2, md: 4 },
          px: { xs: 2, md: 'max(24px, calc((100vw - 1200px) / 2))' },
          pb: 8, 
          pt: 4, 
          msOverflowStyle: 'none', 
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {projects.map((project, idx) => {
          const isActive = idx === activeIndex;
          return (
          <Box 
            key={idx} 
            data-index={idx} 
            onClick={() => { if (!isActive) scrollTo(idx); }}
            sx={{
              minWidth: { xs: '85vw', md: '38vw' },
              maxWidth: { xs: '85vw', md: 600 },
              scrollSnapAlign: 'center',
              flexShrink: 0,
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: isActive ? 1 : 0.4, // Darken inactive
              transform: isActive ? 'scale(1)' : 'scale(0.9)', // Shrink inactive
              filter: isActive ? 'none' : 'grayscale(50%) blur(2px)', // Blur inactive slightly for depth
              cursor: isActive ? 'default' : 'pointer'
          }}>
            <Link 
              href={project.link || '#'} 
              passHref 
              style={{ textDecoration: 'none', color: 'inherit', pointerEvents: isActive ? 'auto' : 'none' }}
            >
              <Box sx={{
                position: 'relative',
                minHeight: { xs: 450, md: 420 },
                display: 'flex',
                alignItems: 'flex-end',
                overflow: 'hidden',
                borderRadius: 6,
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.4s',
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
                  <Grid container spacing={4} sx={{ alignItems: 'flex-end', width: '100%', m: 0 }}>
                    <Grid size={{ xs: 12, md: 7 }} sx={{ p: '0 !important' }}>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <PremiumChip 
                          variant="filled" 
                          glow={true}
                          baseColor={project.type === 'Venture' ? '#ff4444' : project.type === 'Innovation' ? '#2196f3' : '#1b5e20'}
                          label={(project.type || 'Deployment').toUpperCase()} 
                          size="small" 
                          sx={{ letterSpacing: 1 }} 
                        />
                        <Chip
                          label={project.breadcrumb || `Category → Subcategory → Era`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.7)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            fontWeight: 700,
                            letterSpacing: 0.5
                          }}
                        />
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, lineHeight: 1.1, fontSize: { xs: '2rem', md: '2rem' } }}>
                        {project.title}
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 400, lineHeight: 1.4, mb: 3, maxWidth: 350, display: { xs: 'none', md: 'block' }, fontSize: '0.9rem' }}>
                        {project.description || project.desc}
                      </Typography>
                      
                      <PremiumButton variant="filled" size="large" baseColor="white" endIcon={<ArrowForwardIcon />} sx={{
                        color: '#0a0a0a', px: 3, py: 1, fontWeight: 'bold', fontSize: '0.85rem',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                      }}>
                        View Live Dashboard
                      </PremiumButton>
                    </Grid>
                    
                    <Grid size={{ xs: 12, md: 5 }} sx={{ p: '0 !important', display: { xs: 'none', md: 'block' } }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end', height: '100%', justifyContent: 'flex-end' }}>
                        
                        {/* Operator Block */}
                        <Box sx={{ 
                          display: 'flex', alignItems: 'center', gap: 2, 
                          bgcolor: 'rgba(0,0,0,0.4)', 
                          backdropFilter: 'blur(12px)',
                          borderRadius: 100, 
                          p: 1, pr: 3, 
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <Box sx={{
                            width: 40, height: 40,
                            borderRadius: '50%',
                            backgroundImage: `url(${project.operator?.avatarUrl || '/images/default-avatar.png'})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            border: '2px solid rgba(255,255,255,0.2)'
                          }} />
                          <Box>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: 1, display: 'block', lineHeight: 1 }}>
                              LEAD OPERATOR
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'white', lineHeight: 1, mt: 0.5 }}>
                              {project.operator?.name || 'Society Member'}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Traction Block */}
                        <Box sx={{
                          bgcolor: 'rgba(255,255,255,0.08)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: 4,
                          px: 3, py: 2,
                          minWidth: 200,
                          textAlign: 'right'
                        }}>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                            TRACTION
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.light', lineHeight: 1.2 }}>
                            {project.traction || 'Gaining momentum'}
                          </Typography>
                        </Box>

                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Link>
          </Box>
        )})}

        {/* See All Projects Trailing Banner */}
        <Box 
          data-index={projects.length}
          sx={{
            minWidth: { xs: '85vw', md: '25vw' },
            maxWidth: { xs: '85vw', md: 350 },
            scrollSnapAlign: 'center',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: activeIndex === projects.length ? 1 : 0.4,
            transform: activeIndex === projects.length ? 'scale(1)' : 'scale(0.9)',
            filter: activeIndex === projects.length ? 'none' : 'grayscale(50%) blur(2px)'
          }}
        >
          <Link href="/projects" passHref style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
            <Box sx={{
              minHeight: { xs: 450, md: 420 },
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
          <Box
            onClick={() => scrollTo(projects.length)}
            sx={{
              width: activeIndex === projects.length ? 32 : 8,
              height: 8,
              borderRadius: 4,
              bgcolor: activeIndex === projects.length ? 'white' : 'rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
          />
        </Box>

        {/* Right Arrow */}
        <IconButton 
          onClick={() => scrollTo(Math.min(projects.length, activeIndex + 1))}
          disabled={activeIndex === projects.length}
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
  )
}