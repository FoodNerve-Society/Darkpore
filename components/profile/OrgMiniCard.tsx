'use client';

import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import { Organization } from '@/context/SocietyContext';

interface OrgMiniCardProps {
  org: Organization;
  isActive: boolean;
  onSelect: () => void;
  onManage: () => void;
  tenant: string;
}

export default function OrgMiniCard({ org, isActive, onSelect, onManage, tenant }: OrgMiniCardProps) {
  const orgName = org.name || 'Organization';
  const orgRole = org.role || 'Member';
  const isVerified = org.verified || false;

  return (
    <Box
      onClick={onSelect}
      sx={{
        width: '100%',
        bgcolor: isActive ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(16px)',
        borderRadius: '16px',
        border: isActive
          ? '1px solid rgba(59, 130, 246, 0.6)'
          : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isActive ? '0 0 24px rgba(59, 130, 246, 0.25)' : 'none',
        p: 1.5,
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        '&:hover': {
          bgcolor: 'rgba(30, 41, 59, 0.8)',
          borderColor: isActive ? 'rgba(59, 130, 246, 0.8)' : 'rgba(255, 255, 255, 0.2)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {/* LOGO */}
        <Avatar
          src={org.logoUrl || undefined}
          sx={{
            width: 36,
            height: 36,
            bgcolor: '#1e3a5f',
            fontSize: 14,
            fontWeight: 800,
            border: isActive ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
            flexShrink: 0,
          }}
        >
          {orgName.charAt(0).toUpperCase()}
        </Avatar>

        {/* INFO */}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              sx={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#f8fafc',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {orgName}
            </Typography>
            {isVerified && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  bgcolor: 'rgba(16, 185, 129, 0.2)',
                  borderRadius: '4px',
                  px: 0.5,
                  py: 0.2,
                }}
              >
                <Typography sx={{ fontSize: '0.6rem', color: '#10b981', fontWeight: 800 }}>✓</Typography>
              </Box>
            )}
          </Box>
          <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'capitalize' }}>
            {orgRole}
          </Typography>
        </Box>

        {/* ARROW OR ACTIVE BADGE */}
        {isActive ? (
          <Typography sx={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 800 }}>→</Typography>
        ) : (
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>•</Typography>
        )}
      </Box>

      {/* ACTION MICRO-BUTTONS WHEN ACTIVE */}
      {isActive && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mt: 1.25,
            pt: 1,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Box
            onClick={(e) => {
              e.stopPropagation();
              onManage();
            }}
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.8,
              py: 0.6,
              px: 1,
              bgcolor: 'rgba(59, 130, 246, 0.15)',
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.3)' },
            }}
          >
            <BusinessIcon sx={{ fontSize: 13, color: '#3b82f6' }} />
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#f8fafc' }}>
              Dashboard
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
