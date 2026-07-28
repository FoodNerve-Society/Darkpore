'use client';

import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';

export default function ABToggleBar({ currentView }: { currentView: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleToggle = (variant: 'a' | 'b') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', variant);
    router.push(`?${params.toString()}`);
  };

  const isA = currentView === 'a';

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        bgcolor: 'rgba(10, 15, 30, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        p: 0.6,
        borderRadius: '999px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        border: '1px solid rgba(255, 255, 255, 0.15)',
      }}
    >
      <Typography
        sx={{
          fontSize: '0.65rem',
          fontWeight: 900,
          color: 'rgba(255, 255, 255, 0.7)',
          letterSpacing: '0.1em',
          pl: 1.5,
          pr: 0.5,
          userSelect: 'none',
        }}
      >
        TYPE:
      </Typography>

      <Tooltip title="Variant A: Command Engine" arrow placement="top">
        <Box
          onClick={() => handleToggle('a')}
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            cursor: 'pointer',
            bgcolor: isA ? '#ffffff' : 'rgba(255,255,255,0.1)',
            color: isA ? '#0f172a' : 'rgba(255,255,255,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 900,
            boxShadow: isA ? '0 4px 14px rgba(0,0,0,0.25)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            userSelect: 'none',
            '&:hover': { bgcolor: isA ? '#ffffff' : 'rgba(255,255,255,0.25)', color: isA ? '#0f172a' : '#ffffff' },
          }}
        >
          A
        </Box>
      </Tooltip>

      <Tooltip title="Variant B: Editorial Magazine" arrow placement="top">
        <Box
          onClick={() => handleToggle('b')}
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            cursor: 'pointer',
            bgcolor: !isA ? '#16a34a' : 'rgba(255,255,255,0.1)',
            color: !isA ? '#ffffff' : 'rgba(255,255,255,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 900,
            boxShadow: !isA ? '0 4px 14px rgba(22, 163, 74, 0.4)' : 'none',
            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            userSelect: 'none',
            '&:hover': { bgcolor: !isA ? '#16a34a' : 'rgba(255,255,255,0.25)', color: '#ffffff' },
          }}
        >
          B
        </Box>
      </Tooltip>
    </Box>
  );
}


