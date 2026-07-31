'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Button, IconButton, keyframes, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Link from 'next/link';

interface CommandCenterHeroProps {
  globalAlerts?: any[];
}

const CATEGORIES = [
  { id: 'lane-articles', label: 'Articles', icon: '📝', color: '#3b82f6', count: 142, newCount: 12 },
  { id: 'lane-livestreams', label: 'Livestreams', icon: '🎥', color: '#f59e0b', count: 24, newCount: 3, isLive: true },
  { id: 'lane-jobs', label: 'Jobs & Internships', icon: '💼', color: '#10b981', count: 110, newCount: 8 },
  { id: 'lane-missions', label: 'Missions', icon: '🎯', color: '#ec4899', count: 15, newCount: 2 },
];

const flowAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
`;

export default function CommandCenterHero({ globalAlerts = [] }: CommandCenterHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [dailyAlerts, setDailyAlerts] = useState<any[]>(globalAlerts || []);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isToday = false;
    const now = new Date();
    if (currentDate.getDate() === now.getDate() && currentDate.getMonth() === now.getMonth() && currentDate.getFullYear() === now.getFullYear()) {
      isToday = true;
    }

    if (isToday && globalAlerts.length > 0) {
      setDailyAlerts(globalAlerts);
      setCurrentSlide(0);
      return;
    }

    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const start = new Date(currentDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(currentDate);
        end.setHours(23, 59, 59, 999);
        
        const res = await fetch(`/api/calendar?startDate=${start.toISOString()}&endDate=${end.toISOString()}&limit=10`);
        if (res.ok) {
           const data = await res.json();
           if (data.events) {
              const mapped = data.events.map((evt: any) => ({
                ...evt,
                categoryLabel: evt.sourceType === 'job' ? 'DEADLINE' : evt.sourceType === 'livestream' ? 'LIVESTREAM' : evt.category?.toUpperCase() || 'EVENT',
                startDate: evt.date,
                endDate: evt.endDate,
                imageUrl: evt.imageUrl || "https://images.unsplash.com/photo-1591696205602-2f950c417cb9?auto=format&fit=crop&q=80&w=800",
              }));
              setDailyAlerts(mapped);
              setCurrentSlide(0);
           }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, [currentDate, globalAlerts]);

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

  const statusObj = getTimeStatus(dailyAlerts[currentSlide]);

  const currentHour = new Date().getHours();
  let bgTheme = { bgcolor: '#ffffff', glowColor: 'rgba(16, 185, 129, 0.08)' };
  if (currentHour >= 6 && currentHour < 12) {
    bgTheme = { bgcolor: '#fffbeb', glowColor: 'rgba(245, 158, 11, 0.15)' }; // Morning (warm)
  } else if (currentHour >= 12 && currentHour < 18) {
    bgTheme = { bgcolor: '#f0fdf4', glowColor: 'rgba(16, 185, 129, 0.08)' }; // Afternoon (fresh)
  } else {
    bgTheme = { bgcolor: '#f8fafc', glowColor: 'rgba(79, 70, 229, 0.12)' }; // Evening (cool dusk)
  }

  return (
    <Box sx={{ minHeight: '80vh', bgcolor: bgTheme.bgcolor, color: '#0f172a', pt: { xs: 12, md: 16 }, pb: 8, position: 'relative', overflow: 'hidden', transition: 'background-color 1s ease' }}>
      {/* Background ambient glow */}
      <Box sx={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '100%', height: '100%', background: `radial-gradient(circle, ${bgTheme.glowColor} 0%, transparent 50%)`, zIndex: 0, pointerEvents: 'none', transition: 'background 1s ease' }} />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        
        {/* SPLIT LAYOUT */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '8fr 4fr' }, gap: 4, alignItems: 'stretch' }}>
          
          {/* LEFT: Controls & Wide Slideshow */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: 'relative' }}>
            
          {/* Header Area — Greeting Left, Controls Right */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
            {/* Left: Greeting + Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 700, color: '#0f172a', fontSize: { xs: '1.2rem', md: '1.6rem' }, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                {(() => {
                  const hour = new Date().getHours();
                  if (hour < 12) return 'Good Morning';
                  if (hour < 18) return 'Good Afternoon';
                  return 'Good Evening';
                })()}
              </Typography>
              
              <AnimatePresence mode="wait">
                {statusObj && dailyAlerts.length > 0 && (
                  <Box 
                    component={motion.div}
                    key={statusObj.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    sx={{ 
                      bgcolor: alpha(statusObj.color, 0.1), 
                      px: 1.5, py: 0.5, 
                      borderRadius: '999px', 
                      display: 'flex', alignItems: 'center', gap: 0.75,
                      border: `1px solid ${alpha(statusObj.color, 0.15)}`
                    }}
                  >
                    {statusObj.pulse && (
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusObj.color, animation: `${pulseAnimation} 2s infinite` }} />
                    )}
                    <Typography sx={{ fontFamily: 'var(--font-ysabeau-infant)', fontWeight: 700, color: statusObj.color, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.6rem' }}>
                      {statusObj.label}
                    </Typography>
                  </Box>
                )}
              </AnimatePresence>
            </Box>

            {/* Right: Date Navigation + Calendar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton 
                onClick={() => {
                  const prev = new Date(currentDate);
                  prev.setDate(prev.getDate() - 1);
                  setCurrentDate(prev);
                }}
                sx={{ color: '#94a3b8', '&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' }, width: 34, height: 34 }}
              >
                <ArrowBackIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
              
              <Typography sx={{ fontFamily: 'var(--font-ysabeau-infant)', fontWeight: 700, color: '#64748b', fontSize: { xs: '0.75rem', sm: '0.85rem' }, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap', mx: 0.5 }}>
                {currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </Typography>
              
              <IconButton 
                onClick={() => {
                  const next = new Date(currentDate);
                  next.setDate(next.getDate() + 1);
                  setCurrentDate(next);
                }}
                sx={{ color: '#94a3b8', '&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' }, width: 34, height: 34 }}
              >
                <ArrowForwardIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
              
              <Box sx={{ width: '1px', height: 18, bgcolor: 'rgba(0,0,0,0.08)', mx: 1 }} />
              
              <IconButton 
                component={Link} 
                href="/calendar"
                sx={{ color: '#10b981', '&:hover': { bgcolor: 'rgba(16,185,129,0.08)' }, width: 34, height: 34 }}
              >
                <CalendarMonthIcon sx={{ fontSize: '1.1rem' }} />
              </IconButton>
            </Box>
          </Box>

            <Box sx={{ 
              position: 'relative', 
              borderRadius: '28px', 
              overflow: 'hidden', 
              bgcolor: '#ffffff', 
              border: '1px solid rgba(255,255,255,0.8)',
              minHeight: { xs: '450px', md: '550px' },
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.02)',
              flexGrow: 1
            }}>
            <AnimatePresence mode="wait">
              <Box 
                component={motion.div}
                key={currentDate.toISOString()}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.3 }}
                sx={{ position: 'relative', flexGrow: 1, overflow: 'hidden' }}
              >
                {isLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 2 }}>
                  <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Loading {currentDate.toLocaleDateString()} events...</Typography>
                </Box>
              ) : dailyAlerts.length > 0 ? (
                <Box
                  component={motion.div}
                  animate={{ x: `-${(currentSlide * 100) / Math.max(1, dailyAlerts.length)}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  sx={{ 
                    display: 'flex', 
                    height: '100%', 
                    width: `${dailyAlerts.length * 100}%` 
                  }}
                >
                  {dailyAlerts.map((alert, idx) => (
                    <Box
                      key={idx}
                      sx={{ 
                        width: `${100 / dailyAlerts.length}%`, 
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
                        <Typography variant="h3" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 800, mb: 3, fontSize: { xs: '2rem', md: '2.8rem' }, lineHeight: 1.1, color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)', letterSpacing: '-0.02em' }}>
                          {alert?.title}
                        </Typography>
                        {alert?.link && (
                          <Button 
                            variant="contained" 
                            component={Link} 
                            href={alert.link}
                            endIcon={<ArrowForwardIcon />}
                            sx={{ 
                              fontFamily: 'var(--font-quicksand)',
                              bgcolor: '#ffffff', 
                              color: '#0f172a', 
                              fontWeight: 700, 
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
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p: 4, textAlign: 'center', background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)' }}>
                  <Box sx={{ width: 72, height: 72, borderRadius: '24px', bgcolor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, boxShadow: '0 15px 35px -5px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)', border: '1px solid rgba(0,0,0,0.04)', transform: 'rotate(-5deg)' }}>
                    <CalendarMonthIcon sx={{ fontSize: 36, color: '#94a3b8' }} />
                  </Box>
                  <Typography sx={{ fontFamily: 'var(--font-dosis)', color: '#0f172a', fontSize: '1.8rem', fontWeight: 800, mb: 1.5, letterSpacing: '-0.02em' }}>No Scheduled Events</Typography>
                  <Typography sx={{ fontFamily: 'var(--font-ysabeau-infant)', color: '#64748b', fontSize: '1rem', fontWeight: 700, maxWidth: 300, lineHeight: 1.6 }}>Your briefing is clear for today. Kick back, or explore the ecosystem.</Typography>
                </Box>
              )}
              
              {/* Beaded line at bottom */}
              {dailyAlerts.length > 1 && !isLoading && (
                <Box sx={{ position: 'absolute', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 1, zIndex: 10 }}>
                  {dailyAlerts.map((_, idx) => (
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
            </AnimatePresence>
          </Box>
        </Box>

        {/* RIGHT: Ecosystem Categories & Quick Actions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0, pb: { xs: 2, lg: 0 } }}>
            {/* Header removed */}
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
                  p: { xs: 1.5, sm: 2.5 },
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: '1px solid rgba(0,0,0,0.03)',
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  position: 'relative',
                  '&:hover': {
                    borderColor: `${cat.color}40`,
                    transform: { lg: 'translateX(-8px) scale(1.02)' },
                    boxShadow: `-15px 15px 30px ${cat.color}15, inset 0 1px 0 rgba(255,255,255,1)`
                  }
                }}
              >
                <Box sx={{ width: { xs: 44, sm: 52 }, height: { xs: 44, sm: 52 }, borderRadius: '16px', bgcolor: `${cat.color}10`, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: { xs: '1.25rem', sm: '1.5rem' }, boxShadow: `inset 0 0 0 1px ${cat.color}20`, flexShrink: 0 }}>
                    {cat.icon}
                </Box>
                {/* Text Details */}
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, ml: 2, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontFamily: 'var(--font-ysabeau-infant)', fontWeight: 700, fontSize: { xs: '0.95rem', sm: '1.15rem' }, color: '#0f172a', lineHeight: 1.2 }}>
                      {cat.label}
                    </Typography>
                    {cat.newCount > 0 && (
                      <Box sx={{ bgcolor: `${cat.color}15`, color: cat.color, px: 0.8, py: 0.2, borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700, fontFamily: 'var(--font-ysabeau-infant)', whiteSpace: 'nowrap' }}>
                        +{cat.newCount} NEW
                      </Box>
                    )}
                    {cat.isLive && (
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444', flexShrink: 0, animation: `${pulseAnimation} 1.5s infinite` }} />
                    )}
                  </Box>
                  <Typography sx={{ fontFamily: 'var(--font-ysabeau-infant)', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.85rem' }, color: '#64748b', mt: 0.25 }}>
                    {cat.count} - total
                  </Typography>
                </Box>
                <Box sx={{ width: { xs: 24, sm: 32 }, height: { xs: 24, sm: 32 }, borderRadius: '50%', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}>
                  <ArrowForwardIosIcon sx={{ color: '#94a3b8', fontSize: { xs: '0.7rem', sm: '0.9rem' } }} />
                </Box>
              </Box>
            ))}

            {/* Premium Gateway to Society (Light/Elegant Redesign) */}
            <Box
              component="a"
              href="http://foodnerve.org"
              sx={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: { xs: 2, sm: 2.5 },
                borderRadius: '20px',
                background: 'linear-gradient(270deg, #f0fdf4, #ccfbf1, #f0fdf4, #ecfeff)',
                backgroundSize: '300% 300%',
                animation: 'gradientMove 12s ease infinite',
                border: '1px solid rgba(16, 185, 129, 0.15)',
                boxShadow: '0 10px 30px -10px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255,255,255,0.9)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden',
                '@keyframes gradientMove': {
                  '0%': { backgroundPosition: '0% 50%' },
                  '50%': { backgroundPosition: '100% 50%' },
                  '100%': { backgroundPosition: '0% 50%' },
                },
                '&:hover': {
                  transform: { lg: 'translateX(-8px) scale(1.02)' },
                  boxShadow: '-15px 15px 30px rgba(16, 185, 129, 0.25)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 2.5 }, position: 'relative', zIndex: 1 }}>
                <Box sx={{ width: { xs: 44, sm: 52 }, height: { xs: 44, sm: 52 }, borderRadius: '16px', bgcolor: '#ffffff', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: { xs: '1.25rem', sm: '1.5rem' }, boxShadow: '0 4px 12px rgba(16,185,129,0.1)', flexShrink: 0 }}>
                  🌍
                </Box>
                {/* Text Details */}
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, ml: 2 }}>
                  <Typography sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 800, fontSize: { xs: '1.1rem', sm: '1.3rem' }, color: '#064e3b', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                    Join the Society
                  </Typography>
                  <Typography sx={{ fontFamily: 'var(--font-ysabeau-infant)', fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.85rem' }, color: '#059669', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981', display: 'inline-block', animation: `${pulseAnimation} 2s infinite` }} />
                    14,204 Operators in
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 }, borderRadius: '50%', bgcolor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', position: 'relative', zIndex: 1, boxShadow: '0 2px 8px rgba(16,185,129,0.1)' }}>
                <ArrowForwardIcon sx={{ color: '#059669', fontSize: { xs: '0.9rem', sm: '1.1rem' } }} />
              </Box>
            </Box>
          </Box>

        </Box>
      </Container>
    </Box>
  );
}
