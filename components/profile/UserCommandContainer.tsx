'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, Avatar, LinearProgress, Button } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import FlipContainer from '@/app/modular-society/[tenant]/(authenticated)/components/shared/FlipContainer';
import EditProfileBackstage from './EditProfileBackstage';
import UserSettingsBackstage from './UserSettingsBackstage';
import { useSociety, RANK_NAMES, RANK_COLORS, calculateRank, type RankLevel } from '@/context/SocietyContext';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import NotificationsIcon from '@mui/icons-material/Notifications';

interface Props {
  tenant: string;
  username: string;
  isActive: boolean;
  isCollapsed: boolean;
  onActivate: () => void;
}

export default function UserCommandContainer({ tenant, username, isActive, isCollapsed, onActivate }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const { profile } = useSociety();

  const handleFlip = (blockId?: string) => {
    if (blockId) setActiveBlockId(blockId);
    setIsFlipped(true);
  };

  const handleUnflip = () => {
    setIsFlipped(false);
    setTimeout(() => setActiveBlockId(null), 300); // clear after flip animation
  };

  const handleDirectBlockOpen = (e: React.MouseEvent, blockId: string) => {
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
    const rankThresholds: Record<RankLevel, number> = { 1: 0, 2: 500, 3: 2000, 4: 5000, 5: 10000 };
    const nextRank = Math.min(rank + 1, 5) as RankLevel;
    const currentThreshold = rankThresholds[rank];
    const nextThreshold = rankThresholds[nextRank];
    const progress = rank >= 5 ? 100 : Math.min(100, ((totalNP - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
    const hasProfile = profile?.gatekeepers?.hasCompletedProfile;
    const hasKYC = profile?.gatekeepers?.hasKYC;
    const hasCAC = profile?.gatekeepers?.hasBusinessVerification;

    return (
      <Box
        onClick={onActivate}
        sx={{
          height: '100%',
          display: 'flex',
          // Mobile: horizontal bar. Desktop: vertical card.
          flexDirection: { xs: 'row', md: 'column' },
          alignItems: { xs: 'center', md: 'stretch' },
          gap: { xs: 2, md: 0 },
          bgcolor: '#0f172a',
          color: '#fff',
          cursor: 'pointer',
          borderRadius: '20px',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': { bgcolor: '#1e293b', boxShadow: `0 0 30px ${rankColor}18` },
          overflow: 'hidden',
          position: 'relative',
          p: { xs: 1.5, md: 2 },
        }}
      >
        {/* Ambient rank glow — desktop only */}
        <Box sx={{
          display: { xs: 'none', md: 'block' },
          position: 'absolute', top: '-20%', left: '-20%',
          width: '80%', height: '50%',
          bgcolor: rankColor, opacity: 0.06, filter: 'blur(50px)', borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        {/* ─── AVATAR ─── */}
        <Box sx={{
          width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 },
          borderRadius: '50%',
          background: `conic-gradient(${rankColor}, ${rankColor}44)`,
          p: '2px',
          flexShrink: 0,
          alignSelf: { md: 'center' },
          mb: { xs: 0, md: 1.5 },
        }}>
          <Avatar
            src={avatarUrl || undefined}
            sx={{ width: '100%', height: '100%', bgcolor: '#1e293b', fontSize: { xs: 14, md: 16 }, fontWeight: 800 }}
          >
            {displayName.charAt(0)}
          </Avatar>
        </Box>

        {/* ─── INFO BLOCK ─── */}
        <Box sx={{
          minWidth: 0, flex: { xs: 1, md: 'none' },
          textAlign: { xs: 'left', md: 'center' },
          mb: { xs: 0, md: 1 },
        }}>
          <Typography sx={{
            fontWeight: 800, fontSize: { xs: '0.8rem', md: '0.82rem' }, lineHeight: 1.2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {displayName}
          </Typography>
          <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', lineHeight: 1.3 }}>
            @{username}
          </Typography>
        </Box>

        {/* ─── DESKTOP (Vertical CTAs) ─── */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 1.5, width: '100%', my: 'auto' }}>
          
          {/* 1. Upgrade Rank Button Card (if rank < 5) */}
          {rank < 5 && (
            <Box 
              onClick={(e) => handleDirectBlockOpen(e, 'quests')} 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(16px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                px: 2,
                py: 1.25,
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  bgcolor: 'rgba(245, 158, 11, 0.15)',
                  borderColor: 'rgba(245, 158, 11, 0.4)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(245, 158, 11, 0.2)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar 
                  variant="rounded"
                  sx={{ 
                    width: 32, height: 32, borderRadius: '10px',
                    bgcolor: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b'
                  }} 
                >
                  <EmojiEventsIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>
                  Upgrade Rank
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.9rem', color: '#f59e0b', fontWeight: 800 }}>→</Typography>
            </Box>
          )}

          {/* 2. Profile Activity Button Card */}
          <Box 
            onClick={(e) => handleDirectBlockOpen(e, 'notifications')} 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(16px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              px: 2,
              py: 1.25,
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                bgcolor: 'rgba(16, 185, 129, 0.15)',
                borderColor: 'rgba(16, 185, 129, 0.4)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar 
                variant="rounded"
                sx={{ 
                  width: 32, height: 32, borderRadius: '10px',
                  bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#10b981'
                }} 
              >
                <NotificationsIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>
                Profile Feed
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 800 }}>→</Typography>
          </Box>

          {/* 3. Manage Profile Button Card */}
          <Box 
            onClick={(e) => handleDirectBlockOpen(e, 'edit-profile')} 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(16px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              px: 2,
              py: 1.25,
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                bgcolor: 'rgba(59, 130, 246, 0.15)',
                borderColor: 'rgba(59, 130, 246, 0.4)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.2)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar 
                variant="rounded"
                sx={{ 
                  width: 32, height: 32, borderRadius: '10px',
                  bgcolor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6'
                }} 
              >
                <SettingsIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>
                Manage Profile
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.9rem', color: '#3b82f6', fontWeight: 800 }}>→</Typography>
          </Box>

        </Box>

        {/* ─── PROGRESS + WALLET — Desktop only ─── */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 1, width: '100%', mt: 2 }}>
          {/* Progress */}
          <Box 
            onClick={(e) => handleDirectBlockOpen(e, 'quests')}
            sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 }, p: 0.5, borderRadius: 1 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
              <Typography sx={{ fontSize: '0.55rem', color: '#64748b' }}>Rank Progress</Typography>
              <Typography sx={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 600 }}>
                {rank >= 5 ? 'MAX' : `${Math.round(progress)}%`}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 3, borderRadius: 2, bgcolor: '#1e293b',
                '& .MuiLinearProgress-bar': { borderRadius: 2, background: `linear-gradient(90deg, ${rankColor}, ${rankColor}bb)` },
              }}
            />
          </Box>

          {/* Wallet */}
          <Box 
            onClick={(e) => handleDirectBlockOpen(e, 'wallet')}
            sx={{ 
              bgcolor: '#ffffff08', borderRadius: '10px', border: '1px solid #ffffff0a', p: 1.2,
              cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: '#ffffff12', transform: 'scale(1.02)' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 11, color: '#94a3b8' }} />
              <Typography sx={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Wallet
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, lineHeight: 1 }}>
              {totalNP.toLocaleString()} <Typography component="span" sx={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 600 }}>NP</Typography>
            </Typography>
          </Box>

          {/* Gatekeeper dots */}
          <Box 
            onClick={(e) => handleDirectBlockOpen(e, 'edit-profile')}
            sx={{ 
              display: 'flex', gap: 0.5, justifyContent: 'center', cursor: 'pointer',
              p: 0.5, borderRadius: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
            }}
          >
            {[
              { ok: hasProfile, label: 'Profile' },
              { ok: hasKYC, label: 'KYC' },
              { ok: hasCAC, label: 'CAC' },
            ].map(g => (
              <Box key={g.label} sx={{
                display: 'flex', alignItems: 'center', gap: 0.3,
                px: 0.6, py: 0.2, borderRadius: '5px',
                bgcolor: g.ok ? '#10b98115' : '#ef444415',
              }}>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: g.ok ? '#10b981' : '#ef4444' }} />
                <Typography sx={{ fontSize: '0.5rem', color: g.ok ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                  {g.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ─── CTAs IN THE MIDDLE (MOBILE) ─── */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, mx: 'auto' }}>
          
          {/* Rank/Quests CTA */}
          {rank < 5 && (
            <Box 
              onClick={(e) => handleDirectBlockOpen(e, 'quests')} 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(16px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                px: 1.5, py: 0.8, cursor: 'pointer',
              }}
            >
              <Avatar 
                variant="rounded"
                sx={{ 
                  width: 24, height: 24, mr: 1, borderRadius: '6px',
                  bgcolor: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b'
                }} 
              >
                <EmojiEventsIcon sx={{ fontSize: 14 }} />
              </Avatar>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#f8fafc' }}>
                Upgrade
              </Typography>
            </Box>
          )}

          {/* Manage Profile CTA */}
          <Box 
            onClick={(e) => handleDirectBlockOpen(e, 'edit-profile')} 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(16px)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              px: 1.5, py: 0.8, cursor: 'pointer',
            }}
          >
            <Avatar 
              variant="rounded"
              sx={{ 
                width: 24, height: 24, mr: 1, borderRadius: '6px',
                bgcolor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6'
              }} 
            >
              <SettingsIcon sx={{ fontSize: 14 }} />
            </Avatar>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#f8fafc' }}>
              Manage
            </Typography>
          </Box>

        </Box>

        {/* ─── NP badge — Mobile only (compact) ─── */}
        <Box 
          onClick={(e) => handleDirectBlockOpen(e, 'wallet')}
          sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 0.5, flexShrink: 0, cursor: 'pointer' }}
        >
          <AccountBalanceWalletIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800 }}>
            {totalNP.toLocaleString()}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <FlipContainer
      isFlipped={isFlipped}
      frontContent={
        <Paper elevation={0} sx={{ height: '100%', overflowY: 'auto', bgcolor: '#ffffff', borderRadius: 4, boxShadow: { xs: '0 8px 32px rgba(0,0,0,0.06)', md: '0 10px 40px rgba(0,0,0,0.04)' }, position: 'relative' }}>
          <UserSettingsBackstage onClose={handleFlip} />
        </Paper>
      }
      backContent={
        <Paper elevation={0} sx={{ height: '100%', overflowY: 'auto', bgcolor: '#ffffff', borderRadius: 4, boxShadow: { xs: '0 8px 32px rgba(0,0,0,0.06)', md: '0 10px 40px rgba(0,0,0,0.04)' }, position: 'relative' }}>
          <EditProfileBackstage onClose={handleUnflip} initialBlockId={activeBlockId} />
        </Paper>
      }
    />
  );
}
