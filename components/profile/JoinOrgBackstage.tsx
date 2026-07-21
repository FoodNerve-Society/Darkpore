'use client';

import React from 'react';
import { Box, Typography, Button, Paper, InputBase, alpha } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import GroupsIcon from '@mui/icons-material/Groups';

interface Props {
  onClose?: () => void;
  onCreateOrg?: () => void;
}

export default function JoinOrgBackstage({ onClose, onCreateOrg }: Props) {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
      {/* HEADER */}
      <Box sx={{ p: { xs: 2, md: 4 }, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
          Join Organization
        </Typography>
        {onClose && (
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onClose} sx={{ borderRadius: '12px', fontWeight: 700, borderColor: 'rgba(0,0,0,0.1)' }}>
            Back
          </Button>
        )}
      </Box>

      {/* CONTENT */}
      <Box sx={{ p: { xs: 2, md: 4 }, flex: 1, overflowY: 'auto' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ 
            width: 80, height: 80, borderRadius: '24px', 
            bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 2
          }}>
            <GroupsIcon sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
            Find Your Team
          </Typography>
          <Typography sx={{ color: '#64748b', maxWidth: 400, mx: 'auto' }}>
            Search for an existing organization to join, collaborate with peers, and unlock executive features.
          </Typography>
        </Box>

        {/* SEARCH BAR */}
        <Box sx={{ 
          display: 'flex', alignItems: 'center', gap: 2, 
          bgcolor: '#fff', borderRadius: '16px', p: 1, pl: 3,
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.03)',
          mb: 4
        }}>
          <SearchIcon sx={{ color: '#94a3b8' }} />
          <InputBase 
            placeholder="Search organizations by name or handle..." 
            sx={{ flex: 1, fontWeight: 600 }}
          />
          <Button variant="contained" sx={{ borderRadius: '12px', bgcolor: '#3b82f6', fontWeight: 700, px: 3 }}>
            Search
          </Button>
        </Box>

        {/* CREATE ORG PROMPT */}
        <Box sx={{ 
          bgcolor: '#fff', borderRadius: '20px', p: 3, 
          border: '1px dashed rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: 3,
          flexDirection: { xs: 'column', md: 'row' },
          textAlign: { xs: 'center', md: 'left' }
        }}>
          <Box sx={{ 
            width: 56, height: 56, borderRadius: '16px', 
            bgcolor: alpha('#10b981', 0.1), color: '#10b981', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <RocketLaunchIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', mb: 0.5 }}>
              Want to build your own empire?
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>
              Create a new organization from scratch and invite your team members.
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            onClick={onCreateOrg}
            startIcon={<BusinessIcon />}
            sx={{ borderRadius: '12px', fontWeight: 800, color: '#10b981', borderColor: alpha('#10b981', 0.3), '&:hover': { bgcolor: alpha('#10b981', 0.05), borderColor: '#10b981' } }}
          >
            Create Organization
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
