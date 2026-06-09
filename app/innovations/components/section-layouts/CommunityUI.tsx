// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, Avatar, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useRouter } from 'next/navigation';

export default function CommunityUI({ updates, subcategoryId }: { updates: any[], subcategoryId: string }) {
  const router = useRouter();
  const PAGE_SIZE = 5;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleUpdates = updates.slice(0, visibleCount);
  const hasMore = visibleCount < updates.length;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h3" sx={{ fontWeight: 900, color: 'white', mb: 2 }}>Impact Log</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)' }}>A live ledger of actual things built, fixed, and solved by this community.</Typography>
      </Box>

      <Box sx={{ position: 'relative', mb: 6 }}>
        {/* Vertical Line */}
        <Box sx={{ position: 'absolute', left: { xs: 24, md: 40 }, top: 0, bottom: 0, width: 2, bgcolor: 'rgba(255,255,255,0.05)' }} />

        {visibleUpdates.map((update, idx) => (
          <motion.div key={`${update.id}-${idx}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
            <Box sx={{ display: 'flex', gap: { xs: 3, md: 4 }, mb: 4, position: 'relative' }}>
              
              {/* Timeline Dot & Avatar */}
              <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar src={`https://i.pravatar.cc/150?u=${update.id}`} sx={{ width: { xs: 48, md: 64 }, height: { xs: 48, md: 64 }, border: '4px solid #050505' }} />
              </Box>

              {/* Content Card */}
              <Box sx={{ 
                flex: 1, p: 3, borderRadius: 4, 
                bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                    {update.title} <VerifiedIcon sx={{ color: '#00e676', fontSize: 18 }} />
                  </Typography>
                  <Chip label="COMPLETED" size="small" sx={{ bgcolor: 'rgba(0,230,118,0.1)', color: '#00e676', fontWeight: 800, fontSize: '0.6rem' }} />
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, mb: 2 }}>{update.summary}</Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ width: 20, height: 20, mr: -1, border: '2px solid #1a1a1a' }} />
                    <Avatar sx={{ width: 20, height: 20, mr: -1, border: '2px solid #1a1a1a' }} />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', ml: 2, fontWeight: 700 }}>+12 Contributors</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>• {new Date(update.date).toLocaleDateString()}</Typography>
                </Box>
              </Box>

            </Box>
          </motion.div>
        ))}
      </Box>

      {hasMore && (
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Button onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }} variant="outlined">
            Load More Impact
          </Button>
        </Box>
      )}

      {/* BOTTOM CTA - Psychological Hook */}
      <Box sx={{ 
        mt: 8, p: { xs: 4, md: 8 }, borderRadius: 6, textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(20,20,20,1) 0%, rgba(5,5,5,1) 100%)',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, letterSpacing: 3, display: 'block', mb: 2 }}>
          EXCLUSIVE ACCESS
        </Typography>
        <Typography variant="h2" sx={{ fontWeight: 900, mb: 3, color: 'white', fontSize: { xs: '2rem', md: '3rem' }, lineHeight: 1.1 }}>
          Are you built for this?
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', mb: 5, maxWidth: 500, mx: 'auto', fontSize: '1.1rem' }}>
          This community is strictly curated for doers. Take the assessment to see if your psychological profile and execution speed fits into the Society.
        </Typography>
        <Button onClick={() => router.push('/join')} variant="contained" size="large" endIcon={<ArrowForwardIcon />} sx={{ bgcolor: 'white', color: 'black', fontWeight: 900, px: 5, py: 2, borderRadius: 8, fontSize: '1rem' }}>
          Take the Test
        </Button>
      </Box>

    </Box>
  );
}
