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
      <Tooltip title="Switch to Variant A: Command Center Engine" arrow placement="top">
        <Box
          onClick={() => handleToggle('a')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.8,
            py: 0.7,
            borderRadius: '999px',
            cursor: 'pointer',
            bgcolor: isA ? '#ffffff' : 'transparent',
            color: isA ? '#0f172a' : 'rgba(255,255,255,0.6)',
            boxShadow: isA ? '0 4px 14px rgba(0,0,0,0.25)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            userSelect: 'none',
            '&:hover': { color: isA ? '#0f172a' : '#ffffff' },
          }}
        >
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              bgcolor: isA ? '#0f172a' : 'rgba(255,255,255,0.15)',
              color: isA ? '#ffffff' : 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              fontWeight: 900,
            }}
          >
            A
          </Box>
          <Typography sx={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.04em' }}>
            COMMAND
          </Typography>
        </Box>
      </Tooltip>

      <Tooltip title="Switch to Variant B: Editorial Magazine" arrow placement="top">
        <Box
          onClick={() => handleToggle('b')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.8,
            py: 0.7,
            borderRadius: '999px',
            cursor: 'pointer',
            bgcolor: !isA ? '#16a34a' : 'transparent',
            color: !isA ? '#ffffff' : 'rgba(255,255,255,0.6)',
            boxShadow: !isA ? '0 4px 14px rgba(22, 163, 74, 0.4)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            userSelect: 'none',
            '&:hover': { color: '#ffffff' },
          }}
        >
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              bgcolor: !isA ? '#ffffff' : 'rgba(255,255,255,0.15)',
              color: !isA ? '#16a34a' : 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              fontWeight: 900,
            }}
          >
            B
          </Box>
          <Typography sx={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.04em' }}>
            EDITORIAL
          </Typography>
        </Box>
      </Tooltip>
    </Box>
  );
}


