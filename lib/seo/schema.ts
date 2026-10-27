import type { Metadata } from 'next';
import { MACRO_CTAS, MICRO_CTAS } from '@/lib/cms/ctas';

export interface DomainSeoContext {
  siteName: string;
  baseUrl: string;
  description: string;
  logoUrl: string;
  faviconUrl: string;
  isSociety: boolean;
  isDarkpore: boolean;
  tenantId: string;
}

export interface ExtractedFaq {
  question: string;
  answer: string;
}

export interface ExtractedArticleData {
  summary: string;
  faqs: ExtractedFaq[];
  takeaways: string[];
}

/**
 * Resolves the SEO context based on the incoming request's host header.
 * Correctly distinguishes between foodnerve.com, foodnerve.org, darkpore.com,
 * energynerve.com, and energynerve.org.
 */
export function resolveDomainSeoContext(hostHeader?: string | null): DomainSeoContext {
  const host = (hostHeader || '').split(':')[0].toLowerCase();

  // EnergyNerve Domain Cluster
  if (host.includes('energy')) {
    if (host.includes('.org') || host.startsWith('society.')) {
      return {
        siteName: 'EnergyNerve Society',
        baseUrl: 'https://energynerve.org',
        description: 'The Society OS for Decentralized Energy Systems, Grid Resilience, and Clean Power Infrastructure.',
        logoUrl: 'https://energynerve.org/images/society-logo.png',
        faviconUrl: '/images/society-favicon.png',
        isSociety: true,
        isDarkpore: false,
        tenantId: 'energy',
      };
    }
    return {
      siteName: 'EnergyNerve',
      baseUrl: 'https://energynerve.com',
      description: 'Global Energy Systems Intelligence, Clean Power Infrastructure, and Grid Modernization.',
      logoUrl: 'https://energynerve.com/images/energynerve-logo.png',
      faviconUrl: '/images/energynerve-favicon.png',
      isSociety: false,
      isDarkpore: false,
      tenantId: 'energy',
    };
  }

  // Darkpore Cluster
  if (host.includes('darkpore')) {
    return {
      siteName: 'Darkpore',
      baseUrl: 'https://darkpore.com',
      description: 'Advanced Systems Architecture, Applied Intelligence, and Venture Engineering.',
      logoUrl: 'https://darkpore.com/images/darkpore-logo.png',
      faviconUrl: '/images/darkpore-favicon.png',
      isSociety: false,
      isDarkpore: true,
      tenantId: 'darkpore',
    };
  }

  // FoodNerve Society Cluster (.org or society.*)
  if (host.includes('.org') || host.startsWith('society.')) {
    return {
      siteName: 'FoodNerve Society',
      baseUrl: 'https://foodnerve.org',
      description: 'The Society OS for Food Systems: Cooperative Intelligence, Trade, and Action Groups.',
      logoUrl: 'https://foodnerve.org/images/society-logo.png',
      faviconUrl: '/images/society-favicon.png',
      isSociety: true,
      isDarkpore: false,
      tenantId: 'foodnerve',
    };
  }

  // Default / FoodNerve Market Innovation Cluster (.com)
  return {
    siteName: 'FoodNerve',
    baseUrl: 'https://foodnerve.com',
    description: 'Global Food Systems Intelligence, Agricultural Innovation, and Value-Chain Transformation.',
    logoUrl: 'https://foodnerve.com/images/foodnerve-logo.png',
    faviconUrl: '/images/foodnerve-favicon.png',
    isSociety: false,
    isDarkpore: false,
    tenantId: 'foodnerve',
  };
}

function parseBlockContent(content: any): any {
  if (typeof content === 'string') {
    try {
      return JSON.parse(content);
    } catch {
      return { text: content };
    }
  }
  return content || {};
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parsePollOptions(rawOptions?: any): string[] {
  if (!rawOptions) return [];
  if (Array.isArray(rawOptions)) {
    return rawOptions.map((o) => (typeof o === 'string' ? o.trim() : String(o))).filter(Boolean);
  }
  const str = String(rawOptions).trim();
  if (!str) return [];

  // JSON array or stringified JSON
  if (str.startsWith('[') && str.endsWith(']')) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed.map((o) => (typeof o === 'string' ? o.trim() : String(o))).filter(Boolean);
      }
    } catch {
      const quotedMatches = str.match(/"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'/g);
      if (quotedMatches && quotedMatches.length >= 2) {
        return quotedMatches.map((m) => m.slice(1, -1).trim()).filter(Boolean);
      }
    }
  }

  // Pipe separated
  if (str.includes('||')) {
    const parts = str.split('||').map((o) => o.trim()).filter(Boolean);
    if (parts.length >= 2) return parts;
  }
  if (str.includes('|')) {
    const parts = str.split('|').map((o) => o.trim()).filter(Boolean);
    if (parts.length >= 2) return parts;
  }

  // Newline separated
  if (str.includes('\n')) {
    const parts = str.split(/\r?\n+/).map((o) => o.replace(/^[-*•\d.)\s]+/, '').trim()).filter(Boolean);
    if (parts.length >= 2) return parts;
  }

  // Semicolon separated
  if (str.includes(';')) {
    const parts = str.split(';').map((o) => o.trim()).filter(Boolean);
    if (parts.length >= 2) return parts;
  }

  return str.split('\n').map((s) => s.replace(/^[-*•\d.)\s]+/, '').trim()).filter(Boolean);
}

/**
 * Extracts a concise summary and FAQ pairs from content article blocks
 * (supporting myth_fact, comparison_matrix, unit_economics_card, exec_summary, highlight_card, etc.)
 */
