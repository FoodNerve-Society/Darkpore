'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Paper,
  Alert,
  alpha,
  Divider,
  TextField,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BoltIcon from '@mui/icons-material/Bolt';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import PremiumTextField from '@/components/PremiumTextField';
import PremiumMarkdownEditor from '@/components/PremiumMarkdownEditor';
import { PromptTerminalBox } from '@/components/prompts/PromptTerminalBox';
import { PromptFastIngestBox } from '@/components/prompts/PromptFastIngestBox';
import { PromptChecklistItem } from '@/components/prompts/PromptChecklistItem';
import { motion, AnimatePresence } from 'framer-motion';
import { usePromptAssistant } from '@/context/PromptAssistantContext';
import { DEF_BLOCK_DEFINITIONS, LIVESTREAM_TYPE_FLOWS, DEF_BLOCKS_ORDER } from './defBlocksConfig';
import { canonicalizeDefBlockId } from '@/lib/config/livestreamMasterPrompts';

export interface LivestreamRundownSegment {
  time: string;
  role: string;
  desc: string;
  speakerNotes?: string;
}

export interface LivestreamIdeaOption {
  id: string;
  typeTitle: string;
  typeIcon: string;
  timeframe: 'past' | 'present' | 'future';
  eraBadge: string;
  eraColor: string;
  category?: string;
  format?: 'industry_teardown' | 'panel_debate' | 'talent_spotlight';
  title: string;
  description: string;
  hook: string;
  timelinePillars: LivestreamRundownSegment[];
  keyQuestions?: string[];
  suggestedJobsFocus?: string;
  customBlockDescriptions?: Record<string, string>;
}

interface LivestreamIdeasSidePaneProps {
  open: boolean;
  onClose: () => void;
  onOpen?: () => void;
  hubTitle?: string;
  hubColor?: string;
  currentCategory?: string;
  currentTimeframe?: 'past' | 'present' | 'future';
  guidingArticles?: Array<{ id: string; title: string; description?: string; [key: string]: any }>;
  guidingJobs?: Array<{ id: string; title: string; compensationOrTarget?: string; organizationChallenges?: string; [key: string]: any }>;
  guidingListings?: Array<{ id: string; title: string; [key: string]: any }>;
  guidingCampaigns?: Array<{ id: string; title: string; [key: string]: any }>;
  onApplyIdea?: (idea: {
    title: string;
    description: string;
    timeframe: 'past' | 'present' | 'future';
    category?: string;
    blocks?: any[];
    blueprint?: any;
  }) => void;
  onIngestBlueprints?: (blueprints: LivestreamIdeaOption[]) => void;
}

/**
 * Parses raw text containing livestream blueprint payloads.
 * Supports both [LIVESTREAM_MENU_PAYLOAD] (LS-Doc 1c) and legacy delimiter formats.
 */
