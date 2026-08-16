"use server";

import { prisma as db } from '@/lib/db/client';
import { revalidatePath } from 'next/cache';

/**
 * Places a bid for a specific commodity for a specific week.
 * Deducts the NP from the user's spendableNP balance.
 */
export async function placeCommodityBid(
  uid: string,
  year: number,
  week: number,
  commodity: string,
  amountNP: number
) {
  try {
    if (amountNP <= 0) {
      throw new Error("Bid amount must be greater than 0");
    }

    // 1. Fetch user to verify Rank 4+ and NP balance
    const user = await db.user.findUnique({
      where: { firebaseUid: uid },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.rank < 4) {
      throw new Error("Only Rank 4+ Visionaries can participate in the Commodity War.");
    }

    if (user.spendableNP < amountNP) {
      throw new Error("Insufficient Nerve Points to place this bid.");
    }

    // 2. Transaction: Create Bid and Deduct NP
    await db.$transaction([
      db.weeklyCommodityBid.create({
        data: {
          year,
          week,
          commodity,
          amountNP,
          userId: user.id,
        },
      }),
      db.user.update({
        where: { id: user.id },
        data: {
          spendableNP: {
            decrement: amountNP,
          },
        },
      }),
    ]);

    revalidatePath('/[tenant]/(authenticated)/calendar', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error("placeCommodityBid Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetches the current bidding leaderboard for a specific week.
 * Aggregates all bids by commodity.
 */
export async function getCommodityBiddingLeaderboard(year: number, week: number) {
  try {
    const bids = await db.weeklyCommodityBid.groupBy({
      by: ['commodity'],
      where: {
        year,
        week,
        status: 'active',
      },
      _sum: {
        amountNP: true,
      },
      orderBy: {
        _sum: {
          amountNP: 'desc',
        },
      },
    });

    return bids.map((bid) => ({
      commodity: bid.commodity,
      totalNP: bid._sum.amountNP || 0,
    }));
  } catch (error) {
    console.error("getCommodityBiddingLeaderboard Error:", error);
    return [];
  }
}

import { getEditorialMatrixForDate } from '../config/editorialMatrix';

export async function getMatrixForWeekClient(dateIsoString: string) {
  try {
    const date = new Date(dateIsoString);
    return await getEditorialMatrixForDate(date);
  } catch (error) {
    console.error("getMatrixForWeekClient Error", error);
    return null;
  }
}

