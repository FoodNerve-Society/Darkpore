// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

// This would normally come from the CMS or an API
const MOCK_ALERTS = [
  {
    id: '1',
    type: 'livestream',
    tag: 'LIVE NOW',
    title: 'Cold Storage Innovation Masterclass',
    time: 'in 2 hours',
    cta: 'Join Stream',
    link: '#',
    color: '#ff3366', // Red/Pink for Live
    isGlobal: true,
    challengeId: 'post-harvest-loss',
    subcategoryId: 'cold-chain-logistics'
  },
  {
    id: '2',
    type: 'job',
    tag: 'URGENT GIG',
    title: 'Logistics Manager Needed (Lagos Hub)',
    time: 'closes by 11:59 PM',
    cta: 'Apply Fast',
    link: '#',
    color: '#ff9933', // Orange for Urgent
    isGlobal: true,
    challengeId: 'market-access',
    subcategoryId: 'b2b-marketplaces'
  },
  {
    id: '3',
    type: 'activity',
    tag: 'FIELD DAY',
    title: 'Solar Drying Demo - Kaduna',
    time: 'tomorrow at 9:00 AM',
    cta: 'RSVP',
    link: '#',
    color: '#33ccff', // Blue for Activity
    isGlobal: true,
    challengeId: 'post-harvest-loss',
    subcategoryId: 'processing-preservation'
  }
];

export default function TimeSensitiveAlertBar({ challengeId, subcategoryId }: { challengeId?: string; subcategoryId?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter alerts based on the current context
  const filteredAlerts = MOCK_ALERTS.filter((alert) => {
    // If we're on a subcategory page, only show alerts for this specific subcategory
    if (subcategoryId) {
      return alert.subcategoryId === subcategoryId;
    }
    // If we're on a challenge page (but not a subcategory), show alerts for this challenge
    if (challengeId) {
      return alert.challengeId === challengeId;
    }
    // If we're on the global homepage (no challenge or subcategory), show all globally urgent alerts
    return alert.isGlobal;
  });

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (filteredAlerts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredAlerts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [filteredAlerts.length]);

  if (filteredAlerts.length === 0) return null;

  const currentAlert = filteredAlerts[currentIndex % filteredAlerts.length];

  return (
    <Box sx={{ width: '100%', pt: { xs: 12, md: 14 }, pb: 2, bgcolor: '#050505' }}>
      <Container maxWidth="lg">
        <Box sx={{ 
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.08)',
          bgcolor: 'rgba(25, 25, 25, 0.4)',
          backdropFilter: 'blur(20px)',
          minHeight: { xs: 80, md: 64 },
          display: 'flex',
          alignItems: 'center',
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 0 }
        }}>
          {/* Subtle animated background pulse based on current color */}
          <motion.div 
            key={`bg-${currentAlert.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: `linear-gradient(90deg, transparent, ${currentAlert.color}, transparent)`,
              pointerEvents: 'none'
            }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentAlert.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: '250px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationsActiveIcon sx={{ color: currentAlert.color, fontSize: 18, animation: 'pulse 2s infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.5 } } }} />
                  <Typography variant="overline" sx={{ color: currentAlert.color, fontWeight: 900, letterSpacing: 1.5, fontSize: '0.7rem' }}>
                    {currentAlert.tag}
                  </Typography>
                </Box>
                
                {/* Vertical Divider (desktop only) */}
                <Box sx={{ display: { xs: 'none', md: 'block' }, width: '1px', height: '24px', bgcolor: 'rgba(255,255,255,0.1)' }} />
                
                <Box>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.85rem', md: '0.95rem' } }}>
                    {currentAlert.title}
                  </Typography>
                  {currentAlert.time && (
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500, display: 'block', mt: 0.25 }}>
                      {currentAlert.time}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Button 
                size="small" 
                endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                sx={{ 
                  color: 'white', 
                  bgcolor: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  px: 2,
                  py: 0.5,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)' }
                }}
              >
                {currentAlert.cta}
              </Button>
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator */}
          {filteredAlerts.length > 1 && (
            <Box sx={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 0.5 }}>
              {filteredAlerts.map((_, idx) => (
                <Box 
                  key={idx} 
                  sx={{ 
                    width: 4, height: 4, borderRadius: '50%', 
                    bgcolor: idx === (currentIndex % filteredAlerts.length) ? 'white' : 'rgba(255,255,255,0.2)',
                    transition: 'all 0.3s'
                  }} 
                />
              ))}
            </Box>
          )}

        </Box>
      </Container>
    </Box>
  );
}
