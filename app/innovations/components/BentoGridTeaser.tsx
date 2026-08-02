'use client';

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion, Variants } from 'framer-motion';
import PremiumButton from '@/components/PremiumButton';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function BentoGridTeaser({ challenges }: { challenges: any[] }) {
  if (!challenges || challenges.length === 0) {
    return null;
  }

  // Row 1: 0 (span 8), 1 (span 4)
  // Row 2: 2 (span 4), 3 (span 4), 4 (span 4)
  // Row 3: 5 (span 4), 6 (span 8)
  const getSpan = (idx: number) => {
    // 4 items on Row 1, 3 items on Row 2
    if (idx >= 0 && idx <= 3) return { xs: '1fr', md: 'span 3' };
    if (idx >= 4 && idx <= 6) return { xs: '1fr', md: 'span 4' };
    return { xs: '1fr', md: 'span 3' };
  };

  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-100px' }}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' },
        gap: 3
      }}
    >
      {challenges.map((b, idx) => (
        <Box
          key={b.id}
          component={motion.div}
          variants={itemVariants}
          sx={{ gridColumn: getSpan(idx) }}
        >
          <Link href={`/${b.id}`} passHref style={{ textDecoration: 'none' }}>
            <Box 
              className="bento-card"
              sx={{ 
                height: { xs: 250, md: 260 },
                bgcolor: 'rgba(20, 20, 20, 0.6)',
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': { 
                  transform: 'translateY(-5px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                  zIndex: 10
                },
                '&::before': {
                  content: '""', position: 'absolute', top: 0, left: 0, width: '100%', height: '4px',
                  background: 'linear-gradient(90deg, #ff3366, #ff9933)', opacity: 0, transition: 'all 0.4s',
                  zIndex: 5
                },
                '&:hover::before': { opacity: 1, height: '4px' }
              }}
            >
              {/* Background Image */}
              <Box sx={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: `url(${b.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
                '.bento-card:hover &': { transform: 'scale(1.1)' }
              }} />
              
              {/* Dark Overlay Gradient */}
              <Box sx={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(to top, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.4) 60%, transparent 100%)',
                zIndex: 1,
                transition: 'opacity 0.5s',
                '.bento-card:hover &': { opacity: 0.95, background: 'linear-gradient(to top, rgba(5,5,5,0.98) 0%, rgba(5,5,5,0.7) 100%)' }
              }} />

              {/* Content */}
              <Box sx={{ 
                p: { xs: 3, md: 4 }, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                zIndex: 2,
              }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 900, 
                  color: 'white', 
                  mb: 1, 
                  letterSpacing: '-0.02em', 
                  fontSize: { xs: '1.4rem', md: '1.6rem' },
                  transition: 'transform 0.4s ease',
                  '.bento-card:hover &': { transform: 'translateY(-4px)' }
                }}>
                  {b.title}
                </Typography>
                
                <Box sx={{ 
                  maxHeight: 0, 
                  opacity: 0, 
                  overflow: 'hidden', 
                  transition: 'all 0.4s ease', 
                  transform: 'translateY(10px)',
                  '.bento-card:hover &': { maxHeight: '100px', opacity: 1, transform: 'translateY(0)', mb: 2 } 
                }}>
                  <Typography variant="body2" sx={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    lineHeight: 1.5,
                  }}>
                    {b.desc}
                  </Typography>
                </Box>

                <PremiumButton 
                  component="div"
                  variant="outlined"
                  baseColor="white"
                  endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
                  sx={{ 
                    mt: 1, 
                    px: 2, 
                    py: 1, 
                    fontSize: '0.8rem',
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(10px)', 
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: 'white', 
                    fontWeight: 800, 
                    transition: 'all 0.3s', 
                    '.bento-card:hover &': { bgcolor: '#1b5e20', borderColor: '#1b5e20' } 
                  }}>
                  Explore
                </PremiumButton>
              </Box>
            </Box>
          </Link>
        </Box>
      ))}
    </Box>
  );
}
