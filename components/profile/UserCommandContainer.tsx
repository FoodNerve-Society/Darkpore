'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import FlipContainer from '@/components/shared/FlipContainer';
import PublicUserProfile from './PublicUserProfile';
import UserSettingsBackstage from './UserSettingsBackstage';
import PersonIcon from '@mui/icons-material/Person';

interface Props {
  tenant: string;
  username: string;
  isActive: boolean;
  isCollapsed: boolean;
  onActivate: () => void;
}

export default function UserCommandContainer({ tenant, username, isActive, isCollapsed, onActivate }: Props) {
  if (isCollapsed) {
    return (
      <Box
        onClick={onActivate}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#1e293b',
          color: '#fff',
          cursor: 'pointer',
          borderRadius: '24px',
          transition: 'all 0.2s',
          '&:hover': { bgcolor: '#0f172a' },
          overflow: 'hidden'
        }}
      >
        <PersonIcon sx={{ fontSize: 32, mb: 1, opacity: 0.8 }} />
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
          Profile Settings
        </Typography>
      </Box>
    );
  }

  return (
    <FlipContainer
      isFlipped={isActive}
      frontContent={<PublicUserProfile username={username} tenant={tenant} onFlipRequest={onActivate} />}
      backContent={
        <Box sx={{ height: '100%', overflowY: 'auto', bgcolor: '#f8fafc', borderRadius: '24px', position: 'relative' }}>
          <UserSettingsBackstage onClose={() => onActivate()} />
        </Box>
      }
    />
  );
}
