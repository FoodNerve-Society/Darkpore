'use server'

import { prisma } from '@/lib/db/client';

export async function getPublicUser(username: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                organizationMemberships: {
                    include: {
                        organization: {
                            select: { id: true, name: true, slug: true, logoUrl: true, rank: true, verified: true, isPlatformOwner: true }
                        }
                    }
                }
            }
        });
        
        if (!user) return { success: false, error: 'User not found' };
        
        // Strip sensitive data before returning public profile
        const { email, ...publicData } = user;
        
        return { success: true, data: publicData };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
