'use client';

import React from 'react';
import { Paper, PaperProps, alpha, Box, useTheme } from '@mui/material';

export interface PremiumCardProps extends Omit<PaperProps, 'variant'> {
  variant?: 'standard' | 'interactive' | 'media';
  baseColor?: string; // Optional overlay color
}

export default function PremiumCard({
  variant = 'standard',
  baseColor,
  sx,
  children,
  ...props
}: PremiumCardProps) {
  const theme = useTheme();
  
  const baseStyles = {
    borderRadius: 24, // M3 soft rounded corners
    overflow: 'hidden',
    position: 'relative',
    transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
  };

  let variantStyles = {};

  if (variant === 'standard') {
    variantStyles = {
      bgcolor: 'background.paper',
      boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
      border: '1px solid rgba(0,0,0,0.04)',
    };
  } else if (variant === 'interactive') {
    variantStyles = {
      bgcolor: 'background.paper',
      boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
      border: '1px solid rgba(0,0,0,0.05)',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: baseColor 
            ? `0 16px 40px ${alpha(baseColor, 0.2)}` 
            : '0 16px 40px rgba(0,0,0,0.1)',
        border: baseColor ? `1px solid ${alpha(baseColor, 0.3)}` : '1px solid rgba(0,0,0,0.1)',
      },
      '&:active': {
        transform: 'scale(0.98)',
      }
    };
  } else if (variant === 'media') {
    variantStyles = {
      bgcolor: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(24px)',
      boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: 'white', // Assume media cards are dark mode internally
    };
  }

  return (
    <Paper
      elevation={0}
      sx={[
        baseStyles,
        variantStyles,
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      {children}
    </Paper>
  );
}
