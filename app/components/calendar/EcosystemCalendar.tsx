'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, IconButton, Button, alpha, useTheme, ToggleButtonGroup, ToggleButton, TextField, MenuItem, CircularProgress, LinearProgress, Divider } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import { getCalendarEvents } from '@/app/actions/calendar';
import { getMatrixForWeekClient, getCommodityBiddingLeaderboard, placeCommodityBid } from '@/lib/actions/matrix';
import { CalendarEvent } from '@prisma/client';
import AddEventSidebar from './AddEventSidebar';
import { useSociety } from '@/context/SocietyContext';
import { commoditiesList } from '@/lib/cms/commodities';

export type ViewMode = 'month' | 'week' | 'day';

interface EcosystemCalendarProps {
  tenantId: string;
  initialView?: ViewMode;
  initialDate?: Date;
  themeColor?: string;
}

export default function EcosystemCalendar({ tenantId, initialView = 'week', initialDate, themeColor }: EcosystemCalendarProps) {
  const theme = useTheme();
  const primaryColor = themeColor || theme.palette.primary.main;
  const { profile: user } = useSociety();
  
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  // Matrix State
  const [activeCommodity, setActiveCommodity] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [biddingCommodity, setBiddingCommodity] = useState<string>('');
  const [biddingAmount, setBiddingAmount] = useState<number>(0);
  const [isBidding, setIsBidding] = useState(false);
  const [isAccordionExpanded, setIsAccordionExpanded] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [slideDirection, setSlideDirection] = useState<number>(1);
  const [headerPortal, setHeaderPortal] = useState<HTMLElement | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setHeaderPortal(document.getElementById('calendar-header-actions'));
    }
  }, []);

  // Sync state to URL without full navigation
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', viewMode);
      
      // Extract exact local YYYY-MM-DD to prevent timezone shifting from toISOString()
      const y = currentDate.getFullYear();
      const m = String(currentDate.getMonth() + 1).padStart(2, '0');
      const d = String(currentDate.getDate()).padStart(2, '0');
      
      url.searchParams.set('date', `${y}-${m}-${d}`);
      window.history.replaceState(null, '', url.toString());
    } catch (e) {}
  }, [viewMode, currentDate]);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      try {
        const data = await getCalendarEvents(tenantId);
        
        // Inject mock data for visualization
        const today = currentDate; // use currentDate so mocks always appear in current view
        const y = today.getFullYear();
        const m = today.getMonth();
        const mockEvents: any[] = [
          { id: 'm1', title: 'Ecosystem Launch Broadcast', date: new Date(y, m, today.getDate() + 1, 10, 0), endDate: new Date(y, m, today.getDate() + 1, 12, 0), visibility: 'society', category: 'Livestream', organizationName: 'FoodNerve HQ', dateType: 'START_TIME' },
          { id: 'm2', title: 'Agro Investor Deal Room', date: new Date(y, m, today.getDate() + 2, 14, 0), endDate: new Date(y, m, today.getDate() + 2, 18, 0), visibility: 'organization', category: 'Networking', organizationName: 'Darkpore', dateType: 'DATE_RANGE' },
          { id: 'm3', title: 'Farm Grant Applications Due', date: new Date(y, m, today.getDate() + 2, 23, 59), visibility: 'society', category: 'Deadline', organizationName: 'Gov', dateType: 'DEADLINE' },
          { id: 'm4', title: 'Supply Chain Q&A', date: new Date(y, m, today.getDate() + 5, 18, 0), visibility: 'organization', category: 'Q&A', organizationName: 'Community', dateType: 'START_TIME' },
          { id: 'm5', title: 'Quarterly Report Published', date: new Date(y, m, today.getDate(), 9, 30), visibility: 'personal', category: 'Article', organizationName: 'Self', dateType: 'PUBLISH_DATE' },
        ];
        
        setEvents([...data, ...mockEvents]);
      } catch (err) {
        console.error("Failed to load events", err);
      }
      setLoading(false);
    }
    loadEvents();
  }, [tenantId, currentDate.getMonth()]); // Wait, if we change months we might need to load. Ideally we load a range.

  // Fetch matrix data for current week and next week bids
  useEffect(() => {
    async function loadMatrixData() {
      try {
        // 1. Get active commodity for the currently viewed date
        const matrixData = await getMatrixForWeekClient(currentDate.toISOString());
        if (matrixData) {
          setActiveCommodity(matrixData.commodity);
        }

        // 2. Load leaderboard for Next Week
        const currentIsoWeek = getWeekNumber(new Date());
        const targetWeek = currentIsoWeek + 1 > 52 ? 1 : currentIsoWeek + 1;
        const targetYear = currentIsoWeek + 1 > 52 ? currentDate.getFullYear() + 1 : currentDate.getFullYear();
        
        const bids = await getCommodityBiddingLeaderboard(targetYear, targetWeek);
        setLeaderboard(bids);
      } catch (err) {
        console.error("Failed to load matrix data", err);
      }
    }
    loadMatrixData();
  }, [currentDate]);

  useEffect(() => {
    if (viewMode === 'week') {
      // Small timeout to ensure DOM has rendered
      setTimeout(() => {
        const activeEl = document.getElementById(`timeline-day-${currentDate.toDateString().replace(/\s+/g, '-')}`);
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [currentDate, viewMode]);

  const handlePlaceBid = async () => {
    if (!user || (user as any).rank < 4) {
      alert("Only Rank 4+ Visionaries can participate.");
      return;
    }
    if (!biddingCommodity || biddingAmount <= 0) {
      alert("Please select a commodity and enter a valid NP amount.");
      return;
    }

    setIsBidding(true);
    const currentIsoWeek = getWeekNumber(new Date());
    const targetWeek = currentIsoWeek + 1 > 52 ? 1 : currentIsoWeek + 1;
    const targetYear = currentIsoWeek + 1 > 52 ? currentDate.getFullYear() + 1 : currentDate.getFullYear();

    const result = await placeCommodityBid(user.uid, targetYear, targetWeek, biddingCommodity, biddingAmount);
    
    if (result.success) {
      setBiddingAmount(0);
      setBiddingCommodity('');
      // Reload leaderboard
      const bids = await getCommodityBiddingLeaderboard(targetYear, targetWeek);
      setLeaderboard(bids);
      alert("Bid placed successfully!");
    } else {
      alert(result.error || "Failed to place bid.");
    }
    setIsBidding(false);
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  const firstDayOfMonthRaw = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const firstDayOfMonth = firstDayOfMonthRaw === 0 ? 6 : firstDayOfMonthRaw - 1;

  const handlePrev = () => {
    setSlideDirection(-1);
    setIsFlipped(false);
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
    if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    setSlideDirection(1);
    setIsFlipped(false);
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
    if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Helper to group events by specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.getDate() === date.getDate() && 
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getIntentColor = (dateType: string | null) => {
    if (dateType === 'PUBLISH_DATE') return '#10b981'; // Green
    if (dateType === 'DEADLINE') return '#ff3366'; // Red
    if (dateType === 'DATE_RANGE') return '#8b5cf6'; // Purple
    return '#3b82f6'; // Blue (START_TIME / Default)
  };

  const formatTimeSpan = (date: Date, endDate?: Date) => {
    const start = new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!endDate) return start;
    const end = new Date(endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Check if it's an all-day event (00:00 to 23:59)
    if (start.includes('12:00 AM') && end.includes('11:59 PM')) {
      return 'All Day';
    }
    // Also support 24-hour format checks
    if (start.includes('00:00') && end.includes('23:59')) {
      return 'All Day';
    }

    return `${start} - ${end}`;
  };

  const getVisibilityLabel = (visibility: string | null) => {
    if (visibility === 'society') return 'Public Ecosystem';
    if (visibility === 'organization') return 'Organization';
    if (visibility === 'personal') return 'Personal';
    return 'Event';
  };

  const getWeekNumber = (d: Date) => {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // --- RENDER MONTH VIEW ---
  const renderMonthView = () => {
    const totalCells = firstDayOfMonth + daysInMonth;
    const numRows = Math.ceil(totalCells / 7);

    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Header Row: 8 columns (Empty for week number + 7 Days) */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)', gap: 1, mb: 1.5 }}>
          <Box /> {/* Empty cell for week column header */}
          {dayNames.map((day, index) => {
            const isDaySelected = currentDate.getDay() === (index === 6 ? 0 : index + 1);
            return (
              <Box key={day} sx={{ 
                textAlign: 'center', bgcolor: alpha(primaryColor, isDaySelected ? 0.2 : 0.05), 
                py: 0.8, borderRadius: 2, border: `1px solid ${alpha(primaryColor, isDaySelected ? 0.4 : 0.1)}`
              }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {day}
                </Typography>
              </Box>
            );
          })}
        </Box>
        
        {/* Body Grid: 8 columns per row */}
        <Box sx={{ 
          flex: 1, display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)', gridAutoRows: 'minmax(100px, 1fr)', gap: 1, minHeight: 0
        }}>
          {Array.from({ length: numRows }).map((_, rowIndex) => {
            // Find the date for Thursday of this row to determine the ISO week number
            const targetDayNum = (rowIndex * 7 + 3) - firstDayOfMonth + 1; // 3 is Thursday (0-based)
            const refDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), targetDayNum);
            const weekNumber = getWeekNumber(refDate);

            // Check if any day in this row matches currentDate (for highlighting the week)
            let isWeekSelected = false;
            for (let colIndex = 0; colIndex < 7; colIndex++) {
              const cellIndex = rowIndex * 7 + colIndex;
              const day = cellIndex - firstDayOfMonth + 1;
              if (day >= 1 && day <= daysInMonth) {
                const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                if (currentDate.toDateString() === targetDate.toDateString()) {
                  isWeekSelected = true;
                  break;
                }
              }
            }

            return (
              <React.Fragment key={`row-${rowIndex}`}>
                {/* 1. Week Number Cell */}
                <Box 
                  onClick={() => {
                    setCurrentDate(refDate);
                    setViewMode('week');
                  }}
                  sx={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  bgcolor: isWeekSelected ? alpha(primaryColor, 0.15) : 'rgba(0,0,0,0.01)', 
                  borderRadius: 2, 
                  border: isWeekSelected ? `1px solid ${alpha(primaryColor, 0.4)}` : '1px dashed rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: alpha(primaryColor, 0.1), transform: 'scale(1.05)', borderColor: alpha(primaryColor, 0.3) }
                }}>
                  <Typography sx={{ 
                    fontWeight: 900, 
                    color: isWeekSelected ? primaryColor : '#94a3b8', 
                    fontSize: '0.75rem', 
                    textTransform: 'uppercase', letterSpacing: '0.05em', transform: 'rotate(-90deg)',
                    pointerEvents: 'none'
                  }}>
                    W{weekNumber}
                  </Typography>
                </Box>
                
                {/* 2. Seven Day Cells */}
                {Array.from({ length: 7 }).map((_, colIndex) => {
                  const cellIndex = rowIndex * 7 + colIndex;
                  const day = cellIndex - firstDayOfMonth + 1;
                  
                  if (day < 1 || day > daysInMonth) {
                    return <Box key={`empty-${cellIndex}`} sx={{ bgcolor: 'rgba(0,0,0,0.015)', borderRadius: 3 }} />;
                  }

                  const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const isToday = new Date().toDateString() === targetDate.toDateString();
                  const isSelected = currentDate.toDateString() === targetDate.toDateString();
                  const dayEvents = getEventsForDate(targetDate);

                  return (
                    <Box 
                      key={day} 
                      onClick={() => {
                        setCurrentDate(targetDate);
                        setViewMode('day');
                      }}
                      sx={{ 
                        bgcolor: isSelected ? alpha(primaryColor, 0.1) : (isToday ? alpha(primaryColor, 0.05) : 'rgba(255,255,255,0.4)'), 
                        borderRadius: 3, p: 1,
                        border: isSelected ? `2px solid ${primaryColor}` : (isToday ? `1px solid ${alpha(primaryColor, 0.4)}` : '1px solid rgba(0,0,0,0.03)'),
                        boxShadow: isSelected ? `0 0 0 4px ${alpha(primaryColor, 0.2)}` : (isToday ? `0 4px 12px ${alpha(primaryColor, 0.1)}` : '0 2px 8px rgba(0,0,0,0.01)'),
                        backdropFilter: 'blur(8px)',
                        transition: 'all 0.2s ease', cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.8)', transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' },
                        display: 'flex', flexDirection: 'column', overflow: 'hidden',
                        position: isSelected ? 'relative' : 'static',
                        zIndex: isSelected ? 2 : 1
                      }}
                    >
                      <Typography variant="body2" sx={{ 
                        fontFamily: 'var(--font-dosis)',
                        fontWeight: (isToday || isSelected) ? 900 : 700, 
                        color: isSelected ? primaryColor : (isToday ? primaryColor : '#334155'), 
                        mb: 1,
                        fontSize: (isToday || isSelected) ? '1.1rem' : '0.9rem',
                        letterSpacing: '-0.02em'
                      }}>
                        {day}
                      </Typography>
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', '&::-webkit-scrollbar': { display: 'none' } }}>
                        {dayEvents.length > 0 && (
                          <Box sx={{ 
                            bgcolor: tenantId === 'foodnerve' ? alpha(primaryColor, 0.15) : alpha('#10b981', 0.15), 
                            px: 1, py: 0.5, borderRadius: 3, textAlign: 'center',
                            boxShadow: `0 4px 12px ${tenantId === 'foodnerve' ? alpha(primaryColor, 0.2) : alpha('#10b981', 0.2)}`,
                            backdropFilter: 'blur(4px)',
                            border: 'none'
                          }}>
                            <Typography variant="caption" sx={{ fontWeight: 900, color: tenantId === 'foodnerve' ? primaryColor : '#10b981', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {dayEvents.length} {tenantId === 'foodnerve' ? (dayEvents.length === 1 ? 'Broadcast' : 'Broadcasts') : (dayEvents.length === 1 ? 'Event' : 'Events')}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </React.Fragment>
            );
          })}
        </Box>
      </Box>
    );
  };

  // --- RENDER WEEK VIEW (2-Pane Accordion) ---
  const renderWeekView = () => {
    const currentDayOfWeekRaw = currentDate.getDay();
    const currentDayOfWeek = currentDayOfWeekRaw === 0 ? 6 : currentDayOfWeekRaw - 1;
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDayOfWeek);

    const weekDates = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });

    return (
      <Box sx={{ flex: 1, display: 'flex', gap: 3, minHeight: 0, flexDirection: { xs: 'column', md: 'row' } }}>
        
        {/* LEFT PANE: 3D Flip Card */}
        <Box sx={{ 
          width: { xs: '100%', md: 350 }, flexShrink: 0, 
          perspective: '1200px',
          display: 'flex', flexDirection: 'column'
        }}>
          {(() => {
            const currentIsoWeek = getWeekNumber(currentTime);
            const nextWeekIndex = currentIsoWeek % 26;
            
            const cyclicCommodities = [
              ...commoditiesList.slice(nextWeekIndex),
              ...commoditiesList.slice(0, nextWeekIndex)
            ];

            const fullList = cyclicCommodities.map((c, idx) => {
              const existing = leaderboard.find(l => l.commodity === c);
              return { ...(existing || { commodity: c, totalNP: 0 }), cyclicIndex: idx };
            }).sort((a, b) => {
              if (b.totalNP !== a.totalNP) return b.totalNP - a.totalNP;
              return a.cyclicIndex - b.cyclicIndex;
            });

            return (
            <Box 
              component={motion.div}
              initial={false}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
              sx={{ flex: 1, position: 'relative', transformStyle: 'preserve-3d' }}
            >
              {/* FRONT FACE: Protocol Card */}
              <Box sx={{
                width: '100%', height: '100%',
                backfaceVisibility: 'hidden',
                pointerEvents: isFlipped ? 'none' : 'auto',
                display: 'flex', flexDirection: 'column', gap: 2, 
                p: 3, borderRadius: 4, 
                bgcolor: '#0f172a', color: 'white',
                position: 'relative', overflow: 'hidden',
                boxShadow: `0 20px 40px ${alpha('#000', 0.2)}`
              }}>
              <Box sx={{ position: 'absolute', top: -100, right: -50, width: 300, height: 300, bgcolor: primaryColor, filter: 'blur(100px)', opacity: 0.3, zIndex: 0 }} />
              
              <Box sx={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                
                {/* COMBINED TOP FLIP TRIGGER CARD */}
                <Box 
                  onClick={() => setIsFlipped(true)}
                  sx={{ 
                    display: 'flex', flexDirection: 'column', gap: 1.5, 
                    cursor: 'pointer',
                    transition: 'all 0.3s', '&:hover': { transform: 'scale(1.02)' }
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </Typography>
                    <Typography variant="h5" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
                      Week {getWeekNumber(currentDate)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="h2" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 900, textTransform: 'uppercase', textShadow: '0 2px 10px rgba(0,0,0,0.5)', lineHeight: 1, letterSpacing: '-0.03em' }}>
                      {activeCommodity || 'SYNCING...'}
                    </Typography>
                  </Box>
                  
                  {user && (user as any).rank >= 4 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                       <Typography variant="caption" sx={{ fontWeight: 800, color: '#ef4444', letterSpacing: '0.05em' }}>TAP TO DEPLOY CAPITAL</Typography>
                       <ArrowForwardIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }} />
                    </Box>
                  )}
                </Box>

                {/* Next Week's War (Leaderboard updates) */}
                <Box sx={{ mt: 'auto', pt: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocalFireDepartmentIcon sx={{ color: '#ef4444' }} />
                    <Typography variant="h6" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 900, color: 'white' }}>
                      Next Week's War
                    </Typography>
                  </Box>
                  
                  {(() => {
                    const now = currentTime;
                    const day = now.getDay();
                    const hours = now.getHours();
                    const isWarActive = (day === 3 && hours >= 12) || day === 4 || day === 5 || day === 6;
                    const isSunday = day === 0;
                    const isMonTueWedMorning = day === 1 || day === 2 || (day === 3 && hours < 12);

                    const getRemainingTimeStr = () => {
                      const target = new Date(now);
                      const daysUntilSaturday = 6 - now.getDay();
                      target.setDate(now.getDate() + daysUntilSaturday);
                      target.setHours(23, 59, 59, 999);
                      
                      const diffMs = target.getTime() - now.getTime();
                      if (diffMs <= 0) return 'Ends soon';
                      
                      const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                      const h = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                      const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                      
                      if (d > 0) return `Ends in ${d}d ${h}h`;
                      if (h > 0) return `Ends in ${h}h ${m}m`;
                      return `Ends in ${m}m`;
                    };

                    if (isSunday) {
                       const nextWeekIndex = getWeekNumber(currentTime) % 26;
                       const lockedCommodity = leaderboard.length > 0 ? leaderboard[0].commodity : commoditiesList[nextWeekIndex];
                       return (
                         <Box>
                           <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}>
                             War Room Closed. Next week's Protocol locked:
                           </Typography>
                           <Box sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: 2, py: 1, px: 2, textAlign: 'center' }}>
                             <Typography variant="body1" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 900, color: '#ef4444' }}>{lockedCommodity}</Typography>
                           </Box>
                         </Box>
                       );
                    }

                    if (isMonTueWedMorning) {
                       const nextWeekIndex = getWeekNumber(currentTime) % 26;
                       const suggestedCommodity = commoditiesList[nextWeekIndex];
                       return (
                         <Box>
                           <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}>
                             Intelligence engine suggestion for next week:
                           </Typography>
                           <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', border: '1px dashed rgba(255,255,255,0.3)', borderRadius: 2, py: 1, px: 2, textAlign: 'center' }}>
                             <Typography variant="body1" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 900, color: 'white' }}>{suggestedCommodity}</Typography>
                             <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block' }}>Pending War Room (Opens Wed 12PM)</Typography>
                           </Box>
                         </Box>
                       );
                    }

                    // isWarActive is true
                    return (
                      <>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
                          Have a say in the protocol for next week. Place your bid below. {getRemainingTimeStr()}.
                        </Typography>

                        {leaderboard.length === 0 ? (
                          <Button 
                            fullWidth
                            variant="outlined"
                            onClick={() => setIsFlipped(true)}
                            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', py: 1.5, borderStyle: 'dashed', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}
                          >
                            NO BIDS PLACED YET
                          </Button>
                        ) : (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                            {leaderboard.slice(0, 3).map((bid, i) => (
                              <Box key={bid.commodity}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: i === 0 ? '#ef4444' : 'white' }}>
                                    #{i + 1} {bid.commodity}
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 800, color: i === 0 ? '#ef4444' : 'rgba(255,255,255,0.5)' }}>
                                    {bid.totalNP.toLocaleString()} NP
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={Math.min((bid.totalNP / 10000) * 100, 100)} 
                                  sx={{ 
                                    height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)',
                                    '& .MuiLinearProgress-bar': { bgcolor: i === 0 ? '#ef4444' : 'rgba(255,255,255,0.3)' }
                                  }} 
                                />
                              </Box>
                            ))}
                          </Box>
                        )}
                      </>
                    );
                  })()}
                </Box>
              </Box>
            </Box>

            {/* BACK FACE: Bidding Form */}
            <Box sx={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backfaceVisibility: 'hidden',
              pointerEvents: isFlipped ? 'auto' : 'none',
              transform: 'rotateY(180deg)',
              display: 'flex', flexDirection: 'column', gap: 2, 
              p: 3, borderRadius: 4, 
              bgcolor: '#0f172a', color: 'white',
              overflow: 'hidden',
              boxShadow: `0 20px 40px ${alpha('#000', 0.2)}`
            }}>
              <Box sx={{ position: 'absolute', bottom: -100, left: -50, width: 300, height: 300, bgcolor: '#ef4444', filter: 'blur(100px)', opacity: 0.2, zIndex: 0 }} />
              <Box sx={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <IconButton size="small" onClick={() => setIsFlipped(false)} sx={{ color: 'white', mr: 2, bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                    <ChevronLeftIcon />
                  </IconButton>
                  <Typography variant="h6" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
                    Deploy Capital
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1, pr: 1 }}>
                   {fullList.map((item, index) => (
                      <Box 
                        key={item.commodity} 
                        onClick={() => setBiddingCommodity(item.commodity)}
                        sx={{ 
                          p: 2, borderRadius: 3, 
                          bgcolor: biddingCommodity === item.commodity ? alpha('#ef4444', 0.2) : 'rgba(255,255,255,0.03)',
                          border: biddingCommodity === item.commodity ? '1px solid #ef4444' : '1px solid transparent',
                          cursor: 'pointer',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          '&:hover': { bgcolor: biddingCommodity === item.commodity ? alpha('#ef4444', 0.2) : 'rgba(255,255,255,0.08)' }
                        }}
                      >
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 900, color: index === 0 && item.totalNP > 0 ? '#ef4444' : 'white' }}>
                              #{index + 1}
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 800, color: 'white', fontFamily: 'var(--font-dosis)' }}>
                              {item.commodity}
                            </Typography>
                         </Box>
                         <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
                            {item.totalNP.toLocaleString()} NP
                         </Typography>
                      </Box>
                   ))}
                </Box>

                {/* Bottom Bidding Action */}
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  {(() => {
                    const now = currentTime;
                    const day = now.getDay();
                    const hours = now.getHours();
                    const isWarActive = (day === 3 && hours >= 12) || day === 4 || day === 5 || day === 6;
                    
                    if (!isWarActive) {
                      return (
                        <Typography variant="caption" sx={{ color: '#ef4444', textAlign: 'center', fontWeight: 800, mt: 1, display: 'block' }}>
                          WAR ROOM OPENS WEDNESDAY 12PM - SATURDAY 11:59PM
                        </Typography>
                      );
                    }

                    if (!biddingCommodity) {
                       return (
                         <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', py: 1 }}>
                           Select a protocol above to deploy capital.
                         </Typography>
                       );
                    }

                    return (
                       <Box sx={{ display: 'flex', gap: 1 }}>
                          <TextField
                            size="small"
                            placeholder="NP Amount"
                            type="number"
                            value={biddingAmount || ''}
                            onChange={(e) => setBiddingAmount(parseInt(e.target.value) || 0)}
                            sx={{ 
                              flex: 1,
                              '& .MuiInputBase-root': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 },
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }
                            }}
                            slotProps={{ htmlInput: { min: 0 } }}
                          />
                          <Button
                            variant="contained"
                            onClick={handlePlaceBid}
                            disabled={isBidding || biddingAmount <= 0}
                            sx={{ 
                              bgcolor: '#ef4444', color: 'white', fontWeight: 800, borderRadius: 2, px: 3, 
                              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                              '&:hover': { bgcolor: '#dc2626', boxShadow: '0 6px 20px rgba(239, 68, 68, 0.6)' },
                              '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }
                            }}
                          >
                            {isBidding ? <CircularProgress size={24} color="inherit" /> : 'DEPLOY'}
                          </Button>
                       </Box>
                    );
                  })()}
                </Box>
              </Box>
            </Box>
            </Box>
            );
          })()}
        </Box>

        {/* RIGHT PANE: 7-Day Accordion */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, overflowY: 'auto', px: 2, pb: 4, minHeight: 0, perspective: '1200px' }}>
          {/* Top Padding for smooth scroll centering */}
          <Box sx={{ height: '5vh', flexShrink: 0 }} />

          {weekDates.map((d, i) => {
            const activeIndex = weekDates.findIndex(date => date.toDateString() === currentDate.toDateString());
            const distance = Math.abs(i - activeIndex);
            
            const isSelected = distance === 0;
            if (viewMode === 'day' && !isSelected) return null;
            
            const isToday = d.toDateString() === new Date().toDateString();
            const dayEvents = getEventsForDate(d);
            const CATEGORY_DISPLAY: Record<number, string> = { 1: 'LAND', 2: 'CAPITAL', 3: 'INPUTS', 4: 'ENERGY', 5: 'INSECURITY', 6: 'LOSS', 0: 'PROTEIN' };
            const matrixCategory = CATEGORY_DISPLAY[d.getDay()];
            
            const showExpanded = (isSelected && isAccordionExpanded) || viewMode === 'day';
            
            // Calculate Cover Flow metrics
            const cardWidth = isSelected ? '100%' : `${Math.max(80, 100 - (distance * 4))}%`;
            const tiltDirection = i < activeIndex ? -1 : 1;
            const tiltDegree = isSelected ? 0 : distance * 2.5 * tiltDirection;
            
            return (
              <Box 
                key={d.toISOString()}
                id={`timeline-day-${d.toDateString().replace(/\s+/g, '-')}`}
                onClick={() => {
                  if (isSelected) {
                    setIsAccordionExpanded(!isAccordionExpanded); // Toggle minimize
                  } else {
                    setCurrentDate(d); // Expand accordion
                    setIsAccordionExpanded(true);
                  }
                }}
                sx={{ 
                  width: cardWidth,
                  mx: 'auto',
                  borderRadius: 4, p: { xs: 2, md: 2.5 }, cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  bgcolor: isSelected ? 'white' : (isToday ? alpha(primaryColor, 0.05) : 'rgba(255,255,255,0.4)'),
                  border: isSelected ? '1px solid rgba(0,0,0,0.04)' : (isToday ? `1px solid ${alpha(primaryColor, 0.3)}` : '1px solid rgba(0,0,0,0.03)'),
                  boxShadow: isSelected ? '0 20px 40px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.02)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex', flexDirection: 'column', gap: showExpanded ? 2.5 : 0,
                  transform: isSelected ? 'scale(1.02)' : `rotateX(${tiltDegree}deg)`,
                  transformOrigin: 'center center',
                  zIndex: 10 - distance,
                  '&:hover': {
                    bgcolor: isSelected ? 'white' : 'rgba(255,255,255,0.7)',
                    transform: isSelected ? 'scale(1.02)' : `rotateX(${tiltDegree * 0.5}deg) translateY(-2px)`
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexShrink: 0 }}>
                    {/* Date Block */}
                    <Box sx={{ 
                      width: 56, height: 56, borderRadius: 3, 
                      bgcolor: isSelected ? primaryColor : (isToday ? alpha(primaryColor, 0.1) : 'rgba(0,0,0,0.03)'), 
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                      color: isSelected ? 'white' : (isToday ? primaryColor : '#334155'),
                      boxShadow: isSelected ? `0 4px 12px ${alpha(primaryColor, 0.4)}` : 'none'
                    }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, lineHeight: 1, mb: 0.2, fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                        {dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1].slice(0,3).toUpperCase()}
                      </Typography>
                      <Typography variant="h5" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 900, lineHeight: 1 }}>
                        {d.getDate()}
                      </Typography>
                    </Box>
                    
                    {/* Category & Status */}
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '0.02em', lineHeight: 1.2 }}>
                        {matrixCategory}
                      </Typography>
                      {isToday && !isSelected && (
                        <Typography variant="caption" sx={{ fontWeight: 800, color: primaryColor, display: 'block' }}>TODAY</Typography>
                      )}
                      {!isSelected && dayEvents.length === 0 && !isToday && (
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#94a3b8' }}>No Events</Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Fading List of things for minimised state */}
                  <AnimatePresence>
                    {!showExpanded && dayEvents.length > 0 && (
                      <Box 
                        component={motion.div}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                        sx={{ 
                          flex: 1, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5, 
                          ml: 3, 
                          mr: 2,
                          overflowX: 'auto',
                          scrollbarWidth: 'none', // hide scrollbar Firefox
                          msOverflowStyle: 'none', // hide scrollbar IE/Edge
                          '&::-webkit-scrollbar': { display: 'none' }, // hide scrollbar Chrome/Safari
                          maskImage: 'linear-gradient(to right, black 80%, transparent 100%)',
                          WebkitMaskImage: 'linear-gradient(to right, black 80%, transparent 100%)'
                        }}
                      >
                        {dayEvents.map(e => {
                          const dotColor = getIntentColor(e.dateType);
                          return (
                            <Box 
                              key={e.id} 
                              component={motion.div}
                              layoutId={`event-card-${e.id}`}
                              sx={{ 
                                display: 'flex', alignItems: 'center', gap: 1.5,
                                bgcolor: alpha(dotColor, 0.05), p: 1, borderRadius: 3, flexShrink: 0,
                                minWidth: 180, height: 60,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                border: `1px solid ${alpha(dotColor, 0.1)}`,
                                backdropFilter: 'blur(10px)'
                              }}
                            >
                              {/* Optional Image Placeholder for premium feel */}
                              <Box 
                                component={motion.div}
                                layoutId={`event-img-${e.id}`}
                                sx={{ 
                                  width: 44, height: 44, borderRadius: 2, 
                                  bgcolor: alpha(dotColor, 0.1),
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  backgroundImage: e.category === 'Livestream' ? 'url(https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80)' : 'none',
                                  backgroundSize: 'cover', backgroundPosition: 'center'
                                }}
                              >
                                {e.category !== 'Livestream' && (
                                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dotColor }} />
                                )}
                              </Box>
                              
                              <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                                <Typography 
                                  component={motion.span} 
                                  layoutId={`event-title-${e.id}`}
                                  variant="caption" 
                                  sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                >
                                  {e.title}
                                </Typography>
                                <Typography 
                                  component={motion.span} 
                                  layoutId={`event-time-${e.id}`}
                                  variant="caption" 
                                  sx={{ fontWeight: 700, color: dotColor, fontSize: '0.65rem', mt: 0.5 }}
                                >
                                  {formatTimeSpan(e.date, e.endDate).split(' ')[0]} {formatTimeSpan(e.date, e.endDate).split(' ')[1]}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </AnimatePresence>
                  
                  <Box sx={{ pl: 2, flexShrink: 0, display: 'flex', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (viewMode === 'day') {
                          setViewMode('week');
                        } else {
                          setCurrentDate(d);
                          setViewMode('day');
                        }
                      }}
                      sx={{ 
                        color: isSelected ? primaryColor : '#cbd5e1', 
                        bgcolor: isSelected ? alpha(primaryColor, 0.1) : 'transparent',
                        opacity: isSelected ? 1 : 0.6,
                        '&:hover': { 
                          bgcolor: isSelected ? alpha(primaryColor, 0.2) : 'rgba(0,0,0,0.05)',
                          opacity: 1
                        }
                      }}
                    >
                      {viewMode === 'day' ? <CloseFullscreenIcon fontSize="small" /> : <OpenInFullIcon fontSize="small" />}
                    </IconButton>
                    <IconButton size="small" sx={{ 
                      color: showExpanded ? 'white' : '#cbd5e1', 
                      bgcolor: showExpanded ? primaryColor : 'transparent',
                      '&:hover': { bgcolor: showExpanded ? primaryColor : 'rgba(0,0,0,0.05)' }
                    }}>
                      {showExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </Box>
                </Box>

                {/* EXPANDED CONTENT (Mini Day View) */}
                <AnimatePresence>
                  {showExpanded && (
                    <Box 
                      component={motion.div}
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 0.5, borderTop: '1px dashed rgba(0,0,0,0.08)', overflow: 'hidden' }}
                    >
                      {dayEvents.length === 0 ? (
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', pt: 1, pl: 1 }}>No events scheduled for this day.</Typography>
                      ) : (
                        dayEvents.slice(0, 5).map(event => {
                          const dotColor = getIntentColor(event.dateType);
                          return (
                            <Box 
                              key={event.id} 
                              component={motion.div}
                              layoutId={`event-card-${event.id}`}
                              sx={{ 
                                bgcolor: alpha(dotColor, 0.08), p: 2.5, borderRadius: 4, 
                                display: 'flex', alignItems: 'center', gap: 3,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                                border: `1px solid ${alpha(dotColor, 0.2)}`,
                                backdropFilter: 'blur(20px)',
                                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                '&:hover': { 
                                  bgcolor: alpha(dotColor, 0.12), 
                                  transform: 'translateY(-2px)',
                                  boxShadow: `0 12px 40px ${alpha(dotColor, 0.2)}`
                                }
                              }}
                            >
                              {/* Premium Time Block */}
                              <Box sx={{ 
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                minWidth: 72, height: 72, borderRadius: 3,
                                bgcolor: alpha(dotColor, 0.08),
                                color: dotColor,
                                position: 'relative'
                              }}>
                                <Box sx={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: '50%', bgcolor: dotColor, boxShadow: `0 0 8px ${dotColor}` }} />
                                <Typography 
                                  component={motion.span} 
                                  layoutId={`event-time-${event.id}`}
                                  variant="h6" 
                                  sx={{ fontWeight: 900, lineHeight: 1.1, fontFamily: 'var(--font-dosis)' }}
                                >
                                  {formatTimeSpan(event.date, event.endDate).split(' ')[0]}
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  {formatTimeSpan(event.date, event.endDate).split(' ')[1] || ''}
                                </Typography>
                              </Box>
                              
                              {/* Premium Content */}
                              <Box sx={{ flex: 1 }}>
                                <Typography 
                                  component={motion.span} 
                                  layoutId={`event-title-${event.id}`}
                                  variant="h6" 
                                  sx={{ fontWeight: 900, color: '#0f172a', mb: 0.5, lineHeight: 1.2, display: 'block' }}
                                >
                                  {event.title}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <LocalFireDepartmentIcon sx={{ fontSize: 14, color: dotColor }} />
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: dotColor, fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                                      {event.dateType?.replace('_', ' ')}
                                    </Typography>
                                  </Box>
                                  {event.category && (
                                    <>
                                      <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                                        {event.category}
                                      </Typography>
                                    </>
                                  )}
                                </Box>
                              </Box>

                              {/* Optional Right Image/Avatar */}
                              {event.category === 'Livestream' && (
                                <Box 
                                  component={motion.div}
                                  layoutId={`event-img-${event.id}`}
                                  sx={{ 
                                    width: 56, height: 56, borderRadius: 3, flexShrink: 0,
                                    backgroundImage: 'url(https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80)',
                                    backgroundSize: 'cover', backgroundPosition: 'center',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                  }} 
                                />
                              )}
                            </Box>
                          );
                        })
                      )}
                    </Box>
                  )}
                </AnimatePresence>
              </Box>
            );
          })}
          
          {/* Bottom Padding for smooth scroll centering */}
          <Box sx={{ height: '30vh', flexShrink: 0 }} />
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minHeight: 0, position: 'relative' }}>
      
      {/* Header controls using React Portal into Modal Header */}
      {headerPortal ? createPortal(
        <Box sx={{ 
          display: 'flex', alignItems: 'center', gap: 2,
        }}>
          {/* View Toggles */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, val) => val && setViewMode(val)}
            size="small"
            sx={{
              bgcolor: 'rgba(0,0,0,0.04)', p: 0.5, borderRadius: 3,
              '& .MuiToggleButton-root': {
                border: 'none', borderRadius: 2, px: 2, py: 0.5, fontWeight: 700, textTransform: 'none', color: alpha(primaryColor, 0.5),
                '&.Mui-selected': { bgcolor: 'white', color: primaryColor, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', '&:hover': { bgcolor: 'white' } }
              }
            }}
          >
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="day">Day</ToggleButton>
          </ToggleButtonGroup>

          <IconButton 
            size="small" 
            title="Share this calendar view"
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                alert('Calendar link copied to clipboard!');
              }
            }}
            sx={{ 
              bgcolor: 'rgba(0,0,0,0.04)', 
              borderRadius: 2, p: 1, 
              color: primaryColor,
              '&:hover': { bgcolor: alpha(primaryColor, 0.1) } 
            }}
          >
            <ShareIcon fontSize="small" />
          </IconButton>

          <Button 
            variant="contained" 
            onClick={() => setIsAddingEvent(!isAddingEvent)}
            startIcon={<AddIcon />}
            sx={{ borderRadius: 8, fontWeight: 800, textTransform: 'none', px: 3, boxShadow: 'none', bgcolor: primaryColor, '&:hover': { bgcolor: primaryColor, filter: 'brightness(0.9)' } }}
          >
            Add Event
          </Button>
        </Box>,
        headerPortal
      ) : null}

      {/* Main Grid: Calendar + Sidebars */}
      <Box sx={{ flex: 1, display: 'flex', gap: 2, minHeight: 0, position: 'relative' }}>
        
        {/* Master Navigation Left (Overlay, half outside) */}
        <IconButton size="small" onClick={handlePrev} sx={{ position: 'absolute', left: -16, top: '50%', transform: 'translateY(-50%)', zIndex: 20, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.3)', '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' }, transition: 'all 0.2s' }}>
          <ChevronLeftIcon sx={{ color: primaryColor }} />
        </IconButton>

        {/* Master Navigation Right (Overlay, half outside) */}
        <IconButton size="small" onClick={handleNext} sx={{ position: 'absolute', right: -16, top: '50%', transform: 'translateY(-50%)', zIndex: 20, bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.3)', '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' }, transition: 'all 0.2s' }}>
          <ChevronRightIcon sx={{ color: primaryColor }} />
        </IconButton>

        {/* Calendar Area */}
        <Box sx={{ 
          flex: 1, position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0
        }}>
          {/* Main Calendar View Wrapper */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            
            {/* Context Header for Day View only */}
            {viewMode === 'day' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton size="small" onClick={() => setViewMode('week')} sx={{ bgcolor: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' } }}>
                  <ChevronLeftIcon />
                </IconButton>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    BACK TO WEEK {getWeekNumber(currentDate)}
                  </Typography>
                  <Typography variant="h5" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>
                    {currentDate.toLocaleDateString('en-US', { weekday: 'long' })} {getOrdinal(currentDate.getDate())}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Empty space block to push toggles to right when in week view */}
            {viewMode === 'week' && <Box />}
          </Box>

        {/* Render Active View */}
        <Box sx={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <AnimatePresence initial={false} custom={slideDirection}>
            <motion.div
              key={`week-${getWeekNumber(currentDate)}-${currentDate.getFullYear()}-${viewMode}`}
              custom={slideDirection}
              variants={{
                enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0, position: 'absolute' }),
                center: { x: 0, opacity: 1, position: 'relative' },
                exit: (dir: number) => ({ x: dir < 0 ? '100%' : '-100%', opacity: 0, position: 'absolute' })
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
              style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}
            >
              {renderWeekView()}
            </motion.div>
          </AnimatePresence>
        </Box>

        </Box>

      {isAddingEvent && (
        <Box sx={{ flex: 1, position: 'relative', minWidth: 320 }}>
          <AddEventSidebar 
            tenantId={tenantId} 
            initialDate={currentDate}
            onDateChange={setCurrentDate}
            onClose={() => setIsAddingEvent(false)}
            themeColor={primaryColor} 
          />
        </Box>
      )}

      </Box>
    </Box>
  );
}
