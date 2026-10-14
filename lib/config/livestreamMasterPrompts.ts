/**
 * Master Livestream Editorial Prompts Configuration & Dynamic Builders (Phase 2: Documents 2a - 4)
 * Food Nerve Society - Live Broadcast Slide Drafting & Scripting Engine
 */

import {
  DEF_BLOCK_DEFINITIONS,
  DEFBlockDefinition,
  LIVESTREAM_TYPE_FLOWS,
  DEF_ACTS,
} from '@/app/modular-society/[tenant]/(authenticated)/components/forms/livestream/defBlocksConfig';
import { RundownItem } from '@/app/modular-society/[tenant]/(authenticated)/components/forms/livestream/LivestreamRundownBuilder';

export interface LivestreamPromptContext {
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  timeframe: 'past' | 'present' | 'future';
  format?: 'industry_teardown' | 'panel_debate' | 'talent_spotlight' | string;
  hubTitle?: string;
  hubColor?: string;
  appliedBlueprint?: any;
  customBlockDescriptions?: Record<string, string>;
  guidingArticles?: Array<{ id: string; title: string; description?: string; [key: string]: any }>;
  guidingJobs?: Array<{ id: string; title: string; compensationOrTarget?: string; organizationChallenges?: string; [key: string]: any }>;
  guidingListings?: Array<{ id: string; title: string; [key: string]: any }>;
  guidingCampaigns?: Array<{ id: string; title: string; [key: string]: any }>;
}

