import { BlockType, SopBlock } from '@/lib/config/articleBlueprints';

export interface ParsedStreamBlock {
  type: BlockType;
  role: string;
  sopDesc?: string;
  content: Record<string, any>;
}

export interface StreamParsingResult {
  title?: string;
  description?: string;
  blocks: ParsedStreamBlock[];
  warnings: string[];
}

/**
 * Serializes an array of article blocks into a human-readable, tokenized markdown stream.
 */
export function blocksToMarkdownStream(
  blocks: Array<{ type: BlockType; role?: string; sopDesc?: string; content: Record<string, any> }>,
  title?: string,
  description?: string
): string {
  const lines: string[] = [];

  if (title) {
    lines.push(`# ${title.trim()}`);
  }
  if (description) {
    lines.push(`> ${description.trim()}\n`);
  }

  lines.push('---');
  lines.push('<!-- FOOD NERVE STREAM DRAFT — EDIT FREELY BELOW -->\n');

  blocks.forEach((block, idx) => {
    const role = block.role || block.type;
    lines.push(`## [${idx + 1}. ${role} | ${block.type}]`);

    const c = block.content || {};

    switch (block.type) {
      case 'subheading':
        lines.push(c.text || 'Catchy Section Subheading');
        break;

      case 'exec_summary':
        if (c.points) {
          lines.push(c.points.trim());
        } else {
          lines.push('• Key Takeaway 1\n• Key Takeaway 2\n• Key Takeaway 3');
        }
        break;

      case 'highlight_card':
        if (c.caption) lines.push(`**Stat Caption:** ${c.caption}`);
        if (c.imageUrl) lines.push(`**Image URL:** ${c.imageUrl}`);
        break;

      case 'core_interactive':
        if (c.bionicText) lines.push(c.bionicText);
        if (c.anchorQuestion) lines.push(`\n**Anchor Question:** ${c.anchorQuestion}`);
        if (c.imageUrl) lines.push(`**Image URL:** ${c.imageUrl}`);
        break;

      case 'myth_fact':
        lines.push(`**Myth:** ${c.myth || 'Common misconception'}`);
        lines.push(`**Fact:** ${c.fact || 'Empirical ground truth'}`);
        break;

      case 'pull_quote':
        lines.push(`> "${c.quote || 'Field quote goes here'}"`);
        if (c.attribution) lines.push(`-- ${c.attribution}`);
        break;

      case 'comparison_matrix':
        lines.push(`**Model A:** ${c.optionAName || 'Traditional Model'}`);
        lines.push(`**Model B:** ${c.optionBName || 'Modern Model'}`);
        if (c.winnerVerdict) lines.push(`**Verdict:** ${c.winnerVerdict}\n`);
        lines.push('| Metric / Criterion | Option A | Option B | Winner (A/B) |');
        lines.push('| :--- | :--- | :--- | :--- |');
        if (Array.isArray(c.rows) && c.rows.length > 0) {
          c.rows.forEach((r: any) => {
            lines.push(`| ${r.criterion || ''} | ${r.optionAValue || ''} | ${r.optionBValue || ''} | ${r.winner || 'B'} |`);
          });
        } else {
          lines.push('| CAPEX | Low | Medium | A |');
          lines.push('| Spoilage Rate | 35% | 8% | B |');
        }
        break;

      case 'protocol_steps':
        if (c.title) lines.push(`**Action Title:** ${c.title}\n`);
        if (Array.isArray(c.steps) && c.steps.length > 0) {
          c.steps.forEach((s: any, sIdx: number) => {
            lines.push(`${s.stepNumber || sIdx + 1}. **${s.instruction || 'Step'}**: ${s.detail || ''}`);
          });
        } else {
          lines.push('1. **Initial Audit**: Assess warehouse temperatures and relative humidity.');
          lines.push('2. **Deployment**: Install airtight hermetic bags.');
        }
        break;

      case 'call_to_action':
      case 'strategic_directive':
        if (c.headline) lines.push(`### ${c.headline}`);
        if (c.body) lines.push(c.body);
        if (c.ctaText) lines.push(`[${c.ctaText}](${c.ctaLink || '#'})`);
        break;

      default:
        lines.push(typeof c === 'string' ? c : JSON.stringify(c, null, 2));
        break;
    }

    lines.push('\n');
  });

  return lines.join('\n');
}

/**
 * Parses a markdown stream string back into structured ArticleBlockPayload objects.
 */
