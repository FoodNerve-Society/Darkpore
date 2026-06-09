'use client';

import React, { useEffect } from 'react';
import { Box, Container, Typography, Button, Avatar } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChallengeData } from '@/lib/cms/types';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import WorkIcon from '@mui/icons-material/Work';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import VideoModal from './VideoModal';
import TimeSensitiveAlertBar from './TimeSensitiveAlertBar';

const MOCK_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces',
];

const MOCK_NAMES = ['Amina O.', 'David K.', 'Sarah J.', 'Marcus T.', 'Elena R.', 'Kwame A.', 'Fatima B.', 'James L.'];

export default function ClientChallengeHero({ challengeData }: { challengeData: ChallengeData }) {
  const pathname = usePathname();
  const [videoOpen, setVideoOpen] = React.useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  const isMasterFeed = pathname.endsWith(`/${challengeData.id}`) || pathname === `/${challengeData.id}`;

  if (!isMasterFeed) return null;

  // Pull all articles for the marquee
  const allArticles = (challengeData.subcategories || []).flatMap((s: any) => {
    const libraryUpdates = (s.updates || [])
      .filter((u: any) => u.section === 'library')
      .map((u: any) => ({ ...u, subcategoryId: s.id, subcategoryTitle: s.title }));
    const learningMats = (s.learningMaterials || []).map((m: any) => ({
      id: m.slug,
      title: m.title,
      section: 'learn',
      subcategoryId: s.id,
      subcategoryTitle: s.title,
      date: m.dateAdded || new Date().toISOString(),
      author: m.author,
    }));
    return [...libraryUpdates, ...learningMats];
  });

  // Live counts
  const articleCount = allArticles.length || 24;
  const initiativeCount = (challengeData.subcategories || []).flatMap((s: any) => (s.updates || []).filter((u: any) => u.section === 'innovations')).length || 18;
  const jobCount = (challengeData.subcategories || []).flatMap((s: any) => (s.updates || []).filter((u: any) => u.section === 'jobs')).length || 15;

  return (
    <>
      <TimeSensitiveAlertBar />
      {/* ════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════ */}
      <Box sx={{
        position: 'relative',
        color: 'white',
        pt: { xs: 16, md: 22 },
        pb: { xs: 10, md: 14 },
        overflow: 'hidden',
      }}>
        {/* BG */}
        <Box sx={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${challengeData.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000&auto=format&fit=crop'})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.3) saturate(1.2)', zIndex: 0,
        }} />
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(5,5,5,0.5) 0%, rgba(5,5,5,0.85) 65%, #050505 100%)',
          zIndex: 1,
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: { xs: 5, lg: 8 }, alignItems: { lg: 'center' } }}>

            {/* ── LEFT: Copy + CTAs ── */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="overline"
                sx={{
                  color: 'rgba(255,255,255,0.45)', fontWeight: 800,
                  letterSpacing: 4, mb: 2, display: 'block', fontSize: '0.7rem',
                }}
              >
                CHALLENGE DASHBOARD
              </Typography>

              <Typography
                variant="h1" component="h1"
                sx={{
                  fontWeight: 900, textTransform: 'capitalize',
                  fontSize: { xs: '3rem', md: '5rem' },
                  lineHeight: 0.95, letterSpacing: '-0.03em', mb: 3,
                }}
              >
                {challengeData.title}
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 400, color: 'rgba(255,255,255,0.7)',
                  mb: 5, maxWidth: '90%', lineHeight: 1.6, fontSize: { xs: '1rem', md: '1.25rem' },
                }}
              >
                {challengeData.longDesc || challengeData.desc}
              </Typography>

              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  endIcon={<KeyboardArrowDownIcon />}
                  sx={{
                    bgcolor: 'white', color: 'black', borderRadius: '40px',
                    px: 4, py: 1.5, fontWeight: 800, textTransform: 'none',
                    '&:hover': { bgcolor: '#f0f0f0', transform: 'translateY(-2px)' },
                    transition: 'all 0.2s',
                  }}
                  onClick={() => document.getElementById('subcategories-grid')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Explore Sub-Challenges
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PlayArrowRoundedIcon />}
                  onClick={() => setVideoOpen(true)}
                  sx={{
                    color: 'white', borderColor: 'rgba(255,255,255,0.2)', borderRadius: '40px',
                    px: 4, py: 1.5, fontWeight: 700, textTransform: 'none',
                    '&:hover': { borderColor: 'rgba(255,255,255,0.5)', bgcolor: 'rgba(255,255,255,0.05)' },
                  }}
                >
                  Watch the breakdown
                </Button>
              </Box>
            </Box>

            {/* ── RIGHT: Stats Column ── */}
            <Box sx={{ width: { xs: '100%', lg: 320 }, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{
                bgcolor: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, p: 3,
              }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.7rem', letterSpacing: 1, mb: 1 }}>
                  ACTIVE SOLUTIONS
                </Typography>
                <Typography sx={{ color: 'white', fontWeight: 900, fontSize: '2rem', lineHeight: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RocketLaunchIcon sx={{ color: '#00e676', fontSize: 24 }} />
                  {initiativeCount}
                </Typography>
              </Box>

              <Box sx={{
                bgcolor: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, p: 3,
              }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.7rem', letterSpacing: 1, mb: 1 }}>
                  JOBS & TENDERS
                </Typography>
                <Typography sx={{ color: 'white', fontWeight: 900, fontSize: '2rem', lineHeight: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WorkIcon sx={{ color: '#ffb300', fontSize: 24 }} />
                  {jobCount}
                </Typography>
              </Box>

              <Box sx={{
                bgcolor: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, p: 3,
              }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: '0.7rem', letterSpacing: 1, mb: 1 }}>
                  OPEN RESEARCH
                </Typography>
                <Typography sx={{ color: 'white', fontWeight: 900, fontSize: '2rem', lineHeight: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LibraryBooksIcon sx={{ color: '#29b6f6', fontSize: 24 }} />
                  {articleCount}
                </Typography>
              </Box>
            </Box>

          </Box>
        </Container>
      </Box>

      {/* ════════════════════════════════════════════════════════
          LATEST ARTICLES MARQUEE
      ════════════════════════════════════════════════════════ */}
      {allArticles.length > 0 && (
        <Box sx={{ position: 'relative', zIndex: 10, mt: { xs: -2.5, md: -3 }, mb: 8 }}>
          <Box
            sx={{
              py: 1.5,
              bgcolor: '#0a0a0a',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center',
              position: 'relative',
            }}
          >
            {/* LATEST ARTICLES label — sits above the scroll track */}
            <Box
              sx={{
                flexShrink: 0, display: 'flex', alignItems: 'center',
                px: { xs: 2, md: 4 }, pr: { xs: 5, md: 7 },
                position: 'relative', zIndex: 3,
                bgcolor: '#0a0a0a',
                '&::after': {
                  content: '""',
                  position: 'absolute', top: 0, bottom: 0, right: 0,
                  width: 40,
                  background: 'linear-gradient(90deg, transparent 0%, #0a0a0a 100%)',
                  pointerEvents: 'none',
                },
              }}
            >
              <Typography
                variant="overline"
                sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 900, letterSpacing: 3, lineHeight: 1, fontSize: '0.65rem' }}
              >
                LATEST ARTICLES
              </Typography>
            </Box>

            {/* Scroll track */}
            <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              <Box sx={{
                position: 'absolute', top: 0, bottom: 0, right: 0, width: 60, zIndex: 2,
                background: 'linear-gradient(90deg, transparent 0%, #0a0a0a 100%)',
                pointerEvents: 'none',
              }} />
              <Box
                sx={{
                  display: 'flex',
                  animation: 'challengeMarquee 60s linear infinite',
                  '&:hover': { animationPlayState: 'paused' },
                  '@keyframes challengeMarquee': { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
                  width: 'max-content',
                }}
              >
                {[...allArticles, ...allArticles, ...allArticles].map((a: any, idx: number) => {
                  const author = a.author || MOCK_NAMES[idx % MOCK_NAMES.length];
                  const dateStr = new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  return (
                    <Link
                      key={`${a.id}-${idx}`}
                      href={`/${challengeData.id}/${a.subcategoryId}/${a.section}/${a.id}`}
                      style={{ textDecoration: 'none', flexShrink: 0 }}
                    >
                      <Box
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 1.5, mr: 3,
                          py: 0.75, px: 1.5, pr: 2.5, borderRadius: 10,
                          bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                          transition: 'all 0.2s',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.15)' },
                        }}
                      >
                        <Avatar src={MOCK_AVATARS[idx % MOCK_AVATARS.length]} sx={{ width: 28, height: 28 }} />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="caption"
                            sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, display: 'block', lineHeight: 1, mb: 0.25, fontSize: '0.6rem' }}
                          >
                            {author} • {dateStr}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: 'white', fontWeight: 600, whiteSpace: 'nowrap', fontSize: '0.8rem', lineHeight: 1 }}
                          >
                            {a.title}
                          </Typography>
                        </Box>
                      </Box>
                    </Link>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </>
  );
}
