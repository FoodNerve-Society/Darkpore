// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  Avatar,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  IconButton,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
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
import VerifiedIcon from '@mui/icons-material/Verified';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BadgeIcon from '@mui/icons-material/Badge';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import ReplayIcon from '@mui/icons-material/Replay';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';
import { useWiki } from '@/app/components/providers/WikiProvider';
import { getAllVisibleWikiDocs } from '@/lib/actions/wiki';
import ExecutiveCard from '@/app/modular-society/[tenant]/(authenticated)/components/ExecutiveCard';
import useExportAsImage from '@/hooks/useExportAsImage';

// Premium Project Components
import PremiumTextField from '@/components/PremiumTextField';
import PremiumAutocomplete from '@/components/PremiumAutocomplete';
import PremiumMarkdownEditor from '@/components/PremiumMarkdownEditor';
import PremiumSwitch from '@/components/PremiumSwitch';

// ============================================================
// FLIPPABLE PROFILE BLOCKS SPECIFICATION (Modeled on Listing Studio Blocks)
// ============================================================

export type ProfileBlockId =
  | 'identity'
  | 'wallet'
  | 'quests'
  | 'credentials'
  | 'workspaces'
  | 'wiki'
  | 'security';

interface Props {
  onClose?: (blockId?: ProfileBlockId) => void;
  initialBlockId?: ProfileBlockId | null;
}

const PREFIX_OPTIONS = ['Dr.', 'Prof.', 'Engr.', 'Chief', 'Mr.', 'Mrs.', 'Ms.', 'Barrister', 'Hon.'];
const SUFFIX_OPTIONS = ['PhD', 'MSc', 'MBA', 'BSc', 'B.Eng', 'OON', 'CON', 'CFA', 'FCA', 'Esq.'];
const SPECIALIZATION_OPTIONS = [
  'Agronomy & Soil Health',
  'Cold Chain Logistics & Post-Harvest',
  'Grain Processing & Milling',
  'Fintech Escrow & Trade Settlements',
  'Commodity Export & Quality Assurance',
  'Livestock, Dairy & Aquaculture',
  'AgTech Robotics & Satellite Analytics',
  'Policy, Research & Extension Services',
];

