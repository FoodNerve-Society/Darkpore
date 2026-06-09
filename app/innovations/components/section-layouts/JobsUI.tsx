// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, Card, Chip, CardActionArea } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WorkIcon from '@mui/icons-material/Work';
import { useRouter } from 'next/navigation';

export default function JobsUI({ updates, subcategoryId }: { updates: any[], subcategoryId: string }) {
  const router = useRouter();
  const PAGE_SIZE = 6;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleUpdates = updates.slice(0, visibleCount);
  const hasMore = visibleCount < updates.length;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 900, color: 'white', mb: 4 }}>Bounties & Roles</Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 6 }}>
        {visibleUpdates.map((update, idx) => {
          // Mock data for immersive feel
          const mockSalary = Math.floor(Math.random() * 500) + 100;
          const isBounty = idx % 2 === 0;
          
          return (
            <motion.div key={`${update.id}-${idx}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Card sx={{
                bgcolor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.05)', borderRadius: 3,
                transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)', transform: 'scale(1.01)' }
              }}>
                <CardActionArea sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, gap: 3 }}>
                  
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                      <Chip label={isBounty ? 'BOUNTY' : 'FULL-TIME'} size="small" sx={{ bgcolor: isBounty ? 'rgba(255,153,51,0.1)' : 'rgba(51,204,255,0.1)', color: isBounty ? '#ff9933' : '#33ccff', fontWeight: 800, fontSize: '0.6rem' }} />
                      <Chip label="REMOTE" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontWeight: 800, fontSize: '0.6rem' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', mb: 0.5 }}>{update.title}</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {update.summary}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, width: { xs: '100%', md: 'auto' }, justifyContent: 'space-between' }}>
                    <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                      <Typography variant="body1" sx={{ color: '#00e676', fontWeight: 900 }}>{mockSalary}k NGN</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{isBounty ? 'Fixed Payment' : 'Per Month'}</Typography>
                    </Box>
                    
                    <Button variant="contained" sx={{ bgcolor: 'white', color: 'black', fontWeight: 800, borderRadius: 2, px: 3, '&:hover': { bgcolor: '#f0f0f0' } }}>
                      Apply
                    </Button>
                  </Box>

                </CardActionArea>
              </Card>
            </motion.div>
          );
        })}
      </Box>

      {hasMore && (
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Button onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }} variant="outlined">
            Load More Jobs
          </Button>
        </Box>
      )}

      {/* BOTTOM CTA */}
      <Box sx={{ 
        mt: 8, p: { xs: 4, md: 6 }, borderRadius: 5, textAlign: 'center',
        bgcolor: 'rgba(51,204,255,0.02)',
        border: '1px solid rgba(51,204,255,0.1)'
      }}>
        <WorkIcon sx={{ fontSize: 48, color: '#33ccff', mb: 2, opacity: 0.8 }} />
        <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, color: 'white' }}>Get notified of new jobs.</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 4, maxWidth: 500, mx: 'auto' }}>
          Stop checking manually. Join the Society to get instant alerts when tenders and high-paying roles matching your skill set are posted.
        </Typography>
        <Button onClick={() => router.push('/join')} variant="contained" size="large" endIcon={<ArrowForwardIcon />} sx={{ bgcolor: 'white', color: 'black', fontWeight: 800, px: 4, py: 1.5, borderRadius: 8 }}>
          Setup Job Alerts
        </Button>
      </Box>

    </Box>
  );
}
