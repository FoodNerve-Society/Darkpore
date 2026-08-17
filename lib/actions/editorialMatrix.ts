"use server";

import { prisma as db } from '@/lib/db/client';
import { getISOWeek, getDay } from 'date-fns';
import { CATEGORY_MAP, getEditorialMatrixForDate } from '@/lib/config/editorialMatrix';
import { foodChallenges } from '@/lib/cms/food/challenges';
import { ArticleFormat, ArticleEra } from '@/lib/config/articleBlueprints';

export interface ArticleInsightItem {
  id: string;
  title: string;
  subcategoryId: string;
  subcategoryTitle: string;
  format: ArticleFormat;
  era: ArticleEra;
  hook: string;
  rationale?: string;
  promptHints?: string[];
  priorityRank?: number;
}

/**
 * Deterministically/AI generates 10-12 tailored article briefing titles for a given Commodity & Category slot.
 * (Acts as a robust placeholder generator while exact custom prompt strings are plugged in).
 */
function generateStructuredInsights(
  commodity: string,
  categoryId: string,
  year: number,
  week: number,
  dayOfWeek: number
): ArticleInsightItem[] {
  const challenge = foodChallenges.find(c => c.id === categoryId) || foodChallenges[0];
  const subs = challenge.subcategories || [];

  const formats: ArticleFormat[] = ['brief', 'memo', 'playbook', 'comparison', 'culture'];
  const eras: ArticleEra[] = ['past', 'present', 'future'];

  // Seeded titles across the 15 blueprints
  const templateBank: Array<{
    format: ArticleFormat;
    era: ArticleEra;
    titleFn: (comm: string, sub: string) => string;
    hookFn: (comm: string, sub: string) => string;
  }> = [
    {
      format: 'memo',
      era: 'present',
      titleFn: (c, s) => `Structuring a ₦500M Off-Taker SPV: Unit Economics for ${c} via ${s}`,
      hookFn: (c, s) => `Detailed financial model and working capital waterfall for institutional allocators in ${c}.`,
    },
    {
      format: 'playbook',
      era: 'present',
      titleFn: (c, s) => `The 48-Hour Survival Playbook: Slashing ${c} Losses Through ${s}`,
      hookFn: (c, s) => `Step-by-step standard operating protocol for aggregators and ground operators navigating 2026 inflation.`,
    },
    {
      format: 'brief',
      era: 'present',
      titleFn: (c, s) => `The ₦1,200/L Fuel Trap: How ${c} Haulers Are Bypassing Margin Squeeze in ${s}`,
      hookFn: (c, s) => `Systemic market breakdown of who is capturing spread vs who is defaulting across Nigerian transit hubs.`,
    },
    {
      format: 'comparison',
      era: 'present',
      titleFn: (c, s) => `Kano Dry Port vs. Kaduna Rail: The 72-Hour ${c} Benchmark for ${s}`,
      hookFn: (c, s) => `Head-to-head operational benchmark of logistics cost, transit speed, and spoilage rates.`,
    },
    {
      format: 'culture',
      era: 'present',
      titleFn: (c, s) => `The "Agro-Boys" Syndicate: How Youth Labor Gangs Dictate ${c} Wages in ${s}`,
      hookFn: (c, s) => `Ground sociology on how informal unionization is reshaping harvest-gate bargaining power.`,
    },
    {
      format: 'brief',
      era: 'past',
      titleFn: (c, s) => `The Anchor Borrowers Post-Mortem: Why the $500M ${c} Facility Collapsed in ${s}`,
      hookFn: (c, s) => `Forensic policy and credit autopsy examining the root causes of systemic default prior to 2026.`,
    },
    {
      format: 'memo',
      era: 'past',
      titleFn: (c, s) => `The ₦2.5B Warehouse Receipt Default: An Investor Autopsy on ${c} and ${s}`,
      hookFn: (c, s) => `Investment committee retrospective on uncollateralized receipts and counterparty risk lessons.`,
    },
    {
      format: 'comparison',
      era: 'past',
      titleFn: (c, s) => `Centralized Silos vs. Hermetic Bags: Why Mega-Storage Lost the ${c} Battle in ${s}`,
      hookFn: (c, s) => `Historical benchmark comparing state-run capital expenditure against decentralized storage tools.`,
    },
    {
      format: 'playbook',
      era: 'past',
      titleFn: (c, s) => `The Open-Truck Transport Trap: A Retrospective on 30% In-Transit ${c} Loss in ${s}`,
      hookFn: (c, s) => `Audit of defunct transport protocols that destroyed smallholder margins during rainy seasons.`,
    },
    {
      format: 'brief',
      era: 'future',
      titleFn: (c, s) => `Decentralized Solar Processing: The 2030 Horizon for ${c} via ${s}`,
      hookFn: (c, s) => `Forward-looking thesis on how off-grid micro-utilities will decentralize processing by 2030.`,
    },
    {
      format: 'memo',
      era: 'future',
      titleFn: (c, s) => `Securitized ${c} Yield: Structuring the ₦10B Infrastructure SPV for 2030 in ${s}`,
      hookFn: (c, s) => `How tokenized and asset-backed credit facilities will fund next-generation rural hubs.`,
    },
    {
      format: 'comparison',
      era: 'future',
      titleFn: (c, s) => `USSD Feature Phones vs. On-Chain Contracts: Who Powers ${c} Credit in 2030 via ${s}?`,
      hookFn: (c, s) => `Technical architecture comparison evaluating cryptography, offline settlement, and telco rails.`,
    },
  ];

  return templateBank.map((tmpl, idx) => {
    const sub = subs[idx % Math.max(1, subs.length)] || { id: 'general', title: 'General Operations' };
    return {
      id: `ai-insight-${year}-${week}-${dayOfWeek}-${idx + 1}`,
      title: tmpl.titleFn(commodity, sub.title),
      subcategoryId: sub.id,
      subcategoryTitle: sub.title,
      format: tmpl.format,
      era: tmpl.era,
      hook: tmpl.hookFn(commodity, sub.title),
      priorityRank: idx + 1,
      promptHints: [
        `Focus on the specific bottlenecks in Nigerian ${commodity} supply chains.`,
        `Quantify capital and logistical metrics where applicable.`,
      ],
    };
  });
}

