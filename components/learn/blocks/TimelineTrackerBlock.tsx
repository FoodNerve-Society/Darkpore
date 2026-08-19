import React from 'react';
import { Box, Typography, alpha, Chip } from '@mui/material';

export interface TimelineTrackerBlockProps {
  content: {
    milestones?: Array<{
      dateOrYear: string;
      title: string;
      description?: string;
      status?: string;
    }>;
  };
  themeMode?: 'light' | 'dark';
  accentColor?: string;
}

export const TimelineTrackerBlock: React.FC<TimelineTrackerBlockProps> = ({
  content,
  themeMode = 'light',
  accentColor = '#3b82f6'
}) => {
  const isDark = themeMode === 'dark';
  const milestones = content.milestones || [];

  if (milestones.length === 0) return null;

  return (
    <Box sx={{
      my: 6,
      p: { xs: 3, md: 5 },
      borderRadius: '24px',
      bgcolor: isDark ? alpha(accentColor, 0.04) : alpha(accentColor, 0.02),
      border: '1px solid',
      borderColor: alpha(accentColor, 0.2),
      boxShadow: `0 12px 36px ${alpha(accentColor, 0.04)}`,
      position: 'relative'
    }}>
      <Typography sx={{
        color: isDark ? '#fff' : '#0f172a',
        fontWeight: 900,
        fontSize: '1rem',
        mb: 4,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        fontFamily: 'var(--font-quicksand), Quicksand, sans-serif'
      }}>
        <Box sx={{ width: 8, height: 24, borderRadius: 4, bgcolor: accentColor }} />
        Chronological Timeline & Roadmap
      </Typography>

      <Box sx={{ position: 'relative', pl: { xs: 2.5, md: 3.5 } }}>
        <Box sx={{
          position: 'absolute', left: 10, top: 12, bottom: 12,
          width: 3, bgcolor: alpha(accentColor, 0.3), borderRadius: 2
        }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          {milestones.map((m, idx) => (
            <Box key={idx} sx={{ position: 'relative', pl: 3.5 }}>
              <Box sx={{
                position: 'absolute', left: -2, top: 4,
                width: 14, height: 14, borderRadius: '50%',
                bgcolor: accentColor, border: '3px solid #fff',
                boxShadow: `0 0 10px ${accentColor}`
              }} />

              <Box sx={{
                p: 2.5, borderRadius: '16px',
                bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#fff',
                border: `1px solid ${alpha(accentColor, 0.15)}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  <Typography sx={{ fontWeight: 900, color: accentColor, fontSize: '0.88rem', letterSpacing: '0.05em' }}>
                    {m.dateOrYear}
                  </Typography>
                  {m.status && <Chip label={m.status} size="small" sx={{ bgcolor: alpha(accentColor, 0.1), color: accentColor, fontWeight: 800, fontSize: '0.7rem' }} />}
                </Box>
                <Typography sx={{ fontWeight: 800, color: isDark ? '#fff' : '#0f172a', fontSize: '1.05rem', mb: 0.75 }}>
                  {m.title}
                </Typography>
                {m.description && (
                  <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.85)' : '#475569', fontSize: '0.92rem', lineHeight: 1.6 }}>
                    {m.description}
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
