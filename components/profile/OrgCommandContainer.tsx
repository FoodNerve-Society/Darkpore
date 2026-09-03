'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Avatar, Badge, Dialog, Chip } from '@mui/material';
import OrgFrontstage from './OrgFrontstage';
import CreateOrgBackstage from './CreateOrgBackstage';
import JoinOrgBackstage from './JoinOrgBackstage';
import OrgMiniCard from './OrgMiniCard';
import OrgSwitcherPills from './OrgSwitcherPills';
import AddIcon from '@mui/icons-material/Add';
import GroupsIcon from '@mui/icons-material/Groups';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useSociety } from '@/context/SocietyContext';

interface Props {
  tenant: string;
  slug?: string | null;
  isActive: boolean;
  isCollapsed: boolean;
  onActivate: () => void;
}

export default function OrgCommandContainer({ tenant, slug, isActive, isCollapsed, onActivate }: Props) {
  const [noOrgModal, setNoOrgModal] = useState<'join' | 'create' | null>(null);
  const [initialBlock, setInitialBlock] = useState<
    'talent' | 'roster' | 'compliance' | 'governance' | 'activity' | undefined
  >(undefined);
  const { profile, activeOrg, switchOrg } = useSociety();

  const organizations = profile?.organizations || [];
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(
    slug ? (organizations.find((o) => o.slug === slug)?.id || null) : null
  );

  const currentOrg = selectedOrgId
    ? organizations.find((o) => o.id === selectedOrgId) || null
    : null;
  const currentActiveOrg = currentOrg || activeOrg || organizations[0] || null;
  const currentSlug = currentOrg?.slug || null;
  const hasOrgs = organizations.length > 0;

  const handleManageOpen = (block?: 'talent' | 'roster' | 'compliance' | 'governance' | 'activity', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setInitialBlock(block || 'roster');
    if (isCollapsed) onActivate();
  };

  const handleDirectAction = (e: React.MouseEvent, action: 'join' | 'create') => {
    e.stopPropagation();
    setNoOrgModal(action);
    if (isCollapsed) onActivate();
  };

  const handleOrgSelect = (orgId: string) => {
    setSelectedOrgId(orgId);
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

          {/* ─── MOBILE DETAILED STRIP CARD ─── */}
          <Box
            onClick={onActivate}
            sx={{
              display: { xs: 'flex', md: 'none' },
              height: '100%',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(16px)',
              borderRadius: '16px',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              px: 1.5,
              py: 1,
              cursor: 'pointer',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, flex: 1 }}>
              <Badge
                badgeContent={organizations.length > 1 ? `+${organizations.length - 1}` : 0}
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    bgcolor: '#3b82f6',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.6rem',
                  },
                }}
              >
                <Avatar
                  src={currentActiveOrg?.logoUrl || undefined}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: '#1e3a5f',
                    fontSize: 14,
                    fontWeight: 800,
                    border: '2px solid #3b82f6',
                    flexShrink: 0,
                  }}
                >
                  {(currentActiveOrg?.name || 'O').charAt(0).toUpperCase()}
                </Avatar>
              </Badge>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      color: '#f8fafc',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {currentActiveOrg?.name || 'Organization'}
                  </Typography>
                  {currentActiveOrg?.verified && (
                    <Typography sx={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 800 }}>✓</Typography>
                  )}
                </Box>
                <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentActiveOrg?.role || 'Member'} • {currentActiveOrg?.department || 'General'}
                </Typography>
              </Box>
            </Box>

            <Typography sx={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 800, ml: 1 }}>→</Typography>
          </Box>
        </Box>
      );
    }

    // ─── NO ORG (COLLAPSED) ───
    return (
      <Box
        onClick={() => { setNoOrgModal('join'); onActivate(); }}
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

  // ─── EXPANDED STATE (MODULAR BLOCKS, ZERO 3D FLIPPING) ───
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {!hasOrgs ? (
        <Box
          sx={{
            height: '100%',
            overflowY: 'auto',
            p: { xs: 2.5, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.85)',
              boxShadow: '0 12px 40px -8px rgba(15, 23, 42, 0.05)',
              maxWidth: 560,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '20px',
                bgcolor: 'rgba(245, 158, 11, 0.12)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2.5,
              }}
            >
              <GroupsIcon sx={{ fontSize: 38 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', mb: 1 }}>
              Unlock Corporate Workspaces
            </Typography>
            <Typography sx={{ color: '#64748b', mb: 3.5, fontSize: '0.95rem', lineHeight: 1.6 }}>
              Join an existing organization to collaborate with peers, or register a new CAC corporate entity to establish your brand across the Food Nerve Network.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={() => setNoOrgModal('join')}
                sx={{
                  bgcolor: '#0f172a',
                  color: '#fff',
                  borderRadius: '12px',
                  fontWeight: 800,
                  px: 3,
                  py: 1.2,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#1e293b' },
                }}
              >
                Search Directory & Join
              </Button>
              <Button
                variant="outlined"
                onClick={() => setNoOrgModal('create')}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 800,
                  borderColor: '#cbd5e1',
                  color: '#0f172a',
                  px: 3,
                  py: 1.2,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
                }}
              >
                Register New Organization
              </Button>
            </Box>
          </Paper>
        </Box>
      ) : !selectedOrgId || !currentSlug ? (
        /* ─── ORGANIZATIONS DIRECTORY LIST (CLEAN, MINIMAL, ZERO TAB ON TOP) ─── */
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            p: { xs: 2, md: 3 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            position: 'relative',
          }}
        >
          {/* Minimal Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.1rem', md: '1.25rem' }, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Workspaces
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748b', mt: 0.2 }}>
                Select an organization to open its workspace
              </Typography>
            </Box>
          </Box>

          {/* Minimal Org Cards Stack */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {organizations.map((org) => {
              const isPartner = org.verified || Boolean((org as any).rank && (org as any).rank >= 4);
              return (
                <Paper
                  key={org.id}
                  elevation={0}
                  onClick={() => {
                    setSelectedOrgId(org.id);
                    switchOrg(org.id);
                    if (!isActive) onActivate();
                  }}
                  sx={{
                    p: 1.75,
                    borderRadius: '16px',
                    bgcolor: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(226, 232, 240, 0.85)',
                    boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    '&:hover': {
                      bgcolor: '#ffffff',
                      borderColor: '#cbd5e1',
                      boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.08)',
                      transform: 'translateY(-1px)',
                      '& .arrow-btn': {
                        bgcolor: '#0f172a',
                        color: '#ffffff',
                        transform: 'translateX(2px)',
                      },
                    },
                  }}
                >
                  {/* Left: Avatar + Identity */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, minWidth: 0 }}>
                    <Avatar
                      src={org.logoUrl}
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        bgcolor: '#0f172a',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '1rem',
                        border: `1.5px solid ${isPartner ? '#10b981' : '#e2e8f0'}`,
                        flexShrink: 0,
                      }}
                    >
                      {org.name.charAt(0).toUpperCase()}
                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Typography
                          noWrap
                          sx={{
                            fontWeight: 800,
                            color: '#0f172a',
                            fontSize: '0.94rem',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {org.name}
                        </Typography>
                        {isPartner && (
                          <Box
                            sx={{
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              bgcolor: '#10b981',
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Box>

                      <Typography
                        noWrap
                        sx={{
                          fontSize: '0.76rem',
                          color: '#64748b',
                          mt: 0.15,
                        }}
                      >
                        @{org.slug} • <span style={{ textTransform: 'capitalize' }}>{org.role || 'Member'}</span>{isPartner ? ' • Partner' : ''}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Right: Minimal Arrow Action */}
                  <Box
                    className="arrow-btn"
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: '10px',
                      bgcolor: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      flexShrink: 0,
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <ArrowForwardIcon sx={{ fontSize: 16 }} />
                  </Box>
                </Paper>
              );
            })}

            {/* ── "+ REGISTER OR JOIN ANOTHER ORGANIZATION" AT THE BOTTOM ── */}
            <Paper
              elevation={0}
              onClick={() => setNoOrgModal('join')}
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                border: '1.5px dashed #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  bgcolor: '#ffffff',
                  borderColor: '#0f172a',
                  boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.08)',
                  '& .join-chip': {
                    bgcolor: '#0f172a',
                    color: '#ffffff',
                  },
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    bgcolor: 'rgba(15, 23, 42, 0.06)',
                    color: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AddIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                    Register or Join Another Organization
                  </Typography>
                  <Typography sx={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Connect to corporate partners or register a new CAC entity
                  </Typography>
                </Box>
              </Box>
              <Chip
                className="join-chip"
                label="+ Add Workspace"
                size="small"
                sx={{
                  bgcolor: '#f1f5f9',
                  color: '#0f172a',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                }}
              />
            </Paper>
          </Box>
        </Box>
      ) : (
        /* ─── ACTIVE ORG WORKSPACE (TOP SWITCHER TAB WITH BACK & CAREER-STYLE PILLS) ─── */
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ mb: 1.5, flexShrink: 0 }}>
            <OrgSwitcherPills
              organizations={organizations}
              activeOrgId={selectedOrgId}
              onBack={() => setSelectedOrgId(null)}
              onSwitch={(orgId) => {
                setSelectedOrgId(orgId);
                switchOrg(orgId);
              }}
            />
          </Box>

          <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <OrgFrontstage
              slug={currentSlug}
              tenant={tenant}
              initialBlock={initialBlock}
            />
          </Box>
        </Box>
      )}

      {/* ZERO-ORG ACTION MODAL (JOIN / CREATE DIALOG) */}
      <Dialog
        open={Boolean(noOrgModal)}
        onClose={() => setNoOrgModal(null)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: { xs: '16px', md: '24px' },
              bgcolor: '#f8fafc',
              overflow: 'hidden',
              width: { xs: '96vw', md: '80vw' },
              maxWidth: '850px !important',
              height: { xs: '90vh', md: '80vh' },
              maxHeight: '90vh !important',
              border: '1px solid rgba(226, 232, 240, 0.9)',
            },
          },
        }}
      >
        {noOrgModal === 'join' ? (
          <JoinOrgBackstage
            onClose={() => setNoOrgModal(null)}
            onCreateOrg={() => setNoOrgModal('create')}
          />
        ) : (
          <CreateOrgBackstage onClose={() => setNoOrgModal(null)} />
        )}
      </Dialog>
    </Box>
  );
}
