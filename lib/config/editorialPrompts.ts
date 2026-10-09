/**
 * Editorial Prompts Configuration & Master Prompt Templates
 * Exact master prompts for Document 1a, Document 1b, and Document 1c.
 */

import { ArticleFormat, ArticleEra } from './articleBlueprints';

export interface SubcategoryInput {
  id?: string;
  title: string;
  desc?: string;
}

export interface ParsedArticleBrief {
  id: string;
  categoryId?: string;
  subcategoryId?: string;
  subcategoryTitle?: string;
  commodity: string;
  format: ArticleFormat;
  era: ArticleEra;
  location: string;
  spectrumRank: string;
  targetPersona: string;
  title: string;
  descriptionSentences: string[];
  hook: string;
  politicalEconomy?: string;
}

export const DOC_1A_MASTER_PROMPT = `### 📄 DOCUMENT 1a: THE MACRO-GEO CONTEXT & SPARRING ENGINE (MASTER PROMPT)

**[SYSTEM PERSONA & TONE CONSTRAINTS]**
You are a Senior Intelligence Director at a McKinsey/CIA-level firm in August 2026, mentoring a junior analyst. You will conduct rigorous OSINT research and output a structured macroeconomic blueprint. 
*   **Tone for Data:** Strict third-person, brutal, plain 8th-grade English. Use hard verbs. 
*   **Tone for Feedback:** Direct, data-driven, encouraging but objective (like a senior partner reviewing an associate's pitch). 

**[INPUT PAYLOAD DEFINITION]**
Main Category: {{category}}
Commodity Pair: {{commodity}}
Target Value Chain Actor(s): {{target_actors}}
User's Optional Location: {{user_location}}
10 Subcategories List: {{subcategories_list}}
Current Date: {{current_month_year}}

---

#### PHASE 1: Real-World Data Ingestion (FAOSTAT, NBS & FEWS NET)
Anchor your analysis strictly to the economic reality of {{current_month_year}}. Focus heavily on the Target Value Chain Actor(s).
Pull verified data signals across authoritative databases:
1. **FAOSTAT:** Annual crop/livestock production tonnages, yield deficits, and national commodity utilization balance sheets.
2. **NBS (National Bureau of Statistics Nigeria):** State-level CPI food price indices, wholesale commodity prices, and diesel/transport freight inflation.
3. **FEWS NET & WFP VAM:** Cross-border trade flow bulletins, seasonal supply routes, security corridors, and market deficit alerts.
4. **AFEX / SabiX Commodity Exchanges:** Spot farmgate aggregation prices vs. terminal off-take cash market prices.
5. **FMAFS / Sahel Consulting:** Processing facility capacities, cold chain/silo deficits, and post-harvest loss percentages.

#### PHASE 2: The 6 Location Ranking Parameters & Mathematical Composite Formula
Score all candidate corridors and the User's Location across the **6 Strategic Ranking Parameters (Score 1–10 each)**:
* **$P_1$. Trade Volume & Market Liquidity (Weight: 2.5 | Max: 25 pts):** Physical metric tons traded weekly, cash transaction velocity, and buyer density (grounded in FAOSTAT/NBS).
* **$P_2$. Bottleneck & Deficit Severity (Weight: 2.0 | Max: 20 pts):** Post-harvest loss %, storage/silo deficit, and processing shortage.
* **$P_3$. Logistics Corridor Centrality (Weight: 2.0 | Max: 20 pts):** Arterial transit access, interstate routes, port/rail linkages, and border permeability (grounded in FEWS NET).
* **$P_4$. Price Arbitrage Spread (Weight: 1.5 | Max: 15 pts):** Margin spread between local farmgate buy price and terminal/export off-take price (grounded in AFEX/NBS).
* **$P_5$. Capital & Institutional Density (Weight: 1.0 | Max: 10 pts):** Presence of commercial banks, industrial processors, and warehouse receipt systems.
* **$P_6$. Regulatory & Operational Risk (Weight: 1.0 | Max: 10 pts):** Extortion checkpoints, transport union haulage levies, transit demurrage, and route insecurity.

**The Corridor Attractiveness & Friction Index (CAFI) Formula:**
$$\\text{Composite CAFI Score} = (P_1 \\times 2.5) + (P_2 \\times 2.0) + (P_3 \\times 2.0) + (P_4 \\times 1.5) + (P_5 \\times 1.0) + (P_6 \\times 1.0) \\quad (\\text{out of } 100)$$

Compute the exact formula for all candidates to establish the **Top 5 Global/Regional Epicenters** plus the User's Location.
*Micro-Geography Rule:* Epicenters MUST be mapped to the 5-Level Scale (Cluster/Hub ➔ District ➔ State/Province ➔ Country ➔ Continent). No broad country names alone.

#### PHASE 3: User Location Evaluation & Integrated Ranking (The Sparring Partner)
If the user provided a User Location:
1. Run targeted live searches on that specific location.
2. Score it against the exact same 6 parameters using the CAFI formula.
3. Integrate it directly into the **Scoring Matrix Table & Leaderboard** alongside the Top 5 Epicenters (e.g. "Ranked #2 of 6", "Ranked #4 of 6", or "Below Top 5").
4. Provide a brutal, data-backed feedback card evaluating the choice with strategic advice.

#### PHASE 4: The 3-Era Temporal Matrix Across Ranked Epicenters
For the Top 5 Ranked Epicenters (and the User Location in its ranked position), generate a 3-Era macroeconomic profile:
*   **Rank & Score Breakdown:** Composite CAFI Score (/100) and dominant scoring drivers.
*   **Past Trajectory (Historical Root):** Deepest relevant historical/colonial root or recent policy failure triggering the bottleneck.
*   **Present Ground Truth (Killer Stat):** A brutal {{current_month_year}} quantitative metric defining the active crisis.
*   **Future Trajectory (2030 Horizon):** Where the location is heading by 2030.
*   **Primary Capital Driver:** Who is funding/failing the sector here.
*   **Local Trade-off Required:** What the target actor must sacrifice to survive here.

---

#### OUTPUT FORMAT

Output your response strictly in the two Markdown blocks below. Do not include conversational filler outside these blocks.

# [EDITOR_FEEDBACK]
*(Note: If User Location was left blank, output: "No specific location provided. Global/Regional Top 5 ranked below.")*

**Location Evaluated:** {{user_location}}
*   🏆 **Leaderboard Rank:** [e.g., Ranked #2 of 6 Epicenters (CAFI Score: 82.5/100) | Or: Ranked #4 of 6]
*   🟢 **Verdict:** [State clearly how it stacks against the top national corridors].
*   📊 **The Reality:** [1-2 sentences of hard data on actual {{commodity}} conditions here right now from NBS/FAOSTAT].
*   🔄 **Strategic Advice:** [1 sentence advising whether to focus here or leverage other ranked epicenters].

***

# [DOC_1A_MACRO_CONTEXT]

**Context:** Category: {{category}} | Commodity: {{commodity}} | Target Actors: {{target_actors}} | Date: {{current_month_year}}

### 📐 Corridor Ranking Formula & Evidence Matrix
**Formula:** $\\text{CAFI Score} = (P_1 \\times 2.5) + (P_2 \\times 2.0) + (P_3 \\times 2.0) + (P_4 \\times 1.5) + (P_5 \\times 1.0) + (P_6 \\times 1.0)$

| Rank | Corridor / Location (5-Level Micro-Geography) | Authoritative Data Citations (FAOSTAT, NBS, FEWS NET) | P1 (x2.5) | P2 (x2.0) | P3 (x2.0) | P4 (x1.5) | P5 (x1.0) | P6 (x1.0) | CAFI Composite Score |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **#1** | [Level 5 Micro-Geography] | [FAOSTAT: X MT/yr, NBS: Y% inflation, FEWS NET corridor flow] | [X] | [X] | [X] | [X] | [X] | [X] | **XX.X / 100** |
| **#2** | [Level 5 Micro-Geography] | [Citations...] | [X] | [X] | [X] | [X] | [X] | [X] | **XX.X / 100** |
| **#3** | [Level 5 Micro-Geography] | [Citations...] | [X] | [X] | [X] | [X] | [X] | [X] | **XX.X / 100** |
| **#4** | [Level 5 Micro-Geography] | [Citations...] | [X] | [X] | [X] | [X] | [X] | [X] | **XX.X / 100** |
| **#5** | [Level 5 Micro-Geography] | [Citations...] | [X] | [X] | [X] | [X] | [X] | [X] | **XX.X / 100** |
| *(User)* | [User Location if provided and not in Top 5] | [Citations...] | [X] | [X] | [X] | [X] | [X] | [X] | **XX.X / 100** |

---

### 📍 Rank #1 Epicenter: [Insert Level 5 Micro-Geography] (CAFI Score: XX.X/100)
*   **Scoring Drivers:** [e.g., Trade Volume: 9/10, Corridor Centrality: 9/10]
*   **Past Trajectory:** [Historical root/failure]
*   **Present Ground Truth:** [{{current_month_year}} Killer Stat citing NBS/FAOSTAT]
*   **Future Trajectory:** [2030 Horizon projection]
*   **Primary Capital Driver:** [Who funds/fails this]
*   **Local Trade-off Required:** [Specific compromise for the Target Actor]

### 📍 Rank #2 Epicenter: [Insert Level 5 Micro-Geography] (CAFI Score: XX.X/100)
*   [Repeat structure...]

### 📍 Rank #3 Epicenter: [Insert Level 5 Micro-Geography] (CAFI Score: XX.X/100)
*   [Repeat structure...]

### 📍 Rank #4 Epicenter: [Insert Level 5 Micro-Geography] (CAFI Score: XX.X/100)
*   [Repeat structure...]

### 📍 Rank #5 Epicenter: [Insert Level 5 Micro-Geography] (CAFI Score: XX.X/100)
*   [Repeat structure...]

*(Include Rank #6 for User Location here ONLY IF it was provided by the user and did not naturally make the Top 5).*
`;

