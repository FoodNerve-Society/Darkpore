'use client';

import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Chip, Divider, IconButton, Avatar, TextField, alpha } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import TuneIcon from '@mui/icons-material/Tune';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { motion } from 'framer-motion';

import { usePathname } from 'next/navigation';
import { getActiveTheme } from './navigation/NavThemes';

const availableNiches = [
  "Agro-Tech", "Food Processing", "Supply Chain", "Export Logistics", "Culinary Arts", 
  "Restaurant Management", "Vertical Farming", "B2B Distribution", "Food Science", "Packaging"
];

export default function UpdatesFeed() {
  const pathname = usePathname();
  const activeTheme = getActiveTheme(pathname);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Mock check for an empty feed. In a real scenario, this would check the fetched updates array.
  const hasUpdates = false; 

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
