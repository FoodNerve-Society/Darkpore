"use client";

import React from 'react';
import { Box, Tooltip } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import BusinessIcon from '@mui/icons-material/Business';

interface VerificationBadgeProps {
  rank: number;
  type: 'user' | 'organization';
  orgLogoUrl?: string | null;
  orgName?: string | null;
  iconSize?: 'small' | 'medium' | 'large';
}

export default function VerificationBadge({ 
  rank, 
  type, 
  orgLogoUrl, 
  orgName,
  iconSize = 'small'
}: VerificationBadgeProps) {
  // Only rank 4 and above get verification marks
  if (rank < 4) return null;

  const sizeMap = {
    small: 16,
    medium: 20,
    large: 24
  };

  const pxSize = sizeMap[iconSize];

  // Business / Organization Verification
  if (type === 'organization') {
    return (
      <Tooltip title="Verified Organization" placement="top">
        <VerifiedIcon 
          sx={{ 
            color: '#f59e0b', // Distinct gold color for verified businesses
            fontSize: pxSize,
            display: 'inline-flex',
            verticalAlign: 'middle',
            ml: 0.5
          }} 
        />
      </Tooltip>
    );
  }

  // User Verification
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 0.5, gap: 0.5, verticalAlign: 'middle' }}>
      <Tooltip title="Verified Profile" placement="top">
        <VerifiedIcon 
          sx={{ 
            color: '#0ea5e9', // Sky blue for verified users
            fontSize: pxSize,
          }} 
        />
      </Tooltip>

      {/* Corporate Affiliation Badge (Like Twitter's square org logo) */}
      {orgLogoUrl && (
        <Tooltip title={`Affiliated with ${orgName || 'Organization'}`} placement="top">
          <Box
            component="img"
            src={orgLogoUrl}
            alt={orgName || "Organization"}
            sx={{
              width: pxSize * 0.9,
              height: pxSize * 0.9,
              borderRadius: '4px', // Square-ish with slightly rounded corners
              objectFit: 'cover',
              border: '1px solid rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.1)'
              }
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
}
