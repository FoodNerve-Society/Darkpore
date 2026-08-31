"use server";

import { prisma } from "@/lib/db/client";

export type BookmarkItemType = 
  | "trade"
  | "job"
  | "class"
  | "article"
  | "livestream"
  | "event"
  | "initiative";

export interface ToggleBookmarkParams {
  userId: string; // Firebase UID or Prisma User ID
  itemType: BookmarkItemType;
  itemId: string;
  title?: string;
  metadata?: Record<string, any>;
}

/**
 * Resolves a User record by either Prisma ID or Firebase UID
 */
async function resolvePrismaUser(userIdOrFirebaseUid: string) {
  if (!userIdOrFirebaseUid) return null;
  return await prisma.user.findFirst({
    where: {
      OR: [
        { id: userIdOrFirebaseUid },
        { firebaseUid: userIdOrFirebaseUid }
      ]
    },
    select: { id: true }
  });
}

/**
 * Toggles bookmark status for any polymorphic entity across the ecosystem
 */
export async function toggleBookmark({
  userId,
  itemType,
  itemId,
  title,
  metadata
}: ToggleBookmarkParams) {
  try {
    const user = await resolvePrismaUser(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const existing = await prisma.savedItem.findUnique({
      where: {
        userId_itemType_itemId: {
          userId: user.id,
          itemType,
          itemId
        }
      }
    });

    if (existing) {
      await prisma.savedItem.delete({
        where: { id: existing.id }
      });
      return { success: true, isSaved: false, action: "removed" };
    } else {
      const created = await prisma.savedItem.create({
        data: {
          userId: user.id,
          itemType,
          itemId,
          title: title || "Saved Item",
          metadata: metadata ? JSON.stringify(metadata) : null
        }
      });
      return { success: true, isSaved: true, action: "saved", savedItem: created };
    }
  } catch (error: any) {
    console.error("Error toggling bookmark:", error);
    return { success: false, error: error?.message || "Failed to toggle bookmark" };
  }
}

/**
 * Checks whether a specific entity is bookmarked by the user
 */
export async function checkIsBookmarked({
  userId,
  itemType,
  itemId
}: {
  userId: string;
  itemType: BookmarkItemType;
  itemId: string;
}) {
  try {
    const user = await resolvePrismaUser(userId);
    if (!user) return { isSaved: false };

    const existing = await prisma.savedItem.findUnique({
      where: {
        userId_itemType_itemId: {
          userId: user.id,
          itemType,
          itemId
        }
      }
    });

    return { isSaved: Boolean(existing) };
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    return { isSaved: false };
  }
}

/**
 * Retrieves all bookmarks for a user, optionally filtered by itemType
 */
export async function getUserBookmarks({
  userId,
  itemType
}: {
  userId: string;
  itemType?: BookmarkItemType;
}) {
  try {
    const user = await resolvePrismaUser(userId);
    if (!user) return { success: false, bookmarks: [] };

    const bookmarks = await prisma.savedItem.findMany({
      where: {
        userId: user.id,
        ...(itemType ? { itemType } : {})
      },
      orderBy: { createdAt: "desc" }
    });

    const parsedBookmarks = bookmarks.map((b) => ({
      ...b,
      metadata: b.metadata ? JSON.parse(b.metadata) : null
    }));

    return { success: true, bookmarks: parsedBookmarks };
  } catch (error: any) {
    console.error("Error fetching user bookmarks:", error);
    return { success: false, error: error?.message || "Failed to fetch bookmarks", bookmarks: [] };
  }
}
