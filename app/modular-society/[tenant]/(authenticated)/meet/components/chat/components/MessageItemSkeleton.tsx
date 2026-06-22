"use client";

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

export default function MessageItemSkeleton({ isSender }: { isSender: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: isSender ? 'flex-end' : 'flex-start', marginY: 0.5, paddingX: 1 }}>
      <Paper elevation={1} sx={{ 
        padding: '8px 12px', 
        borderRadius: '18px', 
        borderTopLeftRadius: isSender ? '18px' : '4px', 
        borderTopRightRadius: isSender ? '4px' : '18px', 
        width: '150px', 
        height: '40px',
        backgroundColor: isSender ? '#410E0B' : '#FFFFFF', 
        opacity: 0.5 
      }} />
    </Box>
  );
}
