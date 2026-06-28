import React from 'react';
import { Box, Typography } from '@mui/material';

type SpikyTitleBlockProps = {
  content: {
    text: string;
  };
  themeMode?: 'light' | 'dark';
  accentColor?: string;
};

export const SpikyTitleBlock: React.FC<SpikyTitleBlockProps> = ({ 
  content, 
  themeMode = 'light',
  accentColor = '#f59e0b'
}) => {
  const isDark = themeMode === 'dark';

  const text = content?.text || '';
  const colonIndex = text.indexOf(':');

  let beforeColon = text;
  let afterColon = '';
  let kicker = '';

  if (colonIndex !== -1) {
    beforeColon = text.substring(0, colonIndex + 1);
    const remainder = text.substring(colonIndex + 1).trim();
    
    // Look for the action command at the end of the string
    // Making it more flexible: comma followed by anything that looks like "and why" or "so why"
    const actionMatch = remainder.match(/(,\s*(and|so)?\s+(why\s+.*))/i);
    if (actionMatch) {
      kicker = actionMatch[3]; // Captures "why ..." 
      afterColon = remainder.substring(0, actionMatch.index).trim();
    } else {
      afterColon = remainder;
    }
  }

  return (
    <Box sx={{ 
      my: 6, 
      position: 'relative',
      // We removed the left border as requested.
    }}>
      {kicker && (
        <Box sx={{ mb: 2 }}>
          <Typography 
            component="span"
            sx={{ 
              color: accentColor,
              bgcolor: `${accentColor}1A`, // 10% opacity background for pill
              border: `1px solid ${accentColor}33`,
              borderRadius: '24px',
              padding: '4px 12px',
              fontWeight: 700, 
              fontSize: '0.75rem', 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em',
              fontFamily: 'var(--font-quicksand)',
              display: 'inline-block',
              boxShadow: `0 4px 12px ${accentColor}1A`
            }}>
            {kicker}
          </Typography>
        </Box>
      )}
      
      <Typography
        variant="h3"
        sx={{
          color: accentColor,
          fontSize: { xs: '1.6rem', md: '2.2rem' },
          letterSpacing: '-0.02em',
          lineHeight: 1.3,
        }}
      >
        <Box component="span" sx={{ fontWeight: 900 }}>
          {beforeColon}
        </Box>
        {afterColon && (
          <Box 
            component="span" 
            sx={{ 
              fontWeight: 400, 
              fontStyle: 'italic', 
              display: 'inline-block', 
              ml: 1, 
              color: isDark ? '#cbd5e1' : '#475569',
              fontFamily: 'var(--font-ysabeau-infant)'
            }}
          >
            {afterColon}
          </Box>
        )}
      </Typography>
    </Box>
  );
};
