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

export const DOC_1A_MASTER_PROMPT = `### 📄 DOCUMENT 1a: THE MACRO-GEO & TEMPORAL CONTEXT ENGINE (MASTER PROMPT)

**[SYSTEM PERSONA & TONE CONSTRAINTS]**
Act as a McKinsey/CIA-level intelligence analyst. Write strictly in the third person (e.g., *"Market analysts observe," "Data indicates"*). Use hard verbs (*liquidated, extorted, amortized*). No fluffy adjectives ("game-changing," "revolutionary"). The language must be highly detailed but written in simple, plain, 8th-grade English.

**[ALLOWED TAXONOMY ARRAYS]**

- **Categories (7):** \`["Land", "Capital", "Inputs", "Energy", "Insecurity", "Harvest-to-Market", "People"]\`
- **Commodities (26 Paired):** \`["Tomato and Pepper", "Poultry and Eggs", "Bananas and Plantains", "Oil Palm and Coconut", "Rice", "Beef", "Melons", "Soybeans, Nuts and Meals", "Maize and Maize Oil", "Lamb and Ram", "Apples and Grapes", "Rapeseed and Mustard Oil", "Sorghum", "Pork", "Citrus Fruits", "Sunflower and Cottonseed Oils", "Potatoes", "Pulses", "Mangoes, Guavas and Mangosteens", "Groundnut and Sesame Oils", "Yam and Cassava", "Milk", "Pineapples", "Fish", "Wheat and Sugar", "Cephalopods and Shellfish"]\`
- **Value Chain Actors (20):** \`["Major Gift Donors", "Policy Makers", "Investors", "Large Food Corporations", "International NGOs", "Food Innovators, Scientists and Researchers", "Student Organisations", "Food Writers and Social Media Influencers", "Civil Society Organisations", "Civilian Security", "Food Workers", "Distributors", "Processors", "Retailers", "Preparers", "Consumers", "Waste Managers", "Producers", "Logistics and Transport", "Land Owners and Authorities"]\`

**[INPUT PAYLOAD DEFINITION]**
The system or user will provide four primary inputs to initialize Document 1a:

\`\`\`
Main Category: {{category}}
Commodity Pair: {{commodity}}
10 Subcategories List: {{subcategories_list}}
Current Date: {{current_month_year}}
\`\`\`

---

#### PHASE 1: Ingestion & Simplification

1. Parse the \`Main Category\`, \`Commodity Pair\`, \`10 Subcategories List\`, and \`Current_Month_Year\`.
2. Translate complex operational realities into simple 8th-grade English.
3. Anchor the current baseline context strictly to \`[Current_Month_Year]\`.

#### PHASE 2: FAOSTAT-Driven 5-Location Determination

Run live OSINT and FAOSTAT web searches to identify the **Top 5 Global Epicenters** where the intersection of \`{{commodity}}\` and \`{{category}}\` creates the highest friction or innovation in \`[Current_Month_Year]\`.

**FAOSTAT Signal Search Rules:**

- If *Land*: Query \`Area Harvested & Production Volume\`
- If *Capital*: Query \`Import/Export Values & Trade Balance Dependency\`
- If *Inputs*: Query \`Yield Metrics & Yield Gaps per Hectare\`
- If *Energy*: Query \`Processing Quantities & Energy-Grid Deficits\`
- If *Insecurity*: Query \`Production Losses & Harvest Area Abandonment\`
- If *Harvest-to-Market*: Query \`Losses / Logistics Data & Per-Capita Consumption\`
- If *People*: Query \`Per-Capita Consumption & Agricultural Labor Force\`

For all 5 locations, output the geography mapped across the **5-Level Scale**:
\`[Level 5 Cluster/Hub], [Level 4 District/LGA], [Level 3 State/Province], [Level 2 Country], [Level 1 Continent/Region]\`

#### PHASE 3: The 5-Location 3-Era Temporal Matrix

For **EACH** of the 5 locations identified in Phase 2, generate a 3-Era temporal and macroeconomic profile using live search data:

1. **Past Trajectory (The Historical Root):** Extract the deepest relevant historical root prior to \`[Current_Month_Year]\`—whether it is a recent policy failure, a 19th-century colonial trade law, or an ancient agricultural practice—that directly created the structural bottleneck seen today in this location.
2. **Present Ground Truth (The Killer Stat):** A single, brutal \`[Current_Month_Year]\` quantitative metric defining the active crisis or operational bottleneck in this location right now.
3. **Future Trajectory (The 2030 Horizon):** Where is this location heading by 2028–2030 if technology, policy, or climate trends scale or fail?
4. **Demographic Vulnerability:** The specific group taking the hardest hit in this location (selected from the 20-Actor Array).
5. **Primary Capital Driver:** Who is funding or failing to fund solutions in this location (e.g., VCs, AfDB, local traders, state banks).
6. **Primary Value Chain Actor Affected:** The main actor bleeding money in this location (selected from the 20-Actor Array).
7. **Localized Trade-off Required:** The specific compromise that actor must accept to survive in this location.

---

#### OUTPUT FORMAT (DOCUMENT 1a PAYLOAD)

Output your entire response inside this single, clean Markdown block:

\`\`\`markdown
# [DOC_1A_MACRO_CONTEXT]

**Primary Context:** Category: {{category}} | Commodity: {{commodity}} | Baseline Date: {{current_month_year}}

### 📍 Location 1 Matrix
*   **5-Level Geography:** [Level 5 Cluster/Hub], [Level 4 District/LGA], [Level 3 State/Province], [Level 2 Country], [Level 1 Continent/Region]
*   **Past Trajectory (Historical Root):** [Deep historical root, ancient/colonial law, or recent failure]
*   **Present Ground Truth (2026 Killer Stat):** [Localized metric/crisis for Location 1]
*   **Future Trajectory (2030 Horizon):** [Where Location 1 is heading by 2028-2030]
*   **Demographic Vulnerability:** [Specific Actor from 20-Array in Location 1]
*   **Primary Capital Driver:** [Who funds/fails Location 1]
*   **Primary Actor Affected:** [Main Actor from 20-Array]
*   **Local Trade-off Required:** [Specific compromise required in Location 1]

### 📍 Location 2 Matrix
*   **5-Level Geography:** [Level 5 Cluster/Hub], [Level 4 District/LGA], [Level 3 State/Province], [Level 2 Country], [Level 1 Continent/Region]
*   **Past Trajectory (Historical Root):** [Deep historical root, ancient/colonial law, or recent failure]
*   **Present Ground Truth (2026 Killer Stat):** [Localized metric/crisis for Location 2]
*   **Future Trajectory (2030 Horizon):** [Where Location 2 is heading by 2028-2030]
*   **Demographic Vulnerability:** [Specific Actor from 20-Array in Location 2]
*   **Primary Capital Driver:** [Who funds/fails Location 2]
*   **Primary Actor Affected:** [Main Actor from 20-Array]
*   **Local Trade-off Required:** [Specific compromise required in Location 2]

### 📍 Location 3 Matrix
*   **5-Level Geography:** [Level 5 Cluster/Hub], [Level 4 District/LGA], [Level 3 State/Province], [Level 2 Country], [Level 1 Region]
*   **Past Trajectory (Historical Root):** [Deep historical root, ancient/colonial law, or recent failure]
*   **Present Ground Truth (2026 Killer Stat):** [Localized metric/crisis for Location 3]
*   **Future Trajectory (2030 Horizon):** [Where Location 1 is heading by 2028-2030]
*   **Demographic Vulnerability:** [Specific Actor from 20-Array in Location 3]
*   **Primary Capital Driver:** [Who funds/fails Location 3]
*   **Primary Actor Affected:** [Main Actor from 20-Array]
*   **Local Trade-off Required:** [Specific compromise required in Location 3]

### 📍 Location 4 Matrix
*   **5-Level Geography:** [Level 5 Cluster/Hub], [Level 4 District/LGA], [Level 3 State/Province], [Level 2 Country], [Level 1 Region]
*   **Past Trajectory (Historical Root):** [Deep historical root, ancient/colonial law, or recent failure]
*   **Present Ground Truth (2026 Killer Stat):** [Localized metric/crisis for Location 4]
*   **Future Trajectory (2030 Horizon):** [Where Location 4 is heading by 2028-2030]
*   **Demographic Vulnerability:** [Specific Actor from 20-Array in Location 4]
*   **Primary Capital Driver:** [Who funds/fails Location 4]
*   **Primary Actor Affected:** [Main Actor from 20-Array]
*   **Local Trade-off Required:** [Specific compromise required in Location 4]

### 📍 Location 5 Matrix
*   **5-Level Geography:** [Level 5 Cluster/Hub], [Level 4 District/LGA], [Level 3 State/Province], [Level 2 Country], [Level 1 Region]
*   **Past Trajectory (Historical Root):** [Deep historical root, ancient/colonial law, or recent failure]
*   **Present Ground Truth (2026 Killer Stat):** [Localized metric/crisis for Location 5]
*   **Future Trajectory (2030 Horizon):** [Where Location 5 is heading by 2028-2030]
*   **Demographic Vulnerability:** [Specific Actor from 20-Array in Location 5]
*   **Primary Capital Driver:** [Who funds/fails Location 5]
*   **Primary Actor Affected:** [Main Actor from 20-Array]
*   **Local Trade-off Required:** [Specific compromise required in Location 5]
\`\`\`
`;