export function parseLivestreamPayload(rawText: string, fallbackHub: string, fallbackCategory: string): LivestreamIdeaOption[] {
  if (!rawText || !rawText.trim()) return [];

  let text = rawText.replace(/\r\n/g, '\n').trim();
  // Strip wrapping markdown / json code fences
  text = text.replace(/^```(?:markdown|json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  const results: LivestreamIdeaOption[] = [];

  const eraConfigMap: Record<string, { badge: string; color: string; icon: string }> = {
    present: { badge: '⚡ Present Era', color: '#10b981', icon: '⚡' },
    future: { badge: '🚀 Future Era', color: '#8b5cf6', icon: '🚀' },
    past: { badge: '📜 Past Era', color: '#6366f1', icon: '📜' },
  };

  const angleDefaults = [
    { title: 'The Head-On Assault', icon: '🔴', color: '#ef4444', badge: '🔴 Head-On Assault' },
    { title: 'The Flank / Sideways Attack', icon: '🟡', color: '#f59e0b', badge: '🟡 Flank Attack' },
    { title: 'The Trojan Horse', icon: '🟢', color: '#10b981', badge: '🟢 Trojan Horse' },
    { title: 'The Contrarian Crossfire', icon: '🟣', color: '#a855f7', badge: '🟣 Contrarian Crossfire' },
  ];

  // ── DETECTION 0: JSON PAYLOAD (Raw or wrapped in markdown code fence) ──
  // 1. Strip top-level delimiter tags if present (e.g. [LIVESTREAM_MENU_PAYLOAD])
  const cleanRaw = rawText.replace(/\[\s*(?:LIVESTREAM_MENU_PAYLOAD|LIVESTREAM_BLUEPRINTS|LS_DOC_1C_PAYLOAD)\s*\]/gi, '').trim();

  // 2. Search all code fences for valid JSON array/object candidate
  let jsonStringCandidate = '';
  const fenceMatches = Array.from(cleanRaw.matchAll(/```(?:json|markdown)?\s*([\s\S]*?)\s*```/gi));
  for (const match of fenceMatches) {
    const inner = (match[1] || '').trim();
    if ((inner.includes('{') && inner.includes('}')) || (inner.includes('[') && inner.includes(']'))) {
      jsonStringCandidate = inner;
      break;
    }
  }

  // 3. Fallback to outermost array/object brackets
  if (!jsonStringCandidate) {
    if ((cleanRaw.startsWith('[') && cleanRaw.endsWith(']')) || (cleanRaw.startsWith('{') && cleanRaw.endsWith('}'))) {
      jsonStringCandidate = cleanRaw;
    } else {
      const firstBracket = cleanRaw.indexOf('[');
      const lastBracket = cleanRaw.lastIndexOf(']');
      const firstBrace = cleanRaw.indexOf('{');
      const lastBrace = cleanRaw.lastIndexOf('}');

      let bracketSub = '';
      if (firstBracket !== -1 && lastBracket > firstBracket) {
        bracketSub = cleanRaw.substring(firstBracket, lastBracket + 1).trim();
      }
      let braceSub = '';
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        braceSub = cleanRaw.substring(firstBrace, lastBrace + 1).trim();
      }

      if (bracketSub && (!braceSub || firstBracket < firstBrace)) {
        jsonStringCandidate = bracketSub;
      } else if (braceSub) {
        jsonStringCandidate = braceSub;
      } else {
        jsonStringCandidate = cleanRaw;
      }
    }
  }

  // Trailing commas cleanup helper (preserves whitespace and newlines)
  const cleanJsonCandidate = (candidate: string) => {
    return candidate.replace(/,+(\s*[\]}])/g, '$1');
  };

  if (jsonStringCandidate) {
    try {
      let parsed: any;
      const cleanStr = cleanJsonCandidate(jsonStringCandidate);

      try {
        parsed = JSON.parse(cleanStr);
      } catch (err1) {
        // Stage 1: Line-by-line inner unescaped quote repair
        try {
          const lines = cleanStr.split('\n');
          const fixedLines = lines.map((line) => {
            const m = line.match(/^(\s*"[a-zA-Z0-9_-]+"\s*:\s*)"(.*)"(\s*[,\]}]*\s*)$/);
            if (m) {
              const prefix = m[1];
              let val = m[2];
              const suffix = m[3];
              val = val.replace(/(?<!\\)"/g, '\\"');
              return `${prefix}"${val}"${suffix}`;
            }
            return line;
          });
          parsed = JSON.parse(cleanJsonCandidate(fixedLines.join('\n')));
        } catch (err2) {
          // Stage 2: Repair unescaped newlines/tabs inside double-quoted strings
          try {
            const sanitized = cleanStr.replace(
              /"([^"\\]*(?:\\.[^"\\]*)*)"/g,
              (match, inner) =>
                '"' +
                inner
                  .replace(/\n/g, '\\n')
                  .replace(/\r/g, '\\r')
                  .replace(/\t/g, '\\t') +
                '"'
            );
            parsed = JSON.parse(cleanJsonCandidate(sanitized));
          } catch (err3) {
            // Stage 3: Attempt recovery by locating array substring
            const startIdx = jsonStringCandidate.indexOf('[');
            const endIdx = jsonStringCandidate.lastIndexOf(']');
            if (startIdx !== -1 && endIdx > startIdx) {
              const subCandidate = jsonStringCandidate.substring(startIdx, endIdx + 1);
              const subLines = cleanJsonCandidate(subCandidate).split('\n');
              const subFixed = subLines.map((line) => {
                const m = line.match(/^(\s*"[a-zA-Z0-9_-]+"\s*:\s*)"(.*)"(\s*[,\]}]*\s*)$/);
                if (m) {
                  const prefix = m[1];
                  let val = m[2];
                  const suffix = m[3];
                  val = val.replace(/(?<!\\)"/g, '\\"');
                  return `${prefix}"${val}"${suffix}`;
                }
                return line;
              });
              parsed = JSON.parse(cleanJsonCandidate(subFixed.join('\n')));
            } else {
              throw err3;
            }
          }
        }
      }

      let items: any[] = [];
      if (Array.isArray(parsed)) {
        items = parsed;
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.options)) items = parsed.options;
        else if (Array.isArray(parsed.blueprints)) items = parsed.blueprints;
        else if (Array.isArray(parsed.pitches)) items = parsed.pitches;
        else if (Array.isArray(parsed.payload)) items = parsed.payload;
        else if (Array.isArray(parsed.livestreams)) items = parsed.livestreams;
        else if (Array.isArray(parsed.menu)) items = parsed.menu;
        else if (Array.isArray(parsed.items)) items = parsed.items;
        else if (parsed.title || parsed.blocks || parsed.format) {
          items = [parsed];
        }
      }

      if (items.length > 0) {
        items.forEach((item: any, idx: number) => {
          const angleIndex = idx % angleDefaults.length;
          const fallbackAngle = angleDefaults[angleIndex];

          const typeTitle = item.typeTitle || item.angle || fallbackAngle.title;
          const typeIcon = item.typeIcon || fallbackAngle.icon;
          const eraColor = item.eraColor || fallbackAngle.color;
          const eraBadge = item.eraBadge || `${typeIcon} ${typeTitle}`;

          const rawTf = (item.timeframe || item.era || 'present').toLowerCase();
          const timeframe: 'past' | 'present' | 'future' = rawTf.includes('past') ? 'past' : (rawTf.includes('future') ? 'future' : 'present');

          // Normalize format
          let parsedFormat: 'industry_teardown' | 'panel_debate' | 'talent_spotlight' = 'industry_teardown';
          const rawFmt = (item.format || '').toLowerCase();
          if (rawFmt.includes('talent') || rawFmt.includes('spotlight')) parsedFormat = 'talent_spotlight';
          else if (rawFmt.includes('debate') || rawFmt.includes('panel')) parsedFormat = 'panel_debate';
          else parsedFormat = 'industry_teardown';

          // Extract blocks with canonical block IDs
          const customBlockDescriptions: Record<string, string> = {};
          const rawBlocks = item.blocks || item.customBlockDescriptions || {};
          if (typeof rawBlocks === 'object' && !Array.isArray(rawBlocks)) {
            Object.entries(rawBlocks).forEach(([key, val]) => {
              if (typeof val === 'string' && val.trim()) {
                const canonicalKey = canonicalizeDefBlockId(key);
                customBlockDescriptions[canonicalKey] = val.trim();
              }
            });
          } else if (Array.isArray(rawBlocks)) {
            rawBlocks.forEach((b: any) => {
              const bName = b.name || b.role || b.title || b.blockId || b.id || '';
              const bDesc = b.description || b.desc || b.customDescription || '';
              if (bName && typeof bDesc === 'string' && bDesc.trim()) {
                const canonicalKey = canonicalizeDefBlockId(bName);
                customBlockDescriptions[canonicalKey] = bDesc.trim();
              }
            });
          }

          // Build timelinePillars: prioritize explicit timelinePillars if provided, else order by format flow
          const timelinePillars: LivestreamRundownSegment[] = [];
          if (Array.isArray(item.timelinePillars) && item.timelinePillars.length > 0) {
            item.timelinePillars.forEach((p: any) => {
              const pRole = p.role || p.name || 'Segment';
              const pDesc = p.desc || p.description || '';
              const pCanonical = canonicalizeDefBlockId(pRole);
              if (!customBlockDescriptions[pCanonical] && pDesc) {
                customBlockDescriptions[pCanonical] = pDesc;
              }
              timelinePillars.push({
                time: p.time || '2m',
                role: pRole,
                desc: pDesc,
              });
            });
          } else if (Object.keys(customBlockDescriptions).length > 0) {
            const flowOrder = LIVESTREAM_TYPE_FLOWS[parsedFormat] || DEF_BLOCKS_ORDER;
            const orderedBlockIds = [
              ...flowOrder.filter((bId) => customBlockDescriptions[bId]),
              ...Object.keys(customBlockDescriptions).filter((bId) => !flowOrder.includes(bId)),
            ];

            orderedBlockIds.forEach((k) => {
              const def = DEF_BLOCK_DEFINITIONS[k];
              const desc = customBlockDescriptions[k];
              timelinePillars.push({
                time: def?.defaultDuration || '2m',
                role: def?.name || k.replace(/_/g, ' ').toUpperCase(),
                desc,
              });
            });
          } else {
            timelinePillars.push(
              { time: '00-15m', role: 'Act 1: The Open', desc: item.description || 'Anchor Tension & Reframe' },
              { time: '15-35m', role: 'Act 2: The Meat', desc: item.hook || 'Map System & Skeptic Defense' },
              { time: '35-50m', role: 'Act 3: The Close', desc: item.suggestedJobsFocus || 'Forked Close & Job/Deal Spotlight' }
            );
          }

          results.push({
            id: item.id || `ls-json-${idx}-${Date.now()}`,
            typeTitle,
            typeIcon,
            timeframe,
            eraBadge,
            eraColor,
            category: item.category || fallbackCategory,
            format: parsedFormat,
            title: item.title || item.broadcastTitle || `${fallbackHub} Livestream ${idx + 1}`,
            description: item.description || '',
            hook: item.hook || item.coreDebate || '',
            timelinePillars,
            keyQuestions: Array.isArray(item.keyQuestions) ? item.keyQuestions : undefined,
            suggestedJobsFocus: item.suggestedJobsFocus || item.cta || undefined,
            customBlockDescriptions: Object.keys(customBlockDescriptions).length > 0 ? customBlockDescriptions : undefined,
          });
        });

        if (results.length > 0) return results;
      }
    } catch (e) {
      console.warn('JSON candidate parse error in parseLivestreamPayload:', e);
    }
  }

  // Split on Option headers while retaining the header line
  // Matches: ### OPTION 1, ## 🔴 OPTION 1, ### Option 1, **OPTION 1**, 1. OPTION 1, etc.
  const rawSections = text.split(/(?=(?:\n|^)(?:#{1,4}\s*.*?\b(?:OPTION|PITCH|BLUEPRINT)\s*\d+|\*\*\s*.*?\b(?:OPTION|PITCH|BLUEPRINT)\s*\d+))/i)
    .map(s => s.trim())
    .filter(Boolean);

  rawSections.forEach((sec, idx) => {
    // If preamble section without option header or acts, skip it
    if ((sec.includes('[LIVESTREAM_MENU_PAYLOAD]') || sec.includes('Broadcast Hub:')) && !sec.match(/(?:Act\s*1|Broadcast\s+Title|OPTION)/i)) {
      return;
    }

    const firstLine = sec.split('\n')[0].trim();
    const cleanFirstLine = firstLine.replace(/^#{1,4}\s*/, '').replace(/^\*\*|\*\*$/g, '').trim();

    // Check for emoji in header line
    const emojiMatch = cleanFirstLine.match(/([🔴🟡🟢🔵🟣⚡💡🎙️])/);
    const angleIndex = results.length % angleDefaults.length;
    const fallbackAngle = angleDefaults[angleIndex];

    const typeIcon = emojiMatch ? emojiMatch[1] : fallbackAngle.icon;
    let eraColor = fallbackAngle.color;
    if (typeIcon === '🔴') eraColor = '#ef4444';
    else if (typeIcon === '🟡') eraColor = '#f59e0b';
    else if (typeIcon === '🟢') eraColor = '#10b981';
    else if (typeIcon === '🟣') eraColor = '#a855f7';

    // Persona title from header (e.g. "[LIVESTREAM_PITCH_1]: The Head-On Assault")
    let personaTitle = fallbackAngle.title;
    if (cleanFirstLine.includes(':')) {
      const afterColon = cleanFirstLine.substring(cleanFirstLine.indexOf(':') + 1).replace(/[*_`]/g, '').trim();
      if (afterColon.length > 2) personaTitle = afterColon;
    } else if (cleanFirstLine.length > 3 && !cleanFirstLine.toLowerCase().startsWith('option')) {
      personaTitle = cleanFirstLine;
    }

    const eraBadge = `${typeIcon} ${personaTitle.split('(')[0].trim()}`;

    // 1. Extract Broadcast Title
    let title = '';
    const titleMatch = sec.match(/(?:^|\n)[*•-]?\s*\*?\*?(?:Broadcast\s+Title|Title)\*?\*?:\s*(.+)/i);
    if (titleMatch) {
      title = titleMatch[1].replace(/[*_`"']/g, '').trim();
    }
    if (!title) {
      const titleMultilineMatch = sec.match(/(?:^|\n)[*•-]?\s*\*?\*?(?:Broadcast\s+Title|Title)\*?\*?:\s*\n\s*(.+)/i);
      if (titleMultilineMatch) {
        title = titleMultilineMatch[1].replace(/[*_`"']/g, '').trim();
      }
    }
    if (!title) {
      title = personaTitle && personaTitle.length > 5 ? personaTitle : `${fallbackHub} Broadcast Option ${results.length + 1}`;
    }

    // 2. Extract Explicit Format & Timeframe
    const formatMatch = sec.match(/(?:^|\n)[*•-]?\s*\*?\*?Format\*?\*?:\s*([^\n\r*]+)/i);
    let parsedFormat: 'industry_teardown' | 'panel_debate' | 'talent_spotlight' | undefined;
    if (formatMatch) {
      const rawFmt = formatMatch[1].toLowerCase();
      if (rawFmt.includes('teardown') || rawFmt.includes('audit')) parsedFormat = 'industry_teardown';
      else if (rawFmt.includes('debate') || rawFmt.includes('panel')) parsedFormat = 'panel_debate';
      else if (rawFmt.includes('talent') || rawFmt.includes('spotlight') || rawFmt.includes('job')) parsedFormat = 'talent_spotlight';
    }

    const timeframeMatch = sec.match(/(?:^|\n)[*•-]?\s*\*?\*?Timeframe\*?\*?:\s*([^\n\r*]+)/i);
    let timeframe: 'past' | 'present' | 'future' = 'present';
    if (timeframeMatch) {
      const rawTf = timeframeMatch[1].toLowerCase();
      if (rawTf.includes('past')) timeframe = 'past';
      else if (rawTf.includes('future')) timeframe = 'future';
      else timeframe = 'present';
    } else {
      timeframe = /future|horizon|203\d/i.test(sec) ? 'future' : (/past|historical|origin/i.test(sec) ? 'past' : 'present');
    }

    // 3. Extract Block-by-Block Custom Descriptions
    const customBlockDescriptions: Record<string, string> = {};
    const blockSegments: LivestreamRundownSegment[] = [];

    const blockRegex = /(?:^|\n)[*•-]?\s*\*?\*?Block\s*\d*[:.-]?\s*([^*:\n\r()]+)\*?\*?(?:\s*\(([^)]*)\))?[^\n\r:]*[:\-]?\s*(?:\n\s*[↳\-*•]?\s*\*?\*?Description\*?\*?:\s*|\s*)([^\n\r]+)/gi;
    let bMatch: RegExpExecArray | null;
    while ((bMatch = blockRegex.exec(sec)) !== null) {
      const rawBlockName = bMatch[1].trim();
      const timeInfo = bMatch[2] ? bMatch[2].trim() : '2m';
      const blockDesc = bMatch[3] ? bMatch[3].trim().replace(/^[*_`\s]+|[*_`\s]+$/g, '') : '';
      if (!blockDesc || blockDesc.toLowerCase().startsWith('block')) continue;

      const norm = rawBlockName.toLowerCase().replace(/[^a-z0-9_]+/g, '_');
      let blockKey = '';
      if (norm.includes('tension') || norm.includes('anchor')) blockKey = 'anchor_tension';
      else if (norm.includes('reframe') || norm.includes('question')) blockKey = 'reframe_question';
      else if (norm.includes('funnel') || norm.includes('diagnostic')) blockKey = 'funnel_system';
      else if (norm.includes('ideal') || norm.includes('feasible') || norm.includes('disconnect')) blockKey = 'ideal_vs_feasible';
      else if (norm.includes('burden') || norm.includes('loss') || norm.includes('bleed')) blockKey = 'scaled_burden';
      else if (norm.includes('power') || norm.includes('decider') || norm.includes('enforcer')) blockKey = 'power_map';
      else if (norm.includes('response') || norm.includes('audit')) blockKey = 'response_audit';
      else if (norm.includes('boundary') || norm.includes('gateway') || norm.includes('kpi')) blockKey = 'boundary_test';
      else if (norm.includes('preempt') || norm.includes('objection') || norm.includes('skeptic')) blockKey = 'preempt_objections';
      else if (norm.includes('return') || norm.includes('case')) blockKey = 'return_to_case';
      else if (norm.includes('fork') || norm.includes('path') || norm.includes('close')) blockKey = 'forked_close';
      else if (norm.includes('talent') || norm.includes('spotlight') || norm.includes('deal') || norm.includes('cta')) blockKey = 'talent_spotlight';

      if (blockKey) {
        customBlockDescriptions[blockKey] = blockDesc;
        blockSegments.push({
          time: timeInfo,
          role: rawBlockName,
          desc: blockDesc,
        });
      }
    }

    // 4. Fallback: Extract Acts & CTA if block bullets are absent
    const act1Match = sec.match(/(?:^|\n)[*•-]?\s*\*?\*?(?:Act\s*1\b|THE\s*OPEN\b)[^\n:]*[:\-]\s*([\s\S]*?)(?=(?:\n[*•-]?\s*\*?\*?(?:Act\s*2\b|THE\s*MEAT\b)|$))/i);
    const act2Match = sec.match(/(?:^|\n)[*•-]?\s*\*?\*?(?:Act\s*2\b|THE\s*MEAT\b)[^\n:]*[:\-]\s*([\s\S]*?)(?=(?:\n[*•-]?\s*\*?\*?(?:Act\s*3\b|THE\s*CLOSE\b)|$))/i);
    const act3Match = sec.match(/(?:^|\n)[*•-]?\s*\*?\*?(?:Act\s*3\b|THE\s*CLOSE\b)[^\n:]*[:\-]\s*([\s\S]*?)(?=(?:\n[*•-]?\s*\*?\*?(?:The\s+Ecosystem\s+Push|Ecosystem\s+CTA|CTA\b|The\s+Push)|$))/i);
    const ctaMatch = sec.match(/(?:^|\n)[*•-]?\s*\*?\*?(?:The\s+Ecosystem\s+Push|Ecosystem\s+CTA|CTA\b|The\s+Push)[^\n:]*[:\-]\s*([\s\S]*?)(?=(?:\n#{1,4}|\n---|---|$))/i);

    const act1Text = act1Match ? act1Match[1].replace(/^[*_`\s]+|[*_`\s]+$/g, '').trim() : '';
    const act2Text = act2Match ? act2Match[1].replace(/^[*_`\s]+|[*_`\s]+$/g, '').trim() : '';
    const act3Text = act3Match ? act3Match[1].replace(/^[*_`\s]+|[*_`\s]+$/g, '').trim() : '';
    const ctaText = ctaMatch ? ctaMatch[1].replace(/^[*_`\s]+|[*_`\s]+$/g, '').trim() : '';

    if (Object.keys(customBlockDescriptions).length === 0) {
      if (act1Text) customBlockDescriptions['anchor_tension'] = act1Text;
      if (act2Text) customBlockDescriptions['power_map'] = act2Text;
      if (act3Text) customBlockDescriptions['forked_close'] = act3Text;
      if (ctaText) customBlockDescriptions['talent_spotlight'] = ctaText;
    }

    // Build fallback DEF Timeline Segments if blocks not explicitly parsed
    const segments: LivestreamRundownSegment[] = [];
    if (act1Text || act2Text || act3Text) {
      segments.push({
        time: '00-15m',
        role: 'Act 1: The Open (Tension & Reframe)',
        desc: act1Text || 'State the anchor tension and reframe conventional assumptions with hard field evidence.',
        speakerNotes: act1Text,
      });
      segments.push({
        time: '15-35m',
        role: 'Act 2: The Meat (Map System & Defend)',
        desc: act2Text || 'Expose the systemic villain, present unit economics, and dismantle skeptic counter-arguments live.',
        speakerNotes: act2Text,
      });
      segments.push({
        time: '35-50m',
        role: 'Act 3: The Close (Fork & Ecosystem CTA)',
        desc: `${act3Text}${ctaText ? ` | Conversion: ${ctaText}` : ''}`,
        speakerNotes: `${act3Text}\n\nEcosystem CTA:\n${ctaText}`,
      });
    }

    // Hook: extract quote or first punchy sentence
    let hook = '';
    const quoteMatch = (act1Text || customBlockDescriptions['anchor_tension'] || '').match(/"([^"]+)"/) || (act1Text || customBlockDescriptions['anchor_tension'] || '').match(/“([^”]+)”/);
    if (quoteMatch) {
      hook = `"${quoteMatch[1]}"`;
    } else if (customBlockDescriptions['reframe_question']) {
      hook = customBlockDescriptions['reframe_question'];
    } else if (act1Text) {
      hook = act1Text.length > 140 ? act1Text.slice(0, 140) + '...' : act1Text;
    } else {
      hook = `Strategic livestream teardown for ${personaTitle}.`;
    }

    // Extract questions
    const questions: string[] = [];
    const questionMatches = sec.match(/"([^"]+\?)"/g) || sec.match(/[*•-]\s*([^?\n\r]+?\?)/g);
    if (questionMatches) {
      questionMatches.forEach(q => {
        const cleanQ = q.replace(/^["*•\s-]+|["\s]+$/g, '').trim();
        if (cleanQ.length > 10 && !questions.includes(cleanQ)) questions.push(cleanQ);
      });
    }

    // Description
    const description = customBlockDescriptions['anchor_tension'] || act1Text || `Broadcast presentation engineered for ${personaTitle}.`;

    if (title || blockSegments.length > 0 || segments.length > 0) {
      results.push({
        id: `ls-def-${results.length}-${Date.now()}`,
        typeTitle: personaTitle,
        typeIcon,
        timeframe,
        eraBadge,
        eraColor,
        category: fallbackCategory,
        format: parsedFormat,
        title,
        description,
        hook,
        timelinePillars: blockSegments.length > 0 ? blockSegments : (segments.length > 0 ? segments : [
          { time: '00-15m', role: 'Act 1: The Open', desc: 'Anchor Tension & Reframe Question' },
          { time: '15-35m', role: 'Act 2: The Meat', desc: 'Map System & Skeptic Defense' },
          { time: '35-50m', role: 'Act 3: The Close', desc: 'Forked Close & Job/Deal Spotlight' }
        ]),
        keyQuestions: questions.length > 0 ? questions : undefined,
        suggestedJobsFocus: ctaText || undefined,
        customBlockDescriptions: Object.keys(customBlockDescriptions).length > 0 ? customBlockDescriptions : undefined,
      });
    }
  });

  if (results.length > 0) return results;

  // ── DETECTION 2: DELIMITER / HEADLINE PARSER (FALLBACK) ──
  const sections = text.split(/(?:---|\n(?=###?\s*(?:Blueprint|Livestream|Format|\d+\.)))/i).map(s => s.trim()).filter(Boolean);

  sections.forEach((sec, idx) => {
    const titleMatch = sec.match(/###?\s*(?:Blueprint\s*\d*[:.-]?\s*)?([^\n\r]+)/i) ||
                       sec.match(/[*•-]?\s*\*?\*?Title\*?\*?:\s*([^\n\r*]+)/i);
    const title = titleMatch ? titleMatch[1].replace(/[*_`]/g, '').trim() : '';

    const eraMatch = sec.match(/[*•-]?\s*\*?\*?(?:Era|Timeframe)\*?\*?:\s*([^\n\r*]+)/i);
    const rawEra = eraMatch ? eraMatch[1].toLowerCase().trim() : 'present';
    const timeframe: 'past' | 'present' | 'future' = rawEra.includes('past') ? 'past' : (rawEra.includes('future') ? 'future' : 'present');

    const fmtMatch = sec.match(/[*•-]?\s*\*?\*?Format\*?\*?:\s*([^\n\r*]+)/i);
    let parsedFormat: 'industry_teardown' | 'panel_debate' | 'talent_spotlight' | undefined;
    if (fmtMatch) {
      const fVal = fmtMatch[1].toLowerCase();
      if (fVal.includes('talent') || fVal.includes('spotlight')) parsedFormat = 'talent_spotlight';
      else if (fVal.includes('debate') || fVal.includes('panel')) parsedFormat = 'panel_debate';
      else if (fVal.includes('teardown') || fVal.includes('industry')) parsedFormat = 'industry_teardown';
    }

    const catMatch = sec.match(/[*•-]?\s*\*?\*?Category\*?\*?:\s*([^\n\r*]+)/i);
    const category = catMatch ? catMatch[1].replace(/[*_`]/g, '').trim().toLowerCase() : fallbackCategory;

    const descMatch = sec.match(/[*•-]?\s*\*?\*?Description\*?\*?:([\s\S]*?)(?=(?:[*•-]?\s*\*?\*?(?:Hook|Rundown|Segments|Key Questions|---)|$))/i);
    const description = descMatch ? descMatch[1].replace(/[*_`]/g, '').trim() : `Comprehensive live panel on ${title || fallbackHub}.`;

    const hookMatch = sec.match(/[*•-]?\s*\*?\*?(?:Hook|Angle|Core Debate)\*?\*?:\s*([^\n\r*]+)/i);
    const hook = hookMatch ? hookMatch[1].replace(/[*_`]/g, '').trim() : `Unpack the structural mechanics behind ${title || fallbackHub}.`;

    // Block descriptions in detection 2
    const customBlockDescriptions: Record<string, string> = {};
    const blockRegex = /(?:^|\n)[*•-]?\s*\*?\*?Block\s*\d*[:.-]?\s*([^*:\n\r()]+)\*?\*?(?:\s*\(([^)]*)\))?[^\n\r:]*[:\-]?\s*(?:\n\s*[↳\-*•]?\s*\*?\*?Description\*?\*?:\s*|\s*)([^\n\r]+)/gi;
    let bMatch: RegExpExecArray | null;
    while ((bMatch = blockRegex.exec(sec)) !== null) {
      const rawBlockName = bMatch[1].trim();
      const blockDesc = bMatch[3] ? bMatch[3].trim().replace(/^[*_`\s]+|[*_`\s]+$/g, '') : '';
      if (!blockDesc || blockDesc.toLowerCase().startsWith('block')) continue;

      const norm = rawBlockName.toLowerCase().replace(/[^a-z0-9_]+/g, '_');
      let blockKey = '';
      if (norm.includes('tension') || norm.includes('anchor')) blockKey = 'anchor_tension';
      else if (norm.includes('reframe') || norm.includes('question')) blockKey = 'reframe_question';
      else if (norm.includes('funnel') || norm.includes('diagnostic')) blockKey = 'funnel_system';
      else if (norm.includes('ideal') || norm.includes('feasible') || norm.includes('disconnect')) blockKey = 'ideal_vs_feasible';
      else if (norm.includes('burden') || norm.includes('loss') || norm.includes('bleed')) blockKey = 'scaled_burden';
      else if (norm.includes('power') || norm.includes('decider') || norm.includes('enforcer')) blockKey = 'power_map';
      else if (norm.includes('response') || norm.includes('audit')) blockKey = 'response_audit';
      else if (norm.includes('boundary') || norm.includes('gateway') || norm.includes('kpi')) blockKey = 'boundary_test';
      else if (norm.includes('preempt') || norm.includes('objection') || norm.includes('skeptic')) blockKey = 'preempt_objections';
      else if (norm.includes('return') || norm.includes('case')) blockKey = 'return_to_case';
      else if (norm.includes('fork') || norm.includes('path') || norm.includes('close')) blockKey = 'forked_close';
      else if (norm.includes('talent') || norm.includes('spotlight') || norm.includes('deal') || norm.includes('cta')) blockKey = 'talent_spotlight';

      if (blockKey) {
        customBlockDescriptions[blockKey] = blockDesc;
      }
    }

    // Parse rundown / segments
    const segments: LivestreamRundownSegment[] = [];
    const rundownMatch = sec.match(/[*•-]?\s*\*?\*?(?:Rundown|Segments|Framework)\*?\*?:([\s\S]*?)(?=(?:[*•-]?\s*\*?\*?(?:Key Questions|Questions|---)|$))/i);
    if (rundownMatch) {
      const segLines = rundownMatch[1].split('\n').filter(l => l.trim().length > 0);
      segLines.forEach((line) => {
        const timeMatch = line.match(/(?:~?\d+[-–]\d+m|\d+m|Segment \d+|Part \d+)/i);
        const time = timeMatch ? timeMatch[0] : '~15m';
        const cleanLine = line.replace(/^[\s*•-]+/, '').replace(time, '').replace(/^[:\s-]+/, '').trim();
        const parts = cleanLine.split(/[-–:]/);
        const role = parts[0]?.trim() || 'Key Segment';
        const desc = parts.slice(1).join(' - ').trim() || role;
        if (role) {
          segments.push({ time, role, desc });
        }
      });
    }

    if (segments.length === 0) {
      segments.push(
        { time: '00-15m', role: 'Act 1: The Open', desc: 'Framing the immediate operational bottleneck' },
        { time: '15-35m', role: 'Act 2: The Meat', desc: 'Case study analysis and live stakeholder discussion' },
        { time: '35-50m', role: 'Act 3: The Close', desc: 'Practical calls to action and verified opportunities' }
      );
    }

    const questionsMatch = sec.match(/[*•-]?\s*\*?\*?(?:Key Questions|Discussion Points)\*?\*?:([\s\S]*?)(?:---|$)/i);
    const keyQuestions: string[] = [];
    if (questionsMatch) {
      questionsMatch[1].split('\n').forEach(q => {
        const cleanQ = q.replace(/^[\s*•\d.-]+/, '').trim();
        if (cleanQ.length > 5) keyQuestions.push(cleanQ);
      });
    }

    if (title) {
      results.push({
        id: `custom-idea-${idx}-${Date.now()}`,
        typeTitle: `${timeframe.toUpperCase()} Blueprint`,
        typeIcon: eraConfigMap[timeframe]?.icon || '🎙️',
        timeframe,
        eraBadge: eraConfigMap[timeframe]?.badge || '⚡ Present Era',
        eraColor: eraConfigMap[timeframe]?.color || '#10b981',
        category,
        format: parsedFormat,
        title,
        description,
        hook,
        timelinePillars: segments,
        keyQuestions: keyQuestions.length > 0 ? keyQuestions : undefined,
        customBlockDescriptions: Object.keys(customBlockDescriptions).length > 0 ? customBlockDescriptions : undefined,
      });
    }
  });

  return results;
}

export default function LivestreamIdeasSidePane({
  open,
  onClose,
  onOpen,
  hubTitle = 'Production & Capital',
  hubColor = '#10b981',
  currentCategory = 'capital',
  currentTimeframe = 'present',
  guidingArticles = [],
  guidingJobs = [],
  guidingListings = [],
  guidingCampaigns = [],
  onApplyIdea,
  onIngestBlueprints,
}: LivestreamIdeasSidePaneProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Floating dock visibility (mimics PromptAssistantContext minimal liquid glass dock)
  const [isDockVisible, setIsDockVisible] = useState(false);
  const { suspendDock, setHasEditorDock } = usePromptAssistant();

  useEffect(() => {
    if (open) {
      setIsDockVisible(false);
      suspendDock(true);
      setHasEditorDock(true);
    } else {
      suspendDock(false);
    }
    return () => {
      suspendDock(false);
      setHasEditorDock(false);
    };
  }, [open, suspendDock, setHasEditorDock]);

  const handleMinimize = () => {
    setIsDockVisible(true);
    onClose();
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const defaultTopic = useMemo(() => {
    if (guidingArticles.length > 0) {
      return `${guidingArticles[0].title} — ${hubTitle}`;
    }
    return `${hubTitle} Value Chain & Field Solutions`;
  }, [guidingArticles, hubTitle]);

  const topicInput = defaultTopic;
  const targetAudience = 'Value-Chain Operators, Commercial Offtakers, Agronomists & Capital Allocators';
  const targetLocation = 'Nigeria & West African Agricultural Clusters';
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [copiedPromptTab, setCopiedPromptTab] = useState<string | null>(null);
  const [ingestError, setIngestError] = useState<string | null>(null);

  // Storage Persistence for checklist and fast ingest payload
  const storagePrefix = useMemo(() => {
    const hubSlug = (hubTitle || 'agribusiness').toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const catSlug = (currentCategory || 'general').toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const tfSlug = (currentTimeframe || 'present').toLowerCase().replace(/[^a-z0-9]+/g, '_');
    return `ls_ideas_ingest_${hubSlug}_${catSlug}_${tfSlug}`;
  }, [hubTitle, currentCategory, currentTimeframe]);

  // Fast Ingestion Relay State (LS-Doc 1c output)
  const [customIngestMarkdown, setCustomIngestMarkdown] = useState('');

  // Hydrate persisted state from device localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedChecklist = localStorage.getItem(`${storagePrefix}_checklist`);
        if (savedChecklist) {
          setChecklist(JSON.parse(savedChecklist));
        } else {
          setChecklist({});
        }

        const savedPayload = 
          localStorage.getItem(`${storagePrefix}_payload`) || 
          localStorage.getItem(`ls_ideas_ingest_${(currentCategory || 'general').toLowerCase().replace(/[^a-z0-9]+/g, '_')}_latest_payload`) ||
          localStorage.getItem('ls_ideas_ingest_latest_payload');

        if (savedPayload) {
          setCustomIngestMarkdown(savedPayload);
        }
      } catch {}
    }
  }, [storagePrefix, currentCategory]);

  const savePayloadToStorage = useCallback((val: string) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${storagePrefix}_payload`, val);
        if (currentCategory) {
          const catSlug = currentCategory.toLowerCase().replace(/[^a-z0-9]+/g, '_');
          localStorage.setItem(`ls_ideas_ingest_${catSlug}_latest_payload`, val);
        }
        localStorage.setItem('ls_ideas_ingest_latest_payload', val);
      } catch {}
    }
  }, [storagePrefix, currentCategory]);

  const handleCustomIngestChange = (val: string) => {
    setCustomIngestMarkdown(val);
    savePayloadToStorage(val);
    if (ingestError) setIngestError(null);
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => {
      const next = { ...prev, [id]: !prev[id] };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`${storagePrefix}_checklist`, JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  const markChecklistItem = (id: string) => {
    setChecklist(prev => {
      if (prev[id]) return prev;
      const next = { ...prev, [id]: true };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`${storagePrefix}_checklist`, JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  // Dynamic Date Hooks (Zero Hardcoding)
  const currentDate = useMemo(() => new Date(), []);
  const currentMonthYear = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDate]);
  const currentYear = useMemo(() => {
    return currentDate.getFullYear().toString();
  }, [currentDate]);
  const futureHorizonYear = useMemo(() => {
    return (currentDate.getFullYear() + 4).toString();
  }, [currentDate]);

  const handleCopyPromptText = (text: string, tabKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptTab(tabKey);
    setTimeout(() => setCopiedPromptTab(null), 3000);
  };

  // Pre-configured default 4 blueprints
  const defaultIdeas: LivestreamIdeaOption[] = useMemo(() => {
    const cleanTopic = (topicInput.trim() || defaultTopic).replace(/—.*$/, '').trim();

    return [
      {
        id: 'town-hall',
        typeTitle: 'Groundwork Town Hall & Field Deep-Dive',
        typeIcon: '🎙️',
        timeframe: 'present',
        eraBadge: '⚡ Present Era',
        eraColor: '#10b981',
        category: currentCategory,
        title: `${cleanTopic}: Farmgate Reality & Producer Town Hall`,
        description: `An interactive live town hall addressing immediate farmgate bottlenecks, aggregation logistics, and actionable producer takeaways.`,
        hook: `Connect directly with local producers and operators to uncover what is actually happening in the field today.`,
        timelinePillars: [
          { time: '00-15m', role: 'Field Data & Problem Spotlight', desc: 'Current cluster metrics and farmgate bottlenecks' },
          { time: '15-35m', role: 'Live Stakeholder Interview', desc: 'Deep dive with cooperative leaders and input suppliers' },
          { time: '35-50m', role: 'Interactive Q&A & Role Attachments', desc: 'Open audience questions with verified job opportunities' },
        ],
        keyQuestions: [
          'What is the real cash-to-farmgate spread this harvest?',
          'How are aggregator cooperatives handling diesel & storage costs?',
          'What immediate capital solutions can farmers access before next planting?'
        ],
      },
      {
        id: 'offtake-pitch',
        typeTitle: 'Market Disconnect & Offtake Pitchroom',
        typeIcon: '⚡',
        timeframe: 'present',
        eraBadge: '⚡ Present Era',
        eraColor: '#f59e0b',
        category: currentCategory,
        title: `${cleanTopic}: Offtake Contracts & Trade Escrow Live`,
        description: `Matching verified commercial processors with organized farmer clusters to eliminate middlemen friction and secure volume contracts.`,
        hook: `Bridge the gap between off-taker quality specs and smallholder field deliveries in real-time.`,
        timelinePillars: [
          { time: '00-15m', role: 'Contract Parameters & Pricing Index', desc: 'Transparency on off-taker moisture & purity benchmarks' },
          { time: '15-35m', role: 'Live Cluster Negotiations', desc: 'Producer clusters pitch available metric tons and harvest dates' },
          { time: '35-50m', role: 'Deal Room Escrow Activation', desc: 'Formalizing letters of intent and Paystack escrow commitments' },
        ],
        keyQuestions: [
          'Why are standard off-taker specs rejected by 40% of smallholders?',
          'How does structured digital escrow protect both buyer and cluster?',
        ],
      },
      {
        id: 'future-harvest',
        typeTitle: 'Future Harvest & Mechanization Showcase',
        typeIcon: '🚀',
        timeframe: 'future',
        eraBadge: '🚀 Future Era',
        eraColor: '#8b5cf6',
        category: currentCategory,
        title: `${cleanTopic}: 2030 Mechanization & Technology Horizon`,
        description: `Explore the next frontier of climate-resilient inputs, automated processing, and digital infrastructure reshaping this value chain.`,
        hook: `Discover the breakthrough tools and talent profiles that will dominate African agribusiness over the next decade.`,
        timelinePillars: [
          { time: '00-15m', role: 'Emerging Tech & Input Demos', desc: 'Solar drying, drone sprayers, and biological crop treatments' },
          { time: '15-35m', role: 'Operator Case Studies', desc: 'Early adopters reveal unit economics and payback periods' },
          { time: '35-50m', role: 'Upskilling & Career Pathways', desc: 'Connecting young professionals to high-growth agro-tech roles' },
        ],
        keyQuestions: [
          'Which mechanization models yield sub-18 month ROI on 50ha clusters?',
          'How can youth transition from manual labor to machinery piloting?',
        ],
      },
      {
        id: 'policy-case-study',
        typeTitle: 'Policy, Capital & Field Case Study',
        typeIcon: '📜',
        timeframe: 'past',
        eraBadge: '📜 Past Era',
        eraColor: '#6366f1',
        category: currentCategory,
        title: `${cleanTopic}: Retrospective on Subsidies & Cluster Finance`,
        description: `Analyzing past government intervention programs, anchor-borrower schemes, and cooperative models to avoid repeating costly historical mistakes.`,
        hook: `Extract hard lessons from the past 15 years of agricultural policy and capital allocation.`,
        timelinePillars: [
          { time: '00-15m', role: 'Historical Root & Policy Timeline', desc: 'What failed in previous government financing cycles' },
          { time: '15-35m', role: 'Comparative Case Analysis', desc: 'Contrasting successful private hubs against subsidized models' },
          { time: '35-50m', role: 'Future Policy Safeguards', desc: 'Framework for resilient private sector-led financing' },
        ],
        keyQuestions: [
          'Why did the 2016-2022 anchor subsidy programs face high default rates?',
          'What structural differences separate self-sustaining cooperatives?',
        ],
      },
    ];
  }, [topicInput, defaultTopic, currentCategory]);

  const liveParsedBriefs = useMemo(() => {
    return parseLivestreamPayload(customIngestMarkdown, hubTitle, currentCategory);
  }, [customIngestMarkdown, hubTitle, currentCategory]);

  const displayBlueprints = useMemo(() => {
    return liveParsedBriefs.length > 0 ? liveParsedBriefs : defaultIdeas;
  }, [liveParsedBriefs, defaultIdeas]);


  // ── SERIALIZED DATA PAYLOADS AUTO-APPENDED TO PROMPTS ──
  const articleJsonPayload = useMemo(() => {
    if (!guidingArticles || guidingArticles.length === 0) {
      return JSON.stringify([
        {
          id: 'article-brief-01',
          title: topicInput || `${hubTitle} Value Chain Intelligence`,
          description: `Empirical research brief on ${hubTitle} and ${currentCategory}.`,
          blocks: [
            { type: 'highlight_card', metricHeadline: 'Critical Systemic Metric', stat: '₦2.4M Loss per transit', caption: 'High friction and post-harvest spoilage across freight corridors' },
            { type: 'strategic_directive', urgency: 'critical', threat: 'Severe capital and logistics paralysis directly impacting producers and aggregators' },
            { type: 'myth_fact', myth: 'Farmers lack yield capacity', fact: 'Yield is sufficient but lack of preservation and transport causes 45% post-harvest collapse' }
          ]
        }
      ], null, 2);
    }
    return JSON.stringify(guidingArticles.map(a => {
      const rawBlocks = a.article?.blocks || a.blocks || a.contentBlocks || [];
      const parsedBlocks = rawBlocks.map((b: any, bIdx: number) => {
        let contentObj: any = {};
        if (typeof b.content === 'string') {
          try {
            contentObj = JSON.parse(b.content);
          } catch {
            contentObj = { text: b.content };
          }
        } else if (b.content && typeof b.content === 'object') {
          contentObj = b.content;
        } else {
          const { id, articleId, orderIndex, blockType, type, content, revisions, comments, ...rest } = b;
          contentObj = rest;
        }

        return {
          orderIndex: typeof b.orderIndex === 'number' ? b.orderIndex : bIdx + 1,
          type: b.blockType || b.type || contentObj.type || 'content_block',
          ...contentObj
        };
      });

      return {
        id: a.id,
        title: a.title,
        description: a.description,
        category: a.category,
        subcategory: a.subcategory,
        timeframe: a.timeframe,
        authorName: a.authorName,
        organization: a.organization?.name || 'Food Nerve Society',
        blocks: parsedBlocks.length > 0 ? parsedBlocks : [
          { type: 'highlight_card', metricHeadline: a.title, stat: 'Verified Field Metric', caption: a.description || 'Primary evidence block' },
          { type: 'strategic_directive', urgency: 'critical', threat: a.description || 'Operational deadlock across the value chain' },
          { type: 'myth_fact', myth: 'Conventional market dogma', fact: a.description || 'Ground-level operational reality' }
        ]
      };
    }), null, 2);
  }, [guidingArticles, topicInput, hubTitle, currentCategory]);

  const ecosystemJsonPayload = useMemo(() => {
    const combined = [...guidingJobs, ...guidingListings, ...(guidingCampaigns || [])];
    if (combined.length === 0) {
      return JSON.stringify([
        {
          id: 'cta-listing-1',
          type: 'Job / Bounty',
          jobTitle: `${hubTitle} Logistics & Field Dispatch Lead`,
          organizationName: 'Food Nerve Ecosystem Partner',
          location: targetLocation || 'Nigeria (Dawanau / Bodija / Mile 12)',
          compensationOrTarget: '₦850,000 / month (Paystack Escrow Locked)',
          description: `Direct operational role deploying decentralised preservation infrastructure and routing solutions for ${hubTitle}.`,
          skills: ['Cold-Chain Telemetry', 'Cluster Aggregation', 'Dispatch Optimization']
        }
      ], null, 2);
    }
    return JSON.stringify(combined.map(item => {
      let comp = 'Disclosed via Escrow';
      if (item.minSalary && item.maxSalary) {
        const cur = item.currency || '₦';
        comp = `${cur}${Number(item.minSalary).toLocaleString()} - ${cur}${Number(item.maxSalary).toLocaleString()}${item.compType === 'volunteer' ? ' (Volunteer Stipend)' : ' / month'}`;
      } else if (item.priceOrAsk) {
        comp = item.priceOrAsk;
      } else if (item.salaryRange || item.compensationOrTarget) {
        comp = item.salaryRange || item.compensationOrTarget;
      } else if (item.goalAmount) {
        comp = `Target: ₦${Number(item.goalAmount).toLocaleString()}`;
      } else if (item.npReward) {
        comp = `${item.npReward.toLocaleString()} NervePoints (Escrow Locked)`;
      }

      const loc = item.location 
        ? `${item.location}${item.lga ? ` (${item.lga} LGA)` : ''}`
        : (item.state || targetLocation || 'Nigeria');

      let challengesList: any = item.challenges;
      if (typeof challengesList === 'string') {
        try {
          challengesList = JSON.parse(challengesList);
        } catch {
          challengesList = [item.challenges];
        }
      }

      const isJobType = item.category === 'jobs' || item.category === 'job' || item.category === 'volunteer' || item.category === 'internship' || Boolean(item.jobSource) || Boolean(item.minSalary);

      return {
        id: item.id,
        type: isJobType ? 'Job / Bounty' : (item.goalAmount ? 'Campaign / Initiative' : 'Trade Listing / Deal'),
        jobTitle: item.title || item.name,
        organizationName: item.organization?.name || item.orgName || 'Food Nerve Ecosystem Partner',
        category: item.category || item.tier || 'ecosystem',
        jobFunction: item.jobFunction || (item.commodity ? `Commodity: ${item.commodity}` : undefined),
        location: loc,
        compensationOrTarget: comp,
        description: item.description || item.challenges || item.organizationChallenges || 'Execution mandate resolving systemic bottlenecks.',
        skills: item.skills || item.requiredSkills || challengesList || [],
        challenges: challengesList || []
      };
    }), null, 2);
  }, [guidingJobs, guidingListings, guidingCampaigns, hubTitle, targetLocation]);

  // ── COMPILED MASTER PROMPTS (LS-DOC 1a, 1b, 1c) ──
  const compiledPrompt1 = useMemo(() => {
    return `### 📄 LS-DOCUMENT 1a: THE DEEP DOSSIER ENGINE (MASTER PROMPT)

**[SYSTEM PERSONA & EXTRACTION CONSTRAINTS]**
You are the Senior Broadcast Architect and Data Ingestor for Food Nerve Society operating in ${currentMonthYear}. Your ONLY job is to digest raw JSON payloads from published articles and ecosystem CTAs (Jobs, Deals, Grants, Opportunities) and extract them into deep, structured intelligence dossiers.

- **Zero Synthesis Rule:** Do NOT attempt to connect the articles together, find commonalities, or build a "bridge" between the problems and the solutions yet. Your job is pure, isolated, deep extraction for each asset provided.
- **Elasticity:** You must process every single item provided, whether there is 1 article or 5, and 1 CTA or 5.
- **Tone:** Highly analytical, strict third-person. Use hard verbs.
- **Grounded, Plain-English Guardrails:** Strictly avoid high-falutin corporate buzzwords and abstract jargon (e.g. "synergy", "paradigm shift", "leverage", "ecosystem alignment", "transformative paradigms"). Express every finding in plain-English, authentic field agribusiness terms (tonnage, spoilage rates, corridor haulage, jetty delays, off-take contracts, farmgate pricing).

**[INPUT PAYLOAD DEFINITION & METADATA]**

\`\`\`
Broadcast Hub & Pillar: ${hubTitle}
Strategic Category: ${currentCategory.toUpperCase()}
Livestream Timeframe / Era: ${(currentTimeframe || 'present').toUpperCase()} ERA
[ANCHOR_ARTICLE_JSON_ARRAY]: 
${articleJsonPayload}

[ANCHOR_CTA_JSON_ARRAY]: 
${ecosystemJsonPayload}
\`\`\`

---

#### PHASE 1: Deep Article Dissection

Iterate through EVERY article provided in the \`[ANCHOR_ARTICLE_JSON_ARRAY]\`. For each article, you must extract a rich, 6-point systemic insight (mirroring the depth of our editorial blueprints):

1. **The Metadata:** Title, Era, and Micro-Geography.
2. **The Killer Stat:** Extract the exact metric and image context from Block 1 (\`highlight_card\`).
3. **The Core Problem:** What is the fundamental crisis or bottleneck?
4. **The Mechanics:** How exactly does the operational reality or the workaround function on the ground?
5. **The Value Chain Impact:** Explicitly name the Value Chain Actor affected and the systemic/financial outcome.
6. **The Political Economy:** Who explicitly benefits from this problem persisting? (Extracted from the \`myth_fact\` or core analysis blocks).

#### PHASE 2: Ecosystem CTA Dissection

Iterate through EVERY listing provided in the \`[ANCHOR_CTA_JSON_ARRAY]\`. A CTA might be a Job, a Corporate Deal, a Government Grant, or a Bounty. For each, extract:

1. **The Opportunity Profile:** Title, Listing Type (Job/Deal/Grant/etc.), and Organization.
2. **The Capital/Compensation:** The exact salary, grant size, or deal facility limit.
3. **The Execution Mandate:** The core skills, deliverables, or operational requirements needed to execute or win this opportunity.

---

#### OUTPUT FORMAT (LS-DOC 1a PAYLOAD)

Output your entire response inside this single, clean Markdown block:

\`\`\`markdown
# [LS_ASSET_INVENTORY]

**Broadcast Context:** Hub: ${hubTitle} | Category: ${currentCategory.toUpperCase()} | Timeframe: ${(currentTimeframe || 'present').toUpperCase()} ERA

### PART 1: The Article Dossiers
*(Generate a dossier for EACH article provided in the payload)*

#### 📄 Article 1: [Extracted Publishing Headline]
*   **Era & Location:** [Extracted Era] | [Extracted Micro-Geography]
*   **The Killer Stat:** [Extracted metric/data point]
*   **The Core Problem:** [1 sentence plainly stating the bottleneck]
*   **The Mechanics:** [1-2 sentences explaining the operational reality/workaround]
*   **Value Chain Impact:** [Actor affected and the financial/systemic outcome]
*   **Political Economy:** [Who profits from this problem persisting]

#### 📄 Article 2: [Extracted Publishing Headline] *(If present)*
*   [Repeat structure...]

#### 📄 Article 3: [Extracted Publishing Headline] *(If present)*
*   [Repeat structure...]

---

### PART 2: The Ecosystem CTA Dossiers
*(Generate a dossier for EACH opportunity provided in the payload)*

#### 💼 CTA 1: [Extracted Title]
*   **Type & Organization:** [Job / Deal / Grant] | [Organization Name]
*   **Capital / Compensation:** [Salary, Deal Size, or Bounty Reward]
*   **Execution Mandate:** [1-2 sentences explaining exactly what physical/intellectual work is required to fulfill this opportunity]

#### 💼 CTA 2: [Extracted Title] *(If present)*
*   [Repeat structure...]
\`\`\``;
  }, [hubTitle, currentCategory, currentTimeframe, articleJsonPayload, ecosystemJsonPayload, currentMonthYear]);

  const compiledPrompt2 = useMemo(() => {
    return `### 📄 LS-DOCUMENT 1b: THE PATTERN & INTERSECTION MAPPING (MASTER PROMPT)

**[SYSTEM PERSONA & EXTRACTION CONSTRAINTS]**
You are a Senior Intelligence Analyst and Debate Architect for Food Nerve Society operating in ${currentMonthYear}. Your job is to take the isolated dossiers from Step 1a and find the "Smear"—the deep, underlying patterns, the brutal contradictions, and the timeline evolutions that connect these assets together.

- **Zero Broadcasting Strategy Yet:** Do not write livestream pitches or format ideas. Focus purely on mapping how the information interacts.
- **Deep Extraction Rule:** Do not provide a single sentence per section. You must provide an extended, highly detailed list of insights (3-4 bullet points minimum) for each analytical category to give the production team deep material to work with.
- **Tone:** Highly analytical, strict third-person, brutal honesty.
- **Grounded, Plain-English Guardrails:** Strictly avoid high-falutin corporate buzzwords and abstract jargon (e.g. "synergy", "paradigm shift", "leverage", "ecosystem alignment"). Use authentic, plain-English field agribusiness terms (tonnage, spoilage rates, corridor haulage, jetty delays, off-take contracts, informal toll checkpoints, bankable collateral).

**[INPUT PAYLOAD DEFINITION & METADATA]**

\`\`\`
Broadcast Hub & Pillar: ${hubTitle}
Strategic Category: ${currentCategory.toUpperCase()}
Livestream Timeframe / Era: ${(currentTimeframe || 'present').toUpperCase()} ERA
[LS_ASSET_INVENTORY]: 
Please analyze the complete structured [LS_ASSET_INVENTORY] generated in Step 1 above within this conversation session.
\`\`\`

---

#### PHASE 1: The Commonalities (The Core Through-lines)

Analyze all provided Articles and CTAs. Identify the undeniable shared realities. What systemic bottlenecks, macro-economic triggers, or resource deficits appear across multiple assets? How does the "Execution Mandate" of the CTAs perfectly map to the "Core Problem" of the articles?

#### PHASE 2: The Contradictions & Friction (The Tension)

Livestreams thrive on conflict. Look for where the data fights itself.

- Does Article A's solution contradict Article B's reality?
- Does the compensation/target of the CTA seem inadequate for the brutal reality described in the articles?
- Is there a gap between what the "Myth" says and what the CTAs are actually funding?

#### PHASE 3: The Era & Trajectory Shifts (The Evolution)

Map how the information moves through time. If there are Past, Present, and Future articles, how did the historical failure birth the current ${currentYear} hack? How will the current ${currentYear} crisis force the ${futureHorizonYear} technology adoption?

#### PHASE 4: The Political Economy Nexus (The Profiteers)

Synthesize the "Villains." Across all the assets, who is consistently capturing the margins? Is there a shared cartel, legacy policy, or middleman network that benefits from these combined problems persisting?

---

#### OUTPUT FORMAT (LS-DOC 1b PAYLOAD)

Output your entire response inside this single, clean Markdown block:

\`\`\`markdown
# [LS_THE_SMEAR_MATRIX]

**Broadcast Context:** Derived from [LS_ASSET_INVENTORY] | Hub: ${hubTitle} | Category: ${currentCategory.toUpperCase()} | Timeframe: ${(currentTimeframe || 'present').toUpperCase()} ERA

### 1. The Commonalities (The Core Through-lines)
*(List 3-4 detailed analytical insights where the articles and CTAs perfectly intersect)*
*   **[Insight Title]:** [2-3 sentences explaining how Article X and Asset Y share a fundamental operational reality, bottleneck, or technological requirement].
*   **[Insight Title]:** [2-3 sentences detailing...].
*   **[Insight Title]:** [2-3 sentences detailing...].
*   **[Insight Title]:** [2-3 sentences detailing...].

### 2. The Contradictions & Friction Points (The Tension)
*(List 3-4 detailed analytical insights where the assets contradict, reveal market gaps, or expose flaws)*
*   **[Friction Point Title]:** [2-3 sentences exposing a contradiction between the articles, or highlighting why a proposed CTA solution might fail against the brutal ground truth of an article].
*   **[Friction Point Title]:** [2-3 sentences detailing...].
*   **[Friction Point Title]:** [2-3 sentences detailing...].
*   **[Friction Point Title]:** [2-3 sentences detailing...].

### 3. The Era & Trajectory Shifts (The Evolution)
*(List 3-4 detailed analytical insights tracking the movement of time across the assets)*
*   **[Trajectory Shift Title]:** [2-3 sentences mapping how a historical root caused a present crisis, or how a present workaround sets the stage for a future ${futureHorizonYear} disruption].
*   **[Trajectory Shift Title]:** [2-3 sentences detailing...].
*   **[Trajectory Shift Title]:** [2-3 sentences detailing...].

### 4. The Political Economy Nexus (The Profiteers)
*(List 2-3 detailed insights synthesizing who is making money off the systemic failure)*
*   **[Profiteer/Cartel Identification]:** [2-3 sentences explicitly naming the actors who benefit from the combined problems persisting across these assets, and how they extract their margin].
*   **[Profiteer/Cartel Identification]:** [2-3 sentences detailing...].
\`\`\``;
  }, [hubTitle, currentCategory, currentTimeframe, currentMonthYear, currentYear, futureHorizonYear]);

  const compiledPrompt3 = useMemo(() => {
    return `### 📄 LS-DOCUMENT 1c: THE ANGLES OF ATTACK & BROADCAST SYNTHESIZER (MASTER PROMPT)

**[SYSTEM PERSONA & SYNTHESIS CONSTRAINTS]**
You are the Executive Producer and Showrunner for Food Nerve Society in ${currentMonthYear}. Your ONLY job is to take the raw inventory and the analytical "Smear" matrices, and synthesize them into 4 distinct, high-retention Livestream Pitches.

- **Grounded, Plain-English Guardrails:** Strict 8th-grade plain English. Strictly avoid high-falutin corporate/consultant buzzwords (do NOT use words like "synergy", "paradigm shift", "leverage", "ecosystem alignment", "macroeconomic hegemony", "synthesizing fiscal apparatus", "transformative paradigms"). Write in simple, hard verbs and active voice.
- **Physical Grounding & Field Reality:** Every single pitch must cite concrete ground reality: a specific commodity, real corridor locations (e.g. Kaduna, Kano, Mile 12, Ibadan, Jebba, Apapa), authentic field agribusiness terms (tonnage, spoilage rates, corridor haulage, jetty delays, off-take contracts, farmgate pricing), actual naira costs or lost amounts, and real field actors (farmers, truckers, union collectors, processors).
- **The DEF Rule:** Every pitch MUST obey the Determinant Engagement Framework presentation blocks from start to finish.

**[INPUT PAYLOAD DEFINITION & METADATA]**

\`\`\`
Broadcast Hub & Pillar: ${hubTitle}
Strategic Category: ${currentCategory.toUpperCase()}
Livestream Timeframe / Era: ${(currentTimeframe || 'present').toUpperCase()} ERA
Context: Synthesize the structured [LS_ASSET_INVENTORY] and [LS_THE_SMEAR_MATRIX] generated in Step 1 and Step 2 above within this conversation session.
\`\`\`

---

#### PHASE 1: The "Angles of Attack" Mapping

Read the \`[LS_THE_SMEAR_MATRIX]\`. You must generate exactly 4 Livestream pitch options by applying these 4 specific editorial "Angles of Attack" to the data:

1. **The Head-On Assault (Format: industry_teardown):** Attack the biggest, most undeniable bottleneck found in Doc 1b. Direct problem-and-solution broadcast targeting the primary victim of the crisis. Timeframe: present.
2. **The Flank / Sideways Attack (Format: talent_spotlight):** Focus on the hidden secondary actor (e.g. truck mechanic, aggregator, warehouse operator). Build the broadcast around how fixing their barrier solves the macro bleed. Timeframe: present.
3. **The Trojan Horse (Format: industry_teardown):** Hook the audience with an everyday field pain point, but midway through the sequence execute a radical pivot to pitch a modern technology or protocol as the only durable fix. Timeframe: future.
4. **The Contrarian Crossfire (Format: panel_debate):** Pit the official policy/donor narrative directly against the grassroots operator hack. Built for high-conflict live chat engagement. Timeframe: present.

#### PHASE 2: The Presentation Block Structure

For every pitch option, you must output the exact slide sequence matching the DEF presentation blocks for its format:
- For industry_teardown: anchor_tension, reframe_question, funnel_system, ideal_vs_feasible, scaled_burden, power_map, preempt_objections, return_to_case, forked_close, talent_spotlight.
- For talent_spotlight: anchor_tension, reframe_question, power_map, boundary_test, forked_close, talent_spotlight.
- For panel_debate: anchor_tension, reframe_question, ideal_vs_feasible, power_map, response_audit, boundary_test, preempt_objections, forked_close, talent_spotlight.

For each block, write a concrete 1-2 sentence plain-English description of what will be presented on screen.

---

#### OUTPUT FORMAT (LS-DOC 1c STRICT JSON ARRAY)

Output your entire response under the \`[LIVESTREAM_MENU_PAYLOAD]\` tag containing a single, strictly valid JSON array wrapped in a markdown code block:

[LIVESTREAM_MENU_PAYLOAD]
\`\`\`json
[
  {
    "angle": "The Head-On Assault",
    "title": "Punchy, Action-Spiky Title targeting real ground reality",
    "format": "industry_teardown",
    "timeframe": "present",
    "category": "${currentCategory}",
    "targetAudience": "Specific Persona or Field Operator",
    "description": "Concrete 1-2 sentence plain-English summary grounding the core friction and operational breakdown.",
    "hook": "Sharp field question or killer stat breaking consensus.",
    "blocks": {
      "anchor_tension": "Field crisis snapshot and killer stat citation (e.g. ₦450k lost per refrigerated transit).",
      "reframe_question": "The strategic pivot question breaking common assumptions.",
      "funnel_system": "The 3 operational layers from field symptom to structural lock.",
      "ideal_vs_feasible": "The official protocol vs. what actually happens on the ground.",
      "scaled_burden": "Total systemic cost across the corridor if left unfixed.",
      "power_map": "The deciders, union enforcers, and factory off-takers extracting margin.",
      "preempt_objections": "Voice the commercial skeptic's doubt and provide data disproof.",
      "return_to_case": "Circle back to the primary operator case study with proven resolution.",
      "forked_close": "Binary choice: Path A daily bleed vs. Path B intervention.",
      "talent_spotlight": "Specific Job, Deal, or Escrow Bounty to flash on screen at the climax."
    },
    "suggestedJobsFocus": "Logistics Dispatch Lead / Cold-Chain Escrow Deal"
  },
  {
    "angle": "The Flank / Sideways Attack",
    "title": "Punchy Title targeting the secondary actor",
    "format": "talent_spotlight",
    "timeframe": "present",
    "category": "${currentCategory}",
    "targetAudience": "Specific Secondary Actor or Operator",
    "description": "Concrete 1-2 sentence summary of why this role unlocks the value chain.",
    "hook": "Sharp field question highlighting the hidden operator bottleneck.",
    "blocks": {
      "anchor_tension": "Field crisis snapshot focusing on the operator's daily friction.",
      "reframe_question": "Pivot question on why empowering this specific role solves the bleed.",
      "power_map": "Who controls access and where revenue is siphoned away from this operator.",
      "boundary_test": "Regulatory gateway and 90-day verifiable milestone for this role.",
      "forked_close": "Cost of sticking to manual workarounds vs return on modern protocol adoption.",
      "talent_spotlight": "Flash verified role/bounty on screen to recruit immediately."
    },
    "suggestedJobsFocus": "Cluster Aggregation Field Officer"
  },
  {
    "angle": "The Trojan Horse",
    "title": "Punchy Title bridging today's pain to tomorrow's breakthrough",
    "format": "industry_teardown",
    "timeframe": "future",
    "category": "${currentCategory}",
    "targetAudience": "Forward-looking Agribusinesses & Capital Allocators",
    "description": "Concrete 1-2 sentence summary bridging current crisis to 2030 tech architecture.",
    "hook": "Sharp field question exposing why legacy equipment guarantees failure.",
    "blocks": {
      "anchor_tension": "Current ground breakdown metric and hardware limits.",
      "reframe_question": "Pivot question revealing why fixing old systems is throwing good money after bad.",
      "funnel_system": "The 3 levels of automation required to eliminate the bottleneck.",
      "ideal_vs_feasible": "The donor ideal vs ground failure vs working decentralised tech fix.",
      "scaled_burden": "Future revenue loss if corridor fails to automate before next cycle.",
      "power_map": "Equipment importers, local fabricators, and maintenance syndicates.",
      "boundary_test": "Scale pathway, power requirements, and 90-day deployment target.",
      "return_to_case": "Early adopter cluster showing unit economics and payback timeline.",
      "forked_close": "Old model obsolescence vs first-mover advantage with automated protocols.",
      "talent_spotlight": "Spotlight the deal/equity syndicate funding this infrastructure."
    },
    "suggestedJobsFocus": "Solar Cold-Hub SPV Syndicate"
  },
  {
    "angle": "The Contrarian Crossfire",
    "title": "Punchy Title highlighting the central commercial clash",
    "format": "panel_debate",
    "timeframe": "present",
    "category": "${currentCategory}",
    "targetAudience": "Commercial Off-Takers, Policymakers, & Trade Associations",
    "description": "Concrete 1-2 sentence summary framing the high-stakes clash between policy and field reality.",
    "hook": "Controversial question forcing operators and buyers to take an immediate stand.",
    "blocks": {
      "anchor_tension": "The contradictory stat exposing the standoff between official price and street cash.",
      "reframe_question": "The controversial debate question for live audience polling.",
      "ideal_vs_feasible": "Clash between official policy regulations and illegal survival hacks.",
      "power_map": "Mapping which commercial faction profits from maintaining the status quo.",
      "response_audit": "Audit of previous government/donor interventions that failed to solve this.",
      "boundary_test": "The bottom-line financial threshold that makes the new contract viable.",
      "preempt_objections": "Dismantling both sides' favorite excuses with audited trade figures.",
      "forked_close": "The binary vote forced upon the live panel and audience.",
      "talent_spotlight": "Opportunity link for forward purchase contracts and escrow verification."
    },
    "suggestedJobsFocus": "Offtake Arbitration & Contract Auditor"
  }
]
\`\`\`
CRITICAL CONSTRAINT: Do NOT include introductory chatter. Output the [LIVESTREAM_MENU_PAYLOAD] header tag followed by the strictly valid JSON array.`;
  }, [hubTitle, currentCategory, currentTimeframe, currentMonthYear]);

  const handleApplyBlueprint = (blueprint: LivestreamIdeaOption) => {
    if (onApplyIdea) {
      onApplyIdea({
        title: blueprint.title,
        description: blueprint.description,
        timeframe: blueprint.timeframe,
        category: blueprint.category || currentCategory,
        blueprint: blueprint,
      });
    }
    if (onIngestBlueprints) {
      onIngestBlueprints([blueprint]);
    }
    onClose();
  };

  const handleIngestToStudio = () => {
    if (liveParsedBriefs.length === 0) {
      setIngestError("No valid livestream blueprints found in payload. Please paste the JSON payload generated in Step 3.");
      return;
    }
    setIngestError(null);
    if (onIngestBlueprints) {
      onIngestBlueprints(liveParsedBriefs);
    }
    onClose();
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleCustomIngestChange(text);
        markChecklistItem('chk4_ingest');
      }
    } catch {
      // Fallback
    }
  };

  return (
    <>
      {/* ──────────────────────────────────────────────────────────── */}
      {/* MINIMAL LIQUID GLASS FLOATING DOCK (LIVESTREAM STUDIO PARITY) */}
      {/* ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!open && isDockVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1250,
            }}
          >
            <Paper
              elevation={0}
              onClick={() => {
                if (onOpen) onOpen();
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                py: 0.85,
                px: 1.6,
                borderRadius: '999px',
                background: 'rgba(15, 23, 42, 0.82)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  background: 'rgba(15, 23, 42, 0.92)',
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              {/* Minimal AI Sparkle Icon with Soft Glow */}
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  bgcolor: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 14 }} />
              </Box>

              {/* Minimal Clean 1-Line Meta */}
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#f8fafc',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.6,
                }}
              >
                <span>Broadcast AI Blueprints</span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>
                  🌾 {hubTitle}
                </span>
              </Typography>

              {/* Minimal Expand Icon */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'rgba(255, 255, 255, 0.5)',
                  ml: 0.2,
                  transition: 'color 0.2s',
                  '&:hover': { color: '#fff' },
                }}
              >
                <OpenInFullIcon sx={{ fontSize: 12 }} />
              </Box>

              {/* Minimal Dismiss (X) */}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDockVisible(false);
                }}
                sx={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  p: 0.35,
                  ml: -0.5,
                  '&:hover': {
                    color: '#ef4444',
                    bgcolor: 'rgba(239, 68, 68, 0.15)',
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* FULL LUXURY DRAWER                                           */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100vw', sm: '80vw', md: '50vw' },
              minWidth: { sm: 540, md: 620 },
              maxWidth: { xl: 880 },
              height: { xs: '85vh', sm: '100%' },
              maxHeight: { xs: '85vh', sm: '100%' },
              borderRadius: { xs: '24px 24px 0 0', sm: 0 },
              bgcolor: '#f8fafc',
              boxShadow: { xs: '0 -12px 40px rgba(0, 0, 0, 0.18)', sm: '-16px 0 48px rgba(0, 0, 0, 0.18)' },
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1300,
              overflow: 'hidden',
            },
          },
        }}
      >
        {/* ── FLOATING TOP CONTROLS (CIRCLE MINIMIZE & CIRCLE CLOSE) ── */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 14, sm: 20 },
            right: { xs: 14, sm: 24 },
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            zIndex: 50,
          }}
        >
          {/* Floating Minimize Button */}
          <IconButton
            onClick={handleMinimize}
            title="Minimize to dock"
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              color: '#475569',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: '#ffffff',
                color: '#0f172a',
                transform: 'scale(1.08)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <RemoveIcon sx={{ fontSize: 18 }} />
          </IconButton>

          {/* Floating Close Button */}
          <IconButton
            onClick={onClose}
            title="Close assistant"
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              color: '#475569',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                transform: 'scale(1.08)',
                boxShadow: '0 6px 20px rgba(239, 68, 68, 0.18)',
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* ── SCROLLABLE CANVAS ── */}
        <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Mobile Bottom-Sheet Grabber Pill */}
          {isMobile && (
            <Box sx={{ width: 44, height: 4.5, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.22)', mx: 'auto', mt: 1.5, mb: 0.5 }} />
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* HERO SECTION WITH LUXURY RADIAL GRADIENT                     */}
          {/* ──────────────────────────────────────────────────────────── */}
          <Box
            sx={{
              position: 'relative',
              pt: { xs: 6, sm: 8 },
              pb: { xs: 2.5, sm: 3.5 },
              px: { xs: 3, sm: 5 },
              background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.09) 0%, rgba(59, 130, 246, 0.04) 55%, transparent 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* Visual Anchor Squircles */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2.5,
                mt: { xs: 1.5, sm: 1 },
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {/* Left Squircle: Live Studio */}
              <Box
                sx={{
                  width: { xs: 104, sm: 118 },
                  height: { xs: 104, sm: 118 },
                  borderRadius: '28px',
                  overflow: 'hidden',
                  position: 'relative',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  border: '2.5px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
                  transform: 'rotate(-3deg)',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'rotate(0deg) scale(1.05)',
                    zIndex: 3,
                    borderColor: 'rgba(255, 255, 255, 0.55)',
                    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.55)',
                  },
                }}
              >
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#22c55e', boxShadow: '0 0 10px #22c55e', mb: 1 }} />
                <Typography sx={{ fontSize: '1.75rem', lineHeight: 1 }}>📡</Typography>
                <Typography sx={{ color: '#fff', fontSize: '0.68rem', fontWeight: 900, mt: 0.8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Live Studio
                </Typography>
              </Box>

              {/* Center Intersection Badge */}
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: '#0f172a',
                  color: '#f59e0b',
                  border: '2px solid rgba(255, 255, 255, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  zIndex: 2,
                  mx: { xs: -1.75, sm: -2 },
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                }}
              >
                ×
              </Box>

              {/* Right Squircle: Master Category Hub */}
              <Box
                sx={{
                  width: { xs: 104, sm: 118 },
                  height: { xs: 104, sm: 118 },
                  borderRadius: '28px',
                  overflow: 'hidden',
                  position: 'relative',
                  background: `linear-gradient(135deg, ${hubColor} 0%, #0f172a 100%)`,
                  border: '2.5px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
                  transform: 'rotate(3deg)',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 1,
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'rotate(0deg) scale(1.05)',
                    zIndex: 3,
                    borderColor: 'rgba(255, 255, 255, 0.55)',
                    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.55)',
                  },
                }}
              >
                <Typography sx={{ fontSize: '1.75rem', lineHeight: 1, mb: 0.5 }}>🌾</Typography>
                <Typography sx={{ color: '#ffffff', fontSize: '0.72rem', fontWeight: 900, lineHeight: 1.2 }}>
                  {hubTitle}
                </Typography>
              </Box>
            </Box>

            {/* Title & Subtitle */}
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em', mt: 0.5 }}>
              Livestream AI Assistant
            </Typography>
            <Typography sx={{ color: '#475569', fontWeight: 600, fontSize: '0.88rem', maxWidth: 480, mt: 0.5, lineHeight: 1.45 }}>
              3 sequenced master prompts to analyze ground intelligence, map corridor tensions, and synthesize 4 high-converting broadcast blueprints.
            </Typography>

            {/* Quick-Jump Step Anchor Pills */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap', justifyContent: 'center', mt: 2 }}>
              <Chip
                label="Step 0: Guide"
                size="small"
                onClick={() => scrollToSection('step-0-guide')}
                sx={{ fontSize: '0.7rem', fontWeight: 700, bgcolor: 'rgba(15, 23, 42, 0.05)', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.1)' } }}
              />
              <Chip
                label="1. LS-Doc 1a (Dossier)"
                size="small"
                onClick={() => scrollToSection('step-1-dossier')}
                sx={{ fontSize: '0.7rem', fontWeight: 700, bgcolor: 'rgba(59, 130, 246, 0.08)', color: '#1e40af', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.16)' } }}
              />
              <Chip
                label="2. LS-Doc 1b (Smear)"
                size="small"
                onClick={() => scrollToSection('step-2-smear')}
                sx={{ fontSize: '0.7rem', fontWeight: 700, bgcolor: 'rgba(245, 158, 11, 0.08)', color: '#b45309', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.16)' } }}
              />
              <Chip
                label="3. LS-Doc 1c (Synthesizer)"
                size="small"
                onClick={() => scrollToSection('step-3-synthesizer')}
                sx={{ fontSize: '0.7rem', fontWeight: 700, bgcolor: 'rgba(168, 85, 247, 0.08)', color: '#7e22ce', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(168, 85, 247, 0.16)' } }}
              />
              <Chip
                label="4. Fast Ingest"
                size="small"
                onClick={() => scrollToSection('step-4-ingest')}
                sx={{ fontSize: '0.7rem', fontWeight: 700, bgcolor: 'rgba(16, 185, 129, 0.08)', color: '#047857', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.16)' } }}
              />
            </Box>
          </Box>

          {/* ── SCROLLABLE BODY CONTENT ── */}
          <Box sx={{ p: { xs: 2.5, sm: 4 }, display: 'flex', flexDirection: 'column', gap: 4 }}>

            {/* ──────────────────────────────────────────────────────────── */}
            {/* STEP 0: WORKFLOW OVERVIEW                                    */}
            {/* ──────────────────────────────────────────────────────────── */}
            <Box id="step-0-guide" sx={{ display: 'flex', flexDirection: 'column', gap: 2, scrollMarginTop: '80px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem' }}>
                  0
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  Step 0: How You Guide the AI
                </Typography>
              </Box>

              {/* Step 0 Clean Workflow Card */}
              <Box
                sx={{
                  p: 2.25,
                  borderRadius: '16px',
                  bgcolor: '#ffffff',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                  <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'rgba(15, 23, 42, 0.08)', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, flexShrink: 0, mt: 0.15 }}>
                    1
                  </Box>
                  <Typography sx={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, lineHeight: 1.5 }}>
                    Your selected anchor articles ({guidingArticles.length}), ecosystem CTAs ({guidingJobs.length + guidingListings.length}), and <strong>{hubTitle}</strong> taxonomy are auto-injected into each prompt below.
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                  <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'rgba(15, 23, 42, 0.08)', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, flexShrink: 0, mt: 0.15 }}>
                    2
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, lineHeight: 1.5 }}>
                      Copy and run each prompt sequentially (Steps 1 to 3) in your preferred AI model:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        component="a"
                        href="https://chatgpt.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        endIcon={<OpenInNewIcon sx={{ fontSize: '13px !important' }} />}
                        sx={{
                          bgcolor: 'rgba(16, 163, 127, 0.08)',
                          color: '#0d9488',
                          border: '1px solid rgba(13, 148, 136, 0.3)',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'none',
                          py: 0.35,
                          px: 1.25,
                          '&:hover': { bgcolor: 'rgba(16, 163, 127, 0.15)', borderColor: '#0d9488' },
                        }}
                      >
                        ChatGPT
                      </Button>
                      <Button
                        size="small"
                        component="a"
                        href="https://claude.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        endIcon={<OpenInNewIcon sx={{ fontSize: '13px !important' }} />}
                        sx={{
                          bgcolor: 'rgba(217, 119, 6, 0.08)',
                          color: '#d97706',
                          border: '1px solid rgba(217, 119, 6, 0.3)',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'none',
                          py: 0.35,
                          px: 1.25,
                          '&:hover': { bgcolor: 'rgba(217, 119, 6, 0.15)', borderColor: '#d97706' },
                        }}
                      >
                        Claude
                      </Button>
                      <Button
                        size="small"
                        component="a"
                        href="https://gemini.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        endIcon={<OpenInNewIcon sx={{ fontSize: '13px !important' }} />}
                        sx={{
                          bgcolor: 'rgba(37, 99, 235, 0.08)',
                          color: '#2563eb',
                          border: '1px solid rgba(37, 99, 235, 0.3)',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'none',
                          py: 0.35,
                          px: 1.25,
                          '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.15)', borderColor: '#2563eb' },
                        }}
                      >
                        Gemini
                      </Button>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                  <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'rgba(15, 23, 42, 0.08)', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, flexShrink: 0, mt: 0.15 }}>
                    3
                  </Box>
                  <Typography sx={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, lineHeight: 1.5 }}>
                    Continue the conversation in the same AI chat session so the model retains full context across all steps.
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                  <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: 'rgba(15, 23, 42, 0.08)', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, flexShrink: 0, mt: 0.15 }}>
                    4
                  </Box>
                  <Typography sx={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, lineHeight: 1.5 }}>
                    Paste the Step 3 (LS-Doc 1c) markdown output directly into Step 4 (Fast Ingest) to apply all 4 broadcast blueprints to your Studio.
                  </Typography>
                </Box>
              </Box>
            </Box>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* STEP 1: THE DEEP DOSSIER ENGINE (LS-DOC 1a)                  */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Box id="step-1-dossier" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem' }}>
              1
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Step 1: The Deep Dossier Engine (LS-Doc 1a)
            </Typography>
          </Box>

          {/* Auto-Embedded Context Assurance Banner */}
          <Paper
            elevation={0}
            sx={{
              p: 2.25,
              borderRadius: '20px',
              bgcolor: 'rgba(59, 130, 246, 0.04)',
              border: '1.5px solid rgba(59, 130, 246, 0.22)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.04)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 900, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <span>⚡</span> Auto-Embedded Studio Intelligence
              </Typography>
              <Chip
                size="small"
                label="Prompts Pre-Configured ✓"
                sx={{ bgcolor: 'rgba(59, 130, 246, 0.12)', color: '#1d4ed8', fontWeight: 800, fontSize: '0.68rem', height: 20 }}
              />
            </Box>
            <Typography sx={{ fontSize: '0.78rem', color: '#475569', fontWeight: 500, lineHeight: 1.5 }}>
              Your selected anchor articles, spotlight ecosystem deals/CTAs, and the <strong>{hubTitle}</strong> tri-pillar taxonomy are automatically packed into the Master Prompts below. No manual input or re-typing needed.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                size="small"
                label={`📚 ${guidingArticles.length} Anchor Articles Auto-Injected`}
                sx={{ bgcolor: '#ffffff', color: '#1e3a8a', fontWeight: 800, fontSize: '0.72rem', border: '1.5px solid rgba(59, 130, 246, 0.25)' }}
              />
              <Chip
                size="small"
                label={`💼 ${guidingJobs.length + guidingListings.length} Ecosystem CTAs Auto-Injected`}
                sx={{ bgcolor: '#ffffff', color: '#1e3a8a', fontWeight: 800, fontSize: '0.72rem', border: '1.5px solid rgba(59, 130, 246, 0.25)' }}
              />
              <Chip
                size="small"
                label={`🌐 Hub: ${hubTitle}`}
                sx={{ bgcolor: '#ffffff', color: '#1e3a8a', fontWeight: 800, fontSize: '0.72rem', border: '1.5px solid rgba(59, 130, 246, 0.25)' }}
              />
            </Box>
          </Paper>

          {/* Terminal Box for Step 1 Prompt */}
          <PromptTerminalBox
            title="Step 1 Prompt · The Deep Dossier Engine (LS-Doc 1a)"
            codeLabel="LS-DOC 1a"
            subtitle="Extracts asset inventory and baseline signals across the hub."
            prompt={compiledPrompt1}
            colorTheme="#3b82f6"
            copiedBannerText="LS-Doc 1a Master Prompt Copied to Clipboard!"
            copyButtonLabel="Copy Step 1 Prompt (LS-Doc 1a: Deep Dossier Engine)"
            maxHeight={200}
            isCopiedExternal={checklist['chk1_copy']}
            onCopy={() => {
              markChecklistItem('chk1_copy');
            }}
          />
          <PromptChecklistItem
            id="chk1_copy"
            text="Step 1 Prompt copied — ready to run in ChatGPT, Claude, or Gemini"
            checked={!!checklist['chk1_copy']}
            onToggle={toggleChecklistItem}
            colorTheme="#3b82f6"
          />
        </Box>

        <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)', my: 0.5 }} />

        {/* ──────────────────────────────────────────────────────────── */}
        {/* STEP 2: THE PATTERN & INTERSECTION MAPPING (LS-DOC 1b)       */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Box id="step-2-smear" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem' }}>
              2
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Step 2: The Pattern & Intersection Mapping (LS-Doc 1b)
            </Typography>
          </Box>

          {/* Terminal Box for Step 2 Prompt */}
          <PromptTerminalBox
            title="Step 2 Prompt · Pattern & Intersection Mapping (LS-Doc 1b)"
            codeLabel="LS-DOC 1b"
            subtitle="Extracts conflict matrix, tensions, and stakeholder friction points in the same chat."
            prompt={compiledPrompt2}
            colorTheme="#f59e0b"
            copiedBannerText="LS-Doc 1b Master Prompt Copied to Clipboard!"
            copyButtonLabel="Copy Step 2 Prompt (LS-Doc 1b: The Smear Matrix)"
            maxHeight={200}
            isCopiedExternal={checklist['chk2_copy']}
            onCopy={() => {
              markChecklistItem('chk2_copy');
            }}
          />
          <PromptChecklistItem
            id="chk2_copy"
            text="Step 2 Prompt copied — paste into the SAME chat session"
            checked={!!checklist['chk2_copy']}
            onToggle={toggleChecklistItem}
            colorTheme="#f59e0b"
          />
        </Box>

        <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)', my: 0.5 }} />

        {/* ──────────────────────────────────────────────────────────── */}
        {/* STEP 3: ANGLES OF ATTACK & BROADCAST SYNTHESIZER (LS-DOC 1c) */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Box id="step-3-synthesizer" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '0.88rem',
              boxShadow: '0 4px 12px rgba(168, 85, 247, 0.35)'
            }}>
              3
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Step 3: The Angles of Attack & Broadcast Synthesizer (LS-Doc 1c)
            </Typography>
          </Box>

          {/* Terminal Box for Step 3 Prompt */}
          <PromptTerminalBox
            title="Step 3 Prompt · Angles of Attack & Broadcast Synthesizer (LS-Doc 1c)"
            codeLabel="LS-DOC 1c"
            subtitle="Synthesizes 4 distinct livestream angles into strict JSON broadcast blueprints."
            prompt={compiledPrompt3}
            colorTheme="#a855f7"
            copiedBannerText="LS-Doc 1c Master Prompt Copied to Clipboard!"
            copyButtonLabel="Copy Step 3 Prompt (LS-Doc 1c: Broadcast Synthesizer)"
            maxHeight={200}
            isCopiedExternal={checklist['chk3_copy']}
            onCopy={() => {
              markChecklistItem('chk3_copy');
            }}
          />
          <PromptChecklistItem
            id="chk3_copy"
            text="Step 3 Prompt copied — generate [LIVESTREAM_MENU_PAYLOAD] JSON"
            checked={!!checklist['chk3_copy']}
            onToggle={toggleChecklistItem}
            colorTheme="#a855f7"
          />
        </Box>

        <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)', my: 0.5 }} />

        {/* ──────────────────────────────────────────────────────────── */}
        {/* STEP 4: FAST INGEST RELAY TERMINAL & APPLY TO STUDIO         */}
        {/* ──────────────────────────────────────────────────────────── */}
        <Box id="step-4-ingest" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.88rem' }}>
              4
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                Step 4: Fast Ingest Relay (Apply to Studio)
              </Typography>
              <Typography sx={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                Paste the generated JSON output from Step 3 to dispatch all 4 broadcast blueprints into Studio.
              </Typography>
            </Box>
          </Box>

          {ingestError && (
            <Alert
              severity="error"
              onClose={() => setIngestError(null)}
              sx={{
                borderRadius: '16px',
                bgcolor: 'rgba(239, 68, 68, 0.08)',
                border: '1.5px solid rgba(239, 68, 68, 0.25)',
                color: '#991b1b',
                fontWeight: 600,
                fontSize: '0.84rem'
              }}
            >
              {ingestError}
            </Alert>
          )}

          <PromptFastIngestBox
            value={customIngestMarkdown}
            onChange={handleCustomIngestChange}
            onIngest={handleIngestToStudio}
            title="Fast Ingest: Broadcast Blueprints Relay"
            subtitle="Paste the generated JSON output from LS-Doc 1c below to apply to the Studio."
            codeLabel="FAST INGEST"
            fileName="blueprints.json"
            unitLabel="blueprints"
            colorTheme="#059669"
            placeholder={`Paste the JSON output from LS-Doc 1c here...\n\nExample:\n[\n  {\n    "angle": "The Head-On Assault",\n    "title": "Bypassing the Highway: Kaduna Farmgate Processing",\n    "format": "industry_teardown",\n    "timeframe": "present",\n    "targetAudience": "Producers & Logistics Operators",\n    "description": "How on-site processing eliminates transit rot across northern freight corridors.",\n    "hook": "What if the solution isn't safer trucks, but zero trucks?",\n    "blocks": {\n      "anchor_tension": "₦2.4M lost per refrigerated transit across Kaduna corridor.",\n      "reframe_question": "Why are we subsidizing fuel instead of farmgate micro-processing?",\n      "funnel_system": "From field rot to highway tolls to terminal pricing deadlock.",\n      "power_map": "Union checkpoint cartels extracting margin before off-taker arrives.",\n      "forked_close": "Path A: Bleed transit losses. Path B: Deploy containerized processing.",\n      "talent_spotlight": "Spotlight off-take contract with Sabou Processing."\n    },\n    "suggestedJobsFocus": "Cold-Chain Dispatch Lead"\n  }\n]`}
            liveBlockCount={liveParsedBriefs.length}
            expectedBlockCount={4}
            buttonLabel={`⚡ Ingest & Apply ${liveParsedBriefs.length > 0 ? liveParsedBriefs.length : 4} Broadcast Blueprints to Studio`}
          />
          <PromptChecklistItem
            id="chk4_ingest"
            text="JSON blueprint payload detected & applied to Studio Carousel Deck"
            checked={liveParsedBriefs.length >= 1 || !!checklist['chk4_ingest']}
            onToggle={toggleChecklistItem}
            colorTheme="#059669"
          />
        </Box>

      </Box>
    </Box>
    </Drawer>
    </>
  );
}