export function markdownStreamToBlocks(
  markdownText: string,
  fallbackBlueprint: SopBlock[] = []
): StreamParsingResult {
  const result: StreamParsingResult = {
    blocks: [],
    warnings: []
  };

  if (!markdownText || !markdownText.trim()) return result;

  const rawLines = markdownText.split('\n');
  let currentTitle: string | undefined;
  let currentDescription: string | undefined;

  // Extract master title (# Title) if present
  const titleLineIdx = rawLines.findIndex(l => l.startsWith('# '));
  if (titleLineIdx !== -1) {
    currentTitle = rawLines[titleLineIdx].replace('# ', '').trim();
    result.title = currentTitle;
  }

  // Extract description (> Description) if present before first section
  const descLineIdx = rawLines.findIndex((l, idx) => l.startsWith('> ') && (titleLineIdx === -1 || idx > titleLineIdx) && !l.includes('"'));
  if (descLineIdx !== -1) {
    currentDescription = rawLines[descLineIdx].replace('> ', '').trim();
    result.description = currentDescription;
  }

  // Split by Section Headers e.g. ## [1. Role | Type] or ## [Type] or ## Role
  const sectionRegex = /^##\s+(?:\[(?:\d+\.\s*)?([^|\]]+)(?:\s*\|\s*([^\]]+))?\]|(?:\d+\.\s*)?([^\n]+))/i;

  interface RawSection {
    rawHeader: string;
    roleHint?: string;
    typeHint?: string;
    bodyLines: string[];
  }

  const sections: RawSection[] = [];
  let currentSection: RawSection | null = null;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const match = line.match(sectionRegex);

    if (match) {
      if (currentSection) {
        sections.push(currentSection);
      }
      const roleHint = (match[1] || match[3] || '').trim();
      const typeHint = (match[2] || '').trim().toLowerCase();

      currentSection = {
        rawHeader: line,
        roleHint,
        typeHint,
        bodyLines: []
      };
    } else if (currentSection) {
      currentSection.bodyLines.push(line);
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  // If no ## headers found, try to chunk paragraphs or use fallback blueprint
  if (sections.length === 0) {
    const cleanBody = markdownText.replace(/^#\s+.*/gm, '').replace(/^>\s+.*/gm, '').trim();
    if (cleanBody) {
      result.blocks.push({
        type: 'core_interactive',
        role: 'Analysis',
        content: { bionicText: cleanBody }
      });
    }
    return result;
  }

  // Map each parsed section to a structured BlockType and payload
  sections.forEach((sec, idx) => {
    const blueprintBlock = fallbackBlueprint[idx];
    let resolvedType: BlockType = 'core_interactive';

    // 1. Try matching explicit typeHint
    if (sec.typeHint) {
      const normalized = sec.typeHint.replace(/[\s_-]/g, '').toLowerCase();
      if (normalized.includes('subheading') || normalized.includes('heading')) resolvedType = 'subheading';
      else if (normalized.includes('exec') || normalized.includes('summary')) resolvedType = 'exec_summary';
      else if (normalized.includes('highlight') || normalized.includes('stat')) resolvedType = 'highlight_card';
      else if (normalized.includes('matrix') || normalized.includes('comparison')) resolvedType = 'comparison_matrix';
      else if (normalized.includes('myth') || normalized.includes('fact')) resolvedType = 'myth_fact';
      else if (normalized.includes('quote')) resolvedType = 'pull_quote';
      else if (normalized.includes('protocol') || normalized.includes('step')) resolvedType = 'protocol_steps';
      else if (normalized.includes('cta') || normalized.includes('directive') || normalized.includes('action')) resolvedType = 'call_to_action';
      else if (normalized.includes('interactive') || normalized.includes('core')) resolvedType = 'core_interactive';
      else if (normalized.includes('poll')) resolvedType = 'live_poll';
      else if (normalized.includes('media')) resolvedType = 'media';
    } else if (blueprintBlock) {
      resolvedType = blueprintBlock.type;
    }

    const bodyText = sec.bodyLines.join('\n').trim();
    const content: Record<string, any> = {};

    switch (resolvedType) {
      case 'subheading':
        content.text = bodyText.replace(/^#+\s*/, '') || sec.roleHint || 'Subheading';
        break;

      case 'exec_summary':
        content.points = bodyText || '• Key points';
        break;

      case 'highlight_card': {
        const captionMatch = bodyText.match(/\*\*Stat Caption:\*\*\s*(.*)/i);
        const imgMatch = bodyText.match(/\*\*Image URL:\*\*\s*(.*)/i);
        content.caption = captionMatch ? captionMatch[1].trim() : bodyText;
        if (imgMatch) content.imageUrl = imgMatch[1].trim();
        break;
      }

      case 'myth_fact': {
        const mythMatch = bodyText.match(/\*\*Myth:\*\*\s*(.*)/i);
        const factMatch = bodyText.match(/\*\*Fact:\*\*\s*(.*)/i);
        content.myth = mythMatch ? mythMatch[1].trim() : 'Common misconception';
        content.fact = factMatch ? factMatch[1].trim() : bodyText;
        break;
      }

      case 'pull_quote': {
        const quoteMatch = bodyText.match(/>\s*"?([^"\n]+)"?/i);
        const attrMatch = bodyText.match(/--\s*(.*)/i);
        content.quote = quoteMatch ? quoteMatch[1].trim() : bodyText.replace(/^>\s*/, '');
        content.attribution = attrMatch ? attrMatch[1].trim() : 'Industry Operator';
        break;
      }

      case 'comparison_matrix': {
        const modAMatch = bodyText.match(/\*\*Model A:\*\*\s*(.*)/i);
        const modBMatch = bodyText.match(/\*\*Model B:\*\*\s*(.*)/i);
        const verdMatch = bodyText.match(/\*\*Verdict:\*\*\s*(.*)/i);
        content.optionAName = modAMatch ? modAMatch[1].trim() : 'Option A';
        content.optionBName = modBMatch ? modBMatch[1].trim() : 'Option B';
        if (verdMatch) content.winnerVerdict = verdMatch[1].trim();

        const tableLines = sec.bodyLines.filter(l => l.trim().startsWith('|') && !l.includes('---'));
        if (tableLines.length > 1) {
          // skip header row
          const rows = tableLines.slice(1).map(l => {
            const cols = l.split('|').map(c => c.trim()).filter(Boolean);
            return {
              criterion: cols[0] || 'Metric',
              optionAValue: cols[1] || '-',
              optionBValue: cols[2] || '-',
              winner: (cols[3]?.toUpperCase() === 'A' ? 'A' : 'B') as 'A' | 'B'
            };
          });
          content.rows = rows;
        } else {
          content.rows = [{ criterion: 'Efficiency', optionAValue: 'Standard', optionBValue: 'High', winner: 'B' }];
        }
        break;
      }

      case 'protocol_steps': {
        const titleMatch = bodyText.match(/\*\*Action Title:\*\*\s*(.*)/i);
        if (titleMatch) content.title = titleMatch[1].trim();

        const stepRegex = /^\d+\.\s*(?:\*\*(.*?)\*\*[:\-]?\s*)?(.*)/;
        const steps = sec.bodyLines
          .filter(l => /^\d+\./.test(l.trim()))
          .map((l, sIdx) => {
            const m = l.trim().match(stepRegex);
            return {
              stepNumber: sIdx + 1,
              instruction: m ? (m[1] || `Step ${sIdx + 1}`) : `Step ${sIdx + 1}`,
              detail: m ? (m[2] || '') : l.trim()
            };
          });
        content.steps = steps.length > 0 ? steps : [{ stepNumber: 1, instruction: 'Execute Protocol', detail: bodyText }];
        break;
      }

      case 'call_to_action':
      case 'strategic_directive': {
        const hMatch = bodyText.match(/^###\s*(.*)/m);
        const linkMatch = bodyText.match(/\[(.*?)\]\((.*?)\)/);
        content.headline = hMatch ? hMatch[1].trim() : 'Strategic Directive';
        content.body = bodyText.replace(/^###\s*.*$/m, '').replace(/\[.*?\]\(.*?\)/, '').trim();
        if (linkMatch) {
          content.ctaText = linkMatch[1];
          content.ctaLink = linkMatch[2];
        }
        break;
      }

      case 'core_interactive':
      default: {
        const qMatch = bodyText.match(/\*\*Anchor Question:\*\*\s*(.*)/i);
        const imgMatch = bodyText.match(/\*\*Image URL:\*\*\s*(.*)/i);
        content.bionicText = bodyText
          .replace(/\*\*Anchor Question:\*\*.*$/im, '')
          .replace(/\*\*Image URL:\*\*.*$/im, '')
          .trim();
        if (qMatch) content.anchorQuestion = qMatch[1].trim();
        if (imgMatch) content.imageUrl = imgMatch[1].trim();
        break;
      }
    }

    result.blocks.push({
      type: resolvedType,
      role: sec.roleHint || blueprintBlock?.role || resolvedType,
      sopDesc: blueprintBlock?.desc,
      content
    });
  });

  return result;
}
