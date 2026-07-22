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
        borderRadius: 4,
        boxShadow: { xs: '0 8px 32px rgba(0,0,0,0.06)', md: '0 10px 40px rgba(0,0,0,0.04)' },
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* HEADER HERO */}
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff',
          borderRadius: '16px 16px 0 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
            background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Avatar
              src={logoUrl || undefined}
              variant="rounded"
              sx={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                bgcolor: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.2)',
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              {orgName.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                  {orgName}
                </Typography>
                {isVerified && (
                  <Chip
                    icon={<VerifiedUserIcon sx={{ fontSize: '14px !important', color: '#10b981 !important' }} />}
                    label="Verified"
                    size="small"
                    sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700, borderRadius: '8px' }}
                  />
                )}
              </Box>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, mt: 0.3 }}>
                Role: <span style={{ color: '#38bdf8', fontWeight: 700 }}>{role}</span> • Dept: <span style={{ color: '#cbd5e1' }}>{department}</span>
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="contained"
              startIcon={<SettingsIcon />}
              onClick={onFlipRequest}
              sx={{
                bgcolor: '#3b82f6',
                borderRadius: '12px',
                fontWeight: 700,
                textTransform: 'none',
                px: 2.5,
                '&:hover': { bgcolor: '#2563eb' }
              }}
            >
              Backstage Controls
            </Button>
            <Button
              variant="outlined"
              component="a"
              href={`/modular-society/${tenant}/@o-${slug}`}
              target="_blank"
              endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#fff',
                borderRadius: '12px',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }
              }}
            >
              Public Link
            </Button>
          </Box>
        </Box>
      </Box>

      {/* DASHBOARD CONTENT BODY */}
      <Box sx={{ p: { xs: 3, md: 4 }, flex: 1, bgcolor: '#f8fafc' }}>
        
        {/* STATS OVERVIEW */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Ecosystem Status', value: isVerified ? 'Verified Partner' : 'Registered Entity', color: isVerified ? '#10b981' : '#f59e0b', icon: <VerifiedUserIcon /> },
            { label: 'Department', value: department, color: '#3b82f6', icon: <GroupsIcon /> },
            { label: 'Governance Rank', value: 'Rank 4 Pioneer', color: '#8b5cf6', icon: <RocketLaunchIcon /> },
          ].map((stat, i) => (
            <Grid key={i} size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '18px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  bgcolor: '#fff',
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    bgcolor: `${stat.color}15`,
                    color: stat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {stat.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    {stat.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    {stat.value}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* QUICK ACTIONS & HIGHLIGHTS */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <DynamicFeedIcon sx={{ color: '#3b82f6' }} /> Executive Frontstage Overview
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '0.9rem', mb: 3 }}>
            Welcome to your organization frontstage workspace. Use the backstage controls to manage roles, update compliance filings, and configure team permissions.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={onFlipRequest}
              startIcon={<SettingsIcon />}
              sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', borderColor: '#cbd5e1', color: '#0f172a' }}
            >
              Open Management Backstage
            </Button>
            <Button
              variant="outlined"
              component="a"
              href={`/modular-society/${tenant}/@o-${slug}`}
              endIcon={<OpenInNewIcon />}
              sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', borderColor: '#cbd5e1', color: '#0f172a' }}
            >
              View Handle Page (@o-{slug})
            </Button>
          </Box>
        </Paper>
      </Box>
    </Paper>
  );
}
