'use client';

import React from 'react';
import { ListItemButton, ListItemAvatar, Avatar, ListItemText, Typography, Box, Badge } from '@mui/material';
import { ChatConversation } from '@/lib/actions/chat';
import { formatDistanceToNowStrict } from 'date-fns';

const stringToColor = (string: string) => {
  let hash = 0;
  let i;
  for (i = 0; i < string.length; i += 1) hash = string.charCodeAt(i) + ((hash << 5) - hash);
  let color = '#';
  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

interface ConversationListItemProps {
  conversation: ChatConversation;
  isSelected: boolean;
  onClick: () => void;
  currentUserUid: string | undefined | null;
}

export default function ConversationListItem({
  conversation,
  isSelected,
  onClick,
  currentUserUid
}: ConversationListItemProps) {
  
  const timeString = conversation.timestamp 
    ? formatDistanceToNowStrict(new Date(conversation.timestamp), { addSuffix: false })
    : '';
    
  // Shrink 'minutes' to 'm', 'hours' to 'h', etc. to save space
  const shortTime = timeString
    .replace(' seconds', 's')
    .replace(' second', 's')
    .replace(' minutes', 'm')
    .replace(' minute', 'm')
    .replace(' hours', 'h')
    .replace(' hour', 'h')
    .replace(' days', 'd')
    .replace(' day', 'd');

  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        bgcolor: isSelected ? 'rgba(99,102,241,0.08)' : 'transparent',
        borderRadius: 3,
        mx: 1,
        mb: 0.5,
        transition: 'all 0.2s',
        '&:hover': { bgcolor: isSelected ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.04)' },
      }}
    >
      <ListItemAvatar>
        <Badge 
          color="error" 
          variant="dot" 
          invisible={conversation.isRead || conversation.sender === currentUserUid}
        >
          <Avatar 
            src={conversation.otherPic}
            sx={{ bgcolor: !conversation.otherPic ? stringToColor(conversation.otherName || 'U') : undefined }}
          >
            {(conversation.otherName || 'U').charAt(0).toUpperCase()}
          </Avatar>
        </Badge>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: isSelected ? 'bold' : 'medium' }}>
              {conversation.otherName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, flexShrink: 0 }}>
              {shortTime}
            </Typography>
          </Box>
        }
        secondary={
          <Typography variant="body2" color="text.secondary" noWrap>
            {conversation.text || 'Image'}
          </Typography>
        }
      />
    </ListItemButton>
  );
}
