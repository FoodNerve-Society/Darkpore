"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Box, List, CircularProgress, Typography, Skeleton, Stack, Avatar, alpha } from '@mui/material';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import { useWindowSize } from '@uidotdev/usehooks';
import { useSociety } from '@/context/SocietyContext';
import { useConversationList, useChatThread } from './hooks/useChat';
import { ChatConversation, sendMessage, markConversationAsRead } from '@/lib/actions/chat';

import ConversationListItem from './components/ConversationListItem';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import { uploadFilesToStorage } from '@/utils/storage';

interface ChatInterfaceProps {
  // If a conversation is initiated from Rolodex, it gets passed here to auto-open
  initialConversationId?: string;
}

export default function ChatInterface({ initialConversationId }: ChatInterfaceProps) {
  const { user, profile, loading: authLoading } = useSociety();
  const isMobile = (useWindowSize().width ?? 0) < 768;
  
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const { conversations, isLoading: isLoadingConversations } = useConversationList(user?.uid);
  const { messages, isInitialLoading: isLoadingMessages, isLoadingMore, hasMore, loadMoreMessages } = useChatThread(selectedConversation?.key || null, user?.uid);

  // Auto-open conversation if passed via props (e.g. from Rolodex)
  useEffect(() => {
    if (initialConversationId && conversations.length > 0) {
      const target = conversations.find(c => c.key === initialConversationId);
      if (target && selectedConversation?.key !== initialConversationId) {
        setSelectedConversation(target);
      }
    }
  }, [initialConversationId, conversations]);

  // Scroll to bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container && selectedConversation && !isLoadingMessages) {
      container.scrollTop = container.scrollHeight;
    }
  }, [selectedConversation, isLoadingMessages, messages.length]);

  // Mark as read when opening a conversation
  useEffect(() => {
    if (selectedConversation && user?.uid && !selectedConversation.isRead) {
       markConversationAsRead(selectedConversation.key, user.uid).catch(console.error);
    }
  }, [selectedConversation, user?.uid, messages.length]);

  const handleSendMessage = useCallback(async () => {
    if (!user || !selectedConversation || isSendingMessage || (!newMessageText.trim() && selectedFiles.length === 0)) {
      return;
    }
    
    setIsSendingMessage(true);
    const textToSend = newMessageText;
    const filesToSend = selectedFiles;
    
    setNewMessageText("");
    setSelectedFiles([]);

    try {
      let imageUrls: string[] | undefined = undefined;
      
      if (filesToSend.length > 0) {
        const storagePath = `messageMedia/${selectedConversation.key}`;
        imageUrls = await uploadFilesToStorage(filesToSend, storagePath);
      }

      await sendMessage(selectedConversation.key, user.uid, textToSend, imageUrls);
    } catch (error) {
      console.error("Failed to send message:", error);
      setNewMessageText(textToSend); // Restore on fail
      alert(`Failed to send message: ${error instanceof Error ? error.message : "Please try again."}`);
    } finally {
      setIsSendingMessage(false);
    }
  }, [user, selectedConversation, newMessageText, selectedFiles, isSendingMessage]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length === 0) return;
    
    const totalFiles = selectedFiles.length + files.length;
    if (totalFiles > 5) {
      alert("You can select a maximum of 5 media files.");
      event.target.value = '';
      return;
    }
    setSelectedFiles(prevFiles => [...prevFiles, ...files]);
    event.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (authLoading) {
    return <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}><CircularProgress /></Box>;
  }

  const renderConversationSkeleton = (key: number) => (
    <Box key={key} sx={{ display: 'flex', alignItems: 'center', p: '1.5vmin', borderBottom: '1px solid #E0E0E0' }}>
      <Skeleton variant="circular" width={'5vmin'} height={'5vmin'} sx={{ mr: '1vmin' }} />
      <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="90%" />
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "row", overflow: 'hidden' }}>
      
      {/* Sidebar - Conversation List */}
      <Box sx={{ 
        width: isMobile 
          ? (selectedConversation ? '0%' : '100%') 
          : (selectedConversation ? '30%' : '100%'), 
        minWidth: 0, 
        display: 'flex', 
        flexDirection: "column", 
        transition: 'width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)', 
        visibility: isMobile && selectedConversation ? 'hidden' : 'visible',
        bgcolor: 'transparent',
        alignItems: !selectedConversation && !isMobile ? 'center' : 'stretch'
      }}>
        <List sx={{ 
          width: '100%',
          maxWidth: !selectedConversation && !isMobile ? '800px' : 'none',
          flexGrow: 1, 
          overflowY: 'auto', 
          p: 0, 
          pt: { xs: '84px', md: '110px' }, 
          pb: 4,
          '&::-webkit-scrollbar': { display: 'none' },
          transition: 'max-width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}>
            {isLoadingConversations ? (
                Array.from(new Array(10)).map((_, i) => renderConversationSkeleton(i))
            ) : conversations.length > 0 ? (
                conversations.map(convo => (
                    <ConversationListItem 
                      key={convo.key} 
                      conversation={convo} 
                      isSelected={selectedConversation?.key === convo.key} 
                      onClick={() => setSelectedConversation(convo)} 
                      currentUserUid={user?.uid} 
                    />
                ))
            ) : (
                <Box sx={{ 
                  textAlign: 'center', p: { xs: 4, md: 8 }, maxWidth: 400, mx: 'auto', mt: 4,
                  display: 'flex', flexDirection: 'column', alignItems: 'center'
                }}>
                   <Box sx={{ position: 'relative', display: 'inline-flex', mb: 4 }}>
                     <CircularProgress size={80} thickness={1.5} sx={{ color: alpha('#6366f1', 0.1), position: 'absolute', zIndex: 0 }} />
                     <CircularProgress size={80} thickness={1.5} disableShrink sx={{ color: '#6366f1', animationDuration: '2.5s', strokeLinecap: 'round' }} />
                     <Avatar sx={{ width: 56, height: 56, bgcolor: 'white', color: '#6366f1', position: 'absolute', top: 12, left: 12, zIndex: 1, boxShadow: '0 4px 12px rgba(99,102,241,0.15)' }}>
                        <HourglassEmptyRoundedIcon />
                     </Avatar>
                   </Box>
                   
                   <Typography variant="h6" sx={{ 
                      fontWeight: 800, mb: 1.5,
                      background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: 'pulse 2s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.5 }
                      }
                   }}>
                      Syncing Community Nodes...
                   </Typography>
                   <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
                      Finalizing your channel assignments.<br/>Flip to the Rolodex to discover experts now.
                   </Typography>
                </Box>
            )}
        </List>
      </Box>

      {/* Main Chat Thread Area */}
      <Box sx={{ 
        width: isMobile 
          ? (selectedConversation ? '100%' : '0%') 
          : (selectedConversation ? '70%' : '0%'), 
        display: 'flex', 
        flexDirection: "column", 
        transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)', 
        visibility: !selectedConversation ? 'hidden' : 'visible',
        opacity: !selectedConversation ? 0 : 1,
        bgcolor: 'rgba(250, 250, 250, 0.5)',
        borderLeft: selectedConversation && !isMobile ? '1px solid rgba(0,0,0,0.05)' : 'none'
      }}>
        {selectedConversation ? (
          <>
            <ChatHeader
              isMobile={isMobile}
              selectedConversation={selectedConversation}
              onCloseChat={() => setSelectedConversation(null)}
              isLoading={isLoadingConversations}
            />

            <MessageList
              messages={messages}
              currentUserUid={user?.uid}
              hasMore={hasMore}
              loadMoreMessages={loadMoreMessages}
              isLoadingMore={isLoadingMore}
              isInitialLoading={isLoadingMessages}
              messagesContainerRef={messagesContainerRef}
            />

            <MessageInput
              newMessageText={newMessageText}
              setNewMessageText={setNewMessageText}
              sendMessage={handleSendMessage}
              handleFileChange={handleFileChange}
              isLoading={isSendingMessage}
              selectedFiles={selectedFiles}
              onRemoveFile={handleRemoveFile}
            />
          </>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.6 }}>
             <Typography variant="h5" sx={{ fontFamily: 'Dosis, sans-serif' }}>Modular Society Messages</Typography>
             <Typography variant="body1">Select a chat to start messaging</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
