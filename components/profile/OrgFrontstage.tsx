// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
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
import BusinessIcon from '@mui/icons-material/Business';
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
  title: string;
  desc: string;
  color: string;
  icon: React.ReactNode;
  badge: string;
  cta: string;
}

const ORG_BLOCKS: OrgBlockDef[] = [
  {
    id: 'talent',
    num: '01',
    title: 'Talent & Applicant Ledger (ATS)',
    desc: 'Review candidate pipeline, hiring stages (Screening → Interview → Offer → Hired), and applicant dossiers.',
    color: '#3b82f6',
    icon: <PeopleIcon />,
    badge: 'ATS Pipeline',
    cta: 'Open Talent Ledger',
  },
  {
    id: 'roster',
    num: '02',
    title: 'Team Roster & Corporate Roles',
    desc: 'Manage organizational members, assign permissions (Owner, Admin, Member), and invite teammates.',
    color: '#10b981',
    icon: <GroupsIcon />,
    badge: 'Team Directory',
    cta: 'Manage Roster',
  },
  {
    id: 'compliance',
    num: '03',
    title: 'Verification & Compliance Vault',
    desc: 'CAC registration documents, RC number filing, institutional vetting clearance, and verified partner credentials.',
    color: '#f59e0b',
    icon: <VerifiedUserIcon />,
    badge: 'Compliance Vault',
    cta: 'Review Compliance',
  },
  {
    id: 'governance',
    num: '04',
    title: 'Governance & Approval Queue',
    desc: 'Live administrative queue of pending trade listings, team submissions, and ecosystem sign-offs.',
    color: '#8b5cf6',
    icon: <RocketLaunchIcon />,
    badge: 'Approvals Queue',
    cta: 'Review Approvals',
  },
  {
    id: 'activity',
    num: '05',
    title: 'Corporate Activity & Audit Trail',
    desc: 'Immutable audit log of corporate events, permissions changes, and ecosystem milestones.',
    color: '#64748b',
    icon: <ArticleIcon />,
    badge: 'Audit Trail',
    cta: 'View Audit Log',
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
  const [activeModalBlock, setActiveModalBlock] = useState<
    'talent' | 'roster' | 'compliance' | 'governance' | 'activity' | null
  >(initialBlock || null);

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

  const activeDef = ORG_BLOCKS.find((b) => b.id === activeModalBlock);

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

          {ORG_BLOCKS.map((b) => (
            <Paper
              key={b.id}
              elevation={0}
              onClick={() => setActiveModalBlock(b.id)}
              sx={{
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.85)',
                background: 'rgba(255, 255, 255, 0.68)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 8px 30px -4px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                '&:hover': {
                  borderColor: alpha(b.color, 0.6),
                  background: 'rgba(255, 255, 255, 0.88)',
                  boxShadow: `0 16px 40px -6px rgba(15, 23, 42, 0.08), 0 0 24px ${alpha(b.color, 0.18)}, inset 0 1px 0 rgba(255, 255, 255, 1)`,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
                {/* Left vertical color accent */}
                <Box sx={{ width: 6, flexShrink: 0, bgcolor: b.color }} />

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
                        bgcolor: alpha(b.color, 0.1),
                        color: b.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${alpha(b.color, 0.2)}`,
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
                            bgcolor: alpha(b.color, 0.1),
                            color: b.color,
                            borderRadius: '6px',
                          }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mt: 0.2, maxWidth: 520 }}>
                        {b.desc}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Right Action Trigger (No Flipping!) */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: { xs: 'auto', sm: 0 } }}>
                    <Button
                      variant="contained"
                      size="small"
                      endIcon={<OpenInFullIcon sx={{ fontSize: '14px !important' }} />}
                      sx={{
                        bgcolor: alpha(b.color, 0.12),
                        color: b.color,
                        borderRadius: '10px',
                        fontWeight: 800,
                        textTransform: 'none',
                        fontSize: '0.78rem',
                        boxShadow: 'none',
                        '&:hover': { bgcolor: alpha(b.color, 0.22) },
                      }}
                    >
                      {b.cta}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      </Container>

      {/* ─── 3. DEDICATED EXECUTIVE MODAL DIALOG (NO FLIPPING) ─── */}
      <Dialog
        open={Boolean(activeModalBlock)}
        onClose={() => setActiveModalBlock(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: '16px', md: '24px' },
            bgcolor: '#f8fafc',
            backgroundImage: 'none',
            overflow: 'hidden',
            width: { xs: '96vw', md: '92vw' },
            maxWidth: '1100px !important',
            height: { xs: '92vh', md: '88vh' },
            maxHeight: '92vh !important',
            m: 'auto',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.25)',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Header Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2, md: 3 },
            py: 1.5,
            bgcolor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {activeDef && (
              <Box
                sx={{
                  width: 32,
                  height: 32,
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
            )}
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                {activeDef?.title || 'Organization Workspace'}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                {orgName} • @o-{slug}
              </Typography>
            </Box>
          </Box>

          <IconButton
            onClick={() => setActiveModalBlock(null)}
            size="small"
            sx={{
              color: '#64748b',
              bgcolor: '#f1f5f9',
              '&:hover': { bgcolor: '#e2e8f0', color: '#0f172a' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Modal Body with Left Dock Tabs & Right Content Canvas */}
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Left Docked Navigation (Desktop) */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              width: 260,
              flexShrink: 0,
              bgcolor: '#ffffff',
              borderRight: '1px solid #e2e8f0',
              p: 2,
              gap: 1,
              overflowY: 'auto',
            }}
          >
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', px: 1, mb: 0.5 }}>
              Operations Modules
            </Typography>
            {ORG_BLOCKS.map((b) => {
              const isCurrent = activeModalBlock === b.id;
              return (
                <Box
                  key={b.id}
                  onClick={() => setActiveModalBlock(b.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 1.5,
                    py: 1.2,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    bgcolor: isCurrent ? alpha(b.color, 0.12) : 'transparent',
                    border: '1px solid',
                    borderColor: isCurrent ? alpha(b.color, 0.3) : 'transparent',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: isCurrent ? alpha(b.color, 0.15) : '#f8fafc',
                    },
                  }}
                >
                  <Box sx={{ color: isCurrent ? b.color : '#64748b', display: 'flex' }}>
                    {b.icon}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: '0.82rem',
                        fontWeight: isCurrent ? 800 : 600,
                        color: isCurrent ? '#0f172a' : '#475569',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {b.title}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Right Content Canvas */}
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
