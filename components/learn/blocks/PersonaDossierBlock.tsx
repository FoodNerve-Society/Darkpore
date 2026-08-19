import React from 'react';
import { Box, Typography, alpha, Avatar } from '@mui/material';
import { FormatQuote as QuoteIcon } from '@mui/icons-material';

export interface PersonaDossierBlockProps {
  content: {
    name?: string;
    roleAndLocation?: string;
    age?: string;
    monthlyTurnover?: string;
    bio?: string;
    fieldQuote?: string;
    avatarUrl?: string;
  };
  themeMode?: 'light' | 'dark';
  accentColor?: string;
}

export const PersonaDossierBlock: React.FC<PersonaDossierBlockProps> = ({
  content,
  themeMode = 'light',
  accentColor = '#ec4899'
}) => {
  const isDark = themeMode === 'dark';

  if (!content.name && !content.fieldQuote) return null;

  return (
    <Box sx={{
      my: 6,
      p: { xs: 3, md: 5 },
      borderRadius: '24px',
      bgcolor: isDark ? alpha(accentColor, 0.04) : alpha(accentColor, 0.02),
      border: '1px solid',
      borderColor: alpha(accentColor, 0.25),
      boxShadow: `0 12px 36px ${alpha(accentColor, 0.05)}`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Typography sx={{
        color: isDark ? '#fff' : '#0f172a',
        fontWeight: 900,
        fontSize: '1rem',
        mb: 3,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        fontFamily: 'var(--font-quicksand), Quicksand, sans-serif'
      }}>
        <Box sx={{ width: 8, height: 24, borderRadius: 4, bgcolor: accentColor }} />
        Ground Reality · Operator Dossier
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3.5, alignItems: 'center' }}>
        <Box sx={{ textAlign: 'center', flexShrink: 0 }}>
          <Avatar
            src={content.avatarUrl || ''}
            alt={content.name}
            sx={{ width: 88, height: 88, border: `3px solid ${accentColor}`, boxShadow: `0 6px 20px ${alpha(accentColor, 0.3)}`, mx: 'auto', mb: 1.5 }}
          />
          <Typography sx={{ fontWeight: 900, color: isDark ? '#fff' : '#0f172a', fontSize: '1.1rem' }}>
            {content.name}
          </Typography>
          <Typography sx={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
            {content.roleAndLocation} {content.age ? `· ${content.age} yrs` : ''}
          </Typography>
          {content.monthlyTurnover && (
            <Typography sx={{ color: accentColor, fontSize: '0.8rem', fontWeight: 800, mt: 0.5 }}>
              📊 {content.monthlyTurnover}
            </Typography>
          )}
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {content.fieldQuote && (
            <Box sx={{
              p: 2.5,
              borderRadius: '16px',
              bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#fff',
              border: `1px solid ${alpha(accentColor, 0.2)}`,
              position: 'relative'
            }}>
              <QuoteIcon sx={{ fontSize: 28, color: alpha(accentColor, 0.3), position: 'absolute', top: 10, right: 12 }} />
              <Typography sx={{ fontStyle: 'italic', color: isDark ? '#e2e8f0' : '#1e293b', lineHeight: 1.7, fontSize: '1rem', fontWeight: 600 }}>
                "{content.fieldQuote}"
              </Typography>
            </Box>
          )}

          {content.bio && (
            <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.85)' : '#475569', fontSize: '0.92rem', lineHeight: 1.65 }}>
              {content.bio}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};
