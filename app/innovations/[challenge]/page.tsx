// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Box, Typography, Card, CardActionArea, Grid, Chip, Avatar, AvatarGroup, Container, Collapse, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { getTenantConfig } from '@/lib/cms';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { getChallengeUpdatesBySubcategories } from '@/lib/actions/db';
import PremiumChip from '@/components/PremiumChip';

const MOCK_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
];

export default function ChallengePage() {
  const { challenge: challengeId } = useParams();
  const router = useRouter();
  const [subcatsOpen, setSubcatsOpen] = useState(true);

  const config = getTenantConfig('food');
  const challenge = config.com.homepage.challenges.find((c: any) => c.id === challengeId);

  if (!challenge) {
    return <Box sx={{ p: 4, pt: 12, color: 'white' }}>Challenge not found.</Box>;
  }

  const subcategories = challenge.subcategories || [];

  // Group subcategories
  const groupedSubcategories = React.useMemo(() => {
    const groups: Record<string, any[]> = {};
    subcategories.forEach((sub: any) => {
      const group = sub.groupName || 'Other Categories';
      if (!groups[group]) groups[group] = [];
      groups[group].push(sub);
    });
    return groups;
  }, [subcategories]);

  const [topUpdates, setTopUpdates] = React.useState<any[]>([]);
  const [flippedCard, setFlippedCard] = React.useState<string>('');
  const [activeBead, setActiveBead] = React.useState<string>('');
  const [isPlaying, setIsPlaying] = React.useState<boolean>(true);
  const isAutoScrolling = React.useRef(false);

  const toggleFlip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlippedCard(prev => prev === id ? '' : id);
    if (activeBead !== id) {
      setActiveBead(id);
      // scroll container isolated
      const container = document.getElementById('timeline-container');
      const bead = document.getElementById(`bead-${id}`);
      if (container && bead) {
        const scrollLeft = bead.offsetLeft - container.offsetWidth / 2 + bead.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  };

  React.useEffect(() => {
    const fetchUpdates = async () => {
      const subcatIds = subcategories.map((sub: any) => sub.id);
      const updates = await getChallengeUpdatesBySubcategories(subcatIds);
      
      // Hidden queue behavior: sort high importance items to the top of the feed
      const sortedUpdates = [...updates].sort((a, b) => {
        if (a.importance === 'high' && b.importance !== 'high') return -1;
        if (b.importance === 'high' && a.importance !== 'high') return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      setTopUpdates(sortedUpdates);
    };
    fetchUpdates();
  }, [subcategories]);

  React.useEffect(() => {
    // Initial active bead
    if (subcategories.length > 0 && !activeBead) {
      setActiveBead(subcategories[0].id);
    }
  }, [subcategories, activeBead]);

  // Autoplay Slideshow Effect
  const AUTOPLAY_INTERVAL = 5000;
  React.useEffect(() => {
    if (subcategories.length === 0 || !activeBead || !isPlaying) return;

    const timer = setTimeout(() => {
      const currentIndex = subcategories.findIndex((s: any) => s.id === activeBead);
      const nextIndex = (currentIndex + 1) % subcategories.length;
      const nextBead = subcategories[nextIndex].id;

      setActiveBead(nextBead);
      setFlippedCard(nextBead);

      const container = document.getElementById('timeline-container');
      const bead = document.getElementById(`bead-${nextBead}`);
      if (container && bead) {
        const scrollLeft = bead.offsetLeft - container.offsetWidth / 2 + bead.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }

      const grid = document.getElementById('subcategories-grid');
      let isInView = false;
      if (grid) {
        const rect = grid.getBoundingClientRect();
        isInView = rect.top < window.innerHeight && rect.bottom > 0;
      }

      if (isInView) {
        isAutoScrolling.current = true;
        document.getElementById(`card-${nextBead}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          isAutoScrolling.current = false;
        }, 1000);
      }
    }, AUTOPLAY_INTERVAL);

    return () => clearTimeout(timer);
  }, [activeBead, subcategories, isPlaying]);

  React.useEffect(() => {
    const handleScroll = () => {
      if (isAutoScrolling.current) return;

      const viewportCenter = window.innerHeight / 2;
      let closestId = activeBead;
      let minDistance = Infinity;

      subcategories.forEach((sub: any) => {
        const el = document.getElementById(`card-${sub.id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Distance from vertical center of element to vertical center of viewport
          const elCenter = rect.top + rect.height / 2;
          const distance = Math.abs(elCenter - viewportCenter);
          if (distance < minDistance) {
            minDistance = distance;
            closestId = sub.id;
          }
        }
      });

      if (closestId && closestId !== activeBead) {
        setActiveBead(closestId);
        setFlippedCard(closestId);
        // Scroll the timeline pill to center the active bead without window jitter
        const container = document.getElementById('timeline-container');
        const bead = document.getElementById(`bead-${closestId}`);
        if (container && bead) {
          const scrollLeft = bead.offsetLeft - container.offsetWidth / 2 + bead.offsetWidth / 2;
          container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
      }
    };

    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollListener, { passive: true });
    return () => window.removeEventListener('scroll', scrollListener);
  }, [subcategories, activeBead]);

  return (
    <Container maxWidth="lg">
      {/* ════════════════════════════════════════════════════════
          PREMIUM SUB-CHALLENGES HUB
      ════════════════════════════════════════════════════════ */}
      <Box id="subcategories-grid" sx={{ mb: 12, mt: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 900, color: 'white', mb: 1, letterSpacing: '-0.02em', fontSize: { xs: '2rem', md: '2.8rem' } }}>
          How are we addressing the {challenge.title.replace(/^\d+\.\s*/, '')} gap?
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', mb: 6, maxWidth: 600, fontSize: '1.1rem' }}>
          Select a focus area below to see how our members are taking action, or flip the cards to preview the initiatives.
        </Typography>

        {/* PREMIUM TIMELINE NAVIGATION */}
        <Box 
          id="timeline-container"
          sx={{ 
            display: 'flex', justifyContent: 'flex-start', gap: 2, mb: 8, overflowX: 'auto', 
            position: 'sticky', top: 90, zIndex: 50, pt: 1, pb: 1,
            '&::-webkit-scrollbar': { display: 'none' } 
          }}
        >
          {Object.entries(groupedSubcategories).map(([groupName, groupSubs]) => {
            const isGroupActive = (groupSubs as any[]).some((s: any) => s.id === activeBead);

            return (
              <Box key={groupName} sx={{ 
                display: 'flex', gap: 0.5,
                bgcolor: isGroupActive ? 'rgba(255,255,255,0.06)' : 'rgba(10,10,10,0.85)', 
                backdropFilter: 'blur(24px)',
                p: 0.5, borderRadius: 3, border: '1px solid',
                borderColor: isGroupActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                transition: 'all 0.3s'
              }}>
                {(groupSubs as any[]).map((sub: any) => {
                      const isActive = activeBead === sub.id;
                      const globalIdx = subcategories.findIndex((s: any) => s.id === sub.id);
                      const numStr = (globalIdx + 1).toString().padStart(2, '0');

                      return (
                        <Box
                          id={`bead-${sub.id}`}
                          key={`bead-${sub.id}`}
                          onClick={() => {
                            setActiveBead(sub.id);
                            // scroll container isolated
                            const container = document.getElementById('timeline-container');
                            const bead = document.getElementById(`bead-${sub.id}`);
                            if (container && bead) {
                              const scrollLeft = bead.offsetLeft - container.offsetWidth / 2 + bead.offsetWidth / 2;
                              container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                            }
                            document.getElementById(`card-${sub.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                          sx={{
                            position: 'relative', overflow: 'hidden',
                            display: 'flex', alignItems: 'center', gap: isActive ? 1.5 : 0,
                            px: isActive ? 3 : 2, py: 1.5,
                            borderRadius: 2,
                            cursor: 'pointer', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                            background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                            border: '1px solid', borderColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                            '&:hover': { bgcolor: isActive ? '' : 'rgba(255,255,255,0.02)' }
                          }}
                        >
                          {/* Dynamic Progress Indicator for Active Tab */}
                          {isActive && (
                            <Box 
                              key={isPlaying ? 'playing' : 'paused'}
                              sx={{
                                position: 'absolute', top: 0, left: 0, bottom: 0,
                                background: 'linear-gradient(90deg, rgba(255,51,102,0.1) 0%, rgba(255,153,51,0.4) 100%)',
                                width: isPlaying ? '0%' : '100%',
                                animation: isPlaying ? 'progressFill 5s linear forwards' : 'none',
                                transformOrigin: 'left',
                                '@keyframes progressFill': {
                                  '0%': { width: '0%' },
                                  '100%': { width: '100%' }
                                }
                              }} 
                            />
                          )}

                          {/* Bottom Active Line */}
                          <Box sx={{
                            position: 'absolute', bottom: 0, left: 0, height: 2,
                            background: 'linear-gradient(90deg, #ff3366, #ff9933)',
                            width: isActive ? '100%' : '0%', transition: 'width 0.4s'
                          }} />

                          <Typography variant="caption" sx={{ 
                            fontWeight: 900, fontSize: '0.8rem', position: 'relative', zIndex: 1,
                            color: isActive ? '#ff9933' : 'rgba(255,255,255,0.4)',
                            fontFamily: 'monospace'
                          }}>
                            {numStr}
                          </Typography>
                          
                          <Box sx={{
                            width: isActive ? 'auto' : 0,
                            overflow: 'hidden', position: 'relative', zIndex: 1,
                            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex', alignItems: 'center'
                          }}>
                            <Typography sx={{ 
                              fontWeight: 800, color: 'white', whiteSpace: 'nowrap', 
                              fontSize: '0.85rem', letterSpacing: '-0.02em',
                              opacity: isActive ? 1 : 0, transition: 'opacity 0.3s'
                            }}>
                              {sub.title}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
              </Box>
            );
          })}

          {/* PAUSE / PLAY BUTTON */}
          <Box 
            onClick={() => setIsPlaying(!isPlaying)}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(24px)',
              p: 1.5, px: 2, borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)', cursor: 'pointer',
              transition: 'all 0.3s', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' }
            }}
          >
            {isPlaying ? (
              <PauseIcon sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 20 }} />
            ) : (
              <PlayArrowIcon sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 20 }} />
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(groupedSubcategories).map(([groupName, groupSubs], groupIdx) => {
            
            // Map dynamic icons based on groupName keywords
            let GroupIcon = GridViewRoundedIcon;
            const lowerName = groupName.toLowerCase();
            if (lowerName.includes('liquidity') || lowerName.includes('transactions')) GroupIcon = AccountBalanceWalletIcon;
            else if (lowerName.includes('grassroots') || lowerName.includes('borrowing')) GroupIcon = GroupWorkIcon;
            else if (lowerName.includes('risk') || lowerName.includes('future')) GroupIcon = SecurityIcon;
            else if (lowerName.includes('b2b') || lowerName.includes('structuring') || lowerName.includes('advanced')) GroupIcon = BusinessCenterIcon;
            else if (lowerName.includes('growth')) GroupIcon = TrendingUpIcon;

            return (
            <Box key={groupName}>
              {/* Premium Group Header */}
              {groupName !== 'Other Categories' && (
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box sx={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(255,51,102,0.2), rgba(255,153,51,0.2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    <GroupIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 800, letterSpacing: '-0.01em' }}>
                      {groupName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                      {groupSubs.length} Sector{groupSubs.length === 1 ? '' : 's'}
                    </Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1, height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)' }} />
                </Box>
              )}

              {/* Portrait Cards Grid */}
              <Grid container spacing={3}>
                {groupSubs.map((sub: any, idx: number) => {
                  const updateCount = (sub.updates || []).length;
                  const isFlipped = flippedCard === sub.id;
                  const overallIdx = subcategories.findIndex((s: any) => s.id === sub.id) + 1;

                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={sub.id}>
                      <Box id={`card-${sub.id}`} sx={{ perspective: '1000px', height: 460 }}>
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0, rotateY: isFlipped ? 180 : 0 }}
                          transition={{ 
                            opacity: { duration: 0.6, delay: (groupIdx * 0.1) + (idx * 0.1) },
                            y: { duration: 0.6, delay: (groupIdx * 0.1) + (idx * 0.1) },
                            rotateY: { type: 'spring', stiffness: 260, damping: 20 }
                          }}
                          style={{ height: '100%', width: '100%', position: 'relative', transformStyle: 'preserve-3d' }}
                        >
                          {/* =======================================
                              FRONT OF CARD
                          ======================================= */}
                          <Card
                            sx={{
                              position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                              zIndex: isFlipped ? 0 : 1,
                              borderRadius: 4, overflow: 'hidden', bgcolor: '#0a0a0a',
                              border: '1px solid rgba(255,255,255,0.05)',
                              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                              cursor: 'pointer',
                              '&:hover': {
                                boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(255,51,102,0.15)',
                                borderColor: 'rgba(255,255,255,0.15)',
                                '& .bg-img': { transform: 'scale(1.08)', filter: 'brightness(0.4) saturate(1.4)' },
                                '& .bg-gradient': { opacity: 0.9 },
                                '& .hover-cta': { maxHeight: 60, opacity: 1, mt: 3, transform: 'translateY(0)' }
                              },
                            }}
                            onClick={(e) => toggleFlip(sub.id, e)}
                          >
                            <Box
                              className="bg-img" component="img" src={sub.imageUrl} alt={sub.title}
                              sx={{
                                position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                                filter: 'brightness(0.6) saturate(1.2)', transition: 'transform 0.7s cubic-bezier(0.25, 1, 0.5, 1)',
                              }}
                            />
                            <Box className="bg-gradient" sx={{
                              position: 'absolute', inset: 0,
                              background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                              transition: 'opacity 0.5s',
                            }} />

                            {/* Huge Index Watermark */}
                            <Typography variant="h1" sx={{
                              position: 'absolute', top: -16, right: 8,
                              fontSize: '8rem', fontWeight: 900, lineHeight: 1,
                              color: 'rgba(255,255,255,0.08)', zIndex: 1,
                              userSelect: 'none', pointerEvents: 'none',
                              fontFamily: 'monospace'
                            }}>
                              {overallIdx}
                            </Typography>

                            <Box sx={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2 }}>
                              {updateCount > 0 ? (
                                <Box sx={{
                                  bgcolor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(10px)',
                                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, px: 1.5, py: 0.5,
                                  display: 'flex', alignItems: 'center', gap: 1,
                                }}>
                                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#00e676', boxShadow: '0 0 8px #00e676' }} />
                                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                                    {updateCount} Live
                                  </Typography>
                                </Box>
                              ) : <Box />}
                            </Box>

                            <Box sx={{ position: 'relative', p: 3, pb: 6, width: '100%', zIndex: 2 }}>
                              <Typography variant="h5" sx={{ fontWeight: 900, color: 'white', mb: 1, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                                {sub.title}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {sub.desc}
                              </Typography>

                              <Box className="hover-cta" sx={{ 
                                maxHeight: 0, overflow: 'hidden', opacity: 0, 
                                transform: 'translateY(10px)',
                                transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)' 
                              }}>
                                <Box sx={{
                                  display: 'inline-flex', alignItems: 'center', gap: 1, color: 'white', fontWeight: 700, fontSize: '0.85rem',
                                  bgcolor: 'rgba(255,255,255,0.1)', px: 2, py: 1, borderRadius: 2, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)',
                                  fontFamily: '"Quicksand", sans-serif',
                                }}>
                                  Flip for details
                                </Box>
                              </Box>
                            </Box>
                          </Card>

                          {/* =======================================
                              BACK OF CARD
                          ======================================= */}
                          <Card
                            sx={{
                              position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                              zIndex: isFlipped ? 1 : 0,
                              transform: 'rotateY(180deg)',
                              borderRadius: 4, overflow: 'hidden',
                              background: 'linear-gradient(145deg, rgba(20,20,20,0.95), rgba(5,5,5,0.95))',
                              border: '1px solid rgba(255,255,255,0.1)',
                              display: 'flex', flexDirection: 'column', p: 3, pb: 4,
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: 2 }}>
                                AT A GLANCE
                              </Typography>
                              <IconButton size="small" onClick={(e) => toggleFlip(sub.id, e)} sx={{ color: 'rgba(255,255,255,0.4)', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                                <ExpandMoreIcon sx={{ transform: 'rotate(90deg)', fontSize: 16 }} />
                              </IconButton>
                            </Box>

                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 800, mb: 1, lineHeight: 1.2 }}>
                              {sub.title}
                            </Typography>
                            <Box sx={{ flex: 1, overflowY: 'auto', mb: 3, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 4 } }}>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, mb: 1.5 }}>
                                {sub.desc}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, fontStyle: 'italic' }}>
                                Join this sector to collaborate, access resources, and drive innovations in {sub.title.toLowerCase()} if this is your focus area.
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3, flexShrink: 0 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: 'rgba(255,255,255,0.03)', p: 1.5, borderRadius: 2 }}>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Active Deals</Typography>
                                <Typography variant="caption" sx={{ color: 'white', fontWeight: 700 }}>{updateCount + 4}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: 'rgba(255,255,255,0.03)', p: 1.5, borderRadius: 2 }}>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Participants</Typography>
                                <Typography variant="caption" sx={{ color: 'white', fontWeight: 700 }}>120+</Typography>
                              </Box>
                            </Box>

                            <Box
                              component="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                router.push(`/${challenge.id}/${sub.id}`);
                              }}
                              sx={{
                                width: '100%', py: 1.5, borderRadius: 2, border: 'none', cursor: 'pointer',
                                background: 'linear-gradient(90deg, #ff3366, #ff9933)', textDecoration: 'none',
                                color: 'white', fontWeight: 800, fontSize: '0.9rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                                transition: 'opacity 0.2s', '&:hover': { opacity: 0.9 },
                                flexShrink: 0, fontFamily: '"Quicksand", sans-serif', zIndex: 10
                              }}
                            >
                              Join Now <ArrowForwardIcon sx={{ fontSize: 16 }} />
                            </Box>
                          </Card>
                        </motion.div>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
            );
          })}
        </Box>
      </Box>

      {/* ════════════════════════════════════════════════════════
          MASTER FEED
      ════════════════════════════════════════════════════════ */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.35)', fontWeight: 800, letterSpacing: 3, mb: 1, display: 'block', fontSize: '0.65rem' }}>
          MASTER FEED
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', mb: 5, lineHeight: 1.1 }}>
          Latest across all sub-challenges
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {topUpdates.map((update: any, idx: number) => (
            <motion.div
              key={`${update.id}-${idx}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.04 }}
            >
              <Card
                sx={{
                  bgcolor: 'rgba(255,255,255,0.025)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 4,
                  transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderColor: 'rgba(255,255,255,0.12)',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <CardActionArea
                  component={Link}
                  href={`/${challenge.id}/${update.subcategoryId}/${update.section}/${update.id}`}
                  sx={{ p: { xs: 2.5, md: 3.5 }, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                      <PremiumChip
                        variant="glass"
                        label={update.subcategoryTitle}
                        size="small"
                        sx={{
                          color: 'rgba(255,255,255,0.7)',
                          fontWeight: 700, fontSize: '0.6rem', height: 20, borderRadius: 6,
                        }}
                      />
                      <PremiumChip
                        variant="glass"
                        baseColor="#ff5050"
                        label={update.section.toUpperCase()}
                        size="small"
                        sx={{
                          color: 'rgba(255,140,140,0.95)',
                          fontWeight: 700, fontSize: '0.6rem', height: 20, borderRadius: 6,
                        }}
                      />
                      {update.importance === 'high' && (
                        <Box sx={{
                          width: 7, height: 7, borderRadius: '50%', bgcolor: '#ff4444',
                          boxShadow: '0 0 6px #ff4444',
                          animation: 'urgentPulse 2s ease-in-out infinite',
                          '@keyframes urgentPulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.35 } },
                        }} />
                      )}
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: 'white', mb: 0.75, lineHeight: 1.3 }}>
                      {update.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.55, fontSize: '0.8rem' }}>
                      {update.summary}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', display: 'block', mt: 1 }}>
                      {new Date(update.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      color: 'rgba(255,255,255,0.4)', fontWeight: 700,
                      whiteSpace: 'nowrap', ml: 3, flexShrink: 0,
                      display: 'flex', alignItems: 'center', fontSize: '0.75rem',
                      transition: 'color 0.2s',
                      '.MuiCardActionArea-root:hover &': { color: 'white' },
                    }}
                  >
                    {update.linkText}
                    <ArrowForwardIcon sx={{ ml: 0.5, fontSize: 13 }} />
                  </Box>
                </CardActionArea>
              </Card>
            </motion.div>
          ))}
          {topUpdates.length === 0 && (
            <Box sx={{
              py: 8, textAlign: 'center',
              bgcolor: 'rgba(255,255,255,0.02)',
              borderRadius: 4,
              border: '1px dashed rgba(255,255,255,0.08)',
            }}>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.25)' }}>
                No updates available yet. Check back soon.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
}
