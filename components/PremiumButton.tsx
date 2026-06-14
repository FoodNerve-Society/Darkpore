'use client';

import React from 'react';
import { Button, ButtonProps, alpha, useTheme } from '@mui/material';

export interface PremiumButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'filled' | 'outlined' | 'text';
  // Allow passing a custom base color. If none provided, defaults to theme primary.
  baseColor?: string; 
}

export default function PremiumButton({
  variant = 'filled',
  baseColor,
  color = 'primary', // Fallback for standard MUI color
  sx,
  children,
  ...props
}: PremiumButtonProps) {
  const theme = useTheme();

  // Determine the active color to use. 
  // If baseColor is explicitly passed (like '#1b5e20'), use it. 
  // Otherwise, fallback to the standard MUI color from theme.
  const activeColor = baseColor || (theme.palette[color as keyof typeof theme.palette] as any)?.main || theme.palette.primary.main;
  const safeColor = activeColor === 'white' ? '#ffffff' : activeColor;

  const baseStyles = {
    borderRadius: 100, // fully rounded pill
    textTransform: 'none',
    fontWeight: 800,
    fontSize: '0.9rem',
    letterSpacing: '0.3px',
    padding: '10px 24px',
    transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&:active': {
      transform: 'scale(0.97)',
    },
  };

  let variantStyles = {};

  if (variant === 'filled') {
    variantStyles = {
      bgcolor: safeColor,
      color: safeColor === '#ffffff' ? 'text.primary' : (theme.palette.getContrastText(safeColor) || 'white'),
      boxShadow: `0 4px 14px ${alpha(safeColor, 0.3)}`,
      '&:hover': {
        bgcolor: safeColor,
        boxShadow: `0 6px 20px ${alpha(safeColor, 0.4)}`,
        transform: 'translateY(-2px) scale(1.02)',
      },
      // Ripple effect adjustment for dark backgrounds
      '& .MuiTouchRipple-root': {
        color: safeColor === '#ffffff' ? 'rgba(0,0,0,0.3)' : 'white',
      }
    };
  } else if (variant === 'outlined') {
    variantStyles = {
      bgcolor: 'transparent',
      color: safeColor,
      border: `2px solid ${safeColor}`,
      boxShadow: 'none',
      '&:hover': {
        bgcolor: alpha(safeColor, 0.08),
        border: `2px solid ${safeColor}`,
        transform: 'translateY(-2px) scale(1.02)',
      },
    };
  } else if (variant === 'text') {
    variantStyles = {
      bgcolor: 'transparent',
      color: safeColor,
      boxShadow: 'none',
      '&:hover': {
        bgcolor: alpha(safeColor, 0.08),
        transform: 'scale(1.02)',
      },
    };
  }

  return (
    <Button
      disableElevation
      sx={[
        baseStyles,
        variantStyles,
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      {children}
    </Button>
  );
}
