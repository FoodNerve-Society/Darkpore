'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Drawer, Box, Typography, IconButton, 
  Avatar, alpha, useTheme, CircularProgress
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Send as SendIcon, 
  FavoriteBorder as HeartIcon,
  Favorite as HeartFilledIcon,
  ChatBubbleOutlined as ChatIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import { useSociety } from '@/context/SocietyContext';
import PremiumTextField from '@/components/PremiumTextField';
import { getBlockComments, postBlockComment, likeBlockComment } from '@/lib/actions/learn';

export interface BlockInsightsDrawerProps {
  open: boolean;
  onClose: () => void;
  blockId: string | null;
  activeBlock?: any;
  accentColor?: string;
}

// ─── BLOCK TYPE LABEL MAP ───────────────────────────────
const BLOCK_LABELS: Record<string, string> = {
  core_interactive: 'Main Analysis',
  deep_dive: 'Deep Dive',
  myth_fact: 'Myth vs Reality',
  pull_quote: 'Ground Truth',
  live_poll: 'Pulse Check',
  highlight_card: 'Big Stat',
  media: 'Evidence Gallery',
  exec_summary: 'Executive Summary',
  subheading: 'Section Header',
  strategic_directive: 'Strategic Directive',
};

// ─── RELATIVE TIME HELPER ───────────────────────────────
function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const BlockInsightsDrawer: React.FC<BlockInsightsDrawerProps> = ({ 
  open, onClose, blockId, activeBlock, accentColor = '#8b5cf6' 
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { profile } = useSociety();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  // Parse activeBlock content
  let parsedContent = activeBlock?.content || {};
  if (typeof parsedContent === 'string') {
    try { parsedContent = JSON.parse(parsedContent); } catch (e) {}
  }

  // ─── FETCH COMMENTS ─────────────────────────────────────
  const fetchComments = useCallback(async () => {
    if (!blockId) return;
    setLoading(true);
    try {
      const data = await getBlockComments(blockId);
      setComments(data);
    } catch (e) {
      console.error('Failed to fetch comments:', e);
    } finally {
      setLoading(false);
    }
  }, [blockId]);

  useEffect(() => {
    if (open && blockId) {
      fetchComments();
    }
    if (!open) {
      setComments([]);
      setCommentText('');
    }
  }, [open, blockId, fetchComments]);

  // ─── POST COMMENT ───────────────────────────────────────
  const handlePost = async () => {
    if (!commentText.trim() || !blockId || posting) return;
    setPosting(true);
    try {
      await postBlockComment({
        blockId,
        text: commentText.trim(),
        userId: profile?.uid || null,
        displayName: profile 
          ? [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Member'
          : 'Anonymous',
        avatarUrl: profile?.avatarUrl || null,
      });
      setCommentText('');
      await fetchComments();
    } catch (e) {
      console.error('Failed to post comment:', e);
    } finally {
      setPosting(false);
    }
  };

  // ─── LIKE ───────────────────────────────────────────────
  const handleLike = async (commentId: string) => {
    if (likedComments.has(commentId)) return;
    setLikedComments(prev => new Set(prev).add(commentId));
    try {
      await likeBlockComment(commentId);
      setComments(prev => prev.map(c => 
        c.id === commentId ? { ...c, likes: c.likes + 1 } : c
      ));
    } catch (e) {
      console.error('Failed to like:', e);
    }
  };

  // ─── HELPERS ────────────────────────────────────────────
  const getPrompt = (): string => {
    if (!parsedContent) return 'What are your thoughts on this section?';
    return parsedContent.discussionPrompt 
      || parsedContent.anchorQuestion 
      || parsedContent.question 
      || 'What are your thoughts on this section?';
  };

  const getBlockLabel = (): string => {
    const bt = activeBlock?.blockType;
    if (!bt) return 'Discussion';
    return BLOCK_LABELS[bt] || String(bt).replace(/_/g, ' ');
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      // @ts-ignore
      PaperProps={{
        style: { width: 420, maxWidth: '100vw' },
        sx: {
          bgcolor: isDark ? '#0a0f1a' : '#fafbfc',
          backgroundImage: 'none',
          borderLeft: 'none',
          boxShadow: '-16px 0 48px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
        }
      }}
    >
      {/* ═══════════ HEADER — translucent tinted, scrolls under ═══════════ */}
      <Box sx={{ 
        px: 3, pt: 2.5, pb: 2,
        borderBottom: `1px solid ${alpha(accentColor, 0.12)}`,
        position: 'sticky',
        top: 0,
        zIndex: 20,
        bgcolor: isDark 
          ? alpha(accentColor, 0.06)
          : alpha(accentColor, 0.04),
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}>
        {/* Top Row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              px: 1.5, py: 0.5, 
              borderRadius: '8px', 
              bgcolor: alpha(accentColor, isDark ? 0.15 : 0.1),
              border: `1px solid ${alpha(accentColor, 0.25)}`,
            }}>
              <Typography sx={{ 
                fontWeight: 800, fontSize: '0.68rem', 
                textTransform: 'uppercase', letterSpacing: '0.08em', 
                color: accentColor, lineHeight: 1.4,
              }}>
                {getBlockLabel()}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#64748b' : '#94a3b8' }}>
              {comments.length} {comments.length === 1 ? 'reply' : 'replies'}
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose} size="small"
            sx={{ width: 30, height: 30, bgcolor: alpha(accentColor, 0.08), '&:hover': { bgcolor: alpha(accentColor, 0.15) } }}
          >
            <CloseIcon sx={{ fontSize: 16, color: accentColor }} />
          </IconButton>
        </Box>

        {/* Prompt */}
        <Typography sx={{ 
          fontWeight: 700, fontSize: '1rem', 
          color: isDark ? '#f1f5f9' : '#0f172a', 
          lineHeight: 1.45, letterSpacing: '-0.01em',
        }}>
          {getPrompt()}
        </Typography>
      </Box>

      {/* ═══════════ THREAD ═══════════ */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} sx={{ color: accentColor }} />
          </Box>
        )}

        {!loading && comments.map((comment) => {
          const isLiked = likedComments.has(comment.id);
          return (
            <Box 
              key={comment.id} 
              sx={{ 
                px: 3, py: 2,
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                transition: 'background-color 0.15s ease',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)' },
              }}
            >
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Avatar 
                  src={comment.avatarUrl} 
                  sx={{ width: 32, height: 32, mt: 0.25, fontSize: '0.8rem' }}
                >
                  {comment.displayName?.charAt(0) || '?'}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {/* Name Row */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: isDark ? '#e2e8f0' : '#1e293b', lineHeight: 1.3 }}>
                      {comment.displayName || 'Anonymous'}
                    </Typography>
                    {comment.userId && (
                      <VerifiedIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                    )}
                    <Typography sx={{ fontSize: '0.72rem', color: isDark ? '#475569' : '#94a3b8' }}>
                      · {timeAgo(new Date(comment.createdAt))}
                    </Typography>
                  </Box>

                  {/* Text */}
                  <Typography sx={{ 
                    fontSize: '0.85rem', fontWeight: 400,
                    lineHeight: 1.55, 
                    color: isDark ? 'rgba(255,255,255,0.78)' : '#475569',
                    mb: 0.75, wordBreak: 'break-word',
                  }}>
                    {comment.text}
                  </Typography>
                  
                  {/* Actions */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: -0.5 }}>
                    <Box 
                      onClick={() => handleLike(comment.id)}
                      sx={{ 
                        display: 'flex', alignItems: 'center', gap: 0.5, 
                        cursor: isLiked ? 'default' : 'pointer', 
                        p: 0.5, borderRadius: '8px',
                        color: isLiked ? '#ef4444' : (isDark ? '#475569' : '#94a3b8'), 
                        transition: 'all 0.15s',
                        '&:hover': isLiked ? {} : { color: '#ef4444', bgcolor: alpha('#ef4444', 0.08) } 
                      }}
                    >
                      {isLiked 
                        ? <HeartFilledIcon sx={{ fontSize: 15 }} /> 
                        : <HeartIcon sx={{ fontSize: 15 }} />
                      }
                      {comment.likes > 0 && (
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          {comment.likes}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ 
                      display: 'flex', alignItems: 'center', gap: 0.5, 
                      cursor: 'pointer', p: 0.5, borderRadius: '8px',
                      color: isDark ? '#475569' : '#94a3b8', 
                      transition: 'all 0.15s',
                      '&:hover': { color: accentColor, bgcolor: alpha(accentColor, 0.08) } 
                    }}>
                      <ChatIcon sx={{ fontSize: 14 }} />
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Reply</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        })}

        {/* Empty State */}
        {!loading && comments.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <ChatIcon sx={{ fontSize: 36, color: isDark ? '#1e293b' : '#e2e8f0', mb: 1 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: isDark ? '#475569' : '#94a3b8', mb: 0.5 }}>
              No replies yet
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: isDark ? '#334155' : '#cbd5e1' }}>
              Be the first to share your perspective.
            </Typography>
          </Box>
        )}
      </Box>

      {/* ═══════════ COMPOSE ═══════════ */}
      <Box sx={{ 
        px: 3, py: 2,
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        bgcolor: isDark ? 'rgba(10,15,26,0.97)' : 'rgba(250,251,252,0.97)',
        backdropFilter: 'blur(24px)',
        position: 'sticky',
        bottom: 0,
        zIndex: 20,
      }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
          <Avatar 
            src={profile?.avatarUrl} 
            sx={{ width: 32, height: 32, mb: 0.5, fontSize: '0.75rem' }}
          >
            {profile?.firstName?.charAt(0) || '?'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <PremiumTextField
              fullWidth
              multiline
              colorTheme={accentColor}
              maxRows={3}
              placeholder={profile ? "Post your reply..." : "Reply as anonymous..."}
              value={commentText}
              onChange={(e: any) => setCommentText(e.target.value)}
              size="small"
              label=""
              sx={{
                '& .MuiFilledInput-root': {
                  pt: '10px !important',
                  pb: '10px !important',
                }
              }}
            />
          </Box>
          <IconButton 
            disabled={!commentText.trim() || posting}
            onClick={handlePost}
            sx={{ 
              width: 36, height: 36,
              mb: 0.5,
              borderRadius: '12px',
              bgcolor: commentText.trim() ? accentColor : 'transparent',
              color: commentText.trim() ? '#fff' : (isDark ? '#334155' : '#cbd5e1'),
              transition: 'all 0.2s',
              '&:hover': { 
                bgcolor: commentText.trim() ? alpha(accentColor, 0.85) : 'transparent',
              },
              '&.Mui-disabled': {
                color: isDark ? '#334155' : '#cbd5e1',
              }
            }}
          >
            {posting 
              ? <CircularProgress size={16} sx={{ color: '#fff' }} />
              : <SendIcon sx={{ fontSize: 16 }} />
            }
          </IconButton>
        </Box>
      </Box>

    </Drawer>
  );
};
