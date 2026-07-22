// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Stack, Button, Avatar, Chip, Divider, LinearProgress, Switch, FormControlLabel, Select, MenuItem, Paper, IconButton, alpha, Dialog } from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import { useSociety, RANK_NAMES, RANK_COLORS, calculateRank, type RankLevel } from '@/context/SocietyContext';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import IosShareIcon from '@mui/icons-material/IosShare';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ShieldIcon from '@mui/icons-material/Shield';
import BoltIcon from '@mui/icons-material/Bolt';
import DownloadIcon from '@mui/icons-material/Download';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';
import { useWiki } from '@/app/components/providers/WikiProvider';
import { getAllVisibleWikiDocs } from '@/lib/actions/wiki';
import AdminOnboardingModal from '@/app/modular-society/[tenant]/(authenticated)/components/AdminOnboardingModal';
import ExecutiveCard from '@/app/modular-society/[tenant]/(authenticated)/components/ExecutiveCard';
import useExportAsImage from '@/hooks/useExportAsImage';

// ============================================================
// PROFILE MAIN PAGE — PREMIUM REDESIGN
// ============================================================

export default function UserSettingsBackstage({ onClose }: { onClose?: (blockId?: string) => void }) {
  const { profile, activeOrg, switchOrg } = useSociety();
  const router = useRouter();
  const params = useParams();
  const { openWiki } = useWiki();
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isCardsModalOpen, setIsCardsModalOpen] = useState(false);
  const [wikiDocs, setWikiDocs] = useState<any[]>([]);

  React.useEffect(() => {
    if (profile) {
      getAllVisibleWikiDocs(profile.roles || [], profile.uid || 'guest', profile.isAdmin || false).then(res => {
        if (res.success && res.data) {
          setWikiDocs(res.data);
        }
      });
    }
  }, [profile]);

  const cardRef1 = React.useRef<HTMLDivElement>(null);
  const cardRef2 = React.useRef<HTMLDivElement>(null);
  const { exportAsImage: exportCard1 } = useExportAsImage(cardRef1);
  const { exportAsImage: exportCard2 } = useExportAsImage(cardRef2);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = '/join'; 
    } catch (e) {
      console.error('Sign out failed:', e);
    }
  };

  if (!profile) return null;

  const rank = calculateRank(profile);
  const totalLiquid = profile.wallet.withdrawableNP + profile.wallet.spendableNP + profile.wallet.promoNP;

  // Progress to next rank
  const rankThresholds: Record<RankLevel, number> = { 1: 0, 2: 500, 3: 2000, 4: 5000, 5: 10000 };
  const nextRank = Math.min(rank + 1, 5) as RankLevel;
  const currentThreshold = rankThresholds[rank];
  const nextThreshold = rankThresholds[nextRank];
  const progress = rank >= 5 ? 100 : ((profile.wallet.lifetimeNP - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

  const rankColor = RANK_COLORS[rank] || '#9e9e9e';

  const walletItems = [
    { label: 'Lifetime NP', amount: profile.wallet.lifetimeNP, color: '#7c4dff', subtitle: 'Reputation XP', icon: '✦' },
    { label: 'Withdrawable', amount: profile.wallet.withdrawableNP, color: '#10b981', subtitle: 'Cash out anytime', icon: '↗' },
    { label: 'Spendable', amount: profile.wallet.spendableNP, color: '#3b82f6', subtitle: 'Platform credits', icon: '◉' },
    { label: 'Promo NP', amount: profile.wallet.promoNP, color: '#f59e0b', subtitle: 'Free credits', icon: '★' },
  ];

  const quests = [
    {
      rank: 2 as RankLevel, title: 'Complete Your Profile',
      description: 'Add your avatar, bio, role, and sector preferences.',
      completed: profile.gatekeepers.hasCompletedProfile,
      route: '/profile/setup', locked: false,
    },
    {
      rank: 3 as RankLevel, title: 'Verify Your Identity (KYC)',
      description: 'Upload a government ID to unlock direct messaging.',
      completed: profile.gatekeepers.hasKYC,
      route: '/profile/kyc',
      locked: !profile.gatekeepers.hasCompletedProfile,
    },
    {
      rank: 4 as RankLevel, title: 'Verify Your Business (CAC)',
      description: 'Upload CAC documents to launch Support campaigns.',
      completed: profile.gatekeepers.hasBusinessVerification,
      route: '/profile/verify-business',
      locked: !profile.gatekeepers.hasKYC,
    },
    {
      rank: 5 as RankLevel, title: 'Reach Apex Status',
      description: 'Accumulate 10,000+ Lifetime NP and be recognized.',
      completed: rank >= 5,
      route: '/profile',
      locked: !profile.gatekeepers.hasBusinessVerification,
    },
  ];

  const settingsItems = [
    { label: 'Edit Profile Details & Cards', icon: <EditIcon />, action: () => setEditModalOpen(true) },
    { label: 'Notification Preferences', icon: <NotificationsActiveIcon />, action: () => {} },
    { label: 'Security & Privacy', icon: <ShieldIcon />, action: () => {} },
  ];

  const dpOrg = profile.organizations?.find(o => o.slug === 'darkpore');
  const fnOrg = profile.organizations?.find(o => o.slug === 'foodnerve');

  const fullName = [
    ...(profile.prefixes || []), 
    profile.firstName || '', 
    profile.lastName || '', 
    ...(profile.suffixes || [])
  ].filter(Boolean).join(' ') || profile.displayName || 'Anonymous';

  const execProps = {
    prefixes: profile.prefixes || [],
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    suffixes: profile.suffixes || [],
    avatarUrl: profile.avatarUrl || '',
    darkpore: { active: !!dpOrg, role: dpOrg?.role, department: dpOrg?.department, logoUrl: dpOrg?.logoUrl },
    foodnerve: { active: !!fnOrg, role: fnOrg?.role, department: fnOrg?.department, logoUrl: fnOrg?.logoUrl },
  };

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        bgcolor: '#f8fafc',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 4 }}>

      {/* ─── HERO CARD (The Executive Dossier) ─── */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          {onClose && (
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => onClose('edit-profile')} sx={{ borderRadius: '12px', fontWeight: 700 }}>
              Edit Profile
            </Button>
          )}
        </Box>
        <Box
          sx={{
            position: 'relative',
            borderRadius: '28px',
            overflow: 'hidden',
            bgcolor: '#111318',
            p: { xs: 3, md: 5 },
          }}
        >
          {/* Ambient glow orbs */}
          <Box sx={{
            position: 'absolute', top: '-20%', left: '-10%',
            width: '50%', height: '80%',
            bgcolor: rankColor, opacity: 0.15, filter: 'blur(80px)', borderRadius: '50%',
          }} />
          <Box sx={{
            position: 'absolute', bottom: '-30%', right: '-10%',
            width: '60%', height: '90%',
            bgcolor: rankColor, opacity: 0.1, filter: 'blur(100px)', borderRadius: '50%',
          }} />

          {/* Content */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            {/* Avatar + Info */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems={{ sm: 'flex-start' }}>
              {/* Avatar with rank ring */}
              <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <Box
                  sx={{
                    width: 108, height: 108,
                    borderRadius: '50%',
                    background: `conic-gradient(${rankColor} ${progress}%, rgba(255,255,255,0.1) ${progress}%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    p: '4px',
                  }}
                >
                  <Avatar
                    src={profile.avatarUrl}
                    sx={{
                      width: 100, height: 100,
                      fontSize: '2.5rem', fontWeight: 800,
                      bgcolor: '#1e2028',
                      border: '4px solid #111318',
                    }}
                  >
                    {profile.displayName?.charAt(0) || 'U'}
                  </Avatar>
                </Box>
                {/* Rank badge */}
                <Box sx={{
                  position: 'absolute', bottom: -4, right: -4,
                  bgcolor: rankColor, color: '#fff',
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 900,
                  border: '3px solid #111318',
                  boxShadow: `0 0 12px ${alpha(rankColor, 0.5)}`,
                }}>
                  {rank}
                </Box>
              </Box>

              {/* Name + Role + Bio */}
              <Box sx={{ flex: 1, pt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 1 }}>
                  <Typography sx={{
                    color: '#fff', fontWeight: 800,
                    fontSize: { xs: '1.8rem', md: '2.4rem' },
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em'
                  }}>
                    {fullName}
                  </Typography>
                  {profile.username && (
                    <Button
                      variant="outlined"
                      startIcon={<IosShareIcon />}
                      onClick={() => {
                        const url = `${window.location.origin}/modular-society/${params.tenant || 'darkpore'}/@u-${profile.username}`;
                        navigator.clipboard.writeText(url);
                        alert('Public Profile Link Copied!');
                      }}
                      sx={{ 
                        color: 'rgba(255,255,255,0.9)', 
                        borderColor: 'rgba(255,255,255,0.2)', 
                        borderRadius: '12px', 
                        fontWeight: 600,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.4)' }
                      }}
                    >
                      Share Profile
                    </Button>
                  )}
                </Box>
                <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
                  {profile.roles.map(r => (
                    <Chip
                      key={r}
                      label={r.charAt(0).toUpperCase() + r.slice(1)}
                      size="medium"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.9)',
                        fontWeight: 700, fontSize: '0.8rem',
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}
                    />
                  ))}
                  {dpOrg && (
                    <Chip
                      icon={<BusinessIcon sx={{ color: '#0f172a !important' }} />}
                      label={dpOrg.role}
                      size="medium"
                      sx={{
                        bgcolor: '#f1f5f9',
                        color: '#0f172a',
                        fontWeight: 800, fontSize: '0.8rem',
                      }}
                    />
                  )}
                  {fnOrg && (
                    <Chip
                      icon={<BusinessIcon sx={{ color: '#fff !important' }} />}
                      label={fnOrg.role}
                      size="medium"
                      sx={{
                        bgcolor: '#16a34a',
                        color: '#fff',
                        fontWeight: 800, fontSize: '0.8rem',
                      }}
                    />
                  )}
                </Stack>
                {profile.bio && (
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '800px', mb: 3 }}>
                    {profile.bio}
                  </Typography>
                )}

                {/* Rank progress */}
                <Box sx={{
                  bgcolor: 'rgba(255,255,255,0.06)',
                  borderRadius: '14px', p: 2,
                  border: '1px solid rgba(255,255,255,0.08)',
                  maxWidth: '400px'
                }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmojiEventsIcon sx={{ color: rankColor, fontSize: 18 }} />
                      <Typography sx={{ color: rankColor, fontWeight: 800, fontSize: '0.85rem' }}>
                        {RANK_NAMES[rank]}
                      </Typography>
                    </Box>
                    {rank < 5 && (
                      <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>
                        {profile.wallet.lifetimeNP.toLocaleString()} / {nextThreshold.toLocaleString()} NP
                      </Typography>
                    )}
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(progress, 100)}
                    sx={{
                      height: 6, borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.08)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: rankColor, borderRadius: 3,
                        boxShadow: `0 0 12px ${alpha(rankColor, 0.4)}`,
                      },
                    }}
                  />
                </Box>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* ─── AFFILIATIONS & CLEARANCES ─── */}
      {profile.organizations && profile.organizations.length > 0 && (
        <Box>
           <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', mb: 2, color: '#0f172a' }}>
            Affiliations & Clearances
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            {profile.organizations.map((org) => (
              <Box key={org.id} 
                onClick={() => {
                  if (profile.isAdmin) {
                    setIsCardsModalOpen(true);
                  } else {
                    if (onClose) onClose('identity-cards');
                  }
                }}
                sx={{
                bgcolor: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                p: 3,
                border: '1px solid rgba(0,0,0,0.05)',
                display: 'flex', gap: 3, alignItems: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.02)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                   transform: 'translateY(-2px)',
                   boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
                   bgcolor: '#fff',
                }
              }}>
                <Avatar src={org.logoUrl} variant="rounded" sx={{ width: 64, height: 64, borderRadius: '16px', bgcolor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  {org.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>{org.name}</Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>{org.role}</Typography>
                  {org.department && (
                     <Typography sx={{ color: '#94a3b8', fontSize: '0.8rem', mt: 0.5 }}>Dept: {org.department}</Typography>
                  )}
                </Box>
                {org.verified && <VerifiedUserIcon sx={{ color: '#10b981', ml: 'auto', fontSize: 28 }} />}
              </Box>
            ))}
          </Box>
          <Typography sx={{ mt: 2, fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
            Tap an affiliation to view your Executive Identity Cards or edit details.
          </Typography>
        </Box>
      )}

      {/* ─── EXECUTIVE IDENTITY CARDS MODAL ─── */}
      <Dialog
        open={isCardsModalOpen}
        onClose={() => setIsCardsModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '24px', bgcolor: '#f8fafc', p: { xs: 2, md: 4 } }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f172a' }}>
            Executive Identity Cards
          </Typography>
          <Button 
            onClick={() => { setIsCardsModalOpen(false); setEditModalOpen(true); }} 
            variant="contained" 
            sx={{ borderRadius: '12px', bgcolor: '#1e293b', color: '#fff', '&:hover': { bgcolor: '#0f172a' } }} 
            startIcon={<EditIcon />}
          >
            Edit Details
          </Button>
        </Box>
        <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
          Download your officially generated ID cards to share across your networks.
        </Typography>

        {profile.isAdmin && (dpOrg || fnOrg) && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4 }}>
            {/* Card 1: Announcement */}
            <Box>
               <Box ref={cardRef1} sx={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                  <ExecutiveCard cardTheme="#0f172a" cardStyle="announcement" {...execProps} />
               </Box>
               <Button
                 fullWidth
                 variant="outlined"
                 startIcon={<DownloadIcon />}
                 onClick={() => exportCard1('executive_announcement.png')}
                 sx={{ mt: 3, py: 1.5, borderRadius: '16px', fontWeight: 800, borderColor: 'rgba(0,0,0,0.1)', color: '#0f172a' }}
               >
                 Download Announcement
               </Button>
            </Box>

            {/* Card 2: Membership */}
            <Box>
               <Box ref={cardRef2} sx={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                  <ExecutiveCard cardTheme="#10b981" cardStyle="membership" {...execProps} />
               </Box>
               <Button
                 fullWidth
                 variant="outlined"
                 startIcon={<DownloadIcon />}
                 onClick={() => exportCard2('executive_id.png')}
                 sx={{ mt: 3, py: 1.5, borderRadius: '16px', fontWeight: 800, borderColor: 'rgba(0,0,0,0.1)', color: '#0f172a' }}
               >
                 Download ID Card
               </Button>
            </Box>
          </Box>
        )}
      </Dialog>

      {/* ─── NERVE WALLET ─── */}
      <Box>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <AccountBalanceWalletIcon sx={{ color: '#7c4dff', fontSize: 22 }} />
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>Nerve Wallet</Typography>
          <Box sx={{
            ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5,
            bgcolor: alpha('#7c4dff', 0.08), px: 1.5, py: 0.5, borderRadius: 10,
          }}>
            <BoltIcon sx={{ fontSize: 16, color: '#7c4dff' }} />
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#7c4dff' }}>
              {totalLiquid.toLocaleString()} NP
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 1.5 }}>
          {walletItems.map(item => (
            <Box
              key={item.label}
              sx={{
                bgcolor: '#fff',
                borderRadius: '18px',
                p: 2.5,
                border: `1px solid ${alpha(item.color, 0.12)}`,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${alpha(item.color, 0.12)}` },
              }}
            >
              {/* Subtle gradient overlay */}
              <Box sx={{
                position: 'absolute', top: 0, right: 0,
                width: '60%', height: '100%',
                background: `linear-gradient(135deg, transparent 30%, ${alpha(item.color, 0.04)})`,
                borderRadius: '18px',
              }} />
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography sx={{ fontSize: '1.2rem', mb: 0.5, opacity: 0.3 }}>{item.icon}</Typography>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                  {item.label}
                </Typography>
                <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: item.color, lineHeight: 1 }}>
                  {item.amount.toLocaleString()}
                </Typography>
                <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled', mt: 0.5, fontWeight: 500 }}>
                  {item.subtitle}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
          <Button
            variant="contained" fullWidth
            onClick={() => onClose && onClose('wallet')}
            sx={{
              borderRadius: '14px', py: 1.4, fontWeight: 800, fontSize: '0.9rem',
              bgcolor: '#1e293b', color: '#fff', textTransform: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              '&:hover': { bgcolor: '#0f172a', transform: 'translateY(-1px)', boxShadow: '0 6px 16px rgba(0,0,0,0.18)' },
            }}
          >
            Fund Wallet
          </Button>
          <Button
            variant="outlined" fullWidth
            onClick={() => onClose && onClose('wallet')}
            sx={{
              borderRadius: '14px', py: 1.4, fontWeight: 800, fontSize: '0.9rem',
              borderColor: 'rgba(0,0,0,0.12)', color: 'text.primary', textTransform: 'none',
              '&:hover': { borderColor: 'rgba(0,0,0,0.25)', bgcolor: 'rgba(0,0,0,0.02)', transform: 'translateY(-1px)' },
            }}
          >
            Withdraw
          </Button>
        </Stack>
      </Box>

      {/* ─── CONTEXT SWITCHER ─── */}
      {profile.organizations && profile.organizations.length > 0 && (
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <SwapHorizIcon sx={{ color: '#6366f1', fontSize: 22 }} />
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>Context Switcher</Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            Switch between posting as yourself or on behalf of an organization.
          </Typography>
          <Stack spacing={1}>
            <Box
              onClick={() => switchOrg(null)}
              sx={{
                cursor: 'pointer', p: 2, borderRadius: '14px',
                bgcolor: !activeOrg ? '#6366f1' : '#fff',
                color: !activeOrg ? 'white' : 'inherit',
                border: !activeOrg ? 'none' : '1px solid rgba(0,0,0,0.08)',
                display: 'flex', alignItems: 'center', gap: 1.5,
                transition: 'all 0.2s',
                boxShadow: !activeOrg ? `0 4px 14px ${alpha('#6366f1', 0.35)}` : 'none',
                '&:hover': { transform: 'translateY(-1px)' },
              }}
            >
              <PersonIcon sx={{ fontSize: 20 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Myself (Individual)</Typography>
            </Box>
            {profile.organizations.map(org => (
              <Box
                key={org.id}
                onClick={() => switchOrg(org.id)}
                sx={{
                  cursor: 'pointer', p: 2, borderRadius: '14px',
                  bgcolor: activeOrg?.id === org.id ? '#6366f1' : '#fff',
                  color: activeOrg?.id === org.id ? 'white' : 'inherit',
                  border: activeOrg?.id === org.id ? 'none' : '1px solid rgba(0,0,0,0.08)',
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  transition: 'all 0.2s',
                  boxShadow: activeOrg?.id === org.id ? `0 4px 14px ${alpha('#6366f1', 0.35)}` : 'none',
                  '&:hover': { transform: 'translateY(-1px)' },
                }}
              >
                <BusinessIcon sx={{ fontSize: 20 }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{org.name}</Typography>
                {org.verified && <VerifiedUserIcon sx={{ fontSize: 16, color: activeOrg?.id === org.id ? 'white' : '#1DA1F2', ml: 'auto' }} />}
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* ─── GATEKEEPER QUESTS (Timeline) ─── */}
      <Box>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '1.3rem' }}>🎯</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>Gatekeeper Quests</Typography>
          </Box>
          <Button size="small" variant="text" onClick={() => onClose && onClose('quests')} sx={{ fontWeight: 700, color: '#3b82f6' }}>
             Manage
          </Button>
        </Stack>

        <Box sx={{ position: 'relative', pl: 4 }}>
          {/* Vertical timeline line */}
          <Box sx={{
            position: 'absolute', left: 13, top: 8, bottom: 8,
            width: 2, bgcolor: 'rgba(0,0,0,0.08)',
            borderRadius: 1,
          }} />

          <Stack spacing={0}>
            {quests.map((quest, i) => {
              const questColor = RANK_COLORS[quest.rank];
              const isLast = i === quests.length - 1;

              return (
                <Box key={quest.title} sx={{ position: 'relative', pb: isLast ? 0 : 1 }}>
                  {/* Timeline node */}
                  <Box sx={{
                    position: 'absolute', left: -27, top: 18,
                    width: 24, height: 24, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: quest.completed ? questColor : quest.locked ? '#e2e8f0' : '#fff',
                    border: quest.completed ? 'none' : `2px solid ${quest.locked ? '#cbd5e1' : questColor}`,
                    boxShadow: quest.completed ? `0 0 12px ${alpha(questColor, 0.4)}` : 'none',
                    zIndex: 1,
                  }}>
                    {quest.completed ? (
                      <CheckCircleIcon sx={{ fontSize: 16, color: '#fff' }} />
                    ) : quest.locked ? (
                      <LockIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                    ) : (
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: questColor }} />
                    )}
                  </Box>

                  {/* Quest card */}
                  <Box
                    sx={{
                      bgcolor: '#fff',
                      borderRadius: '16px',
                      p: 2.5,
                      border: quest.completed ? `1px solid ${alpha(questColor, 0.2)}` : '1px solid rgba(0,0,0,0.06)',
                      opacity: quest.locked ? 0.5 : 1,
                      transition: 'all 0.2s',
                      '&:hover': quest.locked ? {} : { transform: 'translateX(4px)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{quest.title}</Typography>
                          <Chip
                            label={RANK_NAMES[quest.rank]}
                            size="small"
                            sx={{
                              bgcolor: alpha(questColor, 0.1),
                              color: questColor,
                              fontWeight: 700, fontSize: '0.6rem', height: 20,
                            }}
                          />
                        </Stack>
                        <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.4 }}>
                          {quest.description}
                        </Typography>
                      </Box>
                      {!quest.completed && !quest.locked && (
                        <IconButton
                          onClick={() => router.push(quest.route)}
                          size="small"
                          sx={{
                            bgcolor: alpha(questColor, 0.1),
                            color: questColor,
                            ml: 1.5,
                            '&:hover': { bgcolor: alpha(questColor, 0.2) },
                          }}
                        >
                          <ArrowForwardIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      )}
                    </Stack>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Box>

      {/* ─── OMNI-WIKI DASHBOARD ─── */}
      <Box sx={{ mb: 4 }}>
         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
           <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
             SOPs & Playbooks
           </Typography>
           <Button size="small" variant="text" onClick={() => router.push(`/profile/wiki`)} sx={{ fontWeight: 700, color: '#3b82f6' }}>
             Open Full Hub
           </Button>
         </Box>

         <Box sx={{ 
            bgcolor: '#fff', 
            borderRadius: '20px', 
            border: '1px solid rgba(0,0,0,0.06)',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
         }}>
           {wikiDocs.length === 0 ? (
             <Box sx={{ p: 3, textAlign: 'center' }}>
               <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', fontStyle: 'italic' }}>
                 No playbooks available for your clearance level.
               </Typography>
             </Box>
           ) : (
             <Box sx={{ display: 'flex', flexDirection: 'column' }}>
               {wikiDocs.map((doc, idx) => (
                  <React.Fragment key={doc.id}>
                    <Box
                      onClick={() => router.push(`/profile/wiki/${doc.slug}`)}
                      sx={{
                        p: 2.5,
                        display: 'flex', alignItems: 'center', gap: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                           bgcolor: 'rgba(59, 130, 246, 0.04)',
                           pl: 3,
                        }
                      }}
                    >
                      <Box sx={{ p: 1, bgcolor: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: '#3b82f6' }}>
                        <MenuBookIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{doc.title}</Typography>
                          {doc.isPublic ? (
                             <Chip label="Public" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }} />
                          ) : (
                             <Chip label="Restricted" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }} />
                          )}
                        </Box>
                        <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mt: 0.5 }}>
                          Category: <span style={{ textTransform: 'capitalize' }}>{doc.category}</span>
                        </Typography>
                      </Box>
                      <ArrowForwardIcon sx={{ color: '#cbd5e1', fontSize: 20 }} />
                    </Box>
                    {idx < wikiDocs.length - 1 && <Divider sx={{ mx: 2.5 }} />}
                  </React.Fragment>
               ))}
             </Box>
           )}
         </Box>
      </Box>

      {/* ─── ACCOUNT SETTINGS ─── */}
      <Box sx={{ pb: 12 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', mb: 2 }}>
          Account Settings
        </Typography>
        <Box sx={{
          bgcolor: '#fff',
          borderRadius: '18px',
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.06)',
        }}>
          {settingsItems.map((item, i) => (
            <React.Fragment key={item.label}>
              <Box
                onClick={() => onClose ? onClose(item.label === 'Edit Profile Details & Cards' ? 'edit-profile' : item.label === 'Notification Preferences' ? 'notifications' : 'security') : item.action()}
                sx={{
                  p: 2.5, display: 'flex', alignItems: 'center', gap: 2,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.02)', transform: 'translateX(4px)' },
                }}
              >
                <Box sx={{
                  p: 1, borderRadius: '10px',
                  bgcolor: 'rgba(0,0,0,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'text.secondary',
                  '& svg': { fontSize: 20 },
                }}>
                  {item.icon}
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', flex: 1 }}>{item.label}</Typography>
                <ArrowForwardIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
              </Box>
              {i < settingsItems.length - 1 && <Divider sx={{ mx: 2.5 }} />}
            </React.Fragment>
          ))}

          <Divider sx={{ mx: 2.5 }} />

          {/* Sign Out */}
          <Box
            onClick={handleSignOut}
            sx={{
              p: 2.5, display: 'flex', alignItems: 'center', gap: 2,
              cursor: 'pointer',
              transition: 'all 0.15s',
              '&:hover': { bgcolor: 'rgba(211,47,47,0.04)' },
            }}
          >
            <Box sx={{
              p: 1, borderRadius: '10px',
              bgcolor: alpha('#ef4444', 0.08),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ef4444',
              '& svg': { fontSize: 20 },
            }}>
              <LogoutIcon />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#ef4444', flex: 1 }}>Sign Out</Typography>
            <ArrowForwardIcon sx={{ fontSize: 18, color: '#ef4444' }} />
          </Box>
        </Box>
      </Box>

      {/* ─── FLOATING BACK BUTTON (iOS Pill) ─── */}
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 24, md: 32 },
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
        }}
      >
        <Button
          onClick={() => router.back()}
          startIcon={<ArrowBackIcon />}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            color: '#0f2414',
            fontWeight: 800,
            fontSize: '0.95rem',
            px: 4,
            py: 1.2,
            borderRadius: '100px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(255,255,255,0.4)',
            textTransform: 'none',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              transform: 'scale(1.02)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            },
            transition: 'all 0.2s',
          }}
        >
          Back
        </Button>
      </Box>
      </Container>
      
      {isEditModalOpen && (
        <AdminOnboardingModal 
          isEditMode={true} 
          open={isEditModalOpen} 
          onClose={() => setEditModalOpen(false)} 
        />
      )}
    </Box>
  );
}
