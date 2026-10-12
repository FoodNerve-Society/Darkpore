'use client';

import React, { useState, useMemo } from 'react';
import { Box, Typography, Avatar, alpha } from '@mui/material';
import { Verified as VerifiedIcon, HowToVote as VoteIcon } from '@mui/icons-material';

type QuickPollBlockProps = {
  content: {
    question?: string;
    options?: string | string[] | any; // supports JSON string arrays, pipe delimiters, or comma strings
    discussionPrompt?: string;
    repliesCount?: number;
  };
  themeMode?: 'light' | 'dark';
  accentColor?: string;
  author?: any;
  triggerInsights?: () => void;
};

export const parsePollOptions = (raw: any): string[] => {
  if (!raw) return [];
  
  // 1. Array format
  if (Array.isArray(raw)) {
    return raw
      .map(item => {
        if (typeof item === 'object' && item !== null) {
          return String(item.text || item.label || item.value || '').trim();
        }
        return String(item).trim();
      })
      .filter(Boolean);
  }

  if (typeof raw !== 'string') return [];
  const str = raw.trim();
  if (!str) return [];

  // 2. JSON array string format
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) {
      return parsed
        .map(item => {
          if (typeof item === 'object' && item !== null) {
            return String(item.text || item.label || item.value || '').trim();
          }
          return String(item).trim();
        })
        .filter(Boolean);
    }
  } catch (e) {
    // Continue to delimiter parsing
  }

  // 3. Pipe delimiter (supports '||' and '|||')
  if (str.includes('||')) {
    return str
      .split(/\|{2,3}/)
      .map(o => o.trim())
      .filter(Boolean);
  }

  // 4. Newline delimiter
  if (str.includes('\n')) {
    return str
      .split(/\r?\n+/)
      .map(o => o.replace(/^[*-•\d.)\s]+/, '').trim())
      .filter(Boolean);
  }

  // 5. Fallback comma split with quote protection
  // If the string contains commas but not JSON or pipes, split on commas
  return str.split(',').map(o => o.trim()).filter(Boolean);
};

