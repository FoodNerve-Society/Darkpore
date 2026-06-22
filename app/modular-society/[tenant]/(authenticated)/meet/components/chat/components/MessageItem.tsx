"use client";

import React from 'react';
import { Typography, Box, Paper, alpha } from '@mui/material';
import { Check, DoneAll } from '@mui/icons-material';
import { format, isToday, isYesterday } from 'date-fns';
import { ChatMessage } from '@/lib/actions/chat';

interface MessageItemProps {
  message: ChatMessage;
  currentUserUid: string | undefined | null;
}

const formatMessageTimestamp = (timestamp: number): string => {
  if (!timestamp) return "Sending...";
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Processing...";
    if (isToday(date)) return format(date, 'p');
    if (isYesterday(date)) return `Yesterday ${format(date, 'p')}`;
    return format(date, 'MMM d, p');
  } catch {
    return "Invalid time";
  }
};

export default function MessageItem({
  message,
  currentUserUid,
}: MessageItemProps) {
  if (!message || !message.id) return null;

  const isSender = message.sender === currentUserUid;
  const formattedTime = formatMessageTimestamp(message.timestamp);

  const renderReadStatus = (isCurrentlySender: boolean) => {
    const iconColorForSender = 'rgba(255, 255, 255, 0.7)';
    const iconColorForReceiver = 'rgba(0, 0, 0, 0.54)';
    const currentIconColor = isCurrentlySender ? iconColorForSender : iconColorForReceiver;
    
    if (message.status === 'read') {
      return <DoneAll fontSize="inherit" style={{ color: '#4FC3F7', verticalAlign: 'middle' }} />;
    }
    if (message.status === 'delivered') {
      return <DoneAll fontSize="inherit" style={{ color: currentIconColor, verticalAlign: 'middle' }} />;
    }
    return <Check fontSize="inherit" style={{ color: currentIconColor, verticalAlign: 'middle' }} />;
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: isSender ? 'flex-end' : 'flex-start', marginY: 0.5, paddingX: 1 }}>
      <Paper elevation={1} sx={{ 
        padding: '8px 12px', 
        borderRadius: '18px', 
        borderTopLeftRadius: isSender ? '18px' : '4px', 
        borderTopRightRadius: isSender ? '4px' : '18px', 
        maxWidth: '75%', 
        minWidth: '80px', 
        backgroundColor: isSender ? '#6366f1' : '#FFFFFF', 
        color: isSender ? 'white' : 'black',
        boxShadow: isSender ? '0 4px 12px rgba(99, 102, 241, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}>
        
        {/* Simple image renderer since we don't have MediaViewer */}
        {message.images && message.images.length > 0 && (
           <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
             {message.images.map((img, i) => (
               <img key={i} src={img} alt="attachment" style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '200px', objectFit: 'cover' }} />
             ))}
           </Box>
        )}

        {message.text && (
          <Typography component="div" sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '0.95rem',
            lineHeight: 1.5,
          }}>
            {message.text}
          </Typography>
        )}

        <Box sx={{ textAlign: 'right', fontSize: '0.7rem', color: isSender ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)', marginTop: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <span style={{ fontFamily: 'system-ui, sans-serif' }}>{formattedTime}</span>
          <Box component="span" sx={{ marginLeft: 0.5, display: 'inline-flex', alignItems: 'center', height: '1em' }}>
            {renderReadStatus(isSender)}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
