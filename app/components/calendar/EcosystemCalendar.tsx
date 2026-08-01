'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Button, alpha, useTheme, ToggleButtonGroup, ToggleButton, TextField, MenuItem } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
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
      url.searchParams.set('date', currentDate.toISOString().split('T')[0]);
      window.history.replaceState(null, '', url.toString());
    } catch (e) {}
  }, [viewMode, currentDate]);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      try {
        const data = await getCalendarEvents(tenantId);
        setEvents(data);
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

  const getVisibilityColor = (visibility: string | null) => {
    if (visibility === 'society') return '#3b82f6'; // Blue
    if (visibility === 'organization') return '#10b981'; // Green
    if (visibility === 'personal') return '#8b5cf6'; // Purple
    return theme.palette.primary.main;
  };

  const getVisibilityLabel = (visibility: string | null) => {
    if (visibility === 'society') return 'Public Ecosystem';
    if (visibility === 'organization') return 'Organization';
    if (visibility === 'personal') return 'Personal';
    return 'Event';
  };

  // --- RENDER MONTH VIEW ---
  const renderMonthView = () => (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
        {dayNames.map(day => (
          <Typography key={day} variant="caption" sx={{ textAlign: 'center', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
            {day}
          </Typography>
        ))}
      </Box>
      <Box sx={{ 
        flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(100px, 1fr)', gap: 1, minHeight: 0
      }}>
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <Box key={`empty-${i}`} sx={{ bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }} />
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const isToday = new Date().toDateString() === targetDate.toDateString();
          const dayEvents = getEventsForDate(targetDate);

          return (
            <Box 
              key={day} 
              onClick={() => {
                setCurrentDate(targetDate);
                setViewMode('day');
              }}
              sx={{ 
                bgcolor: isToday ? alpha(theme.palette.primary.main, 0.05) : 'rgba(255,255,255,0.4)', 
                borderRadius: 3, p: 1,
                border: isToday ? `1px solid ${alpha(theme.palette.primary.main, 0.4)}` : '1px solid rgba(0,0,0,0.03)',
                boxShadow: isToday ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}` : '0 2px 8px rgba(0,0,0,0.01)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease', cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.8)', transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' },
                display: 'flex', flexDirection: 'column', overflow: 'hidden'
              }}
            >
              <Typography variant="body2" sx={{ 
                fontFamily: 'var(--font-dosis)',
                fontWeight: isToday ? 900 : 700, 
                color: isToday ? theme.palette.primary.main : '#334155', 
                mb: 1,
                fontSize: isToday ? '1.1rem' : '0.9rem',
                letterSpacing: '-0.02em'
              }}>
                {day}
              </Typography>
              <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}>
                {dayEvents.map(event => {
                  const dotColor = getVisibilityColor(event.visibility);
                  return (
                    <Box key={event.id} sx={{ bgcolor: alpha(dotColor, 0.1), borderLeft: `2px solid ${dotColor}`, px: 1, py: 0.25, borderRadius: 1 }}>
                      <Typography variant="caption" noWrap sx={{ fontWeight: 700, color: dotColor, display: 'block', fontSize: '0.65rem' }}>
                        {event.title}
                      </Typography>
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
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                {dayEvents.map(event => {
                  const dotColor = getVisibilityColor(event.visibility);
                  return (
                    <Box key={event.id} sx={{ bgcolor: alpha(dotColor, 0.05), border: `1px solid ${alpha(dotColor, 0.2)}`, borderLeft: `3px solid ${dotColor}`, p: 1, borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.25, fontWeight: 700, fontSize: '0.65rem' }}>
                        {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2, fontSize: '0.85rem' }}>
                        {event.title}
                      </Typography>
                    </Box>
                  );
                })}
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
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', overflowY: 'auto', pr: { xs: 0, md: 1 } }}>
        
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
              const dotColor = getVisibilityColor(event.visibility);
              return (
                <Box key={event.id} sx={{ 
                  bgcolor: alpha(dotColor, 0.05), border: `1px solid ${alpha(dotColor, 0.2)}`, 
                  borderLeft: `4px solid ${dotColor}`, p: 2, borderRadius: 3,
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: alpha(dotColor, 0.08), transform: 'translateY(-2px)' }
                }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontWeight: 800, fontSize: '0.75rem' }}>
                    {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                  <Typography variant="h6" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 800, color: 'text.primary', lineHeight: 1.2, mb: 1 }}>
                    {event.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Box sx={{ bgcolor: alpha(dotColor, 0.1), color: dotColor, px: 1.5, py: 0.5, borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                        {getVisibilityLabel(event.visibility)}
                      </Typography>
                    </Box>
                    {event.category && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, bgcolor: 'rgba(0,0,0,0.04)', px: 1.5, py: 0.5, borderRadius: 2 }}>
                        {event.category} {event.organizationName && `• ${event.organizationName}`}
                      </Typography>
                    )}
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
    <Box sx={{ width: '100%', height: '100%', display: 'flex', gap: 3, overflow: 'hidden' }}>
      
      {/* Calendar Area */}
      <Box sx={{ 
        flex: isAddingEvent ? '0 0 60%' : 1,
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%'
      }}>
        {/* Calendar Toolbar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 900, color: '#0f172a', minWidth: 150, letterSpacing: '-0.02em', fontSize: '1.6rem' }}>
            {viewMode === 'day' 
              ? currentDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
            }
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, bgcolor: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 2, p: 0.5, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <IconButton size="small" onClick={handlePrev}><ChevronLeftIcon /></IconButton>
            <IconButton size="small" onClick={handleNext}><ChevronRightIcon /></IconButton>
          </Box>
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
        <AddEventSidebar 
          tenantId={tenantId} 
          onClose={() => setIsAddingEvent(false)} 
        />
      )}

    </Box>
  );
}
