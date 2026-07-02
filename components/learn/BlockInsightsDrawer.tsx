'use client';

import React, { useState } from 'react';
import { 
  Drawer, Box, Typography, IconButton, TextField, 
  Avatar, alpha, useTheme 
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Send as SendIcon, 
  ThumbUpOutlined as ThumbUpIcon,
  Verified as VerifiedIcon,
  ChatBubbleOutlined as ChatIcon,
  IosShare as ShareIcon
} from '@mui/icons-material';
import { useSociety } from '@/context/SocietyContext';

export interface BlockInsightsDrawerProps {
  open: boolean;
  onClose: () => void;
  blockId: string | null;
  activeBlock?: any;
}

export const BlockInsightsDrawer: React.FC<BlockInsightsDrawerProps> = ({ open, onClose, blockId, activeBlock }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { profile } = useSociety();
  const [commentText, setCommentText] = useState('');

  // Parse activeBlock content if it's a string
  let parsedContent = activeBlock?.content || {};
  if (typeof parsedContent === 'string') {
    try {
      parsedContent = JSON.parse(parsedContent);
    } catch (e) {}
  }

  const getContextSnippet = () => {
    if (!parsedContent) return 'Selected Block';
    return parsedContent.text || 
           parsedContent.discussionPrompt || 
           parsedContent.bionicText?.replace(/<[^>]+>/g, '') || 
           parsedContent.heading ||
           parsedContent.myth ||
           parsedContent.quote ||
           parsedContent.question ||
           'Selected Block';
  };

  // Mock comments for demonstration
  const comments = [
    {
      id: 1,
      user: 'Dr. Sarah Jenkins',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      text: 'I\'ve seen this happen in our engineering team. It\'s usually a communication breakdown between the field operations and the strategic planners.',
      time: '2 hours ago',
      likes: 12,
      isRank4: true
    },
    {
      id: 2,
      user: 'Marcus T.',
      avatar: 'https://i.pravatar.cc/150?u=marcus',
      text: 'Exactly! We implemented a twice-a-week sync and it completely eliminated the bottleneck. The key is mandatory cross-departmental alignment.',
      time: '5 hours ago',
      likes: 4,
      isRank4: false
    }
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      // @ts-ignore
      PaperProps={{
        style: { width: 450, maxWidth: '100%' },
        sx: {
          bgcolor: isDark ? '#0f172a' : '#f8fafc',
          backgroundImage: 'none',
          borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
          boxShadow: '-8px 0 24px rgba(0,0,0,0.2)'
        }
      }}
    >
      {/* Premium Header */}
      <Box sx={{ 
        p: 3, 
        pb: 2,
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
        bgcolor: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 20
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8b5cf6' }}>
              {activeBlock ? String(activeBlock.blockType).replace('_', ' ') : 'Insights'}
            </Typography>
            <Box sx={{ px: 1, py: 0.25, borderRadius: '100px', bgcolor: alpha('#8b5cf6', 0.1), color: '#8b5cf6', fontSize: '0.7rem', fontWeight: 800 }}>
              {comments.length} Comments
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ mt: -1, mr: -1, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: isDark ? '#f8fafc' : '#0f172a', lineHeight: 1.4 }}>
          {parsedContent?.discussionPrompt || parsedContent?.anchorQuestion || parsedContent?.question || 'What are your thoughts on this section?'}
        </Typography>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        
        {comments.map((comment) => (
          <Box key={comment.id} sx={{ 
            p: 3, 
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            transition: 'background-color 0.2s',
            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }
          }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Avatar src={comment.avatar} sx={{ width: 44, height: 44 }} />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: isDark ? '#f8fafc' : '#0f172a' }}>
                    {comment.user}
                  </Typography>
                  {comment.isRank4 && (
                    <VerifiedIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                  )}
                  <Typography sx={{ fontSize: '0.85rem', color: isDark ? '#64748b' : '#94a3b8' }}>
                    · {comment.time}
                  </Typography>
                </Box>
                <Typography sx={{ 
                  fontSize: '1rem', 
                  lineHeight: 1.5, 
                  color: isDark ? 'rgba(255,255,255,0.9)' : '#1e293b',
                  mb: 1.5
                }}>
                  {comment.text}
                </Typography>
                
                {/* Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', color: isDark ? '#64748b' : '#94a3b8', '&:hover': { color: '#ef4444' } }}>
                    <ThumbUpIcon sx={{ fontSize: 18 }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {comment.likes}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', color: isDark ? '#64748b' : '#94a3b8', '&:hover': { color: '#8b5cf6' } }}>
                    <ChatIcon sx={{ fontSize: 18 }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      Reply
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', color: isDark ? '#64748b' : '#94a3b8', '&:hover': { color: '#10b981' } }}>
                    <ShareIcon sx={{ fontSize: 18 }} />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Input Area */}
      <Box sx={{ 
        p: 2, px: 3,
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
        bgcolor: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        bottom: 0,
        zIndex: 20
      }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Avatar src={profile?.avatarUrl} sx={{ width: 40, height: 40 }} />
          <Box sx={{ 
            flex: 1, 
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)',
            borderRadius: '24px',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            transition: 'all 0.2s',
            '&:focus-within': { borderColor: '#8b5cf6', boxShadow: `0 0 0 2px ${alpha('#8b5cf6', 0.2)}` }
          }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Post your reply..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              variant="standard"
              InputProps={{ disableUnderline: true }}
              sx={{
                p: 1.5,
                px: 2,
                fontSize: '0.95rem',
                color: isDark ? '#fff' : '#0f172a'
              }}
            />
            <IconButton 
              disabled={!commentText.trim()}
              sx={{ 
                mr: 1,
                bgcolor: commentText.trim() ? '#8b5cf6' : 'transparent',
                color: commentText.trim() ? '#fff' : (isDark ? '#475569' : '#cbd5e1'),
                '&:hover': { bgcolor: commentText.trim() ? '#7c3aed' : 'transparent' }
              }}
            >
              <SendIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

    </Drawer>
  );
};
