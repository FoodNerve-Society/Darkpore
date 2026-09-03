'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  Grid,
  Dialog,
  IconButton,
  Divider,
  CircularProgress,
  Tooltip,
  Fade,
  alpha,
} from '@mui/material';
import { keyframes } from '@emotion/react';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GroupsIcon from '@mui/icons-material/Groups';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SettingsIcon from '@mui/icons-material/Settings';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import PeopleIcon from '@mui/icons-material/People';
import ArticleIcon from '@mui/icons-material/Article';
import WorkIcon from '@mui/icons-material/Work';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckIcon from '@mui/icons-material/Check';
import BusinessIcon from '@mui/icons-material/Business';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSociety } from '@/context/SocietyContext';
import { getPublicOrganization } from '@/lib/actions/organizations';
import OrgApplicantLedger from './OrgApplicantLedger';

const orgDriftGold = keyframes`
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(-70px, 60px) scale(1.15); }
  66% { transform: translate(40px, 120px) scale(0.94); }
  100% { transform: translate(0px, 0px) scale(1); }
`;

const orgDriftViolet = keyframes`
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(80px, -50px) scale(1.18); }
  66% { transform: translate(-50px, 90px) scale(0.92); }
  100% { transform: translate(0px, 0px) scale(1); }
`;

const orgDriftAmber = keyframes`
  0% { transform: translate(0px, 0px) scale(0.94); }
  50% { transform: translate(-60px, -70px) scale(1.2); }
  100% { transform: translate(0px, 0px) scale(0.94); }
`;

const orgDriftIndigo = keyframes`
  0% { transform: translate(0px, 0px) scale(1); }
  50% { transform: translate(70px, 50px) scale(1.15); }
  100% { transform: translate(0px, 0px) scale(1); }
`;

interface OrgBlockDef {
  id: 'talent' | 'roster' | 'compliance' | 'governance' | 'activity';
  num: string;
  number: number;
  title: string;
  shortTitle: string;
  desc: string;
  color: string;
  icon: React.ReactNode;
  badge: string;
  cta: string;
  whatFor: string;
  whyExists: string;
  statLabel: string;
  statValue: string;
}

const ORG_BLOCKS: OrgBlockDef[] = [
  {
    id: 'talent',
    num: '01',
    number: 1,
    title: 'Talent & Applicant Ledger (ATS)',
    shortTitle: 'ATS Talent',
    desc: 'Review candidate pipeline, hiring stages (Screening → Interview → Offer → Hired), and applicant dossiers.',
    color: '#3b82f6',
    icon: <PeopleIcon sx={{ fontSize: 20 }} />,
    badge: 'ATS Pipeline',
    cta: 'Open Talent Ledger',
    whatFor: 'Screen, shortlist, and interview candidates applying to your organization’s open positions.',
    whyExists: 'Gives corporate recruiters end-to-end recruitment tracking without external paid software.',
    statLabel: 'Funnel',
    statValue: 'Screening → Hired',
  },
  {
    id: 'roster',
    num: '02',
    number: 2,
    title: 'Team Roster & Corporate Roles',
    shortTitle: 'Team Roster',
    desc: 'Manage organizational members, assign permissions (Owner, Admin, Member), and invite teammates.',
    color: '#10b981',
    icon: <GroupsIcon sx={{ fontSize: 20 }} />,
    badge: 'Team Directory',
    cta: 'Manage Roster',
    whatFor: 'Oversee internal staff, assign departmental clearances, and control administrative access.',
    whyExists: 'Ensures clear corporate hierarchy and role segregation across trading and administrative operations.',
    statLabel: 'Clearance',
    statValue: 'Corporate Roles',
  },
  {
    id: 'compliance',
    num: '03',
    number: 3,
    title: 'Verification & Compliance Vault',
    shortTitle: 'Compliance',
    desc: 'CAC registration documents, RC number filing, institutional vetting clearance, and verified partner credentials.',
    color: '#f59e0b',
    icon: <VerifiedUserIcon sx={{ fontSize: 20 }} />,
    badge: 'Compliance Vault',
    cta: 'Review Compliance',
    whatFor: 'Submit CAC business certificates and RC numbers to verify your legal corporate standing.',
    whyExists: 'Unlocks Rank 4 Verified Partner trust badge, higher escrow limits, and verified employer ranking.',
    statLabel: 'Clearance',
    statValue: 'CAC Filing',
  },
  {
    id: 'governance',
    num: '04',
    number: 4,
    title: 'Governance & Approval Queue',
    shortTitle: 'Approvals',
    desc: 'Live administrative queue of pending trade listings, team submissions, and ecosystem sign-offs.',
    color: '#8b5cf6',
    icon: <RocketLaunchIcon sx={{ fontSize: 20 }} />,
    badge: 'Approvals Queue',
    cta: 'Review Approvals',
    whatFor: 'Inspect and sign off on trade tenders, procurement listings, and member requests before publication.',
    whyExists: 'Maintains organizational quality control and operational standards across all published content.',
    statLabel: 'Queue',
    statValue: 'Admin Clearance',
  },
  {
    id: 'activity',
    num: '05',
    number: 5,
    title: 'Corporate Activity & Audit Trail',
    shortTitle: 'Audit Log',
    desc: 'Immutable audit log of corporate events, permissions changes, and ecosystem milestones.',
    color: '#64748b',
    icon: <ArticleIcon sx={{ fontSize: 20 }} />,
    badge: 'Audit Trail',
    cta: 'View Audit Log',
    whatFor: 'Track every action taken by members, role modifications, and system events in an immutable feed.',
    whyExists: 'Provides institutional transparency and compliance accountability for investors and auditors.',
    statLabel: 'Telemetry',
    statValue: 'Live Telemetry',
  },
];