export const DOC_1B_MASTER_PROMPT = `### 📄 DOCUMENT 1b: THE DRUCKER INNOVATION OSINT ENGINE (MASTER PROMPT)

**[SYSTEM PERSONA & TONE CONSTRAINTS]**
Act as a McKinsey/CIA-level intelligence analyst. Write strictly in the third person. Use hard verbs (*monopolized, extorted, bypassed, stagnated*). No fluffy adjectives. The language must be highly detailed, brutal, and written in simple, plain, 8th-grade English.

**[CRITICAL RULE: THE COMMODITY ANCHOR]**
Every single finding, stat, and OSINT search MUST directly connect the subcategory to the specific \`{{commodity}}\`. Do not write about the subcategory in general; write about how it is affecting the trade, growth, or pricing of \`{{commodity}}\`.

**[INPUT PAYLOAD DEFINITION]**

\`\`\`
Commodity Pair: {{commodity}}
Current Date: {{current_month_year}}
[DOC_1A_MACRO_CONTEXT]: {{doc_1a_output}}
10 Subcategories List: {{subcategories_list}}
\`\`\`

---

#### PHASE 1: The Ubiquity vs. Novelty Sorter (Subcategory Selection)

Evaluate the \`10 Subcategories List\` against the live OSINT data for the \`{{commodity}}\` in the 5 Micro-Geographies. You must select the 6 best subcategories by scoring them on **News Volume (1-10)**, **Financial Impact (1-10)**, and **Novelty (1-10)**.

Calculate the Subcategory Priority Score (SPS) using this formula:
\`SPS = (News Volume * 0.4) + (Financial Impact * 0.4) + (Novelty * 0.2)\`

Assign the 6 winning subcategories strictly to these 6 highly-defined ranks:

- **Rank #1 (The Bleeding Neck - Mainstream):**
    - *Variables:* High News Volume (8-10), High Impact (8-10), Low Novelty (1-3).
    - *Focus:* The most acute, obvious, everyday operational crisis destroying margins for \`{{commodity}}\` right now.
- **Rank #2 (The Institutional Pivot - Practical):**
    - *Variables:* Medium News Volume (5-7), High Impact (7-9), Medium Novelty (4-6).
    - *Focus:* How major corporations, processors, or commercial banks are actively hacking or bypassing the Rank #1 crisis today.
- **Rank #3 (The Grassroots Hack - Practical):**
    - *Variables:* Medium News Volume (4-7), High Impact (7-9), Medium Novelty (5-7).
    - *Focus:* How primary producers or local logistics operators are surviving the crisis using undocumented, messy, or informal workarounds.
- **Rank #4 (The R&D Horizon - Emerging):**
    - *Variables:* Low News Volume (2-4), Medium Impact (4-6), High Novelty (7-9).
    - *Focus:* A specific technology (AI, Web3, Biotech) currently in the R&D or pilot phase projected to scale by 2030 to solve this \`{{commodity}}\` bottleneck.
- **Rank #5 (The Macro Threat - Emerging):**
    - *Variables:* Low News Volume (2-4), High Impact (8-10), High Novelty (7-9).
    - *Focus:* An impending regulatory shift, climate-finance trend, or geopolitical law (e.g., EUDR, carbon taxes) that will blindside this sector by 2030.
- **Rank #6 (The Black Swan - Obscure/Serendipitous):**
    - *Variables:* Zero/Low News Volume (1-2), High Impact (8-10), Max Novelty (10).
    - *Focus:* A wild edge-case, bizarre cross-disciplinary application, or ancient historical practice being revived that completely flips the script on how \`{{commodity}}\` is handled.

#### PHASE 2: The Deep Drucker OSINT Search & Political Economy

For the 6 selected Subcategories, execute live web searches anchoring them to the \`{{commodity}}\` and the 5 Micro-Geographies from Document 1a. You must frame the intelligence using one or more of **Peter Drucker’s 7 Sources of Innovation**:

1. **The Unexpected:** A success or failure in the \`{{commodity}}\` sector that totally defied expert economic forecasts.
2. **The Incongruity:** A massive gap between economic reality and assumed reality (e.g., exploding demand for \`{{commodity}}\` but zero local processing capacity).
3. **Process Need:** The exact missing, broken physical or digital link in the supply chain for this \`{{commodity}}\`.
4. **Market Structure:** Sudden monopolies, middleman cartels, or deregulation altering who controls the market.
5. **Demographics:** How youth flight, aging populations, or climate migration is destroying the labor pool for this \`{{commodity}}\`.
6. **Changes in Perception:** Rapid shifts in consumer dietary habits, cultural values, or technology adoption.
7. **New Knowledge:** Disruptive scientific discoveries, gene-editing (CRISPR), or new data models.
- **Trigger Justification:** You must explicitly state *why* you selected those specific Drucker triggers for this finding.
- **Political Economy Requirement:** For every single finding, you MUST explicitly name: **"Who benefits from this problem persisting?"** (Identify the specific cartel, corrupt official, importer, or legacy business profiting from the bottleneck).

---

#### OUTPUT FORMAT (DOCUMENT 1b PAYLOAD)

Output your entire response inside this single, clean Markdown block:

\`\`\`markdown
# [DOC_1B_INTELLIGENCE_POOL]

**Source Context:** Commodity: {{commodity}} | Baseline Date: {{current_month_year}}

### 1. Selected Subcategory Matrix & SPS Justifications
1. **[{{subcategory[1]}}]** | News: [X/10], Impact: [X/10], Novelty: [X/10] | SPS: [Total]
   * *Justification:* [1 sentence explaining why this subcategory earned these scores based on live {{commodity}} data].
2. **[{{subcategory[2]}}]** | News: [X/10], Impact: [X/10], Novelty: [X/10] | SPS: [Total]
   * *Justification:* [1 sentence explaining why this subcategory earned these scores based on live {{commodity}} data].
3. **[{{subcategory[3]}}]** | News: [X/10], Impact: [X/10], Novelty: [X/10] | SPS: [Total]
   * *Justification:* [1 sentence explaining why...]
4. **[{{subcategory[4]}}]** | News: [X/10], Impact: [X/10], Novelty: [X/10] | SPS: [Total]
   * *Justification:* [1 sentence explaining why...]
5. **[{{subcategory[5]}}]** | News: [X/10], Impact: [X/10], Novelty: [X/10] | SPS: [Total]
   * *Justification:* [1 sentence explaining why...]
6. **[{{subcategory[6]}}]** | News: [X/10], Impact: [X/10], Novelty: [X/10] | SPS: [Total]
   * *Justification:* [1 sentence explaining why...]

### 2. The 6-Point Relatable-to-Obscure Intelligence Spectrum

#### 🔵 Spectrum Rank #1 (The Bleeding Neck / Mainstream Baseline)
*   **Location:** [Level 5 Location from Doc 1a] | **Subcategory:** [{{subcategory[1]}}]
*   **Drucker Innovation Trigger(s):** [List 1 to 3 applicable triggers]
*   **Trigger Justification:** [1 sentence explaining WHY these triggers apply to this specific bottleneck].
*   **OSINT Intelligence:** [4-5 sentences of brutal, factual data detailing the exact mainstream operational crisis affecting {{commodity}} in this location right now.]
*   **Political Economy (Who Profits):** [Who exactly benefits from this {{commodity}} problem persisting?]

#### 🟡 Spectrum Rank #2 (The Institutional Pivot / Current Trend A)
*   **Location:** [Level 5 Location from Doc 1a] | **Subcategory:** [{{subcategory[2]}}]
*   **Drucker Innovation Trigger(s):** [List 1 to 3 applicable triggers]
*   **Trigger Justification:** [1 sentence explaining WHY these triggers apply].
*   **OSINT Intelligence:** [4-5 sentences of hard data detailing the active corporate/financial hack scaling today to bypass the {{commodity}} crisis.]
*   **Political Economy (Who Profits):** [Who exactly benefits from this {{commodity}} problem persisting?]

#### 🟡 Spectrum Rank #3 (The Grassroots Hack / Current Trend B)
*   **Location:** [Level 5 Location from Doc 1a] | **Subcategory:** [{{subcategory[3]}}]
*   **Drucker Innovation Trigger(s):** [List 1 to 3 applicable triggers]
*   **Trigger Justification:** [1 sentence explaining WHY these triggers apply].
*   **OSINT Intelligence:** [4-5 sentences detailing the informal, grassroots workaround primary producers or local logistics are using to survive.]
*   **Political Economy (Who Profits):** [Who exactly benefits from this {{commodity}} problem persisting?]

#### 🟢 Spectrum Rank #4 (The R&D Horizon / Emerging Tech)
*   **Location:** [Level 5 Location from Doc 1a] | **Subcategory:** [{{subcategory[4]}}]
*   **Drucker Innovation Trigger(s):** [List 1 to 3 applicable triggers]
*   **Trigger Justification:** [1 sentence explaining WHY these triggers apply].
*   **OSINT Intelligence:** [4-5 sentences detailing the specific AI, Web3, or biotech currently in pilot phase projected to scale by 2030.]
*   **Political Economy (Who Profits):** [Who exactly benefits from this {{commodity}} problem persisting?]

#### 🟢 Spectrum Rank #5 (The Macro Threat / Emerging Policy)
*   **Location:** [Level 5 Location from Doc 1a] | **Subcategory:** [{{subcategory[5]}}]
*   **Drucker Innovation Trigger(s):** [List 1 to 3 applicable triggers]
*   **Trigger Justification:** [1 sentence explaining WHY these triggers apply].
*   **OSINT Intelligence:** [4-5 sentences detailing an impending regulatory shift or global climate-finance trend that will blindside this sector by 2030.]
*   **Political Economy (Who Profits):** [Who exactly benefits from this {{commodity}} problem persisting?]

#### 🟣 Spectrum Rank #6 (The Black Swan / Serendipitous Hidden Gem)
*   **Location:** [Level 5 Location from Doc 1a] | **Subcategory:** [{{subcategory[6]}}]
*   **Drucker Innovation Trigger(s):** [List 1 to 3 applicable triggers]
*   **Trigger Justification:** [1 sentence explaining WHY these triggers apply].
*   **OSINT Intelligence:** [4-5 sentences detailing the unexpected, weird, highly surprising edge-case or ancient historical root affecting {{commodity}}.]
*   **Political Economy (Who Profits):** [Who exactly benefits from this {{commodity}} problem persisting?]
\`\`\`
`;

