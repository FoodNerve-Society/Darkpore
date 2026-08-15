'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Button, IconButton, keyframes, alpha, Dialog, DialogContent, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CloseIcon from '@mui/icons-material/Close';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import Link from 'next/link';
import EcosystemCalendar from '@/app/components/calendar/EcosystemCalendar';

interface CommandCenterHeroProps {
  globalAlerts?: any[];
  stats?: {
    articles: number;
    livestreams: number;
    jobs: number;
    missions: number;
    users?: number;
  };
}

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

const blob1 = keyframes`
  0% { transform: translate(0%, 0%) scale(1) rotate(0deg); }
  33% { transform: translate(30%, -20%) scale(1.2) rotate(90deg); }
  66% { transform: translate(-20%, 20%) scale(0.9) rotate(180deg); }
  100% { transform: translate(0%, 0%) scale(1) rotate(360deg); }
`;

const blob2 = keyframes`
  0% { transform: translate(0%, 0%) scale(1) rotate(0deg); }
  33% { transform: translate(-30%, 20%) scale(1.1) rotate(-90deg); }
  66% { transform: translate(20%, -20%) scale(0.9) rotate(-180deg); }
  100% { transform: translate(0%, 0%) scale(1) rotate(-360deg); }
`;

const blob3 = keyframes`
  0% { transform: translate(0%, 0%) scale(1) rotate(0deg); }
  33% { transform: translate(20%, 30%) scale(1.3) rotate(45deg); }
  66% { transform: translate(-30%, -20%) scale(0.8) rotate(135deg); }
  100% { transform: translate(0%, 0%) scale(1) rotate(360deg); }
`;

const blob4 = keyframes`
  0% { transform: translate(0%, 0%) scale(1) rotate(0deg); }
  33% { transform: translate(-20%, -30%) scale(0.8) rotate(-45deg); }
  66% { transform: translate(30%, 20%) scale(1.2) rotate(-135deg); }
  100% { transform: translate(0%, 0%) scale(1) rotate(-360deg); }
`;

const iconPulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 0.8; filter: drop-shadow(0 0 2px currentColor); }
  50% { transform: scale(1.15); opacity: 1; filter: drop-shadow(0 0 8px currentColor); }
  100% { transform: scale(1); opacity: 0.8; filter: drop-shadow(0 0 2px currentColor); }