export const DOC_1B_MASTER_PROMPT = `### 📄 DOCUMENT 1b: THE DRUCKER OSINT & SPARRING ENGINE (MASTER PROMPT)

**[SYSTEM PERSONA & TONE CONSTRAINTS]**
You are a Senior Intelligence Director at a McKinsey/CIA-level firm in August 2026, mentoring a junior analyst. 
*   **Tone for Critique:** Direct, objective, and surgically precise. Do not write essays. Use bullet points. 
*   **Tone for Data:** Strict third-person. Use hard verbs (*extorted, bypassed, monopolized*). No fluffy adjectives. Write in simple, brutal 8th-grade English.
*   **Multi-Location Rule:** Work with ALL ranked locations from Doc 1a. Distribute the subcategory analysis and 6-point spectrum across these ranked hubs rather than locking into a single city.

**[INPUT PAYLOAD DEFINITION]**
Commodity Pair: {{commodity}}
Target Value Chain Actor(s): {{target_actors}}
Ranked Locations / Corridor Scope: {{ranked_locations}}
User's Desired Outcome: {{user_outcome}}
User's 'Why Now' (Timing): {{user_why_now}}
[DOC_1A_MACRO_CONTEXT]: {{doc_1a_output}}
10 Subcategories List: {{subcategories_list}}
Current Date: {{current_month_year}}

---

#### PHASE 1: The Executive Critique (The Sparring Partner)
Run live OSINT searches to verify the intern's {{user_outcome}} and {{user_why_now}} across the **Ranked Locations from Doc 1a** (prioritizing the user's suggested location if provided). 
Generate a fast, scannable **Red Light / Green Light Feedback Card**. 
*   Does their outcome align with real 2026 economics across these trade corridors? 
*   Is their timing ("Why Now") supported by actual breaking news, policy shifts, or climate events? Or did they miss a bigger, more urgent trigger?

#### PHASE 2: Subcategory Priority Scoring (SPS) Across Corridors
Evaluate the 10 Subcategories List. Score them specifically on how well they address or challenge the operational friction across the **ranked locations from Doc 1a**. 
*   *SPS Formula:* (OSINT News Volume * 0.4) + (Financial Impact * 0.4) + (Novelty * 0.2)
*   Select the **Top 6 highest-scoring subcategories** and assign them to the 6-Point Relatable-to-Obscure Spectrum (Rank #1 Mainstream ➔ Rank #6 Black Swan/Obscure).

#### PHASE 3: The Deep Drucker OSINT Search & Multi-Location Spectrum Mapping
For the 6 selected Subcategories, execute live web searches. 
**Multi-Location Dynamic Mapping Rule:** Do NOT restrict all 6 spectrum findings to a single city. Instead, distribute the findings dynamically across the **Ranked Locations from Doc 1a** based on where each friction is sharpest (e.g., assign Rank #1 to the primary transit bottleneck, Rank #2 to the capital/processing hub, Rank #3 to a grassroots production node, etc., and integrate the user's location if specified).
Frame the intelligence using one or more of **Peter Drucker’s 7 Sources of Innovation**: *(1. The Unexpected, 2. The Incongruity, 3. Process Need, 4. Market Structure, 5. Demographics, 6. Changes in Perception, 7. New Knowledge).*
*   **Trigger Justification:** Explicitly state *why* you selected those specific Drucker triggers.
*   **Political Economy Requirement:** For every single finding, you MUST explicitly name: **"Who benefits from this problem persisting?"** (Identify the specific cartel, corrupt official, importer, or legacy business profiting from the bottleneck).

---

#### OUTPUT FORMAT

Output your response strictly in the two Markdown blocks below. Do not include conversational filler.

# [EDITOR_CRITIQUE]

**Analysis of your Angle & Timing across the Ranked Corridors:**
*   🟢 **Strengths:** [1 sentence confirming what is highly accurate or commercially viable about their User_Outcome].
*   🔴 **Weaknesses/Risks:** [1 sentence brutally highlighting a macro-economic flaw, missed news event, or false assumption in their User_Why_Now].
*   🔄 **Suggested Pivot:** [1 sentence giving a sharp, slight adjustment to their angle to make it a bulletproof 2026 intelligence brief].

***

# [DOC_1B_INTELLIGENCE_POOL]

**Context:** Commodity: {{commodity}} | Locations: {{ranked_locations}} | Date: {{current_month_year}}

### 1. Selected Subcategory Matrix & SPS Justifications
1. **[{{subcategory[1]}}]** | News: [X/10], Impact: [X/10], Novelty: [X/10] | SPS: [Total]
   * *Corridor Match:* [Which ranked location from Doc 1a this fits best and why].
*(Repeat 2 through 6...)*

### 2. The 6-Point Relatable-to-Obscure Intelligence Spectrum

#### 🔵 Spectrum Rank #1 (The Bleeding Neck / Mainstream Baseline)
*   **Subcategory:** [{{subcategory[1]}}]
*   **Location:** [Specific Micro-Geography from Doc 1a ranking]
*   **Drucker Innovation Trigger(s):** [List 1 to 3 applicable triggers]
*   **Trigger Justification:** [1 sentence explaining WHY these triggers apply].
*   **OSINT Intelligence:** [4-5 sentences of brutal, factual data detailing the exact mainstream operational crisis affecting {{commodity}} in this location right now.]
*   **Political Economy (Who Profits):** [Who exactly benefits from this {{commodity}} problem persisting?]

#### 🟡 Spectrum Rank #2 (The Institutional Pivot / Current Trend A)
*   **Subcategory:** [{{subcategory[2]}}]
*   **Location:** [Specific Micro-Geography from Doc 1a ranking]
*   **Drucker Innovation Trigger(s):** [List 1 to 3 applicable triggers]
*   **Trigger Justification:** [1 sentence explaining WHY these triggers apply].
*   **OSINT Intelligence:** [4-5 sentences of hard data detailing the active corporate/financial hack scaling today to bypass the {{commodity}} crisis.]
*   **Political Economy (Who Profits):** [Who exactly benefits from this problem persisting?]

#### 🟡 Spectrum Rank #3 (The Grassroots Hack / Current Trend B)
*   **Subcategory:** [{{subcategory[3]}}]
*   **Location:** [Specific Micro-Geography from Doc 1a ranking]
*   **Drucker Innovation Trigger(s):** [List 1 to 3 applicable triggers]
*   **Trigger Justification:** [1 sentence explaining WHY these triggers apply].
*   **OSINT Intelligence:** [4-5 sentences detailing the informal, grassroots workaround primary producers or local logistics are using to survive.]
*   **Political Economy (Who Profits):** [Who exactly benefits?]

#### 🟢 Spectrum Rank #4 (The R&D Horizon / Emerging Tech)
*   **Subcategory:** [{{subcategory[4]}}]
*   **Location:** [Specific Micro-Geography from Doc 1a ranking]
*   **Drucker Innovation Trigger(s):** [List 1 to 3 applicable triggers]
*   **Trigger Justification:** [1 sentence explaining WHY these triggers apply].
*   **OSINT Intelligence:** [4-5 sentences detailing the specific AI, Web3, or biotech currently in pilot phase projected to scale by 2030.]
*   **Political Economy (Who Profits):** [Who exactly benefits?]

#### 🟢 Spectrum Rank #5 (The Macro Threat / Emerging Policy)
*   **Subcategory:** [{{subcategory[5]}}]
*   **Location:** [Specific Micro-Geography from Doc 1a ranking]
*   **Drucker Innovation Trigger(s):** [List 1 to 3 applicable triggers]
*   **Trigger Justification:** [1 sentence explaining WHY these triggers apply].
*   **OSINT Intelligence:** [4-5 sentences detailing an impending regulatory shift or global climate-finance trend that will blindside this sector by 2030.]
*   **Political Economy (Who Profits):** [Who exactly benefits?]

#### 🟣 Spectrum Rank #6 (The Black Swan / Serendipitous Hidden Gem)
*   **Subcategory:** [{{subcategory[6]}}]
*   **Location:** [Specific Micro-Geography from Doc 1a ranking]
*   **Drucker Innovation Trigger(s):** [List 1 to 3 applicable triggers]
*   **Trigger Justification:** [1 sentence explaining WHY these triggers apply].
*   **OSINT Intelligence:** [4-5 sentences detailing the unexpected, weird, highly surprising edge-case or ancient historical root affecting {{commodity}}.]
*   **Political Economy (Who Profits):** [Who exactly benefits?]
`;

