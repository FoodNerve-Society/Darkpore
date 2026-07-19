'use client';

import React from 'react';
import { IconButton, Tooltip, Box, keyframes } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useWikiOverlay } from '@/context/WikiOverlayContext';
import { useSociety } from '@/context/SocietyContext';
import { useRouter, useParams } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.3), 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255,255,255,0.4); }
  70% { box-shadow: 0 0 0 6px rgba(37, 99, 235, 0), 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255,255,255,0.4); }
  100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0), 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255,255,255,0.4); }
`;

interface WikiHotspotProps {
  id: string; // The exact string identifier used in code
  label?: string; // Pre-filled human readable label
  size?: 'small' | 'medium' | 'large';
  icon?: 'help' | 'book';
}

export default function WikiHotspot({ id, label, size = 'small', icon = 'help' }: WikiHotspotProps) {
  const { mappings, openWikiByHotspot, openRegisterModal } = useWikiOverlay();
  const { profile } = useSociety();

  // If no document is mapped to this hotspot
  if (!mappings[id]) {
    if (profile?.isAdmin) {
      return (
        <Box sx={{ display: 'inline-flex', ml: 1, verticalAlign: 'middle' }}>
          <Tooltip title="Unlinked Hotspot (Admins only)">
            <IconButton 
              size={size}
              onClick={(e) => {
                e.stopPropagation();
                openRegisterModal(id, label);
              }}
              sx={{ 
                color: '#fff', 
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                border: '1px dashed rgba(255, 255, 255, 0.6)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  color: '#fff',
                  borderColor: '#fff',
                  transform: 'scale(1.05)'
                },
                '& svg': {
                  filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.2))'
                }
              }}
            >
              <AddIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Box>
      );
    }
    return null;
  }

  const IconComponent = icon === 'help' ? HelpIcon : MenuBookIcon;

  return (
    <Box sx={{ display: 'inline-flex', ml: 1, verticalAlign: 'middle' }}>
      <Tooltip title="View Guide / SOP" placement="top">
        <IconButton 
          size={size}
          onClick={(e) => {
            e.stopPropagation();
            openWikiByHotspot(id);
          }}
          sx={{ 
            color: '#fff', 
            bgcolor: 'rgba(255, 255, 255, 0.35)',
            backdropFilter: 'blur(12px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: `${pulse} 2s infinite`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.5)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.5)',
              transform: 'scale(1.1)',
              animationPlayState: 'paused',
              color: '#fff',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.7)',
            },
            '& svg': {
              filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))'
            }
          }}
        >
          <IconComponent fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
