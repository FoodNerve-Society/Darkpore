import { commoditiesList } from '../cms/commodities';
import { prisma as db } from '@/lib/db/client';
import { getISOWeek, getDay } from 'date-fns'; // We will use date-fns for standard ISO weeks

// The 7 days mapped to our 7 core categories
// getDay() returns 0 for Sunday, 1 for Monday, etc.
export const CATEGORY_MAP: Record<number, string> = {
  1: 'capital',            // Monday: Financial Exclusion & Access to Capital
  2: 'land',               // Tuesday: Obstacles to Farm / Land Access & Tenure
  3: 'inputs',             // Wednesday: Reduced Yields from Under-Used Agro Inputs & Feed
  4: 'energy',             // Thursday: Energy Poverty
  5: 'insecurity',         // Friday: Insecurity & Deliberate Human Threats
  6: 'harvest-to-market',   // Saturday: Post-Harvest Systems & Market Access
  0: 'people',             // Sunday: People & Human Capital
};

/**
 * Derives the active Commodity and Category for a given Date.
 * Checks the database for any community-bidded overrides first.
 * If none, falls back to the algorithmic cycle (Week % 26).
 */
export async function getEditorialMatrixForDate(date: Date = new Date()) {
  const weekNumber = getISOWeek(date);
  const year = date.getFullYear();
  const dayOfWeek = getDay(date);

  const category = CATEGORY_MAP[dayOfWeek] || 'land';

  // 1. Check if a Rank 4+ Bidding Pool won this week
  try {
    const winnerOverride = await db.weeklyCommodityWinner.findUnique({
      where: {
        year_week: {
          year,
          week: weekNumber,
        },
      },
    });

    if (winnerOverride) {
      return {
        commodity: winnerOverride.commodity,
        category,
        isOverride: true,
      };
    }
  } catch (error) {
    console.error("Error fetching WeeklyCommodityWinner", error);
    // Fail gracefully to algorithm
  }

  // 2. Algorithmic Fallback
  // Array is 0-indexed (0 to 25). 
  // Week 1 -> index 0
  // Week 27 -> index 0
  const index = (weekNumber - 1) % commoditiesList.length;
  const commodity = commoditiesList[index];

  return {
    commodity,
    category,
    isOverride: false,
  };
}
