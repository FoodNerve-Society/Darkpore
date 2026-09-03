'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, IconButton, alpha } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import { motion, AnimatePresence } from 'framer-motion';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { usePathname, useRouter } from 'next/navigation';
import { getActiveTheme } from './navigation/NavThemes';
import { useCalendarOverlay } from '@/context/CalendarOverlayContext';

// --- MOCK DATA FOR VISUAL PROTOTYPING ---
type FeedItemType = 'trade' | 'learn' | 'system' | 'network' | 'talent';

interface MockFeedItem {
  id: string;
  type: FeedItemType;
  title: string;
  snippet: string;
  time: string;
  link?: string;
}

const mockUpdates: MockFeedItem[] = [
  { id: '1', type: 'talent', title: 'New Candidate Applied', snippet: 'Senior Agronomist • Rank 4 Verified', time: '5m', link: '/profile?tab=talent' },
  { id: '2', type: 'trade', title: 'Bulk Cassava Deal', snippet: '50 Tons @ ₦450k', time: '12m' },
  { id: '3', type: 'talent', title: 'Candidate Shortlisted', snippet: 'Agro Logistics Lead advanced to Interview', time: '35m', link: '/profile?tab=talent' },
  { id: '4', type: 'system', title: 'Escrow Released', snippet: '₦2.0M cleared for logistics', time: '1h' },
  { id: '5', type: 'learn', title: 'Vertical Farming', snippet: 'Masterclass live now', time: '3h' },
  { id: '6', type: 'network', title: 'New Coop Member', snippet: 'John Doe joined syndicate', time: '5h' },
  { id: '7', type: 'trade', title: 'Price Alert: Cocoa', snippet: 'Spot price dropped by 2%', time: '6h' }
];

