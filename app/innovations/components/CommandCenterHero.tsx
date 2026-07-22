'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Button, IconButton, keyframes } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Link from 'next/link';

interface CommandCenterHeroProps {
  headline: string;
  subheadline: string;
  globalAlerts?: any[];
}

const CATEGORIES = [
  { id: 'lane-articles', label: 'Articles', icon: '📝', color: '#3b82f6', count: 142, newCount: 12 },
  { id: 'lane-livestreams', label: 'Livestreams', icon: '🎥', color: '#f59e0b', count: 24, newCount: 3 },
  { id: 'lane-jobs', label: 'Jobs & Internships', icon: '💼', color: '#10b981', count: 110, newCount: 8 },
  { id: 'lane-volunteering', label: 'Volunteering', icon: '🤝', color: '#ec4899', count: 15, newCount: 2 },
  { id: 'lane-opportunities', label: 'Opportunities', icon: '🚀', color: '#8b5cf6', count: 53, newCount: 8 },
];

const flowAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(255, 255, 255, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
`;

export default function CommandCenterHero({ headline, subheadline, globalAlerts = [] }: CommandCenterHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const getTimeStatus = (alert: any) => {
    if (!alert) return null;
    const now = new Date().getTime();
    const start = alert.startDate ? new Date(alert.startDate).getTime() : null;
    const end = alert.endDate ? new Date(alert.endDate).getTime() : null;

    if (start && start <= now && (!end || end > now)) {
      return { label: 'HAPPENING NOW', color: '#ef4444', pulse: true };
    } else if (start && start > now) {
      const diffMs = start - now;
      const diffHrs = Math.round(diffMs / (1000 * 60 * 60));
      if (diffHrs < 24) return { label: `STARTS IN ${Math.max(1, diffHrs)}H`, color: '#f59e0b', pulse: false };
      const diffDays = Math.round(diffHrs / 24);
      return { label: `STARTS IN ${diffDays}D`, color: '#f59e0b', pulse: false };
    } else if (!start && end && end > now) {
      const diffMs = end - now;
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      return { label: `DEADLINE IN ${Math.max(1, diffDays)}D`, color: '#eab308', pulse: false };
    }
    return null;
  };

  const statusObj = getTimeStatus(globalAlerts[currentSlide]);

  const renderHeadline = () => {
    if (headline.startsWith('Explore')) {
      const rest = headline.substring(7);
      return (
        <>
          <Box component="span" sx={{ 
            background: 'linear-gradient(270deg, #10b981, #3b82f6, #10b981)', 
            backgroundSize: '200% 200%', 
            animation: `${flowAnimation} 4s ease infinite`, 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'inline',
            paddingRight: '0.1em',
            marginRight: '-0.1em'
          }}>
            Explore
          </Box>
          {rest}
        </>
      );
    }
    return headline;
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, globalAlerts.length));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(1, globalAlerts.length)) % Math.max(1, globalAlerts.length));
  };

  useEffect(() => {
    if (globalAlerts.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [globalAlerts.length]);

  return (
    <Box sx={{ minHeight: '80vh', bgcolor: '#ffffff', color: '#0f172a', pt: { xs: 12, md: 16 }, pb: 8, position: 'relative', overflow: 'hidden' }}>
      
      {/* Background ambient glow */}
      <Box sx={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 50%)', zIndex: 0, pointerEvents: 'none' }} />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        
        {/* 1. TOP TEXT */}
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 }, maxWidth: '800px', mx: 'auto' }}>
          <Typography variant="h1" sx={{ fontWeight: 900, fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem' }, letterSpacing: '-0.05em', lineHeight: 1.05, mb: 3, color: '#0f172a' }}>
            {renderHeadline()}
          </Typography>
          <Typography variant="body1" sx={{ color: '#475569', fontSize: { xs: '0.95rem', md: '1.15rem' }, fontWeight: 500, lineHeight: 1.6, maxWidth: '650px', mx: 'auto' }}>
            {subheadline}
          </Typography>
        </Box>

        {/* 2. SPLIT LAYOUT */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '8fr 4fr' }, gap: 4, alignItems: 'stretch' }}>
          
          {/* LEFT: Wide Slideshow */}
          <Box sx={{ 
            position: 'relative', 
            borderRadius: '24px', 
            overflow: 'hidden', 
            bgcolor: '#f8fafc', 
            border: '1px solid #e2e8f0',
            minHeight: { xs: '350px', md: '450px' },
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)'
          }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, position: 'absolute', top: 0, left: 0, right: 0 }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Box sx={{ bgcolor: '#ffffff', px: 2.5, py: 1, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <Typography sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    {globalAlerts[currentSlide]?.categoryLabel || 'GLOBAL UPDATES'}
                  </Typography>
                </Box>
                
                <AnimatePresence mode="wait">
                  {statusObj && (
                    <Box 
                      component={motion.div}
                      key={statusObj.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      sx={{ 
                        bgcolor: statusObj.color, 
                        px: 2, py: 1, 
                        borderRadius: '10px', 
                        boxShadow: `0 4px 15px ${statusObj.color}60`,
                        display: 'flex', alignItems: 'center', gap: 1,
                      }}
                    >
                      {statusObj.pulse && (
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white', animation: `${pulseAnimation} 2s infinite` }} />
                      )}
                      <Typography sx={{ fontWeight: 900, color: 'white', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        {statusObj.label}
                      </Typography>
                    </Box>
                  )}
                </AnimatePresence>
              </Box>
            </Box>
            
            <Box sx={{ position: 'relative', flexGrow: 1, overflow: 'hidden' }}>
              {globalAlerts.length > 0 ? (
                <Box
                  component={motion.div}
                  animate={{ x: `-${(currentSlide * 100) / Math.max(1, globalAlerts.length)}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  sx={{ 
                    display: 'flex', 
                    height: '100%', 
                    width: `${globalAlerts.length * 100}%` 
                  }}
                >
                  {globalAlerts.map((alert, idx) => (
                    <Box
                      key={idx}
                      sx={{ 
                        width: `${100 / globalAlerts.length}%`, 
                        height: '100%', 
                        position: 'relative', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'flex-end', 
                        p: { xs: 3, md: 5 } 
                      }}
                    >
                      {/* Full Width Background Image */}
                      {alert?.imageUrl ? (
                        <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                          <Box component="img" src={alert.imageUrl} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.4) 50%, rgba(15,23,42,0.1) 100%)' }} />
                        </Box>
                      ) : (
                         <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', zIndex: 0 }} />
                      )}

                      {/* Overlay Content */}
                      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: { xs: '100%', md: '80%' }, mb: 4 }}>
                        <Typography variant="h3" sx={{ fontWeight: 900, mb: 3, fontSize: { xs: '1.8rem', md: '2.5rem' }, lineHeight: 1.1, color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                          {alert?.title}
                        </Typography>
                        {alert?.link && (
                          <Button 
                            variant="contained" 
                            component={Link} 
                            href={alert.link}
                            endIcon={<ArrowForwardIcon />}
                            sx={{ 
                              bgcolor: '#ffffff', 
                              color: '#0f172a', 
                              fontWeight: 800, 
                              borderRadius: '999px',
                              px: 4, py: 1.5,
                              '&:hover': { bgcolor: '#f1f5f9' }
                            }}
                          >
                            Explore Details
                          </Button>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography sx={{ color: '#64748b' }}>No active alerts at this time.</Typography>
                </Box>
              )}
              
              {/* Beaded line at bottom */}
              {globalAlerts.length > 1 && (
                <Box sx={{ position: 'absolute', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 1, zIndex: 10 }}>
                  {globalAlerts.map((_, idx) => (
                    <Box 
                      key={idx} 
                      onClick={() => setCurrentSlide(idx)}
                      sx={{ 
                        width: idx === currentSlide ? 24 : 8, 
                        height: 4, 
                        borderRadius: '2px', 
                        bgcolor: idx === currentSlide ? '#10b981' : 'rgba(255,255,255,0.4)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }} 
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          {/* RIGHT: Vertical Premium List (Hidden on mobile) */}
          <Box sx={{ display: { xs: 'none', lg: 'flex' }, flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ fontWeight: 800, color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.85rem', pl: 1, mb: 1 }}>
              Ecosystem Categories
            </Typography>
            {CATEGORIES.map((cat, idx) => (
              <Box
                component="a"
                href={`#${cat.id}`}
                key={cat.id}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(cat.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                sx={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2.5,
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: '1px solid rgba(0,0,0,0.03)',
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: `${cat.color}40`,
                    transform: 'translateX(-8px) scale(1.02)',
                    boxShadow: `-15px 15px 30px ${cat.color}15, inset 0 1px 0 rgba(255,255,255,1)`
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  <Box sx={{ width: 52, height: 52, borderRadius: '16px', bgcolor: `${cat.color}10`, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: `inset 0 0 0 1px ${cat.color}20` }}>
                    {cat.icon}
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', lineHeight: 1.2 }}>
                        {cat.label}
                      </Typography>
                      {cat.newCount > 0 && (
                        <Box sx={{ bgcolor: `${cat.color}15`, color: cat.color, px: 1, py: 0.25, borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>
                          +{cat.newCount} New
                        </Box>
                      )}
                    </Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#64748b', mt: 0.5 }}>
                      {cat.count} listings total
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', '.category-card:hover &': { bgcolor: `${cat.color}15`, color: cat.color } }}>
                  <ArrowForwardIosIcon sx={{ color: '#94a3b8', fontSize: '0.9rem', ml: 0.5 }} />
                </Box>
              </Box>
            ))}
          </Box>

        </Box>
      </Container>
    </Box>
  );
}