`;

export default function CommandCenterHero({ globalAlerts = [], stats }: CommandCenterHeroProps) {
  const CATEGORIES = [
    { id: 'lane-articles', label: 'Articles', icon: '📝', color: '#3b82f6', count: stats?.articles || 0, newCount: stats ? 0 : 0 },
    { id: 'lane-livestreams', label: 'Livestreams', icon: '🎥', color: '#f59e0b', count: stats?.livestreams || 0, newCount: stats ? 0 : 0, isLive: stats?.livestreams ? stats.livestreams > 0 : false },
    { id: 'lane-jobs', label: 'Jobs & Internships', icon: '💼', color: '#10b981', count: stats?.jobs || 0, newCount: stats ? 0 : 0 },
    { id: 'lane-missions', label: 'Missions', icon: '🎯', color: '#ec4899', count: stats?.missions || 0, newCount: stats ? 0 : 0 },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [realHour, setRealHour] = useState<number>(12);
  const [hasMounted, setHasMounted] = useState(false);
  const [typingText, setTypingText] = useState("Welcome,");

  useEffect(() => {
    setRealHour(new Date().getHours());
    setHasMounted(true);
    const timer = setInterval(() => {
      setRealHour(new Date().getHours());
    }, 60000); // Check every minute
    return () => clearInterval(timer);
  }, []);

  const [dailyAlerts, setDailyAlerts] = useState<any[]>(globalAlerts || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const theme = useTheme();

  // Parse URL params for calendar on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && (window.location.pathname === '/calendar' || window.location.pathname === '/innovations/calendar')) {
      setIsCalendarOpen(true);
    }
  }, []);

  const openCalendar = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsCalendarOpen(true);
    // When running locally under /innovations, use that path so reload works
    const isLocalInnovations = typeof window !== 'undefined' && window.location.pathname.startsWith('/innovations');
    window.history.pushState(null, '', isLocalInnovations ? '/innovations/calendar' : '/calendar');
  };

  const closeCalendar = () => {
    setIsCalendarOpen(false);
    const isLocalInnovations = typeof window !== 'undefined' && window.location.pathname.startsWith('/innovations');
    window.history.pushState(null, '', isLocalInnovations ? '/innovations' : '/');
  };

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

  const currentHour = realHour;
  let themeConfig = {
    gradient: 'radial-gradient(at 0% 0%, #ffffff 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(16, 185, 129, 0.1) 0px, transparent 50%)',
    mesh: 'radial-gradient(at 0% 0%, #ffffff 0px, transparent 50%)',
    glassBg: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.8)',
    shadowColor: 'rgba(16, 185, 129, 0.1)',
    greeting: 'Good Day',
    Icon: WbSunnyIcon,
    iconColor: '#10b981'
  };

  if (currentHour >= 5 && currentHour < 12) {
    themeConfig = {
      gradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)',
      mesh: 'radial-gradient(at 0% 0%, #fef3c7 0px, transparent 50%), radial-gradient(at 100% 0%, #fffbeb 0px, transparent 50%), radial-gradient(at 100% 100%, #fcd34d 0px, transparent 50%), radial-gradient(at 0% 100%, #fde68a 0px, transparent 50%)',
      glassBg: 'rgba(255, 255, 255, 0.65)',
      glassBorder: 'rgba(255, 255, 255, 0.9)',
      shadowColor: 'rgba(245, 158, 11, 0.15)',
      greeting: 'Good Morning',
      Icon: WbTwilightIcon,
      iconColor: '#f59e0b'
    };
  } else if (currentHour >= 12 && currentHour < 18) {
    themeConfig = {
      gradient: 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 50%, #a7f3d0 100%)',
      mesh: 'radial-gradient(at 0% 0%, #d1fae5 0px, transparent 50%), radial-gradient(at 100% 0%, #f0fdf4 0px, transparent 50%), radial-gradient(at 100% 100%, #6ee7b7 0px, transparent 50%), radial-gradient(at 0% 100%, #a7f3d0 0px, transparent 50%)',
      glassBg: 'rgba(255, 255, 255, 0.65)',
      glassBorder: 'rgba(255, 255, 255, 0.9)',
      shadowColor: 'rgba(16, 185, 129, 0.15)',
      greeting: 'Good Afternoon',
      Icon: WbSunnyIcon,
      iconColor: '#10b981'
    };
  } else {
    themeConfig = {
      gradient: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)',
      mesh: 'radial-gradient(at 0% 0%, #c7d2fe 0px, transparent 50%), radial-gradient(at 100% 0%, #e0e7ff 0px, transparent 50%), radial-gradient(at 100% 100%, #818cf8 0px, transparent 50%), radial-gradient(at 0% 100%, #a5b4fc 0px, transparent 50%)',
      glassBg: 'rgba(255, 255, 255, 0.55)',
      glassBorder: 'rgba(255, 255, 255, 0.7)',
      shadowColor: 'rgba(79, 70, 229, 0.25)',
      greeting: 'Good Evening',
      Icon: DarkModeIcon,
      iconColor: '#4f46e5'
    };
  }

  // Handle typing animation for the greeting
  useEffect(() => {
    if (!hasMounted) return;

    let isCancelled = false;
    let currentText = "Welcome,";
    setTypingText(currentText);

    const greeting = themeConfig.greeting;

    const runSequence = async () => {
      const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

      // Phase 1: Pause on initial text
      await wait(800);
      if (isCancelled) return;

      // Phase 2: Add space and type greeting
      currentText += " ";
      setTypingText(currentText);
      await wait(60);

      for (let i = 0; i < greeting.length; i++) {
        if (isCancelled) return;
        currentText += greeting[i];
        setTypingText(currentText);
        await wait(60);
      }

      // Phase 3: Pause on full text
      await wait(600);
      if (isCancelled) return;

      // Phase 4: Delete "Welcome, " from the left
      while (currentText.length > greeting.length) {
        if (isCancelled) return;
        currentText = currentText.slice(1);
        setTypingText(currentText);
        await wait(30);
      }
    };

    runSequence();

    return () => {
      isCancelled = true;
    };
  }, [hasMounted, themeConfig.greeting]);

  // Calculate opacities for smooth background crossfading
  const isMorning = hasMounted && (currentHour >= 5 && currentHour < 12);
  const isAfternoon = hasMounted && (currentHour >= 12 && currentHour < 18);
  const isEvening = hasMounted && (currentHour >= 18 || currentHour < 5);

  const societyTheme = React.useMemo(() => {
    if (!hasMounted) {
      // Neutral elegant slate for SSR and pre-hydration to avoid color flashing
      return {
        bg: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
        hoverBg: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
        shadow: 'rgba(148, 163, 184, 0.2)',
        hoverShadow: 'rgba(148, 163, 184, 0.4)'
      };
    }
    if (isMorning) {
      // Minority color for morning is Rose
      return {
        bg: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
        hoverBg: 'linear-gradient(135deg, #be123c 0%, #9f1239 100%)',
        shadow: 'rgba(190, 18, 60, 0.4)',
        hoverShadow: 'rgba(190, 18, 60, 0.6)'
      };
    }
    if (isAfternoon) {
      // Minority color for afternoon is Cyan
      return {
        bg: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
        hoverBg: 'linear-gradient(135deg, #0e7490 0%, #155e75 100%)',
        shadow: 'rgba(14, 116, 144, 0.4)',
        hoverShadow: 'rgba(14, 116, 144, 0.6)'
      };
    }
    // Evening - Minority color is Pink
    return {
      bg: 'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
      hoverBg: 'linear-gradient(135deg, #be185d 0%, #9d174d 100%)',
      shadow: 'rgba(190, 24, 93, 0.4)',
      hoverShadow: 'rgba(190, 24, 93, 0.6)'
    };
  }, [isMorning, isAfternoon, isEvening]);

  return (
    <Box sx={{ minHeight: '80vh', color: '#0f172a', pt: { xs: 12, md: 16 }, pb: 8, position: 'relative', overflow: 'hidden' }}>
      {/* Dynamic Ambient Mesh Backgrounds (Crossfading) */}
      
      {/* Morning Background (Amber, Peach, Rose) */}
      <Box sx={{ 
        position: 'absolute', inset: 0, 
        bgcolor: '#fffbeb',
        zIndex: 0,
        opacity: isMorning ? 1 : 0,
        transition: 'opacity 3s ease-in-out',
        overflow: 'hidden',
        maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
      }}>
        <Box sx={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '60%', bgcolor: '#fde68a', opacity: 0.25, borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', filter: 'blur(90px)', animation: `${blob1} 15s infinite alternate ease-in-out` }} />
        <Box sx={{ position: 'absolute', top: '10%', right: '-10%', width: '50%', height: '50%', bgcolor: '#fda4af', opacity: 0.25, borderRadius: '60% 40% 30% 70% / 50% 60% 40% 50%', filter: 'blur(90px)', animation: `${blob2} 18s infinite alternate ease-in-out` }} />
        <Box sx={{ position: 'absolute', bottom: '-20%', left: '10%', width: '60%', height: '60%', bgcolor: '#fdba74', opacity: 0.25, borderRadius: '30% 70% 50% 50% / 60% 40% 60% 40%', filter: 'blur(90px)', animation: `${blob3} 20s infinite alternate ease-in-out` }} />
        <Box sx={{ position: 'absolute', top: '20%', left: '30%', width: '40%', height: '40%', bgcolor: '#fef08a', opacity: 0.25, borderRadius: '50%', filter: 'blur(90px)', animation: `${blob4} 16s infinite alternate ease-in-out` }} />
      </Box>

      {/* Afternoon Background (Emerald, Teal, Cyan) */}
      <Box sx={{ 
        position: 'absolute', inset: 0, 
        bgcolor: '#f0fdf4',
        zIndex: 0,
        opacity: isAfternoon ? 1 : 0,
        transition: 'opacity 3s ease-in-out',
        overflow: 'hidden',
        maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
      }}>
        <Box sx={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '60%', bgcolor: '#a7f3d0', opacity: 0.25, borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', filter: 'blur(90px)', animation: `${blob1} 15s infinite alternate ease-in-out` }} />
        <Box sx={{ position: 'absolute', top: '10%', right: '-10%', width: '50%', height: '50%', bgcolor: '#67e8f9', opacity: 0.25, borderRadius: '60% 40% 30% 70% / 50% 60% 40% 50%', filter: 'blur(90px)', animation: `${blob2} 18s infinite alternate ease-in-out` }} />
        <Box sx={{ position: 'absolute', bottom: '-20%', left: '10%', width: '60%', height: '60%', bgcolor: '#99f6e4', opacity: 0.25, borderRadius: '30% 70% 50% 50% / 60% 40% 60% 40%', filter: 'blur(90px)', animation: `${blob3} 20s infinite alternate ease-in-out` }} />
        <Box sx={{ position: 'absolute', top: '20%', left: '30%', width: '40%', height: '40%', bgcolor: '#bef264', opacity: 0.15, borderRadius: '50%', filter: 'blur(90px)', animation: `${blob4} 16s infinite alternate ease-in-out` }} />
      </Box>

      {/* Evening Background (Indigo, Purple, Pink, Sky Blue) */}
      <Box sx={{ 
        position: 'absolute', inset: 0, 
        bgcolor: '#e0e7ff',
        zIndex: 0,
        opacity: isEvening ? 1 : 0,
        transition: 'opacity 3s ease-in-out',
        overflow: 'hidden',
        maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
      }}>
        <Box sx={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '60%', bgcolor: '#a5b4fc', opacity: 0.25, borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', filter: 'blur(90px)', animation: `${blob1} 15s infinite alternate ease-in-out` }} />
        <Box sx={{ position: 'absolute', top: '10%', right: '-10%', width: '50%', height: '50%', bgcolor: '#c084fc', opacity: 0.25, borderRadius: '60% 40% 30% 70% / 50% 60% 40% 50%', filter: 'blur(90px)', animation: `${blob2} 18s infinite alternate ease-in-out` }} />
        <Box sx={{ position: 'absolute', bottom: '-20%', left: '10%', width: '60%', height: '60%', bgcolor: '#f472b6', opacity: 0.25, borderRadius: '30% 70% 50% 50% / 60% 40% 60% 40%', filter: 'blur(90px)', animation: `${blob3} 20s infinite alternate ease-in-out` }} />
        <Box sx={{ position: 'absolute', top: '20%', left: '30%', width: '40%', height: '40%', bgcolor: '#38bdf8', opacity: 0.15, borderRadius: '50%', filter: 'blur(90px)', animation: `${blob4} 16s infinite alternate ease-in-out` }} />
      </Box>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        
        {/* SPLIT LAYOUT */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '8fr 4fr' }, gap: 4, alignItems: 'stretch' }}>
          
          {/* LEFT: Controls & Wide Slideshow */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: 'relative' }}>
            
          {/* Header Area — Greeting Left, Controls Right */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
            {/* Left: Greeting + Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  color: themeConfig.iconColor, 
                  display: 'flex', 
                  alignItems: 'center', 
                  opacity: hasMounted ? 1 : 0,
                  transition: 'opacity 1s ease',
                  animation: hasMounted ? `${iconPulseAnimation} 4s ease-in-out infinite` : 'none' 
                }}>
                  <themeConfig.Icon fontSize="small" />
                </Box>
                <Typography sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 700, color: '#0f172a', fontSize: { xs: '1.2rem', md: '1.6rem' }, letterSpacing: '-0.01em', whiteSpace: 'nowrap', display: 'inline-block', minWidth: '200px' }}>
                  {typingText}
                </Typography>
              </Box>
              
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
            <Box sx={{ 
              display: 'flex', alignItems: 'center', gap: 0.5,
              bgcolor: themeConfig.glassBg,
              backdropFilter: 'blur(16px)',
              border: `1px solid ${themeConfig.glassBorder}`,
              borderRadius: '999px',
              px: 1, py: 0.5,
              boxShadow: `0 4px 12px ${themeConfig.shadowColor}`
            }}>
              <IconButton 
                onClick={() => {
                  const prev = new Date(currentDate);
                  prev.setDate(prev.getDate() - 1);
                  setCurrentDate(prev);
                }}
                sx={{ color: '#64748b', '&:hover': { color: '#0f172a', bgcolor: 'rgba(0,0,0,0.04)' }, width: 34, height: 34 }}
              >
                <ArrowBackIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
              
              <Typography sx={{ fontFamily: 'var(--font-ysabeau-infant)', fontWeight: 700, color: '#475569', fontSize: { xs: '0.75rem', sm: '0.85rem' }, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap', mx: 0.5 }}>
                {currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </Typography>
              
              <IconButton 
                onClick={() => {
                  const next = new Date(currentDate);
                  next.setDate(next.getDate() + 1);
                  setCurrentDate(next);
                }}
                sx={{ color: '#64748b', '&:hover': { color: '#0f172a', bgcolor: 'rgba(0,0,0,0.04)' }, width: 34, height: 34 }}
              >
                <ArrowForwardIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
              
              <Box sx={{ width: '1px', height: 18, bgcolor: 'rgba(0,0,0,0.08)', mx: 0.5 }} />
              
              <IconButton 
                onClick={openCalendar}
                sx={{ color: themeConfig.iconColor, '&:hover': { bgcolor: alpha(themeConfig.iconColor, 0.08) }, width: 34, height: 34 }}
              >
                <CalendarMonthIcon sx={{ fontSize: '1.1rem' }} />
              </IconButton>
            </Box>
          </Box>

            <Box sx={{ 
              position: 'relative', 
              borderRadius: '28px', 
              overflow: 'hidden', 
              bgcolor: themeConfig.glassBg, 
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: `1px solid ${themeConfig.glassBorder}`,
              minHeight: { xs: '450px', md: '550px' },
              display: 'flex',
              flexDirection: 'column',
              boxShadow: `0 25px 50px -12px ${themeConfig.shadowColor}, 0 0 0 1px rgba(0,0,0,0.02)`,
              flexGrow: 1,
              transition: 'all 1s ease'
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
                  <Typography sx={{ fontFamily: 'var(--font-ysabeau-infant)', color: '#64748b', fontSize: '1rem', fontWeight: 700, maxWidth: 300, lineHeight: 1.6 }}>
                    Get notified on future events{' '}
                    <Box 
                      component="span" 
                      onClick={() => window.dispatchEvent(new Event('open-capture-modal'))}
                      sx={{ color: themeConfig.iconColor, cursor: 'pointer', textDecoration: 'underline', '&:hover': { opacity: 0.8 } }}
                    >
                      here
                    </Box>
                    .
                  </Typography>
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
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: '1fr' }, 
              gap: { xs: 1.5, sm: 2, lg: 3 } 
            }}>
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
                    background: themeConfig.glassBg,
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: `1px solid ${themeConfig.glassBorder}`,
                    boxShadow: `0 10px 30px -10px ${themeConfig.shadowColor}, inset 0 1px 0 rgba(255,255,255,0.8)`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    flexShrink: 0,
                    position: 'relative',
                    '&:hover': {
                      borderColor: `${cat.color}40`,
                      background: '#ffffff',
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
                      <Box sx={{ bgcolor: `${cat.color}15`, color: cat.color, px: 0.8, py: 0.2, borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700, fontFamily: 'var(--font-ysabeau-infant)', whiteSpace: 'nowrap' }}>
                        +{cat.newCount || 0} NEW
                      </Box>
                      {cat.isLive && (
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444', flexShrink: 0, animation: `${pulseAnimation} 1.5s infinite` }} />
                      )}
                    </Box>
                    <Typography sx={{ fontFamily: 'var(--font-ysabeau-infant)', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.85rem' }, color: '#64748b', mt: 0.25 }}>
                      {cat.count} total
                    </Typography>
                  </Box>
                  <Box sx={{ width: { xs: 24, sm: 32 }, height: { xs: 24, sm: 32 }, borderRadius: '50%', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}>
                    <ArrowForwardIosIcon sx={{ color: '#94a3b8', fontSize: { xs: '0.7rem', sm: '0.9rem' } }} />
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Premium Gateway to Society (Bold Emerald Redesign) */}
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
                background: societyTheme.bg,
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: `0 10px 30px -10px ${societyTheme.shadow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                transition: hasMounted ? 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                cursor: 'pointer',
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: { lg: 'translateX(-8px) scale(1.02)' },
                  boxShadow: `-15px 15px 30px ${societyTheme.hoverShadow}`,
                  background: societyTheme.hoverBg,
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 2.5 }, position: 'relative', zIndex: 1 }}>
                <Box sx={{ width: { xs: 44, sm: 52 }, height: { xs: 44, sm: 52 }, borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: { xs: '1.25rem', sm: '1.5rem' }, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flexShrink: 0, backdropFilter: 'blur(10px)' }}>
                  🌍
                </Box>
                {/* Text Details */}
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, ml: 2, overflow: 'hidden' }}>
                  <Typography sx={{ fontFamily: 'var(--font-ysabeau-infant)', fontWeight: 800, fontSize: { xs: '1rem', sm: '1.25rem' }, color: '#ffffff', lineHeight: 1.2 }}>
                    Join The Society
                  </Typography>
                  <Typography sx={{ fontFamily: 'var(--font-ysabeau-infant)', fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.9rem' }, color: 'rgba(255,255,255,0.8)', mt: 0.25, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#34d399', display: 'inline-block', animation: `${pulseAnimation} 2s infinite` }} />
                    {new Intl.NumberFormat('en-US').format(stats?.users ?? 0)} Operators in
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 }, borderRadius: '50%', bgcolor: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', position: 'relative', zIndex: 1, backdropFilter: 'blur(10px)' }}>
                <ArrowForwardIcon sx={{ color: '#ffffff', fontSize: { xs: '0.9rem', sm: '1.1rem' } }} />
              </Box>
            </Box>
          </Box>

        </Box>
      </Container>

      {/* CALENDAR MODAL */}
      <Dialog 
        open={isCalendarOpen} 
        onClose={closeCalendar}
        maxWidth="lg"
        slotProps={{
          paper: {
            sx: {
              width: '90vw', height: '90vh', maxWidth: 'none', maxHeight: 'none',
              borderRadius: 6, bgcolor: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(32px)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.5)', overflow: 'hidden'
            }
          },
          backdrop: { sx: { backdropFilter: 'blur(4px)', backgroundColor: alpha('#000', 0.4) } }
        }}
      >
        <Box sx={{ position: 'absolute', right: 16, top: 16, zIndex: 10, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box id="calendar-header-actions" />
          <IconButton 
            onClick={closeCalendar}
            sx={{ 
              bgcolor: 'rgba(0,0,0,0.05)', '&:hover': { bgcolor: 'rgba(0,0,0,0.1)', transform: 'rotate(90deg)' },
              transition: 'all 0.2s ease'
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ mb: 2, pl: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CalendarMonthIcon sx={{ color: themeConfig.iconColor, fontSize: 32 }} /> Ecosystem Calendar
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500, mt: 0.5 }}>
              Explore deadlines, livestreams, and events across the network.
            </Typography>
          </Box>
          <EcosystemCalendar tenantId="foodnerve" initialView="week" initialDate={currentDate} themeColor={themeConfig.iconColor} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
