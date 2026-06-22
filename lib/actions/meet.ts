'use server';

import { prisma } from '@/lib/db/client';

export interface PostData {
  category: string;
  subcategory: string;
  blocks: {
    blockType: string;
    content: any;
    orderIndex: number;
  }[];
}

// ============================================================
// ROLE → COMMUNITY MAPPING
// ============================================================
// The User model's `role` field defaults to "member".
// SocietyProfile.roles is an array like ["member"], ["student"], etc.
// We map known roles to community keys, with "member" falling back to "entrepreneur".
const ROLE_TO_COMMUNITY: Record<string, string> = {
  student: 'student',
  entrepreneur: 'entrepreneur',
  employee: 'employee',
  member: 'entrepreneur', // Default fallback
  admin: 'entrepreneur',
};

/**
 * Ensures the default Communities (Student, Entrepreneur, Employee) exist.
 */
export async function seedCommunities() {
  const roles = [
    { roleKey: 'student', displayName: 'Student Community' },
    { roleKey: 'entrepreneur', displayName: 'Entrepreneur Hub' },
    { roleKey: 'employee', displayName: 'Employee Network' }
  ];

  for (const role of roles) {
    await prisma.community.upsert({
      where: { roleKey: role.roleKey },
      update: {},
      create: {
        roleKey: role.roleKey,
        displayName: role.displayName
      }
    });
  }
}

/**
 * Gets or creates the default CommunityGroup for a user's role.
 */
export async function getCommunitiesAndGroups(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organizationMembers: {
        include: { organization: true }
      }
    }
  });

  if (!user) throw new Error("User not found");

  // Map the user's role to a community key
  const roleKey = ROLE_TO_COMMUNITY[user.role.toLowerCase()] || 'entrepreneur';
  let community = await prisma.community.findUnique({ where: { roleKey } });

  // Fallback seed if missing
  if (!community) {
    await seedCommunities();
    community = await prisma.community.findUnique({ where: { roleKey } });
  }

  // Find groups the user is in
  const memberships = await prisma.communityGroupMember.findMany({
    where: { userId },
    include: { group: true }
  });

  // If user is not in any groups, auto-assign to a Global Default Group for their community
  if (memberships.length === 0 && community) {
    let globalGroup = await prisma.communityGroup.findFirst({
      where: { communityId: community.id, name: 'Global Hub' }
    });

    if (!globalGroup) {
      globalGroup = await prisma.communityGroup.create({
        data: {
          communityId: community.id,
          name: 'Global Hub',
          memberCount: 0
        }
      });
    }

    await prisma.communityGroupMember.create({
      data: {
        groupId: globalGroup.id,
        userId: user.id
      }
    });

    // Return the freshly created membership
    return [globalGroup];
  }

  return memberships.map((m: any) => m.group);
}

/**
 * Fetches the feed for a specific group (or all groups if null)
 */
export async function getGroupFeed(groupId: string | null) {
  const whereClause = groupId ? { groupId } : {};

  const posts = await prisma.communityPost.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          name: true,
          avatarUrl: true,
          role: true,
          rank: true,
          verified: true
        }
      },
      group: {
        select: {
          name: true
        }
      },
      blocks: {
        orderBy: { orderIndex: 'asc' }
      }
    },
    take: 50
  });

  return posts.map((post: any) => ({
    id: post.id,
    author: {
      name: post.author.name,
      avatar: post.author.avatarUrl,
      role: post.author.role,
      rank: post.author.rank,
      isVerified: post.author.verified
    },
    groupName: post.group.name,
    timeAgo: formatTimeAgo(post.createdAt),
    category: post.category,
    subcategory: post.subcategory,
    likes: post.likes,
    blocks: post.blocks.map((b: any) => ({
      type: b.blockType,
      content: b.content
    }))
  }));
}

/**
 * Unified Rolodex Search across Users and Organizations.
 * Uses raw SQL LOWER() for case-insensitive matching on SQLite.
 */
export async function searchRolodex(query: string, filters: string[]) {
  if (!query || query.trim().length === 0) return { users: [], orgs: [] };

  const q = `%${query.toLowerCase()}%`;

  const requireVerified = filters.includes('Verified');
  const requireRank4 = filters.includes('Rank 4+');

  // Build dynamic WHERE conditions for users
  let userWhereExtra = '';
  if (requireVerified) userWhereExtra += ' AND verified = 1';
  if (requireRank4) userWhereExtra += ' AND rank >= 4';

  const users: any[] = await prisma.$queryRawUnsafe(
    `SELECT id, name, role, avatarUrl, rank, verified, specialization
     FROM User
     WHERE LOWER(name) LIKE ?${userWhereExtra}
     LIMIT 10`,
    q
  );

  // Build dynamic WHERE conditions for orgs
  let orgWhereExtra = '';
  if (requireVerified) orgWhereExtra += ' AND verified = 1';
  if (requireRank4) orgWhereExtra += ' AND rank >= 4';

  const orgs: any[] = await prisma.$queryRawUnsafe(
    `SELECT id, name, slug, verified, rank
     FROM Organization
     WHERE LOWER(name) LIKE ?${orgWhereExtra}
     LIMIT 10`,
    q
  );

  return { users, orgs };
}

/**
 * Creates a new 9-block Community Post
 */
export async function createCommunityPost(authorId: string, groupId: string, data: PostData) {
  const post = await prisma.communityPost.create({
    data: {
      groupId,
      authorId,
      category: data.category,
      subcategory: data.subcategory,
      blocks: {
        create: data.blocks.map((b: any) => ({
          blockType: b.blockType,
          content: typeof b.content === 'string' ? b.content : JSON.stringify(b.content),
          orderIndex: b.orderIndex
        }))
      }
    }
  });

  return post;
}

// ============================================================
// HELPERS
// ============================================================

function formatTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago"; // Fixed: "mo" not "m"
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return "just now";
}
