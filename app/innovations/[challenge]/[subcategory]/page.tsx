// @ts-nocheck
'use client';

import React, { useEffect } from 'react';
import { Box, Typography, Grid, Card, CardActionArea, Breadcrumbs, Link as MuiLink, Container, Chip, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { getTenantConfig } from '@/lib/cms';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import WorkIcon from '@mui/icons-material/Work';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import BottleneckDashboardTabs from '../../components/BottleneckDashboardTabs';
import VideoModal from '../../components/VideoModal';
import TimeSensitiveAlertBar from '../../components/TimeSensitiveAlertBar';
import { getSubcategoryUpdates, getSubcategoryLearningMaterials } from '@/lib/actions/db';

const SECTIONS = [
  { id: 'innovations', title: 'Innovations', icon: '🚀', desc: 'Breakthrough R&D and 0-to-1 deployments.' },
  { id: 'library', title: 'The Library', icon: '📚', desc: 'Open-source research, papers, and schematics.' },
  { id: 'community', title: 'Community', icon: '🤝', desc: 'Connect with operators solving this problem.' },
  { id: 'activities', title: 'Activities', icon: '📅', desc: 'Bootcamps, workshops, and grassroots events.' },
  { id: 'livestreams', title: 'Livestreams', icon: '🔴', desc: 'Live discussions and real-time operator intel.' },
  { id: 'jobs', title: 'Jobs & Earn', icon: '💼', desc: 'Tenders, roles, and earning opportunities.' },
];

export default function SubcategoryPage() {
  const { challenge: challengeId, subcategory: subcategoryId } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [videoOpen, setVideoOpen] = React.useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  const config = getTenantConfig('food');
  const challenge = config.com.homepage.challenges.find((c: any) => c.id === challengeId);
  const subcategory = challenge?.subcategories?.find((s: any) => s.id === subcategoryId);

  if (!challenge || !subcategory) {
    return (
      <Box sx={{ p: 4, pt: 12, color: 'white', textAlign: 'center' }}>
        <Typography variant="h5">Subcategory not found.</Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.5)', mt: 2 }}>
          Params received: challenge={String(challengeId)}, subcategory={String(subcategoryId)}
        </Typography>
      </Box>
    );
  }

  const [recentUpdates, setRecentUpdates] = React.useState<any[]>([]);
  const [learningMaterials, setLearningMaterials] = React.useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const updates = await getSubcategoryUpdates(subcategoryId as string);
      const materials = await getSubcategoryLearningMaterials(subcategoryId as string);
      
      const sortedUpdates = [...updates].sort((a, b) => {
        if (a.importance === 'high' && b.importance !== 'high') return -1;
        if (b.importance === 'high' && a.importance !== 'high') return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      setRecentUpdates(sortedUpdates);
      setLearningMaterials(materials);
    };
    fetchData();
  }, [subcategoryId]);

  const articleCount = recentUpdates.filter(u => u.section === 'library').length || learningMaterials.length || 5;
  const initiativeCount = recentUpdates.filter(u => u.section === 'innovations').length || 3;
  const jobCount = recentUpdates.filter(u => u.section === 'jobs').length || 2;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#050505', color: 'white' }}>
      <TimeSensitiveAlertBar />

      {/* ════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════ */}
      <Box sx={{
        position: 'relative',
        pt: { xs: 18, md: 26 },
        pb: { xs: 10, md: 14 },
        overflow: 'hidden',
      }}>
        <Box sx={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${subcategory.imageUrl || challenge.imageUrl})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.25) saturate(1.3)', zIndex: 0,
        }} />
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(5,5,5,0.5) 0%, rgba(5,5,5,0.9) 70%, #050505 100%)',
          zIndex: 1,
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 4, '& .MuiBreadcrumbs-separator': { color: 'rgba(255,255,255,0.2)' } }}>
            <MuiLink component={Link} href="/challenges" underline="hover" sx={{ color: 'rgba(255,255,255,0.35)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1, textTransform: 'uppercase' }}>
              Challenges
            </MuiLink>
            <MuiLink component={Link} href={`/${challenge.id}`} underline="hover" sx={{ color: 'rgba(255,255,255,0.35)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1, textTransform: 'uppercase' }}>
              {challenge.title}
            </MuiLink>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1, textTransform: 'uppercase' }}>
              {subcategory.title}
            </Typography>
          </Breadcrumbs>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: { xs: 5, lg: 8 }, alignItems: { lg: 'center' } }}>

            {/* Left */}
            <Box sx={{ flex: 1 }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, letterSpacing: 4, mb: 2, display: 'block', fontSize: '0.65rem' }}>
                  SUB-CHALLENGE
                </Typography>
                <Typography variant="h1" component="h1" sx={{ fontWeight: 900, mb: 3, fontSize: { xs: '2.75rem', md: '4.5rem' }, lineHeight: 0.95, letterSpacing: '-0.03em' }}>
                  {subcategory.title}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 400, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, mb: 5, maxWidth: 600 }}>
                  {subcategory.desc}
                </Typography>

                {/* Single Primary CTA */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {(() => {
                    // Priority Mapping based on Challenge
                    let prioritySection = 'innovations';
                    if (challengeId === 'land' || challengeId === 'insecurity') prioritySection = 'community';
                    else if (challengeId === 'inputs' || challengeId === 'loss') prioritySection = 'activities';
                    else prioritySection = 'innovations';

                    const urgentItem = recentUpdates.find(u => u.section === prioritySection);

                    let ctaText = 'Solve this in the Society';
                    let ctaHref = `/${challengeId}/${subcategory.id}/${prioritySection}`;

                    if (urgentItem) {
                      const shortTitle = urgentItem.title.length > 30 ? urgentItem.title.substring(0, 30) + '...' : urgentItem.title;
                      ctaHref = `/${challengeId}/${subcategory.id}/${prioritySection}/${urgentItem.id}`;
                      
                      if (prioritySection === 'innovations') ctaText = `Fund: ${shortTitle}`;
                      else if (prioritySection === 'community') ctaText = `Join: ${shortTitle}`;
                      else if (prioritySection === 'activities') ctaText = `Participate: ${shortTitle}`;
                      else ctaText = `View: ${shortTitle}`;
                    } else {
                      if (challengeId === 'land') ctaText = `Join ${subcategory.title} Taskforces`;
                      else if (challengeId === 'capital') ctaText = `Fund ${subcategory.title} Innovations`;
                      else if (challengeId === 'inputs') ctaText = `Join ${subcategory.title} Activities`;
                      else if (challengeId === 'energy') ctaText = `Fund ${subcategory.title} Infrastructure`;
                      else if (challengeId === 'insecurity') ctaText = `Join ${subcategory.title} Taskforces`;
                      else if (challengeId === 'loss') ctaText = `Join ${subcategory.title} Activities`;
                      else if (challengeId === 'protein') ctaText = `Fund ${subcategory.title} Innovations`;
                    }

                    return (
                      <Button
                        variant="contained" size="large"
                        component={Link}
                        href={ctaHref}
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          px: 4, py: 1.5, borderRadius: 12,
                          bgcolor: '#00e676', color: '#050505', fontWeight: 800,
                          boxShadow: '0 4px 24px rgba(0, 230, 118, 0.25)',
                          '&:hover': { bgcolor: '#00c853', transform: 'translateY(-2px)' },
                          transition: 'all 0.2s'
                        }}
                      >
                        {ctaText}
                      </Button>
                    );
                  })()}

                  <Button
                    variant="outlined" size="large"
                    onClick={() => {
                      const el = document.getElementById('tabs-area');
                      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    sx={{
                      px: 4, py: 1.5, borderRadius: 12,
                      borderColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 800,
                      backdropFilter: 'blur(12px)', bgcolor: 'rgba(255,255,255,0.04)',
                      '&:hover': { borderColor: 'rgba(255,255,255,0.4)', bgcolor: 'rgba(255,255,255,0.08)' },
                    }}
                  >
                    Explore Intelligence
                  </Button>

                  <Button
                    variant="text" size="large"
                    startIcon={<PlayArrowRoundedIcon />}
                    onClick={() => setVideoOpen(true)}
                    sx={{
                      px: 2, py: 1.5, borderRadius: 12,
                      color: 'rgba(255,255,255,0.6)', fontWeight: 800,
                      '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.05)' },
                    }}
                  >
                    Overview
                  </Button>
                </Box>
              </motion.div>
            </Box>

            {/* Right: Stat Cards */}
            <Box sx={{ width: { xs: '100%', lg: 360 }, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
                {[
                  { label: 'Articles', value: articleCount, icon: <LibraryBooksIcon sx={{ fontSize: 24, color: '#00e5a0' }} />, accent: '#00e5a0' },
                  { label: 'Initiatives', value: initiativeCount, icon: <RocketLaunchIcon sx={{ fontSize: 24, color: '#ff5c93' }} />, accent: '#ff5c93' },
                  { label: 'Jobs & Tenders', value: jobCount, icon: <WorkIcon sx={{ fontSize: 24, color: '#ffa94d' }} />, accent: '#ffa94d' },
                ].map((s, i) => (
                  <Box key={i} sx={{
                    bgcolor: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 4, p: 2.5, mb: i < 2 ? 2 : 0,
                    display: 'flex', alignItems: 'center', gap: 2.5,
                    transition: 'all 0.25s',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.07)', transform: 'translateX(-6px)', borderColor: 'rgba(255,255,255,0.15)' },
                  }}>
                    <Box sx={{
                      width: 48, height: 48, borderRadius: '50%',
                      bgcolor: `${s.accent}12`, border: `1px solid ${s.accent}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {s.icon}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 900, color: 'white', fontSize: '1.6rem', lineHeight: 1 }}>
                        {s.value}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
                        {s.label}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </motion.div>
            </Box>

          </Box>
        </Container>
      </Box>

      {/* ════════════════════════════════════════════════════════
          TABS AREA
      ════════════════════════════════════════════════════════ */}
      <Container id="tabs-area" maxWidth="lg" sx={{ pb: 12, mt: 4 }}>
        <BottleneckDashboardTabs bottleneckId={`${challenge.id}/${subcategory.id}`} feedUpdates={recentUpdates} learningMaterials={learningMaterials} />
      </Container>

      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </Box>
  );
}
