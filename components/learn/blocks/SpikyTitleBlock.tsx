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

  if (colonIndex !== -1) {
    beforeColon = content.text.substring(0, colonIndex + 1);
    afterColon = content.text.substring(colonIndex + 1).trim();
  }

  return (
    <Box sx={{ my: 4, pl: { xs: 2, md: 3 } }}>
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
