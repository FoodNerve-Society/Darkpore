import React from 'react';
import { Box, Typography, Avatar, Chip, Button, alpha } from '@mui/material';
import {
  Verified as VerifiedIcon,
  ChatBubbleOutline as ChatIcon,
  ArrowForward as ArrowForwardIcon,
  Forum as ForumIcon,
} from '@mui/icons-material';

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
  defaultPrompt = 'Do you know if operators in your corridor have deployed this workaround?',
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

  // Determine reply count and human-friendly badge label
  const totalReplies = typeof repliesCount === 'number' 
    ? repliesCount 
    : (promptText ? 14 : 0);
  const repliesLabel = totalReplies > 0
    ? `${totalReplies.toLocaleString()} ${totalReplies === 1 ? 'person replied' : 'people replied'}`
    : 'Be the first to reply';

  // Highlight "Do you know if" lead if present
  const renderPromptHeadline = () => {
    const doYouKnowMatch = promptText.match(/^(Do you know if\b)([\s\S]*)$/i);
    if (doYouKnowMatch) {
      return (
        <Typography
          sx={{
            fontSize: { xs: '0.96rem', sm: '1.04rem' },
            color: isDark ? '#f8fafc' : '#0f172a',
            fontWeight: 600,
            lineHeight: 1.6,
            letterSpacing: '-0.015em',
            wordBreak: 'break-word',
          }}
        >
          <Box
            component="span"
            sx={{
              color: accentColor,
              fontWeight: 800,
              display: 'inline',
              mr: 0.5,
            }}
          >
            {doYouKnowMatch[1]}
          </Box>
          {doYouKnowMatch[2]}
        </Typography>
      );
    }

    return (
      <Typography
        sx={{
          fontSize: { xs: '0.96rem', sm: '1.04rem' },
          color: isDark ? '#f8fafc' : '#0f172a',
          fontWeight: 600,
          lineHeight: 1.6,
          letterSpacing: '-0.015em',
          wordBreak: 'break-word',
        }}
      >
        {promptText}
      </Typography>
    );
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 3.5, width: '100%', ...sx }}>
      {/* ── Apple Liquid Glass Discussion Pass ── */}
      <Box
        onClick={triggerInsights}
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: maxWidth || { xs: '100%', md: '88%' },
          cursor: 'pointer',
          borderRadius: '20px',
          p: { xs: 2.25, sm: 2.75 },
          bgcolor: isDark
            ? 'rgba(30, 41, 59, 0.72)'
            : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1.5px solid',
          borderColor: isDark
            ? alpha(accentColor, 0.22)
            : alpha(accentColor, 0.2),
          boxShadow: isDark
            ? `inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 16px 36px -4px rgba(0, 0, 0, 0.4)`
            : `inset 0 1px 0 rgba(255, 255, 255, 0.95), 0 12px 32px -4px rgba(15, 23, 42, 0.06)`,
          transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: alpha(accentColor, 0.55),
            boxShadow: isDark
              ? `inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 20px 44px -4px rgba(0, 0, 0, 0.5), 0 0 24px ${alpha(accentColor, 0.2)}`
              : `inset 0 1px 0 rgba(255, 255, 255, 1), 0 16px 40px -4px ${alpha(accentColor, 0.16)}, 0 4px 12px rgba(15, 23, 42, 0.06)`,
          },
          '&:hover .reply-arrow': {
            transform: 'translateX(3px)',
          },
        }}
      >
        {/* Glowing Left Accent Rail */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 12,
            bottom: 12,
            width: 4,
            borderRadius: '0 4px 4px 0',
            background: `linear-gradient(180deg, ${accentColor} 0%, ${alpha(accentColor, 0.3)} 100%)`,
            boxShadow: `0 0 10px ${alpha(accentColor, 0.5)}`,
          }}
        />

        {/* ── Top Header Row: Author Identity + Replies Count Badge ── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1.75,
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          {/* Author Capsule */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <Avatar
                src={authorAvatar}
                alt={authorName}
                sx={{
                  width: 34,
                  height: 34,
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  bgcolor: alpha(accentColor, 0.16),
                  color: accentColor,
                  border: `1.5px solid ${alpha(accentColor, 0.35)}`,
                }}
              >
                {authorName?.charAt(0) || 'S'}
              </Avatar>
              {/* Online Pulse Indicator */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -1,
                  right: -1,
                  width: 9,
                  height: 9,
                  bgcolor: '#10b981',
                  borderRadius: '50%',
                  border: `2px solid ${isDark ? '#1e293b' : '#fff'}`,
                  boxShadow: '0 0 6px #10b981',
                }}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    color: isDark ? '#fff' : '#0f172a',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                  }}
                >
                  {authorName}
                </Typography>
                {isAuthorVerified && (
                  <VerifiedIcon sx={{ fontSize: 13, color: accentColor }} />
                )}
              </Box>
              <Typography
                sx={{
                  fontSize: '0.64rem',
                  fontWeight: 750,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isDark ? '#94a3b8' : '#64748b',
                }}
              >
                Curator&apos;s Inquiry
              </Typography>
            </Box>
          </Box>

          {/* Prominent Replies Count Pill */}
          <Chip
            icon={<ForumIcon sx={{ fontSize: '0.82rem !important', color: `${accentColor} !important` }} />}
            label={repliesLabel}
            size="small"
            sx={{
              height: 26,
              borderRadius: '10px',
              px: 0.5,
              fontWeight: 800,
              fontSize: '0.72rem',
              letterSpacing: '-0.01em',
              bgcolor: isDark
                ? alpha(accentColor, 0.14)
                : alpha(accentColor, 0.09),
              color: isDark ? '#fff' : '#0f172a',
              border: `1px solid ${alpha(accentColor, 0.28)}`,
              boxShadow: `0 2px 6px ${alpha(accentColor, 0.08)}`,
            }}
          />
        </Box>

        {/* ── Question Body ── */}
        <Box sx={{ pl: { xs: 0.5, sm: 1 }, mb: 2 }}>
          {renderPromptHeadline()}
        </Box>

        {/* ── Bottom Interactive Bar: Community Participants + Reply Trigger ── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 1.5,
            borderTop: '1px solid',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)',
            gap: 1.5,
          }}
        >
          {/* Active Operator Voices Hint */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {['#3b82f6', '#10b981', '#f59e0b'].map((dotColor, idx) => (
                <Box
                  key={idx}
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    bgcolor: dotColor,
                    border: `2px solid ${isDark ? '#1e293b' : '#fff'}`,
                    ml: idx > 0 ? -0.8 : 0,
                    opacity: 0.9,
                  }}
                />
              ))}
            </Box>
            <Typography
              sx={{
                fontSize: '0.72rem',
                fontWeight: 650,
                color: isDark ? '#94a3b8' : '#64748b',
                display: { xs: 'none', sm: 'inline' },
              }}
            >
              Verified Operators Debating
            </Typography>
          </Box>

          {/* Interactive Reply Pill Button */}
          <Button
            size="small"
            variant="contained"
            endIcon={<ArrowForwardIcon className="reply-arrow" sx={{ fontSize: '0.85rem !important', transition: 'transform 0.2s ease' }} />}
            sx={{
              bgcolor: accentColor,
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.75rem',
              borderRadius: '12px',
              px: 2,
              py: 0.6,
              textTransform: 'none',
              letterSpacing: '0.01em',
              boxShadow: `0 4px 14px ${alpha(accentColor, 0.35)}`,
              '&:hover': {
                bgcolor: accentColor,
                boxShadow: `0 6px 18px ${alpha(accentColor, 0.5)}`,
              },
            }}
          >
            Join Discussion
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
