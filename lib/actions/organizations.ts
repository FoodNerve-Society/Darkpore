'use server'

import { prisma } from '@/lib/db/client';

export async function getFoodNerveOrganizations(userId?: string, role?: string) {
    try {
        const isSuperAdmin = role === 'super_admin';
        const isAdmin = role === 'admin' || isSuperAdmin;

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
                    // 3. Super admins can see everything
                    ...(isSuperAdmin ? [{}] : [])
                ],
                // Prevent random users from selecting the platform owner org
                NOT: {
                    AND: [
                        { isPlatformOwner: true },
                        { id: { notIn: isAdmin ? undefined : [] } }
                    ]
                }
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
