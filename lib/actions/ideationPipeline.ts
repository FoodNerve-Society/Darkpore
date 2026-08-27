'use server';

import { GoogleGenAI } from '@google/genai';
import { DOC_1A_MASTER_PROMPT, DOC_1B_MASTER_PROMPT, DOC_1C_MASTER_PROMPT } from '../config/ideationPrompts';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

export async function generateDoc1A(payload: {
  category: string;
  commodity: string;
  targetActors: string[];
  userLocation: string;
  subcategoriesList: string;
}) {
  if (!apiKey) return { success: false, error: 'GEMINI_API_KEY missing in .env' };

  const prompt = DOC_1A_MASTER_PROMPT
    .replace('{{category}}', payload.category)
    .replace(/\{\{commodity\}\}/g, payload.commodity)
    .replace(/\{\{target_actors\}\}/g, payload.targetActors.join(', '))
    .replace(/\{\{user_location\}\}/g, payload.userLocation || 'None provided')
    .replace('{{subcategories_list}}', payload.subcategoriesList)
    .replace(/\{\{current_month_year\}\}/g, new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));

  try {
    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt
    });

    const text = response.text || '';
    
    // Parse the two markdown blocks
    const editorFeedbackMatch = text.match(/# \[EDITOR_FEEDBACK\]([\s\S]*?)(?=\*\*\*|# \[DOC_1A_MACRO_CONTEXT\])/);
    const macroContextMatch = text.match(/# \[DOC_1A_MACRO_CONTEXT\]([\s\S]*)/);

    const editorFeedback = editorFeedbackMatch ? editorFeedbackMatch[1].trim() : 'Feedback generation failed.';
    const macroContext = macroContextMatch ? macroContextMatch[1].trim() : text;

    return {
      success: true,
      editorFeedback,
      macroContext,
      rawOutput: text
    };
  } catch (error: any) {
    console.error('[generateDoc1A] Error:', error);
    return { success: false, error: error.message || 'Doc 1A Generation Failed' };
  }
}

export async function generateDoc1B(payload: {
  commodity: string;
  targetActors: string[];
  selectedLocation: string;
  userOutcome: string;
  userWhyNow: string;
  doc1AMacroContext: string;
  subcategoriesList: string;
}) {
  if (!apiKey) return { success: false, error: 'GEMINI_API_KEY missing in .env' };

  const prompt = DOC_1B_MASTER_PROMPT
    .replace(/\{\{commodity\}\}/g, payload.commodity)
    .replace('{{target_actors}}', payload.targetActors.join(', '))
    .replace(/\{\{selected_location\}\}/g, payload.selectedLocation)
    .replace(/\{\{user_outcome\}\}/g, payload.userOutcome)
    .replace(/\{\{user_why_now\}\}/g, payload.userWhyNow)
    .replace('[DOC_1A_MACRO_CONTEXT]: [Present in Chat Memory]', `[DOC_1A_MACRO_CONTEXT]:\n${payload.doc1AMacroContext}`)
    .replace('{{subcategories_list}}', payload.subcategoriesList)
    .replace(/\{\{current_month_year\}\}/g, new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));

  try {
    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt
    });

    const text = response.text || '';
    
    const editorCritiqueMatch = text.match(/# \[EDITOR_CRITIQUE\]([\s\S]*?)(?=\*\*\*|# \[DOC_1B_INTELLIGENCE_POOL\])/);
    const intelPoolMatch = text.match(/# \[DOC_1B_INTELLIGENCE_POOL\]([\s\S]*)/);

    const editorCritique = editorCritiqueMatch ? editorCritiqueMatch[1].trim() : '';
    const intelPool = intelPoolMatch ? intelPoolMatch[1].trim() : text;

    return {
      success: true,
      editorCritique,
      intelPool,
      rawOutput: text
    };
  } catch (error: any) {
    console.error('[generateDoc1B] Error:', error);
    return { success: false, error: error.message || 'Doc 1B Generation Failed' };
  }
}

export async function generateDoc1C(payload: {
  doc1AMacroContext: string;
  doc1BIntelPool: string;
  userFinalDecision: string;
  targetPersona: string;
}) {
  if (!apiKey) return { success: false, error: 'GEMINI_API_KEY missing in .env' };

  const prompt = DOC_1C_MASTER_PROMPT
    .replace('{{doc1a_output}}', payload.doc1AMacroContext)
    .replace('{{doc1b_output}}', payload.doc1BIntelPool)
    .replace('{{user_final_decision}}', payload.userFinalDecision)
    .replace(/\{\{target_persona\}\}/g, payload.targetPersona)
    .replace(/\{\{current_month_year\}\}/g, new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));

  try {
    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt
    });

    const text = response.text || '';
    
    return {
      success: true,
      outlinesMarkdown: text
    };
  } catch (error: any) {
    console.error('[generateDoc1C] Error:', error);
    return { success: false, error: error.message || 'Doc 1C Generation Failed' };
  }
}
