"use client";

import React, { FC, ReactNode } from 'react';
import { Box, Typography, Breadcrumbs, IconButton } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Link from 'next/link';
import { getActiveTheme } from './NavThemes';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AppPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: ReactNode; // e.g., a primary button
}

const AppPageHeader: FC<AppPageHeaderProps> = ({ title, subtitle, breadcrumbs, action }) => {
  const pathname = usePathname();
  const activeTheme = getActiveTheme(pathname);

  return (
    <Box 
      sx={{ 
        position: 'sticky',
        top: 0,
        zIndex: 100,
        pt: 3,
        pb: 2,
        px: { xs: 2, md: 4 }, // Padding aligns with page container
        mx: { xs: -2, md: -4 }, // Negative margin pulls it to edge of container
        mb: 4,
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,0,0,0.03)',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 1, '& .MuiBreadcrumbs-separator': { mx: 0.5, color: 'text.secondary' } }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            if (isLast || !crumb.href) {
              return (
                <Typography key={index} variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                  {crumb.label}
                </Typography>
              );
            }

            return (
              <Link key={index} href={crumb.href} passHref style={{ textDecoration: 'none' }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ '&:hover': { color: activeTheme.main, textDecoration: 'underline' } }}
                >
                  {crumb.label}
                </Typography>
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      {/* Header Content */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 900,
              mb: subtitle ? 0.5 : 0,
              color: '#0f2414',
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" sx={{ color: 'rgba(15, 36, 20, 0.6)', fontWeight: 500, letterSpacing: '-0.01em' }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Primary Action Button (e.g. "Create New", "Filter") */}
        {action && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {action}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AppPageHeader;