export default function UserSettingsBackstage({ onClose, initialBlockId }: Props) {
  const { profile, activeOrg, switchOrg } = useSociety();
  const router = useRouter();
  const params = useParams();
  const { openWiki } = useWiki();

  // Flippable Block State (Which individual block is flipped to its back face)
  const [flippedBlockId, setFlippedBlockId] = useState<ProfileBlockId | null>(initialBlockId || null);

  // Active Block Expanded into Full Modal (Triggered via expand icon on back face)
  const [activeModalBlock, setActiveModalBlock] = useState<ProfileBlockId | null>(null);

  useEffect(() => {
    if (initialBlockId) {
      setFlippedBlockId(initialBlockId);
    }
  }, [initialBlockId]);

  // Toast notifications
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Wiki documentation
  const [wikiDocs, setWikiDocs] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      getAllVisibleWikiDocs(profile.roles || [], profile.uid || 'guest', profile.isAdmin || false).then((res) => {
        if (res.success && res.data) {
          setWikiDocs(res.data);
        }
      });
    }
  }, [profile]);

  // Form states for Identity Block
  const [editFirstName, setEditFirstName] = useState(profile?.firstName || '');
  const [editLastName, setEditLastName] = useState(profile?.lastName || '');
  const [editPrefix, setEditPrefix] = useState((profile?.prefixes && profile.prefixes[0]) || '');
  const [editSuffix, setEditSuffix] = useState((profile?.suffixes && profile.suffixes[0]) || '');
  const [editAvatarUrl, setEditAvatarUrl] = useState(profile?.avatarUrl || '');
  const [editBio, setEditBio] = useState(profile?.bio || '');
  const [editSpecialization, setEditSpecialization] = useState(profile?.specialization || 'Agronomy & Cold Chain Logistics');

  useEffect(() => {
    if (profile) {
      setEditFirstName(profile.firstName || '');
      setEditLastName(profile.lastName || '');
      setEditPrefix((profile.prefixes && profile.prefixes[0]) || '');
      setEditSuffix((profile.suffixes && profile.suffixes[0]) || '');
      setEditAvatarUrl(profile.avatarUrl || '');
      setEditBio(profile.bio || '');
      setEditSpecialization(profile.specialization || 'Agronomy & Cold Chain Logistics');
    }
  }, [profile]);

  // Wallet Block states
  const [depositAmount, setDepositAmount] = useState('20000');
  const [withdrawAmount, setWithdrawAmount] = useState('10000');

  // Security Block states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [publicDirectory, setPublicDirectory] = useState(true);

  // Executive Card Export Refs
  const cardRef1 = useRef<HTMLDivElement>(null);
  const cardRef2 = useRef<HTMLDivElement>(null);
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
  const totalLiquid = (profile.wallet?.withdrawableNP || 0) + (profile.wallet?.spendableNP || 0) + (profile.wallet?.promoNP || 0);

  // Progress calculation
  const rankThresholds: Record<RankLevel, number> = { 1: 0, 2: 500, 3: 2000, 4: 5000, 5: 10000 };
  const nextRank = Math.min(rank + 1, 5) as RankLevel;
  const currentThreshold = rankThresholds[rank];
  const nextThreshold = rankThresholds[nextRank];
  const lifetimeNP = profile.wallet?.lifetimeNP || 0;
  const progress = rank >= 5 ? 100 : Math.min(100, ((lifetimeNP - currentThreshold) / (nextThreshold - currentThreshold)) * 100);

  const rankColor = RANK_COLORS[rank] || '#9e9e9e';

  const walletItems = [
    { label: 'Lifetime NP', amount: profile.wallet?.lifetimeNP || 0, color: '#7c4dff', subtitle: 'Reputation XP', icon: '✦' },
    { label: 'Withdrawable', amount: profile.wallet?.withdrawableNP || 0, color: '#10b981', subtitle: 'Cash out anytime', icon: '↗' },
    { label: 'Spendable', amount: profile.wallet?.spendableNP || 0, color: '#3b82f6', subtitle: 'Platform credits', icon: '◉' },
    { label: 'Promo NP', amount: profile.wallet?.promoNP || 0, color: '#f59e0b', subtitle: 'Free credits', icon: '★' },
  ];

  const quests = [
    {
      rank: 2 as RankLevel,
      title: 'Complete Profile Setup',
      description: 'Add your avatar, bio, specialization, and value chain preferences.',
      completed: !!profile.gatekeepers?.hasCompletedProfile,
      route: '/profile/setup',
      locked: false,
      xp: '+500 NP',
    },
    {
      rank: 3 as RankLevel,
      title: 'Verify Identity (KYC)',
      description: 'Upload a government-issued ID to unlock direct messaging and trading escrow.',
      completed: !!profile.gatekeepers?.hasKYC,
      route: '/profile/kyc',
      locked: !profile.gatekeepers?.hasCompletedProfile,
      xp: '+1,500 NP',
    },
    {
      rank: 4 as RankLevel,
      title: 'Verify Business (CAC)',
      description: 'Upload CAC documents to launch campaigns and candidate hiring ledgers.',
      completed: !!profile.gatekeepers?.hasBusinessVerification,
      route: '/profile/verify-business',
      locked: !profile.gatekeepers?.hasKYC,
      xp: '+3,000 NP',
    },
    {
      rank: 5 as RankLevel,
      title: 'Reach Apex Status',
      description: 'Accumulate 10,000+ Lifetime NP and lead regional value chain syndicates.',
      completed: rank >= 5,
      route: '/profile',
      locked: !profile.gatekeepers?.hasBusinessVerification,
      xp: '+5,000 NP',
    },
  ];

  const nextQuest = quests.find((q) => !q.completed) || quests[quests.length - 1];

  const dpOrg = profile.organizations?.find((o) => o.slug === 'darkpore');
  const fnOrg = profile.organizations?.find((o) => o.slug === 'foodnerve');

  const fullName =
    [
      editPrefix || (profile.prefixes && profile.prefixes[0]) || '',
      editFirstName || profile.firstName || '',
      editLastName || profile.lastName || '',
      editSuffix || (profile.suffixes && profile.suffixes[0]) || '',
    ]
      .filter(Boolean)
      .join(' ') ||
    profile.displayName ||
    'Anonymous Operator';

  const execProps = {
    prefixes: editPrefix ? [editPrefix] : profile.prefixes || [],
    firstName: editFirstName || profile.firstName || '',
    lastName: editLastName || profile.lastName || '',
    suffixes: editSuffix ? [editSuffix] : profile.suffixes || [],
    avatarUrl: editAvatarUrl || profile.avatarUrl || '',
    darkpore: { active: !!dpOrg, role: dpOrg?.role, department: dpOrg?.department, logoUrl: dpOrg?.logoUrl },
    foodnerve: { active: !!fnOrg, role: fnOrg?.role, department: fnOrg?.department, logoUrl: fnOrg?.logoUrl },
  };

  const handleCopyPublicUrl = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const cleanOrigin = window.location.origin.includes('localhost') ? window.location.origin : 'https://foodnerve.org';
    const url = `${cleanOrigin}/@u-${profile.username || profile.uid}`;
    navigator.clipboard.writeText(url);
    setToastMsg(`Public Profile Link Copied: ${url}`);
  };

  const handleSaveIdentity = () => {
    setToastMsg('Profile details saved successfully!');
    setFlippedBlockId(null);
    setActiveModalBlock(null);
  };

  // Profile Blocks Framework Definition
  const PROFILE_BLOCKS: {
    id: ProfileBlockId;
    role: string;
    label: string;
    desc: string;
    color: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'identity',
      role: 'Personal Identity & Dossier',
      label: 'Dossier',
      desc: 'Operator credentials, academic titles, avatar, bio, and specialization mandate.',
      color: '#3b82f6',
      icon: <PersonIcon sx={{ fontSize: 20 }} />,
    },
    {
      id: 'wallet',
      role: 'Nerve Wallet & Liquid Treasury',
      label: 'Treasury',
      desc: '4-tier token balances, Paystack deposits, and cashout payouts.',
      color: '#7c4dff',
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 20 }} />,
    },
    {
      id: 'quests',
      role: 'Gatekeeper Quests & Governance',
      label: 'Governance',
      desc: 'Ecosystem rank criteria, verification checklists, and XP milestones.',
      color: '#f59e0b',
      icon: <EmojiEventsIcon sx={{ fontSize: 20 }} />,
    },
    {
      id: 'credentials',
      role: 'Executive Identity Cards',
      label: 'Credentials',
      desc: 'Official digital passes with live high-res PNG image export.',
      color: '#10b981',
      icon: <BadgeIcon sx={{ fontSize: 20 }} />,
    },
    {
      id: 'workspaces',
      role: 'Corporate Workspaces & Context',
      label: 'Workspaces',
      desc: 'Linked enterprise affiliations and 1-click active persona switcher.',
      color: '#06b6d4',
      icon: <BusinessIcon sx={{ fontSize: 20 }} />,
    },
    {
      id: 'wiki',
      role: 'Operational SOPs & Playbooks',
      label: 'Playbooks',
      desc: 'Clearance-based agricultural value chain guides and knowledge base.',
      color: '#6366f1',
      icon: <MenuBookIcon sx={{ fontSize: 20 }} />,
    },
    {
      id: 'security',
      role: 'Security & Session Controls',
      label: 'Security',
      desc: 'Two-factor authentication, directory visibility, and active device sessions.',
      color: '#ef4444',
      icon: <ShieldIcon sx={{ fontSize: 20 }} />,
    },
  ];

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
      <Container maxWidth="md" sx={{ py: { xs: 2.5, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* ─── 1. ZEN EXECUTIVE IDENTITY HERO CARD ───────────────── */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: '24px',
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            position: 'relative',
          }}
        >
          {/* Header Row: Rank Badge & Share Action */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`Rank ${rank} · ${RANK_NAMES[rank]}`}
                size="small"
                sx={{
                  bgcolor: alpha(rankColor, 0.12),
                  color: rankColor,
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  borderRadius: '8px',
                  border: `1px solid ${alpha(rankColor, 0.25)}`,
                }}
              />
              {rank >= 4 && <VerifiedIcon sx={{ color: '#10b981', fontSize: 18 }} />}
            </Box>

            <Button
              variant="outlined"
              size="small"
              startIcon={<IosShareIcon sx={{ fontSize: 15 }} />}
              onClick={handleCopyPublicUrl}
              sx={{
                borderRadius: '10px',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.8rem',
                borderColor: '#e2e8f0',
                color: '#475569',
                bgcolor: '#ffffff',
                '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' },
              }}
            >
              Share Profile
            </Button>
          </Box>

          {/* Operator Identity Presentation */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ sm: 'center' }}>
            <Box sx={{ position: 'relative', width: 76, height: 76, flexShrink: 0 }}>
              <Avatar
                src={editAvatarUrl || profile.avatarUrl}
                sx={{
                  width: 76,
                  height: 76,
                  fontSize: '2rem',
                  fontWeight: 800,
                  bgcolor: '#0f172a',
                  color: '#ffffff',
                  border: `2px solid ${rankColor}`,
                }}
              >
                {profile.displayName?.charAt(0) || fullName.charAt(0) || 'U'}
              </Avatar>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.4rem', md: '1.7rem' }, color: '#0f172a', lineHeight: 1.2 }}>
                {fullName}
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.85rem', mt: 0.3 }}>
                @{profile.username || 'operator'} {profile.roles?.length ? `· ${profile.roles.join(', ')}` : ''}
              </Typography>

              {(editBio || profile.bio) && (
                <Typography sx={{ color: '#475569', fontSize: '0.86rem', mt: 1, lineHeight: 1.5, maxWidth: 640 }}>
                  {editBio || profile.bio}
                </Typography>
              )}
            </Box>
          </Stack>

          {/* 3-Pill Glance Metrics */}
          <Box sx={{ display: 'flex', gap: 1.5, mt: 3, pt: 2.5, borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
            <Box
              onClick={() => setFlippedBlockId('wallet')}
              sx={{
                px: 2,
                py: 1.2,
                borderRadius: '12px',
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                flex: { xs: '1 1 100%', sm: 1 },
                cursor: 'pointer',
                transition: 'all 0.15s',
                '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' },
              }}
            >
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Liquid Treasury
              </Typography>
              <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                {totalLiquid.toLocaleString()} NP <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>(₦{totalLiquid.toLocaleString()})</span>
              </Typography>
            </Box>

            <Box
              onClick={() => setFlippedBlockId('quests')}
              sx={{
                px: 2,
                py: 1.2,
                borderRadius: '12px',
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                flex: { xs: '1 1 100%', sm: 1 },
                cursor: 'pointer',
                transition: 'all 0.15s',
                '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' },
              }}
            >
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Reputation XP
              </Typography>
              <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#7c4dff' }}>
                {lifetimeNP.toLocaleString()} NP <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>({Math.round(progress)}% to Rank {nextRank})</span>
              </Typography>
            </Box>

            <Box
              onClick={() => setFlippedBlockId('workspaces')}
              sx={{
                px: 2,
                py: 1.2,
                borderRadius: '12px',
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                flex: { xs: '1 1 100%', sm: 1 },
                cursor: 'pointer',
                transition: 'all 0.15s',
                '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' },
              }}
            >
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Active Persona
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: activeOrg ? '#3b82f6' : '#0f172a', mt: 0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeOrg ? activeOrg.name : 'Individual Operator'}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* ─── 2. FLIPPABLE MODULAR BLOCKS (WITH BACK FACE MODAL EXPAND) ─── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', px: 0.5 }}>
            Operational Modules & Flippable Blocks
          </Typography>

          {PROFILE_BLOCKS.map((b, i) => {
            const isFlipped = flippedBlockId === b.id;
            const color = b.color;

            return (
              <Box
                key={b.id}
                id={`profile-block-${b.id}`}
                sx={{ perspective: '1600px', mb: 1, scrollMarginTop: '120px' }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transformStyle: 'preserve-3d',
                    transformOrigin: 'center center',
                    transform: isFlipped ? 'rotateX(-180deg)' : 'none',
                  }}
                >
                  {/* ────────────────────────────────────────────────────
                      FRONT FACE
                     ──────────────────────────────────────────────────── */}
                  <Box
                    onClick={() => !isFlipped && setFlippedBlockId(b.id)}
                    sx={{
                      backfaceVisibility: 'hidden',
                      position: isFlipped ? 'absolute' : 'relative',
                      width: '100%',
                      top: 0,
                      borderRadius: '20px',
                      border: `1px solid ${alpha(color, 0.25)}`,
                      background: `linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.95) 100%)`,
                      backdropFilter: 'blur(16px)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.03)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      '&:hover': {
                        borderColor: color,
                        boxShadow: `0 12px 36px ${alpha(color, 0.12)}`,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
                      {/* Left vertical color accent */}
                      <Box sx={{ width: 6, flexShrink: 0, bgcolor: color }} />

                      <Box sx={{ p: { xs: 2, md: 2.5 }, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {/* Number & Icon Badge */}
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: '14px',
                              bgcolor: alpha(color, 0.1),
                              color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: `1px solid ${alpha(color, 0.2)}`,
                              flexShrink: 0,
                            }}
                          >
                            {b.icon}
                          </Box>

                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                              <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                                {b.role}
                              </Typography>
                              <Chip
                                label={b.label}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  bgcolor: alpha(color, 0.12),
                                  color,
                                  border: `1px solid ${alpha(color, 0.2)}`,
                                }}
                              />
                            </Box>
                            <Typography sx={{ color: '#64748b', fontSize: '0.82rem', mt: 0.3 }}>
                              {b.desc}
                            </Typography>
                          </Box>
                        </Box>

                        <Button
                          size="small"
                          variant="outlined"
                          endIcon={<SwapHorizIcon sx={{ fontSize: 16 }} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFlippedBlockId(b.id);
                          }}
                          sx={{
                            borderRadius: '10px',
                            fontWeight: 700,
                            textTransform: 'none',
                            fontSize: '0.78rem',
                            borderColor: alpha(color, 0.4),
                            color,
                            '&:hover': { bgcolor: alpha(color, 0.08), borderColor: color },
                          }}
                        >
                          Configure
                        </Button>
                      </Box>
                    </Box>
                  </Box>

                  {/* ────────────────────────────────────────────────────
                      BACK FACE (FLIPPED CONFIGURATION VIEW)
                     ──────────────────────────────────────────────────── */}
                  <Box
                    sx={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateX(180deg)',
                      position: isFlipped ? 'relative' : 'absolute',
                      width: '100%',
                      top: 0,
                      borderRadius: '20px',
                      border: `1.5px solid ${alpha(color, 0.45)}`,
                      background: `linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.98) 100%)`,
                      backdropFilter: 'blur(20px)',
                      boxShadow: `0 16px 48px rgba(0,0,0,0.08)`,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Back Card Header */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        px: 3,
                        py: 2,
                        borderBottom: `1px solid rgba(0,0,0,0.06)`,
                        background: alpha(color, 0.05),
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '10px',
                          bgcolor: alpha(color, 0.15),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${alpha(color, 0.25)}`,
                        }}
                      >
                        <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color }}>{i + 1}</Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', flex: 1 }}>
                        {b.role}
                      </Typography>

                      {/* Expand to Modal Action Icon */}
                      <Tooltip title="Expand to Dedicated Full Modal">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModalBlock(b.id);
                          }}
                          sx={{
                            color: '#334155',
                            bgcolor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            '&:hover': { bgcolor: alpha(color, 0.12), color, borderColor: color },
                          }}
                        >
                          <OpenInNewIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>

                      {/* Done / Flip-back Check Icon */}
                      <Tooltip title="Done Configuring (Flip Back)">
                        <IconButton
                          size="small"
                          onClick={() => setFlippedBlockId(null)}
                          sx={{
                            bgcolor: color,
                            color: '#fff',
                            boxShadow: `0 4px 12px ${alpha(color, 0.35)}`,
                            '&:hover': { bgcolor: alpha(color, 0.9), transform: 'scale(1.05)' },
                          }}
                        >
                          <CheckIcon sx={{ fontSize: 18, fontWeight: 900 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* Back Card Form Content */}
                    <Box sx={{ p: 3 }}>
                      {/* ── BLOCK 1: IDENTITY FLIPPED ── */}
                      {b.id === 'identity' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <PremiumTextField
                              colorTheme={color}
                              label="First Name"
                              value={editFirstName}
                              onChange={(e) => setEditFirstName(e.target.value)}
                              fullWidth
                            />
                            <PremiumTextField
                              colorTheme={color}
                              label="Last Name"
                              value={editLastName}
                              onChange={(e) => setEditLastName(e.target.value)}
                              fullWidth
                            />
                          </Box>

                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            <PremiumAutocomplete
                              colorTheme={color}
                              label="Academic / Professional Prefix"
                              options={PREFIX_OPTIONS}
                              value={editPrefix}
                              onChange={(_, val) => setEditPrefix(val || '')}
                              placeholder="e.g. Dr., Engr."
                            />
                            <PremiumAutocomplete
                              colorTheme={color}
                              label="Honors / Suffix"
                              options={SUFFIX_OPTIONS}
                              value={editSuffix}
                              onChange={(_, val) => setEditSuffix(val || '')}
                              placeholder="e.g. PhD, CFA"
                            />
                          </Box>

                          <PremiumAutocomplete
                            colorTheme={color}
                            label="Industry Specialization / Sector"
                            options={SPECIALIZATION_OPTIONS}
                            value={editSpecialization}
                            onChange={(_, val) => setEditSpecialization(val || '')}
                            placeholder="Select primary agricultural sector"
                          />

                          <PremiumTextField
                            colorTheme={color}
                            label="Avatar Image URL"
                            value={editAvatarUrl}
                            onChange={(e) => setEditAvatarUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            fullWidth
                          />

                          <PremiumMarkdownEditor
                            colorTheme={color}
                            label="Operator Bio & Mandate"
                            value={editBio}
                            onChange={(e) => setEditBio(e.target.value)}
                            placeholder="Describe your operational background, commodities handled, and mandates..."
                            minRows={3}
                          />

                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 1 }}>
                            <Button
                              variant="outlined"
                              onClick={() => setActiveModalBlock('identity')}
                              startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                              sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', color: '#475569', borderColor: '#cbd5e1' }}
                            >
                              Expand Modal
                            </Button>
                            <Button
                              variant="contained"
                              onClick={handleSaveIdentity}
                              sx={{ bgcolor: color, borderRadius: '10px', fontWeight: 800, textTransform: 'none', px: 3, '&:hover': { bgcolor: alpha(color, 0.9) } }}
                            >
                              Save & Flip Back
                            </Button>
                          </Box>
                        </Box>
                      )}

                      {/* ── BLOCK 2: WALLET FLIPPED ── */}
                      {b.id === 'wallet' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1.5 }}>
                            {walletItems.map((item) => (
                              <Box key={item.label} sx={{ p: 1.8, borderRadius: '14px', bgcolor: '#f8fafc', border: `1px solid ${alpha(item.color, 0.2)}` }}>
                                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                                  {item.label}
                                </Typography>
                                <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: item.color, mt: 0.2 }}>
                                  {item.amount.toLocaleString()}
                                </Typography>
                              </Box>
                            ))}
                          </Box>

                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {['5000', '20000', '50000', '100000'].map((amt) => (
                              <Chip
                                key={amt}
                                label={`₦${parseInt(amt).toLocaleString()}`}
                                onClick={() => setDepositAmount(amt)}
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '0.82rem',
                                  cursor: 'pointer',
                                  bgcolor: depositAmount === amt ? color : '#f1f5f9',
                                  color: depositAmount === amt ? '#ffffff' : '#0f172a',
                                }}
                              />
                            ))}
                          </Box>

                          <PremiumTextField
                            colorTheme={color}
                            label="Custom Deposit Amount (NGN)"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            fullWidth
                          />

                          <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <Button
                              variant="contained"
                              fullWidth
                              startIcon={<PaymentsIcon />}
                              onClick={() => {
                                setToastMsg(`Checkout for ₦${parseInt(depositAmount || '0').toLocaleString()} initialized via Paystack.`);
                                setFlippedBlockId(null);
                              }}
                              sx={{ bgcolor: color, borderRadius: '12px', py: 1.2, fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: alpha(color, 0.9) } }}
                            >
                              Deposit ₦{parseInt(depositAmount || '0').toLocaleString()}
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={() => setActiveModalBlock('wallet')}
                              startIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
                              sx={{ borderRadius: '12px', fontWeight: 800, textTransform: 'none', borderColor: '#cbd5e1', color: '#0f172a', flexShrink: 0 }}
                            >
                              Expand Treasury
                            </Button>
                          </Box>
                        </Box>
                      )}

                      {/* ── BLOCK 3: QUESTS FLIPPED ── */}
                      {b.id === 'quests' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ p: 2, borderRadius: '14px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                              <Typography sx={{ color, fontWeight: 800, fontSize: '0.85rem' }}>
                                Rank {rank} · {RANK_NAMES[rank]}
                              </Typography>
                              <Typography sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>
                                {lifetimeNP.toLocaleString()} / {nextThreshold.toLocaleString()} NP ({Math.round(progress)}%)
                              </Typography>
                            </Stack>
                            <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: color } }} />
                          </Box>

                          <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                              <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                                Next: {nextQuest.title}
                              </Typography>
                              <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                                Reward: {nextQuest.xp}
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => router.push(nextQuest.route)}
                              sx={{ bgcolor: color, borderRadius: '8px', fontWeight: 800, textTransform: 'none' }}
                            >
                              Execute
                            </Button>
                          </Box>

                          <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => setActiveModalBlock('quests')}
                            startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                            sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', color: '#0f172a', borderColor: '#cbd5e1' }}
                          >
                            Expand Full Quest Tree Modal
                          </Button>
                        </Box>
                      )}

                      {/* ── BLOCK 4: CREDENTIALS FLIPPED ── */}
                      {b.id === 'credentials' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Typography sx={{ fontSize: '0.85rem', color: '#475569' }}>
                            Download executive credentials for pitch decks, LinkedIn accreditation, and field access:
                          </Typography>
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                            <Button
                              variant="contained"
                              startIcon={<DownloadIcon />}
                              onClick={() => setActiveModalBlock('credentials')}
                              sx={{ bgcolor: '#0f172a', borderRadius: '12px', py: 1.2, fontWeight: 800, textTransform: 'none' }}
                            >
                              Announcement Pass
                            </Button>
                            <Button
                              variant="contained"
                              startIcon={<DownloadIcon />}
                              onClick={() => setActiveModalBlock('credentials')}
                              sx={{ bgcolor: color, borderRadius: '12px', py: 1.2, fontWeight: 800, textTransform: 'none' }}
                            >
                              Membership ID Pass
                            </Button>
                          </Box>
                          <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => setActiveModalBlock('credentials')}
                            startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                            sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', color: '#0f172a', borderColor: '#cbd5e1' }}
                          >
                            Expand Live ID Card Designer Modal
                          </Button>
                        </Box>
                      )}

                      {/* ── BLOCK 5: WORKSPACES FLIPPED ── */}
                      {b.id === 'workspaces' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          <Box
                            onClick={() => {
                              switchOrg(null);
                              setToastMsg('Switched context to Individual Operator.');
                              setFlippedBlockId(null);
                            }}
                            sx={{
                              p: 1.5,
                              borderRadius: '12px',
                              cursor: 'pointer',
                              bgcolor: !activeOrg ? '#0f172a' : '#f8fafc',
                              color: !activeOrg ? '#ffffff' : '#0f172a',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                            }}
                          >
                            <Avatar sx={{ width: 32, height: 32, bgcolor: !activeOrg ? 'rgba(255,255,255,0.15)' : '#e2e8f0', color: !activeOrg ? '#ffffff' : '#475569' }}>
                              <PersonIcon sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography sx={{ fontWeight: 800, fontSize: '0.86rem' }}>Myself (Individual)</Typography>
                              <Typography sx={{ fontSize: '0.7rem', opacity: 0.7 }}>Personal Identity</Typography>
                            </Box>
                            {!activeOrg && <Chip label="ACTIVE" size="small" sx={{ bgcolor: '#10b981', color: '#fff', height: 18, fontSize: '0.6rem', fontWeight: 900 }} />}
                          </Box>

                          {profile.organizations?.map((org) => {
                            const isSelected = activeOrg?.id === org.id;
                            return (
                              <Box
                                key={org.id}
                                onClick={() => {
                                  switchOrg(org.id);
                                  setToastMsg(`Switched context to ${org.name}.`);
                                  setFlippedBlockId(null);
                                }}
                                sx={{
                                  p: 1.5,
                                  borderRadius: '12px',
                                  cursor: 'pointer',
                                  bgcolor: isSelected ? '#0f172a' : '#f8fafc',
                                  color: isSelected ? '#ffffff' : '#0f172a',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1.5,
                                }}
                              >
                                <Avatar src={org.logoUrl} sx={{ width: 32, height: 32, bgcolor: isSelected ? 'rgba(255,255,255,0.15)' : '#e2e8f0', color: isSelected ? '#ffffff' : '#0f172a', fontWeight: 800, fontSize: '0.8rem' }}>
                                  {org.name.charAt(0)}
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography sx={{ fontWeight: 800, fontSize: '0.86rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{org.name}</Typography>
                                  <Typography sx={{ fontSize: '0.7rem', opacity: 0.7 }}>{org.role}</Typography>
                                </Box>
                                {isSelected && <Chip label="ACTIVE" size="small" sx={{ bgcolor: '#10b981', color: '#fff', height: 18, fontSize: '0.6rem', fontWeight: 900 }} />}
                              </Box>
                            );
                          })}

                          <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => setActiveModalBlock('workspaces')}
                            startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                            sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', color: '#0f172a', borderColor: '#cbd5e1' }}
                          >
                            Expand Workspace Clearances Modal
                          </Button>
                        </Box>
                      )}

                      {/* ── BLOCK 6: WIKI FLIPPED ── */}
                      {b.id === 'wiki' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          <Typography sx={{ fontSize: '0.84rem', color: '#475569' }}>
                            Top Standard Operating Procedures for your clearance level:
                          </Typography>
                          {wikiDocs.slice(0, 3).map((doc) => (
                            <Box
                              key={doc.id}
                              onClick={() => router.push(`/profile/wiki/${doc.slug}`)}
                              sx={{
                                p: 1.5,
                                borderRadius: '12px',
                                bgcolor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: '#f1f5f9' },
                              }}
                            >
                              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{doc.title}</Typography>
                              <Chip label={doc.category || 'SOP'} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800 }} />
                            </Box>
                          ))}
                          <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => setActiveModalBlock('wiki')}
                            startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                            sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', color: '#0f172a', borderColor: '#cbd5e1' }}
                          >
                            Expand Complete SOP Index Modal
                          </Button>
                        </Box>
                      )}

                      {/* ── BLOCK 7: SECURITY FLIPPED ── */}
                      {b.id === 'security' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                          <PremiumSwitch
                            colorTheme={color}
                            checked={twoFactorEnabled}
                            onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                            label="Two-Factor Authentication (SMS OTP)"
                          />
                          <PremiumSwitch
                            colorTheme={color}
                            checked={publicDirectory}
                            onChange={(e) => setPublicDirectory(e.target.checked)}
                            label="Public Directory Visibility"
                          />

                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<LogoutIcon />}
                            onClick={handleSignOut}
                            sx={{ borderRadius: '12px', py: 1, fontWeight: 800, textTransform: 'none' }}
                          >
                            Sign Out of Session
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>

      </Container>

      {/* ════════════════════════════════════════════════════════════
          FULL BLOCK MODAL EXPANSIONS (ON-DEMAND INTERACTION)
         ════════════════════════════════════════════════════════════ */}

      {/* ── MODAL 1: IDENTITY & DOSSIER MODAL ── */}
      <Dialog
        open={activeModalBlock === 'identity'}
        onClose={() => setActiveModalBlock(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 3.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', px: 0, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PersonIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: '#0f172a' }}>
              Edit Operator Dossier (Full Modal)
            </Typography>
          </Box>
          <IconButton onClick={() => setActiveModalBlock(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 0, display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <PremiumTextField
              colorTheme="#3b82f6"
              label="First Name"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              fullWidth
            />
            <PremiumTextField
              colorTheme="#3b82f6"
              label="Last Name"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              fullWidth
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <PremiumAutocomplete
              colorTheme="#3b82f6"
              label="Prefix"
              options={PREFIX_OPTIONS}
              value={editPrefix}
              onChange={(_, val) => setEditPrefix(val || '')}
            />
            <PremiumAutocomplete
              colorTheme="#3b82f6"
              label="Suffix"
              options={SUFFIX_OPTIONS}
              value={editSuffix}
              onChange={(_, val) => setEditSuffix(val || '')}
            />
          </Box>

          <PremiumAutocomplete
            colorTheme="#3b82f6"
            label="Specialization / Primary Sector"
            options={SPECIALIZATION_OPTIONS}
            value={editSpecialization}
            onChange={(_, val) => setEditSpecialization(val || '')}
          />

          <PremiumTextField
            colorTheme="#3b82f6"
            label="Avatar Image URL"
            value={editAvatarUrl}
            onChange={(e) => setEditAvatarUrl(e.target.value)}
            fullWidth
          />

          <PremiumMarkdownEditor
            colorTheme="#3b82f6"
            label="Operator Bio & Mandate"
            value={editBio}
            onChange={(e) => setEditBio(e.target.value)}
            minRows={4}
          />
        </DialogContent>

        <DialogActions sx={{ px: 0, pt: 2 }}>
          <Button onClick={() => setActiveModalBlock(null)} sx={{ fontWeight: 700, color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveIdentity}
            sx={{ bgcolor: '#0f172a', borderRadius: '12px', fontWeight: 800, px: 3, '&:hover': { bgcolor: '#1e293b' } }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── MODAL 2: NERVE WALLET & TREASURY MODAL ── */}
      <Dialog
        open={activeModalBlock === 'wallet'}
        onClose={() => setActiveModalBlock(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 3.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', px: 0, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(124, 77, 255, 0.1)', color: '#7c4dff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: '#0f172a' }}>
              Nerve Wallet & Liquid Treasury
            </Typography>
          </Box>
          <IconButton onClick={() => setActiveModalBlock(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 0, display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {walletItems.map((item) => (
              <Box key={item.label} sx={{ p: 2, borderRadius: '14px', bgcolor: '#f8fafc', border: `1px solid ${alpha(item.color, 0.2)}` }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  {item.label}
                </Typography>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: item.color, mt: 0.3 }}>
                  {item.amount.toLocaleString()}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', mt: 0.2 }}>
                  {item.subtitle}
                </Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 1 }} />

          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
            Instant Wallet Top-Up (Paystack)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['5000', '20000', '50000', '100000'].map((amt) => (
              <Chip
                key={amt}
                label={`₦${parseInt(amt).toLocaleString()}`}
                onClick={() => setDepositAmount(amt)}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  bgcolor: depositAmount === amt ? '#7c4dff' : '#f1f5f9',
                  color: depositAmount === amt ? '#ffffff' : '#0f172a',
                }}
              />
            ))}
          </Box>
          <PremiumTextField
            colorTheme="#7c4dff"
            label="Custom Deposit Amount (NGN)"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            fullWidth
          />

          <Button
            variant="contained"
            fullWidth
            startIcon={<PaymentsIcon />}
            onClick={() => {
              setToastMsg(`Checkout for ₦${parseInt(depositAmount || '0').toLocaleString()} initialized via Paystack.`);
              setActiveModalBlock(null);
            }}
            sx={{ bgcolor: '#0f172a', borderRadius: '12px', py: 1.2, fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: '#1e293b' } }}
          >
            Deposit ₦{parseInt(depositAmount || '0').toLocaleString()} via Paystack
          </Button>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ p: 2, borderRadius: '14px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Request Bank Payout
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: '#0f172a', mt: 0.5 }}>
              Available: <strong>{(profile.wallet?.withdrawableNP || 0).toLocaleString()} NP</strong> (₦{(profile.wallet?.withdrawableNP || 0).toLocaleString()})
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AccountBalanceIcon />}
              onClick={() => {
                setToastMsg('Payout request dispatched to verified Nigerian bank account.');
                setActiveModalBlock(null);
              }}
              sx={{ mt: 1.5, borderRadius: '10px', fontWeight: 800, textTransform: 'none', borderColor: '#cbd5e1', color: '#0f172a' }}
            >
              Transfer Withdrawable NP
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* ── MODAL 3: GATEKEEPER QUESTS MODAL ── */}
      <Dialog
        open={activeModalBlock === 'quests'}
        onClose={() => setActiveModalBlock(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 3.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', px: 0, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmojiEventsIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: '#0f172a' }}>
              Gatekeeper Quests & Advancement
            </Typography>
          </Box>
          <IconButton onClick={() => setActiveModalBlock(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 0, display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Box sx={{ p: 2, borderRadius: '14px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', mb: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography sx={{ color: rankColor, fontWeight: 800, fontSize: '0.85rem' }}>
                Rank {rank} · {RANK_NAMES[rank]}
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>
                {lifetimeNP.toLocaleString()} / {nextThreshold.toLocaleString()} NP ({Math.round(progress)}%)
              </Typography>
            </Stack>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: rankColor } }} />
          </Box>

          <Stack spacing={1.5}>
            {quests.map((q) => {
              const qColor = RANK_COLORS[q.rank];
              return (
                <Box
                  key={q.title}
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    bgcolor: q.completed ? 'rgba(16, 185, 129, 0.04)' : '#f8fafc',
                    border: q.completed ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {q.completed ? (
                      <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
                    ) : q.locked ? (
                      <LockIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                    ) : (
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: qColor }} />
                    )}
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>{q.title}</Typography>
                        <Chip label={q.xp} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, bgcolor: alpha(qColor, 0.12), color: qColor }} />
                      </Box>
                      <Typography sx={{ fontSize: '0.76rem', color: '#64748b' }}>{q.description}</Typography>
                    </Box>
                  </Box>

                  {!q.completed && !q.locked && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        setActiveModalBlock(null);
                        router.push(q.route);
                      }}
                      sx={{ borderRadius: '8px', bgcolor: '#0f172a', fontWeight: 800, textTransform: 'none', fontSize: '0.72rem', px: 1.5 }}
                    >
                      Execute
                    </Button>
                  )}
                </Box>
              );
            })}
          </Stack>
        </DialogContent>
      </Dialog>

      {/* ── MODAL 4: EXECUTIVE IDENTITY CARDS MODAL ── */}
      <Dialog
        open={activeModalBlock === 'credentials'}
        onClose={() => setActiveModalBlock(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', bgcolor: '#f8fafc', p: { xs: 2, md: 4 } } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f172a' }}>
            Executive Identity Credentials
          </Typography>
          <IconButton onClick={() => setActiveModalBlock(null)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4 }}>
          {/* Card 1: Executive Announcement */}
          <Box>
            <Box ref={cardRef1} sx={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <ExecutiveCard cardTheme="#0f172a" cardStyle="announcement" {...execProps} />
            </Box>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => exportCard1('executive_announcement.png')}
              sx={{ mt: 3, py: 1.4, borderRadius: '14px', fontWeight: 800, borderColor: '#cbd5e1', color: '#0f172a' }}
            >
              Download Announcement PNG
            </Button>
          </Box>

          {/* Card 2: Membership ID */}
          <Box>
            <Box ref={cardRef2} sx={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <ExecutiveCard cardTheme="#10b981" cardStyle="membership" {...execProps} />
            </Box>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => exportCard2('executive_id.png')}
              sx={{ mt: 3, py: 1.4, borderRadius: '14px', fontWeight: 800, borderColor: '#cbd5e1', color: '#0f172a' }}
            >
              Download Official ID Card PNG
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* ── MODAL 5: CORPORATE WORKSPACES MODAL ── */}
      <Dialog
        open={activeModalBlock === 'workspaces'}
        onClose={() => setActiveModalBlock(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 3.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', px: 0, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BusinessIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: '#0f172a' }}>
              Corporate Workspaces & Clearances
            </Typography>
          </Box>
          <IconButton onClick={() => setActiveModalBlock(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 0, display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <Typography sx={{ fontSize: '0.84rem', color: '#64748b' }}>
            Switch operational persona to sign trade mandates or execute operations on behalf of an enterprise:
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box
              onClick={() => {
                switchOrg(null);
                setToastMsg('Switched context to Individual Operator.');
                setActiveModalBlock(null);
              }}
              sx={{
                p: 2,
                borderRadius: '14px',
                cursor: 'pointer',
                bgcolor: !activeOrg ? '#0f172a' : '#f8fafc',
                color: !activeOrg ? '#ffffff' : '#0f172a',
                border: `1.5px solid ${!activeOrg ? '#0f172a' : '#e2e8f0'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'all 0.15s',
                '&:hover': { transform: 'translateY(-1px)' },
              }}
            >
              <Avatar sx={{ width: 40, height: 40, bgcolor: !activeOrg ? 'rgba(255,255,255,0.15)' : '#e2e8f0', color: !activeOrg ? '#ffffff' : '#475569' }}>
                <PersonIcon />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.92rem' }}>Myself (Individual Operator)</Typography>
                <Typography sx={{ fontSize: '0.75rem', opacity: 0.7 }}>Personal Identity & Reputation XP</Typography>
              </Box>
              {!activeOrg && <Chip label="ACTIVE" size="small" sx={{ bgcolor: '#10b981', color: '#fff', fontWeight: 900, height: 20, fontSize: '0.65rem' }} />}
            </Box>

            {profile.organizations?.map((org) => {
              const isSelected = activeOrg?.id === org.id;
              return (
                <Box
                  key={org.id}
                  onClick={() => {
                    switchOrg(org.id);
                    setToastMsg(`Switched context to ${org.name}.`);
                    setActiveModalBlock(null);
                  }}
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    cursor: 'pointer',
                    bgcolor: isSelected ? '#0f172a' : '#f8fafc',
                    color: isSelected ? '#ffffff' : '#0f172a',
                    border: `1.5px solid ${isSelected ? '#0f172a' : '#e2e8f0'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'all 0.15s',
                    '&:hover': { transform: 'translateY(-1px)' },
                  }}
                >
                  <Avatar src={org.logoUrl} sx={{ width: 40, height: 40, bgcolor: isSelected ? 'rgba(255,255,255,0.15)' : '#e2e8f0', color: isSelected ? '#ffffff' : '#0f172a', fontWeight: 900 }}>
                    {org.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.92rem' }}>{org.name}</Typography>
                      {org.verified && <VerifiedIcon sx={{ color: '#10b981', fontSize: 16 }} />}
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', opacity: 0.7 }}>{org.role}</Typography>
                  </Box>
                  {isSelected && <Chip label="ACTIVE" size="small" sx={{ bgcolor: '#10b981', color: '#fff', fontWeight: 900, height: 20, fontSize: '0.65rem' }} />}
                </Box>
              );
            })}
          </Box>
        </DialogContent>
      </Dialog>

      {/* ── MODAL 6: KNOWLEDGE HUB & SOPS MODAL ── */}
      <Dialog
        open={activeModalBlock === 'wiki'}
        onClose={() => setActiveModalBlock(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 3.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', px: 0, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MenuBookIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: '#0f172a' }}>
              Operational SOPs & Playbooks Hub
            </Typography>
          </Box>
          <IconButton onClick={() => setActiveModalBlock(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 0, display: 'flex', flexDirection: 'column', gap: 1.5, pt: 2 }}>
          {wikiDocs.length === 0 ? (
            <Typography sx={{ color: '#64748b', fontSize: '0.88rem', fontStyle: 'italic', textAlign: 'center', py: 3 }}>
              No operational playbooks currently registered for your clearance level.
            </Typography>
          ) : (
            wikiDocs.map((doc) => (
              <Box
                key={doc.id}
                onClick={() => {
                  setActiveModalBlock(null);
                  router.push(`/profile/wiki/${doc.slug}`);
                }}
                sx={{
                  p: 2,
                  borderRadius: '14px',
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  '&:hover': { bgcolor: '#f1f5f9', transform: 'translateX(4px)' },
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{doc.title}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.2 }}>Category: {doc.category || 'General'}</Typography>
                </Box>
                <Chip label={doc.isPublic ? 'Public' : 'Restricted'} size="small" sx={{ height: 20, fontSize: '0.62rem', fontWeight: 800, bgcolor: doc.isPublic ? '#ecfdf5' : '#fef2f2', color: doc.isPublic ? '#059669' : '#ef4444' }} />
              </Box>
            ))
          )}
        </DialogContent>
      </Dialog>

      {/* ── MODAL 7: SECURITY & SESSION CONTROL MODAL ── */}
      <Dialog
        open={activeModalBlock === 'security'}
        onClose={() => setActiveModalBlock(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 3.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#0f172a', px: 0, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', color: '#0f172a' }}>
              Security & Session Control
            </Typography>
          </Box>
          <IconButton onClick={() => setActiveModalBlock(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 0, display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: '14px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <PremiumSwitch
              colorTheme="#ef4444"
              checked={twoFactorEnabled}
              onChange={(e) => setTwoFactorEnabled(e.target.checked)}
              label="Two-Factor Authentication (2FA SMS OTP)"
            />
          </Paper>

          <Paper elevation={0} sx={{ p: 2, borderRadius: '14px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <PremiumSwitch
              colorTheme="#ef4444"
              checked={publicDirectory}
              onChange={(e) => setPublicDirectory(e.target.checked)}
              label="Public Directory Visibility"
            />
          </Paper>

          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleSignOut}
            sx={{ borderRadius: '12px', py: 1.2, fontWeight: 800, textTransform: 'none', mt: 1 }}
          >
            Sign Out of Current Session
          </Button>
        </DialogContent>
      </Dialog>

      {/* SNACKBAR FEEDBACK */}
      <Snackbar open={!!toastMsg} autoHideDuration={4000} onClose={() => setToastMsg(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setToastMsg(null)} severity="success" sx={{ width: '100%', borderRadius: '12px', fontWeight: 700 }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
