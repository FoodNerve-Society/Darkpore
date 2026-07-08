'use server'

import prisma from "@/lib/prisma";

export async function getFoodNerveOrganizations() {
    try {
        const orgs = await prisma.organization.findMany({
            where: {
                isExternal: false,
            },
            select: {
                id: true,
                name: true,
                logoUrl: true,
                rank: true,
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Map it to have `role` as well, or just use rank
        const formatted = orgs.map(o => ({
            ...o,
            role: o.rank === 1 ? 'Verified Entity' : 'Internal Entity'
        }));

        return { success: true, data: formatted };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
