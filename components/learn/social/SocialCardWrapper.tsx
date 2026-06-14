import React, { forwardRef } from 'react';
import { Box, Typography } from '@mui/material';

type SocialCardWrapperProps = {
  children: React.ReactNode;
  authorName?: string;
  authorAvatarUrl?: string;
  tenantLogoUrl?: string;
  tenantName?: string;
  themeMode?: 'light' | 'dark';
};

export const SocialCardWrapper = forwardRef<HTMLDivElement, SocialCardWrapperProps>(
  ({ children, authorName, authorAvatarUrl, tenantLogoUrl, tenantName, themeMode = 'light' }, ref) => {
    const isDark = themeMode === 'dark';

    return (
      <Box
        ref={ref}
        sx={{
          width: 1080,
          height: 1080,
          bgcolor: isDark ? '#0f172a' : '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          p: 8,
          // We apply a subtle background pattern
          backgroundImage: isDark 
            ? 'radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)' 
            : 'radial-gradient(circle at 100% 0%, rgba(37, 99, 235, 0.05) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)',
        }}
      >
        {/* Header: Tenant Branding */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 'auto' }}>
          {tenantLogoUrl ? (
            <img src={tenantLogoUrl} alt={tenantName || 'Logo'} style={{ height: 64, width: 'auto', objectFit: 'contain' }} />
          ) : (
            <Box sx={{ width: 64, height: 64, bgcolor: isDark ? '#334155' : '#e2e8f0', borderRadius: '16px' }} />
          )}
          <Typography sx={{ color: isDark ? '#fff' : '#0f172a', fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.02em' }}>
            {tenantName || 'Modular Society'}
          </Typography>
        </Box>

        {/* Content Area - Scaled slightly to fit within the massive 1080 canvas */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', transform: 'scale(1.4)', transformOrigin: 'center center' }}>
            {children}
          </Box>
        </Box>

        {/* Footer: Author Branding & Call to Action */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {authorAvatarUrl && (
              <Box sx={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                <img src={authorAvatarUrl} alt={authorName || 'Author'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
            )}
            <Box>
              <Typography sx={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Expert Insight By
              </Typography>
              <Typography sx={{ color: isDark ? '#fff' : '#0f172a', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.01em' }}>
                {authorName || 'Anonymous'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Read the Full Briefing
            </Typography>
            <Typography sx={{ color: isDark ? '#60a5fa' : '#2563eb', fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.01em' }}>
              foodnerve.org
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }
);
SocialCardWrapper.displayName = 'SocialCardWrapper';
