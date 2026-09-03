'use client';

import React from 'react';
import { Box, Typography, Paper, Avatar, Chip, Button, Grid } from '@mui/material';
import { keyframes } from '@emotion/react';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GroupsIcon from '@mui/icons-material/Groups';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SettingsIcon from '@mui/icons-material/Settings';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import PeopleIcon from '@mui/icons-material/People';
import { useSociety } from '@/context/SocietyContext';

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

interface Props {
  tenant: string;
  slug: string;
  onFlipRequest?: () => void;
}

export default function OrgFrontstage({ tenant, slug, onFlipRequest }: Props) {
  const { profile, activeOrg } = useSociety();

  const orgName = activeOrg?.name || slug;
  const logoUrl = activeOrg?.logoUrl;
  const isVerified = activeOrg?.verified || false;
  const role = activeOrg?.role || 'member';
  const department = activeOrg?.department || 'General';

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        overflowY: 'auto',
        bgcolor: '#ffffff',
        borderRadius: { xs: 3, md: 4 },
        boxShadow: { xs: '0 4px 20px rgba(0,0,0,0.05)', md: '0 10px 40px rgba(0,0,0,0.04)' },
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* HEADER HERO */}
      <Box
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff',
          borderRadius: { xs: '12px 12px 0 0', md: '16px 16px 0 0' },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', gap: 2, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2.5 } }}>
            <Avatar
              src={logoUrl || undefined}
              variant="rounded"
              sx={{
                width: { xs: 48, sm: 56, md: 64 },
                height: { xs: 48, sm: 56, md: 64 },
                borderRadius: { xs: '12px', md: '16px' },
                bgcolor: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.2)',
                fontSize: { xs: 20, md: 28 },
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {orgName.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: '#fff',
                    letterSpacing: '-0.02em',
                    fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {orgName}
                </Typography>
                {isVerified && (
                  <Chip
                    icon={<VerifiedUserIcon sx={{ fontSize: '13px !important', color: '#10b981 !important' }} />}
                    label="Verified"
                    size="small"
                    sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700, borderRadius: '8px', height: 22, fontSize: '0.65rem' }}
                  />
                )}
              </Box>
              <Typography sx={{ color: '#94a3b8', fontSize: { xs: '0.75rem', md: '0.85rem' }, fontWeight: 500, mt: 0.3 }}>
                Role: <span style={{ color: '#38bdf8', fontWeight: 700 }}>{role}</span> • Dept: <span style={{ color: '#cbd5e1' }}>{department}</span>
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="contained"
              startIcon={<PeopleIcon sx={{ fontSize: { xs: 16, md: 18 } }} />}
              onClick={onFlipRequest}
              sx={{
                flex: { xs: 1, sm: 'none' },
                bgcolor: 'rgba(59, 130, 246, 0.2)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '12px',
                fontWeight: 800,
                textTransform: 'none',
                px: { xs: 1.5, md: 2.5 },
                py: { xs: 0.8, md: 1 },
                fontSize: { xs: '0.78rem', md: '0.88rem' },
                '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.3)', borderColor: '#38bdf8' },
              }}
            >
              Talent & Applicants
            </Button>
            <Button
              variant="contained"
              startIcon={<SettingsIcon sx={{ fontSize: { xs: 16, md: 18 } }} />}
              onClick={onFlipRequest}
              sx={{
                flex: { xs: 1, sm: 'none' },
                bgcolor: '#3b82f6',
                borderRadius: '12px',
                fontWeight: 700,
                textTransform: 'none',
                px: { xs: 1.5, md: 2.5 },
                py: { xs: 0.8, md: 1 },
                fontSize: { xs: '0.78rem', md: '0.88rem' },
                '&:hover': { bgcolor: '#2563eb' },
              }}
            >
              Backstage
            </Button>
            <Button
              variant="outlined"
              component="a"
              href={`/@o-${slug}`}
              target="_blank"
              endIcon={<OpenInNewIcon sx={{ fontSize: { xs: 14, md: 16 } }} />}
              sx={{
                flex: { xs: 1, sm: 'none' },
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#fff',
                borderRadius: '12px',
                fontWeight: 700,
                textTransform: 'none',
                px: { xs: 1.5, md: 2 },
                py: { xs: 0.8, md: 1 },
                fontSize: { xs: '0.78rem', md: '0.88rem' },
                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.05)' },
              }}
            >
              Public Link
            </Button>
          </Box>
        </Box>
      </Box>

      {/* DASHBOARD CONTENT BODY */}
      <Box
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          flex: 1,
          position: 'relative',
          background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 45%, #f8fafc 100%)',
        }}
      >
        {/* ── STICKY ORG AMBIENT CANVAS (FOLLOWS VIEWPORT, ZERO HARD BOTTOM EDGE) ── */}
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
                background: 'radial-gradient(ellipse at 85% 12%, rgba(245, 158, 11, 0.14) 0%, transparent 55%), radial-gradient(ellipse at 15% 85%, rgba(124, 77, 255, 0.14) 0%, transparent 55%), radial-gradient(ellipse at 75% 80%, rgba(251, 191, 36, 0.09) 0%, transparent 60%), radial-gradient(ellipse at 20% 15%, rgba(99, 102, 241, 0.08) 0%, transparent 55%)',
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
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.24) 0%, rgba(251, 191, 36, 0.09) 45%, transparent 75%)',
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
                background: 'radial-gradient(circle, rgba(124, 77, 255, 0.22) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 75%)',
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
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.16) 0%, rgba(124, 77, 255, 0.05) 50%, transparent 75%)',
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
                background: 'radial-gradient(circle, rgba(251, 191, 36, 0.18) 0%, rgba(245, 158, 11, 0.05) 50%, transparent 75%)',
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

        {/* Content Container (Layered above ambient canvas) */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* STATS OVERVIEW */}
          <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: { xs: 2, md: 3 } }}>
            {[
              { label: 'Ecosystem Status', value: isVerified ? 'Verified Partner' : 'Registered Entity', color: isVerified ? '#10b981' : '#f59e0b', icon: <VerifiedUserIcon /> },
              { label: 'Department', value: department, color: '#3b82f6', icon: <GroupsIcon /> },
              { label: 'Governance Rank', value: 'Rank 4 Pioneer', color: '#8b5cf6', icon: <RocketLaunchIcon /> },
            ].map((stat, i) => (
              <Grid key={i} size={{ xs: 12, sm: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 1.8, md: 2.5 },
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    bgcolor: 'rgba(255, 255, 255, 0.72)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 30px -4px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 36, md: 44 },
                      height: { xs: 36, md: 44 },
                      borderRadius: '12px',
                      bgcolor: `${stat.color}15`,
                      color: stat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                      {stat.label}
                    </Typography>
                    <Typography sx={{ fontSize: { xs: '0.85rem', md: '0.95rem' }, fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {stat.value}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* QUICK ACTIONS & HIGHLIGHTS */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.85)',
              bgcolor: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 8px 30px -4px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5, fontSize: { xs: '0.95rem', md: '1.1rem' }, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DynamicFeedIcon sx={{ color: '#3b82f6', fontSize: { xs: 20, md: 24 } }} /> Executive Frontstage Overview
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: { xs: '0.8rem', md: '0.9rem' }, mb: 2.5, lineHeight: 1.5 }}>
              Welcome to your organization frontstage workspace. Use the backstage controls to manage roles, update compliance filings, and configure team permissions.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                variant="outlined"
                onClick={onFlipRequest}
                startIcon={<SettingsIcon />}
                sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', borderColor: '#cbd5e1', color: '#0f172a', py: 1, fontSize: { xs: '0.8rem', md: '0.9rem' }, bgcolor: '#ffffff', '&:hover': { bgcolor: '#f1f5f9' } }}
              >
                Open Management Backstage
              </Button>
              <Button
                variant="outlined"
                component="a"
                href={`/@o-${slug}`}
                target="_blank"
                endIcon={<OpenInNewIcon />}
                sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', borderColor: '#cbd5e1', color: '#0f172a', py: 1, fontSize: { xs: '0.8rem', md: '0.9rem' }, bgcolor: '#ffffff', '&:hover': { bgcolor: '#f1f5f9' } }}
              >
                View Handle Page (@o-{slug})
              </Button>
            </Box>
          </Paper>

          {/* ORGANIZATIONAL GOVERNANCE & APPROVAL QUEUE */}
          <PendingApprovalSection organizationId={activeOrg?.id} userRole={role} userId={profile?.uid} />
        </Box>
      </Box>
    </Paper>
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
