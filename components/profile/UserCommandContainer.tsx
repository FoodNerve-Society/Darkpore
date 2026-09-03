'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, Avatar, LinearProgress, Button, Chip, Tooltip, alpha } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import FlipContainer from '@/app/modular-society/[tenant]/(authenticated)/components/shared/FlipContainer';
import EditProfileBackstage from './EditProfileBackstage';
import UserSettingsBackstage, { type ProfileBlockId } from './UserSettingsBackstage';
import { useSociety, RANK_NAMES, RANK_COLORS, calculateRank, type RankLevel } from '@/context/SocietyContext';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import NotificationsIcon from '@mui/icons-material/Notifications';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Props {
  tenant: string;
  username: string;
  isActive: boolean;
  isCollapsed: boolean;
  onActivate: () => void;
}

export default function UserCommandContainer({ tenant, username, isActive, isCollapsed, onActivate }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<ProfileBlockId | null>(null);
  const { profile } = useSociety();

  const handleFlip = (blockId?: ProfileBlockId) => {
    if (blockId) setActiveBlockId(blockId);
    setIsFlipped(true);
  };

  const handleUnflip = () => {
    setIsFlipped(false);
    setTimeout(() => setActiveBlockId(null), 300); // clear after flip animation
  };

  const handleDirectBlockOpen = (e: React.MouseEvent, blockId: ProfileBlockId) => {
    e.stopPropagation();
    setActiveBlockId(blockId);
    setIsFlipped(true);
    // If we are collapsed, we need to activate first
    if (isCollapsed) {
      onActivate();
    }
  };

  if (isCollapsed) {
    const rank = profile ? calculateRank(profile) : 1;
    const rankColor = RANK_COLORS[rank] || '#9e9e9e';
    const rankName = RANK_NAMES[rank] || 'Initiate';
    const totalNP = profile?.wallet?.lifetimeNP || 0;
    const displayName = profile 
      ? [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.displayName || 'Anonymous'
      : 'Loading...';
    const avatarUrl = profile?.avatarUrl;

    return (
      <Box
        onClick={onActivate}
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: { xs: 'row', md: 'column' },
          alignItems: 'stretch',
          bgcolor: '#0b1329',
          color: '#fff',
          cursor: 'pointer',
          borderRadius: { xs: '20px', md: '28px' },
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            borderColor: alpha(rankColor, 0.5),
            boxShadow: `0 24px 60px -12px ${alpha(rankColor, 0.35)}`,
            '& .portrait-hero-img': {
              transform: 'scale(1.04)',
            },
          },
        }}
      >
        {/* ════════════════════════════════════════════════════════════
            DESKTOP: FULL IMAGE-FIRST PORTRAIT PASS CARD (md+)
           ════════════════════════════════════════════════════════════ */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            width: '100%',
            position: 'relative',
            p: 2.5,
          }}
        >
          {/* 1. HERO PORTRAIT PHOTO / IMAGE BACKDROP */}
          {avatarUrl ? (
            <Box
              component="img"
              src={avatarUrl}
              alt={displayName}
              className="portrait-hero-img"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 20%',
                transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                zIndex: 1,
              }}
            />
          ) : (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `radial-gradient(circle at 50% 35%, ${alpha(rankColor, 0.22)} 0%, #0b1329 80%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
            >
              <Avatar
                className="portrait-hero-img"
                sx={{
                  width: 110,
                  height: 110,
                  bgcolor: '#0f172a',
                  color: '#ffffff',
                  fontSize: '2.8rem',
                  fontWeight: 900,
                  border: `3px solid ${rankColor}`,
                  boxShadow: `0 0 40px ${alpha(rankColor, 0.4)}`,
                  transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {displayName.charAt(0)}
              </Avatar>
            </Box>
          )}

          {/* 2. CINEMATIC GRADIENT VIGNETTES OVER PHOTO */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `linear-gradient(180deg, rgba(11,19,41,0.65) 0%, transparent 28%, rgba(11,19,41,0.35) 50%, rgba(11,19,41,0.92) 80%, #0b1329 100%)`,
              zIndex: 2,
              pointerEvents: 'none',
            }}
          />

          {/* 3. TOP OVERLAY: RANK CAPSULE & EXPAND PROMPT */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 3,
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.6,
                px: 1,
                py: 0.35,
                borderRadius: '9999px',
                bgcolor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(rankColor, 0.4)}`,
                boxShadow: `0 2px 10px ${alpha(rankColor, 0.2)}`,
              }}
            >
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: rankColor, boxShadow: `0 0 6px ${rankColor}` }} />
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Rank {rank} · {rankName}
              </Typography>
            </Box>

            <Tooltip title="Expand Full Profile (Split View)">
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#ffffff',
                    color: '#0f172a',
                    transform: 'scale(1.08)',
                  },
                }}
              >
                <OpenInFullIcon sx={{ fontSize: 14 }} />
              </Box>
            </Tooltip>
          </Box>

          {/* 4. BOTTOM OVERLAY: OPERATOR NAME, HANDLE & LIQUID CAPITAL */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  color: '#ffffff',
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                  textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                }}
              >
                {displayName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.3 }}>
                <Typography sx={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>
                  @{username}
                </Typography>
                <CheckCircleIcon sx={{ fontSize: 13, color: '#10b981' }} />
              </Box>
            </Box>

            {/* Liquid Balance Pill */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                alignSelf: 'flex-start',
                px: 1.5,
                py: 0.7,
                borderRadius: '12px',
                bgcolor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              }}
            >
              <AccountBalanceWalletIcon sx={{ fontSize: 14, color: '#a78bfa' }} />
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff' }}>
                ₦{totalNP.toLocaleString()}
              </Typography>
            </Box>

            {/* Whisper-light Tap to Focus Prompt */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pt: 1,
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.02em' }}>
                Tap to focus profile
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: rankColor, fontWeight: 900 }}>
                →
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ════════════════════════════════════════════════════════════
            MOBILE: COMPACT SPLIT PASS (LEFT: IMAGE | RIGHT: TEXT & ICONS)
           ════════════════════════════════════════════════════════════ */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            alignItems: 'stretch',
            overflow: 'hidden',
          }}
        >
          {/* ─── LEFT: UNCLIPPED PORTRAIT IMAGE (35% width, locked) ─── */}
          <Box
            sx={{
              width: { xs: '35%', sm: '30%' },
              height: '100%',
              minHeight: '74px',
              position: 'relative',
              overflow: 'hidden',
              flexShrink: 0,
              bgcolor: '#070d1e',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {avatarUrl ? (
              <Box
                component="img"
                src={avatarUrl}
                alt={displayName}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 20%',
                  display: 'block',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  background: `radial-gradient(circle at 50% 50%, ${alpha(rankColor, 0.35)} 0%, #070d1e 80%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Avatar
                  sx={{
                    width: 42,
                    height: 42,
                    bgcolor: '#0f172a',
                    color: '#ffffff',
                    fontSize: '1.15rem',
                    fontWeight: 900,
                    border: `2px solid ${rankColor}`,
                  }}
                >
                  {displayName.charAt(0)}
                </Avatar>
              </Box>
            )}
          </Box>

          {/* ─── RIGHT: TEXT & CONTROLS (FITS STRICTLY IN 2 COMPACT ROWS) ─── */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              px: { xs: 1.25, sm: 1.5 },
              py: 0.6,
              gap: 0.6,
            }}
          >
            {/* ROW 1: NAME + VERIFIED BADGE + FOCUS BUTTON */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.8, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: '0.86rem',
                    color: '#ffffff',
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {displayName}
                </Typography>
                <CheckCircleIcon sx={{ fontSize: 13, color: '#10b981', flexShrink: 0 }} />
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.4,
                  px: 0.8,
                  py: 0.25,
                  borderRadius: '6px',
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  color: '#ffffff',
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  flexShrink: 0,
                  transition: 'background 0.2s',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.16)' },
                }}
              >
                <OpenInFullIcon sx={{ fontSize: 9 }} />
                Focus
              </Box>
            </Box>

            {/* ROW 2: RANK BADGE + LIQUID BALANCE */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.8 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.4,
                  px: 0.7,
                  py: 0.2,
                  borderRadius: '4px',
                  bgcolor: alpha(rankColor, 0.14),
                  border: `1px solid ${alpha(rankColor, 0.3)}`,
                  flexShrink: 0,
                }}
              >
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: rankColor }} />
                <Typography sx={{ fontSize: '0.58rem', fontWeight: 800, color: rankColor, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  Rank {rank} · {rankName}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.4,
                  px: 0.8,
                  py: 0.2,
                  borderRadius: '6px',
                  bgcolor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  flexShrink: 0,
                }}
              >
                <AccountBalanceWalletIcon sx={{ fontSize: 11, color: '#a78bfa' }} />
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
                  ₦{totalNP.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        overflowY: 'auto',
        bgcolor: '#ffffff',
        borderRadius: 4,
        boxShadow: { xs: '0 8px 32px rgba(0,0,0,0.06)', md: '0 10px 40px rgba(0,0,0,0.04)' },
        position: 'relative',
      }}
    >
      <UserSettingsBackstage initialBlockId={activeBlockId} />
    </Paper>
  );
}