export function extractArticleSummaryAndFaqs(blocks?: any[]): ExtractedArticleData {
  const faqs: ExtractedFaq[] = [];
  const takeaways: string[] = [];
  let summary = '';

  if (!blocks || !Array.isArray(blocks)) {
    return { summary, faqs, takeaways };
  }

  for (const block of blocks) {
    const blockType = block.blockType || block.type;
    const content = parseBlockContent(block.content);

    if (!content) continue;

    // 1. Myth vs Fact Block -> FAQPage Question / Answer pairs
    if (blockType === 'myth_fact' || blockType === 'fact_myth') {
      if (content.myth && content.fact) {
        faqs.push({
          question: `Myth: ${String(content.myth).trim()}`,
          answer: String(content.fact).trim(),
        });
      }
      if (Array.isArray(content.pairs)) {
        for (const pair of content.pairs) {
          if (pair?.myth && pair?.fact) {
            faqs.push({
              question: `Myth: ${String(pair.myth).trim()}`,
              answer: String(pair.fact).trim(),
            });
          }
        }
      }
      if (Array.isArray(content.items)) {
        for (const item of content.items) {
          if (item?.myth && item?.fact) {
            faqs.push({
              question: `Myth: ${String(item.myth).trim()}`,
              answer: String(item.fact).trim(),
            });
          }
        }
      }
    }

    // 2. Comparison Matrix -> Structured Q&A
    if (blockType === 'comparison_matrix') {
      const optA = content.optionAName || 'Option A';
      const optB = content.optionBName || 'Option B';
      let question = `How does ${optA} compare to ${optB}?`;
      if (faqs.some((f) => f.question === question)) {
        const count = faqs.filter((f) => f.question.startsWith(`How does ${optA} compare to ${optB}`)).length;
        question = `How does ${optA} compare to ${optB}? (Part ${count + 1})`;
      }
      const answerParts: string[] = [];
      if (content.winnerVerdict) {
        answerParts.push(`Verdict: ${String(content.winnerVerdict).trim()}`);
      }
      if (Array.isArray(content.rows) && content.rows.length > 0) {
        const rowSummaries = content.rows
          .filter((r: any) => r && (r.criterion || r.optionAValue || r.optionBValue))
          .map((r: any) => {
            const crit = r.criterion || 'Criterion';
            const valA = r.optionAValue || 'N/A';
            const valB = r.optionBValue || 'N/A';
            const winner = r.winner === 'A' ? optA : r.winner === 'B' ? optB : 'Tie';
            return `${crit}: ${optA} (${valA}) vs ${optB} (${valB}) [Winner: ${winner}]`;
          })
          .join('; ');
        if (rowSummaries) {
          answerParts.push(`Key criteria comparison: ${rowSummaries}.`);
        }
      }
      if (answerParts.length > 0) {
        faqs.push({
          question,
          answer: answerParts.join(' '),
        });
      }
    }

    // 3. Unit Economics Card -> Structured Q&A
    if (blockType === 'unit_economics_card') {
      let question = 'What are the unit economics, target IRR, and payback period?';
      if (faqs.some((f) => f.question.startsWith('What are the unit economics, target IRR, and payback period?'))) {
        const count = faqs.filter((f) => f.question.startsWith('What are the unit economics, target IRR, and payback period?')).length;
        question = `What are the unit economics, target IRR, and payback period? (Part ${count + 1})`;
      }
      const metrics: string[] = [];
      if (content.tam) metrics.push(`Addressable TAM: ${content.tam}`);
      if (content.targetIrr) metrics.push(`Target IRR: ${content.targetIrr}`);
      if (content.ticketSize) metrics.push(`Ticket Size: ${content.ticketSize}`);
      if (content.grossMargin) metrics.push(`Target Gross Margin: ${content.grossMargin}`);
      if (content.paybackPeriod) metrics.push(`Payback Period: ${content.paybackPeriod}`);
      if (content.primaryRisk) metrics.push(`Primary Risk Hedge: ${content.primaryRisk}`);

      const answerParts: string[] = [];
      if (content.dealThesis) {
        answerParts.push(String(content.dealThesis).trim());
      }
      if (metrics.length > 0) {
        answerParts.push(`Key financial metrics: ${metrics.join(', ')}.`);
      }
      if (answerParts.length > 0) {
        faqs.push({
          question,
          answer: answerParts.join(' '),
        });
      }
    }

    // 4. Executive Summary Block -> Key Takeaways & FAQ enrichment
    if (blockType === 'exec_summary' || blockType === 'executive_summary') {
      const p1 = content.point1 || content.p1;
      const p2 = content.point2 || content.p2;
      const p3 = content.point3 || content.p3;
      if (p1) takeaways.push(String(p1).trim());
      if (p2) takeaways.push(String(p2).trim());
      if (p3) takeaways.push(String(p3).trim());

      if (Array.isArray(content.points)) {
        for (const pt of content.points) {
          if (pt) takeaways.push(String(pt).trim());
        }
      }

      if (!summary && (p1 || content.summary || content.text)) {
        summary = String(p1 || content.summary || content.text).trim();
      }
    }

    // 5. Highlight Card / Key Takeaways for summary fallback
    if (blockType === 'highlight_card' || blockType === 'key_takeaways') {
      const candidate = content.caption || content.text || content.label || content.point1;
      if (!summary && candidate) {
        summary = String(candidate).trim();
      }
    }
  }

  // If no summary found from cards, synthesize from the first takeaway
  if (!summary && takeaways.length > 0) {
    summary = takeaways[0];
  }

  // Truncate summary cleanly to ~160 chars if too long
  if (summary.length > 165) {
    summary = summary.substring(0, 160).replace(/\s+\S*$/, '') + '...';
  }

  return { summary, faqs, takeaways };
}

/**
 * Complete 17-block Markdown Serializer covering all ArticleBlockRenderer block types.
 * Used for /llms-full.txt and AI system knowledge ingestion.
 */
