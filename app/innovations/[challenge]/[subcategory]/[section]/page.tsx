// @ts-nocheck
'use client';

import React from 'react';
import { Box, Typography, Breadcrumbs, Link as MuiLink, Card, CardActionArea, Chip, Container, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { getTenantConfig } from '@/lib/cms';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InnovationsUI from '../../../components/section-layouts/InnovationsUI';
import LibraryUI from '../../../components/section-layouts/LibraryUI';
import CommunityUI from '../../../components/section-layouts/CommunityUI';
import ActivitiesUI from '../../../components/section-layouts/ActivitiesUI';
import JobsUI from '../../../components/section-layouts/JobsUI';

export default function SectionPage() {
  const { challenge: challengeId, subcategory: subcategoryId, section } = useParams();
  const router = useRouter();
  
  const config = getTenantConfig('food');
  const challenge = config.com.homepage.challenges.find((c: any) => c.id === challengeId);
  const subcategory = challenge?.subcategories?.find((s: any) => s.id === subcategoryId);

  if (!challenge || !subcategory) {
    return <Box sx={{ p: 4, pt: 12, color: 'white' }}>Data not found.</Box>;
  }

  const sectionData = subcategory.sections?.[section as string];
  const updates = (subcategory.updates || []).filter((u: any) => u.section === section);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#050505', color: 'white' }}>

      {/* ═══════════════════════════════════════════════════════════
          HERO — Section header with breadcrumbs
      ═══════════════════════════════════════════════════════════ */}
      <Box sx={{ 
        position: 'relative',
        pt: { xs: 18, md: 24 }, 
        pb: { xs: 8, md: 12 },
        overflow: 'hidden',
      }}>
        {/* Subtle gradient bg */}
        <Box sx={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse at 30% 40%, rgba(255,51,102,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(255,153,51,0.04) 0%, transparent 50%)',
          zIndex: 0
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 4, '& .MuiBreadcrumbs-separator': { color: 'rgba(255,255,255,0.3)' } }}>
            <MuiLink component={Link} href="/challenges" underline="hover" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1, textTransform: 'uppercase' }}>
              Challenges
            </MuiLink>
            <MuiLink component={Link} href={`/${challenge.id}`} underline="hover" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1, textTransform: 'uppercase' }}>
              {challenge.title}
            </MuiLink>
            <MuiLink component={Link} href={`/${challenge.id}/${subcategory.id}`} underline="hover" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1, textTransform: 'uppercase' }}>
              {subcategory.title}
            </MuiLink>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1, textTransform: 'uppercase' }}>
              {sectionData?.title || section}
            </Typography>
          </Breadcrumbs>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Typography variant="overline" sx={{ color: 'error.main', fontWeight: 900, letterSpacing: 4, mb: 2, display: 'block', fontSize: '0.85rem' }}>
              {(section as string || '').toUpperCase()}
            </Typography>
            <Typography variant="h2" component="h1" sx={{ fontWeight: 900, mb: 3, fontSize: { xs: '2.2rem', md: '3.5rem' }, lineHeight: 1.1 }}>
              {sectionData?.title || section}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.5, mb: 0, lineHeight: 1.7, maxWidth: 700 }}>
              {sectionData?.content}
            </Typography>
          </motion.div>
        </Container>
      </Box>


      {/* ═══════════════════════════════════════════════════════════
          LOCKED CONTENT BANNER (if exists)
      ═══════════════════════════════════════════════════════════ */}
      {sectionData?.lockedContent && (
        <Container maxWidth="lg" sx={{ mb: 8 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card sx={{
              bgcolor: 'rgba(255, 68, 68, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 68, 68, 0.2)',
              borderRadius: 5,
              p: { xs: 4, md: 6 },
              position: 'relative',
              overflow: 'hidden',
            }}>
              <Box sx={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '4px',
                background: 'linear-gradient(90deg, #ff3366, #ff9933)',
              }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff4444', animation: 'pulse 2s infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.4 } } }} />
                <Typography variant="overline" sx={{ color: '#ff4444', fontWeight: 900, letterSpacing: 3 }}>
                  FEATURED OPPORTUNITY
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', mb: 2 }}>
                {sectionData.lockedContent.title}
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 4, lineHeight: 1.7, maxWidth: 700 }}>
                {sectionData.lockedContent.content}
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  bgcolor: 'white', color: '#0a0a0a', borderRadius: 8, px: 5, py: 1.5,
                  fontWeight: 'bold', fontSize: '0.95rem',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                }}
              >
                {sectionData.lockedContent.ctaText}
              </Button>
            </Card>
          </motion.div>
        </Container>
      )}


      {/* ═══════════════════════════════════════════════════════════
          SWITCHBOARD UI
      ═══════════════════════════════════════════════════════════ */}
      <Container maxWidth="lg" sx={{ pb: 15 }}>
        {updates.length === 0 ? (
          <Box sx={{ 
            py: 10, textAlign: 'center', 
            bgcolor: 'rgba(255,255,255,0.02)', 
            borderRadius: 4, 
            border: '1px dashed rgba(255,255,255,0.1)' 
          }}>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.25)', fontWeight: 700 }}>
              No updates in this section yet.
            </Typography>
          </Box>
        ) : (
          <Box>
            {section === 'innovations' && <InnovationsUI updates={updates} subcategoryId={subcategoryId as string} />}
            {section === 'library' && <LibraryUI updates={updates} subcategoryId={subcategoryId as string} />}
            {section === 'community' && <CommunityUI updates={updates} subcategoryId={subcategoryId as string} />}
            {section === 'activities' && <ActivitiesUI updates={updates} subcategoryId={subcategoryId as string} />}
            {section === 'jobs' && <JobsUI updates={updates} subcategoryId={subcategoryId as string} />}
          </Box>
        )}
      </Container>
    </Box>
  );
}
