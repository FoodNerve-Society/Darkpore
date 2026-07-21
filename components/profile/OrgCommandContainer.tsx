'use client';

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import FlipContainer from '@/components/shared/FlipContainer';
import PublicOrgProfile from './PublicOrgProfile';
import OrgManageBackstage from './OrgManageBackstage';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';

interface Props {
  tenant: string;
  slug: string | null;
  isActive: boolean;
  isCollapsed: boolean;
  onActivate: () => void;
}

export default function OrgCommandContainer({ tenant, slug, isActive, isCollapsed, onActivate }: Props) {
  if (isCollapsed) {
    return (
      <Box
        onClick={slug ? onActivate : undefined}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#1e293b',
          color: '#fff',
          cursor: slug ? 'pointer' : 'default',
          borderRadius: '24px',
          transition: 'all 0.2s',
          '&:hover': { bgcolor: slug ? '#0f172a' : '#1e293b' },
          overflow: 'hidden'
        }}
      >
        <BusinessIcon sx={{ fontSize: 32, mb: 1, opacity: 0.8 }} />
        <Typography
          sx={{
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            writingMode: { xs: 'horizontal-tb', md: 'vertical-rl' },
            transform: { xs: 'none', md: 'rotate(180deg)' },
            whiteSpace: 'nowrap',
            opacity: 0.8
          }}
        >
          {slug ? 'Org Dashboard' : 'No Active Org'}
        </Typography>
      </Box>
    );
  }

  if (!slug) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', borderRadius: '24px', border: '2px dashed #cbd5e1', p: 4, textAlign: 'center' }}>
        <BusinessIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>Build Your Empire</Typography>
        <Typography sx={{ color: '#64748b', mb: 4, maxWidth: 300 }}>You are not currently acting on behalf of an organization.</Typography>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: '#3b82f6', borderRadius: '12px', fontWeight: 700 }}>
          Create Organization
        </Button>
      </Box>
    );
  }

  return (
    <FlipContainer
      isFlipped={isActive}
      frontContent={<PublicOrgProfile slug={slug} tenant={tenant} onFlipRequest={onActivate} />}
      backContent={
        <Box sx={{ height: '100%', overflowY: 'auto', bgcolor: '#f8fafc', borderRadius: '24px', position: 'relative' }}>
          <OrgManageBackstage onClose={() => onActivate()} />
        </Box>
      }
    />
  );
}
