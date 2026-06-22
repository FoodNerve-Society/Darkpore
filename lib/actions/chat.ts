'use server';

import { prisma } from '@/lib/db/client';

export interface ChatMessage {
  id: string;
  sender: string; // The firebaseUid of the sender
  text: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read' | 'pending' | 'approved' | 'declined' | 'cancelled';
  images?: string[];
  type?: string;
}

export interface ChatConversation {
  key: string; // conversation.id
  otherUid: string; // The firebaseUid of the other user
  otherName: string;
  otherPic: string;
  text: string; // Latest message text
  timestamp: number;
  isRead: boolean;
  sender: string; // firebaseUid of latest message sender
  numberOfUnreadMessages: number;
}

/**
 * Fetch all conversations for a user.
 */
export async function getConversations(firebaseUid: string): Promise<ChatConversation[]> {
  const user = await prisma.user.findUnique({
    where: { firebaseUid },
    select: { id: true }
  });

  if (!user) throw new Error("User not found");

  const participants = await prisma.conversationParticipant.findMany({
    where: { userId: user.id },
    include: {
      conversation: {
        include: {
          participants: {
            include: { user: true }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { sender: true }
          }
        }
      }
    }
  });

  const conversations: ChatConversation[] = participants.map((p: any) => {
    const convo = p.conversation;
    // For DMs, find the other participant
    const otherParticipant = convo.participants.find((cp: any) => cp.userId !== user.id);
    const otherUser = otherParticipant?.user;
    
    const latestMessage = convo.messages[0];

    return {
      key: convo.id,
      otherUid: otherUser?.firebaseUid || 'unknown',
      otherName: otherUser?.name || 'Unknown User',
      otherPic: otherUser?.avatarUrl || '',
      text: latestMessage?.text || '',
      timestamp: latestMessage?.createdAt.getTime() || convo.createdAt.getTime(),
      isRead: !p.hasUnread,
      sender: latestMessage?.sender?.firebaseUid || '',
      numberOfUnreadMessages: p.hasUnread ? 1 : 0, 
    };
  });

  // Sort by latest message
  return conversations.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Fetch messages for a specific conversation.
 */
export async function getChatThread(conversationId: string): Promise<ChatMessage[]> {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    include: { sender: true }
  });

  return messages.map((msg: any) => ({
    id: msg.id,
    sender: msg.sender.firebaseUid,
    text: msg.text || '',
    timestamp: msg.createdAt.getTime(),
    status: msg.status as any,
    type: msg.type || undefined,
    images: msg.images ? JSON.parse(msg.images) : undefined,
  }));
}

/**
 * Send a message in a conversation.
 */
export async function sendMessage(conversationId: string, senderFirebaseUid: string, text: string, imageUrls?: string[]) {
  const sender = await prisma.user.findUnique({
    where: { firebaseUid: senderFirebaseUid },
    select: { id: true }
  });

  if (!sender) throw new Error("Sender not found");

  const newMessage = await prisma.message.create({
    data: {
      conversationId,
      senderId: sender.id,
      text,
      images: imageUrls ? JSON.stringify(imageUrls) : null,
      status: 'sent'
    }
  });

  // Mark conversation as unread for the OTHER participants
  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId,
      userId: { not: sender.id }
    },
    data: {
      hasUnread: true
    }
  });

  // Update sender's participant as read
  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId,
      userId: sender.id
    },
    data: {
      hasUnread: false,
      lastReadAt: new Date()
    }
  });

  return { success: true, messageId: newMessage.id };
}

/**
 * Mark a conversation as read for the current user.
 */
export async function markConversationAsRead(conversationId: string, firebaseUid: string) {
  const user = await prisma.user.findUnique({ where: { firebaseUid }, select: { id: true } });
  if (!user) return;

  await prisma.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId,
        userId: user.id
      }
    },
    data: {
      hasUnread: false,
      lastReadAt: new Date()
    }
  });
  
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: user.id },
      status: { in: ['sent', 'delivered'] }
    },
    data: {
      status: 'read'
    }
  });
}

/**
 * Initiate a new DM conversation (Costs 100 NP).
 */
export async function initiateConversation(senderFirebaseUid: string, targetFirebaseUid: string) {
  if (senderFirebaseUid === targetFirebaseUid) {
    throw new Error("Cannot message yourself");
  }

  const sender = await prisma.user.findUnique({
    where: { firebaseUid: senderFirebaseUid },
    include: { conversations: { include: { conversation: { include: { participants: true } } } } }
  });
  
  const target = await prisma.user.findUnique({
    where: { firebaseUid: targetFirebaseUid }
  });

  if (!sender || !target) throw new Error("User not found");

  const existingConvo = sender.conversations.find((p: any) => {
    const convo = p.conversation;
    if (convo.groupId) return false; 
    if (convo.participants.length !== 2) return false;
    return convo.participants.some((cp: any) => cp.userId === target.id);
  });

  if (existingConvo) {
    return { success: true, conversationId: existingConvo.conversationId };
  }

  const COST = 100;
  if (sender.spendableNP < COST) {
    throw new Error(`Insufficient Nerve Points. You need ${COST} NP to start a new chat.`);
  }

  const result = await prisma.$transaction(async (tx: any) => {
    await tx.user.update({
      where: { id: sender.id },
      data: { spendableNP: { decrement: COST } }
    });

    const newConvo = await tx.conversation.create({
      data: {
        participants: {
          create: [
            { userId: sender.id },
            { userId: target.id }
          ]
        }
      }
    });

    return newConvo;
  });

  return { success: true, conversationId: result.id };
}
