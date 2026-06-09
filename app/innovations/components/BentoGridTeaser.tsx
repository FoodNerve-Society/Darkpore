'use client';

import React from 'react';
import { Box, Typography, CardActionArea, Button } from '@mui/material';
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
    // If we have exactly 7 challenges, do the bento layout
    if (challenges.length === 7) {
      if (idx === 0) return { xs: '1fr', md: 'span 8' };
      if (idx === 6) return { xs: '1fr', md: 'span 8' };
      return { xs: '1fr', md: 'span 4' };
    }
    // Fallback if not 7
    return { xs: '1fr', md: 'span 4' };
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
        gap: 4
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
                height: { xs: 350, md: idx === 0 || idx === 6 ? 450 : 380 },
                bgcolor: 'rgba(20, 20, 20, 0.6)',
                borderRadius: 5,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': { 
                  transform: 'translateY(-10px)',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
                  zIndex: 10
                },
                '&::before': {
                  content: '""', position: 'absolute', top: 0, left: 0, width: '100%', height: '4px',
                  background: 'linear-gradient(90deg, #ff3366, #ff9933)', opacity: 0, transition: 'all 0.4s',
                  zIndex: 5
                },
                '&:hover::before': { opacity: 1, height: '6px' }
              }}
            >
              {/* Background Image */}
              <Box sx={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: `url(${b.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
                '.bento-card:hover &': { transform: 'scale(1.05)' }
              }} />
              
              {/* Dark Overlay Gradient */}
              <Box sx={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(to bottom, rgba(5,5,5,0.1) 0%, rgba(5,5,5,0.95) 100%)',
                zIndex: 1,
                transition: 'opacity 0.5s',
                '.bento-card:hover &': { opacity: 0.85 }
              }} />

              {/* Content */}
              <CardActionArea sx={{ 
                p: { xs: 4, md: 5 }, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                zIndex: 2,
              }}>
                <Typography variant="h3" sx={{ 
                  fontWeight: 900, 
                  color: 'white', 
                  mb: 2, 
                  letterSpacing: '-0.02em', 
                  fontSize: { xs: '2rem', md: idx === 0 || idx === 6 ? '3.5rem' : '2rem' } 
                }}>
                  {b.title}
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  lineHeight: 1.7, 
                  maxWidth: '700px',
                  fontSize: { xs: '1rem', md: idx === 0 || idx === 6 ? '1.2rem' : '1rem' }
                }}>
                  {b.desc}
                </Typography>
                <PremiumButton 
                  variant="outlined"
                  baseColor="white"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    mt: 4, 
                    px: 3, 
                    py: 1.5, 
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
              </CardActionArea>
            </Box>
          </Link>
        </Box>
      ))}
    </Box>
  );
}
