"use client";

import React, { FC, useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import MessageItem from './MessageItem';
import MessageItemSkeleton from './MessageItemSkeleton';
import { ChatMessage } from '@/lib/actions/chat';

interface MessageListProps {
  messages: ChatMessage[];
  currentUserUid: string | undefined | null;
  hasMore: boolean;
  loadMoreMessages: () => void;
  isLoadingMore: boolean;
  isInitialLoading: boolean;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
}

const MessageList: FC<MessageListProps> = ({
  messages,
  currentUserUid,
  hasMore,
  loadMoreMessages,
  isLoadingMore,
  isInitialLoading,
  messagesContainerRef,
}) => {
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isInitialLoading) {
          loadMoreMessages();
        }
      },
      { root: messagesContainerRef.current, threshold: 0.1 }
    );

    const currentTrigger = loadMoreTriggerRef.current;
    if (currentTrigger) observer.observe(currentTrigger);
    return () => { if (currentTrigger) observer.unobserve(currentTrigger); };
  }, [hasMore, loadMoreMessages, isLoadingMore, isInitialLoading, messagesContainerRef]);

  if (isInitialLoading) {
    return (
      <Box ref={messagesContainerRef} sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
        {Array.from(new Array(8)).map((_, index) => (
          <MessageItemSkeleton key={`skeleton-${index}`} isSender={index % 2 === 0} />
        ))}
      </Box>
    );
  }

  return (
    <Box
      ref={messagesContainerRef}
      sx={{
        flexGrow: 1, overflowY: 'auto', p: 1,
        display: 'flex', flexDirection: 'column-reverse',
        background: "transparent" 
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={msg}
            currentUserUid={currentUserUid}
          />
        ))}
      </Box>
      <Box ref={loadMoreTriggerRef} sx={{ display: 'flex', justifyContent: 'center', p: 2, minHeight: '40px' }}>
        {isLoadingMore ? (
          <CircularProgress size={24} />
        ) : !hasMore && messages.length > 0 ? (
          <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
            No more messages.
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
};

export default MessageList;
