// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, Card, Grid, CardActionArea, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useRouter } from 'next/navigation';

export default function ActivitiesUI({ updates, subcategoryId }: { updates: any[], subcategoryId: string }) {
  const router = useRouter();
  const PAGE_SIZE = 4;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleUpdates = updates.slice(0, visibleCount);
  const hasMore = visibleCount < updates.length;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 900, color: 'white', mb: 4 }}>Upcoming Field Days & Ops</Typography>
      
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {visibleUpdates.map((update, idx) => {
          // Mock data for immersive feel
          const mockDate = new Date();
          mockDate.setDate(mockDate.getDate() + (idx * 5) + 2);
          const month = mockDate.toLocaleString('default', { month: 'short' }).toUpperCase();
          const day = mockDate.getDate();
          
          return (
            <Grid item xs={12} md={6} key={`${update.id}-${idx}`}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}>
                <Card sx={{
                  display: 'flex', bgcolor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden',
                  transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.15)', transform: 'translateY(-4px)' }
                }}>
                  {/* Date Tab */}
                  <Box sx={{ 
                    bgcolor: 'rgba(255,255,255,0.05)', width: 80, display: 'flex', flexDirection: 'column', 
                    alignItems: 'center', justifyContent: 'center', p: 2, borderRight: '1px solid rgba(255,255,255,0.05)' 
                  }}>
                    <Typography variant="overline" sx={{ color: '#ff9933', fontWeight: 900, lineHeight: 1 }}>{month}</Typography>
                    <Typography variant="h3" sx={{ color: 'white', fontWeight: 900 }}>{day}</Typography>
                  </Box>

                  {/* Content */}
                  <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'rgba(255,255,255,0.4)' }}>
                      <LocationOnIcon sx={{ fontSize: 14 }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Lagos Hub</Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', mb: 1, lineHeight: 1.2 }}>{update.title}</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 3, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {update.summary}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>24 attending</Typography>
                      <Button size="small" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', borderRadius: 4, fontSize: '0.7rem', fontWeight: 800 }}>
                        RSVP
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      {hasMore && (
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Button onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }} variant="outlined">
            Load More Events
          </Button>
        </Box>
      )}

      {/* BOTTOM CTA */}
      <Box sx={{ 
        mt: 8, p: { xs: 4, md: 6 }, borderRadius: 5, textAlign: 'center',
        background: 'linear-gradient(45deg, rgba(255,153,51,0.05) 0%, rgba(255,51,102,0.05) 100%)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <EventAvailableIcon sx={{ fontSize: 48, color: '#ff9933', mb: 2, opacity: 0.8 }} />
        <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, color: 'white' }}>Never miss a field day.</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 4, maxWidth: 500, mx: 'auto' }}>
          Connect your calendar and get reminded of the activities, bootcamps, and ops that you actually love.
        </Typography>
        <Button onClick={() => router.push('/join')} variant="contained" size="large" endIcon={<ArrowForwardIcon />} sx={{ bgcolor: 'white', color: 'black', fontWeight: 800, px: 4, py: 1.5, borderRadius: 8 }}>
          Get Reminded
        </Button>
      </Box>

    </Box>
  );
}
