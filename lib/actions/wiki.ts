'use server';

import { prisma } from '@/lib/db/client';
import { revalidatePath } from 'next/cache';

export interface WikiBlock {
  id: string;
  type: 'TEXT' | 'MEDIA' | 'PROMPT_BUILDER' | 'HEADER' | 'CALLOUT' | 'CHECKLIST' | 'CODE_SNIPPET';
  visibility: 'public' | 'internal_staff' | 'admin' | 'whitelist_only';
  whitelistUsers?: string[];
  content: string;
  
  // Media Block
  mediaUrl?: string;
  mediaFile?: any; // Blob/File reference before upload
  
  // Prompt Builder Block
  variables?: { name: string; label: string }[];
  
  // Header Block
  headerLevel?: 1 | 2 | 3;
  
  // Callout Block
  calloutType?: 'info' | 'warning' | 'danger';
  
  // Checklist Block
  checklistItems?: { id: string; text: string; checked: boolean }[];
  
  // Code Snippet Block
  codeLanguage?: string;
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
  hotspotId?: string | null;
  parentId?: string | null;
}

export async function createOrUpdateWikiDoc(data: WikiDocInput) {
  try {
    const finalHotspotId = (!data.hotspotId || data.hotspotId === 'NONE') ? null : data.hotspotId;

    if (finalHotspotId) {
      // Clear this hotspot from any other document to prevent unique constraint violation
      await prisma.omniWikiDoc.updateMany({
        where: { hotspotId: finalHotspotId, slug: { not: data.slug } },
        data: { hotspotId: null },
      });
    }

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
        hotspotId: finalHotspotId,
        parentId: data.parentId || null,
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
        hotspotId: finalHotspotId,
        parentId: data.parentId || null,
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
        children: {
          select: { id: true, slug: true, title: true, isPublic: true }
        }
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

export async function getWikiHierarchy(slug: string) {
  try {
    const breadcrumbs = [];
    let currentSlug = slug;
    
    // Safety break to prevent infinite loops in case of bad data
    let depth = 0;
    while (currentSlug && depth < 10) {
      const doc = await prisma.omniWikiDoc.findUnique({
        where: { slug: currentSlug },
        select: { slug: true, title: true, parent: { select: { slug: true } } }
      });
      
      if (!doc) break;
      
      breadcrumbs.unshift({ slug: doc.slug, title: doc.title });
      currentSlug = doc.parent?.slug || '';
      depth++;
    }
    
    return { success: true, data: breadcrumbs };
  } catch (error: any) {
    console.error('Error fetching wiki hierarchy:', error);
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

export async function getHotspotMappings() {
  try {
    const docs = await prisma.omniWikiDoc.findMany({
      where: { hotspotId: { not: null } },
      select: { slug: true, hotspotId: true },
    });
    const mappings: Record<string, string> = {};
    docs.forEach(doc => {
      if (doc.hotspotId) {
        mappings[doc.hotspotId] = doc.slug;
      }
    });
    return { success: true, data: mappings };
  } catch (error: any) {
    console.error('Error fetching hotspot mappings:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// WIKI HOTSPOT REGISTRY ACTIONS
// ============================================================================

export async function getRegistryHotspots() {
  try {
    const hotspots = await prisma.wikiHotspotRegistry.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: hotspots };
  } catch (error) {
    console.error('Error fetching registry hotspots:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function createRegistryHotspot(id: string, label: string, category?: string, subcategory?: string, description?: string) {
  try {
    const newHotspot = await prisma.wikiHotspotRegistry.create({
      data: {
        id,
        label,
        category,
        subcategory,
        description
      }
    });
    return { success: true, data: newHotspot };
  } catch (error) {
    console.error('Error creating registry hotspot:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteRegistryHotspot(id: string) {
  try {
    await prisma.wikiHotspotRegistry.delete({
      where: { id }
    });
    // Also clear mappings
    await prisma.omniWikiDoc.updateMany({
      where: { hotspotId: id },
      data: { hotspotId: null }
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting registry hotspot:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
