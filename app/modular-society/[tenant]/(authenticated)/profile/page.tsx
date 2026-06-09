// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Stack, Button, Avatar, Chip, Divider, LinearProgress, Switch, FormControlLabel, Select, MenuItem } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSociety, RANK_NAMES, RANK_COLORS, calculateRank, type RankLevel } from '@/context/SocietyContext';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

// ============================================================
// FLAT LIGHT THEME
// ============================================================

const glassCard = {
  background: '#ffffff',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  borderRadius: 3,
};

// ============================================================
// WALLET CARD
// ============================================================

function WalletCard({ label, amount, color, subtitle }: { label: string; amount: number; color: string; subtitle: string }) {
  return (
    <Box>
      <Card sx={{ ...glassCard, background: `linear-gradient(135deg, ${color}08, ${color}03)`, border: `1px solid ${color}20` }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }} sx={{ color, mt: 0.5 }}>
            {amount.toLocaleString()} <Typography component="span" variant="body2" color="text.secondary">NP</Typography>
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>{subtitle}</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

// ============================================================
// GATEKEEPER QUEST ITEM
// ============================================================

function QuestItem({ rank, title, description, completed, route, locked }: {
  rank: RankLevel; title: string; description: string; completed: boolean; route: string; locked?: boolean;
}) {
  const router = useRouter();

  return (
    <Card sx={{
      ...glassCard,
      opacity: locked ? 0.5 : 1,
      background: completed ? `${RANK_COLORS[rank]}08` : '#ffffff',
      border: completed ? `1px solid ${RANK_COLORS[rank]}30` : '1px solid #e0e0e0',
    }}>
      <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        {completed ? (
          <CheckCircleIcon sx={{ fontSize: 32, color: RANK_COLORS[rank] }} />
        ) : locked ? (
          <LockIcon sx={{ fontSize: 32, color: 'text.disabled' }} />
        ) : (
          <Box sx={{
            width: 32, height: 32, borderRadius: '50%',
            border: `2px solid ${RANK_COLORS[rank]}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Typography variant="caption" sx={{ fontWeight: 800 }} sx={{ color: RANK_COLORS[rank] }}>{rank}</Typography>
          </Box>
        )}

        <Box sx={{ flex: 1 }}>
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{title}</Typography>
            <Chip label={RANK_NAMES[rank]} size="small" sx={{ bgcolor: `${RANK_COLORS[rank]}15`, color: RANK_COLORS[rank], fontWeight: 600, fontSize: '0.65rem', height: 20 }} />
          </Stack>
          <Typography variant="caption" color="text.secondary">{description}</Typography>
        </Box>

        {!completed && !locked && (
          <Button
            size="small" variant="outlined"
            endIcon={<ArrowForwardIcon />}
            onClick={() => router.push(route)}
            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, borderColor: RANK_COLORS[rank], color: RANK_COLORS[rank] }}
          >
            Start
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// PROFILE MAIN PAGE
// ============================================================

export default function ProfilePage() {
  const { profile, activeOrg, switchOrg } = useSociety();
  const router = useRouter();

  if (!profile) return null;

  const rank = calculateRank(profile);
  const totalLiquid = profile.wallet.withdrawableNP + profile.wallet.spendableNP + profile.wallet.promoNP;

  // Progress to next rank
  const rankThresholds: Record<RankLevel, number> = { 1: 0, 2: 500, 3: 2000, 4: 5000, 5: 10000 };
  const nextRank = Math.min(rank + 1, 5) as RankLevel;
  const currentThreshold = rankThresholds[rank];
  const nextThreshold = rankThresholds[nextRank];
  const progress = rank >= 5 ? 100 : ((profile.wallet.lifetimeNP - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }} sx={{ mb: 0.5 }}>Profile</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Your private control room — manage your identity, wallet, and rank.
        </Typography>
      </Box>

      {/* Identity Card */}
      <Box>
        <Card sx={{
          ...glassCard, mb: 3,
          background: `linear-gradient(135deg, ${RANK_COLORS[rank]}10, #ffffff)`,
        }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
              <Avatar
                src={profile.avatarUrl}
                sx={{
                  width: 80, height: 80,
                  background: `linear-gradient(135deg, ${RANK_COLORS[rank]}, ${RANK_COLORS[rank]}88)`,
                  fontSize: '2rem', fontWeight: 800,
                }}
              >
                {profile.displayName?.charAt(0) || 'U'}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{profile.displayName || 'Anonymous'}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                  {profile.roles.map(r => (
                    <Chip key={r} label={r.charAt(0).toUpperCase() + r.slice(1)} size="small" sx={{ fontWeight: 600 }} />
                  ))}
                </Stack>

                {/* Rank + Progress */}
                <Box sx={{ mt: 2 }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ alignItems: "center" }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmojiEventsIcon sx={{ color: RANK_COLORS[rank], fontSize: 20 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }} sx={{ color: RANK_COLORS[rank] }}>
                        Rank {rank} · {RANK_NAMES[rank]}
                      </Typography>
                    </Box>
                    {rank < 5 && (
                      <Typography variant="caption" color="text.secondary">
                        {profile.wallet.lifetimeNP.toLocaleString()} / {nextThreshold.toLocaleString()} NP
                      </Typography>
                    )}
                  </Stack>
                  <LinearProgress
                    variant="determinate" value={Math.min(progress, 100)}
                    sx={{
                      mt: 0.5, height: 8, borderRadius: 4,
                      bgcolor: 'rgba(0,0,0,0.06)',
                      '& .MuiLinearProgress-bar': { bgcolor: RANK_COLORS[rank], borderRadius: 4 },
                    }}
                  />
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Context Switcher (Individual / Organization) */}
      {profile.organizations && profile.organizations.length > 0 && (
        <Box>
          <Card sx={{ ...glassCard, mb: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" sx={{ alignItems: "center" }} spacing={1} sx={{ mb: 1.5 }}>
                <SwapHorizIcon sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Context Switcher</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                Switch between posting as yourself or on behalf of an organization.
              </Typography>
              <Stack spacing={1}>
                <Card
                  sx={{
                    cursor: 'pointer', p: 1.5, borderRadius: 2,
                    border: !activeOrg ? '2px solid' : '1px solid rgba(0,0,0,0.08)',
                    borderColor: !activeOrg ? 'primary.main' : 'transparent',
                    bgcolor: !activeOrg ? 'primary.main' : 'transparent',
                    color: !activeOrg ? 'white' : 'inherit',
                  }}
                  onClick={() => switchOrg(null)}
                >
                  <Stack direction="row" sx={{ alignItems: "center" }} spacing={1.5}>
                    <PersonIcon sx={{ fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Myself (Individual)</Typography>
                  </Stack>
                </Card>
                {profile.organizations.map(org => (
                  <Card
                    key={org.id}
                    sx={{
                      cursor: 'pointer', p: 1.5, borderRadius: 2,
                      border: activeOrg?.id === org.id ? '2px solid' : '1px solid rgba(0,0,0,0.08)',
                      borderColor: activeOrg?.id === org.id ? 'primary.main' : 'transparent',
                      bgcolor: activeOrg?.id === org.id ? 'primary.main' : 'transparent',
                      color: activeOrg?.id === org.id ? 'white' : 'inherit',
                    }}
                    onClick={() => switchOrg(org.id)}
                  >
                    <Stack direction="row" sx={{ alignItems: "center" }} spacing={1.5}>
                      <BusinessIcon sx={{ fontSize: 20 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{org.name}</Typography>
                      {org.verified && <VerifiedUserIcon sx={{ fontSize: 16, color: activeOrg?.id === org.id ? 'white' : '#1DA1F2' }} />}
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* 4-Tier Wallet */}
      <Box>
        <Stack direction="row" sx={{ alignItems: "center" }} spacing={1} sx={{ mb: 1.5 }}>
          <AccountBalanceWalletIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Nerve Wallet</Typography>
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
          <WalletCard label="Lifetime NP" amount={profile.wallet.lifetimeNP} color="#7c4dff" subtitle="Reputation XP (Permanent)" />
          <WalletCard label="Withdrawable" amount={profile.wallet.withdrawableNP} color="#4caf50" subtitle="Earned — Cash out anytime" />
          <WalletCard label="Spendable" amount={profile.wallet.spendableNP} color="#2196f3" subtitle="Purchased — Use on platform" />
          <WalletCard label="Promo NP" amount={profile.wallet.promoNP} color="#ff9800" subtitle="Free credits — System use only" />
        </Box>

        <Stack direction="row" spacing={2}>
          <Button variant="contained" fullWidth sx={{ borderRadius: 3, py: 1.2, fontWeight: 700 }}>
            Fund Wallet
          </Button>
          <Button variant="outlined" fullWidth sx={{ borderRadius: 3, py: 1.2, fontWeight: 700 }}
            disabled={profile.wallet.withdrawableNP === 0}
          >
            Withdraw
          </Button>
        </Stack>
      </Box>

      {/* Gatekeeper Quests */}
      <Box>
        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }} sx={{ mb: 2 }}>
          🎯 Gatekeeper Quests
        </Typography>
        <Stack spacing={1.5}>
          <QuestItem
            rank={2} title="Complete Your Profile"
            description="Add your avatar, bio, role, and sector preferences."
            completed={profile.gatekeepers.hasCompletedProfile}
            route="/profile/setup"
          />
          <QuestItem
            rank={3} title="Verify Your Identity (KYC)"
            description="Upload a government ID to unlock direct messaging."
            completed={profile.gatekeepers.hasKYC}
            route="/profile/kyc"
            locked={!profile.gatekeepers.hasCompletedProfile}
          />
          <QuestItem
            rank={4} title="Verify Your Business (CAC)"
            description="Upload CAC documents to launch Support campaigns."
            completed={profile.gatekeepers.hasBusinessVerification}
            route="/profile/verify-business"
            locked={!profile.gatekeepers.hasKYC}
          />
          <QuestItem
            rank={5} title="Reach Apex Status"
            description="Accumulate 10,000+ Lifetime NP and be recognized by the board."
            completed={rank >= 5}
            route="/profile"
            locked={!profile.gatekeepers.hasBusinessVerification}
          />
        </Stack>
      </Box>
    </Box>
  );
}