export default function UpdatesFeed() {
  const pathname = usePathname();
  const router = useRouter();
  const activeTheme = getActiveTheme(pathname);
  const { openCalendar } = useCalendarOverlay();
  const [activeFilter, setActiveFilter] = useState('All');
  const [isAgendaExpanded, setIsAgendaExpanded] = useState(false);

  // Format today's date
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const renderFeedCard = (item: MockFeedItem, index: number) => {
    let Icon = NotificationsActiveIcon;
    let cardColor = activeTheme.main;

    if (item.type === 'trade') cardColor = '#10b981'; // Emerald
    if (item.type === 'talent') cardColor = '#3b82f6'; // Blue
    if (item.type === 'learn') cardColor = '#8b5cf6'; // Violet
    if (item.type === 'system') cardColor = '#f59e0b'; // Amber
    if (item.type === 'network') cardColor = '#06b6d4'; // Cyan

    if (item.type === 'trade') Icon = TrendingUpIcon;
    if (item.type === 'talent') Icon = WorkIcon;
    if (item.type === 'learn') Icon = PlayArrowIcon;
    if (item.type === 'network') Icon = PeopleIcon;

    return (
      <Box 
        key={item.id}
        component={motion.div}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, delay: index * 0.05 }}
        onClick={() => {
          if (item.link) {
            router.push(item.link);
          } else if (item.type === 'talent') {
            router.push('/profile?tab=talent');
          } else if (item.type === 'trade') {
            router.push('/trade');
          } else if (item.type === 'learn') {
            router.push('/learn');
          }
        }}
        sx={{
          p: 1.5,
          mb: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          bgcolor: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(24px) saturate(200%)',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,1)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.95)',
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
            '& .action-arrow': {
              opacity: 1,
              transform: 'translateX(0)'
            }
          }
        }}
      >
        {/* Glowing Icon Ring */}
        <Box sx={{ 
          width: 42, 
          height: 42, 
          borderRadius: '50%', 
          background: `linear-gradient(135deg, ${cardColor}, ${alpha(cardColor, 0.6)})`,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white',
          boxShadow: `0 4px 12px ${alpha(cardColor, 0.3)}`,
          flexShrink: 0
        }}>
          <Icon sx={{ fontSize: 20 }} />
        </Box>

        {/* Dense Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.25 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.875rem' }}>
              {item.title}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem' }}>
              {item.time}
            </Typography>
          </Box>
          <Typography variant="caption" noWrap sx={{ color: 'text.secondary', fontWeight: 500, display: 'block', fontSize: '0.75rem' }}>
            {item.snippet}
          </Typography>
        </Box>

        {/* Hover Micro-Action */}
        <Box 
          className="action-arrow"
          sx={{ 
            opacity: 0, 
            transform: 'translateX(-10px)',
            transition: 'all 0.2s ease',
            color: alpha(activeTheme.main, 0.5),
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ChevronRightIcon fontSize="small" />
        </Box>
      </Box>
    );
  };

  const filteredUpdates = mockUpdates.filter(item => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Jobs') return item.type === 'talent';
    if (activeFilter === 'Trade') return item.type === 'trade';
    if (activeFilter === 'Learn') return item.type === 'learn';
    return true;
  });

  return (
    <Box sx={{ maxWidth: '400px', width: '100%', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
      
      {/* Top Segmented Control (Filters) & Settings */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ 
          display: 'inline-flex', 
          bgcolor: 'rgba(0,0,0,0.04)', 
          borderRadius: 8, 
          p: 0.5 
        }}>
          {['All', 'Jobs', 'Trade', 'Learn'].map(filter => (
            <Box 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              sx={{ 
                px: 1.8, py: 0.5, borderRadius: 8, cursor: 'pointer',
                bgcolor: activeFilter === filter ? 'white' : 'transparent',
                color: activeFilter === filter ? activeTheme.main : 'text.secondary',
                fontWeight: activeFilter === filter ? 800 : 600,
                fontSize: '0.75rem',
                boxShadow: activeFilter === filter ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {filter}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Premium Agenda Widget */}
      <Box 
        component={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        sx={{
          borderRadius: 5,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: `linear-gradient(135deg, ${activeTheme.main}, ${alpha(activeTheme.main, 0.8)})`,
          color: 'white',
          boxShadow: `0 12px 32px ${alpha(activeTheme.main, 0.3)}`,
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        {/* Glow effect behind */}
        <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50%', filter: 'blur(20px)' }} />

        {/* Header / Clickable area to expand */}
        <Box 
          onClick={() => setIsAgendaExpanded(!isAgendaExpanded)}
          sx={{ 
            p: 2.5, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 1 
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: 3, minWidth: 48, minHeight: 48, border: '1px solid rgba(255,255,255,0.3)' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', opacity: 0.9 }}>
                {today.toLocaleDateString('en-US', { month: 'short' })}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 900, lineHeight: 1 }}>
                {today.toLocaleDateString('en-US', { day: 'numeric' })}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
                Today's Agenda
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 500 }}>
                2 upcoming events
              </Typography>
            </Box>
          </Box>
          
          <IconButton 
            size="small"
            sx={{ 
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              transform: isAgendaExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>

        {/* Expandable Content Area */}
        <AnimatePresence>
          {isAgendaExpanded && (
            <Box
              component={motion.div}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              sx={{ overflow: 'hidden', zIndex: 1 }}
            >
              <Box sx={{ p: 2, pt: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* Mock Event 1 */}
                <Box sx={{ 
                  display: 'flex', alignItems: 'center', gap: 1.5, 
                  bgcolor: 'rgba(255,255,255,0.1)', p: 1.5, borderRadius: 3,
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', transform: 'translateY(-1px)' }
                }}>
                  <Box sx={{ width: 4, height: 24, bgcolor: '#f59e0b', borderRadius: 4 }} />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>10:00 AM</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>Logistics Standup</Typography>
                  </Box>
                </Box>
                {/* Mock Event 2 */}
                <Box sx={{ 
                  display: 'flex', alignItems: 'center', gap: 1.5, 
                  bgcolor: 'rgba(255,255,255,0.1)', p: 1.5, borderRadius: 3,
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', transform: 'translateY(-1px)' }
                }}>
                  <Box sx={{ width: 4, height: 24, bgcolor: '#8b5cf6', borderRadius: 4 }} />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>2:00 PM</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>Vendor Meeting</Typography>
                  </Box>
                </Box>

                {/* View Full Calendar Button */}
                <Button 
                  fullWidth
                  onClick={openCalendar}
                  sx={{ 
                    mt: 1,
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    borderRadius: 3,
                    py: 1.5,
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                  }}
                >
                  Open Full Calendar
                </Button>
              </Box>
            </Box>
          )}
        </AnimatePresence>
      </Box>

      {/* Compact Feed List */}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, pl: 0.5 }}>
          Latest Activity
        </Typography>
        <AnimatePresence>
          {filteredUpdates.map((item, index) => renderFeedCard(item, index))}
        </AnimatePresence>
      </Box>
      
    </Box>
  );
}
