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
        p: 0.8,
        bgcolor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '18px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
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
                  width: 26,
                  height: 26,
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
              <Typography sx={{ fontSize: '0.78rem', fontWeight: isActive ? 800 : 600 }}>
                {orgName}
              </Typography>
            }
            onClick={() => onSwitch(org.id)}
            sx={{
              height: 38,
              px: 0.8,
              borderRadius: '14px',
              background: isActive
                ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                : 'rgba(255, 255, 255, 0.06)',
              color: '#ffffff',
              border: isActive
                ? '1px solid rgba(255, 255, 255, 0.3)'
                : '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: isActive ? '0 4px 16px rgba(59, 130, 246, 0.4)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                background: isActive
                  ? 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
                  : 'rgba(255, 255, 255, 0.12)',
              },
            }}
          />
        );
      })}

      {/* JOIN / CREATE NEW ORG PILL */}
      <Chip
        icon={<AddIcon sx={{ fontSize: '16px !important', color: '#10b981' }} />}
        label={
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}>
            + Join / Create
          </Typography>
        }
        onClick={onJoinOrg}
        sx={{
          height: 38,
          px: 0.8,
          borderRadius: '14px',
          bgcolor: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: 'rgba(16, 185, 129, 0.25)',
          },
        }}
      />
    </Box>
  );
}
