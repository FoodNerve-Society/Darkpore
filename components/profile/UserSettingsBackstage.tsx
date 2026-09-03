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
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
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
  const [walletTab, setWalletTab] = useState<'deposit' | 'payout'>('deposit');
  const [mobileContextOpen, setMobileContextOpen] = useState(false);

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
      role: 'Profile & Bio',
      label: 'Profile',
      desc: 'Your name, title, profile photo, bio, and what you do.',
      color: '#3b82f6',
      icon: <PersonIcon sx={{ fontSize: 20 }} />,
    },
    {
      id: 'wallet',
      role: 'Wallet & Balance',
      label: 'Wallet',
      desc: 'Your money, Paystack deposits, and bank withdrawals.',
      color: '#7c4dff',
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 20 }} />,
    },
    {
      id: 'quests',
      role: 'Tasks & Level',
      label: 'Tasks',
      desc: 'Steps to verify your account and unlock higher limits.',
      color: '#f59e0b',
      icon: <EmojiEventsIcon sx={{ fontSize: 20 }} />,
    },
    {
      id: 'credentials',
      role: 'ID Cards & Passes',
      label: 'ID Cards',
      desc: 'Digital member passes and printable ID cards you can download.',
      color: '#10b981',
      icon: <BadgeIcon sx={{ fontSize: 20 }} />,
    },
    {
      id: 'workspaces',
      role: 'Companies & Teams',
      label: 'Companies',
      desc: 'Switch between your personal profile and your registered companies.',
      color: '#06b6d4',
      icon: <BusinessIcon sx={{ fontSize: 20 }} />,
    },
    {
      id: 'wiki',
      role: 'Guides & Rules',
      label: 'Guides',
      desc: 'Helpful manuals on food safety, crop storage, and trading.',
      color: '#6366f1',
      icon: <MenuBookIcon sx={{ fontSize: 20 }} />,
    },
    {
      id: 'security',
      role: 'Security & Login',
      label: 'Security',
      desc: 'SMS codes, profile privacy in search, and sign out.',
      color: '#ef4444',
      icon: <ShieldIcon sx={{ fontSize: 20 }} />,
    },
  ];

  const BLOCKS_CATALOG: {
    id: ProfileBlockId;
    number: number;
    title: string;
    shortTitle: string;
    subtitle: string;
    color: string;
    icon: React.ReactNode;
    whatFor: string;
    whyExists: string;
    statLabel: string;
    statValue: string;
  }[] = [
    {
      id: 'identity',
      number: 1,
      title: 'Profile & Bio',
      shortTitle: 'Profile',
      subtitle: 'Edit your name, photo, title, and bio',
      color: '#3b82f6',
      icon: <PersonIcon sx={{ fontSize: 18 }} />,
      whatFor: 'Add your basic details like your name, photo, title (Dr., Mr., Engr.), and a short bio about what you do.',
      whyExists: 'When you trade or partner with others, having a real, complete profile helps people trust you immediately.',
      statLabel: 'Account Status',
      statValue: `Rank ${rank} Member`,
    },
    {
      id: 'wallet',
      number: 2,
      title: 'Wallet & Balance',
      shortTitle: 'Wallet',
      subtitle: 'See your balance, add funds, or withdraw to your bank',
      color: '#7c4dff',
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 18 }} />,
      whatFor: 'Check how much money you have, add money using Paystack, or send money straight to your bank account.',
      whyExists: 'Keeps your money safe in escrow until orders are delivered, protecting both buyers and sellers from fraud.',
      statLabel: 'Ready to Withdraw',
      statValue: `₦${(profile.wallet?.withdrawableNP || 0).toLocaleString()}`,
    },
    {
      id: 'quests',
      number: 3,
      title: 'Tasks & Level',
      shortTitle: 'Tasks',
      subtitle: 'Complete quick tasks to raise your rank and unlock perks',
      color: '#f59e0b',
      icon: <EmojiEventsIcon sx={{ fontSize: 18 }} />,
      whatFor: 'See the checklist of things to do next — like verifying your phone, ID, or business.',
      whyExists: 'The more tasks you complete, the higher your trust level becomes, allowing you to make bigger trades.',
      statLabel: 'Task Progress',
      statValue: `${Math.round(progress)}% Complete`,
    },
    {
      id: 'credentials',
      number: 4,
      title: 'ID Cards & Passes',
      shortTitle: 'ID Cards',
      subtitle: 'Download digital passes and printable ID cards',
      color: '#10b981',
      icon: <BadgeIcon sx={{ fontSize: 18 }} />,
      whatFor: 'Preview and download your official member cards as clean image files to show on your phone or print out.',
      whyExists: 'Gives you an official pass to show at warehouses, farm gates, inspection checkpoints, and meetings.',
      statLabel: 'Download Format',
      statValue: 'Image (PNG)',
    },
    {
      id: 'workspaces',
      number: 5,
      title: 'Companies & Teams',
      shortTitle: 'Companies',
      subtitle: 'Switch between your personal account and your businesses',
      color: '#06b6d4',
      icon: <BusinessIcon sx={{ fontSize: 18 }} />,
      whatFor: 'Choose whether you want to act as yourself or on behalf of a company you registered.',
      whyExists: 'Allows you to keep business deals, payments, and team contracts separate from your personal profile.',
      statLabel: 'Current Account',
      statValue: activeOrg?.name || 'Personal Account',
    },
    {
      id: 'wiki',
      number: 6,
      title: 'Guides & Rules',
      shortTitle: 'Guides',
      subtitle: 'Clear manuals for food safety, shipping, and trading',
      color: '#6366f1',
      icon: <MenuBookIcon sx={{ fontSize: 18 }} />,
      whatFor: 'Read simple guides on how to properly handle food, store crops, prevent spoilage, and trade without issues.',
      whyExists: 'Following the same good standards stops goods from going bad and helps everyone trade smoothly.',
      statLabel: 'Available Guides',
      statValue: `${wikiDocs.length} Guides`,
    },
    {
      id: 'security',
      number: 7,
      title: 'Security & Login',
      shortTitle: 'Security',
      subtitle: 'Protect your account and control your privacy',
      color: '#ef4444',
      icon: <ShieldIcon sx={{ fontSize: 18 }} />,
      whatFor: 'Turn on SMS login codes, decide if your profile is searchable, and sign out when needed.',
      whyExists: 'Keeps your wallet and account safe from hackers so only you can access your funds.',
      statLabel: 'Device Status',
      statValue: 'Signed In & Safe',
    },
  ];

  const currentModalBlockMeta = BLOCKS_CATALOG.find((b) => b.id === activeModalBlock) || BLOCKS_CATALOG[0];

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
                Total Balance
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
                Points & Level
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
                Current Account
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: activeOrg ? '#3b82f6' : '#0f172a', mt: 0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeOrg ? activeOrg.name : 'Personal Account'}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* ─── 2. FLIPPABLE MODULAR BLOCKS (WITH BACK FACE MODAL EXPAND) ─── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ px: 0.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
              Account Settings & Tools
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#64748b', mt: 0.3 }}>
              Tap any card to see details or make changes. Click the expand icon to open full screen.
            </Typography>
          </Box>

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

                      {/* Expand to Modal Action Icon (Two arrow heads diagonal opposite) */}
                      <Tooltip title="Open Full Screen">
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
                          <OpenInFullIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>

                      {/* Done / Flip-back Check Icon */}
                      <Tooltip title="Done (Flip Back)">
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
                              label="Title (Dr., Mr., Chief)"
                              options={PREFIX_OPTIONS}
                              value={editPrefix}
                              onChange={(_, val) => setEditPrefix(val || '')}
                              placeholder="Select or type title"
                            />
                            <PremiumAutocomplete
                              colorTheme={color}
                              label="Letters / Degrees (PhD, MBA)"
                              options={SUFFIX_OPTIONS}
                              value={editSuffix}
                              onChange={(_, val) => setEditSuffix(val || '')}
                              placeholder="Select or type suffix"
                            />
                          </Box>

                          <PremiumAutocomplete
                            colorTheme={color}
                            label="What is your main specialty?"
                            options={SPECIALIZATION_OPTIONS}
                            value={editSpecialization}
                            onChange={(_, val) => setEditSpecialization(val || '')}
                            placeholder="Select your specialty"
                          />

                          <PremiumTextField
                            colorTheme={color}
                            label="Profile Photo URL"
                            value={editAvatarUrl}
                            onChange={(e) => setEditAvatarUrl(e.target.value)}
                            placeholder="Paste a photo link..."
                            fullWidth
                          />

                          <PremiumMarkdownEditor
                            colorTheme={color}
                            label="About You (Bio)"
                            value={editBio}
                            onChange={(e) => setEditBio(e.target.value)}
                            placeholder="Tell others what you do, what you buy or sell, and where you work..."
                            minRows={3}
                          />

                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                            <Button
                              variant="contained"
                              onClick={handleSaveIdentity}
                              sx={{ bgcolor: color, borderRadius: '10px', fontWeight: 800, textTransform: 'none', px: 3, '&:hover': { bgcolor: alpha(color, 0.9) } }}
                            >
                              Save Profile
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
                            label="Enter Amount (NGN)"
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
                              setFlippedBlockId(null);
                            }}
                            sx={{ bgcolor: color, borderRadius: '12px', py: 1.2, fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: alpha(color, 0.9) } }}
                          >
                            Add ₦{parseInt(depositAmount || '0').toLocaleString()} with Paystack
                          </Button>
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
                              Do Task
                            </Button>
                          </Box>
                        </Box>
                      )}

                      {/* ── BLOCK 4: CREDENTIALS FLIPPED ── */}
                      {b.id === 'credentials' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Typography sx={{ fontSize: '0.85rem', color: '#475569' }}>
                            Download your official member passes to keep on your phone or print:
                          </Typography>
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                            <Button
                              variant="contained"
                              startIcon={<DownloadIcon />}
                              onClick={() => setActiveModalBlock('credentials')}
                              sx={{ bgcolor: '#0f172a', borderRadius: '12px', py: 1.2, fontWeight: 800, textTransform: 'none' }}
                            >
                              Download Member Pass
                            </Button>
                            <Button
                              variant="contained"
                              startIcon={<DownloadIcon />}
                              onClick={() => setActiveModalBlock('credentials')}
                              sx={{ bgcolor: color, borderRadius: '12px', py: 1.2, fontWeight: 800, textTransform: 'none' }}
                            >
                              Download Photo ID
                            </Button>
                          </Box>
                        </Box>
                      )}

                      {/* ── BLOCK 5: WORKSPACES FLIPPED ── */}
                      {b.id === 'workspaces' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          <Box
                            onClick={() => {
                              switchOrg(null);
                              setToastMsg('Switched context to Personal Account.');
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
                              <Typography sx={{ fontWeight: 800, fontSize: '0.86rem' }}>Personal Account (Myself)</Typography>
                              <Typography sx={{ fontSize: '0.7rem', opacity: 0.7 }}>Your own profile</Typography>
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
                        </Box>
                      )}

                      {/* ── BLOCK 6: WIKI FLIPPED ── */}
                      {b.id === 'wiki' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          <Typography sx={{ fontSize: '0.84rem', color: '#475569' }}>
                            Helpful guides and manuals for your account:
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
                              <Chip label={doc.category || 'Guide'} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800 }} />
                            </Box>
                          ))}
                        </Box>
                      )}

                      {/* ── BLOCK 7: SECURITY FLIPPED ── */}
                      {b.id === 'security' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                          <PremiumSwitch
                            colorTheme={color}
                            checked={twoFactorEnabled}
                            onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                            label="SMS Login Codes (2FA)"
                          />
                          <PremiumSwitch
                            colorTheme={color}
                            checked={publicDirectory}
                            onChange={(e) => setPublicDirectory(e.target.checked)}
                            label="Show Profile in Search"
                          />

                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<LogoutIcon />}
                            onClick={handleSignOut}
                            sx={{ borderRadius: '12px', py: 1, fontWeight: 800, textTransform: 'none' }}
                          >
                            Sign Out
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
          MASTER REBUILT BLOCK MODAL (UNIFIED, ERGONOMIC & INTUITIVE)
         ════════════════════════════════════════════════════════════ */}
      <Dialog
        open={Boolean(activeModalBlock)}
        onClose={() => setActiveModalBlock(null)}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: { xs: '98vw', sm: '94vw', md: '1120px' },
            maxWidth: '1160px',
            height: { xs: '94vh', sm: '90vh', md: '780px' },
            maxHeight: { xs: '94vh', md: '780px' },
            borderRadius: { xs: '20px', sm: '24px' },
            p: 0,
            m: { xs: 0.5, sm: 2 },
            overflow: 'hidden',
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 30px 90px -20px rgba(0, 0, 0, 0.45)',
          },
        }}
      >
        {/* ── UNIFIED INNER CONTAINER (Isolates from MuiDialog-paper CSS) ── */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* ── DESKTOP & TABLET FIXED SIDEBAR (Docked Left, Permanent on md+) ── */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              width: '280px',
              flexShrink: 0,
              bgcolor: '#f8fafc',
              borderRight: '1px solid #e2e8f0',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 2.5,
              gap: 2,
              overflowY: 'auto',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Header / Console Identity */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1.5, borderBottom: '1px solid #e2e8f0' }}>
                <Avatar
                  src={editAvatarUrl || profile.avatarUrl}
                  sx={{ width: 40, height: 40, bgcolor: '#0f172a', color: '#ffffff', fontWeight: 900, border: `2px solid ${rankColor}` }}
                >
                  {profile.firstName?.[0] || 'O'}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography noWrap sx={{ fontWeight: 900, fontSize: '0.92rem', color: '#0f172a' }}>
                    {[profile.prefixes?.[0], profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Operator'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Chip
                      label={`Rank ${rank}`}
                      size="small"
                      sx={{ height: 18, fontSize: '0.65rem', fontWeight: 900, bgcolor: alpha(rankColor, 0.15), color: rankColor }}
                    />
                    <Typography noWrap sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Account Settings
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Block Switcher Tabs (All 7 Blocks) */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', px: 1 }}>
                  Sections
                </Typography>
                {BLOCKS_CATALOG.map((b) => {
                  const isActive = b.id === activeModalBlock;
                  return (
                    <Box
                      key={b.id}
                      onClick={() => setActiveModalBlock(b.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.25,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        bgcolor: isActive ? alpha(b.color, 0.1) : 'transparent',
                        border: `1.5px solid ${isActive ? b.color : 'transparent'}`,
                        color: isActive ? '#0f172a' : '#475569',
                        '&:hover': {
                          bgcolor: isActive ? alpha(b.color, 0.14) : '#f1f5f9',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: isActive ? b.color : alpha(b.color, 0.15),
                          color: isActive ? '#ffffff' : b.color,
                          flexShrink: 0,
                        }}
                      >
                        {b.icon}
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontSize: '0.84rem', fontWeight: isActive ? 900 : 700, lineHeight: 1.2 }}>
                          {b.shortTitle}
                        </Typography>
                        <Typography noWrap sx={{ fontSize: '0.7rem', color: isActive ? '#64748b' : '#94a3b8' }}>
                          Part {b.number}
                        </Typography>
                      </Box>
                      {isActive && (
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: b.color }} />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Docked Context Card ("What this is for & Why it exists") */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: alpha(currentModalBlockMeta.color, 0.05),
                border: `1px solid ${alpha(currentModalBlockMeta.color, 0.2)}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: currentModalBlockMeta.color }} />
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, color: currentModalBlockMeta.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  About This Section
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  What this is for:
                </Typography>
                <Typography sx={{ fontSize: '0.76rem', color: '#1e293b', lineHeight: 1.4, mt: 0.2 }}>
                  {currentModalBlockMeta.whatFor}
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  Why it exists:
                </Typography>
                <Typography sx={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.4, mt: 0.2 }}>
                  {currentModalBlockMeta.whyExists}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: `1px solid ${alpha(currentModalBlockMeta.color, 0.15)}` }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>{currentModalBlockMeta.statLabel}:</Typography>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, color: currentModalBlockMeta.color }}>{currentModalBlockMeta.statValue}</Typography>
              </Box>
            </Paper>
          </Box>

          {/* ── MOBILE HEADER BAR (xs-sm < 900px, Docked at Top) ── */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              flexDirection: 'column',
              flexShrink: 0,
              bgcolor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            {/* Top row: Title + Close button */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '10px', bgcolor: alpha(currentModalBlockMeta.color, 0.15), color: currentModalBlockMeta.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {currentModalBlockMeta.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.98rem', color: '#0f172a', lineHeight: 1.2 }}>
                    {currentModalBlockMeta.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: '#64748b' }}>
                    Part {currentModalBlockMeta.number} of 7
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setActiveModalBlock(null)} size="small" sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', width: 34, height: 34 }}>
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            {/* Horizontal scrollable tab pills */}
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', px: 2, pb: 1.2, '::-webkit-scrollbar': { display: 'none' } }}>
              {BLOCKS_CATALOG.map((b) => {
                const isActive = b.id === activeModalBlock;
                return (
                  <Chip
                    key={b.id}
                    label={`${b.number}. ${b.shortTitle}`}
                    onClick={() => setActiveModalBlock(b.id)}
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      bgcolor: isActive ? b.color : '#ffffff',
                      color: isActive ? '#ffffff' : '#475569',
                      border: `1.5px solid ${isActive ? b.color : '#e2e8f0'}`,
                      flexShrink: 0,
                      height: 28,
                    }}
                  />
                );
              })}
            </Box>

            {/* Collapsible Info Bar ("What & Why") on Mobile */}
            <Box sx={{ px: 2, pb: 1 }}>
              <Button
                size="small"
                onClick={() => setMobileContextOpen(!mobileContextOpen)}
                sx={{ fontSize: '0.72rem', fontWeight: 800, color: currentModalBlockMeta.color, textTransform: 'none', p: 0 }}
              >
                {mobileContextOpen ? '▲ Hide Purpose' : 'ℹ️ What is this section for?'}
              </Button>
              {mobileContextOpen && (
                <Box sx={{ mt: 1, p: 1.5, borderRadius: '12px', bgcolor: alpha(currentModalBlockMeta.color, 0.06), border: `1px solid ${alpha(currentModalBlockMeta.color, 0.2)}` }}>
                  <Typography sx={{ fontSize: '0.74rem', color: '#1e293b', mb: 0.5 }}>
                    <strong>What this is for:</strong> {currentModalBlockMeta.whatFor}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#475569' }}>
                    <strong>Why it exists:</strong> {currentModalBlockMeta.whyExists}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* ── MAIN INTERACTIVE CANVAS (Right side on Desktop, full width on Mobile) ── */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              height: { xs: 'auto', md: '100%' },
              overflow: 'hidden',
              bgcolor: '#ffffff',
            }}
          >
            {/* Canvas Desktop Header (Hidden on Mobile) */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 3.5,
                py: 2,
                borderBottom: '1px solid #f1f5f9',
                flexShrink: 0,
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: '#0f172a' }}>
                  {currentModalBlockMeta.title}
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {currentModalBlockMeta.subtitle}
                </Typography>
              </Box>
              <IconButton onClick={() => setActiveModalBlock(null)} size="small" sx={{ bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            {/* Canvas Scrollable Content (Takes 100% of remaining height on both desktop & mobile) */}
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                p: { xs: 2, sm: 2.5, md: 3.5 },
                WebkitOverflowScrolling: 'touch',
              }}
            >
            {/* ── BLOCK 1: IDENTITY ── */}
            {activeModalBlock === 'identity' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '280px 1fr' }, gap: 3.5 }}>
                {/* Left Column: Dossier Avatar Preview */}
                <Box sx={{ p: 3, borderRadius: '20px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2 }}>
                  <Avatar
                    src={editAvatarUrl || profile.avatarUrl}
                    sx={{
                      width: 100,
                      height: 100,
                      fontSize: '2.5rem',
                      fontWeight: 800,
                      bgcolor: '#0f172a',
                      color: '#ffffff',
                      border: `3px solid ${rankColor}`,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    }}
                  >
                    {editFirstName?.[0] || 'U'}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#0f172a' }}>
                      {[editPrefix, editFirstName, editLastName, editSuffix].filter(Boolean).join(' ') || 'Operator'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#64748b', mt: 0.3 }}>
                      {editSpecialization || 'Sector Not Set'}
                    </Typography>
                  </Box>
                  <Chip
                    label={`Rank ${rank} · ${RANK_NAMES[rank]}`}
                    size="small"
                    sx={{ bgcolor: alpha(rankColor, 0.12), color: rankColor, fontWeight: 900, fontSize: '0.75rem', px: 1 }}
                  />
                  <Box sx={{ width: '100%', mt: 'auto' }}>
                    <PremiumTextField
                      colorTheme="#3b82f6"
                      label="Profile Photo URL"
                      value={editAvatarUrl}
                      onChange={(e) => setEditAvatarUrl(e.target.value)}
                      fullWidth
                      size="small"
                      placeholder="Paste image link..."
                    />
                  </Box>
                </Box>

                {/* Right Column: Detailed Form */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
                      label="Title (Dr., Mr., Chief)"
                      options={PREFIX_OPTIONS}
                      value={editPrefix}
                      onChange={(_, val) => setEditPrefix(val || '')}
                      placeholder="Select or type title"
                    />
                    <PremiumAutocomplete
                      colorTheme="#3b82f6"
                      label="Letters / Degrees (PhD, MBA)"
                      options={SUFFIX_OPTIONS}
                      value={editSuffix}
                      onChange={(_, val) => setEditSuffix(val || '')}
                      placeholder="Select or type suffix"
                    />
                  </Box>

                  <PremiumAutocomplete
                    colorTheme="#3b82f6"
                    label="What is your main specialty?"
                    options={SPECIALIZATION_OPTIONS}
                    value={editSpecialization}
                    onChange={(_, val) => setEditSpecialization(val || '')}
                    placeholder="Select your specialty"
                  />

                  <PremiumMarkdownEditor
                    colorTheme="#3b82f6"
                    label="About You (Bio)"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    minRows={5}
                    placeholder="Tell others what you do, what you buy or sell, and where you work..."
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
                    <Button
                      variant="contained"
                      onClick={handleSaveIdentity}
                      sx={{ bgcolor: '#0f172a', borderRadius: '12px', fontWeight: 800, px: 4, py: 1.2, textTransform: 'none', '&:hover': { bgcolor: '#1e293b' } }}
                    >
                      Save Profile Changes
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}

            {/* ── BLOCK 2: NERVE WALLET & TREASURY ── */}
            {activeModalBlock === 'wallet' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* 4 Tiers Row */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                  {walletItems.map((item) => (
                    <Box key={item.label} sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#f8fafc', border: `1px solid ${alpha(item.color, 0.2)}` }}>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontSize: '1.45rem', fontWeight: 900, color: item.color, mt: 0.5 }}>
                        {item.amount.toLocaleString()}
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', mt: 0.3 }}>
                        {item.subtitle}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Tab Switcher: Deposit vs Payout */}
                <Box sx={{ display: 'flex', gap: 1, borderBottom: '1px solid #e2e8f0', pb: 1 }}>
                  <Button
                    onClick={() => setWalletTab('deposit')}
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      textTransform: 'none',
                      color: walletTab === 'deposit' ? '#7c4dff' : '#64748b',
                      borderBottom: walletTab === 'deposit' ? '2.5px solid #7c4dff' : 'none',
                      borderRadius: 0,
                      pb: 1,
                    }}
                  >
                    💳 Add Money (Paystack)
                  </Button>
                  <Button
                    onClick={() => setWalletTab('payout')}
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      textTransform: 'none',
                      color: walletTab === 'payout' ? '#10b981' : '#64748b',
                      borderBottom: walletTab === 'payout' ? '2.5px solid #10b981' : 'none',
                      borderRadius: 0,
                      pb: 1,
                    }}
                  >
                    🏦 Send to Bank Account
                  </Button>
                </Box>

                {walletTab === 'deposit' ? (
                  <Box sx={{ p: 3, borderRadius: '18px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#0f172a' }}>
                      Add Money to Your Wallet
                    </Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
                      Choose an amount or enter a custom amount to add funds using Paystack instant payment:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {['5000', '20000', '50000', '100000', '250000'].map((amt) => (
                        <Chip
                          key={amt}
                          label={`₦${parseInt(amt).toLocaleString()}`}
                          onClick={() => setDepositAmount(amt)}
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            bgcolor: depositAmount === amt ? '#7c4dff' : '#ffffff',
                            color: depositAmount === amt ? '#ffffff' : '#0f172a',
                            border: `1px solid ${depositAmount === amt ? '#7c4dff' : '#cbd5e1'}`,
                          }}
                        />
                      ))}
                    </Box>
                    <PremiumTextField
                      colorTheme="#7c4dff"
                      label="Amount to Add (NGN)"
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
                      sx={{ bgcolor: '#7c4dff', borderRadius: '12px', py: 1.4, fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: '#6938ef' }, mt: 1 }}
                    >
                      Add ₦{parseInt(depositAmount || '0').toLocaleString()} with Paystack
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ p: 3, borderRadius: '18px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#0f172a' }}>
                      Send Money to Your Bank Account
                    </Typography>
                    <Box sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                        Ready to Withdraw
                      </Typography>
                      <Typography sx={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', mt: 0.3 }}>
                        ₦{(profile.wallet?.withdrawableNP || 0).toLocaleString()}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {(profile.wallet?.withdrawableNP || 0).toLocaleString()} NP
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<AccountBalanceIcon />}
                      onClick={() => {
                        setToastMsg('Payout request dispatched to verified Nigerian bank account.');
                        setActiveModalBlock(null);
                      }}
                      sx={{ borderRadius: '12px', py: 1.3, fontWeight: 800, textTransform: 'none', borderColor: '#cbd5e1', color: '#0f172a' }}
                    >
                      Withdraw to Bank Account
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {/* ── BLOCK 3: GATEKEEPER QUESTS ── */}
            {activeModalBlock === 'quests' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Progress Overview Banner */}
                <Box sx={{ p: 3, borderRadius: '18px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Chip label={`Rank ${rank} · ${RANK_NAMES[rank]}`} sx={{ bgcolor: alpha(rankColor, 0.12), color: rankColor, fontWeight: 900, fontSize: '0.85rem' }} />
                      <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>Your Level Progress</Typography>
                    </Box>
                    <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>
                      {lifetimeNP.toLocaleString()} / {nextThreshold.toLocaleString()} Points ({Math.round(progress)}%)
                    </Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: rankColor } }} />
                </Box>

                {/* Quests 2-Column Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  {quests.map((q) => {
                    const qColor = RANK_COLORS[q.rank];
                    return (
                      <Box
                        key={q.title}
                        sx={{
                          p: 2.5,
                          borderRadius: '16px',
                          bgcolor: q.completed ? 'rgba(16, 185, 129, 0.04)' : '#ffffff',
                          border: q.completed ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid #e2e8f0',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: 2,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          {q.completed ? (
                            <CheckCircleIcon sx={{ color: '#10b981', fontSize: 24, mt: 0.3 }} />
                          ) : q.locked ? (
                            <LockIcon sx={{ color: '#94a3b8', fontSize: 22, mt: 0.3 }} />
                          ) : (
                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: qColor, mt: 0.8 }} />
                          )}
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                              <Typography sx={{ fontWeight: 900, fontSize: '0.95rem', color: '#0f172a' }}>{q.title}</Typography>
                              <Chip label={q.xp} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800, bgcolor: alpha(qColor, 0.12), color: qColor }} />
                            </Box>
                            <Typography sx={{ fontSize: '0.82rem', color: '#64748b', mt: 0.5 }}>{q.description}</Typography>
                          </Box>
                        </Box>

                        {!q.completed && !q.locked ? (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => {
                              setActiveModalBlock(null);
                              router.push(q.route);
                            }}
                            sx={{ borderRadius: '10px', bgcolor: '#0f172a', fontWeight: 800, textTransform: 'none', fontSize: '0.8rem', py: 0.8, alignSelf: 'flex-end', px: 2.5 }}
                          >
                            Do Task
                          </Button>
                        ) : q.completed ? (
                          <Chip label="DONE" size="small" sx={{ alignSelf: 'flex-end', bgcolor: '#ecfdf5', color: '#059669', fontWeight: 900, fontSize: '0.65rem' }} />
                        ) : (
                          <Chip label="LOCKED" size="small" sx={{ alignSelf: 'flex-end', bgcolor: '#f1f5f9', color: '#94a3b8', fontWeight: 800, fontSize: '0.65rem' }} />
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* ── BLOCK 4: CREDENTIALS ── */}
            {activeModalBlock === 'credentials' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4 }}>
                {/* Card 1: Executive Announcement */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#f8fafc', p: 3, borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                  <Box ref={cardRef1} sx={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                    <ExecutiveCard cardTheme="#0f172a" cardStyle="announcement" {...execProps} />
                  </Box>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => exportCard1('member_pass.png')}
                    sx={{ mt: 3, py: 1.4, borderRadius: '14px', fontWeight: 800, textTransform: 'none', borderColor: '#cbd5e1', color: '#0f172a' }}
                  >
                    Download Digital Pass (PNG)
                  </Button>
                </Box>

                {/* Card 2: Membership ID */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#f8fafc', p: 3, borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                  <Box ref={cardRef2} sx={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                    <ExecutiveCard cardTheme="#10b981" cardStyle="membership" {...execProps} />
                  </Box>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => exportCard2('photo_id_card.png')}
                    sx={{ mt: 3, py: 1.4, borderRadius: '14px', fontWeight: 800, textTransform: 'none', borderColor: '#cbd5e1', color: '#0f172a' }}
                  >
                    Download Photo ID Card (PNG)
                  </Button>
                </Box>
              </Box>
            )}

            {/* ── BLOCK 5: WORKSPACES ── */}
            {activeModalBlock === 'workspaces' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Typography sx={{ fontSize: '0.88rem', color: '#64748b' }}>
                  Choose which account you want to use for deals, orders, and contracts:
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  {/* Myself (Individual) */}
                  <Box
                    onClick={() => {
                      switchOrg(null);
                      setToastMsg('Switched context to Personal Account.');
                      setActiveModalBlock(null);
                    }}
                    sx={{
                      p: 2.5,
                      borderRadius: '16px',
                      cursor: 'pointer',
                      bgcolor: !activeOrg ? '#0f172a' : '#f8fafc',
                      color: !activeOrg ? '#ffffff' : '#0f172a',
                      border: `1.5px solid ${!activeOrg ? '#0f172a' : '#e2e8f0'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      transition: 'all 0.15s',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' },
                    }}
                  >
                    <Avatar sx={{ width: 48, height: 48, bgcolor: !activeOrg ? 'rgba(255,255,255,0.15)' : '#e2e8f0', color: !activeOrg ? '#ffffff' : '#475569' }}>
                      <PersonIcon sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 900, fontSize: '0.98rem' }}>Personal Account (Myself)</Typography>
                      <Typography sx={{ fontSize: '0.78rem', opacity: 0.7 }}>Your own individual profile and points</Typography>
                    </Box>
                    {!activeOrg && <Chip label="ACTIVE" size="small" sx={{ bgcolor: '#10b981', color: '#fff', fontWeight: 900, height: 22, fontSize: '0.68rem' }} />}
                  </Box>

                  {/* Organizations */}
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
                          p: 2.5,
                          borderRadius: '16px',
                          cursor: 'pointer',
                          bgcolor: isSelected ? '#0f172a' : '#f8fafc',
                          color: isSelected ? '#ffffff' : '#0f172a',
                          border: `1.5px solid ${isSelected ? '#0f172a' : '#e2e8f0'}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          transition: 'all 0.15s',
                          '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' },
                        }}
                      >
                        <Avatar src={org.logoUrl} sx={{ width: 48, height: 48, bgcolor: isSelected ? 'rgba(255,255,255,0.15)' : '#e2e8f0', color: isSelected ? '#ffffff' : '#0f172a', fontWeight: 900, fontSize: '1.2rem' }}>
                          {org.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontWeight: 900, fontSize: '0.98rem' }}>{org.name}</Typography>
                            {org.verified && <VerifiedIcon sx={{ color: '#10b981', fontSize: 18 }} />}
                          </Box>
                          <Typography sx={{ fontSize: '0.78rem', opacity: 0.7 }}>{org.role}</Typography>
                        </Box>
                        {isSelected && <Chip label="ACTIVE" size="small" sx={{ bgcolor: '#10b981', color: '#fff', fontWeight: 900, height: 22, fontSize: '0.68rem' }} />}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* ── BLOCK 6: SOPS & PLAYBOOKS ── */}
            {activeModalBlock === 'wiki' && (() => {
              const DEFAULT_GUIDES = [
                {
                  id: 'g-1',
                  title: 'Food Safety & Hygiene Standards',
                  category: 'Food Safety',
                  slug: 'food-safety-standards',
                  desc: 'Essential hygiene requirements for food handlers, cold storage, and transport.',
                  isPublic: true,
                },
                {
                  id: 'g-2',
                  title: 'Grain Storage & Moisture Control',
                  category: 'Crop Storage',
                  slug: 'grain-moisture-control',
                  desc: 'How to prevent post-harvest spoilage and weevil infestation in silos.',
                  isPublic: true,
                },
                {
                  id: 'g-3',
                  title: 'Escrow & Trade Settlement Rules',
                  category: 'Trading Rules',
                  slug: 'escrow-trade-rules',
                  desc: 'Understanding inspection sign-offs, Paystack escrow releases, and disputes.',
                  isPublic: true,
                },
              ];
              const displayDocs = wikiDocs.length > 0 ? wikiDocs : DEFAULT_GUIDES;

              return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Typography sx={{ fontSize: '0.88rem', color: '#64748b' }}>
                    Helpful guides and rules for food handling and trading:
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    {displayDocs.map((doc) => (
                      <Box
                        key={doc.id}
                        onClick={() => {
                          setActiveModalBlock(null);
                          router.push(`/profile/wiki/${doc.slug}`);
                        }}
                        sx={{
                          p: 2.5,
                          borderRadius: '16px',
                          bgcolor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          gap: 1.5,
                          transition: 'all 0.15s',
                          '&:hover': { bgcolor: '#f1f5f9', transform: 'translateY(-2px)', borderColor: '#6366f1', boxShadow: '0 6px 20px rgba(99, 102, 241, 0.08)' },
                        }}
                      >
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Typography sx={{ fontWeight: 900, fontSize: '0.98rem', color: '#0f172a' }}>{doc.title}</Typography>
                            <Chip label={doc.isPublic ? 'Public' : 'Restricted'} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: doc.isPublic ? '#ecfdf5' : '#fef2f2', color: doc.isPublic ? '#059669' : '#ef4444' }} />
                          </Box>
                          <Typography sx={{ fontSize: '0.78rem', color: '#64748b', mt: 0.5 }}>Category: {doc.category || 'Help Guide'}</Typography>
                          {doc.desc && (
                            <Typography sx={{ fontSize: '0.75rem', color: '#475569', mt: 0.5, lineHeight: 1.3 }}>{doc.desc}</Typography>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#6366f1' }}>Read Guide →</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              );
            })()}

            {/* ── BLOCK 7: SECURITY & SESSIONS ── */}
            {activeModalBlock === 'security' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                {/* Left Column: Security Settings */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#0f172a' }}>
                    Login & Privacy Settings
                  </Typography>

                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <PremiumSwitch
                      colorTheme="#ef4444"
                      checked={twoFactorEnabled}
                      onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                      label="SMS Login Codes (2FA)"
                    />
                    <Typography sx={{ fontSize: '0.76rem', color: '#64748b', mt: 0.5, pl: 0.5 }}>
                      Ask for an SMS code whenever withdrawing money or signing trade contracts.
                    </Typography>
                  </Paper>

                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <PremiumSwitch
                      colorTheme="#ef4444"
                      checked={publicDirectory}
                      onChange={(e) => setPublicDirectory(e.target.checked)}
                      label="Show Profile in Search"
                    />
                    <Typography sx={{ fontSize: '0.76rem', color: '#64748b', mt: 0.5, pl: 0.5 }}>
                      Let verified partners and buyers find your profile in search results.
                    </Typography>
                  </Paper>
                </Box>

                {/* Right Column: Active Session & Danger Zone */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#f8fafc', p: 3, borderRadius: '18px', border: '1px solid #e2e8f0' }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#0f172a' }}>
                    Your Current Device
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981' }} />
                    <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>Signed In & Safe</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
                    This device is verified and safely signed in to your account.
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ mt: 'auto' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', color: '#ef4444', mb: 1 }}>
                      Sign Out
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      startIcon={<LogoutIcon />}
                      onClick={handleSignOut}
                      sx={{ borderRadius: '12px', py: 1.3, fontWeight: 800, textTransform: 'none' }}
                    >
                      Sign Out of This Device
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
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