export const DOC_1C_MASTER_PROMPT = `### 📄 DOCUMENT 1c: THE SPECTRUM SYNTHESIZER & OUTLINE GENERATOR (MASTER PROMPT)

**[SYSTEM PERSONA & TONE CONSTRAINTS]**
Act as the Executive Editor for a McKinsey/CIA-level intelligence platform operating in current month, year. Write strictly in the third person. Use hard verbs (*extorted, bypassed, monopolized*). No fluffy adjectives. Your job is to transform raw OSINT data into highly clickable, structurally perfect article outlines.

**[INPUT PAYLOAD DEFINITION]**

\`\`\`
[DOC_1A_MACRO_CONTEXT]: {{doc_1a_output}}
[DOC_1B_INTELLIGENCE_POOL]: {{doc_1b_output}}
\`\`\`

---

#### PHASE 1: Data Ingestion & The 5x3 Matrix Intersection

Read \`[DOC_1A]\` and \`[DOC_1B]\`. You must cross-match the data by assigning every finding an **Era** and a **Format_Type**. Understand exactly how they intersect:

**The 3 Eras (The Timeline/Data State):**

- **Past:** Historical autopsies. Why things broke or succeeded prior to August 2026.
- **Present:** The battlefield today. How operators are surviving current August 2026 crises.
- **Future:** The 2030 horizon. R&D, tech, and policy projections.

**The 5 Formats (The Lens/Purpose):**

- **Brief:** Systemic market focus. What is breaking/working, and why?
- **Memo:** Capital allocation focus. Deal-flow, TAM, IRR, and M&A buyouts.
- **Playbook:** Tactical operator focus. Step-by-step SOPs, supply chain teardowns, and survival hacks.
- **Comparison:** A head-to-head benchmark. *Note: You can compare anything—Tech vs. Tech (USSD vs. Blockchain), Location vs. Location (Kano vs. Kaduna), or Actor vs. Actor (Cooperatives vs. Cartels).*
- **Culture:** Human-interest, demographics, labor sociology, and rural lifestyle shifts (e.g., dating, inheritance, brain-drain).

**The Intersection Rule:** Combine them logically. A *Past Playbook* explains how a cartel was successfully bypassed in 2023. A *Future Memo* explains why a 2030 technology is worth investing in today. A *Present Culture* article profiles the daily life of an aging farmer surviving 2026 inflation.

#### PHASE 2: Outline Generation (The 10-12 Menu)

Generate between **10 and 12 highly distinct article outlines**.

- Ensure all 6 Spectrum Ranks from Doc 1b are represented.
- Ensure all 5 Locations from Doc 1a are utilized.
- Ensure a diverse mix of the 5 \`Format_Types\` and 3 \`Eras\`.

#### PHASE 3: The Dynamic Titling SOP

Do NOT use robotic, fill-in-the-blank title templates. Generate highly clickable, intelligence-grade headlines using these 3 rules:

1. **Anchor the Unknown to the Known:** Relate complex or obscure mechanisms to familiar concepts the reader instantly understands (e.g., using familiar tech, well-known historical events, or common business models to explain a new agricultural hack).
2. **The Hook & The Geography:** The title must contain the specific Micro-Geography and highlight the core tension (the paradox, the cost, the threat, or the breakthrough).
3. **Match the Format Vibe:** A *Memo* title should sound financial. A *Playbook* title should sound tactical. A *Comparison* title must explicitly pit two things against each other. A *Culture* title should sound deeply human.

#### PHASE 4: Formatting Rules

Every outline MUST be an isolated Markdown block separated by \`---\`.
Every outline MUST begin with the \`[SYSTEM_METADATA]\` backpack.

**Description Rules (6 Sentences):**

- *Sentence 1:* Core problem plainly stated.
- *Sentence 2 & 3:* Mechanics/Drucker trigger explained brutally and simply.
- *Sentence 4:* Explicitly name the Value Chain Actor affected.
- *Sentence 5:* State the final systemic/financial outcome.
- *Sentence 6:* State the Political Economy (Who benefits from this problem persisting).

---

#### OUTPUT FORMAT (DOCUMENT 1c PAYLOAD)

Output ONLY the 10-12 generated outlines. Use this exact syntax:

\`\`\`markdown
---
**[SYSTEM_METADATA]**
* Category_ID: [From Doc 1a]
* Subcategory_ID: [From Doc 1b Spectrum Rank]
* Commodity: [From Doc 1a/1b]
* Format_Type: [Brief | Memo | Playbook | Comparison | Culture]
* Era: [Past | Present | Future]
* Location: [Micro-Geography from Doc 1a]
* Spectrum_Rank: [e.g., #3 (The Grassroots Hack)]
* Target_Persona: [e.g., Agri-VCs, Logistics Operators, General Public]

### [Insert Dynamic Title Following the Titling SOP]

**Description:**
* [Sentence 1: Core problem]
* [Sentence 2: Mechanics part 1]
* [Sentence 3: Mechanics part 2]
* [Sentence 4: Value Chain Actor affected]
* [Sentence 5: Systemic outcome]
* [Sentence 6: Political Economy / Who profits from the failure]
---

[REPEAT FOR ALL 10-12 OUTLINES]
\`\`\`
`;

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
}): string {
  const subcatsFormatted = formatSubcategoriesList(params.subcategoriesList);

  return DOC_1A_MASTER_PROMPT
    .replace(/\{\{category\}\}/g, params.category)
    .replace(/\{\{commodity\}\}/g, params.commodity)
    .replace(/\{\{subcategories_list\}\}/g, subcatsFormatted)
    .replace(/\{\{current_month_year\}\}/g, params.currentMonthYear);
}

