'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Card, Chip, Stack, Skeleton, alpha, IconButton, Button, Tooltip } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
import WorkIcon from '@mui/icons-material/Work';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Link from 'next/link';

export interface CalendarEventItem {
  id: string;
  sourceType: string;
  sourceId: string;
  title: string;
  date: string;
  endDate?: string | null;
  link: string;
  imageUrl?: string | null;
  category?: string | null;
  organizationName?: string | null;
  status: string;
}

interface CalendarWidgetProps {
  initialEvents?: CalendarEventItem[];
  title?: string;
  subtitle?: string;
  variant?: 'compact' | 'full';
}

type ViewMode = 'month' | 'list';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarWidget({
  initialEvents = [],
  title = "Ecosystem Calendar",
  subtitle = "Upcoming live sessions, application deadlines, and key dates across FoodNerve.",
  variant = 'compact'
}: CalendarWidgetProps) {
  const [events, setEvents] = useState<CalendarEventItem[]>(initialEvents);
  const [loading, setLoading] = useState<boolean>(initialEvents.length === 0);
  const [viewMode, setViewMode] = useState<ViewMode>(variant === 'full' ? 'month' : 'list');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    if (initialEvents.length === 0) {
      async function loadEvents() {
        try {
          const res = await fetch('/api/calendar');
          if (res.ok) {
            const data = await res.json();
            if (data.events) {
              setEvents(data.events);
            }
          }
        } catch (err) {
          console.error('Failed to load calendar events', err);
        } finally {
          setLoading(false);
        }
      }
      loadEvents();
    }
  }, [initialEvents]);

  const getSourceIcon = (sourceType: string, small = false) => {
    const size = small ? 14 : 16;
    switch (sourceType) {
      case 'job':
        return <WorkIcon sx={{ fontSize: size, color: '#10b981' }} />;
      case 'livestream':
        return <LiveTvIcon sx={{ fontSize: size, color: '#f59e0b' }} />;
      default:
        return <EventIcon sx={{ fontSize: size, color: '#3b82f6' }} />;
    }
  };

  const getSourceColor = (sourceType: string) => {
    switch (sourceType) {
      case 'job': return '#10b981';
      case 'livestream': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  const getSourceLabel = (sourceType: string, category?: string | null) => {
    if (category) return category.toUpperCase();
    switch (sourceType) {
      case 'job': return 'JOB DEADLINE';
      case 'livestream': return 'LIVESTREAM';
      case 'meetEvent': return 'MEET';
      case 'campaign': return 'CAMPAIGN';
      default: return 'EVENT';
    }
  };

  // Month Grid Calculations
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, date: null, events: [] });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dayEvents = events.filter(e => {
        const eDate = new Date(e.date);
        return eDate.getFullYear() === year && eDate.getMonth() === month && eDate.getDate() === i;
      });
      days.push({ day: i, date, events: dayEvents });
    }
    return days;
  }, [currentDate, events]);

  const prevMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const nextMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const renderEventList = (items: CalendarEventItem[]) => {
    if (items.length === 0) {
      return (
        <Box sx={{ py: 6, px: 2, textAlign: 'center', bgcolor: alpha('#f8fafc', 0.5), borderRadius: 3, border: '1px dashed #cbd5e1' }}>
          <EventIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#475569', fontWeight: 700 }}>
            No Events Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            There are no upcoming deadlines or scheduled events for this selection.
          </Typography>
        </Box>
      );
    }

    return (
      <Stack spacing={2}>
        {items.map((evt) => {
          const evtDate = new Date(evt.date);
          const dayStr = evtDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
          const color = getSourceColor(evt.sourceType);

          return (
            <Card
              key={evt.id}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 4,
                border: '1px solid',
                borderColor: '#e2e8f0',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: alpha(color, 0.5),
                  boxShadow: `0 10px 25px -5px ${alpha(color, 0.15)}`,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    p: 1.5, 
                    minWidth: 70,
                    borderRadius: 3, 
                    bgcolor: alpha(color, 0.1), 
                    color: color,
                    flexShrink: 0
                  }}
                >
                  <Typography variant="caption" sx={{ display: 'block', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.05em' }}>
                    {dayStr.split(' ')[0]}
                  </Typography>
                  <Typography variant="h5" sx={{ lineHeight: 1, fontWeight: 900, mt: 0.5 }}>
                    {dayStr.split(' ')[1]}
                  </Typography>
                </Box>

                <Box sx={{ flexGrow: 1, minWidth: 0, pt: 0.5 }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
                    {getSourceIcon(evt.sourceType)}
                    <Chip 
                      label={getSourceLabel(evt.sourceType, evt.category)} 
                      size="small" 
                      sx={{ height: 22, fontSize: '0.7rem', fontWeight: 800, bgcolor: alpha(color, 0.15), color: color, borderRadius: '6px' }} 
                    />
                    {evt.organizationName && (
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        • {evt.organizationName}
                      </Typography>
                    )}
                  </Stack>
                  <Link href={evt.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.3, '&:hover': { color } }}>
                      {evt.title}
                    </Typography>
                  </Link>
                </Box>
              </Box>
            </Card>
          );
        })}
      </Stack>
    );
  };

  const selectedDayEvents = selectedDate 
    ? events.filter(e => {
        const d = new Date(e.date);
        return d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
      })
    : [];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header Area */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 900, fontSize: { xs: '1.5rem', md: '2rem' }, color: '#0f172a', mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
            {subtitle}
          </Typography>
        </Box>
        
        {variant === 'full' && (
          <Box sx={{ bgcolor: '#ffffff', p: 0.5, borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', border: '1px solid #e2e8f0' }}>
            <Button
              startIcon={<ViewModuleIcon />}
              onClick={() => setViewMode('month')}
              sx={{ 
                px: 2, py: 1, borderRadius: '8px', fontWeight: 700, 
                bgcolor: viewMode === 'month' ? '#0f172a' : 'transparent',
                color: viewMode === 'month' ? '#ffffff' : '#64748b',
                '&:hover': { bgcolor: viewMode === 'month' ? '#1e293b' : '#f1f5f9' }
              }}
            >
              Month
            </Button>
            <Button
              startIcon={<FormatListBulletedIcon />}
              onClick={() => setViewMode('list')}
              sx={{ 
                px: 2, py: 1, borderRadius: '8px', fontWeight: 700, 
                bgcolor: viewMode === 'list' ? '#0f172a' : 'transparent',
                color: viewMode === 'list' ? '#ffffff' : '#64748b',
                '&:hover': { bgcolor: viewMode === 'list' ? '#1e293b' : '#f1f5f9' }
              }}
            >
              List
            </Button>
          </Box>
        )}
      </Box>

      {/* Main Content Area */}
      <Box sx={{ bgcolor: '#ffffff', borderRadius: 6, border: '1px solid #e2e8f0', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {loading ? (
          <Box sx={{ p: 4 }}>
            <Stack spacing={2}>
              <Skeleton variant="rounded" height={100} />
              <Skeleton variant="rounded" height={100} />
              <Skeleton variant="rounded" height={100} />
            </Stack>
          </Box>
        ) : (
          <Box>
            {viewMode === 'month' ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '6fr 4fr' } }}>
                {/* Calendar Grid (Left side on desktop) */}
                <Box sx={{ p: { xs: 2, md: 4 }, borderRight: { lg: '1px solid #e2e8f0' }, borderBottom: { xs: '1px solid #e2e8f0', lg: 'none' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a' }}>
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton onClick={prevMonth} sx={{ border: '1px solid #e2e8f0' }} size="small">
                        <ChevronLeftIcon />
                      </IconButton>
                      <IconButton onClick={nextMonth} sx={{ border: '1px solid #e2e8f0' }} size="small">
                        <ChevronRightIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: { xs: 0.5, sm: 1 } }}>
                    {WEEKDAYS.map(day => (
                      <Box key={day} sx={{ textAlign: 'center', py: 1 }}>
                        <Typography sx={{ fontWeight: 800, color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                          {day}
                        </Typography>
                      </Box>
                    ))}
                    
                    {calendarDays.map((item, idx) => {
                      const isToday = item.date && item.date.toDateString() === new Date().toDateString();
                      const isSelected = item.date && selectedDate && item.date.toDateString() === selectedDate.toDateString();
                      
                      return (
                        <Box 
                          key={idx} 
                          onClick={() => { if (item.date) setSelectedDate(item.date); }}
                          sx={{ 
                            aspectRatio: '1', 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            justifyContent: 'flex-start',
                            pt: 1,
                            pb: 0.5,
                            borderRadius: 3,
                            cursor: item.day ? 'pointer' : 'default',
                            transition: 'all 0.2s',
                            bgcolor: isSelected ? '#0f172a' : (isToday ? '#f1f5f9' : 'transparent'),
                            border: '1px solid',
                            borderColor: isToday && !isSelected ? '#cbd5e1' : 'transparent',
                            '&:hover': {
                              bgcolor: item.day && !isSelected ? '#f8fafc' : undefined,
                            }
                          }}
                        >
                          {item.day && (
                            <>
                              <Typography sx={{ 
                                fontWeight: isSelected || isToday ? 900 : 600, 
                                color: isSelected ? '#ffffff' : (isToday ? '#0f172a' : '#475569'),
                                fontSize: { xs: '0.9rem', sm: '1rem' }
                              }}>
                                {item.day}
                              </Typography>
                              
                              {/* Event Dots */}
                              <Box sx={{ display: 'flex', gap: 0.5, mt: 'auto', flexWrap: 'wrap', justifyContent: 'center', px: 0.5 }}>
                                {item.events.slice(0, 3).map((e, i) => (
                                  <Box key={i} sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: getSourceColor(e.sourceType) }} />
                                ))}
                                {item.events.length > 3 && (
                                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                                )}
                              </Box>
                            </>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
                
                {/* Event Details (Right side on desktop) */}
                <Box sx={{ bgcolor: '#f8fafc', p: { xs: 2, md: 4 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 3 }}>
                    {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}
                  </Typography>
                  {renderEventList(selectedDayEvents)}
                </Box>
              </Box>
            ) : (
              <Box sx={{ p: { xs: 2, md: 4 } }}>
                {renderEventList(events.slice(0, variant === 'compact' ? 5 : undefined))}
                {variant === 'compact' && events.length > 5 && (
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button 
                      component={Link} 
                      href="/calendar"
                      variant="outlined" 
                      sx={{ borderRadius: '10px', fontWeight: 700, px: 4, color: '#0f172a', borderColor: '#cbd5e1' }}
                    >
                      View All Events
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
