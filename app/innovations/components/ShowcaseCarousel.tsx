'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Chip } from '@mui/material';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PremiumButton from '@/components/PremiumButton';
import PremiumChip from '@/components/PremiumChip';

export default function ShowcaseCarousel({ projects }: { projects: any[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-loop effect
  useEffect(() => {
    if (isHovered || !projects || projects.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % (projects.length + 1));
    }, 4000); // Change slide every 4 seconds
    return () => clearInterval(interval);
  }, [isHovered, projects]);

  // If projects empty, render nothing
  if (!projects || projects.length === 0) return null;

  return (
    <Box 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
      sx={{ width: '100%', px: { xs: 2, md: 'max(24px, calc((100vw - 1200px) / 2))' }, pb: 8 }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        height: { xs: 'auto', md: 500 },
        width: '100%'
      }}>
        {projects.map((project, idx) => {
          const isActive = idx === activeIndex;
          
          return (
            <Box 
              key={idx}
              onMouseEnter={() => setActiveIndex(idx)}
              sx={{
                flex: isActive ? { xs: 'none', md: 6 } : { xs: 'none', md: 1 },
                height: { xs: isActive ? 450 : 100, md: '100%' },
                position: 'relative',
                borderRadius: 4,
                overflow: 'hidden',
                transition: 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)', // More fluid easing
                cursor: 'pointer',
                border: '1px solid',
                borderColor: isActive ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                boxShadow: isActive ? '0 30px 60px rgba(0,0,0,0.5)' : 'none',
              }}
            >
              <Link href={project.link} passHref style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%', height: '100%' }}>
                
                {/* Background Image */}
                <Box sx={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: `url(${project.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transition: 'transform 6s ease',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }} />
                
                {/* Gradient Overlay */}
                <Box sx={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: isActive 
                    ? 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.1) 100%)'
                    : 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%)',
                  transition: 'background 0.6s',
                }} />

                {/* INACTIVE STATE (Vertical Text on Desktop) */}
                <Box sx={{ 
                  opacity: isActive ? 0 : 1, 
                  position: 'absolute', 
                  top: 0, left: 0, right: 0, bottom: 0, 
                  display: { xs: 'flex', md: 'flex' },
                  flexDirection: { xs: 'row', md: 'column' },
                  alignItems: 'center',
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                  p: { xs: 3, md: 4 },
                  transition: 'opacity 0.4s',
                  pointerEvents: 'none'
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 800, 
                    whiteSpace: 'nowrap',
                    color: 'rgba(255,255,255,0.6)',
                    writingMode: { xs: 'horizontal-tb', md: 'vertical-rl' },
                    transform: { xs: 'none', md: 'rotate(180deg)' },
                  }}>
                    {project.title}
                  </Typography>
                </Box>

                {/* ACTIVE STATE (Full Content) */}
                {/* Wrapped in a fixed-width box to prevent text reflow during flex-basis transition */}
                <Box sx={{ 
                  opacity: isActive ? 1 : 0,
                  position: 'absolute', 
                  top: 0, left: 0, bottom: 0, 
                  width: { xs: '90vw', md: 900 }, // Fixed width ensures inner layout doesn't constantly recalculate and cause jank
                  display: 'flex',
                  alignItems: 'flex-end',
                  p: { xs: 3, md: 5 },
                  transition: 'opacity 0.6s 0.2s',
                  pointerEvents: isActive ? 'auto' : 'none'
                }}>
                  <Grid container spacing={4} sx={{ width: '100%', m: 0 }}>
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
                          label={project.origin || 'Platform'}
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
                      <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, lineHeight: 1.1, fontSize: { xs: '2rem', md: '2.5rem' } }}>
                        {project.title}
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 400, lineHeight: 1.6, mb: 4, maxWidth: 500 }}>
                        {project.description || project.desc}
                      </Typography>
                      
                      <PremiumButton variant="filled" size="large" baseColor="white" endIcon={<ArrowForwardIcon />} sx={{
                        color: '#0a0a0a', px: 4, py: 1.5, fontWeight: 'bold',
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
              </Link>
            </Box>
          )
        })}

        {/* Explore All - Accordion Slide */}
        <Box 
          onMouseEnter={() => setActiveIndex(projects.length)}
          sx={{
            flex: activeIndex === projects.length ? { xs: 'none', md: 3 } : { xs: 'none', md: 1 },
            height: { xs: activeIndex === projects.length ? 200 : 100, md: '100%' },
            position: 'relative',
            borderRadius: 4,
            overflow: 'hidden',
            transition: 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
            cursor: 'pointer',
            border: '1px dashed rgba(255,255,255,0.2)',
            bgcolor: 'rgba(255,255,255,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Link href="/projects" passHref style={{ textDecoration: 'none', color: 'inherit', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ 
                p: 2, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)', mb: activeIndex === projects.length ? 2 : 0, 
                display: 'inline-block', transition: 'all 0.4s' 
              }}>
                <ArrowForwardIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 800, color: 'white',
                opacity: activeIndex === projects.length ? 1 : 0,
                maxHeight: activeIndex === projects.length ? 50 : 0,
                transition: 'all 0.4s'
              }}>
                See all
              </Typography>
            </Box>
          </Link>
        </Box>

      </Box>
    </Box>
  )
}