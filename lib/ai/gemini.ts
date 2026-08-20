/**
 * Gemini 3.7 Flash Editorial Multi-Turn Engine
 * Executes the sequential 3-stage intelligence pipeline (DOC_1A -> DOC_1B -> DOC_1C)
 * via the official @google/genai SDK using multi-turn chat with gemini-3.7-flash.
 */

import { GoogleGenAI } from '@google/genai';
import {
  buildDoc1aPrompt,
  buildDoc1bPrompt,
  buildDoc1cPrompt,
  parseDoc1cArticles,
  ParsedArticleBrief,
  SubcategoryInput,
} from '@/lib/config/editorialPrompts';

export interface EditorialGenerationResult {
  success: boolean;
  doc1aPrompt: string;
  doc1aOutput?: string;
  doc1bPrompt: string;
  doc1bOutput?: string;
  doc1cPrompt: string;
  doc1cOutput?: string;
  insights: ParsedArticleBrief[];
  error?: string;
}

/**
 * Executes the 3-Stage Editorial Pipeline sequentially using Gemini 3.7 Flash Multi-Turn Chat.
 * If AI fails or key is missing, returns success: false with pre-compiled prompts so user can continue in terminal.
 */
export async function executeEditorialPipeline(params: {
  category: string;
  commodity: string;
  subcategoriesList: Array<string | SubcategoryInput>;
  currentMonthYear: string;
}): Promise<EditorialGenerationResult> {
  const doc1aPrompt = buildDoc1aPrompt(params);
  const doc1bPromptTemplate = buildDoc1bPrompt({
    commodity: params.commodity,
    currentMonthYear: params.currentMonthYear,
    doc1aOutput: '[Insert Document 1a Output Here]',
    subcategoriesList: params.subcategoriesList,
  });
  const doc1cPromptTemplate = buildDoc1cPrompt({
    doc1aOutput: '[Insert Document 1a Output Here]',
    doc1bOutput: '[Insert Document 1b Output Here]',
  });

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      doc1aPrompt,
      doc1bPrompt: doc1bPromptTemplate,
      doc1cPrompt: doc1cPromptTemplate,
      insights: [],
      error: 'GEMINI_API_KEY is not configured in the environment (.env). Please use the AI Prompt Terminal above to copy the daily prompts or ingest your external research outlines.',
    };
  }

  try {
    const client = new GoogleGenAI({ apiKey });

    // Initialize multi-turn chat session with gemini-3.7-flash
    const chat = client.chats.create({
      model: 'gemini-3.7-flash',
    });

    // ═══════════════════════════════════════════════════════════
    // TURN 1: DOC 1A (Macro-Geo & Temporal Anchors)
    // ═══════════════════════════════════════════════════════════
    const res1a = await chat.sendMessage({ message: doc1aPrompt });
    const doc1aOutput = res1a.text || '';
    if (!doc1aOutput) {
      throw new Error('Gemini 3.7 Flash returned an empty response for Document 1a.');
    }

    // ═══════════════════════════════════════════════════════════
    // TURN 2: DOC 1B (Drucker Innovation OSINT Engine)
    // ═══════════════════════════════════════════════════════════
    const doc1bPrompt = buildDoc1bPrompt({
      commodity: params.commodity,
      currentMonthYear: params.currentMonthYear,
      doc1aOutput,
      subcategoriesList: params.subcategoriesList,
    });

    const res1b = await chat.sendMessage({ message: doc1bPrompt });
    const doc1bOutput = res1b.text || '';
    if (!doc1bOutput) {
      throw new Error('Gemini 3.7 Flash returned an empty response for Document 1b.');
    }

    // ═══════════════════════════════════════════════════════════
    // TURN 3: DOC 1C (Spectrum Synthesizer & Outline Generator)
    // ═══════════════════════════════════════════════════════════
    const doc1cPrompt = buildDoc1cPrompt({
      doc1aOutput,
      doc1bOutput,
    });

    const res1c = await chat.sendMessage({ message: doc1cPrompt });
    const doc1cOutput = res1c.text || '';
    if (!doc1cOutput) {
      throw new Error('Gemini 3.7 Flash returned an empty response for Document 1c.');
    }

    // Parse the 10-12 article outlines
    const insights = parseDoc1cArticles(doc1cOutput, params.commodity);

    return {
      success: true,
      doc1aPrompt,
      doc1aOutput,
      doc1bPrompt,
      doc1bOutput,
      doc1cPrompt,
      doc1cOutput,
      insights,
    };
  } catch (error: any) {
    console.error('Gemini 3.7 Flash execution error:', error);
    
    // Extract cleanest possible error message
    let rawMsg = error?.message || String(error);
    if (typeof rawMsg === 'string' && rawMsg.includes('{')) {
      try {
        const jsonStart = rawMsg.indexOf('{');
        const jsonEnd = rawMsg.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const parsed = JSON.parse(rawMsg.slice(jsonStart, jsonEnd + 1));
          if (parsed?.error?.message) {
            rawMsg = parsed.error.message;
          }
        }
      } catch {
        // use rawMsg
      }
    }

    return {
      success: false,
      doc1aPrompt,
      doc1bPrompt: doc1bPromptTemplate,
      doc1cPrompt: doc1cPromptTemplate,
      insights: [],
      error: `Gemini 3.7 Flash Error: ${rawMsg}. You can use the AI Prompt Terminal above to copy the prompts and fast-ingest your outlines manually.`,
    };
  }
}
