'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import FlipContainer from '@/app/modular-society/[tenant]/(authenticated)/components/shared/FlipContainer';
import EditProfileBackstage from './EditProfileBackstage';
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
  const [isFlipped, setIsFlipped] = useState(false);

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
          My Profile
        </Typography>
      </Box>
    );
  }

  return (
    <FlipContainer
      isFlipped={isFlipped}
      frontContent={
        <Paper elevation={0} sx={{ height: '100%', overflowY: 'auto', bgcolor: '#ffffff', borderRadius: 4, boxShadow: { xs: '0 8px 32px rgba(0,0,0,0.06)', md: '0 10px 40px rgba(0,0,0,0.04)' }, position: 'relative' }}>
          <UserSettingsBackstage onClose={() => setIsFlipped(true)} />
        </Paper>
      }
      backContent={
        <Paper elevation={0} sx={{ height: '100%', overflowY: 'auto', bgcolor: '#ffffff', borderRadius: 4, boxShadow: { xs: '0 8px 32px rgba(0,0,0,0.06)', md: '0 10px 40px rgba(0,0,0,0.04)' }, position: 'relative' }}>
          <EditProfileBackstage onClose={() => setIsFlipped(false)} />
        </Paper>
      }
    />
  );
}
