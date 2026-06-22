'use client';

import { useState, useEffect, useCallback } from 'react';
import { getConversations, getChatThread, ChatConversation, ChatMessage } from '@/lib/actions/chat';

export function useConversationList(firebaseUid: string | undefined | null) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUid) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    const fetchConvos = async () => {
      try {
        const data = await getConversations(firebaseUid);
        setConversations(data);
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConvos();
    const interval = setInterval(fetchConvos, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [firebaseUid]);

  return { conversations, isLoading };
}

export function useChatThread(conversationId: string | null, firebaseUid: string | undefined | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    if (!conversationId || !firebaseUid) {
      setMessages([]);
      setIsInitialLoading(true);
      return;
    }

    const fetchThread = async () => {
      try {
        const data = await getChatThread(conversationId);
        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch chat thread", err);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchThread();
    const interval = setInterval(fetchThread, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [conversationId, firebaseUid]);

  const loadMoreMessages = useCallback(() => {}, []);
  const isLoadingMore = false;
  const hasMore = false;

  return { messages, isInitialLoading, isLoadingMore, hasMore, loadMoreMessages };
}
