'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import PremiumSwitch from '@/components/PremiumSwitch';

export default function ABToggleBar({ currentView }: { currentView: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isExplore = currentView === 'b';

  const handleToggle = (e: { target: { checked: boolean } }) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', e.target.checked ? 'b' : 'a');
    router.push(`?${params.toString()}`);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        bgcolor: 'rgba(10, 15, 30, 0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        py: 1,
        px: 2,
        borderRadius: '999px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Active View Label */}
      <Typography
        sx={{
          fontFamily: 'var(--font-quicksand)',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '0.02em',
          userSelect: 'none',
        }}
      >
        {isExplore ? 'Explore' : 'Discover'}
      </Typography>

      {/* PremiumSwitch Toggle */}
      <PremiumSwitch
        colorTheme="#10b981"
        checked={isExplore}
        onChange={handleToggle}
        size="small"
      />
    </Box>
  );
}
