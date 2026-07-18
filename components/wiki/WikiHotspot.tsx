'use client';

import React from 'react';
import { IconButton, Tooltip, Box, keyframes } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useWikiOverlay } from '@/context/WikiOverlayContext';
import { useSociety } from '@/context/SocietyContext';
import { useRouter, useParams } from 'next/navigation';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
`;

interface WikiHotspotProps {
  id: string; // The exact string identifier used in code
  size?: 'small' | 'medium' | 'large';
  icon?: 'help' | 'book';
}

export default function WikiHotspot({ id, size = 'small', icon = 'help' }: WikiHotspotProps) {
  const { mappings, openWikiByHotspot } = useWikiOverlay();
  const { profile } = useSociety();
  const router = useRouter();
  const params = useParams();
  const tenant = params?.tenant as string;

  // If no document is mapped to this hotspot
  if (!mappings[id]) {
    if (profile?.isAdmin) {
      return (
        <Box sx={{ display: 'inline-flex', ml: 1, verticalAlign: 'middle' }}>
          <Tooltip title={`Unlinked Hotspot: ${id}. Click to link/create an SOP here.`} placement="top">
            <IconButton 
              size={size}
              onClick={() => {
                 router.push(`/modular-society/${tenant || 'society'}/profile/wiki?hotspot=${id}`);
              }}
              sx={{ 
                color: 'text.disabled', 
                border: '1px dashed grey',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.05)',
                  color: '#3b82f6',
                  borderColor: '#3b82f6'
                },
              }}
            >
              <AddCircleOutlineIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Box>
      );
    }
    return null;
  }

  const IconComponent = icon === 'help' ? HelpOutlineIcon : MenuBookIcon;

  return (
    <Box sx={{ display: 'inline-flex', ml: 1, verticalAlign: 'middle' }}>
      <Tooltip title="View Guide / SOP" placement="top">
        <IconButton 
          size={size}
          onClick={() => openWikiByHotspot(id)}
          sx={{ 
            color: '#3b82f6', 
            bgcolor: 'rgba(59, 130, 246, 0.1)',
            '&:hover': {
              bgcolor: 'rgba(59, 130, 246, 0.2)',
            },
            animation: `${pulse} 2s infinite`,
          }}
        >
          <IconComponent fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
