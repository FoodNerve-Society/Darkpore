'use client';

import React from 'react';
import { Chip, ChipProps, alpha, useTheme } from '@mui/material';

export interface PremiumChipProps extends Omit<ChipProps, 'variant'> {
  variant?: 'filled' | 'outlined' | 'glass';
  baseColor?: string;
  glow?: boolean;
}

export default function PremiumChip({
  variant = 'filled',
  baseColor,
  color = 'primary',
  glow = false,
  sx,
  ...props
}: PremiumChipProps) {
  const theme = useTheme();
  
  const activeColor = baseColor || (theme.palette[color as keyof typeof theme.palette] as any)?.main || theme.palette.primary.main;

  const baseStyles = {
    fontWeight: 800,
    letterSpacing: '0.5px',
    borderRadius: 100,
    transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
    '&:hover': {
      transform: 'translateY(-1px) scale(1.02)',
    }
  };

  let variantStyles = {};

  if (variant === 'filled') {
    variantStyles = {
      bgcolor: activeColor,
      color: theme.palette.getContrastText(activeColor) || 'white',
      border: 'none',
      boxShadow: glow ? `0 4px 12px ${alpha(activeColor, 0.4)}` : 'none',
      '&:hover': {
        bgcolor: activeColor,
        boxShadow: `0 6px 16px ${alpha(activeColor, 0.5)}`,
      }
    };
  } else if (variant === 'outlined') {
    variantStyles = {
      bgcolor: 'transparent',
      color: activeColor,
      border: `1px solid ${activeColor}`,
      boxShadow: glow ? `0 0 8px ${alpha(activeColor, 0.3)}` : 'none',
      '&:hover': {
        bgcolor: alpha(activeColor, 0.1),
        boxShadow: glow ? `0 0 12px ${alpha(activeColor, 0.5)}` : 'none',
      }
    };
  } else if (variant === 'glass') {
    variantStyles = {
      bgcolor: alpha(activeColor, 0.15),
      color: activeColor,
      backdropFilter: 'blur(12px)',
      border: `1px solid ${alpha(activeColor, 0.3)}`,
      boxShadow: glow ? `0 4px 12px ${alpha(activeColor, 0.2)}` : 'none',
      '&:hover': {
        bgcolor: alpha(activeColor, 0.25),
      }
    };
  }

  return (
    <Chip
      sx={{
        ...baseStyles,
        ...variantStyles,
        ...sx,
      }}
      {...props}
    />
  );
}
