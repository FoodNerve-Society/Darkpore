// @ts-nocheck
'use client';

import React from 'react';
import { Box, Typography, Breadcrumbs, Link as MuiLink, Card, Chip, Button, Container } from '@mui/material';
import { motion } from 'framer-motion';
import { getTenantConfig } from '@/lib/cms';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function UpdatePage() {
  const { challenge: challengeId, subcategory: subcategoryId, section, updateId } = useParams();
  const router = useRouter();
  
  const config = getTenantConfig('food');
  const challenge = config.com.homepage.challenges.find((c: any) => c.id === challengeId);
  const subcategory = challenge?.subcategories?.find((s: any) => s.id === subcategoryId);
  const rawUpdate = subcategory?.updates?.find((u: any) => u.id === updateId);
  const rawMaterial = subcategory?.learningMaterials?.find((m: any) => m.slug === updateId);

  if (!challenge || !subcategory || (!rawUpdate && !rawMaterial)) {
    return <Box sx={{ p: 4, pt: 12, color: 'white' }}>Update not found.</Box>;
  }

  const update = rawMaterial ? {
    id: rawMaterial.slug,
    title: rawMaterial.title,
    summary: rawMaterial.previewText || rawMaterial.fullContent,
    date: rawMaterial.dateAdded || new Date().toISOString(),
    importance: 'normal',
    linkText: 'Access Material',
    author: rawMaterial.author,
    readTime: rawMaterial.readTime,
    isPremium: rawMaterial.isPremium,
    type: rawMaterial.type
  } : rawUpdate;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#050505', color: 'white' }}>

      {/* ═══════════════════════════════════════════════════════════
          HEADER — Breadcrumbs + Back nav
      ═══════════════════════════════════════════════════════════ */}
      <Box sx={{ 
        pt: { xs: 16, md: 22 }, 
        pb: { xs: 6, md: 8 },
        position: 'relative',
      }}>
        {/* Subtle background glow */}
        <Box sx={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: update.importance === 'high' 
            ? 'radial-gradient(ellipse at 30% 30%, rgba(255,51,102,0.06) 0%, transparent 50%)'
            : 'radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.02) 0%, transparent 50%)',
          zIndex: 0
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 4, '& .MuiBreadcrumbs-separator': { color: 'rgba(255,255,255,0.3)' } }}>
            <MuiLink component={Link} href="/" underline="hover" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1, textTransform: 'uppercase' }}>
              Innovations
            </MuiLink>
            <MuiLink component={Link} href={`/${challenge.id}`} underline="hover" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1, textTransform: 'uppercase' }}>
              {challenge.title}
            </MuiLink>
            <MuiLink component={Link} href={`/${challenge.id}/${subcategory.id}`} underline="hover" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1, textTransform: 'uppercase' }}>
              {subcategory.title}
            </MuiLink>
            <MuiLink component={Link} href={`/${challenge.id}/${subcategory.id}/${section}`} underline="hover" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1, textTransform: 'uppercase' }}>
              {section}
            </MuiLink>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1 }}>
              Update
            </Typography>
          </Breadcrumbs>

          {/* Back button */}
          <Button 
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            sx={{ 
              color: 'rgba(255,255,255,0.4)', fontWeight: 700, mb: 4,
              '&:hover': { color: 'white' },
            }}
          >
            Back
          </Button>
        </Container>
      </Box>


      {/* ═══════════════════════════════════════════════════════════
          UPDATE DETAIL — Full article card
      ═══════════════════════════════════════════════════════════ */}
      <Container maxWidth="md" sx={{ pb: 15 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          
          {/* Metadata row */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip 
              label={(section as string || '').toUpperCase()} 
              size="small"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.08)', 
                color: 'rgba(255,255,255,0.6)', 
                fontWeight: 700,
                fontSize: '0.7rem',
              }} 
            />
            {update.importance === 'high' && (
              <Chip 
                label="HIGH PRIORITY" 
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255, 68, 68, 0.15)', 
                  color: '#ff6666', 
                  fontWeight: 700,
                  fontSize: '0.7rem',
                }} 
              />
            )}
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', letterSpacing: 1 }}>
              {new Date(update.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </Typography>
          </Box>

          {/* Title */}
          <Typography variant="h2" component="h1" sx={{ fontWeight: 900, mb: 4, fontSize: { xs: '2rem', md: '3.2rem' }, lineHeight: 1.1 }}>
            {update.title}
          </Typography>

          {/* Context chips */}
          <Box sx={{ display: 'flex', gap: 2, mb: 6, flexWrap: 'wrap' }}>
            <Chip 
              label={`Challenge: ${challenge.title}`}
              variant="outlined"
              size="small"
              sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}
            />
            <Chip 
              label={`Sub: ${subcategory.title}`}
              variant="outlined"
              size="small"
              sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}
            />
          </Box>

          {/* Main content card */}
          <Card sx={{ 
            bgcolor: 'rgba(20, 20, 20, 0.5)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 5,
            p: { xs: 4, md: 6 },
            mb: 6,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {update.importance === 'high' && (
              <Box sx={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '4px',
                background: 'linear-gradient(90deg, #ff3366, #ff9933)',
              }} />
            )}
            <Typography variant="h5" sx={{ fontWeight: 400, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
              {update.summary}
            </Typography>
          </Card>

          {/* CTA */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                bgcolor: 'white', color: '#0a0a0a', borderRadius: 8, px: 5, py: 1.5,
                fontWeight: 'bold', fontSize: '1rem',
                boxShadow: '0 8px 30px rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              }}
            >
              {update.linkText || 'Learn More'}
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => router.push(`/${challenge.id}/${subcategory.id}`)}
              sx={{ 
                color: 'white', borderColor: 'rgba(255,255,255,0.15)', borderRadius: 8, px: 5, py: 1.5,
                fontWeight: 'bold', fontSize: '1rem',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' },
              }}
            >
              Back to {subcategory.title}
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
