'use server'

import { prisma } from '@/lib/db/client';

export async function getFoodNerveOrganizations(userId?: string, role?: string) {
    try {
        const isAdmin = role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'super_admin';

        const orgs = await prisma.organization.findMany({
            where: {
                OR: [
                    // 1. Show unclaimed organizations
                    { rank: 1 },
                    // 2. Show organizations where the user is an official member
                    ...(userId ? [{
                        members: {
                            some: {
                                userId: userId
                            }
                        }
                    }] : []),
                    // 3. Ensure the platform owner is fetched so we can show it to Admins
                    { isPlatformOwner: true }
                ]
            },
            select: {
                id: true,
                name: true,
                logoUrl: true,
                rank: true,
                isPlatformOwner: true,
            },
            orderBy: {
                name: 'asc'
            },
            take: 50 // Limit to prevent crashing if there are thousands of orgs
        });

        // Apply the NOT logic properly after fetching
        const filteredOrgs = isAdmin ? orgs : orgs.filter(o => !o.isPlatformOwner);

        // Map it to have `role` as well
        const formatted = filteredOrgs.map(o => ({
            ...o,
            role: o.rank === 1 ? 'Unverified Entity' : (o.isPlatformOwner ? 'Platform Core' : 'Verified Partner')
        }));

        return { success: true, data: formatted };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getPublicOrganization(slug: string) {
    try {
        const org = await prisma.organization.findUnique({
            where: { slug },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, firebaseUid: true, name: true, avatarUrl: true, rank: true, specialization: true }
                        }
                    }
                },
                tradeListings: {
                    where: { status: 'active' },
                    orderBy: { postedAt: 'desc' }
                }
            }
        });
        if (!org) return { success: false, error: 'Organization not found' };
        return { success: true, data: org };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function searchExternalOrganizations(query: string, userId?: string, role?: string) {
    try {
        if (!query || !query.trim()) return [];
        const orgs = await prisma.organization.findMany({
            where: {
                name: { contains: query.trim() }
            },
            select: {
                id: true,
                name: true,
                logoUrl: true,
                rank: true,
                isPlatformOwner: true,
                country: true,
                state: true,
                lga: true
            },
            take: 20
        });
        return orgs;
    } catch (e: any) {
        console.error('searchExternalOrganizations error:', e);
        return [];
    }
}

