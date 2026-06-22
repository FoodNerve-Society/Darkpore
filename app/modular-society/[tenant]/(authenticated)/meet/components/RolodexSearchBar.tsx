// @ts-nocheck
'use client';

import React from 'react';
import { Box, InputBase, alpha } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function RolodexSearchBarFront({ onFocus }: { onFocus: () => void }) {
  return (
    <Box sx={{ width: '100%' }}>
      <Box
        onClick={onFocus}
        sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.75)',
          borderRadius: '50px',
          px: 2,
          py: 0.6,
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          border: '1px solid rgba(255,255,255,0.6)',
          backdropFilter: 'blur(20px)',
          cursor: 'text',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            transform: 'translateY(-1px)'
          }
        }}
      >
        <SearchIcon sx={{ color: '#6366f1', mr: 1, fontSize: '1.1rem' }} />
        <InputBase
          placeholder="Search the Rolodex..."
          readOnly
          onFocus={onFocus}
          sx={{ 
            flex: 1, 
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'text',
            color: '#1e293b',
            '& input::placeholder': {
              color: '#64748b',
              opacity: 0.9
            }
          }}
        />
      </Box>
    </Box>
  );
}
