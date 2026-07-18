'use server';

import { prisma } from '@/lib/db/client';
import { revalidatePath } from 'next/cache';

export interface WikiBlock {
  id: string;
  type: 'TEXT' | 'MEDIA' | 'PROMPT_BUILDER';
  visibility: 'public' | 'internal_staff' | 'admin' | 'whitelist_only';
  whitelistUsers?: string[];
  content: string;
  mediaUrl?: string;
  variables?: { name: string; label: string }[];
}

export interface WikiDocInput {
  slug: string;
  title: string;
  category: string;
  isPublic: boolean;
  allowedRoles: string[];
  allowedUsers: string[];
  blocks: WikiBlock[];
  tags: string[];
  authorId: string;
}

export async function createOrUpdateWikiDoc(data: WikiDocInput) {
  try {
    const doc = await prisma.omniWikiDoc.upsert({
      where: { slug: data.slug },
      update: {
        title: data.title,
        category: data.category,
        isPublic: data.isPublic,
        allowedRoles: JSON.stringify(data.allowedRoles),
        allowedUsers: JSON.stringify(data.allowedUsers),
        blocks: JSON.stringify(data.blocks),
        tags: JSON.stringify(data.tags),
      },
      create: {
        slug: data.slug,
        title: data.title,
        category: data.category,
        isPublic: data.isPublic,
        allowedRoles: JSON.stringify(data.allowedRoles),
        allowedUsers: JSON.stringify(data.allowedUsers),
        blocks: JSON.stringify(data.blocks),
        tags: JSON.stringify(data.tags),
        authorId: data.authorId,
      },
    });

    revalidatePath('/modular-society/[tenant]/[...all]', 'layout');
    return { success: true, data: doc };
  } catch (error: any) {
    console.error('Error creating/updating wiki doc:', error);
    return { success: false, error: error.message };
  }
}

export async function getWikiDoc(slug: string) {
  try {
    const doc = await prisma.omniWikiDoc.findUnique({
      where: { slug },
      include: {
        author: {
          select: { name: true, avatarUrl: true },
        },
      },
    });

    if (!doc) return { success: false, error: 'Document not found' };

    return { 
      success: true, 
      data: {
        ...doc,
        allowedRoles: JSON.parse(doc.allowedRoles) as string[],
        allowedUsers: JSON.parse(doc.allowedUsers) as string[],
        blocks: JSON.parse(doc.blocks) as WikiBlock[],
        tags: JSON.parse(doc.tags) as string[],
      }
    };
  } catch (error: any) {
    console.error('Error fetching wiki doc:', error);
    return { success: false, error: error.message };
  }
}

export async function getAllVisibleWikiDocs(userRoles: string[], userId: string, isAdmin: boolean) {
  try {
    const docs = await prisma.omniWikiDoc.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        author: {
          select: { name: true, avatarUrl: true },
        },
      },
    });

    // Filter documents strictly based on visibility logic (done in-memory to safely parse JSON arrays)
    const visibleDocs = docs.filter(doc => {
      if (isAdmin) return true; // Admins see everything
      if (doc.isPublic) return true; // Public docs

      const allowedRoles = JSON.parse(doc.allowedRoles) as string[];
      const allowedUsers = JSON.parse(doc.allowedUsers) as string[];

      // Check if user has an allowed role
      if (allowedRoles.some(role => userRoles.includes(role))) return true;

      // Check if user is specifically whitelisted
      if (allowedUsers.includes(userId)) return true;

      return false;
    });

    return {
      success: true,
      data: visibleDocs.map(doc => ({
        ...doc,
        allowedRoles: JSON.parse(doc.allowedRoles) as string[],
        allowedUsers: JSON.parse(doc.allowedUsers) as string[],
        blocks: JSON.parse(doc.blocks) as WikiBlock[],
        tags: JSON.parse(doc.tags) as string[],
      }))
    };
  } catch (error: any) {
    console.error('Error fetching wiki docs:', error);
    return { success: false, error: error.message };
  }
}
