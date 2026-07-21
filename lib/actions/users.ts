'use server'

import { prisma } from '@/lib/db/client';
import { cookies } from 'next/headers';
import { getFirebaseUser } from '@/lib/auth/firebase-admin';

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

export async function getCurrentSessionUser() {
    try {
        const cookieStore = cookies();
        const sessionCookie = cookieStore.get('session')?.value;
        if (!sessionCookie) return { success: false, error: 'No session' };

        const decodedToken = await getFirebaseUser(sessionCookie);
        if (!decodedToken) return { success: false, error: 'Invalid session' };

        const user = await prisma.user.findUnique({
            where: { firebaseUid: decodedToken.uid }
        });
        if (!user) return { success: false, error: 'User not found in DB' };

        return { success: true, data: user };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

