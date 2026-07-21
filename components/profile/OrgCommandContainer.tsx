'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Avatar } from '@mui/material';
import FlipContainer from '@/app/modular-society/[tenant]/(authenticated)/components/shared/FlipContainer';
import PublicOrgProfile from './PublicOrgProfile';
import OrgManageBackstage from './OrgManageBackstage';
import CreateOrgBackstage from './CreateOrgBackstage';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import VerifiedIcon from '@mui/icons-material/Verified';
import GroupsIcon from '@mui/icons-material/Groups';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useSociety } from '@/context/SocietyContext';

interface Props {
  tenant: string;
  slug: string | null;
  isActive: boolean;
  isCollapsed: boolean;
  onActivate: () => void;
}

export default function OrgCommandContainer({ tenant, slug, isActive, isCollapsed, onActivate }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { profile, activeOrg } = useSociety();

  if (isCollapsed) {
    // ─── HAS AN ORG ───
    if (slug && activeOrg) {
      const orgName = activeOrg.name || slug;
      const orgRole = activeOrg.role || 'member';
      const isVerified = activeOrg.verified || false;
      const logoUrl = activeOrg.logoUrl;
      const department = activeOrg.department;

      return (
        <Box
          onClick={onActivate}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: { xs: 'row', md: 'column' },
            alignItems: { xs: 'center', md: 'stretch' },
            gap: { xs: 2, md: 0 },
            bgcolor: '#0f172a',
            color: '#fff',
            cursor: 'pointer',
            borderRadius: '20px',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': { bgcolor: '#1e293b', boxShadow: '0 0 30px rgba(59,130,246,0.1)' },
            overflow: 'hidden',
            position: 'relative',
            p: { xs: 1.5, md: 2 },
          }}
        >
          {/* Ambient glow — desktop only */}
          <Box sx={{
            display: { xs: 'none', md: 'block' },
            position: 'absolute', bottom: '-20%', right: '-20%',
            width: '80%', height: '50%',
            bgcolor: '#3b82f6', opacity: 0.05, filter: 'blur(50px)', borderRadius: '50%',
            pointerEvents: 'none',
          }} />

          {/* ─── LOGO ─── */}
          <Avatar
            src={logoUrl || undefined}
            sx={{
              width: { xs: 40, md: 48 }, height: { xs: 40, md: 48 },
              bgcolor: '#1e3a5f', fontSize: { xs: 14, md: 18 }, fontWeight: 800,
              border: '2px solid #3b82f633',
              flexShrink: 0,
              alignSelf: { md: 'center' },
              mb: { xs: 0, md: 1.5 },
            }}
          >
            {orgName.charAt(0).toUpperCase()}
          </Avatar>

          {/* ─── INFO BLOCK ─── */}
          <Box sx={{
            minWidth: 0, flex: { xs: 1, md: 'none' },
            textAlign: { xs: 'left', md: 'center' },
            mb: { xs: 0, md: 1 },
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, justifyContent: { md: 'center' } }}>
              <Typography sx={{
                fontWeight: 800, fontSize: { xs: '0.8rem', md: '0.82rem' }, lineHeight: 1.2,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {orgName}
              </Typography>
              {isVerified && <VerifiedIcon sx={{ fontSize: 12, color: '#3b82f6' }} />}
            </Box>
            <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', lineHeight: 1.3, textTransform: 'capitalize' }}>
              {orgRole}
            </Typography>
          </Box>

          {/* ─── VERIFICATION PILL ─── */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.6,
            bgcolor: isVerified ? '#10b98118' : '#f59e0b18',
            border: `1px solid ${isVerified ? '#10b98130' : '#f59e0b30'}`,
            borderRadius: '10px',
            px: 1.2, py: 0.5,
            alignSelf: { md: 'center' },
            mb: { xs: 0, md: 1 },
          }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: isVerified ? '#10b981' : '#f59e0b', boxShadow: `0 0 6px ${isVerified ? '#10b981' : '#f59e0b'}` }} />
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: isVerified ? '#10b981' : '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isVerified ? 'Verified' : 'Pending'}
            </Typography>
          </Box>

          {/* ─── DEPARTMENT + INFO — Desktop only ─── */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 1, width: '100%', mt: 'auto' }}>
            {department && (
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center',
                bgcolor: '#3b82f612', borderRadius: '8px', px: 1, py: 0.5,
              }}>
                <GroupsIcon sx={{ fontSize: 11, color: '#60a5fa' }} />
                <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: '#93c5fd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {department}
                </Typography>
              </Box>
            )}

            <Box sx={{ bgcolor: '#ffffff08', borderRadius: '10px', border: '1px solid #ffffff0a', p: 1.2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                <BusinessIcon sx={{ fontSize: 11, color: '#94a3b8' }} />
                <Typography sx={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Organization
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.6rem', color: '#64748b', lineHeight: 1.3 }}>
                Tap to manage dashboard
              </Typography>
            </Box>
          </Box>
        </Box>
      );
    }

    // ─── NO ORG ───
    return (
      <Box
        onClick={() => { setIsFlipped(true); onActivate(); }}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: { xs: 'row', md: 'column' },
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 1.5, md: 0 },
          bgcolor: '#0f172a',
          color: '#fff',
          cursor: 'pointer',
          borderRadius: '20px',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': { bgcolor: '#1e293b', boxShadow: '0 0 30px rgba(59,130,246,0.12)' },
          overflow: 'hidden',
          position: 'relative',
          p: { xs: 1.5, md: 2 },
        }}
      >
        {/* Pulsing plus */}
        <Box sx={{
          width: { xs: 36, md: 48 }, height: { xs: 36, md: 48 },
          borderRadius: '50%',
          border: '2px dashed #3b82f650',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          mb: { xs: 0, md: 1.5 },
          animation: 'orgPulse 2s ease-in-out infinite',
          '@keyframes orgPulse': {
            '0%, 100%': { borderColor: '#3b82f630', transform: 'scale(1)' },
            '50%': { borderColor: '#3b82f680', transform: 'scale(1.06)' },
          },
        }}>
          <AddIcon sx={{ fontSize: { xs: 20, md: 24 }, color: '#3b82f6' }} />
        </Box>

        {/* Label */}
        <Box sx={{ textAlign: { xs: 'left', md: 'center' } }}>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.8rem', md: '0.82rem' }, color: '#e2e8f0' }}>
            Create Org
          </Typography>
          <Typography sx={{ fontSize: '0.6rem', color: '#64748b', display: { xs: 'none', md: 'block' } }}>
            Build your empire
          </Typography>
        </Box>

        {/* Rocket — desktop bottom only */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, mt: 'auto', width: '100%' }}>
          <Box sx={{
            bgcolor: '#ffffff08', borderRadius: '10px', border: '1px solid #ffffff0a',
            p: 1.2, display: 'flex', alignItems: 'center', gap: 0.8, width: '100%',
          }}>
            <RocketLaunchIcon sx={{ fontSize: 13, color: '#3b82f6' }} />
            <Typography sx={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600 }}>
              Tap to start
            </Typography>
          </Box>
        </Box>

        {/* Arrow hint — mobile only */}
        <Typography sx={{ display: { xs: 'block', md: 'none' }, fontSize: '0.8rem', color: '#3b82f6', ml: 'auto', flexShrink: 0 }}>
          →
        </Typography>
      </Box>
    );
  }

  return (
    <FlipContainer
      isFlipped={isFlipped}
      frontContent={
        !slug ? (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', borderRadius: '24px', border: '2px dashed #cbd5e1', p: 4, textAlign: 'center' }}>
            <BusinessIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>Build Your Empire</Typography>
            <Typography sx={{ color: '#64748b', mb: 4, maxWidth: 300 }}>You are not currently acting on behalf of an organization.</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsFlipped(true)} sx={{ bgcolor: '#3b82f6', borderRadius: '12px', fontWeight: 700 }}>
              Create Organization
            </Button>
          </Box>
        ) : (
          <PublicOrgProfile slug={slug} tenant={tenant} onFlipRequest={() => setIsFlipped(true)} />
        )
      }
      backContent={
        <Paper elevation={0} sx={{ height: '100%', overflowY: 'auto', bgcolor: '#ffffff', borderRadius: 4, boxShadow: { xs: '0 8px 32px rgba(0,0,0,0.06)', md: '0 10px 40px rgba(0,0,0,0.04)' }, position: 'relative' }}>
          {!slug ? (
            <CreateOrgBackstage onClose={() => setIsFlipped(false)} />
          ) : (
            <OrgManageBackstage onClose={() => setIsFlipped(false)} />
          )}
        </Paper>
      }
    />
  );
}
