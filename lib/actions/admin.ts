"use server";

import { prisma } from "@/lib/db/client";

export async function submitAdminOnboarding(
  uid: string, 
  data: { 
    firstName: string; 
    lastName: string;
    prefixes?: string[];
    suffixes?: string[];
    role: string; 
    department?: string; 
    bio: string; 
    avatarUrl: string;
  }
) {
  if (!uid) throw new Error("Missing user ID");

  const nameParts = [
    ...(data.prefixes || []),
    data.firstName,
    data.lastName,
    ...(data.suffixes || [])
  ];
  const fullName = nameParts.filter(Boolean).join(' ');

  // 1. Update the user's profile
  await prisma.user.update({
    where: { firebaseUid: uid },
    data: {
      name: fullName,
      firstName: data.firstName,
      lastName: data.lastName,
      prefixes: data.prefixes && data.prefixes.length > 0 ? JSON.stringify(data.prefixes) : null,
      suffixes: data.suffixes && data.suffixes.length > 0 ? JSON.stringify(data.suffixes) : null,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      hasCompletedProfile: true,
      verified: true,
      verifiedAt: new Date(),
      rank: 5, // Admins get Apex rank
      role: 'admin', // System role
    }
  });

  // 2. Ensure "Food Nerve" organization exists
  let foodNerveOrg = await prisma.organization.findUnique({
    where: { slug: 'foodnerve' }
  });

  if (!foodNerveOrg) {
    foodNerveOrg = await prisma.organization.create({
      data: {
        name: 'Food Nerve',
        slug: 'foodnerve',
        verified: true,
        rank: 5,
      }
    });
  }

  // 3. Add the user to Food Nerve with their specific role
  // @ts-ignore - department added to schema but client not regenerated yet due to dev server lock
  await prisma.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId: uid,
        organizationId: foodNerveOrg.id,
      }
    },
    update: {
      role: data.role,
      department: data.department,
    },
    create: {
      userId: uid,
      organizationId: foodNerveOrg.id,
      role: data.role,
      department: data.department,
    }
  });

  return { success: true };
}
