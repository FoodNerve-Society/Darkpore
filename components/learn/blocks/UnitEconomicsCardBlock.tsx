import React from 'react';
import { Box, Typography, alpha } from '@mui/material';

export interface UnitEconomicsCardBlockProps {
  content: {
    tam?: string;
    targetIrr?: string;
    ticketSize?: string;
    paybackPeriod?: string;
    grossMargin?: string;
    primaryRisk?: string;
    dealThesis?: string;
  };
  themeMode?: 'light' | 'dark';
  accentColor?: string;
}

export const UnitEconomicsCardBlock: React.FC<UnitEconomicsCardBlockProps> = ({
  content,
  themeMode = 'light',
  accentColor = '#10b981'
}) => {
  const isDark = themeMode === 'dark';

  const metrics = [
    { label: 'Addressable TAM', val: content.tam, color: '#3b82f6' },
    { label: 'Target IRR', val: content.targetIrr, color: '#10b981' },
    { label: 'Ticket / Deal Size', val: content.ticketSize, color: '#8b5cf6' },
    { label: 'Target Gross Margin', val: content.grossMargin, color: '#06b6d4' },
    { label: 'Payback Period', val: content.paybackPeriod, color: '#f59e0b' },
    { label: 'Primary Risk Hedge', val: content.primaryRisk, color: '#ef4444' },
  ].filter(m => !!m.val);

  if (metrics.length === 0 && !content.dealThesis) return null;

  return (
    <Box sx={{
      my: 6,
      p: { xs: 3, md: 5 },
      borderRadius: '24px',
      bgcolor: isDark ? 'rgba(15, 23, 42, 0.7)' : '#f8fafc',
      border: '1px solid',
      borderColor: alpha(accentColor, 0.25),
      boxShadow: `0 12px 36px ${alpha(accentColor, 0.06)}`,
      position: 'relative',
      overflow: 'hidden'
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
        Investment Memo · Unit Economics Dashboard
      </Typography>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
        gap: 2.5,
        mb: content.dealThesis ? 4 : 0
      }}>
        {metrics.map((m, idx) => (
          <Box key={idx} sx={{
            p: 2.5,
            borderRadius: '16px',
            bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#fff',
            border: `1px solid ${alpha(m.color, 0.2)}`,
            boxShadow: `0 4px 16px ${alpha(m.color, 0.05)}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75
          }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {m.label}
            </Typography>
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: m.color, letterSpacing: '-0.02em' }}>
              {m.val}
            </Typography>
          </Box>
        ))}
      </Box>

      {content.dealThesis && (
        <Box sx={{
          p: 3,
          borderRadius: '16px',
          bgcolor: alpha(accentColor, 0.06),
          border: `1px solid ${alpha(accentColor, 0.2)}`
        }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
            Margin Thesis & Capital Return Engine
          </Typography>
          <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.9)' : '#334155', lineHeight: 1.7, fontSize: '0.98rem', fontWeight: 500 }}>
            {content.dealThesis}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
