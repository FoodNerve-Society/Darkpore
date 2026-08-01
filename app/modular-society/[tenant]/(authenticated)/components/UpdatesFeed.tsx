'use client';

import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Chip, Divider, IconButton, Avatar, TextField, alpha } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import TuneIcon from '@mui/icons-material/Tune';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { motion } from 'framer-motion';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';

import { usePathname } from 'next/navigation';
import { getActiveTheme } from './navigation/NavThemes';
import { useCalendarOverlay } from '@/context/CalendarOverlayContext';

const availableNiches = [
  "Agro-Tech", "Food Processing", "Supply Chain", "Export Logistics", "Culinary Arts", 
  "Restaurant Management", "Vertical Farming", "B2B Distribution", "Food Science", "Packaging"
];

export default function UpdatesFeed() {
  const pathname = usePathname();
  const activeTheme = getActiveTheme(pathname);
  const { openCalendar } = useCalendarOverlay();
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Mock check for an empty feed. In a real scenario, this would check the fetched updates array.
  const hasUpdates = false; 

  // Format today's date
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const toggleNiche = (niche: string) => {
    setSelectedNiches(prev => 
      prev.includes(niche) ? prev.filter(n => n !== niche) : [...prev, niche]
    );
  };

  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
      
      {/* Top Filter & Command Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
          {['All', 'Following', 'Trade', 'Learn', 'Meet'].map(filter => (
            <Chip 
              key={filter} 
              label={filter} 
              onClick={() => setActiveFilter(filter)}
              sx={{ 
                fontWeight: activeFilter === filter ? 800 : 500,
                bgcolor: activeFilter === filter ? activeTheme.main : alpha(activeTheme.main, 0.08),
                color: activeFilter === filter ? 'white' : 'text.primary',
                '&:hover': { bgcolor: activeFilter === filter ? activeTheme.main : alpha(activeTheme.main, 0.15) }
              }} 
            />
          ))}
        </Box>
        <IconButton size="small" sx={{ border: `1px solid ${alpha(activeTheme.main, 0.15)}` }}>
          <TuneIcon fontSize="small" sx={{ color: activeTheme.main }} />
        </IconButton>
      </Box>

      {/* Calendar Glance Card */}
      <Card 
        component={motion.div}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{ 
          borderRadius: 4, 
          bgcolor: alpha(activeTheme.main, 0.05),
          border: `1px solid ${alpha(activeTheme.main, 0.1)}`,
          boxShadow: 'none',
          overflow: 'visible'
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, bgcolor: activeTheme.main, borderRadius: 2, color: 'white', display: 'flex' }}>
              <CalendarMonthIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', textTransform: 'uppercase', letterSpacing: 1 }}>
                Today's Agenda
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {dateString}
              </Typography>
            </Box>
          </Box>
          
          <Button 
            size="small"
            variant="outlined"
            onClick={openCalendar}
            endIcon={<OpenInFullIcon sx={{ fontSize: '14px !important' }} />}
            sx={{ 
              borderRadius: 8, 
              fontWeight: 800,
              borderColor: alpha(activeTheme.main, 0.3),
              color: activeTheme.main,
              '&:hover': { bgcolor: alpha(activeTheme.main, 0.1), borderColor: activeTheme.main }
            }}
          >
            Expand
          </Button>
        </Box>
        <Divider sx={{ borderColor: alpha(activeTheme.main, 0.1) }} />
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
          <Chip label="No events scheduled for today" size="small" sx={{ bgcolor: 'rgba(0,0,0,0.05)', color: 'text.secondary', fontWeight: 600 }} />
        </Box>
      </Card>

      {/* Main Feed Area */}
      {!hasUpdates ? (
        <Card component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ borderRadius: 4, border: `1px dashed ${alpha(activeTheme.main, 0.25)}`, boxShadow: 'none', bgcolor: 'transparent' }}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <RssFeedIcon sx={{ fontSize: 60, color: alpha(activeTheme.main, 0.2), mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Your Ecosystem is Quiet</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
              Your feed is currently empty because you haven't curated your interests yet. Select the niches below to start receiving highly targeted updates, opportunities, and trade deals.
            </Typography>

            <Divider sx={{ mb: 4 }}><Chip label="CURATE YOUR FEED" size="small" sx={{ bgcolor: alpha(activeTheme.main, 0.1), color: activeTheme.main, fontWeight: 700 }} /></Divider>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', maxWidth: 600, mx: 'auto' }}>
              {availableNiches.map(niche => (
                <Chip
                  key={niche}
                  label={niche}
                  onClick={() => toggleNiche(niche)}
                  icon={selectedNiches.includes(niche) ? <ControlPointIcon sx={{ transform: 'rotate(45deg)', color: `${activeTheme.main} !important` }} /> : <ControlPointIcon sx={{ color: `${alpha(activeTheme.main, 0.5)} !important` }} />}
                  sx={{
                    px: 1, py: 2.5, borderRadius: 2,
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: selectedNiches.includes(niche) ? activeTheme.main : alpha(activeTheme.main, 0.15),
                    bgcolor: selectedNiches.includes(niche) ? alpha(activeTheme.main, 0.08) : 'background.paper',
                    color: selectedNiches.includes(niche) ? activeTheme.main : 'text.secondary',
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </Box>

            <Box sx={{ mt: 5 }}>
              <Button 
                variant="contained" 
                size="large" 
                disabled={selectedNiches.length === 0}
                sx={{ 
                  borderRadius: 8, 
                  px: 6, 
                  py: 1.5, 
                  fontWeight: 800,
                  bgcolor: activeTheme.main,
                  '&:hover': { bgcolor: activeTheme.main }
                }}
              >
                Save Preferences & Load Feed
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {/* Real updates will be mapped here */}
        </Box>
      )}

    </Box>
  );
}
