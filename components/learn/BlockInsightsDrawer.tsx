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
  Verified as VerifiedIcon 
} from '@mui/icons-material';
import { useSociety } from '@/context/SocietyContext';

export interface BlockInsightsDrawerProps {
  open: boolean;
  onClose: () => void;
  blockId: string | null;
}

export const BlockInsightsDrawer: React.FC<BlockInsightsDrawerProps> = ({ open, onClose, blockId }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { profile } = useSociety();
  const [commentText, setCommentText] = useState('');

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
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
        bgcolor: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(248,250,252,0.9)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: isDark ? '#f8fafc' : '#0f172a' }}>
            Block Insights
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b' }}>
            Join the conversation for this specific section
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Comments List */}
      <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
        {comments.map((comment) => (
          <Box key={comment.id} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Avatar src={comment.avatar} sx={{ width: 40, height: 40 }} />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: isDark ? '#f8fafc' : '#0f172a' }}>
                    {comment.user}
                  </Typography>
                  {comment.isRank4 && (
                    <VerifiedIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                  )}
                  <Typography sx={{ fontSize: '0.75rem', color: isDark ? '#64748b' : '#94a3b8', ml: 'auto' }}>
                    {comment.time}
                  </Typography>
                </Box>
                <Typography sx={{ 
                  fontSize: '0.95rem', 
                  lineHeight: 1.5, 
                  color: isDark ? 'rgba(255,255,255,0.8)' : '#334155',
                  mb: 1.5
                }}>
                  {comment.text}
                </Typography>
                
                {/* Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', '&:hover': { color: '#8b5cf6' } }}>
                    <ThumbUpIcon sx={{ fontSize: 16, color: isDark ? '#64748b' : '#94a3b8' }} />
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: isDark ? '#64748b' : '#94a3b8' }}>
                      {comment.likes}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: isDark ? '#64748b' : '#94a3b8', cursor: 'pointer', '&:hover': { color: '#8b5cf6' } }}>
                    Reply
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Input Area (Glassmorphic bottom) */}
      <Box sx={{ 
        p: 3, 
        pt: 2,
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
        bgcolor: isDark ? 'rgba(15,23,42,0.8)' : 'rgba(248,250,252,0.8)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        bottom: 0,
        zIndex: 10
      }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Avatar src={profile?.avatarUrl} sx={{ width: 40, height: 40 }} />
          <Box sx={{ flex: 1, position: 'relative' }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Add your insight..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: isDark ? 'rgba(0,0,0,0.2)' : '#fff',
                  borderRadius: '16px',
                  fontSize: '0.95rem',
                  p: 1.5,
                  '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                  '&:hover fieldset': { borderColor: '#8b5cf6' },
                  '&.Mui-focused fieldset': { borderColor: '#8b5cf6', borderWidth: '1px' }
                }
              }}
            />
            <IconButton 
              disabled={!commentText.trim()}
              sx={{ 
                position: 'absolute', 
                bottom: 8, 
                right: 8,
                bgcolor: commentText.trim() ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                color: commentText.trim() ? '#fff' : (isDark ? '#475569' : '#cbd5e1'),
                '&:hover': {
                  bgcolor: commentText.trim() ? '#7c3aed' : undefined
                }
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
