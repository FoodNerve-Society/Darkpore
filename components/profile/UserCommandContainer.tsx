'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, Avatar, LinearProgress } from '@mui/material';
import FlipContainer from '@/app/modular-society/[tenant]/(authenticated)/components/shared/FlipContainer';
import EditProfileBackstage from './EditProfileBackstage';
import UserSettingsBackstage from './UserSettingsBackstage';
import { useSociety, RANK_NAMES, RANK_COLORS, calculateRank, type RankLevel } from '@/context/SocietyContext';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

interface Props {
  tenant: string;
  username: string;
  isActive: boolean;
  isCollapsed: boolean;
  onActivate: () => void;
}

export default function UserCommandContainer({ tenant, username, isActive, isCollapsed, onActivate }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { profile } = useSociety();

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

        {/* ─── RANK PILL ─── */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 0.6,
          bgcolor: `${rankColor}18`,
          border: `1px solid ${rankColor}30`,
          borderRadius: '10px',
          px: 1.2, py: 0.5,
          alignSelf: { md: 'center' },
          mb: { xs: 0, md: 1 },
        }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: rankColor, boxShadow: `0 0 6px ${rankColor}` }} />
          <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: rankColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {rankName}
          </Typography>
        </Box>

        {/* ─── PROGRESS + WALLET — Desktop only ─── */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 1, width: '100%', mt: 'auto' }}>
          {/* Progress */}
          <Box>
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
          <Box sx={{ bgcolor: '#ffffff08', borderRadius: '10px', border: '1px solid #ffffff0a', p: 1.2 }}>
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
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
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

        {/* ─── NP badge — Mobile only (compact) ─── */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          <AccountBalanceWalletIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800 }}>
            {totalNP.toLocaleString()}
          </Typography>
          <Typography sx={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 600 }}>NP</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <FlipContainer
      isFlipped={isFlipped}
      frontContent={
        <Paper elevation={0} sx={{ height: '100%', overflowY: 'auto', bgcolor: '#ffffff', borderRadius: 4, boxShadow: { xs: '0 8px 32px rgba(0,0,0,0.06)', md: '0 10px 40px rgba(0,0,0,0.04)' }, position: 'relative' }}>
          <UserSettingsBackstage onClose={() => setIsFlipped(true)} />
        </Paper>
      }
      backContent={
        <Paper elevation={0} sx={{ height: '100%', overflowY: 'auto', bgcolor: '#ffffff', borderRadius: 4, boxShadow: { xs: '0 8px 32px rgba(0,0,0,0.06)', md: '0 10px 40px rgba(0,0,0,0.04)' }, position: 'relative' }}>
          <EditProfileBackstage onClose={() => setIsFlipped(false)} />
        </Paper>
      }
    />
  );
}
