'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Avatar } from '@mui/material';
import FlipContainer from '@/app/modular-society/[tenant]/(authenticated)/components/shared/FlipContainer';
import PublicOrgProfile from './PublicOrgProfile';
import OrgManageBackstage from './OrgManageBackstage';
import CreateOrgBackstage from './CreateOrgBackstage';
import JoinOrgBackstage from './JoinOrgBackstage';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import VerifiedIcon from '@mui/icons-material/Verified';
import GroupsIcon from '@mui/icons-material/Groups';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
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
  const [noOrgAction, setNoOrgAction] = useState<'join' | 'create'>('join');
  const { profile, activeOrg } = useSociety();

  const handleManageOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(true);
    if (isCollapsed) onActivate();
  };

  const handleDirectAction = (e: React.MouseEvent, action: 'join' | 'create') => {
    e.stopPropagation();
    setNoOrgAction(action);
    setIsFlipped(true);
    if (isCollapsed) onActivate();
  };

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
                   {/* 1. Org Activity Button Card */}
            <Box 
              onClick={handleManageOpen}
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(16px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                px: 2,
                py: 1.25,
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  bgcolor: 'rgba(16, 185, 129, 0.15)',
                  borderColor: 'rgba(16, 185, 129, 0.4)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar 
                  variant="rounded"
                  sx={{ 
                    width: 32, height: 32, borderRadius: '10px',
                    bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#10b981'
                  }} 
                >
                  <DynamicFeedIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>
                  Org Activity
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 800 }}>→</Typography>
            </Box>

            {/* 2. Manage Org Button Card */}
            <Box 
              onClick={handleManageOpen}
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(16px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                px: 2,
                py: 1.25,
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  bgcolor: 'rgba(59, 130, 246, 0.15)',
                  borderColor: 'rgba(59, 130, 246, 0.4)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(59, 130, 246, 0.2)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar 
                  variant="rounded"
                  sx={{ 
                    width: 32, height: 32, borderRadius: '10px',
                    bgcolor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6'
                  }} 
                >
                  <BusinessIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>
                  Org Dashboard
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.9rem', color: '#3b82f6', fontWeight: 800 }}>→</Typography>
            </Box>

          </Box>
        </Box> </Typography>
              </Box>
            </Box>

          </Box>

        {/* ─── CTAs IN THE MIDDLE (MOBILE) ─── */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, mx: 'auto' }}>
          
          {/* Org Activity CTA */}
          <Box 
            onClick={handleManageOpen}
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(18, 24, 20, 0.92)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              boxShadow: `0 4px 16px rgba(16,185,129, 0.15), 0 1px 3px rgba(0,0,0,0.08)`,
              border: `1px solid rgba(16,185,129, 0.12)`,
              px: 1.2,
              py: 0.8,
              cursor: 'pointer',
            }}
          >
            <Avatar 
              variant="rounded"
              sx={{ 
                  width: 28, height: 28, mr: 1, borderRadius: '8px',
                  border: `1px solid rgba(16,185,129, 0.4)`,
                  bgcolor: 'rgba(16,185,129, 0.1)'
              }} 
            >
              <DynamicFeedIcon sx={{ color: '#10b981', fontSize: 16 }} />
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.1 }}>
              <Typography sx={{ 
                fontSize: '0.5rem', fontWeight: 800, color: '#fff', 
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                px: 0.6, py: 0.1, borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', width: 'fit-content'
              }}>
                UPDATES
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>
                Activity
              </Typography>
            </Box>
          </Box>

          {/* Manage CTA */}
          <Box 
            onClick={handleManageOpen}
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(18, 24, 20, 0.92)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              boxShadow: `0 4px 16px rgba(59,130,246, 0.15), 0 1px 3px rgba(0,0,0,0.08)`,
              border: `1px solid rgba(59,130,246, 0.12)`,
              px: 1.2,
              py: 0.8,
              cursor: 'pointer',
            }}
          >
            <Avatar 
              variant="rounded"
              sx={{ 
                  width: 28, height: 28, mr: 1, borderRadius: '8px',
                  border: `1px solid rgba(59,130,246, 0.4)`,
                  bgcolor: 'rgba(59,130,246, 0.1)'
              }} 
            >
              <BusinessIcon sx={{ color: '#3b82f6', fontSize: 16 }} />
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.1 }}>
              <Typography sx={{ 
                fontSize: '0.5rem', fontWeight: 800, color: '#fff', 
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
                px: 0.6, py: 0.1, borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', width: 'fit-content'
              }}>
                DASHBOARD
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>
                Manage
              </Typography>
            </Box>
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
        {/* Pulsing icon */}
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
          <GroupsIcon sx={{ fontSize: { xs: 20, md: 24 }, color: '#3b82f6' }} />
        </Box>

        {/* Label */}
        <Box sx={{ textAlign: { xs: 'left', md: 'center' } }}>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.8rem', md: '0.82rem' }, color: '#e2e8f0' }}>
            Join Org
          </Typography>
          <Typography sx={{ fontSize: '0.6rem', color: '#64748b', display: { xs: 'none', md: 'block' } }}>
            Find your team
          </Typography>
        </Box>

        {/* ─── CLEAR CTA IN THE MIDDLE (HERO CARD STYLE) — DESKTOP ─── */}
        <Box 
          onClick={(e) => handleDirectAction(e, 'join')}
          sx={{ 
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            background: 'rgba(18, 24, 20, 0.92)',
            backdropFilter: 'blur(20px)',
            borderRadius: '22px',
            boxShadow: `0 6px 28px rgba(16,185,129, 0.18), 0 1.5px 4px rgba(0,0,0,0.08)`,
            border: `1px solid rgba(16,185,129, 0.12)`,
            px: 1.5,
            py: 1.5,
            my: 'auto', // Pushes to vertical middle
            cursor: 'pointer',
            width: '100%',
            transition: 'box-shadow 0.3s ease, border 0.3s ease, transform 0.3s',
            '&:hover': {
              boxShadow: `0 12px 40px rgba(16,185,129, 0.28), 0 2px 6px rgba(0,0,0,0.1)`,
              border: `1px solid rgba(16,185,129, 0.25)`,
              transform: 'translateY(-2px)'
            }
          }}
        >
          <Avatar 
            variant="rounded"
            sx={{ 
                width: 38, height: 38, mr: 1.5, borderRadius: '13px',
                border: `2px solid rgba(16,185,129, 0.4)`,
                boxShadow: `0 0 12px rgba(16,185,129, 0.2)`,
                bgcolor: 'rgba(16,185,129, 0.1)'
            }} 
          >
            <GroupsIcon sx={{ color: '#10b981', fontSize: 20 }} />
          </Avatar>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ 
                fontSize: '0.55rem', fontWeight: 800, color: '#fff', 
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                px: 1, py: 0.3, borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.8px'
              }}>
                JOIN
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>
              Find an Org
            </Typography>
          </Box>
        </Box>

        {/* ─── CLEAR CTA IN THE MIDDLE (HERO CARD STYLE) — MOBILE ─── */}
        <Box 
          onClick={(e) => handleDirectAction(e, 'join')}
          sx={{ 
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            background: 'rgba(18, 24, 20, 0.92)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            boxShadow: `0 4px 16px rgba(16,185,129, 0.15), 0 1px 3px rgba(0,0,0,0.08)`,
            border: `1px solid rgba(16,185,129, 0.12)`,
            px: 1.2,
            py: 0.8,
            mx: 'auto', // Pushes to horizontal middle
            cursor: 'pointer',
          }}
        >
          <Avatar 
            variant="rounded"
            sx={{ 
                width: 28, height: 28, mr: 1, borderRadius: '8px',
                border: `1px solid rgba(16,185,129, 0.4)`,
                bgcolor: 'rgba(16,185,129, 0.1)'
            }} 
          >
            <GroupsIcon sx={{ color: '#10b981', fontSize: 16 }} />
          </Avatar>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.1 }}>
            <Typography sx={{ 
              fontSize: '0.5rem', fontWeight: 800, color: '#fff', 
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              px: 0.6, py: 0.1, borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', width: 'fit-content'
            }}>
              JOIN
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>
              Find Org
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <FlipContainer
      isFlipped={isFlipped}
      frontContent={
        !slug ? (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', borderRadius: '24px', border: '2px dashed #cbd5e1', p: 4, textAlign: 'center' }}>
            <GroupsIcon sx={{ fontSize: 64, color: '#3b82f6', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', mb: 1 }}>Unlock the Power of Teams</Typography>
            <Typography sx={{ color: '#64748b', mb: 4, maxWidth: 400, fontSize: '1.1rem' }}>
              Join an organization to collaborate with peers, unlock executive features, and build your reputation faster.
            </Typography>
            <Button variant="contained" size="large" onClick={() => { setNoOrgAction('join'); setIsFlipped(true); }} sx={{ bgcolor: '#3b82f6', borderRadius: '16px', fontWeight: 800, px: 6, py: 1.5, fontSize: '1.1rem', mb: 3 }}>
              Join an Organization
            </Button>
            <Button variant="text" onClick={() => { setNoOrgAction('create'); setIsFlipped(true); }} sx={{ color: '#64748b', fontWeight: 700, '&:hover': { color: '#0f172a' } }}>
              Or create a new organization
            </Button>
          </Box>
        ) : (
          <PublicOrgProfile slug={slug} tenant={tenant} onFlipRequest={() => setIsFlipped(true)} />
        )
      }
      backContent={
        <Paper elevation={0} sx={{ height: '100%', overflowY: 'auto', bgcolor: '#ffffff', borderRadius: 4, boxShadow: { xs: '0 8px 32px rgba(0,0,0,0.06)', md: '0 10px 40px rgba(0,0,0,0.04)' }, position: 'relative' }}>
          {!slug ? (
            noOrgAction === 'join' 
              ? <JoinOrgBackstage onClose={() => setIsFlipped(false)} onCreateOrg={() => setNoOrgAction('create')} />
              : <CreateOrgBackstage onClose={() => setIsFlipped(false)} />
          ) : (
            <OrgManageBackstage onClose={() => setIsFlipped(false)} />
          )}
        </Paper>
      }
    />
  );
}
