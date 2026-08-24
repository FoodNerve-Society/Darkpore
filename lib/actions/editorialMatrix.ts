"use server";

import { prisma as db } from '@/lib/db/client';
import { getISOWeek, getDay, format } from 'date-fns';
import { CATEGORY_MAP, getEditorialMatrixForDate } from '@/lib/config/editorialMatrix';
import { foodChallenges } from '@/lib/cms/food/challenges';
import { ArticleFormat, ArticleEra } from '@/lib/config/articleBlueprints';
import { executeEditorialPipeline } from '@/lib/ai/gemini';
import { ParsedArticleBrief } from '@/lib/config/editorialPrompts';

export interface ArticleInsightItem extends ParsedArticleBrief {
  rationale?: string;
  promptHints?: string[];
  priorityRank?: number;
}

export interface DailyIntelPayload {
  success: boolean;
  commodity: string;
  category: string;
  year: number;
  week: number;
  dayOfWeek: number;
  insights: ArticleInsightItem[];
  prompts?: {
    doc1aPrompt: string;
    doc1aOutput: string;
    doc1bPrompt: string;
    doc1bOutput: string;
    doc1cPrompt: string;
    doc1cOutput: string;
  };
  error?: string;
}

/**
 * Retrieves the 10-12 cached daily article insights for a given date and commodity.
 * If not in database, generates them via the 3-stage Gemini 3.7 Flash pipeline and caches to Turso.
 */
export async function getDailyEditorialIntel(dateInput?: Date | string, commodityOverride?: string, categoryOverride?: string): Promise<DailyIntelPayload> {
  const date = dateInput ? new Date(dateInput) : new Date();
  const year = date.getFullYear();
  const week = getISOWeek(date);
  const dayOfWeek = getDay(date);
  const categoryKey = categoryOverride || CATEGORY_MAP[dayOfWeek] || 'land';

  try {
    // Get active/winning commodity or use explicit override
    let commodity = commodityOverride;
    if (!commodity) {
      const matrix = await getEditorialMatrixForDate(date);
      commodity = matrix.commodity;
    }

    // Check DB cache
    try {
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
        const parsed = JSON.parse(cached.articleInsights);
        const insightsList = Array.isArray(parsed) ? parsed : (parsed.insights || []);
        const prompts = parsed.prompts || {
          doc1aPrompt: parsed.doc1aPrompt || '',
          doc1aOutput: parsed.doc1aOutput || '',
          doc1bPrompt: parsed.doc1bPrompt || '',
          doc1bOutput: parsed.doc1bOutput || '',
          doc1cPrompt: parsed.doc1cPrompt || '',
          doc1cOutput: parsed.doc1cOutput || '',
        };

        if (insightsList.length > 0) {
          return {
            success: true,
            commodity,
            category: categoryKey,
            year,
            week,
            dayOfWeek,
            insights: insightsList as ArticleInsightItem[],
            prompts,
          };
        }
      }
    } catch (cacheErr) {
      console.warn("DailyEditorialIntel cache lookup warning:", cacheErr);
    }

    // Lookup category details & 10 subcategories
    const challenge = foodChallenges.find(c => c.id === categoryKey) || foodChallenges[0];
    const subcategoriesList = (challenge.subcategories || []).map(s => ({
      id: s.id,
      title: s.title,
      desc: s.desc,
    }));

    const currentMonthYear = format(date, 'MMMM yyyy');

    // Execute 3-Stage Pipeline with Gemini 3.7 Flash
    const result = await executeEditorialPipeline({
      category: challenge.title || categoryKey,
      commodity,
      subcategoriesList,
      currentMonthYear,
    });

    if (!result.success || !result.insights || result.insights.length === 0) {
      return {
        success: false,
        commodity,
        category: categoryKey,
        year,
        week,
        dayOfWeek,
        insights: [],
        prompts: {
          doc1aPrompt: result.doc1aPrompt,
          doc1aOutput: result.doc1aOutput || '',
          doc1bPrompt: result.doc1bPrompt,
          doc1bOutput: result.doc1bOutput || '',
          doc1cPrompt: result.doc1cPrompt,
          doc1cOutput: result.doc1cOutput || '',
        },
        error: result.error || 'AI generation did not run. Please use the AI Prompt Terminal above to copy the prompts and fast-ingest your outlines.',
      };
    }

    const envelope = {
      prompts: {
        doc1aPrompt: result.doc1aPrompt,
        doc1aOutput: result.doc1aOutput || '',
        doc1bPrompt: result.doc1bPrompt,
        doc1bOutput: result.doc1bOutput || '',
        doc1cPrompt: result.doc1cPrompt,
        doc1cOutput: result.doc1cOutput || '',
      },
      insights: result.insights,
    };

    // Upsert to DB cache
    try {
      await db.dailyEditorialIntel.upsert({
        where: {
          year_week_dayOfWeek_commodity: {
            year,
            week,
            dayOfWeek,
            commodity,
          },
        },
        create: {
          year,
          week,
          dayOfWeek,
          category: categoryKey,
          commodity,
          articleInsights: JSON.stringify(envelope),
        },
        update: {
          articleInsights: JSON.stringify(envelope),
          updatedAt: new Date(),
        },
      });
    } catch (upsertErr) {
      console.warn("DailyEditorialIntel cache save warning:", upsertErr);
    }

    return {
      success: true,
      commodity,
      category: categoryKey,
      year,
      week,
      dayOfWeek,
      insights: result.insights as ArticleInsightItem[],
      prompts: envelope.prompts,
    };
  } catch (error: any) {
    console.error("getDailyEditorialIntel Error:", error);
    return {
      success: false,
      commodity: 'Soybeans, Nuts and Meals',
      category: categoryKey,
      year,
      week,
      dayOfWeek,
      insights: [],
      error: error.message,
    };
  }
}

