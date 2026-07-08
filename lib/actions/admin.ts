"use server";

import { prisma } from "@/lib/db/client";

export type AffiliationData = {
  active: boolean;
  role: string;
  longName?: string;
  shortName?: string;
  logoUrl?: string;
  country?: string;
  state?: string;
  lga?: string;
  address?: string;
  isVirtual?: boolean;
};

export async function getCoreOrganizations() {
  try {
    const [darkpore, foodnerve] = await Promise.all([
      prisma.organization.findUnique({ where: { slug: 'darkpore' } }),
      prisma.organization.findUnique({ where: { slug: 'foodnerve' } })
    ]);
    return { darkpore, foodnerve };
  } catch (error) {
    console.error("Error fetching core orgs:", error);
    return { darkpore: null, foodnerve: null };
  }
}

export async function submitAdminOnboarding(
  uid: string, 
  data: { 
    firstName: string; 
    lastName: string;
    prefixes?: string[];
    suffixes?: string[];
    bio: string; 
    avatarUrl: string;
    darkpore: AffiliationData;
    foodnerve: AffiliationData;
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
  const user = await prisma.user.update({
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

  // Helper to handle org upsert and membership linking
  async function handleAffiliation(slug: 'darkpore' | 'foodnerve', defaultName: string, affil: AffiliationData) {
    if (!affil.active) return;

    // Ensure the org exists
    let org = await prisma.organization.findUnique({
      where: { slug }
    });

    if (!org) {
      if (!affil.shortName && !affil.longName) {
        throw new Error(`Missing required fields to create the ${defaultName} organization.`);
      }
      org = await prisma.organization.create({
        data: {
          slug,
          name: affil.shortName || defaultName,
          legalName: affil.longName || affil.shortName || defaultName,
          logoUrl: affil.logoUrl,
          country: affil.country,
          state: affil.state,
          lga: affil.lga,
          address: affil.address,
          isVirtual: affil.isVirtual || false,
          verified: true,
          rank: 5,
        }
      });
    }

    // Link the user to the org
    await prisma.organizationMember.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: org.id,
        }
      },
      update: {
        role: affil.role,
        department: 'Executive', // Default to Executive for core team
      },
      create: {
        userId: user.id,
        organizationId: org.id,
        role: affil.role,
        department: 'Executive',
      }
    });
  }

  // Handle both affiliations
  await handleAffiliation('darkpore', 'Darkpore', data.darkpore);
  await handleAffiliation('foodnerve', 'Food Nerve', data.foodnerve);

  return { success: true };
}
