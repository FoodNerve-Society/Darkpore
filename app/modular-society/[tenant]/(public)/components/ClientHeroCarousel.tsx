'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

type Slide = {
  image: string;
  tag: string;
  title: string;
  description: string;
};

export default function ClientHeroCarousel({ slides }: { slides: Slide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides]);

  if (!slides || slides.length === 0) return null;

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 450, height: 480, ml: 'auto', perspective: 1000, mt: { xs: 6, md: 0 } }}>
      <AnimatePresence>
        {slides.map((slide, index) => {
          // Calculate the relative position of this slide based on currentIndex
          // 0 = front, 1 = middle, 2 = back, etc.
          const offset = (index - currentIndex + slides.length) % slides.length;
          
          // Only show up to 3 cards in the stack
          if (offset > 2 && slides.length > 3) return null;

          // Animation properties based on offset
          const scale = 1 - offset * 0.05;
          const translateY = offset * 25; // Push lower layers down
          const opacity = offset === 0 ? 1 : 1 - offset * 0.4;
          const zIndex = slides.length - offset;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ 
                opacity,
                scale,
                y: translateY,
                zIndex
              }}
              transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
              }}
            >
              <Card 
                sx={{ 
                  width: '100%',
                  borderRadius: 4,
                  boxShadow: offset === 0 ? '0 30px 60px rgba(0,0,0,0.6)' : '0 10px 30px rgba(0,0,0,0.3)',
                  overflow: 'hidden',
                  bgcolor: '#0a1a12',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: 240, 
                    backgroundImage: `url(${slide.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }} 
                >
                   {/* Gradient overlay to blend image into text box */}
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, #0a1a12, transparent)' }} />
                </Box>
                <CardContent sx={{ bgcolor: '#0a1a12', color: 'white', p: { xs: 3, md: 4 }, position: 'relative' }}>
                  <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 2, mb: 1, display: 'block', color: '#d97706' }}>
                    {slide.tag}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, fontFamily: 'var(--font-playfair)' }}>
                    {slide.title}
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.6, fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {slide.description}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </Box>
  );
}