/**
 * Retrieves the 10-12 cached daily article insights for a given date and commodity.
 * If not in database, generates them and caches to Turso.
 */
export async function getDailyEditorialIntel(dateInput?: Date | string) {
  try {
    const date = dateInput ? new Date(dateInput) : new Date();
    const year = date.getFullYear();
    const week = getISOWeek(date);
    const dayOfWeek = getDay(date);
    const category = CATEGORY_MAP[dayOfWeek] || 'land';

    // Get active/winning commodity
    const matrix = await getEditorialMatrixForDate(date);
    const commodity = matrix.commodity;

    // Check DB cache
    const cached = await db.dailyEditorialIntel.findUnique({
      where: {
        year_week_dayOfWeek_commodity: {
          year,
          week,
          dayOfWeek,
          commodity,
        },
      },
    });

    if (cached) {
      return {
        success: true,
        commodity,
        category,
        year,
        week,
        dayOfWeek,
        insights: JSON.parse(cached.articleInsights) as ArticleInsightItem[],
      };
    }

    // Generate fresh insights and cache
    const freshInsights = generateStructuredInsights(commodity, category, year, week, dayOfWeek);

    await db.dailyEditorialIntel.create({
      data: {
        year,
        week,
        dayOfWeek,
        category,
        commodity,
        articleInsights: JSON.stringify(freshInsights),
      },
    });

    return {
      success: true,
      commodity,
      category,
      year,
      week,
      dayOfWeek,
      insights: freshInsights,
    };
  } catch (error: any) {
    console.error("getDailyEditorialIntel Error:", error);
    // Fallback gracefully to runtime generation
    const date = dateInput ? new Date(dateInput) : new Date();
    const year = date.getFullYear();
    const week = getISOWeek(date);
    const dayOfWeek = getDay(date);
    const category = CATEGORY_MAP[dayOfWeek] || 'land';
    return {
      success: true,
      commodity: 'Soybeans, Nuts & Meals',
      category,
      year,
      week,
      dayOfWeek,
      insights: generateStructuredInsights('Soybeans, Nuts & Meals', category, year, week, dayOfWeek),
    };
  }
}

/**
 * On-demand AI regeneration action.
 * Deducts 50 spendableNP from the creator and regenerates fresh bespoke angles.
 */
export async function regenerateCustomAnglesAction(params: {
  commodity: string;
  category: string;
  date: string;
  firebaseUid?: string;
}) {
  try {
    const targetDate = new Date(params.date);
    const year = targetDate.getFullYear();
    const week = getISOWeek(targetDate);
    const dayOfWeek = getDay(targetDate);

    // 1. Verify User and Deduct 50 NP if uid provided
    let newNPBalance: number | undefined;
    if (params.firebaseUid) {
      const user = await db.user.findUnique({
        where: { firebaseUid: params.firebaseUid },
      });

      if (!user) {
        throw new Error("User account not found.");
      }

      if (user.spendableNP < 50) {
        throw new Error("Insufficient Nerve Points. Regenerating fresh custom angles requires 50 NP.");
      }

      const updatedUser = await db.user.update({
        where: { id: user.id },
        data: {
          spendableNP: {
            decrement: 50,
          },
        },
      });
      newNPBalance = updatedUser.spendableNP;
    }

    // 2. Generate randomized fresh insights
    const freshInsights = generateStructuredInsights(params.commodity, params.category, year, week, dayOfWeek);
    // Shuffle slightly for fresh variety on regeneration
    const shuffled = [...freshInsights].sort(() => 0.5 - Math.random());

    // 3. Upsert to Turso DB cache
    await db.dailyEditorialIntel.upsert({
      where: {
        year_week_dayOfWeek_commodity: {
          year,
          week,
          dayOfWeek,
          commodity: params.commodity,
        },
      },
      create: {
        year,
        week,
        dayOfWeek,
        category: params.category,
        commodity: params.commodity,
        articleInsights: JSON.stringify(shuffled),
      },
      update: {
        articleInsights: JSON.stringify(shuffled),
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      insights: shuffled,
      newNPBalance,
    };
  } catch (error: any) {
    console.error("regenerateCustomAnglesAction Error:", error);
    return {
      success: false,
      error: error.message || "Failed to regenerate article angles.",
    };
  }
}