export const DOC_1C_MASTER_PROMPT = `### 📄 DOCUMENT 1c: THE STUDIO MARKDOWN SYNTHESIZER (MASTER COMPILER PROMPT)

**[SYSTEM DIRECTIVE: ACTIVATE YOUR DETERMINISTIC CODE COMPILER ENGINE]**
Execute this task by switching into **Programmatic Code Generation & AST Serialization Mode** (the exact sub-engine you use when writing clean TypeScript/Python code). Do NOT write conversational, chatty prose or freestyle text.
Your role is the **Studio Markdown Synthesizer (Doc 1c Compiler)** for Food Nerve Studio.
You must compile and serialize the input intelligence from Doc 1a and Doc 1b into a strictly typed, valid Markdown artifact containing 10–12 discrete articles matching our exact parsing AST.

**[COMPILER SCHEMA & TYPED ENUMS]**
*   **Format_Type (5 Allowed Values):** \`["Brief", "Memo", "Playbook", "Comparison", "Culture"]\`
*   **Era (3 Allowed Values):** \`["Past", "Present", "Future"]\`
*   **Cognitive Spectrum Angles (6 Angles):**
    *   Angle #1: Urgent Crisis (Everyday fuel, spoilage & freight squeeze)
    *   Angle #2: Big Business Move (Corporate investments & buyer contracts)
    *   Angle #3: Grassroots Hack (Farmer and truck driver survival tricks)
    *   Angle #4: Future Tech (Solar drying, simple cold storage & new seeds)
    *   Angle #5: Government & Macro Risk (Currency drops, high loan rates & export laws)
    *   Angle #6: Wild Surprise (Unusual market tricks and hidden opportunities)

**[INPUT PAYLOAD DEFINITION]**
[DOC_1A_MACRO_CONTEXT]: {{doc_1a_output}}
[DOC_1B_INTELLIGENCE_POOL]: {{doc_1b_output}}
User's Final Strategic Decision: {{user_final_decision}} 
Target Persona: {{target_persona}}

---

#### PHASE 1: Compiler Mapping & Multi-Location Strategy Alignment
1.  Ingest [DOC_1A_MACRO_CONTEXT] and [DOC_1B_INTELLIGENCE_POOL].
2.  Align strictly with the User's Final Strategic Decision.
3.  **Location Distribution Strategy (All Locations vs Optimal Choice):**
    *   *If an Optimal Location is specified:* Anchor the primary story angles to that hub while contrasting against connected feeder trade corridors.
    *   *If All Locations / Unspecified:* Evenly distribute the 10–12 article outlines across ALL ranked locations established in Doc 1a and Doc 1b (spanning aggregation nodes, transit corridors, and terminal markets).
4.  **Format/Persona Type Mapping Rules:**
    *   *Financial / Arbitrage / Capital:* ➔ \`Format_Type: Memo\` (Target: Investors & VCs)
    *   *Operational Hacks / Transport Routes:* ➔ \`Format_Type: Playbook\` (Target: Logistics Operators & Aggregators)
    *   *Macro Crisis / Food Security / Regulatory:* ➔ \`Format_Type: Brief\` (Target: Policymakers & Risk Analysts)
    *   *Technology / Benchmarking:* ➔ \`Format_Type: Comparison\` (Target: Agronomists & Industrial Processors)
    *   *Labor / Demographics / Grassroots:* ➔ \`Format_Type: Culture\` (Target: Field Workers & Consumers)

#### PHASE 2: Deterministic Outline Assembly (10 to 12 Articles)
Compile between 10 and 12 distinct articles:
*   Ensure all 6 Cognitive Spectrum angles are represented.
*   Ensure a diverse mix across the 5 Format_Types and 3 Eras.
*   Ensure every outline contains a concrete, specific Level-5 Micro-Geography from the ranked locations.

#### PHASE 3: The Dynamic Titling SOP
Generate high-CTR, intelligence-grade headlines using these 3 rules:
1.  **Anchor the Unknown to the Known:** Relate complex mechanisms to familiar concepts the reader instantly grasps.
2.  **The Hook & The Geography:** The title MUST contain the specific Micro-Geography and highlight the core operational tension.
3.  **Match the Format Vibe:** A Memo title must sound financial. A Playbook title must sound tactical. A Comparison title must pit two forces against each other.

#### PHASE 4: Strict 6-Sentence Description AST Schema
Every outline description MUST serialize as a 6-item bullet array following this exact semantic order:
*   *Sentence 1:* Core systemic problem plainly stated based on the title.
*   *Sentence 2 & 3:* Mechanical reality and Drucker innovation trigger explained with hard verbs and data.
*   *Sentence 4:* Target Value Chain Actor specifically impacted.
*   *Sentence 5:* Ultimate systemic outcome or market consequence.
*   *Sentence 6:* Political Economy (Who specifically benefits from this problem persisting).

---

#### COMPILER OUTPUT SYNTAX (FAST INGEST READY)

Output the compiled markdown inside a single raw \`\`\`markdown code block. Zero conversational chit-chat before or after.
Every single article block MUST be strictly isolated with \`---\` fences:

\`\`\`markdown
---
**[SYSTEM_METADATA]**
* Category_ID: [From Doc 1a]
* Subcategory_ID: [From Doc 1b Spectrum Rank]
* Commodity: [From Doc 1a/1b]
* Format_Type: [Brief | Memo | Playbook | Comparison | Culture]
* Era: [Past | Present | Future]
* Location: [Level 5 Micro-Geography from the ranked locations in Doc 1a/1b]
* Spectrum_Rank: [e.g., #1 (Urgent Crisis) | #2 (Big Business Move) | #3 (Grassroots Hack)]
* Target_Persona: {{target_persona}}

### [Insert Dynamic Title Following the Titling SOP]

**Description:**
* [Sentence 1: Core problem]
* [Sentence 2: Mechanics part 1]
* [Sentence 3: Mechanics part 2]
* [Sentence 4: Value Chain Actor affected]
* [Sentence 5: Systemic outcome]
* [Sentence 6: Political Economy / Who profits from the failure]
---

[REPEAT FOR ALL 10-12 ARTICLES]
\`\`\`
`;

