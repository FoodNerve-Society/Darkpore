'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Avatar, Chip, Paper, Stack, alpha } from '@mui/material';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ContactsIcon from '@mui/icons-material/Contacts';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PublicIcon from '@mui/icons-material/Public';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { motion, AnimatePresence } from 'framer-motion';

interface SocietyGatewayCTAProps {
  userCount: number;
  tenantName: string;
}

/* ── Polaroid Component (from /join page) ── */
const Polaroid = ({ src, rotate, left, top, zIndex, caption, stickerText, stickerBg }: any) => (
  <Box
    sx={{
      position: 'absolute',
      left,
      top,
      transform: { xs: `translate(-50%, -50%) rotate(${rotate}deg)`, md: `translate(0, 0) rotate(${rotate}deg)` },
      background: '#ffffff',
      padding: { xs: '8px 8px 32px 8px', md: '16px 16px 64px 16px' },
      borderRadius: '0px',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4), 0 10px 15px -3px rgba(0,0,0,0.2)',
      zIndex,
      transition: 'all 1.2s cubic-bezier(0.25, 1, 0.5, 1)',
    }}
  >
    {/* Premium Tape Effect */}
    <Box sx={{
      position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%) rotate(-3deg)',
      width: '80px', height: '24px', background: 'rgba(255, 255, 255, 0.4)',
      backdropFilter: 'blur(8px)', boxShadow: '0 1px 3px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)', zIndex: 2,
    }} />
    <Box sx={{ 
      width: { xs: 140, md: 150, lg: 160 }, height: { xs: 180, md: 190, lg: 200 }, 
      backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center', 
      borderRadius: '0px', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
      position: 'relative'
    }}>
      {/* Playful Sticker */}
      {stickerText && (
        <Box sx={{
          position: 'absolute', top: -15, right: -15,
          width: 45, height: 45, borderRadius: '50%',
          background: stickerBg || '#fbbf24',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          transform: 'rotate(12deg)',
          color: '#000', fontWeight: 900, fontSize: '0.65rem',
          fontFamily: 'var(--font-quicksand)', letterSpacing: '0.5px',
          border: '2px solid white'
        }}>
           {stickerText}
        </Box>
      )}
    </Box>
    
    {/* Handwriting Caption */}
    {caption && (
      <Typography sx={{
          fontFamily: '"Caveat", "Shadows Into Light", "Kalam", "Comic Sans MS", cursive',
          fontSize: { xs: '1rem', md: '1.25rem' },
          color: 'rgba(0,0,0,0.8)',
          textAlign: 'center',
          position: 'absolute',
          bottom: { xs: '8px', md: '20px' },
          left: 0, right: 0,
          lineHeight: 1,
          transform: 'rotate(-2deg)'
      }}>
          {caption}
      </Typography>
    )}
  </Box>
);

/* ── Activity feed data ── */
const ACTIVITY_FEED = [
  { id: 'a1', userName: 'Aisha Ibrahim', avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1bfa82?q=80&w=200&auto=format&fit=crop', timeAgo: '2m ago', tab: 'TRADE', action: 'listed 500kg of Cassava Tubers', gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' },
  { id: 'a2', userName: 'David Okeke', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop', timeAgo: '5m ago', tab: 'LEARN', action: 'published a soil analysis blueprint', gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' },
  { id: 'a3', userName: 'Chioma O.', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop', timeAgo: '12m ago', tab: 'MEET', action: 'responded to the Daily Spark', gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' },
  { id: 'a4', userName: 'FarmTech Sol.', avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop', timeAgo: '18m ago', tab: 'SUPPORT', action: 'donated to Rural Irrigation', gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' },
  { id: 'a5', userName: 'Musa Bello', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop', timeAgo: '22m ago', tab: 'PROFILE', action: 'verified their Pioneer account', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)' },
  { id: 'a6', userName: 'Grace Nnamdi', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop', timeAgo: '28m ago', tab: 'TRADE', action: 'purchased 2 tons of Fertilizer', gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' },
  { id: 'a7', userName: 'Dr. Alabi', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop', timeAgo: '35m ago', tab: 'LEARN', action: 'completed Cold Chain module', gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' },
  { id: 'a8', userName: 'Sarah Adeyemi', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop', timeAgo: '41m ago', tab: 'MEET', action: 'upvoted the top Spark response', gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' },
];