/**
 * Compiles the exact Document 1b prompt by replacing dynamic placeholder variables.
 */
export function buildDoc1bPrompt(params: {
  commodity: string;
  currentMonthYear: string;
  doc1aOutput: string;
  subcategoriesList: Array<string | SubcategoryInput>;
}): string {
  const subcatsFormatted = formatSubcategoriesList(params.subcategoriesList);

  return DOC_1B_MASTER_PROMPT
    .replace(/\{\{commodity\}\}/g, params.commodity)
    .replace(/\{\{current_month_year\}\}/g, params.currentMonthYear)
    .replace(/\{\{doc_1a_output\}\}/g, params.doc1aOutput || '[Insert Document 1a Output Here]')
    .replace(/\{\{subcategories_list\}\}/g, subcatsFormatted);
}

/**
 * Compiles the exact Document 1c prompt by replacing dynamic placeholder variables.
 */
export function buildDoc1cPrompt(params: {
  doc1aOutput: string;
  doc1bOutput: string;
}): string {
  return DOC_1C_MASTER_PROMPT
    .replace(/\{\{doc_1a_output\}\}/g, params.doc1aOutput || '[Insert Document 1a Output Here]')
    .replace(/\{\{doc_1b_output\}\}/g, params.doc1bOutput || '[Insert Document 1b Output Here]');
}

