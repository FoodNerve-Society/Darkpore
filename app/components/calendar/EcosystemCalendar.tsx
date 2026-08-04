'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Button, alpha, useTheme, ToggleButtonGroup, ToggleButton, TextField, MenuItem } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import { getCalendarEvents } from '@/app/actions/calendar';
import { CalendarEvent } from '@prisma/client';
import AddEventSidebar from './AddEventSidebar';

export type ViewMode = 'month' | 'week' | 'day';

interface EcosystemCalendarProps {
  tenantId: string;
  initialView?: ViewMode;
  initialDate?: Date;
}

export default function EcosystemCalendar({ tenantId, initialView = 'month', initialDate }: EcosystemCalendarProps) {
  const theme = useTheme();
  
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingEvent, setIsAddingEvent] = useState(false);

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

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonthRaw = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const firstDayOfMonth = firstDayOfMonthRaw === 0 ? 6 : firstDayOfMonthRaw - 1;

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
    if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
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
                textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, isDaySelected ? 0.2 : 0.05), 
                py: 0.8, borderRadius: 2, border: `1px solid ${alpha(theme.palette.primary.main, isDaySelected ? 0.4 : 0.1)}`
              }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: theme.palette.primary.main, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                  bgcolor: isWeekSelected ? alpha(theme.palette.primary.main, 0.15) : 'rgba(0,0,0,0.01)', 
                  borderRadius: 2, 
                  border: isWeekSelected ? `1px solid ${alpha(theme.palette.primary.main, 0.4)}` : '1px dashed rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1), transform: 'scale(1.05)', borderColor: alpha(theme.palette.primary.main, 0.3) }
                }}>
                  <Typography sx={{ 
                    fontWeight: 900, 
                    color: isWeekSelected ? theme.palette.primary.main : '#94a3b8', 
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
                        bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.1) : (isToday ? alpha(theme.palette.primary.main, 0.05) : 'rgba(255,255,255,0.4)'), 
                        borderRadius: 3, p: 1,
                        border: isSelected ? `2px solid ${theme.palette.primary.main}` : (isToday ? `1px solid ${alpha(theme.palette.primary.main, 0.4)}` : '1px solid rgba(0,0,0,0.03)'),
                        boxShadow: isSelected ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.2)}` : (isToday ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}` : '0 2px 8px rgba(0,0,0,0.01)'),
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
                        color: isSelected ? theme.palette.primary.main : (isToday ? theme.palette.primary.main : '#334155'), 
                        mb: 1,
                        fontSize: (isToday || isSelected) ? '1.1rem' : '0.9rem',
                        letterSpacing: '-0.02em'
                      }}>
                        {day}
                      </Typography>
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', '&::-webkit-scrollbar': { display: 'none' } }}>
                        {dayEvents.length > 0 && (
                          <Box sx={{ 
                            bgcolor: tenantId === 'foodnerve' ? alpha(theme.palette.primary.main, 0.15) : alpha('#10b981', 0.15), 
                            px: 1, py: 0.5, borderRadius: 3, textAlign: 'center',
                            boxShadow: `0 4px 12px ${tenantId === 'foodnerve' ? alpha(theme.palette.primary.main, 0.2) : alpha('#10b981', 0.2)}`,
                            backdropFilter: 'blur(4px)',
                            border: 'none'
                          }}>
                            <Typography variant="caption" sx={{ fontWeight: 900, color: tenantId === 'foodnerve' ? theme.palette.primary.main : '#10b981', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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

  // --- RENDER WEEK VIEW ---
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
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 2 }}>
          {weekDates.map(d => {
            const isToday = d.toDateString() === new Date().toDateString();
            const isSelected = d.toDateString() === currentDate.toDateString();
            
            return (
              <Box key={d.toISOString()} sx={{ 
                textAlign: 'center', p: 1, borderRadius: 3,
                bgcolor: isSelected ? theme.palette.primary.main : (isToday ? alpha(theme.palette.primary.main, 0.1) : 'transparent'),
                color: isSelected ? 'white' : 'inherit',
                boxShadow: isSelected ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
                transition: 'all 0.2s ease',
              }}>
                <Typography variant="caption" sx={{ fontFamily: 'var(--font-ysabeau-infant)', fontWeight: 800, color: isSelected ? 'rgba(255,255,255,0.8)' : '#94a3b8', textTransform: 'uppercase', display: 'block', letterSpacing: '0.05em' }}>
                  {dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1]}
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: isSelected || isToday ? 900 : 700, color: isSelected ? '#ffffff' : (isToday ? theme.palette.primary.main : '#334155'), fontSize: '1.2rem' }}>
                  {d.getDate()}
                </Typography>
              </Box>
            );
          })}
        </Box>
        <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, minHeight: 0 }}>
          {weekDates.map((d, i) => {
            const dayEvents = getEventsForDate(d);
            const isToday = d.toDateString() === new Date().toDateString();
            return (
              <Box 
                key={i} 
                onClick={() => {
                  setCurrentDate(d);
                  setViewMode('day');
                }}
                sx={{ 
                  bgcolor: isToday ? alpha(theme.palette.primary.main, 0.05) : 'rgba(255,255,255,0.4)', 
                  borderRadius: 3, p: 1.5,
                  border: isToday ? `1px solid ${alpha(theme.palette.primary.main, 0.4)}` : '1px solid rgba(0,0,0,0.03)',
                  boxShadow: isToday ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}` : '0 2px 8px rgba(0,0,0,0.01)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s ease', cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.8)', transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' },
                  display: 'flex', flexDirection: 'column', overflowY: 'hidden', gap: 1
                }}
              >
                <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1, '&::-webkit-scrollbar': { display: 'none' }, px: 2, mx: -2, pb: 4, mb: -4 }}>
                  {dayEvents.length === 0 ? (
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 700 }}>No events</Typography>
                    </Box>
                  ) : dayEvents.map(event => {
                    const dotColor = getIntentColor(event.dateType);
                    return (
                      <Box key={event.id} sx={{ 
                        bgcolor: alpha(dotColor, 0.12), 
                        backdropFilter: 'blur(10px)',
                        px: 1.5, py: 1, borderRadius: 3, mb: 0.5, 
                        boxShadow: `0 8px 16px ${alpha(dotColor, 0.15)}, inset 0 2px 4px rgba(255,255,255,0.4)`,
                        position: 'relative', overflow: 'hidden',
                        border: 'none',
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: alpha(dotColor, 0.18), borderColor: alpha(dotColor, 0.4), transform: 'translateY(-2px)', boxShadow: `0 12px 24px ${alpha(dotColor, 0.22)}, inset 0 2px 4px rgba(255,255,255,0.6)` }
                      }}>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: dotColor, display: 'block', mb: 0.2, fontSize: '0.7rem' }}>
                          {formatTimeSpan(event.date, event.endDate)}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2, mb: 0.5 }}>
                          {event.title}
                        </Typography>
                        {event.category && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                            {event.category}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  // --- RENDER DAY VIEW ---
  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const isToday = currentDate.toDateString() === new Date().toDateString();
    
    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', overflowY: 'auto', px: { xs: 1, md: 2 }, mx: { xs: -1, md: -2 }, pb: 4, mb: -4, minHeight: 0 }}>
        
        {/* Header matching Week View style but bigger */}
        <Box sx={{ 
          textAlign: 'center', p: 2, borderRadius: 4, mb: 3, width: '100%',
          bgcolor: theme.palette.primary.main,
          color: 'white',
          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
        }}>
          <Typography variant="subtitle2" sx={{ fontFamily: 'var(--font-ysabeau-infant)', fontWeight: 800, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {currentDate.toLocaleDateString(undefined, { weekday: 'long' })}
          </Typography>
          <Typography variant="h4" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 900, color: '#ffffff' }}>
            {currentDate.getDate()} {currentDate.toLocaleDateString(undefined, { month: 'long' })}
          </Typography>
        </Box>

        {/* The "Combined 5 strips" Container */}
        <Box sx={{ 
          width: '100%', flex: 1,
          bgcolor: isToday ? alpha(theme.palette.primary.main, 0.05) : 'rgba(255,255,255,0.4)', 
          borderRadius: 4, p: 3,
          border: isToday ? `1px solid ${alpha(theme.palette.primary.main, 0.4)}` : '1px solid rgba(0,0,0,0.03)',
          boxShadow: isToday ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}` : '0 4px 16px rgba(0,0,0,0.02)',
          backdropFilter: 'blur(12px)',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {dayEvents.length === 0 ? (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>No events scheduled for this day.</Typography>
            </Box>
          ) : (
            dayEvents.map(event => {
              const dotColor = getIntentColor(event.dateType);
              return (
                <Box key={event.id} sx={{ 
                  display: 'flex', gap: 3, p: 3, borderRadius: 5, 
                  bgcolor: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(20px)',
                  boxShadow: `0 16px 40px ${alpha(dotColor, 0.12)}, inset 0 2px 4px rgba(255,255,255,0.6)`,
                  border: 'none',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.7)', transform: 'translateY(-4px)', boxShadow: `0 24px 64px ${alpha(dotColor, 0.2)}, inset 0 2px 4px rgba(255,255,255,0.8)` }
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80, justifyContent: 'center' }}>
                    {formatTimeSpan(event.date, event.endDate) === 'All Day' ? (
                      <Typography variant="h6" sx={{ fontWeight: 900, color: dotColor, fontFamily: 'var(--font-dosis)', lineHeight: 1 }}>
                        ALL DAY
                      </Typography>
                    ) : (
                      <>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: dotColor, fontFamily: 'var(--font-dosis)', lineHeight: 1 }}>
                          {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(' ')[0]}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', mb: event.endDate ? 1 : 0 }}>
                          {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(' ')[1]}
                        </Typography>
                        
                        {event.endDate && (
                          <>
                            <Box sx={{ width: 1, height: 10, bgcolor: alpha(dotColor, 0.3), my: 0.5 }} />
                            <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.secondary', fontFamily: 'var(--font-dosis)', lineHeight: 1, opacity: 0.8 }}>
                              {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(' ')[0]}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', opacity: 0.8 }}>
                              {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(' ')[1]}
                            </Typography>
                          </>
                        )}
                      </>
                    )}
                  </Box>
                  <Box sx={{ width: 2, bgcolor: alpha(dotColor, 0.2), borderRadius: 2 }} />
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5, letterSpacing: '-0.02em' }}>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569', mb: 2, fontWeight: 500 }}>
                      {event.dateType === 'DEADLINE' ? 'Critical application deadline. Ensure all materials are submitted.' : (event.dateType === 'PUBLISH_DATE' ? 'Content scheduled for public release.' : 'Join this session to collaborate, review resources, and ask questions live with the organizers.')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Box sx={{ bgcolor: alpha(dotColor, 0.1), color: dotColor, px: 1.5, py: 0.5, borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                          {event.dateType?.replace('_', ' ')}
                        </Typography>
                      </Box>
                      {event.category && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, bgcolor: 'rgba(0,0,0,0.04)', px: 1.5, py: 0.5, borderRadius: 2 }}>
                          {event.category} {event.organizationName && `• ${event.organizationName}`}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', flex: 1, display: 'flex', gap: 3, minHeight: 0 }}>
      
      {/* Calendar Area */}
      <Box sx={{ 
        flex: isAddingEvent ? '0 0 60%' : 1,
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        minHeight: 0
      }}>
        {/* Calendar Toolbar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton size="small" onClick={handlePrev} sx={{ bgcolor: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' } }}>
            <ChevronLeftIcon />
          </IconButton>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160 }}>
            {/* Eyebrow Subtitle Breadcrumbs */}
            {viewMode === 'week' && (
              <Typography 
                variant="caption" 
                onClick={() => setViewMode('month')}
                sx={{ 
                  fontWeight: 800, color: 'text.secondary', letterSpacing: '0.05em', textTransform: 'uppercase', 
                  cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: theme.palette.primary.main } 
                }}
              >
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Typography>
            )}
            {viewMode === 'day' && (
              <Typography 
                variant="caption" 
                sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', gap: 1 }}
              >
                <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => setViewMode('month')} onMouseOver={(e) => e.currentTarget.style.color = theme.palette.primary.main} onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                {' • '}
                <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => setViewMode('week')} onMouseOver={(e) => e.currentTarget.style.color = theme.palette.primary.main} onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}>
                  WEEK {getWeekNumber(currentDate)}
                </span>
              </Typography>
            )}
            
            {/* Huge Text */}
            <Typography variant="h5" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', fontSize: '1.6rem', lineHeight: 1 }}>
              {viewMode === 'month' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              {viewMode === 'week' && `Week ${getWeekNumber(currentDate)}`}
              {viewMode === 'day' && `${currentDate.toLocaleDateString('en-US', { weekday: 'long' })} ${getOrdinal(currentDate.getDate())}`}
            </Typography>
          </Box>

          <IconButton size="small" onClick={handleNext} sx={{ bgcolor: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' } }}>
            <ChevronRightIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* View Toggles */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, val) => val && setViewMode(val)}
            size="small"
            sx={{
              bgcolor: 'rgba(0,0,0,0.04)', p: 0.5, borderRadius: 3,
              '& .MuiToggleButton-root': {
                border: 'none', borderRadius: 2, px: 2, py: 0.5, fontWeight: 700, textTransform: 'none', color: 'text.secondary',
                '&.Mui-selected': { bgcolor: 'white', color: 'text.primary', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', '&:hover': { bgcolor: 'white' } }
              }
            }}
          >
            <ToggleButton value="month">Month</ToggleButton>
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
              color: 'text.secondary',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.08)', color: 'text.primary' } 
            }}
          >
            <ShareIcon fontSize="small" />
          </IconButton>

          <Button 
            variant="contained" 
            onClick={() => setIsAddingEvent(!isAddingEvent)}
            startIcon={<AddIcon />}
            sx={{ borderRadius: 8, fontWeight: 800, textTransform: 'none', px: 3, boxShadow: 'none' }}
          >
            Add Event
          </Button>
        </Box>
      </Box>

      {/* Render Active View */}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}
      </Box>

      {/* Add Event Form Split-Screen */}
      {isAddingEvent && (
        <Box sx={{ flex: 1, position: 'relative', minWidth: 320 }}>
          <AddEventSidebar 
            tenantId={tenantId} 
            initialDate={currentDate}
            onDateChange={setCurrentDate}
            onClose={() => setIsAddingEvent(false)} 
          />
        </Box>
      )}

    </Box>
  );
}
