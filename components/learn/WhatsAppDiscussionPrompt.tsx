import React from 'react';
import { Box, Typography, Avatar, alpha } from '@mui/material';
import { Verified as VerifiedIcon, ChatBubbleOutlined as ChatIcon } from '@mui/icons-material';

export type WhatsAppDiscussionPromptProps = {
  prompt?: string;
  defaultPrompt?: string;
  author?: any;
  repliesCount?: number;
  accentColor?: string;
  themeMode?: 'light' | 'dark';
  triggerInsights?: () => void;
  maxWidth?: any;
  sx?: any;
};

export const WhatsAppDiscussionPrompt: React.FC<WhatsAppDiscussionPromptProps> = ({
  prompt,
  defaultPrompt = 'What are your thoughts on this analysis? Drop an insight below.',
  author,
  repliesCount,
  accentColor = '#10b981',
  themeMode = 'light',
  triggerInsights,
  maxWidth,
  sx,
}) => {
  const isDark = themeMode === 'dark';
  const authorName = typeof author === 'object' && author?.name
    ? author.name
    : (typeof author === 'string' && author ? author : 'Society Architect');
  const authorAvatar = typeof author === 'object' ? author?.avatarUrl : undefined;
  const isAuthorVerified = typeof author === 'object' ? (author?.isVerified ?? true) : true;
  const promptText = prompt || defaultPrompt;
  const replyLabel = repliesCount ? `${repliesCount} ${repliesCount === 1 ? 'Reply' : 'Replies'}` : 'Reply';

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 3.5, width: '100%', ...sx }}>
      <Box
        onClick={triggerInsights}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: { xs: 1.25, sm: 1.5 },
          width: '100%',
          maxWidth: maxWidth || { xs: '100%', md: '85%' },
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {/* WhatsApp Avatar with Online Badge */}
        <Box sx={{ flexShrink: 0, position: 'relative', pt: 0.25 }}>
          <Avatar
            src={authorAvatar}
            alt={authorName}
            sx={{
              width: { xs: 32, sm: 36 },
              height: { xs: 32, sm: 36 },
              fontSize: '0.85rem',
              fontWeight: 700,
              bgcolor: alpha(accentColor || '#10b981', 0.15),
              color: accentColor || '#10b981',
              border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
            }}
          >
            {authorName?.charAt(0) || 'S'}
          </Avatar>
          <Box
            sx={{
              position: 'absolute',
              bottom: -1,
              right: -1,
              width: 10,
              height: 10,
              bgcolor: '#25D366',
              borderRadius: '50%',
              border: `2px solid ${isDark ? '#0f172a' : '#fff'}`,
            }}
          />
        </Box>

        {/* WhatsApp Message Bubble */}
        <Box
          sx={{
            position: 'relative',
            flex: 1,
            minWidth: 0,
            p: { xs: 1.5, sm: 2 },
            borderRadius: '0px 18px 18px 18px',
            bgcolor: isDark ? '#1e293b' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
            boxShadow: isDark
              ? '0 3px 12px rgba(0,0,0,0.3)'
              : '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: isDark
                ? '0 6px 20px rgba(0,0,0,0.4)'
                : `0 6px 18px ${alpha(accentColor || '#10b981', 0.12)}, 0 2px 4px rgba(0,0,0,0.06)`,
              borderColor: alpha(accentColor || '#10b981', 0.35),
            },
            '&:hover .reply-btn': {
              bgcolor: accentColor || '#10b981',
              color: '#ffffff',
            },
          }}
        >
          {/* WhatsApp Tail Notch */}
          <Box
            component="svg"
            viewBox="0 0 8 13"
            sx={{
              position: 'absolute',
              top: 0,
              left: -7,
              width: 8,
              height: 13,
              pointerEvents: 'none',
              zIndex: 2,
              filter: isDark ? 'none' : 'drop-shadow(-1px 1px 1px rgba(0,0,0,0.03))',
            }}
          >
            <path
              d="M1.533 3.568 8 12.193V0H2.812C1.042 0 .474 2.156 1.533 3.568z"
              fill={isDark ? '#1e293b' : '#ffffff'}
              stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}
              strokeWidth="0.8"
            />
          </Box>

          {/* Header Row: Author Name + Author Tag + WhatsApp Reply Action */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  color: accentColor || (isDark ? '#34d399' : '#059669'),
                  display: 'flex',
                  alignItems: 'center',
                  letterSpacing: '-0.01em',
                }}
              >
                {authorName}
                {isAuthorVerified && <VerifiedIcon sx={{ fontSize: 13, ml: 0.5, color: '#25D366' }} />}
              </Typography>
              <Box
                sx={{
                  px: 0.75,
                  py: 0.15,
                  borderRadius: '6px',
                  bgcolor: alpha(accentColor || '#10b981', isDark ? 0.15 : 0.08),
                  color: accentColor || (isDark ? '#34d399' : '#059669'),
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                }}
              >
                Author
              </Box>
            </Box>

            <Typography
              className="reply-btn"
              sx={{
                px: 1.25,
                py: 0.35,
                borderRadius: '12px',
                bgcolor: alpha(accentColor || '#10b981', isDark ? 0.12 : 0.08),
                color: accentColor || (isDark ? '#34d399' : '#059669'),
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <ChatIcon sx={{ fontSize: 13 }} />
              {replyLabel}
            </Typography>
          </Box>

          {/* Conversational Message Text */}
          <Typography
            sx={{
              fontSize: { xs: '0.9rem', sm: '0.94rem' },
              color: isDark ? '#f1f5f9' : '#1e293b',
              fontWeight: 450,
              lineHeight: 1.55,
              wordBreak: 'break-word',
            }}
          >
            {promptText}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
