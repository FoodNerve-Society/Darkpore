'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip, Stack, Skeleton, alpha } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
import WorkIcon from '@mui/icons-material/Work';
import LiveTvIcon from '@mui/icons-material/LiveTv';
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

export default function CalendarWidget({
  initialEvents = [],
  title = "Ecosystem Calendar & Deadlines",
  subtitle = "Upcoming live sessions, application deadlines, and key dates across FoodNerve.",
  variant = 'compact'
}: CalendarWidgetProps) {
  const [events, setEvents] = useState<CalendarEventItem[]>(initialEvents);
  const [loading, setLoading] = useState<boolean>(initialEvents.length === 0);

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

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'job':
        return <WorkIcon sx={{ fontSize: 16, color: '#388e3c' }} />;
      case 'livestream':
        return <LiveTvIcon sx={{ fontSize: 16, color: '#d32f2f' }} />;
      default:
        return <EventIcon sx={{ fontSize: 16, color: '#1976d2' }} />;
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

  return (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: 4, 
        border: '1px solid',
        borderColor: 'divider',
        background: 'background.paper',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#2e7d32', 0.1), color: '#2e7d32', display: 'flex' }}>
            <CalendarMonthIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <CardContent sx={{ p: 2 }}>
        {loading ? (
          <Stack spacing={1.5}>
            <Skeleton variant="rounded" height={60} />
            <Skeleton variant="rounded" height={60} />
            <Skeleton variant="rounded" height={60} />
          </Stack>
        ) : events.length === 0 ? (
          <Box sx={{ py: 4, px: 2, textAlign: 'center' }}>
            <EventIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No upcoming deadlines or scheduled events at the moment.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {events.slice(0, variant === 'compact' ? 5 : 15).map((evt) => {
              const evtDate = new Date(evt.date);
              const dayStr = evtDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

              return (
                <Card
                  key={evt.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: alpha('#1976d2', 0.02),
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        textAlign: 'center', 
                        p: 1, 
                        minWidth: 54,
                        borderRadius: 2, 
                        bgcolor: alpha('#000', 0.04), 
                        border: '1px solid',
                        borderColor: 'divider',
                        flexShrink: 0
                      }}
                    >
                      <Typography variant="caption" color="primary" sx={{ display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 800 }}>
                        {dayStr.split(' ')[0]}
                      </Typography>
                      <Typography variant="h6" sx={{ lineHeight: 1, fontWeight: 800 }}>
                        {dayStr.split(' ')[1]}
                      </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                        {getSourceIcon(evt.sourceType)}
                        <Chip 
                          label={getSourceLabel(evt.sourceType, evt.category)} 
                          size="small" 
                          sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} 
                        />
                        {evt.organizationName && (
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 120 }}>
                            • {evt.organizationName}
                          </Typography>
                        )}
                      </Stack>
                      <Link href={evt.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, '&:hover': { color: 'primary.main' } }} noWrap>
                          {evt.title}
                        </Typography>
                      </Link>
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
