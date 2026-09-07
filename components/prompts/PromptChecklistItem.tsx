'use client';

import React from 'react';
import { Box, Typography, alpha } from '@mui/material';

export interface PromptChecklistItemProps {
  id: string;
  text: string;
  checked: boolean;
  onToggle: (id: string) => void;
  colorTheme?: string;
  isImportant?: boolean;
}

export function PromptChecklistItem({
  id,
  text,
  checked,
  onToggle,
  colorTheme = '#3b82f6',
  isImportant = false,
}: PromptChecklistItemProps) {
  return (
    <Box
      onClick={() => onToggle(id)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 1.25,
        borderRadius: '10px',
        cursor: 'pointer',
        bgcolor: checked
          ? 'rgba(16, 185, 129, 0.06)'
          : isImportant
          ? alpha(colorTheme, 0.04)
          : '#ffffff',
        border: checked
          ? '1px solid rgba(16, 185, 129, 0.3)'
          : isImportant
          ? `1px solid ${alpha(colorTheme, 0.35)}`
          : `1px solid ${alpha(colorTheme, 0.18)}`,
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        '&:hover': {
          bgcolor: checked ? 'rgba(16, 185, 129, 0.1)' : alpha(colorTheme, 0.06),
          transform: 'translateX(2px)',
        },
      }}
    >
      {/* Squircle Checkbox */}
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: '6px',
          border: '2px solid',
          borderColor: checked ? '#10b981' : colorTheme,
          bgcolor: checked ? '#10b981' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 1.25,
          flexShrink: 0,
          transition: 'all 0.2s ease',
        }}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M1 5L5 9L13 1"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </Box>

      {/* Item Text */}
      <Typography
        sx={{
          fontSize: '0.84rem',
          color: checked ? '#94a3b8' : '#1e293b',
          textDecoration: checked ? 'line-through' : 'none',
          fontWeight: checked ? 500 : 700,
          lineHeight: 1.45,
          transition: 'all 0.2s ease',
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}

export default PromptChecklistItem;
