// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Collapse,
  alpha,
  Paper,
  TextField,
  Chip,
  Avatar,
  Divider,
  LinearProgress,
  Switch,
  Snackbar,
  Alert,
  IconButton,
  Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BadgeIcon from '@mui/icons-material/Badge';
import ShieldIcon from '@mui/icons-material/Shield';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DownloadIcon from '@mui/icons-material/Download';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import { useRouter, useParams } from 'next/navigation';
import { useSociety, RANK_NAMES, RANK_COLORS, calculateRank, type RankLevel } from '@/context/SocietyContext';
import ExecutiveCard from '@/app/modular-society/[tenant]/(authenticated)/components/ExecutiveCard';
import useExportAsImage from '@/hooks/useExportAsImage';
import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';

interface ActionBlockProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function ActionBlock({ id, icon, title, subtitle, color, isExpanded, onToggle, children }: ActionBlockProps) {
  return (
    <Box sx={{ mb: 2 }}>
      <Box
        onClick={onToggle}
        sx={{
          p: 2.5,
          bgcolor: isExpanded ? alpha(color, 0.05) : '#fff',
          borderRadius: isExpanded ? '20px 20px 0 0' : '20px',
          border: `1px solid ${isExpanded ? alpha(color, 0.3) : 'rgba(0,0,0,0.08)'}`,
          borderBottom: isExpanded ? 'none' : undefined,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: isExpanded ? 'none' : '0 4px 12px rgba(0,0,0,0.02)',
          '&:hover': {
            bgcolor: isExpanded ? alpha(color, 0.05) : alpha(color, 0.02),
          },
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '14px',
            bgcolor: alpha(color, 0.1),
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '& svg': { fontSize: 24 },
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{title}</Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>{subtitle}</Typography>
        </Box>
      </Box>

      <Collapse in={isExpanded}>
        <Box
          sx={{
            p: 3,
            bgcolor: '#fff',
            borderRadius: '0 0 20px 20px',
            border: `1px solid ${alpha(color, 0.3)}`,
            borderTop: 'none',
            boxShadow: `0 8px 24px ${alpha(color, 0.08)}`,
          }}
        >
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}

interface Props {
  onClose?: () => void;
  initialBlockId?: string | null;
}

export default function EditProfileBackstage({ onClose, initialBlockId }: Props) {
  const { profile } = useSociety();
  const router = useRouter();
  const params = useParams();
  const tenant = (params.tenant as string) || 'foodnerve';

  const [activeBlock, setActiveBlock] = useState<string | null>(initialBlockId || 'edit-profile');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Profile Edit State
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [specialization, setSpecialization] = useState(profile?.roles?.[0] || 'Operator');
  const [isSaving, setIsSaving] = useState(false);

  // Security Toggles
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [publicDirectory, setPublicDirectory] = useState(true);

  // ID Card Export Ref
  const cardRef = useRef<HTMLDivElement>(null);
  const { exportAsImage: exportExecutiveCard } = useExportAsImage(cardRef);

  useEffect(() => {
    if (initialBlockId) {
      setActiveBlock(initialBlockId);
    }
  }, [initialBlockId]);

  const toggleBlock = (id: string) => {
    setActiveBlock((prev) => (prev === id ? null : id));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Update local storage / state simulation
      setTimeout(() => {
        setIsSaving(false);
        setToastMsg('Profile changes saved successfully!');
      }, 600);
    } catch (e: any) {
      setIsSaving(false);
      setToastMsg('Failed to save profile changes.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = '/join';
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  const rank = profile ? calculateRank(profile) : 1;
  const rankColor = RANK_COLORS[rank] || '#9e9e9e';
  const totalNP = profile?.wallet?.lifetimeNP || 0;
  const rankThresholds: Record<RankLevel, number> = { 1: 0, 2: 500, 3: 2000, 4: 5000, 5: 10000 };
  const nextRank = Math.min(rank + 1, 5) as RankLevel;
  const currentThreshold = rankThresholds[rank];
  const nextThreshold = rankThresholds[nextRank];
  const progress = rank >= 5 ? 100 : Math.min(100, ((totalNP - currentThreshold) / (nextThreshold - currentThreshold)) * 100);

  const dpOrg = profile?.organizations?.find((o) => o.slug === 'darkpore');
  const fnOrg = profile?.organizations?.find((o) => o.slug === 'foodnerve');

  const execProps = {
    prefixes: profile?.prefixes || [],
    firstName: firstName || profile?.firstName || '',
    lastName: lastName || profile?.lastName || '',
    suffixes: profile?.suffixes || [],
    avatarUrl: avatarUrl || profile?.avatarUrl || '',
    darkpore: { active: !!dpOrg, role: dpOrg?.role, department: dpOrg?.department, logoUrl: dpOrg?.logoUrl },
    foodnerve: { active: !!fnOrg, role: fnOrg?.role, department: fnOrg?.department, logoUrl: fnOrg?.logoUrl },
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
      {/* HEADER */}
      <Box sx={{ p: { xs: 2, md: 4 }, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
          Action Center
        </Typography>
        {onClose && (
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onClose} sx={{ borderRadius: '12px', fontWeight: 700, borderColor: 'rgba(0,0,0,0.1)' }}>
            Back to Dashboard
          </Button>
        )}
      </Box>

      {/* BLOCKS CONTAINER */}
      <Box sx={{ p: { xs: 2, md: 4 }, flex: 1, overflowY: 'auto' }}>
        
        {/* 1. EDIT PROFILE BLOCK */}
        <ActionBlock
          id="edit-profile"
          icon={<EditIcon />}
          title="Edit Profile Details"
          subtitle="Update your name, bio, and personal operator credentials"
          color="#3b82f6"
          isExpanded={activeBlock === 'edit-profile'}
          onToggle={() => toggleBlock('edit-profile')}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                size="small"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                size="small"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Box>

            <TextField
              label="Avatar Image URL"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              size="small"
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <TextField
              label="Primary Sector / Specialization"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              size="small"
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <TextField
              label="Operator Bio & Value Chain Focus"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              multiline
              rows={4}
              fullWidth
              placeholder="Describe your agricultural logistics, trading, or agronomy experience..."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 1 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={isSaving}
                onClick={handleSaveProfile}
                sx={{
                  bgcolor: '#3b82f6',
                  borderRadius: '12px',
                  fontWeight: 800,
                  px: 3,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#2563eb' },
                }}
              >
                {isSaving ? 'Saving...' : 'Save Profile Changes'}
              </Button>
            </Box>
          </Box>
        </ActionBlock>

        {/* 2. NERVE WALLET BLOCK */}
        <ActionBlock
          id="wallet"
          icon={<AccountBalanceWalletIcon />}
          title="Nerve Wallet & Tokenomics"
          subtitle="Inspect your 4-tier token balances, escrow credits, and payouts"
          color="#7c4dff"
          isExpanded={activeBlock === 'wallet'}
          onToggle={() => toggleBlock('wallet')}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {/* 4-Tier Breakdown */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(124, 77, 255, 0.06)', border: '1px solid rgba(124, 77, 255, 0.2)' }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#7c4dff', textTransform: 'uppercase' }}>
                  Lifetime NP (Reputation XP)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', mt: 0.5 }}>
                  {profile?.wallet?.lifetimeNP?.toLocaleString() || 0} NP
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.5 }}>Permanent tier progression</Typography>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                  Withdrawable Balance
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', mt: 0.5 }}>
                  {profile?.wallet?.withdrawableNP?.toLocaleString() || 0} NP
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.5 }}>Eligible for fiat cashout</Typography>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase' }}>
                  Spendable Credits
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', mt: 0.5 }}>
                  {profile?.wallet?.spendableNP?.toLocaleString() || 0} NP
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.5 }}>Platform transactions & escrow</Typography>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>
                  Promo & Grant NP
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', mt: 0.5 }}>
                  {profile?.wallet?.promoNP?.toLocaleString() || 0} NP
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.5 }}>Ecosystem subsidised credits</Typography>
              </Paper>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={() => setToastMsg('Top-up checkout initialized via Paystack.')}
                sx={{ bgcolor: '#7c4dff', borderRadius: '12px', fontWeight: 800, textTransform: 'none', px: 3, '&:hover': { bgcolor: '#651fff' } }}
              >
                Deposit / Buy Spendable NP
              </Button>
              <Button
                variant="outlined"
                onClick={() => setToastMsg('Withdrawal payout request submitted for review.')}
                sx={{ borderRadius: '12px', fontWeight: 800, textTransform: 'none', borderColor: '#cbd5e1', color: '#0f172a' }}
              >
                Request Payout
              </Button>
            </Box>
          </Box>
        </ActionBlock>

        {/* 3. GATEKEEPER QUESTS BLOCK */}
        <ActionBlock
          id="quests"
          icon={<EmojiEventsIcon />}
          title="Gatekeeper Quests & Platform Rank"
          subtitle="Complete operational milestones to upgrade your governance rank"
          color="#10b981"
          isExpanded={activeBlock === 'quests'}
          onToggle={() => toggleBlock('quests')}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                  Rank {rank}: {RANK_NAMES[rank]}
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: rankColor }}>
                  {rank >= 5 ? 'MAX RANK' : `${Math.round(progress)}% to Rank ${nextRank}`}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: '#e2e8f0',
                  '& .MuiLinearProgress-bar': { bgcolor: rankColor, borderRadius: 3 },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                {
                  rank: 2,
                  title: 'Rank 2: Complete Profile Setup',
                  desc: 'Add avatar, bio, and value chain sectors.',
                  done: !!profile?.gatekeepers?.hasCompletedProfile,
                  link: '/profile/setup',
                },
                {
                  rank: 3,
                  title: 'Rank 3: Identity Verification (KYC)',
                  desc: 'Upload government-issued ID to unlock messaging and escrow.',
                  done: !!profile?.gatekeepers?.hasKYC,
                  link: '/profile/kyc',
                },
                {
                  rank: 4,
                  title: 'Rank 4: Enterprise Verification (CAC)',
                  desc: 'Submit corporate registration to unlock listing management.',
                  done: !!profile?.gatekeepers?.hasBusinessVerification,
                  link: '/profile/verify-business',
                },
                {
                  rank: 5,
                  title: 'Rank 5: Apex Operator',
                  desc: 'Surpass 10,000 Lifetime NP and execute high-volume mandates.',
                  done: rank >= 5,
                  link: null,
                },
              ].map((q) => (
                <Paper
                  key={q.rank}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: q.done ? 'rgba(16, 185, 129, 0.04)' : '#ffffff',
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {q.done ? (
                      <CheckCircleIcon sx={{ color: '#10b981', fontSize: 24 }} />
                    ) : (
                      <LockIcon sx={{ color: '#94a3b8', fontSize: 22 }} />
                    )}
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{q.title}</Typography>
                      <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>{q.desc}</Typography>
                    </Box>
                  </Box>
                  {q.link && !q.done && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => router.push(q.link)}
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                      sx={{ bgcolor: '#0f172a', borderRadius: '8px', fontWeight: 700, textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      Start
                    </Button>
                  )}
                </Paper>
              ))}
            </Box>
          </Box>
        </ActionBlock>

        {/* 4. EXECUTIVE IDENTITY CARDS BLOCK */}
        <ActionBlock
          id="identity-cards"
          icon={<BadgeIcon />}
          title="Executive Identity Cards"
          subtitle="Generate, preview, and download your verified FoodNerve & Darkpore digital IDs"
          color="#f59e0b"
          isExpanded={activeBlock === 'identity-cards'}
          onToggle={() => toggleBlock('identity-cards')}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1, alignItems: 'center' }}>
            <Box ref={cardRef} sx={{ width: '100%', maxWidth: 420 }}>
              <ExecutiveCard {...execProps} />
            </Box>

            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={exportExecutiveCard}
              sx={{
                bgcolor: '#f59e0b',
                color: '#ffffff',
                borderRadius: '12px',
                fontWeight: 800,
                textTransform: 'none',
                px: 3,
                py: 1,
                '&:hover': { bgcolor: '#d97706' },
              }}
            >
              Download Official ID Card (PNG)
            </Button>
          </Box>
        </ActionBlock>

        {/* 5. SECURITY & PRIVACY BLOCK */}
        <ActionBlock
          id="security"
          icon={<ShieldIcon />}
          title="Security & Account Access"
          subtitle="Configure authentication security, directory privacy, and active sessions"
          color="#ef4444"
          isExpanded={activeBlock === 'security'}
          onToggle={() => toggleBlock('security')}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>Two-Factor Authentication (2FA)</Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>Require SMS or OTP verification upon signing in</Typography>
              </Box>
              <Switch checked={twoFactorAuth} onChange={(e) => setTwoFactorAuth(e.target.checked)} />
            </Box>

            <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>Public Directory Listing</Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>Allow ecosystem operators to discover your talent profile</Typography>
              </Box>
              <Switch checked={publicDirectory} onChange={(e) => setPublicDirectory(e.target.checked)} />
            </Box>

            <Box sx={{ pt: 1, display: 'flex', justifyContent: 'flex-start' }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleSignOut}
                sx={{ borderRadius: '12px', fontWeight: 800, textTransform: 'none', px: 3 }}
              >
                Sign Out of Current Device
              </Button>
            </Box>
          </Box>
        </ActionBlock>

        {/* 6. NOTIFICATIONS & ACTIVITY STREAM */}
        <ActionBlock
          id="notifications"
          icon={<NotificationsActiveIcon />}
          title="Profile Activity & Updates"
          subtitle="Real-time timeline of account achievements, security logs, and updates"
          color="#10b981"
          isExpanded={activeBlock === 'notifications'}
          onToggle={() => toggleBlock('notifications')}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
            {[
              {
                title: 'Level 1 Gatekeeper Verification Completed',
                subtitle: '+150 NP Reputation XP Credited to Wallet',
                time: '2 hours ago',
                badge: 'XP EARNED',
                color: '#10b981',
              },
              {
                title: 'Security Alert: Password Updated',
                subtitle: 'Account authentication parameters updated successfully',
                time: 'Yesterday at 14:32',
                badge: 'SECURITY',
                color: '#3b82f6',
              },
              {
                title: 'Organization Linkage Confirmed',
                subtitle: 'Linked to active organization workspace',
                time: '3 days ago',
                badge: 'NETWORK',
                color: '#8b5cf6',
              },
              {
                title: 'Executive Identity Card Exported',
                subtitle: 'Downloaded high-res digital credentials card',
                time: '5 days ago',
                badge: 'CREDENTIALS',
                color: '#f59e0b',
              },
            ].map((item, idx) => (
              <Paper
                key={idx}
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: '#f8fafc',
                  borderRadius: '14px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{item.title}</Typography>
                    <Typography
                      sx={{
                        fontSize: '0.55rem',
                        fontWeight: 800,
                        px: 1,
                        py: 0.2,
                        borderRadius: '6px',
                        bgcolor: alpha(item.color, 0.1),
                        color: item.color,
                      }}
                    >
                      {item.badge}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>{item.subtitle}</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {item.time}
                </Typography>
              </Paper>
            ))}
          </Box>
        </ActionBlock>
      </Box>

      {/* SNACKBAR FEEDBACK */}
      <Snackbar open={!!toastMsg} autoHideDuration={4000} onClose={() => setToastMsg(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setToastMsg(null)} severity="success" sx={{ width: '100%', borderRadius: '12px', fontWeight: 700 }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
