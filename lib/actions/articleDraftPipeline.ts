'use server';

import { GoogleGenAI } from '@google/genai';
import { ArticleFormat, ArticleEra, getBlueprint } from '@/lib/config/articleBlueprints';

export interface GenerateArticlePipelineInput {
  commodity: string;
  category: string;
  subcategory: string;
  format: ArticleFormat;
  era: ArticleEra;
  title: string;
  description?: string;
  targetPersona?: string;
  pinnedClips?: string[];
}

export interface GeneratedBlockResult {
  type: string;
  role: string;
  content: Record<string, any>;
}

export interface ArticlePipelineResponse {
  success: boolean;
  title: string;
  description: string;
  blocks: GeneratedBlockResult[];
  error?: string;
}

/**
 * Server Action: Generates full structured interactive article blocks using Gemini 3.7 Flash.
 * Ingests topic parameters, blueprint roles, and user clip notes as ground context.
 */
export async function generateArticleBlocksPipeline(input: GenerateArticlePipelineInput): Promise<ArticlePipelineResponse> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      title: input.title,
      description: input.description || '',
      blocks: [],
      error: 'GEMINI_API_KEY is not configured in your environment (.env). Please draft manually or add your API key.'
    };
  }

  const blueprint = getBlueprint(input.format, input.era);
  if (!blueprint || blueprint.length === 0) {
    return {
      success: false,
      title: input.title,
      description: input.description || '',
      blocks: [],
      error: 'Invalid blueprint configuration for the selected format and era.'
    };
  }

  const blueprintOutline = blueprint.map((b, i) => `${i + 1}. Block Type: "${b.type}", Role: "${b.role}", Focus Description: "${b.desc}"`).join('\n');

  const groundContext = input.pinnedClips && input.pinnedClips.length > 0 
    ? `\n=== USER FIELD GROUND INTELLIGENCE (PINNED CLIP NOTES) ===\n${input.pinnedClips.map((c, i) => `[Clip ${i + 1}]: ${c}`).join('\n\n')}\n`
    : '';

  const systemInstruction = `
You are the Lead Systems Architect & Senior Agricultural Intelligence Director for Food Nerve (Nigeria / Africa).
Your task is to generate a comprehensive, highly authoritative, data-backed article written for operators, institutional aggregators, and agtech investors.

TARGET PARAMETERS:
- Commodity: ${input.commodity}
- Challenge Sector: ${input.category}
- Subcategory Focal Point: ${input.subcategory}
- Article Format: ${input.format.toUpperCase()}
- Time Horizon: ${input.era.toUpperCase()} ERA
- Master Working Title: "${input.title}"
${input.targetPersona ? `- Primary Target Audience / Persona: ${input.targetPersona}` : ''}
${groundContext}

REQUIRED BLUEPRINT STRUCTURE:
The article must contain EXACTLY the following ${blueprint.length} blocks in order:
${blueprintOutline}

OUTPUT REQUIREMENTS:
You must respond with ONLY a valid JSON object strictly conforming to this schema (no markdown fences, no explanatory preamble):
{
  "title": "A sharp, contrarian, spiky title for this piece",
  "description": "2-3 concise summary sentences outlining the core thesis and market implications",
  "blocks": [
    {
      "type": "block_type_string",
      "role": "block_role_name",
      "content": { ... block specific content fields ... }
    }
  ]
}

BLOCK CONTENT SPECIFICATIONS BY TYPE:
1. "subheading": { "text": "Catchy spiky section title" }
2. "exec_summary": { "points": "• Bullet point 1 with data\\n• Bullet point 2 with market reality\\n• Bullet point 3 with actionable insight" }
3. "highlight_card": { "caption": "Key statistic caption with local numbers (e.g. ₦/ton, spoilage % in Kano/Oyo)" }
4. "core_interactive": { "bionicText": "Deep 2-3 paragraph investigative analysis with bolded key terms and rigorous Nigerian agribusiness context.", "anchorQuestion": "A thought-provoking question for the reader" }
5. "myth_fact": { "myth": "Common industry misconception", "fact": "The hard ground truth backed by unit economics" }
6. "pull_quote": { "quote": "A provocative, contrarian quote from a field operator", "attribution": "e.g. Lead Logistics Aggregator, Dawanau Grain Market" }
7. "comparison_matrix": {
    "optionAName": "Traditional / Old Approach",
    "optionBName": "Modern / Decentralized Approach",
    "winnerVerdict": "Decisive summary of which model wins on unit economics",
    "rows": [
      { "criterion": "CAPEX", "optionAValue": "Low (₦500k)", "optionBValue": "Medium (₦2.5M)", "winner": "A" },
      { "criterion": "Post-Harvest Spoilage", "optionAValue": "38%", "optionBValue": "8%", "winner": "B" },
      { "criterion": "Margin per Ton", "optionAValue": "₦14,000", "optionBValue": "₦42,000", "winner": "B" }
    ]
  }
8. "protocol_steps": {
    "title": "Action Checklist",
    "steps": [
      { "stepNumber": 1, "instruction": "Step 1 instruction", "detail": "Detailed SOP description" },
      { "stepNumber": 2, "instruction": "Step 2 instruction", "detail": "Detailed SOP description" }
    ]
  }
9. "call_to_action": { "headline": "Immediate Operational Directive", "body": "Specific mandate for aggregators and operators to execute this quarter." }
`;

  try {
    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: systemInstruction,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '';
    if (!responseText) {
      throw new Error('Gemini 3.7 Flash returned an empty response.');
    }

    const parsed = JSON.parse(responseText);

    const validatedBlocks: GeneratedBlockResult[] = (parsed.blocks || []).map((b: any, idx: number) => {
      const blueprintBlock = blueprint[idx] || { type: b.type || 'core_interactive', role: b.role || 'Analysis' };
      return {
        type: blueprintBlock.type,
        role: blueprintBlock.role,
        content: b.content || {},
      };
    });

    return {
      success: true,
      title: parsed.title || input.title,
      description: parsed.description || input.description || '',
      blocks: validatedBlocks,
    };
  } catch (error: any) {
    console.error('[ArticleDraftPipeline] Generation error:', error);
    return {
      success: false,
      title: input.title,
      description: input.description || '',
      blocks: [],
      error: error.message || 'Failed to generate article blocks via AgroLLM.'
    };
  }
}
