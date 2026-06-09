// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, Card, Grid, LinearProgress, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function InnovationsUI({ updates, subcategoryId }: { updates: any[], subcategoryId: string }) {
  const router = useRouter();
  const PAGE_SIZE = 6;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleUpdates = updates.slice(0, visibleCount);
  const hasMore = visibleCount < updates.length;

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {visibleUpdates.map((update, idx) => {
          // Mock data for immersive feel
          const mockRaised = Math.floor(Math.random() * 80) + 10;
          const mockGoal = 100;
          const progress = (mockRaised / mockGoal) * 100;
          
          return (
            <Grid item xs={12} md={6} lg={4} key={`${update.id}-${idx}`}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <Card sx={{
                  p: 3, height: '100%', display: 'flex', flexDirection: 'column',
                  bgcolor: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4,
                  transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', borderColor: 'rgba(255,255,255,0.2)' }
                }}>
                  <Chip label="SEED STAGE" size="small" sx={{ mb: 2, alignSelf: 'flex-start', bgcolor: 'rgba(0,230,118,0.1)', color: '#00e676', fontWeight: 800, fontSize: '0.65rem' }} />
                  
                  <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: 'white' }}>{update.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 3, flex: 1, lineHeight: 1.6 }}>{update.summary}</Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 700 }}>${mockRaised}k Raised</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>Goal: ${mockGoal}k</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#00e676', borderRadius: 3 } }} />
                  </Box>

                  <Button variant="contained" fullWidth sx={{ bgcolor: 'white', color: 'black', fontWeight: 800, borderRadius: 2, '&:hover': { bgcolor: '#f0f0f0' } }}>
                    Review Pitch Deck
                  </Button>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      {hasMore && (
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Button onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }} variant="outlined">
            Load More Startups
          </Button>
        </Box>
      )}

      {/* BOTTOM CTA */}
      <Box sx={{ 
        mt: 8, p: { xs: 4, md: 6 }, borderRadius: 5, textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        border: '1px solid rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden'
      }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #ff3366, #ff9933)' }} />
        <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, color: 'white' }}>Are you building a solution?</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 4, maxWidth: 600, mx: 'auto' }}>
          Get funded by the Society or backed by external partners looking for groundbreaking innovations in this subchallenge.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button onClick={() => router.push('/join')} variant="contained" size="large" endIcon={<ArrowForwardIcon />} sx={{ bgcolor: 'white', color: 'black', fontWeight: 800, px: 4, py: 1.5, borderRadius: 8 }}>
            Submit your Innovation
          </Button>
          <Button onClick={() => router.push('/join')} variant="outlined" size="large" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', fontWeight: 800, px: 4, py: 1.5, borderRadius: 8 }}>
            Contact us to Invest
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
