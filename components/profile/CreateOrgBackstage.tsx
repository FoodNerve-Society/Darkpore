'use client';

import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Props {
  onClose?: () => void;
}

export default function CreateOrgBackstage({ onClose }: Props) {
  return (
    <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" fontWeight={800}>
          Create Organization
        </Typography>
        {onClose && (
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onClose} sx={{ borderRadius: '12px', fontWeight: 700 }}>
            Cancel
          </Button>
        )}
      </Box>

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">
          Organization Creation Form (Coming Soon)
        </Typography>
      </Box>
    </Box>
  );
}
