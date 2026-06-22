// @ts-nocheck
'use client';

import React from 'react';
import { Box, Card, CardContent, Typography, Avatar, Stack, Chip, IconButton, Divider, alpha, Button } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';
import VerifiedIcon from '@mui/icons-material/Verified';

interface CommunityPostProps {
  id: string;
  author: {
    name: string;
    avatar: string | null;
    role: string;
    rank: number;
    isVerified: boolean;
  };
  groupName: string;
  timeAgo: string;
  category: string;
  subcategory: string;
  likes?: number;
  blocks: { type: string; content: string }[];
}

export default function CommunityPostCard({ post }: { post: CommunityPostProps }) {
  // Map rank to color (matching SocietyContext)
  const rankColor = post.author.rank >= 4 ? '#7c4dff' : post.author.rank === 3 ? '#ff9800' : '#4caf50';

  return (
    <Card 
      elevation={0}
      sx={{ 
        mb: 3, 
        borderRadius: 4, 
        border: '1px solid rgba(0,0,0,0.05)',
        bgcolor: '#ffffff',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: '0 12px 40px rgba(0,0,0,0.04)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ p: '24px !important' }}>
        {/* Header: Author + Group info */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar 
              src={post.author.avatar || undefined} 
              sx={{ 
                width: 48, height: 48, 
                border: `2px solid ${alpha(rankColor, 0.2)}`,
                bgcolor: '#e2e8f0',
                fontWeight: 700
              }}
            >
              {post.author.name?.[0]}
            </Avatar>
            <Box>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  {post.author.name}
                </Typography>
                {post.author.isVerified && <VerifiedIcon sx={{ fontSize: 16, color: '#1DA1F2' }} />}
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                {post.author.role} • 
                <Chip 
                  size="small" 
                  label={post.groupName} 
                  sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(0,0,0,0.04)' }} 
                />
                • {post.timeAgo}
              </Typography>
            </Box>
          </Stack>

          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <MoreHorizIcon />
          </IconButton>
        </Box>

        {/* The Matrix Tags (Category) */}
        <Box sx={{ mb: 2 }}>
          <Chip 
            label={`${post.category} > ${post.subcategory}`} 
            size="small"
            sx={{ 
              bgcolor: alpha('#6366f1', 0.1), 
              color: '#4f46e5', 
              fontWeight: 800, 
              fontSize: '0.7rem',
              borderRadius: 2
            }} 
          />
        </Box>

        {/* 9-Block Content Excerpt */}
        <Box sx={{ mb: 3 }}>
          {post.blocks.map((block, idx) => (
            <Box key={idx} sx={{ mb: 2 }}>
              {block.type === 'deep_analysis' && (
                <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  {block.content}
                </Typography>
              )}
              {block.type === 'myth_fact' && (
                <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, borderLeft: '4px solid #6366f1' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#6366f1', mb: 0.5 }}>Myth vs Fact</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>{block.content}</Typography>
                </Box>
              )}
            </Box>
          ))}
          <Button size="small" sx={{ textTransform: 'none', fontWeight: 700, p: 0, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}>
            Read full intelligence block...
          </Button>
        </Box>

        <Divider sx={{ my: 2, opacity: 0.6 }} />

        {/* Action Bar — uses dynamic likes */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1}>
            <Button startIcon={<FavoriteBorderIcon />} sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}>{post.likes ?? 0}</Button>
            <Button startIcon={<CommentIcon />} sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}>0</Button>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Button startIcon={<ShareIcon />} sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}>Share</Button>
            <Button 
              variant="contained" 
              startIcon={<EmojiEventsIcon />}
              sx={{ 
                bgcolor: 'rgba(0,0,0,0.9)', color: 'white', textTransform: 'none', fontWeight: 700, borderRadius: 3,
                '&:hover': { bgcolor: 'black' }
              }}
            >
              Support (10 NP)
            </Button>
          </Stack>
        </Stack>

      </CardContent>
    </Card>
  );
}
