// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, Card, Grid, CardActionArea, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { useRouter } from 'next/navigation';

export default function LibraryUI({ updates, subcategoryId }: { updates: any[], subcategoryId: string }) {
  const router = useRouter();
  const PAGE_SIZE = 8;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleUpdates = updates.slice(0, visibleCount);
  const hasMore = visibleCount < updates.length;

  return (
    <Box>
      {/* LIVESTREAM BANNER */}
      <Box sx={{ 
        mb: 8, p: { xs: 4, md: 8 }, borderRadius: 6, position: 'relative', overflow: 'hidden',
        bgcolor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1594904578869-c011783103c7?q=80&w=2000)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3 }} />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #0a0a0a 20%, transparent 100%)' }} />
        
        <Box sx={{ position: 'relative', zIndex: 2, maxWidth: 600 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ff3366', animation: 'pulse 2s infinite' }} />
            <Typography variant="overline" sx={{ color: '#ff3366', fontWeight: 900, letterSpacing: 2 }}>LIVE MASTERCLASS</Typography>
          </Box>
          <Typography variant="h2" sx={{ fontWeight: 900, color: 'white', mb: 2, lineHeight: 1.1 }}>The Future of Cold Storage Architecture</Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 4, fontSize: '1.1rem' }}>Join the live breakdown with Dr. Amina as we explore zero-energy cooling solutions for rural hubs.</Typography>
          <Button variant="contained" size="large" sx={{ bgcolor: '#ff3366', color: 'white', fontWeight: 800, px: 4, py: 1.5, borderRadius: 8, '&:hover': { bgcolor: '#e62e5c' } }}>
            Join Stream Now
          </Button>
        </Box>
      </Box>

      {/* NOTION STYLE GRID */}
      <Typography variant="h5" sx={{ fontWeight: 900, color: 'white', mb: 4 }}>Research & Media</Typography>
      <Grid container spacing={2} sx={{ mb: 6 }}>
        {visibleUpdates.map((update, idx) => {
          const isVideo = idx % 3 === 0; // Mock determining if it's a video vs pdf
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={`${update.id}-${idx}`}>
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card sx={{
                  height: '100%', bgcolor: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.05)', borderRadius: 3,
                  transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)' }
                }}>
                  <CardActionArea sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Box sx={{ mb: 2, color: isVideo ? '#33ccff' : '#ff9933' }}>
                      {isVideo ? <PlayArrowRoundedIcon sx={{ fontSize: 32 }} /> : <PictureAsPdfIcon sx={{ fontSize: 32 }} />}
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: 'white', mb: 1, lineHeight: 1.3 }}>{update.title}</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', mt: 'auto' }}>
                      {isVideo ? '45 min watch' : '12 min read'} • Society Docs
                    </Typography>
                  </CardActionArea>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      {hasMore && (
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Button onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }} variant="outlined">
            Load More Documents
          </Button>
        </Box>
      )}

      {/* BOTTOM CTA */}
      <Box sx={{ 
        mt: 8, p: { xs: 4, md: 6 }, borderRadius: 5, textAlign: 'center',
        background: 'rgba(255,255,255,0.02)',
        border: '1px dashed rgba(255,255,255,0.2)'
      }}>
        <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, color: 'white' }}>Contribute to the Library</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 4, maxWidth: 600, mx: 'auto' }}>
          Have you solved a massive problem? Don't keep it to yourself. Write your own articles or join the society to add comments to existing research.
        </Typography>
        <Button onClick={() => router.push('/join')} variant="contained" size="large" endIcon={<ArrowForwardIcon />} sx={{ bgcolor: 'white', color: 'black', fontWeight: 800, px: 4, py: 1.5, borderRadius: 8 }}>
          Write your own article
        </Button>
      </Box>
    </Box>
  );
}