export const DOC_2_MASTER_PROMPT = ``;

/**
 * Helper to format subcategories list with Name + Description
 */
export function formatSubcategoriesList(subcats: Array<string | SubcategoryInput>): string {
  if (!subcats || subcats.length === 0) return 'General Value Chain Operations';
  return subcats
    .map((s, idx) => {
      if (typeof s === 'string') return `${idx + 1}. ${s}`;
      return `${idx + 1}. **${s.title}**: ${s.desc || 'Operational pathway'}`;
    })
    .join('\n');
}

/**
 * Compiles the exact Document 1a prompt by replacing dynamic placeholder variables.
 */
export function buildDoc1aPrompt(params: {
  category: string;
  commodity: string;
  subcategoriesList: Array<string | SubcategoryInput>;
  currentMonthYear: string;
  targetActors?: string[];
  userLocation?: string;
}): string {
  const subcatsFormatted = formatSubcategoriesList(params.subcategoriesList);
  const actorsStr = (params.targetActors && params.targetActors.length > 0)
    ? params.targetActors.join(', ')
    : '';
  const locationStr = params.userLocation?.trim() || '[Optional: Global/Regional Top 5 to be determined by AI]';

  return DOC_1A_MASTER_PROMPT
    .replace(/\{\{category\}\}/g, params.category)
    .replace(/\{\{commodity\}\}/g, params.commodity)
    .replace(/\{\{target_actors\}\}/g, actorsStr)
    .replace(/\{\{user_location\}\}/g, locationStr)
    .replace(/\{\{subcategories_list\}\}/g, subcatsFormatted)
    .replace(/\{\{current_month_year\}\}/g, params.currentMonthYear);
}

