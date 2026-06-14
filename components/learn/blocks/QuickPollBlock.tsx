import React from 'react';
import { Box, Typography, Button } from '@mui/material';

type QuickPollBlockProps = {
  content: {
    question?: string;
    options?: string; // comma separated
    discussionPrompt?: string;
  };
  themeMode?: 'light' | 'dark';
};

export const QuickPollBlock: React.FC<QuickPollBlockProps> = ({ content, themeMode = 'light' }) => {
  const isDark = themeMode === 'dark';
  const optionsList = content.options ? content.options.split(',').map(o => o.trim()).filter(Boolean) : [];
  const isComplete = !!content.question && content.question.trim().length > 0;

  if (!content.question) return null;

  return (
    <Box sx={{ 
      my: 4, 
      p: { xs: 3, md: 4 }, 
      borderRadius: '24px', 
      bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      border: '1px solid',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f59e0b' }} />
        <Typography sx={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Quick Poll
        </Typography>
      </Box>

      <Typography sx={{ 
        color: isDark ? '#fff' : '#0f172a', 
        fontWeight: 800, 
        fontSize: { xs: '1.25rem', md: '1.5rem' }, 
        mb: 4,
        letterSpacing: '-0.01em' 
      }}>
        {content.question}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {optionsList.map((option, idx) => (
          <Button 
            key={idx}
            variant="outlined"
            fullWidth
            sx={{ 
              py: 2, px: 3, 
              justifyContent: 'flex-start',
              borderRadius: '16px',
              color: isDark ? '#fff' : '#0f172a',
              borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1.05rem',
              '&:hover': {
                borderColor: isDark ? '#fff' : '#0f172a',
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
              }
            }}
          >
            {option}
          </Button>
        ))}
      </Box>

      {/* Discussion Prompt - to be wired later */}
      {isComplete && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Box sx={{ 
            px: 2, py: 1, 
            borderRadius: '20px', 
            bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            color: isDark ? '#fff' : '#0f172a',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 1,
            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }
          }}>
            💬 Discuss: {content.discussionPrompt || "Why did you vote the way you did?"}
            <Typography sx={{ ml: 1, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '0.75rem', fontWeight: 500 }}>
              • 24 Replies
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};
