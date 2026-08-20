import React from 'react';
import { Box, Typography, alpha, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

export interface ComparisonMatrixBlockProps {
  content: {
    optionAName?: string;
    optionBName?: string;
    winnerVerdict?: string;
    rows?: Array<{
      criterion: string;
      optionAValue: string;
      optionBValue: string;
      winner: 'A' | 'B' | 'Tie';
    }>;
  };
  themeMode?: 'light' | 'dark';
  accentColor?: string;
}

export const ComparisonMatrixBlock: React.FC<ComparisonMatrixBlockProps> = ({
  content,
  themeMode = 'light',
  accentColor = '#8b5cf6'
}) => {
  const isDark = themeMode === 'dark';
  const optA = content.optionAName || 'Option A';
  const optB = content.optionBName || 'Option B';
  const rows = content.rows || [];

  if (rows.length === 0 && !content.winnerVerdict) return null;

  return (
    <Box sx={{
      my: 6,
      p: { xs: 3, md: 5 },
      borderRadius: '24px',
      bgcolor: isDark ? alpha(accentColor, 0.04) : alpha(accentColor, 0.02),
      border: '1px solid',
      borderColor: alpha(accentColor, 0.2),
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
        Head-to-Head Comparison Showdown
      </Typography>

      <TableContainer sx={{
        borderRadius: '16px',
        bgcolor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#fff',
        border: `1px solid ${alpha(accentColor, 0.15)}`,
        mb: content.winnerVerdict ? 3 : 0,
        overflow: 'hidden'
      }}>
        <Table>
          <TableHead sx={{ bgcolor: alpha(accentColor, 0.08) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: isDark ? '#fff' : '#0f172a', fontSize: '0.9rem', width: '34%' }}>
                Evaluation Criterion
              </TableCell>
              <TableCell sx={{ fontWeight: 800, color: accentColor, fontSize: '0.9rem', width: '33%' }}>
                {optA}
              </TableCell>
              <TableCell sx={{ fontWeight: 800, color: isDark ? '#94a3b8' : '#475569', fontSize: '0.9rem', width: '33%' }}>
                {optB}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => {
              const isAWinner = row.winner === 'A';
              const isBWinner = row.winner === 'B';

              return (
                <TableRow key={idx} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: alpha(accentColor, 0.03) } }}>
                  <TableCell sx={{ fontWeight: 700, color: isDark ? '#e2e8f0' : '#1e293b', fontSize: '0.9rem' }}>
                    {row.criterion}
                  </TableCell>
                  <TableCell sx={{
                    fontWeight: isAWinner ? 800 : 500,
                    color: isAWinner ? (isDark ? '#34d399' : '#059669') : (isDark ? '#94a3b8' : '#64748b'),
                    bgcolor: isAWinner ? alpha('#10b981', 0.06) : 'transparent',
                    fontSize: '0.9rem'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isAWinner && <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} />}
                      <span>{row.optionAValue}</span>
                    </Box>
                  </TableCell>
                  <TableCell sx={{
                    fontWeight: isBWinner ? 800 : 500,
                    color: isBWinner ? (isDark ? '#34d399' : '#059669') : (isDark ? '#94a3b8' : '#64748b'),
                    bgcolor: isBWinner ? alpha('#10b981', 0.06) : 'transparent',
                    fontSize: '0.9rem'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isBWinner && <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} />}
                      <span>{row.optionBValue}</span>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {content.winnerVerdict && (
        <Box sx={{
          p: 2.5,
          borderRadius: '16px',
          bgcolor: alpha(accentColor, 0.1),
          border: `1px solid ${alpha(accentColor, 0.3)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Chip label="Winner Verdict" size="small" sx={{ bgcolor: accentColor, color: '#fff', fontWeight: 900, fontSize: '0.75rem' }} />
          <Typography sx={{ fontWeight: 700, color: isDark ? '#fff' : '#0f172a', fontSize: '0.95rem', lineHeight: 1.5 }}>
            {content.winnerVerdict}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