export const QuickPollBlock: React.FC<QuickPollBlockProps> = ({ 
  content, 
  themeMode = 'light', 
  accentColor = '#d946ef', 
  author, 
  triggerInsights 
}) => {
  const isDark = themeMode === 'dark';
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const optionsList = useMemo(() => {
    return parsePollOptions(content.options);
  }, [content.options]);

  const isComplete = !!content.question && content.question.trim().length > 0;

  if (!content.question) return null;

  return (
    <Box sx={{ 
      my: 6, 
      p: { xs: 3, md: 4 }, 
      borderRadius: '24px', 
      bgcolor: isDark ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.65)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1.5px solid',
      borderColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)',
      boxShadow: isDark 
        ? 'inset 0 1px 0 rgba(255,255,255,0.12), 0 20px 40px rgba(0,0,0,0.35)' 
        : 'inset 0 1px 0 rgba(255,255,255,0.9), 0 20px 40px rgba(0,0,0,0.04)',
    }}>
      {/* Header Tag */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box sx={{ 
          width: 8, height: 8, 
          borderRadius: '50%', 
          bgcolor: accentColor, 
          boxShadow: `0 0 10px ${accentColor}` 
        }} />
        <Typography sx={{ 
          color: isDark ? '#94a3b8' : '#64748b', 
          fontWeight: 850, 
          fontSize: '0.78rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em',
          display: 'flex',
          alignItems: 'center',
          gap: 0.75
        }}>
          <VoteIcon sx={{ fontSize: 16, color: accentColor }} /> Pulse Check
        </Typography>
      </Box>

      {/* Poll Question */}
      <Typography sx={{ 
        color: isDark ? '#fff' : '#0f172a', 
        fontWeight: 850, 
        fontSize: { xs: '1.25rem', md: '1.5rem' }, 
        mb: 3.5,
        letterSpacing: '-0.02em',
        lineHeight: 1.3
      }}>
        {content.question}
      </Typography>

      {/* Options Selection Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        {optionsList.map((option, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <Box 
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              sx={{ 
                py: 1.8, 
                px: 2.5, 
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderRadius: '16px',
                cursor: 'pointer',
                bgcolor: isSelected 
                  ? (isDark ? alpha(accentColor, 0.16) : alpha(accentColor, 0.08))
                  : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                border: '1.5px solid',
                borderColor: isSelected 
                  ? accentColor 
                  : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'),
                boxShadow: isSelected 
                  ? `0 4px 18px ${alpha(accentColor, 0.22)}` 
                  : 'none',
                transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                '&:hover': {
                  borderColor: isSelected ? accentColor : (isDark ? 'rgba(255,255,255,0.22)' : alpha(accentColor, 0.45)),
                  bgcolor: isSelected 
                    ? (isDark ? alpha(accentColor, 0.2) : alpha(accentColor, 0.12))
                    : (isDark ? 'rgba(255,255,255,0.05)' : alpha(accentColor, 0.04)),
                  transform: 'translateY(-1px)'
                }
              }}
            >
              {/* Radio Dot */}
              <Box sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: '2px solid',
                borderColor: isSelected ? accentColor : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s ease',
                bgcolor: isSelected ? alpha(accentColor, 0.15) : 'transparent'
              }}>
                {isSelected && (
                  <Box sx={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    bgcolor: accentColor,
                    transition: 'all 0.2s ease'
                  }} />
                )}
              </Box>

              {/* Clean Single-line Option Text */}
              <Typography sx={{
                flex: 1,
                color: isSelected 
                  ? (isDark ? '#fff' : '#0f172a') 
                  : (isDark ? 'rgba(255,255,255,0.88)' : '#334155'),
                fontWeight: isSelected ? 750 : 600,
                fontSize: { xs: '0.95rem', md: '1.02rem' },
                lineHeight: 1.45,
                letterSpacing: '-0.01em',
                userSelect: 'none'
              }}>
                {option}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Discussion Prompt - wired to insights */}
      {isComplete && author && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 4 }}>
          <Box 
            onClick={triggerInsights}
            sx={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: 1.5,
              width: '100%',
              maxWidth: { xs: '100%', md: '85%' },
              p: { xs: 1.5, sm: 2 },
              borderRadius: '16px',
              bgcolor: alpha(accentColor, isDark ? 0.08 : 0.05),
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
              borderLeft: `3px solid ${accentColor}`,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: alpha(accentColor, isDark ? 0.12 : 0.08),
                transform: 'translateY(-1px)',
                boxShadow: `0 8px 24px ${alpha(accentColor, 0.12)}`
              },
              '&:hover .reply-btn': { bgcolor: accentColor, color: '#fff' }
            }}
          >
            <Box sx={{ flexShrink: 0, position: 'relative' }}>
              <Avatar src={author.avatarUrl} alt={author.name} sx={{ width: 30, height: 30, fontSize: '0.85rem', fontWeight: 700 }}>
                {author.name?.charAt(0)}
              </Avatar>
              <Box sx={{ 
                position: 'absolute', bottom: -1, right: -1, width: 9, height: 9, 
                bgcolor: '#10b981', borderRadius: '50%', border: `1.5px solid ${isDark ? '#0f172a' : '#fff'}` 
              }} />
            </Box>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem', color: isDark ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center' }}>
                  {author.name}
                  {author.isVerified && <VerifiedIcon sx={{ fontSize: 13, color: accentColor || '#10b981', ml: 0.5 }} />}
                </Typography>
                <Typography className="reply-btn" sx={{ 
                  px: 1.2, py: 0.3, 
                  borderRadius: '10px',
                  bgcolor: alpha(accentColor, 0.1),
                  color: accentColor,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}>
                  {content.repliesCount ? `${content.repliesCount} Replies` : 'Reply'}
                </Typography>
              </Box>
              <Typography sx={{ 
                fontSize: { xs: '0.88rem', sm: '0.92rem' }, 
                color: isDark ? 'rgba(255,255,255,0.85)' : '#334155', 
                fontStyle: 'italic', 
                fontWeight: 500,
                lineHeight: 1.5 
              }}>
                "{content.discussionPrompt || "Why did you vote the way you did?"}"
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