export function renderArticleBlocksToMarkdown(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return '';

  const sections: string[] = [];

  for (const block of blocks) {
    const type = block.blockType || block.type;
    const content = parseBlockContent(block.content);
    if (!content) continue;

    switch (type) {
      case 'subheading':
      case 'title':
        if (content.text || content.bionicText) {
          sections.push(`\n### ${content.text || content.bionicText}\n`);
        }
        break;

      case 'highlight_card':
        if (content.caption || content.label || content.text) {
          const labelPrefix = content.label ? `[${content.label}] ` : '';
          sections.push(`\n> **Focus**: ${labelPrefix}${content.caption || content.text}\n`);
        }
        break;

      case 'exec_summary':
      case 'executive_summary': {
        const bullets: string[] = [];
        if (content.point1) bullets.push(`- **Takeaway 1**: ${content.point1}`);
        if (content.point2) bullets.push(`- **Takeaway 2**: ${content.point2}`);
        if (content.point3) bullets.push(`- **Takeaway 3**: ${content.point3}`);
        if (Array.isArray(content.points)) {
          content.points.forEach((pt: any, i: number) => {
            if (pt) bullets.push(`- **Point ${i + 1}**: ${pt}`);
          });
        }
        if (content.summary) bullets.push(`\n${content.summary}\n`);
        if (bullets.length > 0) {
          sections.push(`\n#### Executive Summary\n${bullets.join('\n')}\n`);
        }
        break;
      }

      case 'core_interactive':
      case 'text':
      case 'paragraph':
      case 'markdown':
      case 'deep_analysis': {
        const parts: string[] = [];
        const heading = content.heading || content.anchorQuestion;
        if (heading) {
          parts.push(`### ${heading}\n`);
        }
        if (content.imageUrl) {
          parts.push(`![Analysis Graphic](${content.imageUrl})\n`);
        }
        const bodyText = content.bionicText || content.text || content.markdown || content.content;
        if (bodyText) {
          parts.push(bodyText);
        }
        if (content.discussionPrompt) {
          parts.push(`\n*Discussion Prompt: ${content.discussionPrompt}*`);
        }
        if (parts.length > 0) {
          sections.push(`\n${parts.join('\n')}\n`);
        }
        break;
      }

      case 'pull_quote':
      case 'expert_quote':
        if (content.quote || content.text) {
          const author =
            content.authorName ||
            content.author ||
            (content.attribution ? content.attribution.replace(/\s*Source:\s*https?:\/\/[^\s]+/i, '').split(',')[0].trim() : '') ||
            content.source ||
            '';
          const role = content.authorRole
            ? `, ${content.authorRole}`
            : content.attribution && content.attribution.includes(',')
            ? `, ${content.attribution.replace(/\s*Source:\s*https?:\/\/[^\s]+/i, '').split(',').slice(1).join(',').trim()}`
            : '';
          const authorSuffix = author ? ` — **${author}**${role}` : '';
          sections.push(`\n> "${content.quote || content.text}"${authorSuffix}\n`);
        }
        break;

      case 'myth_fact':
      case 'fact_myth': {
        const rows: string[] = [];
        if (content.myth && content.fact) {
          rows.push(`- **Myth**: ${content.myth}\n  **Fact**: ${content.fact}`);
        }
        if (Array.isArray(content.pairs)) {
          for (const p of content.pairs) {
            if (p?.myth || p?.fact) {
              rows.push(`- **Myth**: ${p.myth || ''}\n  **Fact**: ${p.fact || ''}`);
            }
          }
        }
        if (Array.isArray(content.items)) {
          for (const item of content.items) {
            if (item?.myth || item?.fact) {
              rows.push(`- **Myth**: ${item.myth || ''}\n  **Fact**: ${item.fact || ''}`);
            }
          }
        }
        if (rows.length > 0) {
          sections.push(`\n#### Myth vs. Fact\n${rows.join('\n\n')}\n`);
        }
        break;
      }

      case 'comparison_matrix': {
        const optA = content.optionAName || 'Option A';
        const optB = content.optionBName || 'Option B';
        const rows = Array.isArray(content.rows) ? content.rows : [];
        const escapeCell = (v: any) => String(v ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
        const tableLines: string[] = [
          `#### Head-to-Head Comparison: ${optA} vs. ${optB}\n`,
          `| Evaluation Criterion | ${optA} | ${optB} | Winner |`,
          `|---|---|---|---|`,
        ];
        for (const row of rows) {
          const winnerText = row.winner === 'A' ? optA : row.winner === 'B' ? optB : 'Tie';
          tableLines.push(`| ${escapeCell(row.criterion)} | ${escapeCell(row.optionAValue)} | ${escapeCell(row.optionBValue)} | ${escapeCell(winnerText)} |`);
        }
        if (content.winnerVerdict) {
          tableLines.push(`\n**Verdict:** ${content.winnerVerdict}\n`);
        }
        sections.push(`\n${tableLines.join('\n')}\n`);
        break;
      }

      case 'unit_economics_card': {
        const bullets: string[] = [];
        if (content.tam) bullets.push(`- **Addressable TAM**: ${content.tam}`);
        if (content.targetIrr) bullets.push(`- **Target IRR**: ${content.targetIrr}`);
        if (content.ticketSize) bullets.push(`- **Ticket / Deal Size**: ${content.ticketSize}`);
        if (content.grossMargin) bullets.push(`- **Target Gross Margin**: ${content.grossMargin}`);
        if (content.paybackPeriod) bullets.push(`- **Payback Period**: ${content.paybackPeriod}`);
        if (content.primaryRisk) bullets.push(`- **Primary Risk Hedge**: ${content.primaryRisk}`);

        const parts: string[] = [`#### Unit Economics & Investment Metrics`];
        if (bullets.length > 0) parts.push(bullets.join('\n'));
        if (content.dealThesis) {
          parts.push(`\n**Margin Thesis & Capital Return Engine:** ${content.dealThesis}`);
        }
        sections.push(`\n${parts.join('\n')}\n`);
        break;
      }

      case 'protocol_steps': {
        const steps = Array.isArray(content.steps) ? content.steps : [];
        if (steps.length > 0) {
          const stepLines: string[] = [`#### Standard Operating Procedure (SOP) Protocol`];
          steps.forEach((st: any, i: number) => {
            const stepNum = st.stepNumber || i + 1;
            const meta: string[] = [];
            if (st.role) meta.push(`Role: ${st.role}`);
            if (st.timeWindow) meta.push(`Time Window: ${st.timeWindow}`);
            const metaStr = meta.length > 0 ? ` (${meta.join(' | ')})` : '';
            stepLines.push(`\n**Step ${stepNum}: ${st.title || `Step ${stepNum}`}**${metaStr}`);
            if (st.description) stepLines.push(`${st.description}`);
            if (Array.isArray(st.checklist) && st.checklist.length > 0) {
              st.checklist.forEach((item: string) => {
                if (item) stepLines.push(`  - [ ] ${item}`);
              });
            }
          });
          sections.push(`\n${stepLines.join('\n')}\n`);
        }
        break;
      }

      case 'timeline_tracker': {
        const milestones = Array.isArray(content.milestones) ? content.milestones : [];
        if (milestones.length > 0) {
          const mLines: string[] = [`#### Timeline & Implementation Roadmap`];
          milestones.forEach((m: any, idx: number) => {
            const dateLabel = m.dateOrYear || `Phase ${idx + 1}`;
            const statusStr = m.status ? ` [${m.status}]` : '';
            const descStr = m.description ? `: ${m.description}` : '';
            mLines.push(`- **${dateLabel}** — **${m.title}**${statusStr}${descStr}`);
          });
          sections.push(`\n${mLines.join('\n')}\n`);
        }
        break;
      }

      case 'persona_dossier': {
        const pLines: string[] = [`#### Operator Dossier: ${content.name || 'Operator Profile'}`];
        if (content.avatarUrl) pLines.push(`![${content.name || 'Operator'}](${content.avatarUrl})`);
        const ageStr = content.age ? ` (${content.age} yrs)` : '';
        if (content.roleAndLocation) pLines.push(`- **Role & Location**: ${content.roleAndLocation}${ageStr}`);
        if (content.monthlyTurnover) pLines.push(`- **Monthly Turnover**: ${content.monthlyTurnover}`);
        if (content.bio) pLines.push(`- **Bio**: ${content.bio}`);
        if (content.fieldQuote) pLines.push(`> "${content.fieldQuote}"`);
        sections.push(`\n${pLines.join('\n')}\n`);
        break;
      }

      case 'strategic_directive': {
        const urgency = content.urgencyLevel || 'DIRECTIVE';
        const target = content.targetPersona || 'All Operators';
        const dLines: string[] = [`#### Strategic Directive [${urgency}] — Target: ${target}`];
        if (content.point1) dLines.push(`- **The Threat / Reality**: ${content.point1}`);
        if (content.point2) dLines.push(`- **Immediate Action**: ${content.point2}`);
        if (content.point3) dLines.push(`- **The Long-Term Pivot**: ${content.point3}`);
        if (content.microCtaId) {
          const mCta = MICRO_CTAS.find((c) => c.id === content.microCtaId);
          if (mCta) {
            dLines.push(`\n[${mCta.text}](${mCta.url})\n`);
          }
        }
        sections.push(`\n${dLines.join('\n')}\n`);
        break;
      }

      case 'live_poll': {
        const q = content.question || 'Operator Live Poll';
        const opts = parsePollOptions(content.options);
        const pollLines: string[] = [`#### Live Poll: ${q}`];
        for (const opt of opts) {
          pollLines.push(`- [ ] ${opt}`);
        }
        if (content.discussionPrompt) {
          pollLines.push(`\n*Discussion Prompt: ${content.discussionPrompt}*`);
        }
        sections.push(`\n${pollLines.join('\n')}\n`);
        break;
      }

      case 'media': {
        const items = Array.isArray(content.items) ? content.items : [];
        if (items.length > 0) {
          const mediaLines = items.map((it: any) => {
            const cap = it.caption ? `\n*${it.caption}*` : '';
            const src = it.sourceName ? ` (Source: ${it.sourceName})` : '';
            return `![${it.caption || 'Evidence'}](${it.url})${cap}${src}`;
          });
          sections.push(`\n${mediaLines.join('\n\n')}\n`);
        } else if (content.caption || content.url) {
          sections.push(`\n> *Media Evidence: ${content.caption || content.url}*\n`);
        }
        break;
      }

      case 'call_to_action': {
        const cta = MACRO_CTAS.find((c) => c.id === content.macroCtaId) || MACRO_CTAS[0];
        const hook = content.hook || content.title || cta?.hook || 'Take Action';
        const subtext = content.subtext || content.description || cta?.subtext || '';
        const btn = content.buttonText || cta?.buttonText || 'Learn More';
        const url = content.url || cta?.url || '#';
        sections.push(`\n#### ${hook}\n${subtext}\n\n[${btn}](${url})\n`);
        break;
      }

      case 'ecosystem_embed': {
        const jobs = Array.isArray(content.jobs) && content.jobs.length > 0
          ? content.jobs
          : content.title
          ? [content]
          : [];
        if (jobs.length > 0) {
          const eLines: string[] = [`#### Ecosystem Opportunities & Deployments`];
          for (const j of jobs) {
            const org = j.organization ? ` at ${j.organization}` : '';
            const loc = j.location ? ` (${j.location})` : '';
            const comp = j.compensationOrTarget ? ` — Target: ${j.compensationOrTarget}` : '';
            const cta = j.ctaLink ? ` [${j.ctaText || 'Apply'}](${j.ctaLink})` : '';
            eLines.push(`- **${j.title}**${org}${loc}${comp}${cta}`);
          }
          sections.push(`\n${eLines.join('\n')}\n`);
        }
        break;
      }

      case 'data_embed':
        if (content.iframeUrl) {
          sections.push(`\n[Interactive Data Visualization](${content.iframeUrl})\n`);
        }
        break;

      default:
        if (content.text) {
          sections.push(`\n${content.text}\n`);
        }
        break;
    }
  }

  return sections.join('\n');
}

/**
 * Slide deck and broadcast outline Markdown Serializer for livestreams.
 */
export function renderLivestreamBlocksToMarkdown(materialOrBlocks: any): string {
  const blocks = Array.isArray(materialOrBlocks)
    ? materialOrBlocks
    : materialOrBlocks?.livestream?.blocks || materialOrBlocks?.blocks || [];
  if (!blocks || !Array.isArray(blocks)) return '';
  const lines: string[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const content = parseBlockContent(b.content);
    if (!content) continue;

    const idx = b.orderIndex !== undefined ? b.orderIndex + 1 : i + 1;
    const title = content.title || content.headline || `Segment ${idx}`;
    const duration = content.durationStr ? ` (${content.durationStr})` : '';
    lines.push(`- **Slide ${idx}: ${title}**${duration}`);

    if (content.summary || content.text) {
      lines.push(`  ${content.summary || content.text}`);
    }
    if (Array.isArray(content.talkingPoints)) {
      content.talkingPoints.forEach((tp: any) => {
        if (tp) lines.push(`    * ${tp}`);
      });
    }
  }

  return lines.join('\n');
}

/**
 * Semantic HTML Serializer for Article Blocks.
 * Injected into <content:encoded> inside /feed.xml for Microsoft Start (MSN / Edge) full-text ingestion.
 */
export function renderArticleBlocksToHtml(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return '';

  const htmlSections: string[] = [];

  for (const block of blocks) {
    const type = block.blockType || block.type;
    const content = parseBlockContent(block.content);
    if (!content) continue;

    switch (type) {
      case 'subheading':
      case 'title':
        if (content.text || content.bionicText) {
          htmlSections.push(`<h3>${escapeHtml(content.text || content.bionicText)}</h3>`);
        }
        break;

      case 'highlight_card':
        if (content.caption || content.label || content.text) {
          const labelPrefix = content.label ? `<strong>[${escapeHtml(content.label)}]</strong> ` : '';
          htmlSections.push(`<blockquote><p>${labelPrefix}${escapeHtml(content.caption || content.text)}</p></blockquote>`);
        }
        break;

      case 'exec_summary':
      case 'executive_summary': {
        const bullets: string[] = [];
        if (content.point1) bullets.push(`<li>${escapeHtml(content.point1)}</li>`);
        if (content.point2) bullets.push(`<li>${escapeHtml(content.point2)}</li>`);
        if (content.point3) bullets.push(`<li>${escapeHtml(content.point3)}</li>`);
        if (Array.isArray(content.points)) {
          content.points.forEach((pt: any) => {
            if (pt) bullets.push(`<li>${escapeHtml(String(pt))}</li>`);
          });
        }
        if (bullets.length > 0) {
          htmlSections.push(`<h4>Executive Summary</h4><ul>${bullets.join('')}</ul>`);
        }
        break;
      }

      case 'core_interactive':
      case 'text':
      case 'paragraph':
      case 'markdown':
      case 'deep_analysis': {
        const parts: string[] = [];
        const heading = content.heading || content.anchorQuestion;
        if (heading) {
          parts.push(`<h3>${escapeHtml(heading)}</h3>`);
        }
        if (content.imageUrl) {
          parts.push(`<p><img src="${escapeHtml(content.imageUrl)}" alt="Analysis Graphic" /></p>`);
        }
        const bodyText = content.bionicText || content.text || content.markdown || content.content;
        if (bodyText) {
          const paragraphs = String(bodyText).split(/\n\n+/).filter(Boolean);
          parts.push(paragraphs.map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`).join(''));
        }
        if (content.discussionPrompt) {
          parts.push(`<p><em>Discussion Prompt: ${escapeHtml(content.discussionPrompt)}</em></p>`);
        }
        if (parts.length > 0) {
          htmlSections.push(parts.join(''));
        }
        break;
      }

      case 'pull_quote':
      case 'expert_quote':
        if (content.quote || content.text) {
          const author =
            content.authorName ||
            content.author ||
            (content.attribution ? content.attribution.replace(/\s*Source:\s*https?:\/\/[^\s]+/i, '').split(',')[0].trim() : '') ||
            content.source ||
            '';
          const role = content.authorRole
            ? `, ${content.authorRole}`
            : content.attribution && content.attribution.includes(',')
            ? `, ${content.attribution.replace(/\s*Source:\s*https?:\/\/[^\s]+/i, '').split(',').slice(1).join(',').trim()}`
            : '';
          const footerStr = author ? `<footer>— <strong>${escapeHtml(author)}</strong>${escapeHtml(role)}</footer>` : '';
          htmlSections.push(`<blockquote><p>"${escapeHtml(content.quote || content.text)}"</p>${footerStr}</blockquote>`);
        }
        break;

      case 'myth_fact':
      case 'fact_myth': {
        const listItems: string[] = [];
        if (content.myth && content.fact) {
          listItems.push(`<li><strong>Myth:</strong> ${escapeHtml(content.myth)}<br/><strong>Fact:</strong> ${escapeHtml(content.fact)}</li>`);
        }
        if (Array.isArray(content.pairs)) {
          for (const p of content.pairs) {
            if (p?.myth || p?.fact) {
              listItems.push(`<li><strong>Myth:</strong> ${escapeHtml(p.myth || '')}<br/><strong>Fact:</strong> ${escapeHtml(p.fact || '')}</li>`);
            }
          }
        }
        if (Array.isArray(content.items)) {
          for (const item of content.items) {
            if (item?.myth || item?.fact) {
              listItems.push(`<li><strong>Myth:</strong> ${escapeHtml(item.myth || '')}<br/><strong>Fact:</strong> ${escapeHtml(item.fact || '')}</li>`);
            }
          }
        }
        if (listItems.length > 0) {
          htmlSections.push(`<h4>Myth vs. Fact</h4><ul>${listItems.join('')}</ul>`);
        }
        break;
      }

      case 'comparison_matrix': {
        const optA = content.optionAName || 'Option A';
        const optB = content.optionBName || 'Option B';
        const rows = Array.isArray(content.rows) ? content.rows : [];
        const tableHtml = [
          `<h4>Head-to-Head Comparison: ${escapeHtml(optA)} vs. ${escapeHtml(optB)}</h4>`,
          `<table>`,
          `<thead><tr><th>Evaluation Criterion</th><th>${escapeHtml(optA)}</th><th>${escapeHtml(optB)}</th><th>Winner</th></tr></thead>`,
          `<tbody>`,
        ];
        for (const row of rows) {
          const winnerText = row.winner === 'A' ? optA : row.winner === 'B' ? optB : 'Tie';
          tableHtml.push(`<tr><td>${escapeHtml(row.criterion)}</td><td>${escapeHtml(row.optionAValue)}</td><td>${escapeHtml(row.optionBValue)}</td><td>${escapeHtml(winnerText)}</td></tr>`);
        }
        tableHtml.push(`</tbody></table>`);
        if (content.winnerVerdict) {
          tableHtml.push(`<p><strong>Verdict:</strong> ${escapeHtml(content.winnerVerdict)}</p>`);
        }
        htmlSections.push(tableHtml.join(''));
        break;
      }

      case 'unit_economics_card': {
        const bullets: string[] = [];
        if (content.tam) bullets.push(`<li><strong>Addressable TAM:</strong> ${escapeHtml(content.tam)}</li>`);
        if (content.targetIrr) bullets.push(`<li><strong>Target IRR:</strong> ${escapeHtml(content.targetIrr)}</li>`);
        if (content.ticketSize) bullets.push(`<li><strong>Ticket / Deal Size:</strong> ${escapeHtml(content.ticketSize)}</li>`);
        if (content.grossMargin) bullets.push(`<li><strong>Target Gross Margin:</strong> ${escapeHtml(content.grossMargin)}</li>`);
        if (content.paybackPeriod) bullets.push(`<li><strong>Payback Period:</strong> ${escapeHtml(content.paybackPeriod)}</li>`);
        if (content.primaryRisk) bullets.push(`<li><strong>Primary Risk Hedge:</strong> ${escapeHtml(content.primaryRisk)}</li>`);

        const parts: string[] = [`<h4>Unit Economics &amp; Investment Metrics</h4>`];
        if (bullets.length > 0) parts.push(`<ul>${bullets.join('')}</ul>`);
        if (content.dealThesis) {
          parts.push(`<p><strong>Margin Thesis &amp; Capital Return Engine:</strong> ${escapeHtml(content.dealThesis)}</p>`);
        }
        htmlSections.push(parts.join(''));
        break;
      }

      case 'protocol_steps': {
        const steps = Array.isArray(content.steps) ? content.steps : [];
        if (steps.length > 0) {
          const sHtml: string[] = [`<h4>Standard Operating Procedure (SOP) Protocol</h4><ol>`];
          steps.forEach((st: any, i: number) => {
            const stepNum = st.stepNumber || i + 1;
            const meta: string[] = [];
            if (st.role) meta.push(`Role: ${escapeHtml(st.role)}`);
            if (st.timeWindow) meta.push(`Time: ${escapeHtml(st.timeWindow)}`);
            const metaStr = meta.length > 0 ? ` <em>(${meta.join(' | ')})</em>` : '';
            let stepItem = `<li><strong>Step ${stepNum}: ${escapeHtml(st.title || `Step ${stepNum}`)}</strong>${metaStr}`;
            if (st.description) stepItem += `<p>${escapeHtml(st.description)}</p>`;
            if (Array.isArray(st.checklist) && st.checklist.length > 0) {
              stepItem += `<ul>${st.checklist.map((c: string) => `<li>${escapeHtml(c)}</li>`).join('')}</ul>`;
            }
            stepItem += `</li>`;
            sHtml.push(stepItem);
          });
          sHtml.push(`</ol>`);
          htmlSections.push(sHtml.join(''));
        }
        break;
      }

      case 'timeline_tracker': {
        const milestones = Array.isArray(content.milestones) ? content.milestones : [];
        if (milestones.length > 0) {
          const mHtml: string[] = [`<h4>Timeline &amp; Implementation Roadmap</h4><ul>`];
          milestones.forEach((m: any, idx: number) => {
            const dateLabel = m.dateOrYear || `Phase ${idx + 1}`;
            const statusStr = m.status ? ` [${escapeHtml(m.status)}]` : '';
            const descStr = m.description ? `: ${escapeHtml(m.description)}` : '';
            mHtml.push(`<li><strong>${escapeHtml(dateLabel)}</strong> — <strong>${escapeHtml(m.title)}</strong>${statusStr}${descStr}</li>`);
          });
          mHtml.push(`</ul>`);
          htmlSections.push(mHtml.join(''));
        }
        break;
      }

      case 'persona_dossier': {
        const pHtml: string[] = [`<h4>Operator Dossier: ${escapeHtml(content.name || 'Operator Profile')}</h4>`];
        if (content.avatarUrl) {
          pHtml.push(`<p><img src="${escapeHtml(content.avatarUrl)}" alt="${escapeHtml(content.name || 'Operator')}" /></p>`);
        }
        pHtml.push(`<ul>`);
        const ageStr = content.age ? ` (${content.age} yrs)` : '';
        if (content.roleAndLocation) pHtml.push(`<li><strong>Role &amp; Location:</strong> ${escapeHtml(content.roleAndLocation)}${escapeHtml(ageStr)}</li>`);
        if (content.monthlyTurnover) pHtml.push(`<li><strong>Monthly Turnover:</strong> ${escapeHtml(content.monthlyTurnover)}</li>`);
        if (content.bio) pHtml.push(`<li><strong>Bio:</strong> ${escapeHtml(content.bio)}</li>`);
        pHtml.push(`</ul>`);
        if (content.fieldQuote) pHtml.push(`<blockquote><p>"${escapeHtml(content.fieldQuote)}"</p></blockquote>`);
        htmlSections.push(pHtml.join(''));
        break;
      }

      case 'strategic_directive': {
        const urgency = content.urgencyLevel || 'DIRECTIVE';
        const target = content.targetPersona || 'All Operators';
        const dHtml: string[] = [`<h4>Strategic Directive [${escapeHtml(urgency)}] — Target: ${escapeHtml(target)}</h4><ul>`];
        if (content.point1) dHtml.push(`<li><strong>The Threat / Reality:</strong> ${escapeHtml(content.point1)}</li>`);
        if (content.point2) dHtml.push(`<li><strong>Immediate Action:</strong> ${escapeHtml(content.point2)}</li>`);
        if (content.point3) dHtml.push(`<li><strong>The Long-Term Pivot:</strong> ${escapeHtml(content.point3)}</li>`);
        dHtml.push(`</ul>`);
        if (content.microCtaId) {
          const mCta = MICRO_CTAS.find((c) => c.id === content.microCtaId);
          if (mCta) {
            dHtml.push(`<p><a href="${escapeHtml(mCta.url)}">${escapeHtml(mCta.text)}</a></p>`);
          }
        }
        htmlSections.push(dHtml.join(''));
        break;
      }

      case 'live_poll': {
        const q = content.question || 'Operator Live Poll';
        const opts = parsePollOptions(content.options);
        const pollHtml: string[] = [`<h4>Live Poll: ${escapeHtml(q)}</h4><ul>`];
        for (const opt of opts) {
          pollHtml.push(`<li>${escapeHtml(opt)}</li>`);
        }
        pollHtml.push(`</ul>`);
        if (content.discussionPrompt) {
          pollHtml.push(`<p><em>Discussion Prompt: ${escapeHtml(content.discussionPrompt)}</em></p>`);
        }
        htmlSections.push(pollHtml.join(''));
        break;
      }

      case 'media': {
        const items = Array.isArray(content.items) ? content.items : [];
        if (items.length > 0) {
          const mParts = items.map((it: any) => {
            const cap = it.caption ? `<figcaption>${escapeHtml(it.caption)}</figcaption>` : '';
            return `<figure><img src="${escapeHtml(it.url)}" alt="${escapeHtml(it.caption || 'Evidence')}" />${cap}</figure>`;
          });
          htmlSections.push(mParts.join(''));
        } else if (content.url) {
          const cap = content.caption ? `<figcaption>${escapeHtml(content.caption)}</figcaption>` : '';
          htmlSections.push(`<figure><img src="${escapeHtml(content.url)}" alt="${escapeHtml(content.caption || 'Evidence')}" />${cap}</figure>`);
        } else if (content.caption) {
          htmlSections.push(`<p><em>Media Evidence: ${escapeHtml(content.caption)}</em></p>`);
        }
        break;
      }

      case 'call_to_action': {
        const cta = MACRO_CTAS.find((c) => c.id === content.macroCtaId) || MACRO_CTAS[0];
        const hook = content.hook || content.title || cta?.hook || 'Take Action';
        const subtext = content.subtext || content.description || cta?.subtext || '';
        const btn = content.buttonText || cta?.buttonText || 'Learn More';
        const url = content.url || cta?.url || '#';
        htmlSections.push(`<div class="call-to-action"><h4>${escapeHtml(hook)}</h4><p>${escapeHtml(subtext)}</p><p><a href="${escapeHtml(url)}">${escapeHtml(btn)}</a></p></div>`);
        break;
      }

      case 'ecosystem_embed': {
        const jobs = Array.isArray(content.jobs) && content.jobs.length > 0
          ? content.jobs
          : content.title
          ? [content]
          : [];
        if (jobs.length > 0) {
          const eHtml: string[] = [`<h4>Ecosystem Opportunities &amp; Deployments</h4><ul>`];
          for (const j of jobs) {
            const org = j.organization ? ` at ${escapeHtml(j.organization)}` : '';
            const loc = j.location ? ` (${escapeHtml(j.location)})` : '';
            const comp = j.compensationOrTarget ? ` — Target: ${escapeHtml(j.compensationOrTarget)}` : '';
            const cta = j.ctaLink ? ` <a href="${escapeHtml(j.ctaLink)}">${escapeHtml(j.ctaText || 'Apply')}</a>` : '';
            eHtml.push(`<li><strong>${escapeHtml(j.title)}</strong>${org}${loc}${comp}${cta}</li>`);
          }
          eHtml.push(`</ul>`);
          htmlSections.push(eHtml.join(''));
        }
        break;
      }

      case 'data_embed':
        if (content.iframeUrl) {
          htmlSections.push(`<p><a href="${escapeHtml(content.iframeUrl)}">View Interactive Data Visualization</a></p>`);
        }
        break;

      default:
        if (content.text) {
          htmlSections.push(`<p>${escapeHtml(content.text)}</p>`);
        }
        break;
    }
  }

  return htmlSections.join('\n');
}

/**
 * Slide deck and broadcast outline HTML Serializer for livestreams in /feed.xml.
 */
export function renderLivestreamBlocksToHtml(materialOrBlocks: any): string {
  const isArray = Array.isArray(materialOrBlocks);
  const material = isArray ? null : materialOrBlocks;
  const blocks = isArray ? materialOrBlocks : (material?.livestream?.blocks || material?.blocks || []);
  const parts: string[] = [];

  const title = material?.title;
  if (title) {
    parts.push(`<h2>${escapeHtml(title)}</h2>`);
  }
  if (material?.description) {
    parts.push(`<p>${escapeHtml(material.description)}</p>`);
  }

  const rawScheduled = material?.livestream?.scheduledFor || material?.targetDate || material?.createdAt;
  if (rawScheduled) {
    const d = new Date(rawScheduled);
    if (!isNaN(d.getTime())) {
      parts.push(`<p><strong>Scheduled Broadcast:</strong> ${escapeHtml(d.toUTCString())}</p>`);
    }
  }

  if (blocks && Array.isArray(blocks) && blocks.length > 0) {
    parts.push(`<h3>Broadcast Agenda &amp; Slide Deck Outline</h3><ul>`);
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      const content = parseBlockContent(b.content);
      if (!content) continue;
      const slideTitle = content.title || content.headline || `Slide ${b.orderIndex !== undefined ? b.orderIndex + 1 : i + 1}`;
      const duration = content.durationStr ? ` (${escapeHtml(content.durationStr)})` : '';
      let slideHtml = `<li><strong>${escapeHtml(slideTitle)}</strong>${duration}`;
      if (content.summary || content.text) {
        slideHtml += `<p>${escapeHtml(content.summary || content.text)}</p>`;
      }
      if (Array.isArray(content.talkingPoints) && content.talkingPoints.length > 0) {
        slideHtml += `<ul>`;
        for (const tp of content.talkingPoints) {
          if (tp) slideHtml += `<li>${escapeHtml(String(tp))}</li>`;
        }
        slideHtml += `</ul>`;
      }
      slideHtml += `</li>`;
      parts.push(slideHtml);
    }
    parts.push(`</ul>`);
  }

  return parts.join('\n');
}

/**
 * Builds standard Next.js Metadata for an article or livestream.
 * Includes Google Discover max-image-preview: 'large', OpenGraph 1200x630, and RSS links.
 */
export function buildContentMetadata(
  material: any,
  hostHeader?: string | null,
  canonicalPath?: string
): Metadata {
  const ctx = resolveDomainSeoContext(hostHeader);
  const blocks = material?.article?.blocks || material?.livestream?.blocks || material?.articleBlocks || [];
  const { summary: extractedSummary } = extractArticleSummaryAndFaqs(blocks);

  const cleanTitle = material?.title || ctx.siteName;
  const rawDescription = material?.description || material?.previewText;
  const description =
    rawDescription && rawDescription.length > 25
      ? rawDescription
      : extractedSummary || ctx.description;

  const resolvedPath = canonicalPath || `/learn/${material?.type || 'article'}/${material?.slug || material?.id || ''}`;
  const canonicalUrl = `${ctx.baseUrl}${resolvedPath}`;

  // Image resolution: high-res thumbnail or dynamic OG card fallback
  let imageUrl = material?.thumbnailUrl;
  if (!imageUrl || imageUrl.trim() === '') {
    imageUrl = `${ctx.baseUrl}/api/og/card?title=${encodeURIComponent(cleanTitle)}`;
  } else if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    imageUrl = `${ctx.baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  const authorName =
    material?.author?.name ||
    material?.authorName ||
    (material?.author && typeof material.author === 'string' ? material.author : null) ||
    ctx.siteName;

  const rawPublished = material?.createdAt || material?.dateAdded;
  const publishedIso = rawPublished
    ? new Date(rawPublished).toISOString()
    : undefined;
  const modifiedIso = material?.updatedAt
    ? new Date(material.updatedAt).toISOString()
    : publishedIso;

  return {
    metadataBase: new URL(ctx.baseUrl),
    title: cleanTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
      types: {
        'application/rss+xml': `${ctx.baseUrl}/feed.xml`,
      },
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: cleanTitle,
      description,
      siteName: ctx.siteName,
      publishedTime: publishedIso,
      modifiedTime: modifiedIso,
      authors: authorName ? [authorName] : undefined,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: cleanTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: cleanTitle,
      description,
      images: [imageUrl],
    },
  };
}

/**
 * Builds Schema.org JSON-LD graph for Articles (NewsArticle + FAQPage).
 * Enables Rich Snippets, Perplexity / ChatGPT citation, and Google News eligibility.
 */
export function buildArticleJsonLd(
  material: any,
  hostHeader?: string | null,
  canonicalPath?: string
) {
  const ctx = resolveDomainSeoContext(hostHeader);
  const blocks = material?.article?.blocks || material?.articleBlocks || [];
  const { summary: extractedSummary, faqs } = extractArticleSummaryAndFaqs(blocks);

  const cleanTitle = material?.title || ctx.siteName;
  const rawDescription = material?.description || material?.previewText;
  const description =
    rawDescription && rawDescription.length > 25
      ? rawDescription
      : extractedSummary || ctx.description;

  const resolvedPath = canonicalPath || `/learn/${material?.type || 'article'}/${material?.slug || material?.id || ''}`;
  const canonicalUrl = `${ctx.baseUrl}${resolvedPath}`;

  let imageUrl = material?.thumbnailUrl;
  if (!imageUrl || imageUrl.trim() === '') {
    imageUrl = `${ctx.baseUrl}/api/og/card?title=${encodeURIComponent(cleanTitle)}`;
  } else if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    imageUrl = `${ctx.baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  const authorName =
    material?.author?.name ||
    material?.authorName ||
    (material?.author && typeof material.author === 'string' ? material.author : null) ||
    ctx.siteName;
  const authorAvatar = material?.author?.avatarUrl || material?.authorAvatarUrl;

  const rawPublished = material?.createdAt || material?.dateAdded;
  const publishedIso = rawPublished
    ? new Date(rawPublished).toISOString()
    : new Date().toISOString();
  const modifiedIso = material?.updatedAt
    ? new Date(material.updatedAt).toISOString()
    : publishedIso;

  const graph: any[] = [
    {
      '@type': 'NewsArticle',
      '@id': `${canonicalUrl}#article`,
      isPartOf: {
        '@type': 'WebSite',
        '@id': `${ctx.baseUrl}#website`,
        name: ctx.siteName,
        url: ctx.baseUrl,
      },
      headline: cleanTitle,
      description,
      image: [imageUrl],
      datePublished: publishedIso,
      dateModified: modifiedIso,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
      author: authorName === ctx.siteName
        ? {
            '@type': 'Organization',
            name: authorName,
            url: ctx.baseUrl,
          }
        : {
            '@type': 'Person',
            name: authorName,
            ...(authorAvatar ? { image: authorAvatar } : {}),
          },
      publisher: {
        '@type': 'Organization',
        name: ctx.siteName,
        url: ctx.baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: ctx.logoUrl,
        },
      },
    },
  ];

  if (faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonicalUrl}#faq`,
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      })),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

/**
 * Builds Schema.org JSON-LD graph for Livestreams.
 * Outputs VideoObject with nested BroadcastEvent (isLiveBroadcast: true) and EducationEvent
 * to unlock Google's red LIVE badge and event card indexing.
 */
export function buildLivestreamJsonLd(
  material: any,
  hostHeader?: string | null,
  canonicalPath?: string
) {
  const ctx = resolveDomainSeoContext(hostHeader);
  const cleanTitle = material?.title || ctx.siteName;
  const description = material?.description || ctx.description;

  const resolvedPath = canonicalPath || `/learn/livestream/${material?.id || material?.slug || ''}`;
  const canonicalUrl = `${ctx.baseUrl}${resolvedPath}`;

  let imageUrl = material?.thumbnailUrl;
  if (!imageUrl || imageUrl.trim() === '') {
    imageUrl = `${ctx.baseUrl}/api/og/card?title=${encodeURIComponent(cleanTitle)}`;
  } else if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    imageUrl = `${ctx.baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  // Derive schedule times
  const rawStartDate =
    material?.livestream?.scheduledFor ||
    material?.targetDate ||
    material?.createdAt ||
    new Date();
  const startDate = new Date(rawStartDate);
  const scheduledIso = !isNaN(startDate.getTime())
    ? startDate.toISOString()
    : new Date().toISOString();

  // Livestream estimated duration: default 60 minutes
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  const endIso = !isNaN(endDate.getTime())
    ? endDate.toISOString()
    : new Date(Date.now() + 60 * 60 * 1000).toISOString();

  const streamUrl = material?.livestream?.streamUrl || material?.livestreamUrl || canonicalUrl;

  const now = new Date();
  const isExplicitlyLive = Boolean(material?.livestream?.isLive);
  const isCurrentlyScheduled = startDate <= now ? now <= endDate : true;
  const isLiveBroadcast = isExplicitlyLive || (material?.status === 'scheduled' ? true : isCurrentlyScheduled);
  const isCompleted = now > endDate && !isExplicitlyLive;

  const graph: any[] = [
    {
      '@type': 'VideoObject',
      '@id': `${canonicalUrl}#video`,
      name: cleanTitle,
      description,
      thumbnailUrl: [imageUrl],
      uploadDate: scheduledIso,
      contentUrl: streamUrl,
      embedUrl: streamUrl,
      publication: {
        '@type': 'BroadcastEvent',
        isLiveBroadcast,
        startDate: scheduledIso,
        endDate: endIso,
      },
    },
    {
      '@type': 'BroadcastEvent',
      '@id': `${canonicalUrl}#broadcast`,
      name: cleanTitle,
      description,
      isLiveBroadcast,
      startDate: scheduledIso,
      endDate: endIso,
      video: {
        '@id': `${canonicalUrl}#video`,
      },
    },
    {
      '@type': 'EducationEvent',
      '@id': `${canonicalUrl}#event`,
      name: cleanTitle,
      description,
      startDate: scheduledIso,
      endDate: endIso,
      eventStatus: isCompleted ? 'https://schema.org/EventCompleted' : 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
      location: {
        '@type': 'VirtualLocation',
        url: canonicalUrl,
      },
      organizer: {
        '@type': 'Organization',
        name: ctx.siteName,
        url: ctx.baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: ctx.logoUrl,
        },
      },
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}
