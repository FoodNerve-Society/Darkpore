'use client';

import React, { useEffect, useRef } from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Organization } from '@/context/SocietyContext';

interface OrgSwitcherPillsProps {
  organizations: Organization[];
  activeOrgId: string | null;
  onSwitch: (orgId: string) => void;
  onBack?: () => void;
}

export default function OrgSwitcherPills({
  organizations,
  activeOrgId,
  onSwitch,
  onBack,
}: OrgSwitcherPillsProps) {
  const pillsTrackRef = useRef<any>(null);
  const pillRefs = useRef<Record<string, any>>({});

  useEffect(() => {
    if (activeOrgId && pillsTrackRef.current) {
      const activeEl = pillRefs.current[activeOrgId];
      const container = pillsTrackRef.current;
      if (container && activeEl) {
        const timer = setTimeout(() => {
          const containerWidth = container.offsetWidth;
          const chipLeft = activeEl.offsetLeft;
          const chipWidth = activeEl.offsetWidth;
          container.scrollTo({
            left: chipLeft - containerWidth / 2 + chipWidth / 2,
            behavior: 'smooth',
          });
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [activeOrgId]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.8,
        p: 0.6,
        bgcolor: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '9999px',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        width: '100%',
      }}
    >
      {/* ── LEFT: BACK BUTTON TO WORKSPACES LIST ── */}
      {onBack && (
        <Box
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.7,
            px: 1.8,
            py: 0.7,
            borderRadius: '9999px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            bgcolor: '#f1f5f9',
            color: '#334155',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              bgcolor: '#0f172a',
              borderColor: '#0f172a',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
            },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 15 }} />
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
            Back
          </Typography>
        </Box>
      )}

      {/* Subtle Divider */}
      {onBack && (
        <Box sx={{ width: '1px', height: 20, bgcolor: '#e2e8f0', flexShrink: 0 }} />
      )}

      {/* ── CENTER: SCROLLABLE COMPANY PILLS (FOODNERVE CAREER STYLE) ── */}
      <Box
        ref={pillsTrackRef}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.8,
          overflowX: 'auto',
          flex: 1,
          minWidth: 0,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {organizations.map((org) => {
          const isActive = org.id === activeOrgId;
          const orgName = org.name || 'Org';

          return (
            <Box
              key={org.id}
              ref={(el) => {
                pillRefs.current[org.id] = el;
              }}
              onClick={() => onSwitch(org.id)}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.9,
                px: 1.8,
                py: 0.7,
                borderRadius: '9999px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                bgcolor: isActive ? '#0f172a' : 'transparent',
                color: isActive ? '#ffffff' : '#475569',
                boxShadow: isActive ? '0 4px 14px rgba(15, 23, 42, 0.25)' : 'none',
                '&:hover': {
                  bgcolor: isActive ? '#0f172a' : 'rgba(15, 23, 42, 0.06)',
                  color: isActive ? '#ffffff' : '#0f172a',
                },
              }}
            >
              <Avatar
                src={org.logoUrl || undefined}
                sx={{
                  width: 22,
                  height: 22,
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  bgcolor: isActive ? 'rgba(255, 255, 255, 0.25)' : '#e2e8f0',
                  color: isActive ? '#ffffff' : '#0f172a',
                }}
              >
                {orgName.charAt(0).toUpperCase()}
              </Avatar>
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 900 : 700,
                  letterSpacing: '-0.01em',
                }}
              >
                {orgName}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