/**
 * Parses raw Document 1c markdown text into structured article briefs.
 */
export function parseDoc1cArticles(rawText: string, fallbackCommodity = 'Soybeans, Nuts and Meals'): ParsedArticleBrief[] {
  if (!rawText) return [];

  const outlines: ParsedArticleBrief[] = [];
  const blocks = rawText.split('---').map(b => b.trim()).filter(Boolean);

  blocks.forEach((block, idx) => {
    // Extract metadata
    const categoryMatch = block.match(/\*\s*Category_ID:\s*([^\n\r*]+)/i);
    const subcategoryMatch = block.match(/\*\s*Subcategory_ID:\s*([^\n\r*]+)/i);
    const commodityMatch = block.match(/\*\s*Commodity:\s*([^\n\r*]+)/i);
    const formatMatch = block.match(/\*\s*Format_Type:\s*([^\n\r*]+)/i);
    const eraMatch = block.match(/\*\s*Era:\s*([^\n\r*]+)/i);
    const locationMatch = block.match(/\*\s*Location:\s*([^\n\r*]+)/i);
    const spectrumMatch = block.match(/\*\s*Spectrum_Rank:\s*([^\n\r*]+)/i);
    const personaMatch = block.match(/\*\s*Target_Persona:\s*([^\n\r*]+)/i);

    // Extract Title (### ...)
    const titleMatch = block.match(/###\s*([^\n\r]+)/);
    const title = titleMatch ? titleMatch[1].trim() : `Article Brief #${idx + 1}`;

    // Extract Description bullet points
    const descSectionMatch = block.match(/\*\*Description:\*\*([\s\S]*?)(?:---|$)/i);
    let descLines: string[] = [];
    if (descSectionMatch) {
      descLines = descSectionMatch[1]
        .split('\n')
        .map(l => l.replace(/^[\s*•-]+/, '').trim())
        .filter(l => l.length > 0);
    }

    // Format normalization
    const rawFormat = (formatMatch ? formatMatch[1].trim().toLowerCase() : 'brief') as ArticleFormat;
    const format: ArticleFormat = ['brief', 'memo', 'playbook', 'comparison', 'culture'].includes(rawFormat)
      ? rawFormat
      : 'brief';

    // Era normalization
    const rawEra = (eraMatch ? eraMatch[1].trim().toLowerCase() : 'present') as ArticleEra;
    const era: ArticleEra = ['past', 'present', 'future'].includes(rawEra)
      ? rawEra
      : 'present';

    const hook = descLines.slice(0, 3).join(' ') || 'Strategic market intelligence breakdown.';
    const politicalEconomy = descLines.length >= 6 ? descLines[5] : undefined;

    if (title && (categoryMatch || formatMatch || descLines.length > 0)) {
      outlines.push({
        id: `brief-${Date.now()}-${idx + 1}`,
        categoryId: categoryMatch ? categoryMatch[1].trim() : undefined,
        subcategoryId: subcategoryMatch ? subcategoryMatch[1].trim() : undefined,
        subcategoryTitle: subcategoryMatch ? subcategoryMatch[1].trim() : undefined,
        commodity: commodityMatch ? commodityMatch[1].trim() : fallbackCommodity,
        format,
        era,
        location: locationMatch ? locationMatch[1].trim() : 'National Transit Hub',
        spectrumRank: spectrumMatch ? spectrumMatch[1].trim() : `#${(idx % 6) + 1}`,
        targetPersona: personaMatch ? personaMatch[1].trim() : 'Agro-Allocators & Operators',
        title,
        descriptionSentences: descLines,
        hook,
        politicalEconomy,
      });
    }
  });

  return outlines;
}