const TAB_COLORS: Record<string, string> = {
  'TRADE': '#10b981', 'LEARN': '#f59e0b', 'MEET': '#6366f1', 'SUPPORT': '#ec4899', 'PROFILE': '#0ea5e9',
};

export default function SocietyGatewayCTA({ userCount, tenantName }: SocietyGatewayCTAProps) {
  const formattedCount = new Intl.NumberFormat('en-US').format(userCount);

  // ── Activity feed rotation (from SocietyHero) ──
  const [startIndex, setStartIndex] = useState(0);
  const [isExpanding, setIsExpanding] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsExpanding(true);
      setTimeout(() => {
        setStartIndex(prev => (prev + 1) % ACTIVITY_FEED.length);
        setIsExpanding(false);
      }, 700);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const feed = [];
  for (let i = 0; i < 4; i++) {
    feed.push(ACTIVITY_FEED[(startIndex + i) % ACTIVITY_FEED.length]);
  }

  // ── Polaroid cycling (from /join page) ──
  const [frontIndex, setFrontIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setFrontIndex(prev => (prev + 2) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // We no longer need this as we've unified the components

  // Removed mobileFeed array generation because we unified the layout

  const POLAROID_DATA = [
    { src: '/images/society/login-hero.png', caption: "Nairobi '25", stickerText: '⭐', stickerBg: '#fbbf24' },
    { src: '/images/society/about-hero.png', caption: 'Harvest Time' },
    { src: '/images/society/hero.png', caption: 'Paris Summit', stickerText: 'NEW', stickerBg: '#10b981' },
  ];

  return (
    <Box sx={{
      bgcolor: '#f2f7f1',
      color: '#0f2414',
      position: 'relative',
      overflow: 'visible', // Allow polaroids to float outside on mobile
      borderTop: '1px solid rgba(27, 94, 32, 0.08)',
    }}>
      {/* Society mesh bg */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(76, 175, 80, 0.12), transparent 60%),
          radial-gradient(circle at 90% 80%, rgba(217, 119, 6, 0.08), transparent 60%),
          radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.6), transparent 70%)
        `,
        zIndex: 0, pointerEvents: 'none'
      }} />

      {/* ── POLAROID STACK ── 
          Placed absolutely over the whole section, using responsive left/top.
          This behaves EXACTLY like the /join page floating polaroids. 
      */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 3, pointerEvents: 'none'
      }}>
        {POLAROID_DATA.map((p, idx) => {
          const dist = (idx - frontIndex + 3) % 3;
          let pos;
          if (dist === 0) pos = { rotate: 0, left: { xs: '50%', md: '10%' }, top: { xs: '120px', md: '30%' }, zIndex: 4 }; // Front
          else if (dist === 1) pos = { rotate: 15, left: { xs: '68%', md: '16%' }, top: { xs: '90px', md: '20%' }, zIndex: 2 }; // Back Right
          else pos = { rotate: -15, left: { xs: '32%', md: '2%' }, top: { xs: '100px', md: '25%' }, zIndex: 3 }; // Middle Left
          
          return (
            <Box key={idx} sx={{ pointerEvents: 'auto', display: 'inline-block' }}>
              <Polaroid
                src={p.src}
                caption={p.caption}
                stickerText={p.stickerText}
                stickerBg={p.stickerBg}
                {...pos}
              />
            </Box>
          );
        })}
      </Box>

      {/* Three-column layout: Polaroids space | Center Content | Activity Feed */}
      <Box sx={{
        position: 'relative', zIndex: 2,
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        alignItems: 'center',
        minHeight: { xs: 'auto', lg: 420 },
        pt: { xs: 32, lg: 0 }, // give room for mobile polaroids at the top
      }}>

        {/* ── LEFT: Spacer for Polaroids (Desktop) ── */}
        <Box sx={{
          display: { xs: 'none', lg: 'block' },
          width: '24%',
          flexShrink: 0,
        }} />

        {/* ── CENTER: Minimal Text + Single CTA ── */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: { xs: 8, lg: 6 },
          px: { xs: 3, md: 4 },
        }}>
          {/* Society Badge */}
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 1, mb: 3,
            bgcolor: 'rgba(255,255,255,0.8)', px: 2.5, py: 1, borderRadius: '14px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)',
          }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#2e7d32' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'rgba(0,0,0,0.5)', fontSize: '0.78rem', letterSpacing: '0.3px' }}>
              <Box component="span" sx={{ color: '#1b5e20', fontWeight: 800 }}>{tenantName}</Box>{' '}Society
            </Typography>
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 900, color: '#0f2414',
              letterSpacing: '-0.03em',
              fontSize: { xs: '2.4rem', md: '2.6rem' },
              lineHeight: 1.15, mb: 2,
              fontFamily: 'var(--font-playfair)',
            }}
          >
            The People Behind<br />the Intelligence.
          </Typography>

          <Typography variant="body1" sx={{
            color: 'rgba(15, 36, 20, 0.55)', lineHeight: 1.7, mb: 4,
            maxWidth: '420px', fontSize: { xs: '1.15rem', md: '1rem' },
          }}>
            {formattedCount}+ visionaries powering the ecosystem. Join them.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Link href="/join" passHref style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  borderRadius: '16px', px: 5, py: 2,
                  fontSize: '1.05rem', textTransform: 'none', fontWeight: 700,
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  boxShadow: '0 8px 24px rgba(217, 119, 6, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 12px 30px rgba(217, 119, 6, 0.5)',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                Join the Society
              </Button>
            </Link>
            <Button
              variant="outlined"
              onClick={() => window.dispatchEvent(new Event('open-capture-modal'))}
              sx={{
                borderRadius: '16px', minWidth: '56px', px: 2, py: 2,
                color: 'rgba(15, 36, 20, 0.6)', borderColor: 'rgba(15, 36, 20, 0.1)',
                '&:hover': { background: 'rgba(15, 36, 20, 0.05)', borderColor: 'rgba(15, 36, 20, 0.2)', transform: 'translateY(-3px)' },
                transition: 'all 0.3s ease',
              }}
              title="Stay Updated"
            >
               <NotificationsActiveIcon />
            </Button>
          </Box>
        </Box>

        {/* ── RIGHT: Live Activity Feed (Unified Desktop/Mobile) ── */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          width: { xs: '100%', lg: '24%' },
          maxWidth: { xs: 480, lg: '100%' },
          flexShrink: 0,
          py: 4,
          pr: { xs: 2, lg: 6 },
          pl: { xs: 2, lg: 1 },
          perspective: '1200px', // Exact 3D drum perspective from SocietyHero
        }}>
          {/* Live indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, px: 1 }}>
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 8, height: 8, borderRadius: '50%',
                backgroundColor: '#ef4444', boxShadow: '0 0 12px rgba(239, 68, 68, 0.6)',
              }}
            />
            <Typography variant="overline" sx={{ color: 'rgba(0,0,0,0.45)', letterSpacing: '2.5px', fontWeight: 700, fontSize: '0.65rem' }}>
              LIVE ACROSS THE ECOSYSTEM
            </Typography>
          </Box>

          <Stack spacing={1.5} sx={{ transformStyle: 'preserve-3d' }}>
            <AnimatePresence initial={false} mode="popLayout">
              {feed.map((stat, index) => {
                const accentColor = TAB_COLORS[stat.tab] || '#10b981';
                // 3D drum perspective: cards curve away at top and bottom
                const center = 2;
                const offset = index - center;
                const rotateX = offset * -4; // top tilts back (+8°), bottom tilts forward (-8°)
                const distFromCenter = Math.abs(offset);
                const opacity = 1 - distFromCenter * 0.12;
                const scale = 1 - distFromCenter * 0.02;

                return (
                  <motion.div
                    key={stat.id}
                    layout
                    initial={{ opacity: 0, y: 50, scale: 0.92 }}
                    animate={{ opacity, y: 0, scale, rotateX }}
                    exit={{ opacity: 0, y: -30, scale: 0.9, rotateX: 12, transition: { duration: 0.3 } }}
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    style={{ width: '100%', transformStyle: 'preserve-3d' }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        width: '100%',
                        background: 'rgba(18, 24, 20, 0.92)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '22px',
                        boxShadow: `0 6px 28px ${alpha(accentColor, 0.18)}, 0 1.5px 4px rgba(0,0,0,0.08)`,
                        border: `1px solid ${alpha(accentColor, 0.12)}`,
                        display: 'flex', alignItems: 'center',
                        px: 2, py: 1.25,
                        transition: 'box-shadow 0.3s ease, border 0.3s ease',
                        '&:hover': {
                          boxShadow: `0 12px 40px ${alpha(accentColor, 0.28)}, 0 2px 6px rgba(0,0,0,0.1)`,
                          border: `1px solid ${alpha(accentColor, 0.25)}`,
                        },
                      }}
                    >
                      <Avatar
                        variant="rounded"
                        src={stat.avatarUrl}
                        alt={stat.userName}
                        sx={{
                          width: 36, height: 36, mr: 1.5,
                          borderRadius: '10px',
                          border: `2px solid ${alpha(accentColor, 0.4)}`,
                          boxShadow: `0 0 12px ${alpha(accentColor, 0.2)}`,
                        }}
                      />
                      <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Chip
                            label={stat.tab} size="small"
                            sx={{
                              height: 16, fontSize: '0.55rem', fontWeight: 800,
                              color: '#fff', background: stat.gradient,
                              textTransform: 'uppercase', letterSpacing: '0.5px',
                              borderRadius: '4px', '& .MuiChip-label': { px: 0.75 }
                            }}
                          />
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontWeight: 500, fontSize: '0.65rem' }}>
                            {stat.timeAgo}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{
                          fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)',
                          lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', mt: 0.25,
                        }}>
                          <Box component="span" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>
                            {stat.userName}
                          </Box>{' '}{stat.action}
                        </Typography>
                      </Box>
                    </Paper>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Skeleton conveyor belt */}
            <motion.div
              animate={{
                width: isExpanding ? '100%' : '50%',
                height: isExpanding ? 62 : 28,
                opacity: isExpanding ? 0.7 : 0.35,
                borderRadius: isExpanding ? 22 : 14,
              }}
              transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
              style={{ alignSelf: 'center', overflow: 'hidden', position: 'relative' }}
            >
              <Paper
                elevation={0}
                sx={{
                  width: '100%', height: '100%',
                  background: 'rgba(18, 24, 20, 0.45)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 'inherit',
                  border: '1px dashed rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: isExpanding ? 'flex-start' : 'center',
                  px: isExpanding ? 2.5 : 0,
                }}
              >
                <AnimatePresence>
                  {isExpanding && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.3 }}
                      style={{ display: 'flex', alignItems: 'center', width: '100%' }}
                    >
                      <Box sx={{ width: 36, height: 36, borderRadius: '11px', bgcolor: 'rgba(255,255,255,0.08)', mr: 1.5, flexShrink: 0 }} />
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                        <Box sx={{ width: 55, height: 10, borderRadius: '3px', bgcolor: 'rgba(255,255,255,0.08)' }} />
                        <Box sx={{ width: '70%', height: 8, borderRadius: '3px', bgcolor: 'rgba(255,255,255,0.05)' }} />
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isExpanding && (
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', width: '100%' }}>
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.2, 0.6, 0.2] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                        style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.3)' }}
                      />
                    ))}
                  </Box>
                )}
              </Paper>
            </motion.div>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
