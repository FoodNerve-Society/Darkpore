"use client";

import React, { useRef } from 'react';
import { TextField, IconButton, Box, Typography, Chip } from '@mui/material';
import { CollectionsRounded, ArrowUpwardRounded, Close as CloseIcon } from '@mui/icons-material';

interface MessageInputProps {
  newMessageText: string;
  setNewMessageText: (text: string) => void;
  sendMessage: () => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
}

export default function MessageInput({
  newMessageText,
  setNewMessageText,
  sendMessage,
  handleFileChange,
  isLoading,
  selectedFiles,
  onRemoveFile,
}: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (canSendMessage) sendMessage();
    }
  };

  const canSendMessage = !isLoading && (newMessageText.trim() !== "" || selectedFiles.length > 0);

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 -4px 32px rgba(99, 102, 241, 0.05)',
      flexShrink: 0
    }}>
      {selectedFiles.length > 0 && (
        <Box sx={{ p: 1, display: 'flex', gap: 1, flexWrap: 'wrap', borderBottom: '1px solid #f0f0f0' }}>
          {selectedFiles.map((f, i) => (
             <Chip 
               key={i} 
               label={f.name} 
               onDelete={() => onRemoveFile(i)}
               deleteIcon={<CloseIcon />}
               size="small"
             />
          ))}
        </Box>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', p: '1vmin' }}>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple accept="image/*" onChange={handleFileChange} />
        <IconButton onClick={handleMediaIconClick} sx={{ color: '#6366f1', mr: '0.5vmin' }} aria-label="Add media">
          <CollectionsRounded />
        </IconButton>
        <TextField
          variant="outlined"
          fullWidth
          placeholder="Type a message..."
          value={newMessageText}
          onChange={(e) => setNewMessageText(e.target.value)}
          disabled={isLoading}
          multiline
          minRows={1}
          maxRows={4}
          size="small"
          onKeyDown={handleKeyDown}
          sx={{
            mr: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              transition: 'all 0.3s ease',
              '& fieldset': { border: 'none' },
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
              },
              '&.Mui-focused': {
                background: '#ffffff',
                boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.5)',
              },
              '& .MuiInputBase-input': {
                fontFamily: 'system-ui, sans-serif',
                fontSize: '0.95rem',
              },
            },
            '& .MuiInputBase-inputMultiline': {
              paddingTop: '4px',
              paddingBottom: '4px',
            }
          }}
        />
        <IconButton
          onClick={sendMessage}
          disabled={!canSendMessage}
          aria-label="send message"
          sx={{
            backgroundColor: canSendMessage ? '#6366f1' : 'action.disabledBackground',
            color: canSendMessage ? 'white' : 'action.disabled',
            width: '40px',
            height: '40px',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: canSendMessage ? '#4f46e5' : 'action.disabledBackground',
              transform: canSendMessage ? 'scale(1.05)' : 'none',
            },
          }}
        >
          <ArrowUpwardRounded />
        </IconButton>
      </Box>
    </Box>
  );
}
