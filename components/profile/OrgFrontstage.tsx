'use client';

import React from 'react';
import { Box, Typography, Paper, Avatar, Chip, Button, Grid } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GroupsIcon from '@mui/icons-material/Groups';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SettingsIcon from '@mui/icons-material/Settings';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import { useSociety } from '@/context/SocietyContext';

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
              href={`/modular-society/${tenant}/@o-${slug}`}
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
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, flex: 1, bgcolor: '#f8fafc' }}>
        
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
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: '#fff',
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
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: '18px', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
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
              sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', borderColor: '#cbd5e1', color: '#0f172a', py: 1, fontSize: { xs: '0.8rem', md: '0.9rem' } }}
            >
              Open Management Backstage
            </Button>
            <Button
              variant="outlined"
              component="a"
              href={`/modular-society/${tenant}/@o-${slug}`}
              endIcon={<OpenInNewIcon />}
              sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', borderColor: '#cbd5e1', color: '#0f172a', py: 1, fontSize: { xs: '0.8rem', md: '0.9rem' } }}
            >
              View Handle Page (@o-{slug})
            </Button>
          </Box>
        </Paper>
      </Box>
    </Paper>
  );
}
