// @ts-nocheck
'use client';

import React from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemAvatar, Avatar, ListItemText, Divider, Button, alpha } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExploreIcon from '@mui/icons-material/Explore';

// MOCK DATA FOR PHASE 1
const MOCK_GROUPS = [
  { id: '1', name: 'Unilag Innovators', type: 'School', members: 420, avatar: 'U' },
  { id: '2', name: 'AgriTech Hub', type: 'NGO', members: 156, avatar: 'A' },
  { id: '3', name: 'Lagos Tech Student Union', type: 'Cooperative', members: 890, avatar: 'L' },
];

export default function CommunityGroupSidebar({ activeGroupId, onGroupSelect }: { activeGroupId: string | null, onGroupSelect: (id: string | null) => void }) {
  return (
    <Box sx={{ width: 280, flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
      <Box sx={{ position: 'sticky', top: 100 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, mb: 2, px: 2 }}>
          My Groups
        </Typography>
        
        <List sx={{ px: 1 }}>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={activeGroupId === null}
              onClick={() => onGroupSelect(null)}
              sx={{
                borderRadius: 3,
                bgcolor: activeGroupId === null ? alpha('#10b981', 0.1) : 'transparent',
                '&.Mui-selected': { bgcolor: alpha('#10b981', 0.1) },
                '&.Mui-selected:hover': { bgcolor: alpha('#10b981', 0.15) },
              }}
            >
              <ListItemAvatar sx={{ minWidth: 40 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: activeGroupId === null ? '#10b981' : 'action.disabledBackground' }}>
                  <ExploreIcon sx={{ fontSize: 18 }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary="Global Feed" 
                slotProps={{ primary: { sx: { fontWeight: activeGroupId === null ? 800 : 600, fontSize: '0.9rem' } } }} 
              />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ my: 1, opacity: 0.5 }} />

          {MOCK_GROUPS.map((group) => {
            const isActive = activeGroupId === group.id;
            return (
              <ListItem key={group.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isActive}
                  onClick={() => onGroupSelect(group.id)}
                  sx={{
                    borderRadius: 3,
                    bgcolor: isActive ? alpha('#10b981', 0.1) : 'transparent',
                    '&.Mui-selected': { bgcolor: alpha('#10b981', 0.1) },
                    '&.Mui-selected:hover': { bgcolor: alpha('#10b981', 0.15) },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: isActive ? '#10b981' : '#e2e8f0', color: isActive ? 'white' : 'text.primary', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      {group.avatar}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={group.name} 
                    secondary={`${group.members} members`}
                    slotProps={{ 
                      primary: { sx: { fontWeight: isActive ? 800 : 600, fontSize: '0.85rem' }, noWrap: true },
                      secondary: { sx: { fontSize: '0.7rem', color: isActive ? '#10b981' : 'text.secondary' } }
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ mt: 2, px: 2 }}>
          <Button 
            fullWidth 
            variant="outlined" 
            startIcon={<AddIcon />}
            sx={{ 
              borderRadius: 3, 
              color: 'text.secondary', 
              borderColor: 'rgba(0,0,0,0.1)',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
            }}
          >
            Find or Create Group
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
