import React from 'react';
import { Box, Typography, alpha, Chip } from '@mui/material';
import { CheckCircleOutlined as CheckIcon } from '@mui/icons-material';

export interface ProtocolStepsBlockProps {
  content: {
    steps?: Array<{
      stepNumber?: number;
      title: string;
      role?: string;
      timeWindow?: string;
      description?: string;
      checklist?: string[];
    }>;
  };
  themeMode?: 'light' | 'dark';
  accentColor?: string;
}

export const ProtocolStepsBlock: React.FC<ProtocolStepsBlockProps> = ({
  content,
  themeMode = 'light',
  accentColor = '#f59e0b'
}) => {
  const isDark = themeMode === 'dark';
  const steps = content.steps || [];

  if (steps.length === 0) return null;

  return (
    <Box sx={{
      my: 6,
      p: { xs: 3, md: 5 },
      borderRadius: '24px',
      bgcolor: isDark ? alpha(accentColor, 0.03) : alpha(accentColor, 0.02),
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
        Operator Playbook · Step-by-Step SOP Protocol
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {steps.map((st, idx) => (
          <Box key={idx} sx={{
            p: 3,
            borderRadius: '18px',
            bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#fff',
            border: `1px solid ${alpha(accentColor, 0.15)}`,
            boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 32, height: 32, borderRadius: '10px',
                  bgcolor: accentColor, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '0.9rem'
                }}>
                  {st.stepNumber || idx + 1}
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: isDark ? '#fff' : '#0f172a' }}>
                  {st.title}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {st.role && <Chip label={st.role} size="small" sx={{ bgcolor: alpha(accentColor, 0.12), color: accentColor, fontWeight: 700, fontSize: '0.72rem' }} />}
                {st.timeWindow && <Chip label={st.timeWindow} size="small" variant="outlined" sx={{ borderColor: alpha(accentColor, 0.3), color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.72rem' }} />}
              </Box>
            </Box>

            {st.description && (
              <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.85)' : '#475569', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {st.description}
              </Typography>
            )}

            {Array.isArray(st.checklist) && st.checklist.filter(Boolean).length > 0 && (
              <Box sx={{
                p: 2, borderRadius: '12px', bgcolor: isDark ? 'rgba(30, 41, 59, 0.4)' : alpha(accentColor, 0.04),
                display: 'flex', flexDirection: 'column', gap: 1
              }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Execution Checklist
                </Typography>
                {st.checklist.filter(Boolean).map((chk, cIdx) => (
                  <Box key={cIdx} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <CheckIcon sx={{ fontSize: 16, color: accentColor }} />
                    <Typography sx={{ fontSize: '0.88rem', color: isDark ? '#e2e8f0' : '#1e293b', fontWeight: 600 }}>
                      {chk}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};
