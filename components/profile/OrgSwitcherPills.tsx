'use client';

import React from 'react';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Organization } from '@/context/SocietyContext';

interface OrgSwitcherPillsProps {
  organizations: Organization[];
  activeOrgId: string | null;
  onSwitch: (orgId: string) => void;
  onJoinOrg: () => void;
}

export default function OrgSwitcherPills({
  organizations,
  activeOrgId,
  onSwitch,
  onJoinOrg,
}: OrgSwitcherPillsProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        overflowX: 'auto',
        pb: 1.5,
        pt: 0.5,
        px: 0.5,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {organizations.map((org) => {
        const isActive = org.id === activeOrgId || (!activeOrgId && organizations[0]?.id === org.id);
        const orgName = org.name || 'Org';

        return (
          <Chip
            key={org.id}
            avatar={
              <Avatar
                src={org.logoUrl || undefined}
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: 12,
                  fontWeight: 800,
                  bgcolor: isActive ? '#fff' : '#1e293b',
                  color: isActive ? '#0f172a' : '#fff',
                }}
              >
                {orgName.charAt(0).toUpperCase()}
              </Avatar>
            }
            label={
              <Typography sx={{ fontSize: '0.75rem', fontWeight: isActive ? 800 : 600 }}>
                {orgName}
              </Typography>
            }
            onClick={() => onSwitch(org.id)}
            sx={{
              height: 36,
              px: 1,
              borderRadius: '20px',
              bgcolor: isActive ? '#3b82f6' : 'rgba(255, 255, 255, 0.9)',
              color: isActive ? '#ffffff' : '#0f172a',
              border: isActive ? '1px solid #3b82f6' : '1px solid #cbd5e1',
              boxShadow: isActive ? '0 4px 14px rgba(59, 130, 246, 0.3)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: isActive ? '#2563eb' : '#f1f5f9',
              },
            }}
          />
        );
      })}

      {/* JOIN / CREATE NEW ORG PILL */}
      <Chip
        icon={<AddIcon sx={{ fontSize: '16px !important', color: '#3b82f6' }} />}
        label={
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6' }}>
            Join / Create
          </Typography>
        }
        onClick={onJoinOrg}
        variant="outlined"
        sx={{
          height: 36,
          px: 1,
          borderRadius: '20px',
          borderColor: '#3b82f6',
          bgcolor: 'rgba(59, 130, 246, 0.08)',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'rgba(59, 130, 246, 0.15)',
          },
        }}
      />
    </Box>
  );
}
