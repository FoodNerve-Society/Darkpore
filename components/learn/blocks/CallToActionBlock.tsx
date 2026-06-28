import React from 'react';
import { Box, Typography, Button, alpha } from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { MACRO_CTAS } from '../../../lib/cms/ctas';

export interface CallToActionBlockProps {
  content: {
    macroCtaId?: string;
  };
  themeMode?: 'light' | 'dark';
  accentColor?: string;
}

export const CallToActionBlock: React.FC<CallToActionBlockProps> = ({ 
  content, 
  themeMode = 'light',
  accentColor = '#3b82f6'
}) => {
  // Look up the CTA from the global registry
  const cta = MACRO_CTAS.find(c => c.id === content.macroCtaId) || MACRO_CTAS[0];

  if (!cta) return null;

  return (
    <Box sx={{ 
      my: 6, 
      p: { xs: 4, md: 6 }, 
      borderRadius: '24px',
      background: `linear-gradient(135deg, ${alpha(accentColor, 0.1)} 0%, ${alpha(accentColor, 0.02)} 100%)`,
      border: `1px solid ${alpha(accentColor, 0.2)}`,
      boxShadow: `0 20px 40px -10px ${alpha(accentColor, 0.1)}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient Glow */}
      <Box sx={{
        position: 'absolute',
        top: '-50%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle, ${alpha(accentColor, 0.15)} 0%, transparent 70%)`,
        pointerEvents: 'none'
      }} />

      <Typography variant="h3" sx={{ 
        fontWeight: 800, 
        fontSize: { xs: '2rem', md: '2.75rem' },
        letterSpacing: '-0.02em',
        color: themeMode === 'dark' ? '#fff' : '#0f172a',
        mb: 2,
        position: 'relative',
        zIndex: 1
      }}>
        {cta.hook}
      </Typography>

      <Typography sx={{ 
        fontSize: '1.125rem', 
        color: themeMode === 'dark' ? alpha('#fff', 0.7) : alpha('#0f172a', 0.7),
        maxWidth: '600px',
        mb: 5,
        lineHeight: 1.6,
        position: 'relative',
        zIndex: 1,
        fontFamily: 'var(--font-inter), Inter, sans-serif'
      }}>
        {cta.subtext}
      </Typography>

      <Button
        variant="contained"
        href={cta.url}
        endIcon={<ArrowForwardIcon />}
        sx={{
          bgcolor: accentColor,
          color: '#fff',
          px: 5,
          py: 2,
          fontSize: '1.1rem',
          fontWeight: 700,
          borderRadius: '12px',
          textTransform: 'none',
          boxShadow: `0 8px 20px ${alpha(accentColor, 0.3)}`,
          position: 'relative',
          zIndex: 1,
          '&:hover': {
            bgcolor: accentColor,
            filter: 'brightness(1.1)',
            transform: 'translateY(-2px)',
            boxShadow: `0 12px 25px ${alpha(accentColor, 0.4)}`,
          },
          transition: 'all 0.2s ease-in-out'
        }}
      >
        {cta.buttonText}
      </Button>
    </Box>
  );
};