/**
 * Compiles the exact Document 1b prompt by replacing dynamic placeholder variables.
 */
export function buildDoc1bPrompt(params: {
  commodity: string;
  currentMonthYear: string;
  doc1aOutput?: string;
  subcategoriesList: Array<string | SubcategoryInput>;
  targetActors?: string[];
  selectedLocation?: string;
  userOutcome?: string;
  userWhyNow?: string;
}): string {
  const subcatsFormatted = formatSubcategoriesList(params.subcategoriesList);
  const actorsStr = (params.targetActors && params.targetActors.length > 0)
    ? params.targetActors.join(', ')
    : '';
  const locationStr = params.selectedLocation?.trim()
    ? `${params.selectedLocation.trim()} (plus all Ranked Epicenters from Doc 1a)`
    : 'All Ranked Epicenters from Doc 1a';
  const outcomeStr = params.userOutcome?.trim() || '[Specify what operational/commercial change the actor must make]';
  const whyNowStr = params.userWhyNow?.trim() || '[Specify what market shift or news event triggered this]';

  return DOC_1B_MASTER_PROMPT
    .replace(/\{\{commodity\}\}/g, params.commodity)
    .replace(/\{\{target_actors\}\}/g, actorsStr)
    .replace(/\{\{ranked_locations\}\}/g, locationStr)
    .replace(/\{\{selected_location\}\}/g, locationStr)
    .replace(/\{\{user_outcome\}\}/g, outcomeStr)
    .replace(/\{\{user_why_now\}\}/g, whyNowStr)
    .replace(/\{\{current_month_year\}\}/g, params.currentMonthYear)
    .replace(/\{\{doc_1a_output\}\}/g, params.doc1aOutput || '[Refer to Document 1a generated above in this chat]')
    .replace(/\{\{subcategories_list\}\}/g, subcatsFormatted);
}

