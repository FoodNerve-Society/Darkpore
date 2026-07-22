'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Avatar, Badge } from '@mui/material';
import FlipContainer from '@/app/modular-society/[tenant]/(authenticated)/components/shared/FlipContainer';
import OrgManageBackstage from './OrgManageBackstage';
import OrgFrontstage from './OrgFrontstage';
import CreateOrgBackstage from './CreateOrgBackstage';
import JoinOrgBackstage from './JoinOrgBackstage';
import OrgMiniCard from './OrgMiniCard';
import OrgSwitcherPills from './OrgSwitcherPills';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import GroupsIcon from '@mui/icons-material/Groups';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useSociety } from '@/context/SocietyContext';

interface Props {
  tenant: string;
  slug?: string | null;
  isActive: boolean;
  isCollapsed: boolean;
  onActivate: () => void;
}

export default function OrgCommandContainer({ tenant, isActive, isCollapsed, onActivate }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [noOrgAction, setNoOrgAction] = useState<'join' | 'create'>('join');
  const { profile, activeOrg, switchOrg } = useSociety();

  const organizations = profile?.organizations || [];
  const currentActiveOrg = activeOrg || organizations[0] || null;
  const currentSlug = currentActiveOrg?.slug || null;
  const hasOrgs = organizations.length > 0;

  const handleManageOpen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsFlipped(true);
    if (isCollapsed) onActivate();
  };

  const handleDirectAction = (e: React.MouseEvent, action: 'join' | 'create') => {
    e.stopPropagation();
    setNoOrgAction(action);
    setIsFlipped(true);
    if (isCollapsed) onActivate();
  };

  const handleOrgSelect = (orgId: string) => {
    switchOrg(orgId);
    if (isCollapsed) onActivate();
  };

  // ─── COLLAPSED STATE ───
  if (isCollapsed) {
    if (hasOrgs) {
      return (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#0f172a',
            color: '#fff',
            borderRadius: '20px',
            overflow: 'hidden',
            position: 'relative',
            p: { xs: 1, md: 2 },
          }}
        >
          {/* Ambient glow — desktop only */}
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
              position: 'absolute',
              bottom: '-20%',
              right: '-20%',
              width: '80%',
              height: '50%',
              bgcolor: '#3b82f6',
              opacity: 0.05,
              filter: 'blur(50px)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />

          {/* ─── DESKTOP MULTI-ORG STACK ─── */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              gap: 1.5,
              height: '100%',
              overflowY: 'auto',
              pr: 0.5,
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', tracking: '0.05em', px: 0.5 }}>
              Organizations ({organizations.length})
            </Typography>

            {organizations.map((org) => {
              const isSelected = currentActiveOrg?.id === org.id;

              return (
                <OrgMiniCard
                  key={org.id}
                  org={org}
                  isActive={isSelected}
                  onSelect={() => handleOrgSelect(org.id)}
                  onManage={() => handleManageOpen()}
                  tenant={tenant}
                />
              );
            })}

            {/* "+ JOIN / CREATE ORG" FOOTER CARD */}
            <Box
              onClick={(e) => handleDirectAction(e, 'join')}
              sx={{
                mt: 'auto',
                pt: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '14px',
                border: '1px dashed rgba(255, 255, 255, 0.15)',
                px: 2,
                py: 1.25,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(59, 130, 246, 0.12)',
                  borderColor: '#3b82f6',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '8px',
                    bgcolor: 'rgba(59, 130, 246, 0.2)',
                    color: '#3b82f6',
                  }}
                >
                  <AddIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1' }}>
                  Join / Create Org
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 800 }}>+</Typography>
            </Box>
          </Box>

          {/* ─── MOBILE STRIP VIEW (ACTIVE ORG AVATAR + BADGE) ─── */}
          <Box
            onClick={onActivate}
            sx={{
              display: { xs: 'flex', md: 'none' },
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Badge
              badgeContent={organizations.length > 1 ? `+${organizations.length - 1}` : 0}
              color="primary"
              sx={{
                '& .MuiBadge-badge': {
                  bgcolor: '#3b82f6',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.65rem',
                },
              }}
            >
              <Avatar
                src={currentActiveOrg?.logoUrl || undefined}
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: '#1e3a5f',
                  fontSize: 14,
                  fontWeight: 800,
                  border: '2px solid #3b82f6',
                }}
              >
                {(currentActiveOrg?.name || 'O').charAt(0).toUpperCase()}
              </Avatar>
            </Badge>
          </Box>
        </Box>
      );
    }

    // ─── NO ORG (COLLAPSED) ───
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
        <Box
          sx={{
            width: { xs: 36, md: 48 },
            height: { xs: 36, md: 48 },
            borderRadius: '50%',
            border: '2px dashed #3b82f650',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            mb: { xs: 0, md: 1.5 },
            animation: 'orgPulse 2s ease-in-out infinite',
            '@keyframes orgPulse': {
              '0%, 100%': { borderColor: '#3b82f630', transform: 'scale(1)' },
              '50%': { borderColor: '#3b82f680', transform: 'scale(1.06)' },
            },
          }}
        >
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

        {/* Desktop Buttons */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 1.5, width: '100%', my: 'auto' }}>
          <Box
            onClick={(e) => handleDirectAction(e, 'join')}
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
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.4)' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar variant="rounded" sx={{ width: 32, height: 32, borderRadius: '10px', bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                <GroupsIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>
                Join an Org
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 800 }}>→</Typography>
          </Box>

          <Box
            onClick={(e) => handleDirectAction(e, 'create')}
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
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.4)' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar variant="rounded" sx={{ width: 32, height: 32, borderRadius: '10px', bgcolor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
                <AddIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>
                Create Org
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.9rem', color: '#3b82f6', fontWeight: 800 }}>→</Typography>
          </Box>
        </Box>

        {/* Mobile Buttons */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, mx: 'auto' }}>
          <Box
            onClick={(e) => handleDirectAction(e, 'join')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(16px)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              px: 1.5,
              py: 0.8,
              cursor: 'pointer',
            }}
          >
            <Avatar variant="rounded" sx={{ width: 24, height: 24, mr: 1, borderRadius: '6px', bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
              <GroupsIcon sx={{ fontSize: 14 }} />
            </Avatar>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#f8fafc' }}>
              Join
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  // ─── EXPANDED STATE ───
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* MOBILE HORIZONTAL SWITCHER PILLS (ONLY IF HAS ORGS & EXPANDED) */}
      {hasOrgs && (
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 1 }}>
          <OrgSwitcherPills
            organizations={organizations}
            activeOrgId={currentActiveOrg?.id || null}
            onSwitch={(orgId) => switchOrg(orgId)}
            onJoinOrg={() => {
              setNoOrgAction('join');
              setIsFlipped(true);
            }}
          />
        </Box>
      )}

      <FlipContainer
        isFlipped={isFlipped}
        frontContent={
          !currentSlug ? (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#f8fafc',
                borderRadius: '24px',
                border: '2px dashed #cbd5e1',
                p: 4,
                textAlign: 'center',
              }}
            >
              <GroupsIcon sx={{ fontSize: 64, color: '#3b82f6', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', mb: 1 }}>
                Unlock the Power of Teams
              </Typography>
              <Typography sx={{ color: '#64748b', mb: 4, maxWidth: 400, fontSize: '1.1rem' }}>
                Join an organization to collaborate with peers, unlock executive features, and build your reputation faster.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  setNoOrgAction('join');
                  setIsFlipped(true);
                }}
                sx={{ bgcolor: '#3b82f6', borderRadius: '16px', fontWeight: 800, px: 6, py: 1.5, fontSize: '1.1rem', mb: 3 }}
              >
                Join an Organization
              </Button>
              <Button
                variant="text"
                onClick={() => {
                  setNoOrgAction('create');
                  setIsFlipped(true);
                }}
                sx={{ color: '#64748b', fontWeight: 700, '&:hover': { color: '#0f172a' } }}
              >
                Or create a new organization
              </Button>
            </Box>
          ) : (
            <OrgFrontstage slug={currentSlug} tenant={tenant} onFlipRequest={() => setIsFlipped(true)} />
          )
        }
        backContent={
          <Paper
            elevation={0}
            sx={{
              height: '100%',
              overflowY: 'auto',
              bgcolor: '#ffffff',
              borderRadius: 4,
              boxShadow: { xs: '0 8px 32px rgba(0,0,0,0.06)', md: '0 10px 40px rgba(0,0,0,0.04)' },
              position: 'relative',
            }}
          >
            {!currentSlug ? (
              noOrgAction === 'join' ? (
                <JoinOrgBackstage onClose={() => setIsFlipped(false)} onCreateOrg={() => setNoOrgAction('create')} />
              ) : (
                <CreateOrgBackstage onClose={() => setIsFlipped(false)} />
              )
            ) : (
              <OrgManageBackstage onClose={() => setIsFlipped(false)} />
            )}
          </Paper>
        }
      />
    </Box>
  );
}
