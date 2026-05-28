'use client';

import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BottleneckData } from '@/lib/cms/types';

export default function ClientBottleneckHero({ bottleneckData }: { bottleneckData: BottleneckData }) {
  const pathname = usePathname();
  
  // If the pathname is exactly `/[bottleneck]`, show the massive hero.
  // Otherwise, we're in a sub-section (like `/innovations` or a detail page), so show the slim header.
  const isMasterFeed = pathname.endsWith(`/${bottleneckData.id}`) || pathname === `/${bottleneckData.id}`;

  if (isMasterFeed) {
    const highPriorityUpdates = bottleneckData.updates.filter(u => u.importance === 'high');

    return (
      <>
        <Box sx={{ 
          position: 'relative',
          color: 'white', 
          pt: { xs: 20, md: 28 }, 
          pb: { xs: 15, md: 20 },
          mb: 8,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Background Image */}
          <Box sx={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${bottleneckData.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000&auto=format&fit=crop'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.3) saturate(1.2)',
            zIndex: 0
          }} />
          
          {/* Gradient Overlay */}
          <Box sx={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to bottom, rgba(5,5,5,0.2) 0%, rgba(5,5,5,0.9) 80%, #050505 100%)',
            zIndex: 1
          }} />
          
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <Typography variant="overline" sx={{ color: 'error.main', fontWeight: 900, letterSpacing: 4, mb: 2, display: 'block', fontSize: '0.85rem' }}>
              BOTTLENECK DASHBOARD
            </Typography>
            <Typography variant="h1" component="h1" sx={{ fontWeight: 900, textTransform: 'capitalize', mb: 3, fontSize: { xs: '3rem', md: '5rem' }, lineHeight: 1 }}>
              {bottleneckData.title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 400, opacity: 0.8, mb: 6, lineHeight: 1.6, maxWidth: 800, mx: 'auto' }}>
              {bottleneckData.longDesc}
            </Typography>

            {/* Stats Row */}
            {bottleneckData.stats && (
              <Box sx={{ display: 'flex', gap: { xs: 2, md: 4 }, justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                  { label: 'Active Solutions', value: bottleneckData.stats.activeSolutions },
                  { label: 'Capital Deployed', value: bottleneckData.stats.capitalDeployed },
                  { label: 'Community', value: bottleneckData.stats.communitySize },
                ].map((stat, idx) => (
                  <Box key={idx} sx={{
                    bgcolor: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 4,
                    px: 4, py: 2.5,
                    minWidth: 160,
                  }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: 'white' }}>
                      {stat.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Container>
        </Box>

        {/* ═══════════════════════════════════════════════════════════
            THE DYNAMIC HOOKS (HIGH PRIORITY UPDATES MARQUEE)
        ═══════════════════════════════════════════════════════════ */}
        {highPriorityUpdates.length > 0 && (
          <Box sx={{ 
            py: 3, 
            bgcolor: 'rgba(255, 68, 68, 0.1)', 
            borderTop: '1px solid rgba(255, 68, 68, 0.2)',
            borderBottom: '1px solid rgba(255, 68, 68, 0.2)',
            overflow: 'hidden',
            mb: 8
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 4, mb: 1.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff4444', mr: 1.5, animation: 'pulse 2s infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.4 } } }} />
              <Typography variant="overline" sx={{ color: '#ff4444', fontWeight: 900, letterSpacing: 3 }}>
                URGENT DEPLOYMENTS
              </Typography>
            </Box>
            <Box sx={{
              display: 'flex',
              animation: 'marquee 40s linear infinite',
              '&:hover': { animationPlayState: 'paused' },
              '@keyframes marquee': { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
              width: 'max-content',
            }}>
              {[...highPriorityUpdates, ...highPriorityUpdates, ...highPriorityUpdates].map((update, idx) => (
                <Link key={`${update.id}-${idx}`} href={`/${bottleneckData.id}/${update.section}`} passHref style={{ textDecoration: 'none', flexShrink: 0 }}>
                  <Box sx={{ 
                    display: 'flex', alignItems: 'center', gap: 3, mr: 6, px: 4, py: 1.5, 
                    borderRadius: 8, bgcolor: 'rgba(255, 255, 255, 0.05)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', transition: 'all 0.2s', cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 68, 68, 0.4)' },
                    minWidth: 400
                  }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {update.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {update.summary}
                      </Typography>
                    </Box>
                    <Button variant="contained" size="small" sx={{ bgcolor: 'white', color: 'black', borderRadius: 4, fontWeight: 800, whiteSpace: 'nowrap', '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' } }}>
                      {update.linkText}
                    </Button>
                  </Box>
                </Link>
              ))}
            </Box>
          </Box>
        )}

      </>
    );
  }

  // Slim context header for sub-pages — compact bar just under navbar
  return null;
}
