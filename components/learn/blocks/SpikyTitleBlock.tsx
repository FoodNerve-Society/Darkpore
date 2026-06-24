import React from 'react';
import { Box, Typography } from '@mui/material';

type SpikyTitleBlockProps = {
  content: {
    text: string;
  };
  themeMode?: 'light' | 'dark';
};

export const SpikyTitleBlock: React.FC<SpikyTitleBlockProps> = ({ content, themeMode = 'light' }) => {
  const isDark = themeMode === 'dark';

  const colonIndex = content.text?.indexOf(':') ?? -1;

  let beforeColon = content.text;
  let afterColon = '';
  let kicker = '';

  if (colonIndex !== -1) {
    beforeColon = content.text.substring(0, colonIndex + 1);
    const remainder = content.text.substring(colonIndex + 1).trim();
    
    // Look for the action command at the end of the string
    const actionMatch = remainder.match(/(,\s*and\s+(why\s+.*))/i);
    if (actionMatch) {
      kicker = actionMatch[2]; // Captures "why ..." without the comma and 'and'
      afterColon = remainder.substring(0, actionMatch.index).trim();
    } else {
      afterColon = remainder;
    }
  }

  return (
    <Box sx={{ 
      my: 5, 
      pl: { xs: 2.5, md: 3.5 },
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: '4px',
        bottom: '4px',
        width: '4px',
        background: 'linear-gradient(to bottom, #f59e0b, #ec4899)',
        borderRadius: '4px',
      }
    }}>
      {kicker && (
        <Typography sx={{ 
          color: '#f59e0b', 
          fontWeight: 800, 
          fontSize: '0.8rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.1em',
          mb: 1.5,
          display: 'block'
        }}>
          {kicker}
        </Typography>
      )}
      <Typography
        variant="h3"
        sx={{
          color: isDark ? '#fff' : '#0f172a',
          fontSize: { xs: '1.5rem', md: '2rem' },
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}
      >
        <Box component="span" sx={{ fontWeight: 900 }}>
          {beforeColon}
        </Box>
        {afterColon && (
          <Box component="span" sx={{ fontWeight: 400, fontStyle: 'italic', display: 'inline-block', ml: 1, color: isDark ? '#cbd5e1' : '#475569' }}>
            {afterColon}
          </Box>
        )}
      </Typography>
    </Box>
  );
};