/**
 * On-demand AI regeneration action.
 * Deducts 50 spendableNP from the creator and regenerates fresh bespoke angles via Gemini 3.7 Flash.
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

    // 2. Lookup subcategories
    const challenge = foodChallenges.find(c => c.id === params.category) || foodChallenges[0];
    const subcategoriesList = (challenge.subcategories || []).map(s => ({
      id: s.id,
      title: s.title,
      desc: s.desc,
    }));
    const currentMonthYear = format(targetDate, 'MMMM yyyy');

    // 3. Execute Pipeline with Gemini 3.7 Flash
    const result = await executeEditorialPipeline({
      category: challenge.title || params.category,
      commodity: params.commodity,
      subcategoriesList,
      currentMonthYear,
    });

    if (!result.success || !result.insights || result.insights.length === 0) {
      return {
        success: false,
        error: result.error || "Gemini 3.7 Flash was unable to generate angles. Use the AI Prompt Terminal above to proceed.",
        prompts: {
          doc1aPrompt: result.doc1aPrompt,
          doc1aOutput: result.doc1aOutput || '',
          doc1bPrompt: result.doc1bPrompt,
          doc1bOutput: result.doc1bOutput || '',
          doc1cPrompt: result.doc1cPrompt,
          doc1cOutput: result.doc1cOutput || '',
        }
      };
    }

    const envelope = {
      prompts: {
        doc1aPrompt: result.doc1aPrompt,
        doc1aOutput: result.doc1aOutput || '',
        doc1bPrompt: result.doc1bPrompt,
        doc1bOutput: result.doc1bOutput || '',
        doc1cPrompt: result.doc1cPrompt,
        doc1cOutput: result.doc1cOutput || '',
      },
      insights: result.insights,
    };

    // 4. Upsert to DB cache
    try {
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
          articleInsights: JSON.stringify(envelope),
        },
        update: {
          articleInsights: JSON.stringify(envelope),
          updatedAt: new Date(),
        },
      });
    } catch (upsertErr) {
      console.warn("DailyEditorialIntel cache save warning:", upsertErr);
    }

    return {
      success: true,
      insights: result.insights,
      prompts: envelope.prompts,
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