/**
 * Compiles the exact Document 1c prompt by replacing dynamic placeholder variables.
 */
export function buildDoc1cPrompt(params: {
  doc1aOutput?: string;
  doc1bOutput?: string;
  currentMonthYear?: string;
  userFinalDecision?: string;
  targetPersona?: string;
}): string {
  const personaStr = params.targetPersona?.trim() || '';
  const decisionStr = params.userFinalDecision?.trim() || 'Distribute article outlines across all optimal ranked locations from Doc 1a & 1b';

  return DOC_1C_MASTER_PROMPT
    .replace(/\{\{current_month_year\}\}/g, params.currentMonthYear || 'August 2026')
    .replace(/\{\{doc_1a_output\}\}/g, params.doc1aOutput || '[Refer to the Ranked Micro-Geographies from Document 1a generated above in this chat]')
    .replace(/\{\{doc_1b_output\}\}/g, params.doc1bOutput || '[Refer to the 6-Point Spectrum and Drucker findings across ranked locations from Document 1b]')
    .replace(/\{\{user_final_decision\}\}/g, decisionStr)
    .replace(/\{\{target_persona\}\}/g, personaStr);
}

/**
 * Parses raw Document 1c markdown text into structured article briefs.
 */
export function parseDoc1cArticles(rawText: string, fallbackCommodity = 'Soybeans, Nuts and Meals'): ParsedArticleBrief[] {
  if (!rawText) return [];

  const outlines: ParsedArticleBrief[] = [];
  const blocks = rawText.split('---').map(b => b.trim()).filter(Boolean);

  blocks.forEach((block, idx) => {
    const categoryMatch = block.match(/[*•-]?\s*\*?\*?Category(?:_ID)?\*?\*?:\s*([^\n\r*]+)/i);
    const subcategoryMatch = block.match(/[*•-]?\s*\*?\*?Subcategory(?:_ID)?\*?\*?:\s*([^\n\r*]+)/i);
    const commodityMatch = block.match(/[*•-]?\s*\*?\*?Commodity\*?\*?:\s*([^\n\r*]+)/i);
    const formatMatch = block.match(/[*•-]?\s*\*?\*?Format(?:_Type)?\*?\*?:\s*([^\n\r*]+)/i);
    const eraMatch = block.match(/[*•-]?\s*\*?\*?Era\*?\*?:\s*([^\n\r*]+)/i);
    const locationMatch = block.match(/[*•-]?\s*\*?\*?(?:Location(?:\s*\(Micro-Geography\))?|Geographic(?:_|\s+)Location|Micro-Geography|Primary(?:_|\s+)Country)\*?\*?:\s*([^\n\r*]+)/i);
    const spectrumMatch = block.match(/[*•-]?\s*\*?\*?Spectrum(?:_Rank)?\*?\*?:\s*([^\n\r*]+)/i);
    const personaMatch = block.match(/[*•-]?\s*\*?\*?Target_Persona\*?\*?:\s*([^\n\r*]+)/i);

    const cleanCategory = categoryMatch ? categoryMatch[1].replace(/[*_`]/g, '').trim() : undefined;
    const cleanSubcategory = subcategoryMatch ? subcategoryMatch[1].replace(/[*_`]/g, '').trim() : undefined;
    const cleanCommodity = commodityMatch ? commodityMatch[1].replace(/[*_`]/g, '').trim() : fallbackCommodity;
    let cleanLocation = locationMatch ? locationMatch[1].replace(/[*_`]/g, '').trim() : 'National Transit Hub';
    if (cleanLocation.startsWith('[') && cleanLocation.endsWith(']')) {
      cleanLocation = cleanLocation.slice(1, -1).trim();
    }
    const cleanSpectrum = spectrumMatch ? spectrumMatch[1].replace(/[*_`]/g, '').trim() : `#${(idx % 6) + 1}`;
    const cleanPersona = personaMatch ? personaMatch[1].replace(/[*_`]/g, '').trim() : '';

    const titleMatch = block.match(/###\s*([^\n\r]+)/);
    const title = titleMatch ? titleMatch[1].replace(/[*_`]/g, '').trim() : `Article Brief #${idx + 1}`;

    const descSectionMatch = block.match(/\*\*Description:\*\*([\s\S]*?)(?:---|$)/i);
    let descLines: string[] = [];
    if (descSectionMatch) {
      descLines = descSectionMatch[1]
        .split('\n')
        .map(l => l.replace(/^[\s*•-]+/, '').trim())
        .filter(l => l.length > 0);
    }

    const rawFormat = (formatMatch ? formatMatch[1].replace(/[*_`]/g, '').trim().toLowerCase() : 'brief') as ArticleFormat;
    const format: ArticleFormat = ['brief', 'memo', 'playbook', 'comparison', 'culture'].includes(rawFormat)
      ? rawFormat
      : 'brief';

    const rawEra = (eraMatch ? eraMatch[1].replace(/[*_`]/g, '').trim().toLowerCase() : 'present') as ArticleEra;
    const era: ArticleEra = ['past', 'present', 'future'].includes(rawEra)
      ? rawEra
      : 'present';

    const hook = descLines.slice(0, 3).join(' ') || 'Strategic market intelligence breakdown.';
    const politicalEconomy = descLines.length >= 6 ? descLines[5] : undefined;

    if (title && (categoryMatch || formatMatch || descLines.length > 0)) {
      outlines.push({
        id: `brief-${Date.now()}-${idx + 1}`,
        categoryId: cleanCategory,
        subcategoryId: cleanSubcategory,
        subcategoryTitle: cleanSubcategory,
        commodity: cleanCommodity,
        format,
        era,
        location: cleanLocation,
        spectrumRank: cleanSpectrum,
        targetPersona: cleanPersona,
        title,
        descriptionSentences: descLines,
        hook,
        politicalEconomy,
      });
    }
  });

  return outlines;
}

const KNOWN_COUNTRIES_LIST = [
  'nigeria', 'costa rica', 'ghana', 'kenya', 'indonesia', 'india', 'brazil',
  'spain', 'italy', 'netherlands', 'australia', 'united states', 'usa', 'us',
  'united kingdom', 'uk', 'china', 'south africa', "côte d'ivoire", 'cote d\'ivoire',
  'ivory coast', 'senegal', 'gambia', 'benin', 'togo', 'cameroon', 'chad', 'niger',
  'mali', 'burkina faso', 'egypt', 'ethiopia', 'rwanda', 'tanzania', 'uganda',
  'malawi', 'zambia', 'zimbabwe', 'morocco', 'algeria', 'tunisia', 'vietnam',
  'thailand', 'malaysia', 'philippines', 'mexico', 'colombia', 'argentina', 'peru',
  'chile', 'ecuador', 'guatemala', 'honduras', 'nicaragua', 'panama', 'dominican republic',
  'france', 'germany', 'canada', 'turkey', 'saudi arabia', 'uae', 'oman', 'qatar',
  'ireland', 'poland', 'norway', 'sweden', 'denmark', 'belgium', 'switzerland',
  'austria', 'portugal', 'greece', 'new zealand', 'japan', 'south korea', 'singapore'
];

function toTitleCase(str: string): string {
  return str
    .split(' ')
    .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '')
    .join(' ');
}

/**
 * Normalizes a single geography block, stripping deep hierarchy arrows and LGAs down to "State, Country" or "Country"
 */
function normalizeSingleLocation(locStr: string): string {
  if (!locStr || typeof locStr !== 'string') return '';

  const cleaned = locStr
    .replace(/[*_`[\]()]/g, ' ')
    .replace(/level\s*\d+\s*(?:micro[-_ ]geography)?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return '';

  // Split hierarchy arrows (➔, ->, -->, >) OR commas (,)
  let segments = cleaned
    .split(/(?:➔|-->|->|>|,)/)
    .map(s => s.trim())
    .filter(Boolean);

  // Filter out continent markers
  segments = segments.filter(s => !/^(africa|west africa|east africa|sub-saharan africa|asia|europe|americas|latin america|south america|north america)$/i.test(s));

  // Filter out generic boilerplate labels
  segments = segments.filter(s => !/^(cluster|hub|district|terminal market|aggregation node|transit hub|national transit hub)$/i.test(s));

  if (segments.length === 0) return '';

  const NIGERIAN_STATES = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo',
    'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
    'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
    'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'Abuja', 'FCT'
  ];

  const CITY_TO_STATE: Record<string, string> = {
    'ibadan': 'Oyo',
    'calabar': 'Cross River',
    'port harcourt': 'Rivers',
    'ph': 'Rivers',
    'warri': 'Delta',
    'asaba': 'Delta',
    'aba': 'Abia',
    'onitsha': 'Anambra',
    'awka': 'Anambra',
    'makurdi': 'Benue',
    'gboko': 'Benue',
    'jos': 'Plateau',
    'maiduguri': 'Borno',
    'zaria': 'Kaduna',
    'dawanau': 'Kano',
    'mile 12': 'Lagos',
    'alaba': 'Lagos',
    'ikeja': 'Lagos',
    'badagry': 'Lagos',
    'uyo': 'Akwa Ibom',
    'owerri': 'Imo',
    'abeokuta': 'Ogun',
    'sagamu': 'Ogun',
    'ilorin': 'Kwara',
    'minna': 'Niger',
    'suleja': 'Niger',
    'lokoja': 'Kogi',
    'lafia': 'Nasarawa',
    'yola': 'Adamawa',
    'jalingo': 'Taraba',
    'damaturu': 'Yobe',
    'gusau': 'Zamfara',
    'birnin kebbi': 'Kebbi',
    'dutse': 'Jigawa',
    'abakaliki': 'Ebonyi',
    'enugu': 'Enugu',
    'nsukka': 'Enugu',
    'kano': 'Kano',
    'kaduna': 'Kaduna',
    'sokoto': 'Sokoto',
    'katsina': 'Katsina',
    'bauchi': 'Bauchi',
    'gombe': 'Gombe',
    'abuja': 'Abuja',
    'fct': 'Abuja',
  };

  // 1. Check if the string explicitly contains a Nigerian State or Hub City
  let matchedState = '';
  for (const st of NIGERIAN_STATES) {
    const stRegex = new RegExp(`\\b${st.toLowerCase()}(?:\\s+state)?\\b`, 'i');
    if (stRegex.test(cleaned)) {
      matchedState = st === 'FCT' ? 'Abuja' : st;
      break;
    }
  }

  if (!matchedState) {
    for (const [city, st] of Object.entries(CITY_TO_STATE)) {
      const cRegex = new RegExp(`\\b${city}\\b`, 'i');
      if (cRegex.test(cleaned.toLowerCase())) {
        matchedState = st;
        break;
      }
    }
  }

  // 2. Check for Country in the segments
  let matchedCountry = '';
  for (let i = segments.length - 1; i >= 0; i--) {
    const sLower = segments[i].toLowerCase();
    for (const c of KNOWN_COUNTRIES_LIST) {
      if (sLower === c || sLower.includes(c)) {
        matchedCountry = toTitleCase(c);
        if (c === 'usa' || c === 'us') matchedCountry = 'United States';
        if (c === 'uk') matchedCountry = 'United Kingdom';
        if (c === 'cote d\'ivoire' || c === 'ivory coast') matchedCountry = "Côte d'Ivoire";
        break;
      }
    }
    if (matchedCountry) break;
  }

  // 3. Assemble clean "State, Country"
  // Case A: A Nigerian state or city was detected
  if (matchedState) {
    if (!matchedCountry || matchedCountry.toLowerCase() === 'nigeria') {
      return `${matchedState}, Nigeria`;
    }
    return `${matchedState}, ${matchedCountry}`;
  }

  // Case B: A known country was detected
  if (matchedCountry) {
    const nonCountrySegs = segments.filter(s => !s.toLowerCase().includes(matchedCountry.toLowerCase()));
    if (nonCountrySegs.length > 0) {
      let stateSeg = nonCountrySegs[nonCountrySegs.length - 1];
      stateSeg = stateSeg.replace(/\s+(state|region|province|county|department|district|lga)$/i, '').trim();
      if (stateSeg && stateSeg.toLowerCase() !== matchedCountry.toLowerCase()) {
        return `${toTitleCase(stateSeg)}, ${matchedCountry}`;
      }
    }
    return matchedCountry;
  }

  // Case C: Neither known Nigerian state nor known country
  if (segments.length >= 2) {
    const s = segments[segments.length - 2].replace(/\s+(state|region|province|county|lga)$/i, '').trim();
    const c = segments[segments.length - 1].trim();
    return `${toTitleCase(s)}, ${toTitleCase(c)}`;
  }

  if (segments.length === 1) {
    const s = segments[0].replace(/\s+(state|region|province|county|lga)$/i, '').trim();
    return toTitleCase(s);
  }

  return '';
}

/**
 * Normalizes any micro-geography or comparison string:
 * - If single: returns "State, Country" (e.g. "Kano, Nigeria", "San José, Costa Rica", "Spain")
 * - If comparison: returns "State, Country ➔ State, Country" (e.g. "Costa Rica ➔ Nigeria", "San José, Costa Rica ➔ Kano, Nigeria")
 */
export function formatLocationStateCountry(rawLocation?: string, fallbackText?: string): string {
  const textToScan = (rawLocation && rawLocation.trim() !== 'National Transit Hub')
    ? rawLocation
    : (fallbackText || rawLocation || '');

  if (!textToScan || typeof textToScan !== 'string') {
    return '';
  }

  const cleaned = textToScan.trim();
  if (!cleaned) return '';

  // ── 1. COMPARISON DETECTION ──
  // Check for comparison separators: ↔, <->, <-->, vs, vs., versus, or ;
  const compRegex = /\s*(?:↔|<->|<-->|\bvs\.?\b|\bversus\b|;)\s*/i;

  if (compRegex.test(cleaned)) {
    const halves = cleaned.split(compRegex);
    if (halves.length >= 2 && halves[0].trim() && halves[1].trim()) {
      const locA = normalizeSingleLocation(halves[0].trim());
      const locB = normalizeSingleLocation(halves[1].trim());
      if (locA && locB) {
        return `${locA} ➔ ${locB}`;
      }
      return locA || locB || '';
    }
  }

  // Also check if text has comparison with arrows between two different locations/countries
  const arrowMatch = cleaned.match(/^(.+?)\s*(?:-->|->)\s*(.+)$/);
  if (arrowMatch) {
    const locA = normalizeSingleLocation(arrowMatch[1]);
    const locB = normalizeSingleLocation(arrowMatch[2]);
    if (locA && locB && locA.toLowerCase() !== locB.toLowerCase()) {
      return `${locA} ➔ ${locB}`;
    }
  }

  // ── 2. SINGLE LOCATION NORMALIZATION ──
  return normalizeSingleLocation(cleaned);
}