interface Props {
  tenant: string;
  slug: string;
  initialBlock?: 'talent' | 'roster' | 'compliance' | 'governance' | 'activity';
}

export default function OrgFrontstage({ tenant, slug, initialBlock }: Props) {
  const { profile, activeOrg } = useSociety();
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [flippedBlockId, setFlippedBlockId] = useState<string | null>(null);
  const [activeModalBlock, setActiveModalBlock] = useState<
    'talent' | 'roster' | 'compliance' | 'governance' | 'activity' | null
  >(initialBlock || null);
  const [mobileContextOpen, setMobileContextOpen] = useState(false);

  const mobilePillsTrackRef = useRef<any>(null);
  const mobilePillRefs = useRef<Record<string, any>>({});

  useEffect(() => {
    if (activeModalBlock && mobilePillsTrackRef.current) {
      const activeEl = mobilePillRefs.current[activeModalBlock];
      const container = mobilePillsTrackRef.current;
      if (container && activeEl) {
        const timer = setTimeout(() => {
          const containerWidth = container.offsetWidth;
          const chipLeft = activeEl.offsetLeft;
          const chipWidth = activeEl.offsetWidth;
          container.scrollTo({
            left: chipLeft - containerWidth / 2 + chipWidth / 2,
            behavior: 'smooth',
          });
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [activeModalBlock]);

  const orgName = activeOrg?.name || slug;
  const logoUrl = activeOrg?.logoUrl;
  const isVerified = activeOrg?.verified || false;
  const role = activeOrg?.role || 'member';
  const department = activeOrg?.department || 'General';

  useEffect(() => {
    const targetSlug = activeOrg?.slug || slug;
    if (targetSlug) {
      setLoading(true);
      getPublicOrganization(targetSlug).then((res) => {
        if (res.success) {
          setOrg(res.data);
        }
        setLoading(false);
      });
    }
  }, [activeOrg, slug]);

  const activeDef = ORG_BLOCKS.find((b) => b.id === activeModalBlock) || ORG_BLOCKS[0];

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 45%, #f8fafc 100%)',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* ── STICKY ORG AMBIENT CANVAS (PINNED TO VIEWPORT, ZERO LEAK, NO HARD SCROLL EDGE) ── */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          left: 0,
          width: '100%',
          height: 0,
          overflow: 'visible',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            minHeight: '100%',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          {/* Soft Multi-Stop Radial Base (Amber & Violet) */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse at 85% 12%, rgba(245, 158, 11, 0.14) 0%, transparent 55%), radial-gradient(ellipse at 15% 85%, rgba(124, 77, 255, 0.14) 0%, transparent 55%), radial-gradient(ellipse at 75% 80%, rgba(251, 191, 36, 0.09) 0%, transparent 60%), radial-gradient(ellipse at 20% 15%, rgba(99, 102, 241, 0.08) 0%, transparent 55%)',
              filter: 'blur(45px)',
            }}
          />

          {/* OPPOSITE COMPLEMENTARY ORB 1: Warm Amber / Gold Drift */}
          <Box
            sx={{
              position: 'absolute',
              top: '6%',
              right: '-6%',
              width: { xs: 320, md: 500 },
              height: { xs: 320, md: 500 },
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(245, 158, 11, 0.24) 0%, rgba(251, 191, 36, 0.09) 45%, transparent 75%)',
              filter: 'blur(65px)',
              animation: `${orgDriftGold} 22s ease-in-out infinite`,
              willChange: 'transform',
            }}
          />

          {/* OPPOSITE COMPLEMENTARY ORB 2: Royal Violet Counter-Drift */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '4%',
              left: '-6%',
              width: { xs: 320, md: 500 },
              height: { xs: 320, md: 500 },
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(124, 77, 255, 0.22) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 75%)',
              filter: 'blur(70px)',
              animation: `${orgDriftViolet} 26s ease-in-out infinite`,
              willChange: 'transform',
            }}
          />

          {/* ACCENT ORB 3: Deep Indigo Counter-Swell */}
          <Box
            sx={{
              position: 'absolute',
              top: '42%',
              left: '15%',
              width: { xs: 280, md: 440 },
              height: { xs: 280, md: 440 },
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(99, 102, 241, 0.16) 0%, rgba(124, 77, 255, 0.05) 50%, transparent 75%)',
              filter: 'blur(60px)',
              animation: `${orgDriftIndigo} 28s ease-in-out infinite`,
              willChange: 'transform',
            }}
          />

          {/* ACCENT ORB 4: Luminous Honey / Saffron Drift */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '20%',
              right: '15%',
              width: { xs: 260, md: 420 },
              height: { xs: 260, md: 420 },
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(251, 191, 36, 0.18) 0%, rgba(245, 158, 11, 0.05) 50%, transparent 75%)',
              filter: 'blur(65px)',
              animation: `${orgDriftAmber} 30s ease-in-out infinite`,
              willChange: 'transform',
            }}
          />

          {/* Micro-Dot Matrix Physical Texture Overlay */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.035) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              opacity: 0.65,
            }}
          />
        </Box>
      </Box>

      {/* ── CONTENT CONTAINER ── */}
      <Container
        maxWidth="md"
        sx={{
          py: { xs: 2.5, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* ─── 1. EXECUTIVE ORG IDENTITY HERO CARD (FROSTED LIQUID GLASS) ─── */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.85)',
            boxShadow: '0 12px 40px -8px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
          }}
        >
          {/* Identity Header Row */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
              mb: 2.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2.5 } }}>
              <Avatar
                src={logoUrl || undefined}
                variant="rounded"
                sx={{
                  width: { xs: 52, md: 64 },
                  height: { xs: 52, md: 64 },
                  borderRadius: '16px',
                  bgcolor: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  border: '2px solid rgba(255, 255, 255, 0.9)',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.15)',
                  fontWeight: 800,
                  fontSize: { xs: 22, md: 28 },
                  flexShrink: 0,
                }}
              >
                {orgName.charAt(0).toUpperCase()}
              </Avatar>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '1.15rem', md: '1.45rem' },
                      color: '#0f172a',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {orgName}
                  </Typography>
                  {isVerified && (
                    <Chip
                      icon={<VerifiedUserIcon sx={{ fontSize: '13px !important', color: '#10b981 !important' }} />}
                      label="Verified Partner"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(16, 185, 129, 0.12)',
                        color: '#10b981',
                        fontWeight: 800,
                        borderRadius: '8px',
                        height: 22,
                        fontSize: '0.65rem',
                      }}
                    />
                  )}
                </Box>

                <Typography sx={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 500, mt: 0.3 }}>
                  Role: <span style={{ color: '#0f172a', fontWeight: 700 }}>{role}</span> • Dept:{' '}
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>{department}</span> •{' '}
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>@o-{slug}</span>
                </Typography>
              </Box>
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
              <Button
                variant="contained"
                component="a"
                href={`/@o-${slug}`}
                target="_blank"
                endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                sx={{
                  flex: { xs: 1, sm: 'none' },
                  borderRadius: '12px',
                  fontWeight: 700,
                  bgcolor: '#0f172a',
                  color: '#fff',
                  textTransform: 'none',
                  px: 2,
                  py: 0.8,
                  fontSize: '0.82rem',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#1e293b' },
                }}
              >
                View Public Page
              </Button>
              <Button
                variant="outlined"
                component="a"
                href="/trade/create"
                startIcon={<WorkIcon sx={{ fontSize: 16 }} />}
                sx={{
                  flex: { xs: 1, sm: 'none' },
                  borderRadius: '12px',
                  fontWeight: 700,
                  borderColor: 'rgba(15, 23, 42, 0.15)',
                  color: '#0f172a',
                  textTransform: 'none',
                  px: 2,
                  py: 0.8,
                  fontSize: '0.82rem',
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': { bgcolor: '#f1f5f9', borderColor: '#0f172a' },
                }}
              >
                Post Opportunity
              </Button>
            </Box>
          </Box>

          {/* Glance Metrics Pills (Frosted Glass) */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Box
              onClick={() => setActiveModalBlock('compliance')}
              sx={{
                px: 2,
                py: 1.2,
                borderRadius: '14px',
                bgcolor: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(226, 232, 240, 0.85)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                flex: { xs: '1 1 100%', sm: 1 },
                cursor: 'pointer',
                transition: 'all 0.15s',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  borderColor: '#f59e0b',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Ecosystem Clearance
              </Typography>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, color: isVerified ? '#10b981' : '#f59e0b' }}>
                {isVerified ? 'Rank 4: Verified Partner' : 'Rank 1: Registered Entity'}
              </Typography>
            </Box>

            <Box
              onClick={() => setActiveModalBlock('roster')}
              sx={{
                px: 2,
                py: 1.2,
                borderRadius: '14px',
                bgcolor: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(226, 232, 240, 0.85)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                flex: { xs: '1 1 100%', sm: 1 },
                cursor: 'pointer',
                transition: 'all 0.15s',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  borderColor: '#10b981',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Team Members
              </Typography>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
                {org?.members?.length || 1} Enrolled
              </Typography>
            </Box>

            <Box
              onClick={() => setActiveModalBlock('talent')}
              sx={{
                px: 2,
                py: 1.2,
                borderRadius: '14px',
                bgcolor: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(226, 232, 240, 0.85)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                flex: { xs: '1 1 100%', sm: 1 },
                cursor: 'pointer',
                transition: 'all 0.15s',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  borderColor: '#3b82f6',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Recruitment Pipeline
              </Typography>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, color: '#3b82f6' }}>
                ATS Talent Ledger →
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* ─── 2. MODULAR NON-FLIPPING BLOCKS ─── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ px: 0.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
              Organization Operations & Tools
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#64748b', mt: 0.3 }}>
              Manage recruitment, team permissions, compliance documents, and ecosystem governance without leaving your workspace.
            </Typography>
          </Box>

          {ORG_BLOCKS.map((b, i) => {
            const isFlipped = flippedBlockId === b.id;
            const color = b.color;

            return (
              <Box
                key={b.id}
                id={`org-block-${b.id}`}
                sx={{ perspective: '1600px', mb: 1.5, scrollMarginTop: '120px' }}
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
                      border: '1px solid rgba(255, 255, 255, 0.85)',
                      background: 'rgba(255, 255, 255, 0.68)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      boxShadow: '0 8px 30px -4px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      '&:hover': {
                        borderColor: alpha(color, 0.6),
                        background: 'rgba(255, 255, 255, 0.85)',
                        boxShadow: `0 16px 40px -6px rgba(15, 23, 42, 0.08), 0 0 24px ${alpha(color, 0.18)}, inset 0 1px 0 rgba(255, 255, 255, 1)`,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
                      {/* Left vertical color accent */}
                      <Box sx={{ width: 6, flexShrink: 0, bgcolor: color }} />

                      <Box
                        sx={{
                          p: { xs: 2, md: 2.5 },
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 2,
                        }}
                      >
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  fontSize: { xs: '0.92rem', md: '1.02rem' },
                                  color: '#0f172a',
                                }}
                              >
                                {b.title}
                              </Typography>
                              <Chip
                                label={b.badge}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.62rem',
                                  fontWeight: 800,
                                  bgcolor: alpha(color, 0.1),
                                  color,
                                  borderRadius: '6px',
                                }}
                              />
                            </Box>
                            <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mt: 0.2, maxWidth: 520 }}>
                              {b.desc}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Right Action Hint to Flip */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: { xs: 'auto', sm: 0 } }}>
                          <Typography sx={{ fontSize: '0.78rem', color, fontWeight: 800 }}>
                            Tap to flip ↻
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* ────────────────────────────────────────────────────
                      BACK FACE (FLIPPED QUICK-ACTION VIEW)
                     ──────────────────────────────────────────────────── */}
                  <Box
                    sx={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateX(180deg)',
                      position: isFlipped ? 'relative' : 'absolute',
                      width: '100%',
                      top: 0,
                      borderRadius: '20px',
                      border: `1.5px solid ${alpha(color, 0.4)}`,
                      background: 'rgba(255, 255, 255, 0.92)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Back Card Header */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: { xs: 2, md: 3 },
                        py: 1.5,
                        borderBottom: '1px solid rgba(0,0,0,0.06)',
                        background: alpha(color, 0.05),
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '10px',
                          bgcolor: alpha(color, 0.15),
                          color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${alpha(color, 0.25)}`,
                        }}
                      >
                        <Typography sx={{ fontWeight: 800, fontSize: '0.85rem' }}>{b.num}</Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', flex: 1 }}>
                        {b.title}
                      </Typography>

                      {/* Expand to Modal Action Icon */}
                      <Tooltip title="Open Full Screen Modal">
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setFlippedBlockId(null);
                          }}
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

                    {/* Back Card Body with High-Velocity Actions */}
                    <Box sx={{ p: { xs: 2, md: 2.5 } }}>
                      {/* TALENT BACK FACE */}
                      {b.id === 'talent' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {[
                              { label: 'All Candidates', count: 'Pipeline', icon: '👥' },
                              { label: 'Under Review', count: 'Screening', icon: '🔍' },
                              { label: 'Shortlisted', count: 'Top Talent', icon: '⭐' },
                              { label: 'Interviews', count: 'Active', icon: '🎙️' },
                              { label: 'Hired', count: 'Onboarded', icon: '🎉' },
                            ].map((s, idx) => (
                              <Chip
                                key={idx}
                                label={`${s.icon} ${s.label}: ${s.count}`}
                                size="small"
                                sx={{ bgcolor: '#f1f5f9', color: '#334155', fontWeight: 700, borderRadius: '8px' }}
                              />
                            ))}
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', pt: 0.5 }}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => setActiveModalBlock('talent')}
                              startIcon={<PeopleIcon />}
                              endIcon={<OpenInFullIcon sx={{ fontSize: 13 }} />}
                              sx={{ bgcolor: '#3b82f6', borderRadius: '10px', fontWeight: 800, textTransform: 'none', px: 2, py: 0.8, boxShadow: 'none' }}
                            >
                              Open Full ATS Candidate Ledger
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              component="a"
                              href="/trade/create"
                              startIcon={<WorkIcon />}
                              sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', borderColor: '#cbd5e1', color: '#0f172a' }}
                            >
                              Post New Opportunity
                            </Button>
                          </Box>
                        </Box>
                      )}

                      {/* ROSTER BACK FACE */}
                      {b.id === 'roster' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
                            {org?.members?.length || 1} team members with active permissions. Direct team management:
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {org?.members?.slice(0, 3).map((m: any) => (
                              <Box key={m.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, bgcolor: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Avatar src={m.user?.avatarUrl || ''} sx={{ width: 28, height: 28 }}>
                                    {m.user?.name?.charAt(0) || 'U'}
                                  </Avatar>
                                  <Box>
                                    <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>{m.user?.name || 'Member'}</Typography>
                                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>{m.user?.email}</Typography>
                                  </Box>
                                </Box>
                                <Chip label={m.role} size="small" sx={{ fontWeight: 700, textTransform: 'capitalize', height: 20, fontSize: '0.65rem' }} />
                              </Box>
                            ))}
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1.5, pt: 0.5 }}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => setActiveModalBlock('roster')}
                              startIcon={<GroupsIcon />}
                              endIcon={<OpenInFullIcon sx={{ fontSize: 13 }} />}
                              sx={{ bgcolor: '#10b981', borderRadius: '10px', fontWeight: 800, textTransform: 'none', px: 2, py: 0.8, boxShadow: 'none' }}
                            >
                              Manage Full Directory & Roles
                            </Button>
                          </Box>
                        </Box>
                      )}

                      {/* COMPLIANCE BACK FACE */}
                      {b.id === 'compliance' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {isVerified ? (
                            <Box sx={{ p: 1.5, bgcolor: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                              <Typography sx={{ color: '#10b981', fontWeight: 800, fontSize: '0.88rem' }}>
                                ✓ Rank 4: Official Verified Partner
                              </Typography>
                              <Typography sx={{ color: '#059669', fontSize: '0.78rem', mt: 0.5 }}>
                                CAC clearance verified. Your listings carry official credibility across the network.
                              </Typography>
                            </Box>
                          ) : (
                            <Box sx={{ p: 1.5, bgcolor: 'rgba(245, 158, 11, 0.08)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                              <Typography sx={{ color: '#d97706', fontWeight: 800, fontSize: '0.88rem' }}>
                                Rank 1: Registered Entity (Unverified CAC)
                              </Typography>
                              <Typography sx={{ color: '#b45309', fontSize: '0.78rem', mt: 0.5 }}>
                                Upload CAC Certificate or institutional credentials to unlock Rank 4 badge.
                              </Typography>
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => setActiveModalBlock('compliance')}
                              startIcon={<VerifiedUserIcon />}
                              endIcon={<OpenInFullIcon sx={{ fontSize: 13 }} />}
                              sx={{ bgcolor: '#f59e0b', color: '#fff', borderRadius: '10px', fontWeight: 800, textTransform: 'none', px: 2, py: 0.8, boxShadow: 'none', '&:hover': { bgcolor: '#d97706' } }}
                            >
                              {isVerified ? 'View Compliance Certificate' : 'Begin CAC Verification'}
                            </Button>
                          </Box>
                        </Box>
                      )}

                      {/* GOVERNANCE BACK FACE */}
                      {b.id === 'governance' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
                            Live administrative queue for trade listing sign-offs and team content clearance.
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => setActiveModalBlock('governance')}
                              startIcon={<RocketLaunchIcon />}
                              endIcon={<OpenInFullIcon sx={{ fontSize: 13 }} />}
                              sx={{ bgcolor: '#8b5cf6', color: '#fff', borderRadius: '10px', fontWeight: 800, textTransform: 'none', px: 2, py: 0.8, boxShadow: 'none', '&:hover': { bgcolor: '#7c3aed' } }}
                            >
                              Inspect Approval Queue
                            </Button>
                          </Box>
                        </Box>
                      )}

                      {/* ACTIVITY BACK FACE */}
                      {b.id === 'activity' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
                            Real-time telemetry and audit feed of recent organizational updates.
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => setActiveModalBlock('activity')}
                              startIcon={<ArticleIcon />}
                              endIcon={<OpenInFullIcon sx={{ fontSize: 13 }} />}
                              sx={{ bgcolor: '#64748b', color: '#fff', borderRadius: '10px', fontWeight: 800, textTransform: 'none', px: 2, py: 0.8, boxShadow: 'none', '&:hover': { bgcolor: '#475569' } }}
                            >
                              View Full Audit Feed
                            </Button>
                          </Box>
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

      {/* ─── 3. DEDICATED EXECUTIVE MASTER MODAL DIALOG ─── */}
      <Dialog
        open={Boolean(activeModalBlock)}
        onClose={() => setActiveModalBlock(null)}
        maxWidth="lg"
        fullWidth
        slots={{ transition: Fade as any }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: { xs: '20px', md: '28px' },
              bgcolor: '#f8fafc',
              backgroundImage: 'none',
              overflow: 'hidden',
              width: { xs: '96vw !important', sm: '92vw !important', md: '1120px !important' },
              minWidth: { xs: '96vw !important', sm: '92vw !important', md: '1120px !important' },
              maxWidth: { xs: '96vw !important', sm: '92vw !important', md: '1120px !important' },
              height: { xs: '90vh !important', sm: '88vh !important', md: '780px !important' },
              minHeight: { xs: '90vh !important', sm: '88vh !important', md: '780px !important' },
              maxHeight: { xs: '90vh !important', sm: '88vh !important', md: '780px !important' },
              m: 'auto',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'none !important',
              animation: 'none !important',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* ── DESKTOP DOCKED SIDEBAR (md+ >= 900px, 280px Permanent) ── */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: 280,
              flexShrink: 0,
              bgcolor: '#ffffff',
              borderRight: '1px solid #e2e8f0',
              p: 2.5,
              gap: 2,
              overflowY: 'auto',
              height: '100%',
              minHeight: '100%',
              maxHeight: '100%',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Org Console Identity Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1.5, borderBottom: '1px solid #e2e8f0' }}>
                <Avatar
                  src={logoUrl || org?.logoUrl}
                  sx={{
                    width: 42,
                    height: 42,
                    bgcolor: '#0f172a',
                    color: '#ffffff',
                    fontWeight: 900,
                    border: `2px solid ${isVerified ? '#10b981' : '#f59e0b'}`,
                  }}
                >
                  {orgName.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography noWrap sx={{ fontWeight: 900, fontSize: '0.92rem', color: '#0f172a' }}>
                    {orgName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Chip
                      label={isVerified ? 'Rank 4: Partner' : 'Rank 1: Entity'}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        bgcolor: isVerified ? alpha('#10b981', 0.15) : alpha('#f59e0b', 0.15),
                        color: isVerified ? '#10b981' : '#f59e0b',
                      }}
                    />
                    <Typography noWrap sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                      @{slug}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Module Navigation Tabs (All 5 Blocks) */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', px: 1 }}>
                  Operations Modules
                </Typography>
                {ORG_BLOCKS.map((b) => {
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
                bgcolor: alpha(activeDef.color, 0.05),
                border: `1px solid ${alpha(activeDef.color, 0.2)}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: activeDef.color }} />
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, color: activeDef.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  About This Section
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  What this is for:
                </Typography>
                <Typography sx={{ fontSize: '0.76rem', color: '#1e293b', lineHeight: 1.4, mt: 0.2 }}>
                  {activeDef.whatFor}
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  Why it exists:
                </Typography>
                <Typography sx={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.4, mt: 0.2 }}>
                  {activeDef.whyExists}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: `1px solid ${alpha(activeDef.color, 0.15)}` }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>{activeDef.statLabel}:</Typography>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, color: activeDef.color }}>{activeDef.statValue}</Typography>
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
              width: '100%',
            }}
          >
            {/* Top row: Title + Close button */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '10px', bgcolor: alpha(activeDef.color, 0.15), color: activeDef.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {activeDef.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '0.98rem', color: '#0f172a', lineHeight: 1.2 }}>
                    {activeDef.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: '#64748b' }}>
                    Part {activeDef.number} of 5 • @{slug}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setActiveModalBlock(null)} size="small" sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', width: 34, height: 34 }}>
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            {/* Pill Category Tab Menu (FoodNerve .com Career Page Style) */}
            <Box sx={{ px: 2, pb: 1.2 }}>
              <Box
                ref={mobilePillsTrackRef}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  overflowX: 'auto',
                  p: 0.6,
                  gap: 0.8,
                  bgcolor: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '9999px',
                  border: '1px solid rgba(226, 232, 240, 0.9)',
                  boxShadow: '0 4px 20px -4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)',
                  '::-webkit-scrollbar': { display: 'none' },
                }}
              >
                {ORG_BLOCKS.map((b) => {
                  const isActive = b.id === activeModalBlock;
                  return (
                    <Box
                      key={b.id}
                      ref={(el) => {
                        mobilePillRefs.current[b.id] = el;
                      }}
                      onClick={() => setActiveModalBlock(b.id)}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.8,
                        px: 1.8,
                        py: 0.65,
                        borderRadius: '9999px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        bgcolor: isActive ? b.color : 'transparent',
                        color: isActive ? '#ffffff' : '#475569',
                        boxShadow: isActive ? `0 4px 14px ${alpha(b.color, 0.4)}` : 'none',
                        '&:hover': {
                          bgcolor: isActive ? b.color : alpha(b.color, 0.08),
                          color: isActive ? '#ffffff' : '#0f172a',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 18,
                          height: 18,
                          borderRadius: '9999px',
                          bgcolor: isActive ? 'rgba(255, 255, 255, 0.25)' : alpha(b.color, 0.12),
                          color: isActive ? '#ffffff' : b.color,
                          fontSize: '0.68rem',
                          fontWeight: 900,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {b.number}
                      </Box>
                      <Typography
                        sx={{
                          fontSize: '0.78rem',
                          fontWeight: isActive ? 900 : 700,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {b.shortTitle}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Premium "About this section" Disclosure on Mobile */}
            <Box sx={{ px: 2, pb: 1.5 }}>
              <Paper
                elevation={0}
                onClick={() => setMobileContextOpen(!mobileContextOpen)}
                sx={{
                  p: 1.5,
                  borderRadius: '16px',
                  bgcolor: alpha(activeDef.color, 0.04),
                  border: `1px solid ${alpha(activeDef.color, 0.2)}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  '&:hover': {
                    bgcolor: alpha(activeDef.color, 0.08),
                    borderColor: alpha(activeDef.color, 0.35),
                  },
                }}
              >
                {/* Accordion Trigger Row */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '6px',
                        bgcolor: alpha(activeDef.color, 0.14),
                        color: activeDef.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AutoAwesomeIcon sx={{ fontSize: 13 }} />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        color: activeDef.color,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      About This Section
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={`${activeDef.statLabel}: ${activeDef.statValue}`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        bgcolor: alpha(activeDef.color, 0.12),
                        color: activeDef.color,
                        borderRadius: '6px',
                      }}
                    />
                    <ExpandMoreIcon
                      sx={{
                        fontSize: 18,
                        color: activeDef.color,
                        transform: mobileContextOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </Box>
                </Box>

                {/* Expanded Context Details */}
                {mobileContextOpen && (
                  <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${alpha(activeDef.color, 0.15)}`, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                        What this is for:
                      </Typography>
                      <Typography sx={{ fontSize: '0.76rem', color: '#1e293b', lineHeight: 1.4, mt: 0.2 }}>
                        {activeDef.whatFor}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                        Why it exists:
                      </Typography>
                      <Typography sx={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.4, mt: 0.2 }}>
                        {activeDef.whyExists}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>

          {/* ── RIGHT MAIN CONTENT CANVAS ── */}
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#f8fafc' }}>
            {/* Desktop Canvas Header */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 3.5,
                py: 2,
                bgcolor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                flexShrink: 0,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    bgcolor: alpha(activeDef.color, 0.12),
                    color: activeDef.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {activeDef.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#0f172a' }}>
                    {activeDef.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Part {activeDef.number} of 5 • {activeDef.desc}
                  </Typography>
                </Box>
              </Box>

              <IconButton
                onClick={() => setActiveModalBlock(null)}
                size="small"
                sx={{
                  color: '#64748b',
                  bgcolor: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  '&:hover': { bgcolor: '#e2e8f0', color: '#0f172a' },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Scrollable Content Body */}
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', bgcolor: '#f8fafc' }}>
            {/* 1. TALENT ATS LEDGER */}
            {activeModalBlock === 'talent' && (
              <Box sx={{ p: { xs: 1.5, md: 3 }, bgcolor: '#ffffff', minHeight: '100%' }}>
                {org?.id ? (
                  <OrgApplicantLedger
                    organizationId={org.id}
                    organizationName={org.name}
                    organizationSlug={org.slug}
                    tenant={tenant}
                    onBack={() => setActiveModalBlock(null)}
                  />
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <CircularProgress size={28} />
                  </Box>
                )}
              </Box>
            )}

            {/* 2. TEAM ROSTER & ROLES */}
            {activeModalBlock === 'roster' && (
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: '20px', border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        Corporate Team Directory
                      </Typography>
                      <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {org?.members?.length || 1} team members with active workspace permissions
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      variant="contained"
                      sx={{ bgcolor: '#10b981', color: '#fff', borderRadius: '10px', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#059669' } }}
                    >
                      Invite Teammate
                    </Button>
                  </Box>

                  <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                          <th style={{ padding: '12px 16px' }}>Member</th>
                          <th style={{ padding: '12px 16px' }}>Platform Rank</th>
                          <th style={{ padding: '12px 16px' }}>Corporate Role</th>
                          <th style={{ padding: '12px 16px' }}>Enrolled</th>
                        </tr>
                      </thead>
                      <tbody>
                        {org?.members?.map((member: any) => (
                          <tr key={member.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '14px 16px' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar src={member.user?.avatarUrl || ''} sx={{ width: 36, height: 36 }}>
                                  {member.user?.name?.charAt(0) || 'U'}
                                </Avatar>
                                <Box>
                                  <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>
                                    {member.user?.name || 'Team Member'}
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    {member.user?.email}
                                  </Typography>
                                </Box>
                              </Box>
                            </td>
                            <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 600, fontSize: '0.85rem' }}>
                              Rank {member.user?.rank || 1}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <Chip
                                label={member.role}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  textTransform: 'capitalize',
                                  borderRadius: '8px',
                                  bgcolor:
                                    member.role === 'owner'
                                      ? 'rgba(245, 158, 11, 0.12)'
                                      : member.role === 'admin'
                                      ? 'rgba(139, 92, 246, 0.12)'
                                      : '#f1f5f9',
                                  color:
                                    member.role === 'owner'
                                      ? '#d97706'
                                      : member.role === 'admin'
                                      ? '#8b5cf6'
                                      : '#64748b',
                                }}
                              />
                            </td>
                            <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.82rem' }}>
                              {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'Active'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </Paper>
              </Box>
            )}

            {/* 3. VERIFICATION & COMPLIANCE VAULT */}
            {activeModalBlock === 'compliance' && (
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: '20px', border: '1px solid #e2e8f0', bgcolor: '#ffffff', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VerifiedUserIcon sx={{ color: isVerified ? '#10b981' : '#f59e0b' }} /> Official Entity Clearance
                  </Typography>

                  {isVerified ? (
                    <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.08)', p: 3, borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                      <Typography sx={{ color: '#10b981', fontWeight: 800, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 20 }} /> Rank 4: Verified Ecosystem Partner
                      </Typography>
                      <Typography sx={{ color: '#059669', fontSize: '0.85rem', mt: 1, lineHeight: 1.6 }}>
                        This organization holds official CAC clearance. Your opportunities, trade tenders, and talent postings carry verified credibility across the Food Nerve Network.
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ bgcolor: 'rgba(245, 158, 11, 0.08)', p: 3, borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                      <Typography sx={{ color: '#d97706', fontWeight: 800, fontSize: '1.05rem' }}>
                        Rank 1: Registered Corporate Entity
                      </Typography>
                      <Typography sx={{ color: '#b45309', fontSize: '0.85rem', mt: 1, mb: 2.5, lineHeight: 1.6 }}>
                        Submit your corporate CAC registration documents or institutional contact clearance to upgrade to Verified Partner status (Rank 4).
                      </Typography>
                      <Button
                        variant="contained"
                        sx={{ bgcolor: '#f59e0b', color: '#fff', fontWeight: 700, textTransform: 'none', borderRadius: '10px', boxShadow: 'none', '&:hover': { bgcolor: '#d97706' } }}
                      >
                        Submit CAC Verification Documents
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Box>
            )}

            {/* 4. GOVERNANCE & APPROVAL QUEUE */}
            {activeModalBlock === 'governance' && (
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                <PendingApprovalSection organizationId={org?.id} userRole={role} userId={profile?.uid} />
              </Box>
            )}

            {/* 5. CORPORATE ACTIVITY & AUDIT TRAIL */}
            {activeModalBlock === 'activity' && (
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: '20px', border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        Corporate Activity & Audit Trail
                      </Typography>
                      <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
                        Immutable audit log of corporate events, permissions changes, and ecosystem milestones
                      </Typography>
                    </Box>
                    <Chip label="Live Feed" color="success" size="small" sx={{ fontWeight: 700, borderRadius: '8px' }} />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      {
                        title: 'Corporate Workspace Synced',
                        desc: 'Organization telemetry active under modular governance protocol.',
                        date: 'Today',
                        badge: 'System',
                        color: '#3b82f6',
                      },
                      {
                        title: 'Talent Ledger Verified',
                        desc: 'ATS recruitment ledger active and listening for candidate submissions.',
                        date: 'Yesterday',
                        badge: 'Talent',
                        color: '#10b981',
                      },
                      {
                        title: 'Governance Clearance Active',
                        desc: 'Approval queue initialized for listings and member sign-offs.',
                        date: 'This Week',
                        badge: 'Governance',
                        color: '#8b5cf6',
                      },
                    ].map((act, i) => (
                      <Paper
                        key={i}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: '14px',
                          border: '1px solid #f1f5f9',
                          bgcolor: '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1.5,
                        }}
                      >
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                            <Chip
                              label={act.badge}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.62rem',
                                fontWeight: 800,
                                bgcolor: alpha(act.color, 0.12),
                                color: act.color,
                              }}
                            />
                            <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>
                              {act.title}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {act.desc}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                          {act.date}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Dialog>
  </Box>
);
}

function PendingApprovalSection({ organizationId, userRole, userId }: { organizationId?: string; userRole: string; userId?: string }) {
  const [pendingItems, setPendingItems] = React.useState<any[]>([]);
  const [userSubmissions, setUserSubmissions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const isAdminOrOwner = userRole === 'owner' || userRole === 'admin';

  const loadItems = React.useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const { getPendingOrgContent, getOrgSubmissionsForUser } = await import('@/lib/actions/org-approval');
      if (isAdminOrOwner) {
        const items = await getPendingOrgContent(organizationId);
        setPendingItems(items);
      }
      if (userId) {
        const submissions = await getOrgSubmissionsForUser(userId, organizationId);
        setUserSubmissions(submissions);
      }
    } catch (err) {
      console.error('Failed loading governance items:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, isAdminOrOwner, userId]);

  React.useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleApprove = async (id: string, type: any) => {
    const { approveOrgContent } = await import('@/lib/actions/org-approval');
    await approveOrgContent(id, type, userId || '');
    loadItems();
  };

  const handleReject = async (id: string, type: any) => {
    const { rejectOrgContent } = await import('@/lib/actions/org-approval');
    await rejectOrgContent(id, type, userId || '');
    loadItems();
  };

  if (!organizationId) return null;

  return (
    <Box sx={{ mt: 1 }}>
      {/* ADMIN APPROVAL QUEUE */}
      {isAdminOrOwner && (
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: '18px', border: '1px solid #e2e8f0', bgcolor: '#fff', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '0.95rem', md: '1.1rem' }, display: 'flex', alignItems: 'center', gap: 1 }}>
              🛡️ Pending Org Approvals
            </Typography>
            <Chip
              label={`${pendingItems.length} Pending`}
              size="small"
              color={pendingItems.length > 0 ? 'warning' : 'default'}
              sx={{ fontWeight: 700, borderRadius: '8px' }}
            />
          </Box>

          {loading ? (
            <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>Loading pending approvals...</Typography>
          ) : pendingItems.length === 0 ? (
            <Box sx={{ p: 2.5, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                ✅ All clear! No pending submissions requiring your review.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {pendingItems.map((item) => (
                <Paper key={item.id} elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #f1f5f9', bgcolor: '#f8fafc', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', gap: 1.5 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip label={item.type.toUpperCase()} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: '#e2e8f0', color: '#334155' }} />
                      <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>{item.title}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Submitted by <strong>{item.authorName}</strong> on {new Date(item.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleApprove(item.id, item.type)}
                      sx={{ bgcolor: '#10b981', color: '#fff', borderRadius: '8px', fontWeight: 700, textTransform: 'none', px: 2, '&:hover': { bgcolor: '#059669' } }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => handleReject(item.id, item.type)}
                      sx={{ borderRadius: '8px', fontWeight: 700, textTransform: 'none', px: 2 }}
                    >
                      Reject
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      )}

      {/* MY ORG SUBMISSIONS (FOR EMPLOYEE/ALL USERS) */}
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: '18px', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2, fontSize: { xs: '0.95rem', md: '1.1rem' }, display: 'flex', alignItems: 'center', gap: 1 }}>
          📋 My Organization Submissions
        </Typography>

        {loading ? (
          <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>Loading submissions...</Typography>
        ) : userSubmissions.length === 0 ? (
          <Box sx={{ p: 2.5, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>
              You haven't submitted any content under this organization yet.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {userSubmissions.map((sub) => (
              <Paper key={sub.id} elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid #f1f5f9', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Chip label={sub.type.toUpperCase()} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: '#e2e8f0' }} />
                    <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{sub.title}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Submitted {new Date(sub.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {sub.status === 'pending_org_review' && (
                    <Chip label="Pending Review" size="small" sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 700, borderRadius: '8px' }} />
                  )}
                  {sub.status === 'published' && (
                    <Chip label="Published" size="small" sx={{ bgcolor: '#d1fae5', color: '#059669', fontWeight: 700, borderRadius: '8px' }} />
                  )}
                  {sub.status === 'rejected' && (
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      component="a"
                      href={sub.editUrl}
                      sx={{ borderRadius: '8px', fontWeight: 700, textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      Rejected — Edit in Studio ✏️
                    </Button>
                  )}
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
