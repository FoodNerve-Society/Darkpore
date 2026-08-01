'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Button, alpha, useTheme, Avatar } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import { getCalendarEvents } from '@/app/actions/calendar';
import { CalendarEvent } from '@prisma/client';

export default function EcosystemCalendar({ tenantId }: { tenantId: string }) {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, [tenantId, currentDate.getMonth()]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Helper to group events by day
  const getEventsForDay = (day: number) => {
    return events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Calendar Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary' }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, bgcolor: 'rgba(0,0,0,0.04)', borderRadius: 2, p: 0.5 }}>
            <IconButton size="small" onClick={handlePrevMonth}><ChevronLeftIcon /></IconButton>
            <IconButton size="small" onClick={handleNextMonth}><ChevronRightIcon /></IconButton>
          </Box>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          sx={{ borderRadius: 8, fontWeight: 800, textTransform: 'none', px: 3, boxShadow: 'none' }}
        >
          Add Event
        </Button>
      </Box>

      {/* Days of Week Header */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
        {dayNames.map(day => (
          <Typography key={day} variant="caption" sx={{ textAlign: 'center', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
            {day}
          </Typography>
        ))}
      </Box>

      {/* Calendar Grid */}
      <Box sx={{ 
        flex: 1, 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gridAutoRows: 'minmax(100px, 1fr)',
        gap: 1,
        minHeight: 0
      }}>
        {/* Empty cells before the 1st of the month */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <Box key={`empty-${i}`} sx={{ bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }} />
        ))}
        
        {/* Actual days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
          const dayEvents = getEventsForDay(day);

          return (
            <Box 
              key={day} 
              sx={{ 
                bgcolor: isToday ? alpha(theme.palette.primary.main, 0.05) : 'rgba(0,0,0,0.02)', 
                borderRadius: 2, 
                p: 1,
                border: isToday ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}` : '1px solid transparent',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: isToday ? 900 : 700, 
                    color: isToday ? theme.palette.primary.main : 'text.primary',
                    bgcolor: isToday ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {day}
                </Typography>
              </Box>

              {/* Render Events */}
              <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}>
                {dayEvents.map(event => {
                  let dotColor = theme.palette.primary.main;
                  if (event.visibility === 'society') dotColor = '#f59e0b';
                  if (event.visibility === 'organization') dotColor = '#3b82f6';
                  if (event.visibility === 'personal') dotColor = '#8b5cf6';

                  return (
                    <Box 
                      key={event.id}
                      sx={{ 
                        bgcolor: alpha(dotColor, 0.1), 
                        borderLeft: `2px solid ${dotColor}`,
                        px: 1, py: 0.5, 
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: alpha(dotColor, 0.15) }
                      }}
                    >
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
}