export function getCurrentTemporalAnchor(): string {
  const now = new Date();
  return now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

export function getFlowBlocksForFormat(format?: string): string[] {
  const normFmt = (format || '').toLowerCase();
  if (normFmt.includes('teardown') || normFmt.includes('audit')) {
    return LIVESTREAM_TYPE_FLOWS.industry_teardown;
  }
  if (normFmt.includes('debate') || normFmt.includes('panel')) {
    return LIVESTREAM_TYPE_FLOWS.panel_debate;
  }
  if (normFmt.includes('talent') || normFmt.includes('spotlight') || normFmt.includes('job')) {
    return LIVESTREAM_TYPE_FLOWS.talent_spotlight;
  }
  return LIVESTREAM_TYPE_FLOWS.default;
}

export function calculateExpectedSlideCount(format?: string): number {
  const blockIds = getFlowBlocksForFormat(format);
  return blockIds.reduce((acc, bId) => {
    const def = DEF_BLOCK_DEFINITIONS[bId];
    return acc + (def?.subSlideTemplates?.length || 1);
  }, 0);
}

export function canonicalizeDefBlockId(
  rawId?: string,
  fallbackIndex?: number,
  flowBlockIds?: string[]
): string {
  if (!rawId) {
    if (fallbackIndex !== undefined && flowBlockIds && flowBlockIds[fallbackIndex]) {
      return flowBlockIds[fallbackIndex];
    }
    return 'anchor_tension';
  }

  const s = String(rawId).toLowerCase().replace(/[^a-z0-9_]+/g, '_').trim();

  // Exact match first
  if (DEF_BLOCK_DEFINITIONS[s]) return s;

  // Keyword / Substring match
  if (s.includes('anchor') || s.includes('tension') || s.includes('crisis') || s.includes('snapshot') || s.includes('open')) {
    return 'anchor_tension';
  }
  if (s.includes('reframe') || s.includes('question') || s.includes('pivot')) {
    return 'reframe_question';
  }
  if (s.includes('funnel') || s.includes('diagnostic') || s.includes('layer')) {
    return 'funnel_system';
  }
  if (s.includes('ideal') || s.includes('feasible') || s.includes('disconnect') || s.includes('myth') || s.includes('fracture')) {
    return 'ideal_vs_feasible';
  }
  if (s.includes('burden') || s.includes('loss') || s.includes('bleed') || s.includes('scaled')) {
    return 'scaled_burden';
  }
  if (s.includes('power') || s.includes('decider') || s.includes('enforcer') || s.includes('payer') || s.includes('cartel')) {
    return 'power_map';
  }
  if (s.includes('response') || s.includes('audit') || s.includes('needle') || s.includes('status_quo')) {
    return 'response_audit';
  }
  if (s.includes('boundary') || s.includes('gateway') || s.includes('gate') || s.includes('kpi')) {
    return 'boundary_test';
  }
  if (s.includes('preempt') || s.includes('objection') || s.includes('skeptic') || s.includes('disproof')) {
    return 'preempt_objections';
  }
  if (s.includes('return') || s.includes('case') || s.includes('re_evaluate')) {
    return 'return_to_case';
  }
  if (s.includes('fork') || s.includes('diverg') || s.includes('path') || (s.includes('close') && !s.includes('talent'))) {
    return 'forked_close';
  }
  if (s.includes('talent') || s.includes('spotlight') || s.includes('job') || s.includes('deal') || s.includes('bounty') || s.includes('hiring')) {
    return 'talent_spotlight';
  }

  // Fallback by index if available
  if (fallbackIndex !== undefined && flowBlockIds && flowBlockIds[fallbackIndex]) {
    return flowBlockIds[fallbackIndex];
  }

  return 'anchor_tension';
}

export function resolveCustomBlockDescriptions(blueprint?: any): Record<string, string> {
  if (!blueprint) return {};
  const result: Record<string, string> = {};

  // 1. Direct dictionary if present
  if (blueprint.customBlockDescriptions && typeof blueprint.customBlockDescriptions === 'object') {
    Object.entries(blueprint.customBlockDescriptions).forEach(([k, v]) => {
      if (typeof v === 'string' && v.trim()) {
        const canonical = canonicalizeDefBlockId(k);
        result[canonical] = v.trim();
      }
    });
  }

  // 2. Blocks array if present
  if (Array.isArray(blueprint.blocks)) {
    blueprint.blocks.forEach((b: any) => {
      if (!b) return;
      const bKey = b.blockId || b.id || b.name || b.role || b.title;
      const bDesc = b.description || b.desc || b.customDescription;
      if (bKey && typeof bDesc === 'string' && bDesc.trim()) {
        const canonical = canonicalizeDefBlockId(String(bKey));
        if (!result[canonical]) {
          result[canonical] = bDesc.trim();
        }
      }
    });
  }

  // 3. Timeline pillars if present
  if (Array.isArray(blueprint.timelinePillars)) {
    blueprint.timelinePillars.forEach((p: any) => {
      if (!p) return;
      const pKey = p.blockId || p.id || p.role || p.name || p.title;
      const pDesc = p.desc || p.description;
      if (pKey && typeof pDesc === 'string' && pDesc.trim()) {
        const canonical = canonicalizeDefBlockId(String(pKey));
        if (!result[canonical]) {
          result[canonical] = pDesc.trim();
        }
      }
    });
  }

  return result;
}

function getActBlockIds(act: 'OPEN' | 'MEAT' | 'CLOSE', flowBlockIds: string[]): string[] {
  return flowBlockIds.filter((bId) => {
    const def = DEF_BLOCK_DEFINITIONS[bId];
    return def?.act === act;
  });
}

function formatBlockReference(blockId: string, customDescriptions?: Record<string, string>): string {
  const def = DEF_BLOCK_DEFINITIONS[blockId];
  if (!def) return `Block (${blockId})`;
  const custom = customDescriptions?.[blockId];
  const templatesDesc = def.subSlideTemplates
    .map((t, i) => `    - Slide ${i + 1} (${t.slideType}): "${t.title}" [${t.durationStr}]`)
    .join('\n');

  return `* **Block ${def.blockNumber}: ${def.name}** (${def.subtitle})
  - Default Function: ${def.description}
  - Act: ${def.actLabel} | Default Duration: ${def.defaultDuration}
${custom ? `  - Tailored Blueprint Directive (Phase 1): "${custom}"\n` : ''}  - Canonical Slide Sequence (${def.subSlideTemplates.length} slides):
${templatesDesc}`;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * LS-DOCUMENT 2a: ACT 1 — THE OPEN & TENSION (THE HOOK & REFRAME)
 * ═══════════════════════════════════════════════════════════════
 */
export function buildLSDoc2aPrompt(ctx: LivestreamPromptContext): string {
  const temporal = getCurrentTemporalAnchor();
  const flowBlocks = getFlowBlocksForFormat(ctx.format);
  const act1BlockIds = getActBlockIds('OPEN', flowBlocks);
  const customDescriptions = ctx.customBlockDescriptions || resolveCustomBlockDescriptions(ctx.appliedBlueprint);

  const articlesSummary = ctx.guidingArticles && ctx.guidingArticles.length > 0
    ? ctx.guidingArticles.slice(0, 5).map((a, i) => `  ${i + 1}. "${a.title}"${a.description ? ` — ${a.description.slice(0, 120)}...` : ''}`).join('\n')
    : '  - No anchor articles attached. Ground your analysis in primary agribusiness field evidence.';

  const blocksDoc = act1BlockIds.map((bId) => formatBlockReference(bId, customDescriptions)).join('\n\n');

  return `### 🎙️ LS-DOCUMENT 2a: ACT 1 — THE OPEN & TENSION (MASTER PROMPT)

[SYSTEM PERSONA & OPERATIONAL DIRECTIVE]
Act as the Executive Broadcast Producer & Agribusiness Slide Architect for Food Nerve Society in ${temporal}.
Your mission is to take the user's approved broadcast blueprint and draft the complete slide-by-slide visual and textual content for **ACT 1: THE OPEN**.
You are setting the narrative hook, exposing the ground-level crisis that official PR ignores, and delivering the spiky strategic pivot question that reframes the entire industry debate.

[BROADCAST METADATA BACKPACK]
- **Broadcast Working Title:** "${ctx.title || 'Agribusiness Strategic Intelligence Broadcast'}"
- **Strategic Category:** ${ctx.category.toUpperCase()} ${ctx.subcategory ? `(${ctx.subcategory})` : ''}
- **Pillar Hub:** "${ctx.hubTitle || 'Production & Capital'}"
- **Temporal Era:** ${ctx.timeframe.toUpperCase()} ERA
- **Broadcast Format:** ${(ctx.format || 'industry_teardown').toUpperCase().replace(/_/g, ' ')}
${ctx.description ? `- **Broadcast Premise:** "${ctx.description}"\n` : ''}
[ANCHOR INVESTIGATIVE INTEL]
${articlesSummary}

[ACT 1 CANONICAL DEF BLOCKS TO DRAFT]
${blocksDoc}

[DRAFTING INSTRUCTIONS FOR ACT 1 SLIDES]
1. **Slide 1 — Field Crisis Snapshot (\`media\`):**
   - Provide an intense, authentic description of the ground situation that corporate PR and sanitized reports ignore.
   - \`title\`: Punchy, operational field reality title (max 8 words).
   - \`subheadline\`: Concise secondary tension indicator (e.g., "The ground disconnect nobody is reporting on").
   - \`text\`: 2-3 vivid sentences establishing the physical scene (truck rot, port demurrage, dry season water panic, extortion points).
   - \`caption\`: Documentary caption anchoring the location and corridor.
   - \`imageUrl\`: Suggest a high-contrast documentary photojournalism visual search query or Unsplash placeholder.

2. **Slide 2 — The Killer Stat (\`highlight_card\`):**
   - Must feature a brutal, indisputable numeric figure that makes the room stop scrolling (e.g. "₦340B Lost", "42% Spoilage", "14 Informal Tolls").
   - \`stat\`: The large primary number or percentage with unit (₦, %, MT, Days).
   - \`title\`: Clear contextual label of what this metric represents.
   - \`subheadline\`: The exact financial or sovereign wealth consequence.

3. **Slide 3 — The Strategic Reframe Question (\`subheading\`):**
   - The spiky strategic pivot that destroys conventional wisdom.
   - \`convention\`: The legacy belief to cross out (e.g., "Just give farmers more fertilizer seeds").
   - \`title\`: The provocative question that reframes the bottleneck (e.g., "What if seed access was never the problem, but spatial tenure and freight cartels?").
   - \`subheadline\`: Explaining why solving the symptom leaves the structural lock intact.

[OUTPUT FORMAT]
Output cleanly formatted Markdown structured by Slide Number and Block Name.
Include:
- **Slide [X] of [Total Act 1]**
- **Block:** [Block ID & Name]
- **Slide Type:** [\`media\` | \`highlight_card\` | \`subheading\`]
- **Title:** [Headline]
- **Subheadline:** [Subheadline]
- **Data Stat / Value:** [If applicable]
- **Body / Operational Description:** [2-3 sentences]
- **Visual Description / Photo Query:** [Documentary photo cue]
- **Presenter Spoken Hook:** [Preliminary spoken opening phrase]

Do not generate code or JSON yet. Focus on maximum analytical clarity and emotional tension.`;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * LS-DOCUMENT 2b: ACT 2 — THE MEAT & DIAGNOSTIC MAP
 * ═══════════════════════════════════════════════════════════════
 */
export function buildLSDoc2bPrompt(ctx: LivestreamPromptContext): string {
  const temporal = getCurrentTemporalAnchor();
  const flowBlocks = getFlowBlocksForFormat(ctx.format);
  const act2BlockIds = getActBlockIds('MEAT', flowBlocks);
  const customDescriptions = ctx.customBlockDescriptions || resolveCustomBlockDescriptions(ctx.appliedBlueprint);

  const blocksDoc = act2BlockIds.map((bId) => formatBlockReference(bId, customDescriptions)).join('\n\n');

  return `### 🎙️ LS-DOCUMENT 2b: ACT 2 — THE MEAT & DIAGNOSTIC MAP (MASTER PROMPT)

[SYSTEM PERSONA & OPERATIONAL DIRECTIVE]
Act as the Senior Agribusiness Forensic Analyst & Presentation Architect for Food Nerve Society in ${temporal}.
You are ingesting the Act 1 Open and now drafting the heart of the broadcast: **ACT 2: THE MEAT (Diagnose, Map the System, and Defend the Thesis)**.
Your goal is to tear down the industry problem systematically: diagnose the 3 layers of failure, contrast donor fantasies against brutal operator realities, map the political economy of who profits and who bleeds, and preempt the toughest skeptic in the audience.

[BROADCAST CONTEXT]
- **Title:** "${ctx.title || 'Agribusiness Strategic Intelligence'}"
- **Category:** ${ctx.category.toUpperCase()} | **Format:** ${(ctx.format || 'industry_teardown').toUpperCase().replace(/_/g, ' ')}
- **Temporal Era:** ${ctx.timeframe.toUpperCase()} ERA

[ACT 2 DEF BLOCKS TO DRAFT FOR THIS BROADCAST FORMAT]
${blocksDoc}

[SLIDE DRAFTING SPECIFICATIONS PER ACTIVE BLOCK]
For each active block in your sequence above, draft high-density content matching our visual slide standards:

1. **Funnel System (\`funnel_system\`):**
   - \`layer1\`: Immediate field symptoms (farmgate rot within 48h, distressed sales).
   - \`layer2\`: Logistics & corridor breakdown (informal tolls, cold-chain electricity tariffs, transit delay).
   - \`layer3\`: Structural policy lock (lack of bankable collateral, unindexed pricing, port clearance monopolies).

2. **Ideal vs. Feasible (\`ideal_vs_feasible\`):**
   - \`ideal\` / \`myth\`: The well-funded NGO/Donor dream presented at global summits.
   - \`reality\` / \`fact\`: The ground fracture—why 70%+ of pilot cold rooms or processing plants fail in year 2.
   - \`workaround\` / \`solution\`: The gritty operator-tested fix that requires zero foreign donor subsidy.

3. **Scaled Burden (\`scaled_burden\`):**
   - \`stat\`: The macro sovereign metric (e.g. "2.4M Metric Tons Perish", "₦850K Lost Per Haul").
   - \`title\`: National or corridor-wide scale of the loss.
   - \`absorbedBy\`: Explicit breakdown of who takes the write-down (smallholders) vs who passes costs to consumers.

4. **Power Map (\`power_map\`):**
   - \`deciders\`: Formal regulators and state ministries holding legal clearance veto.
   - \`enforcers\`: Transport unions, checkpoint gatekeepers, and warehouse cartels dictating daily velocity.
   - \`payers\`: Downstream processors and retail consumers paying the compounding friction tax.

5. **Response Audit (\`response_audit\`):**
   - \`statusQuo\`: What the government and development banks keep funding with 0% margin improvement.
   - \`whatWorks\`: The empirical needle-mover (e.g. forward contract escrow clearing houses, containerized dry storage).
   - \`stat\`: Verifiable ROI differential (+34% net realization, 3x faster turnaround).

6. **Boundary Test (\`boundary_test\`):**
   - 4-Part Gateway: Regulatory pathway, scale velocity, exact intervention point, and 90-day verifiable KPI.

7. **Preempt Objections (\`preempt_objections\`):**
   - \`objection\`: The exact skeptical quote an institutional banker, off-taker, or trade union boss would sneer in the comments.
   - \`counter\` / \`disproof\`: Hard empirical disproof backed by operational cohort data.
   - \`stat\`: Disproof metric (e.g. "94.2% compliance rate via escrow").

[OUTPUT FORMAT]
Output cleanly formatted Markdown structured by Slide Number and DEF Block.
Ensure every slide has concrete Nigerian/African agricultural geography (Kaduna, Kano, Mile 12, Ibadan, Jebba, Apapa, etc.) and real commercial numbers.`;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * LS-DOCUMENT 2c: ACT 3 — THE CLOSE & CONVERSION
 * ═══════════════════════════════════════════════════════════════
 */
export function buildLSDoc2cPrompt(ctx: LivestreamPromptContext): string {
  const temporal = getCurrentTemporalAnchor();
  const flowBlocks = getFlowBlocksForFormat(ctx.format);
  const act3BlockIds = getActBlockIds('CLOSE', flowBlocks);
  const customDescriptions = ctx.customBlockDescriptions || resolveCustomBlockDescriptions(ctx.appliedBlueprint);

  const jobsSummary = ctx.guidingJobs && ctx.guidingJobs.length > 0
    ? ctx.guidingJobs.slice(0, 3).map((j, i) => `  ${i + 1}. Role: "${j.title}"${j.compensationOrTarget ? ` · Comp: ${j.compensationOrTarget}` : ''}${j.organizationChallenges ? ` · Challenge: ${j.organizationChallenges.slice(0, 100)}...` : ''}`).join('\n')
    : '  - Synthesize a high-leverage operator role matching the core presentation bottleneck (e.g. "Lead Corridor Logistics Dispatcher" or "Processing Aggregation Director").';

  const blocksDoc = act3BlockIds.map((bId) => formatBlockReference(bId, customDescriptions)).join('\n\n');

  return `### 🎙️ LS-DOCUMENT 2c: ACT 3 — THE CLOSE & CONVERSION (MASTER PROMPT)

[SYSTEM PERSONA & OPERATIONAL DIRECTIVE]
Act as the Chief Monetization Strategist & Stage Closer for Food Nerve Society in ${temporal}.
You are drafting the climax of the livestream: **ACT 3: THE CLOSE (Return to Case, Forked Futures & Ecosystem Spotlight)**.
A great livestream does not end with passive Q&A; it drives audience conversion. You will loop back to the opening crisis image, prove that the problem is an engineered solvable equation, split the audience between the losing status quo and the winning path, and spotlight high-impact ecosystem jobs and live bounties.

[BROADCAST CONTEXT]
- **Title:** "${ctx.title || 'Agribusiness Strategic Intelligence'}"
- **Strategic Category:** ${ctx.category.toUpperCase()}
- **Format:** ${(ctx.format || 'industry_teardown').toUpperCase().replace(/_/g, ' ')}

[LIVE ECOSYSTEM CAREERS & DEALS POOL]
${jobsSummary}

[ACT 3 DEF BLOCKS TO DRAFT]
${blocksDoc}

[SLIDE DRAFTING SPECIFICATIONS PER ACTIVE BLOCK]
1. **Return to Case (\`return_to_case\`):**
   - Must visually and rhetorically re-evaluate Slide 1's crisis imagery through the lens of the validated system.
   - \`title\`: "Re-evaluating the Opening Case: A Solved Equation".
   - \`before\`: The unquantified risk and financial hemorrhage shown at the start of the stream.
   - \`after\`: The bankable, stabilized supply chain engineered in Act 2.
   - \`subheadline\`: Turning transit spoilage into predictable commercial yield.

2. **Forked Close (\`forked_close\`):**
   - Presents the audience with two clear, diverging futures:
   - \`pathA\`: Status Quo Daily Bleed — continuing legacy practices (exact naira/dollar daily burn rate).
   - \`pathB\`: Corridor Deployment ROI — executing the forward protocol (exact 18-month return multiple).
   - \`title\`: "Two Diverging Paths for Q4".

3. **Talent & Ecosystem Spotlight (\`talent_spotlight\` / \`job\`):**
   - Connects viewers directly to verified open positions, deals, or supplier contracts in the ecosystem.
   - \`jobTitle\`: High-impact role title (e.g., "Lead Logistics Operator — Northern Corridor Rail Aggregation").
   - \`orgName\`: Verified partner organization or "FoodNerve Ecosystem Partner".
   - \`location\`: Regional operational hub (e.g. "Kaduna / Abuja Hub").
   - \`salary\` / \`compensation\`: Competitive package with equity / performance bonuses.
   - \`roleScope\`: 2 sentences outlining what the hire will execute on day 1.
   - \`applyUrl\`: Live application link (e.g., "https://foodnerve.org/talent").

[OUTPUT FORMAT]
Output formatted Markdown specifying every slide in Act 3 with complete text fields ready for scriptwriting and payload compilation.`;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * LS-DOCUMENT 3: EXECUTIVE PRESENTER NOTES & BIONIC TELEPROMPTER SCRIPT
 * ═══════════════════════════════════════════════════════════════
 */
export function buildLSDoc3Prompt(ctx: LivestreamPromptContext): string {
  const temporal = getCurrentTemporalAnchor();
  const flowBlocks = getFlowBlocksForFormat(ctx.format);
  const expectedSlides = calculateExpectedSlideCount(ctx.format);

  return `### 🎙️ LS-DOCUMENT 3: EXECUTIVE PRESENTER NOTES & BIONIC TELEPROMPTER SCRIPT (MASTER PROMPT)

[SYSTEM PERSONA & OPERATIONAL DIRECTIVE]
Act as an Elite Broadcast Speechwriter & Stage Director for Food Nerve Society in ${temporal}.
You have reviewed all drafted slides from LS-Doc 2a (The Open), LS-Doc 2b (The Meat), and LS-Doc 2c (The Close).
Your task is to write the **Verbatim Teleprompter Script** and **Executive Speaker Notes** for EVERY slide across the entire ${expectedSlides}-slide presentation.

[BROADCAST PARAMETERS]
- **Show Title:** "${ctx.title || 'Agribusiness Strategic Intelligence'}"
- **Host Persona:** Authoritative, deeply technical, urgent, conversational, operator-level insight. No consultant buzzwords. Speak directly to operators, bankers, and founders in the trenches.
- **Pacing Standard:** 130 to 145 words per minute.
- **Slide Durations:** Standard slides are 45s (approx. 90-105 spoken words); anchor slides and transitions are 60s (approx. 130 spoken words).

[REQUIRED PRESENTER SCRIPTING ELEMENTS FOR EACH SLIDE]
For each slide in the rundown:
1. **Slide Reference:** Slide Number, DEF Block ID & Slide Title.
2. **Timing Tag:** Exact target broadcast duration (\`30s\`, \`45s\`, \`60s\`, \`90s\`).
3. **Stage Directions & Cadence Cues (Bracketed in bold):**
   - \`[PAUSE 2s - LET THE STAT SINK IN]\`
   - \`[LEAN FORWARD INTO CAMERA]\`
   - \`[POINT TO NUMBER ON SCREEN]\`
   - \`[DROP TONE TO CONVERSATIONAL WHISPER]\`
   - \`[ENERGY ELEVATION]\`
4. **Verbatim Spoken Teleprompter Text:**
   - Every single word the host says out loud while this slide is on screen.
   - Use plain 8th-grade English with punchy short sentences.
   - Weave in verbal signposts: "Look at this number...", "Here is what happens when...", "Notice who isn't in this room...".
5. **Audience Chat Hook (Select slides):**
   - Callouts to live viewers: "Drop your state in the chat if you're dealing with this...", "Type 1 if your trucks have sat at this checkpoint...".
6. **Verbal Bridge:**
   - The spoken transitional sentence that cues the slide operator to trigger the next slide without awkward silence.

[OUTPUT FORMAT]
Output formatted Markdown organized by Act (Act 1 Open ➔ Act 2 Meat ➔ Act 3 Close) with complete spoken scripts for each slide.`;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * LS-DOCUMENT 4: HEADLESS CMS SLIDE PAYLOAD COMPILER (FAST INGEST RELAY)
 * ═══════════════════════════════════════════════════════════════
 */
export function buildLSDoc4Prompt(ctx: LivestreamPromptContext): string {
  const flowBlocks = getFlowBlocksForFormat(ctx.format);
  const expectedSlides = calculateExpectedSlideCount(ctx.format);

  return `### 🎙️ LS-DOCUMENT 4: HEADLESS CMS SLIDE PAYLOAD COMPILER (MASTER PROMPT)

[OPERATIONAL MISSION]
You are the Headless CMS API Bridge for Food Nerve Society.
Your sole job is to take the validated slides from LS-Doc 2a, 2b, 2c and the speaker notes from LS-Doc 3, and compile them into a **strictly valid JSON array** (or a wrapped object with metadata) that conforms to our platform's \`RundownItem\` schema.
This JSON payload will be pasted directly into the Studio Fast Ingest Terminal to instantly populate all ${expectedSlides} broadcast slides, presenter notes, and stage directions into the interactive studio canvas in one click.

[MANDATORY JSON SPECIFICATIONS]
- Output MUST be a valid JSON array of slide objects: \`[\n  {\n    ...  \n  }\n]\` OR a wrapped object \`{\n  "title": "Broadcast Title",\n  "description": "Broadcast Premise",\n  "slides": [ ... ]\n}\`.
- Do NOT include conversational commentary, intros, or markdown outside of the code block.
- Use valid JSON: all keys and strings double-quoted, no trailing commas, no undefined values.
- If a markdown code fence is used, use strictly: \`\`\`json ... \`\`\`.

[SCHEMA PER SLIDE OBJECT]
Each slide in the array contains:
\`\`\`typescript
{
  "id": string,               // e.g. "def-anchor_tension-1"
  "sourceType": "def_block",  // Always "def_block" (or "job" for talent_spotlight)
  "defBlockId": string,       // Canonical block id (e.g. "anchor_tension", "reframe_question", "funnel_system", "ideal_vs_feasible", "scaled_burden", "power_map", "response_audit", "boundary_test", "preempt_objections", "return_to_case", "forked_close", "talent_spotlight")
  "defBlockLabel": string,    // e.g. "Block 1: Anchor Tension"
  "act": "OPEN" | "MEAT" | "CLOSE",
  "slideIndex": number,       // 1-based index within this block
  "slideCount": number,       // Total slides within this block
  "originalBlockType": string,// e.g. "media" | "highlight_card" | "subheading" | "myth_fact" | "job"
  "durationStr": string,      // e.g. "45s", "60s", "90s", "2m"
  "originalContent": {
    "title": string,          // Primary slide headline
    "subheadline": string,    // Supporting subheadline
    "text"?: string,          // Main operational description / body
    "stat"?: string,          // Key numeric stat (e.g. "₦340B Lost", "42% Spoilage", "94.2%")
    "label"?: string,         // Stat description label
    "imageUrl"?: string,      // Image URL or Unsplash placeholder
    "caption"?: string,       // Photo documentary caption
    "aspectRatio"?: string,   // "16:9" | "1:1" | "9:16"

    // Block-Specific Analytical Fields (Aliases supported interchangeably):
    "convention"?: string,    // For reframe_question: legacy myth/belief crossed out
    "layer1"?: string,        // For funnel_system: Immediate farmgate symptoms
    "layer2"?: string,        // For funnel_system: Logistics & corridor breakdown
    "layer3"?: string,        // For funnel_system: Structural policy lock
    "ideal"?: string,         // For ideal_vs_feasible (or "ngoDream" / "myth")
    "reality"?: string,       // For ideal_vs_feasible (or "fracturePoint")
    "workaround"?: string,    // For ideal_vs_feasible (or "feasibleFix" / "fact")
    "absorbedBy"?: string,    // For scaled_burden (or "absorption"): who bears the write-down
    "deciders"?: string,      // For power_map: Regulators & ministries
    "enforcers"?: string,     // For power_map: Checkpoints & cartels
    "payers"?: string,        // For power_map: Processors & consumers
    "statusQuo"?: string,     // For response_audit: Failed legacy spending
    "whatWorks"?: string,     // For response_audit (or "provenMove"): Working intervention
    "metricGain"?: string,    // For response_audit: Measured ROI lift
    "pathway"?: string,       // For boundary_test (or "gate1"): Regulatory pathway
    "scale"?: string,         // For boundary_test (or "gate2"): Scale velocity
    "intervention"?: string,  // For boundary_test (or "gate3"): Aggregation point
    "kpi"?: string,           // For boundary_test (or "gate4"): 90-day target metric
    "objection"?: string,     // For preempt_objections (or "skepticQuote" / "quote")
    "counter"?: string,       // For preempt_objections (or "disproofData")
    "citation"?: string,      // For preempt_objections: Cohort data source
    "before"?: string,        // For return_to_case: Opening crisis state
    "after"?: string,         // For return_to_case: Stabilized equation state
    "pathA"?: string,         // For forked_close (or "pathACost"): Status quo burn rate
    "pathB"?: string,         // For forked_close (or "pathBROI"): Action ROI multiple
    "jobTitle"?: string,      // For talent_spotlight: High-impact operator role
    "orgName"?: string,       // For talent_spotlight: Organization name
    "location"?: string,      // For talent_spotlight: Operational corridor hub
    "salary"?: string,        // For talent_spotlight: Compensation range
    "department"?: string,    // For talent_spotlight: Department / sector
    "roleScope"?: string,     // For talent_spotlight: Key responsibilities
    "applyUrl"?: string       // For talent_spotlight: Live application URL
  },
  "speakerNotes": string      // Complete teleprompter script with [STAGE DIRECTIONS]
}
\`\`\`

[ORDER OF DEF BLOCKS TO COMPILE]
Follow the exact sequence for "${ctx.format || 'industry_teardown'}":
${flowBlocks.map((bId, idx) => `${idx + 1}. ${bId}`).join(', ')}

Compile the entire set of ${expectedSlides} slides now into clean JSON.`;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * FAST INGEST PARSER & NORMALIZATION UTILITY
 * ═══════════════════════════════════════════════════════════════
 */
export function normalizeLivestreamSlidePayload(
  rawText: string,
  ctx?: Partial<LivestreamPromptContext>
): RundownItem[] {
  if (!rawText || !rawText.trim()) return [];

  let text = rawText.replace(/\r\n/g, '\n').trim();

  // Strip wrapping markdown code fences
  text = text.replace(/^```(?:json|markdown)?\s*/i, '').replace(/\s*```$/i, '').trim();

  let jsonCandidate = '';
  const fenceMatch = rawText.match(/```(?:json|markdown)?\s*([\s\S]*?)\s*```/i);
  const candidateText = (fenceMatch ? fenceMatch[1] : text).trim();

  if ((candidateText.startsWith('{') && candidateText.endsWith('}')) || (candidateText.startsWith('[') && candidateText.endsWith(']'))) {
    jsonCandidate = candidateText;
  } else {
    const firstBrace = candidateText.indexOf('{');
    const firstBracket = candidateText.indexOf('[');
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      const lastBrace = candidateText.lastIndexOf('}');
      if (lastBrace > firstBrace) {
        jsonCandidate = candidateText.substring(firstBrace, lastBrace + 1).trim();
      }
    }
    if (!jsonCandidate && firstBracket !== -1) {
      const lastBracket = candidateText.lastIndexOf(']');
      if (lastBracket > firstBracket) {
        jsonCandidate = candidateText.substring(firstBracket, lastBracket + 1).trim();
      }
    }
  }

  if (!jsonCandidate) {
    jsonCandidate = candidateText;
  }

  // Trailing commas cleanup
  const cleanJsonCandidate = (candidate: string) => {
    return candidate.replace(/,\s*([\]}])/g, '$1');
  };

  let parsedRaw: any;
  try {
    parsedRaw = JSON.parse(cleanJsonCandidate(jsonCandidate));
  } catch (err) {
    // Attempt relaxed recovery by repairing unescaped newlines/tabs inside double-quoted strings
    try {
      const sanitized = cleanJsonCandidate(jsonCandidate).replace(
        /"([^"\\]*(?:\\.[^"\\]*)*)"/g,
        (match, inner) =>
          '"' +
          inner
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t') +
          '"'
      );
      parsedRaw = JSON.parse(sanitized);
    } catch (err2) {
      // Attempt recovery by locating array substring
      const startIdx = jsonCandidate.indexOf('[');
      const endIdx = jsonCandidate.lastIndexOf(']');
      if (startIdx !== -1 && endIdx > startIdx) {
        try {
          const arraySub = cleanJsonCandidate(jsonCandidate.substring(startIdx, endIdx + 1));
          parsedRaw = JSON.parse(arraySub);
        } catch (err3) {
          throw new Error('Could not parse JSON payload. Please ensure you copied the complete JSON array output from LS-Doc 4.');
        }
      } else {
        throw new Error('Invalid JSON format. Please verify the copied output from LS-Doc 4.');
      }
    }
  }

  let extractedMetadata: { title?: string; description?: string } | undefined;
  let rawList: any[] = [];

  if (Array.isArray(parsedRaw)) {
    rawList = parsedRaw;
  } else if (parsedRaw && typeof parsedRaw === 'object') {
    if (parsedRaw.title || parsedRaw.broadcastTitle || parsedRaw.livestreamTitle) {
      extractedMetadata = {
        title: parsedRaw.title || parsedRaw.broadcastTitle || parsedRaw.livestreamTitle,
        description: parsedRaw.description || parsedRaw.broadcastDescription || parsedRaw.livestreamDescription,
      };
    }
    if (Array.isArray(parsedRaw.slides)) rawList = parsedRaw.slides;
    else if (Array.isArray(parsedRaw.rundownBlocks)) rawList = parsedRaw.rundownBlocks;
    else if (Array.isArray(parsedRaw.rundown)) rawList = parsedRaw.rundown;
    else if (Array.isArray(parsedRaw.rundownItems)) rawList = parsedRaw.rundownItems;
    else if (Array.isArray(parsedRaw.blocks)) rawList = parsedRaw.blocks;
    else if (Array.isArray(parsedRaw.items)) rawList = parsedRaw.items;
    else if (Array.isArray(parsedRaw.payload)) rawList = parsedRaw.payload;
    else rawList = [parsedRaw];
  }

  if (rawList.length === 0) return [];

  const flowBlocks = getFlowBlocksForFormat(ctx?.format);
  const results: RundownItem[] = [];

  rawList.forEach((item: any, idx: number) => {
    if (!item || typeof item !== 'object') return;

    // Resolve defBlockId canonically
    const rawBlockId = item.defBlockId || item.blockId || item.id?.split('-')?.[1] || item.type;
    const defBlockId = canonicalizeDefBlockId(rawBlockId, idx, flowBlocks);
    const def = DEF_BLOCK_DEFINITIONS[defBlockId];

    const act: 'OPEN' | 'MEAT' | 'CLOSE' = item.act || def?.act || (idx < 3 ? 'OPEN' : idx > rawList.length - 4 ? 'CLOSE' : 'MEAT');
    const isJob = defBlockId === 'talent_spotlight' || item.sourceType === 'job' || Boolean(item.originalContent?.jobTitle) || Boolean(item.jobTitle);

    // Parse stringified originalContent if needed
    let rawContent = item.originalContent;
    if (typeof rawContent === 'string') {
      try {
        rawContent = JSON.parse(cleanJsonCandidate(rawContent));
      } catch {}
    }
    const c = typeof rawContent === 'object' && rawContent !== null ? rawContent : {};

    // Helper to unwrap single element array if present
    const unwrap = (val: any) => {
      if (Array.isArray(val) && val.length === 1 && typeof val[0] === 'string') {
        return val[0];
      }
      return val;
    };

    // Extract fields checking c first, then fallback to top-level item
    const title = unwrap(c.title || item.title || item.headline || (def ? def.name : `Slide ${idx + 1}`));
    const subheadline = unwrap(c.subheadline || item.subheadline || item.subtitle || c.description || item.description || '');
    const text = unwrap(c.text || item.text || c.description || item.description || '');
    const stat = unwrap(c.stat || item.stat || c.dataValue || item.dataValue || c.metric || item.metric || '');
    const label = unwrap(c.label || item.label || c.statLabel || item.statLabel || subheadline || '');
    const imageUrl = unwrap(c.imageUrl || item.imageUrl || c.image || item.image || '');
    const caption = unwrap(c.caption || item.caption || '');
    const aspectRatio = unwrap(c.aspectRatio || item.aspectRatio || '16:9');
    const convention = unwrap(c.convention || item.convention || '');

    // Funnel layers
    const layer1 = unwrap(c.layer1 || item.layer1 || '');
    const layer2 = unwrap(c.layer2 || item.layer2 || '');
    const layer3 = unwrap(c.layer3 || item.layer3 || '');

    // Ideal vs Feasible
    const ideal = unwrap(c.ngoDream || item.ngoDream || c.myth || item.myth || c.ideal || item.ideal || '');
    const reality = unwrap(c.fracturePoint || item.fracturePoint || c.reality || item.reality || c.fracture || item.fracture || '');
    const workaround = unwrap(c.feasibleFix || item.feasibleFix || c.fact || item.fact || c.workaround || item.workaround || '');

    // Scaled burden
    const absorption = unwrap(c.absorption || item.absorption || c.absorbedBy || item.absorbedBy || subheadline || '');

    // Power map
    const deciders = unwrap(c.deciders || item.deciders || '');
    const enforcers = unwrap(c.enforcers || item.enforcers || '');
    const payers = unwrap(c.payers || item.payers || '');

    // Response audit
    const statusQuo = unwrap(c.statusQuo || item.statusQuo || '');
    const whatWorks = unwrap(c.provenMove || item.provenMove || c.whatWorks || item.whatWorks || '');
    const metricGain = unwrap(c.metricGain || item.metricGain || stat || '');

    // Boundary test
    const gate1 = unwrap(c.gate1 || item.gate1 || c.pathway || item.pathway || '');
    const gate2 = unwrap(c.gate2 || item.gate2 || c.scale || item.scale || '');
    const gate3 = unwrap(c.gate3 || item.gate3 || c.intervention || item.intervention || '');
    const gate4 = unwrap(c.gate4 || item.gate4 || c.kpi || item.kpi || '');

    // Preempt objections
    const skepticQuote = unwrap(c.skepticQuote || item.skepticQuote || c.objection || item.objection || c.quote || item.quote || '');
    const disproofData = unwrap(c.disproofData || item.disproofData || c.counter || item.counter || '');
    const citation = unwrap(c.citation || item.citation || '');

    // Forked close
    const pathA = unwrap(c.pathACost || item.pathACost || c.pathA || item.pathA || '');
    const pathB = unwrap(c.pathBROI || item.pathBROI || c.pathB || item.pathB || '');

    // Return to case
    const before = unwrap(c.before || item.before || '');
    const after = unwrap(c.after || item.after || '');

    // Talent spotlight
    const jobTitle = unwrap(c.jobTitle || item.jobTitle || title || '');
    const orgName = unwrap(c.orgName || item.orgName || c.organization || item.organization || 'FoodNerve Ecosystem Partner');
    const location = unwrap(c.location || item.location || 'Northern Corridor (Hybrid)');
    const salary = unwrap(c.salary || item.salary || c.compensation || item.compensation || '');
    const department = unwrap(c.department || item.department || 'Operations & Logistics');
    const roleScope = unwrap(c.roleScope || item.roleScope || '');
    const applyUrl = unwrap(c.applyUrl || item.applyUrl || c.applicationUrl || item.applicationUrl || 'https://foodnerve.org/talent');

    const originalContent: Record<string, any> = {
      ...c,
      title,
      subheadline,
      text,
      stat,
      label,
      imageUrl,
      caption,
      aspectRatio,
      description: text || subheadline,
    };

    if (convention) originalContent.convention = convention;
    if (layer1) originalContent.layer1 = layer1;
    if (layer2) originalContent.layer2 = layer2;
    if (layer3) originalContent.layer3 = layer3;

    // Bi-directional mapping for Ideal vs Feasible
    if (ideal) {
      originalContent.ngoDream = ideal;
      originalContent.myth = ideal;
      originalContent.ideal = ideal;
    }
    if (reality) {
      originalContent.fracturePoint = reality;
      originalContent.reality = reality;
    }
    if (workaround) {
      originalContent.feasibleFix = workaround;
      originalContent.fact = workaround;
      originalContent.workaround = workaround;
    }

    // Bi-directional mapping for Scaled Burden
    if (absorption) {
      originalContent.absorption = absorption;
      originalContent.absorbedBy = absorption;
    }

    // Power map
    if (deciders) originalContent.deciders = deciders;
    if (enforcers) originalContent.enforcers = enforcers;
    if (payers) originalContent.payers = payers;

    // Bi-directional mapping for Response Audit
    if (statusQuo) originalContent.statusQuo = statusQuo;
    if (whatWorks) {
      originalContent.provenMove = whatWorks;
      originalContent.whatWorks = whatWorks;
    }
    if (metricGain) {
      originalContent.metricGain = metricGain;
      originalContent.stat = originalContent.stat || metricGain;
    }

    // Bi-directional mapping for Boundary Test
    if (gate1) {
      originalContent.gate1 = gate1;
      originalContent.pathway = gate1;
    }
    if (gate2) {
      originalContent.gate2 = gate2;
      originalContent.scale = gate2;
    }
    if (gate3) {
      originalContent.gate3 = gate3;
      originalContent.intervention = gate3;
    }
    if (gate4) {
      originalContent.gate4 = gate4;
      originalContent.kpi = gate4;
    }

    // Bi-directional mapping for Preempt Objections
    if (skepticQuote) {
      originalContent.skepticQuote = skepticQuote;
      originalContent.objection = skepticQuote;
      originalContent.quote = skepticQuote;
    }
    if (disproofData) {
      originalContent.disproofData = disproofData;
      originalContent.counter = disproofData;
    }
    if (citation) originalContent.citation = citation;

    // Return to case
    if (before) originalContent.before = before;
    if (after) originalContent.after = after;

    // Bi-directional mapping for Forked Close
    if (pathA) {
      originalContent.pathACost = pathA;
      originalContent.pathA = pathA;
    }
    if (pathB) {
      originalContent.pathBROI = pathB;
      originalContent.pathB = pathB;
    }

    // Talent spotlight
    if (isJob || defBlockId === 'talent_spotlight') {
      originalContent.jobTitle = jobTitle;
      originalContent.orgName = orgName;
      originalContent.location = location;
      originalContent.salary = salary;
      originalContent.department = department;
      if (roleScope) originalContent.roleScope = roleScope;
      originalContent.applyUrl = applyUrl;
    }

    // Only assign role if explicitly provided or for act
    if (item.sourceType === 'act' || item.role) {
      originalContent.role = item.role || (def ? `Block ${def.blockNumber}: ${def.name}` : `Act ${idx + 1}`);
    }

    const blockType = item.originalBlockType || item.slideType || (isJob ? 'job' : def?.subSlideTemplates?.[0]?.slideType || 'subheading');
    const duration = item.durationStr || item.duration || '45s';
    const notes = unwrap(item.speakerNotes || item.notes || item.script || '');

    const normalizedItem: RundownItem = {
      id: item.id || `def-${defBlockId}-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      sourceType: isJob ? 'job' : 'def_block',
      defBlockId,
      defBlockLabel: item.defBlockLabel || (def ? `Block ${def.blockNumber}: ${def.name}` : `Block ${idx + 1}`),
      slideIndex: item.slideIndex || (idx + 1),
      slideCount: item.slideCount || 1,
      act,
      originalBlockType: blockType,
      originalContent,
      speakerNotes: notes,
      durationStr: duration,
    };

    results.push(normalizedItem);
  });

  if (extractedMetadata) {
    (results as any).metadata = extractedMetadata;
  }

  return results;
}
