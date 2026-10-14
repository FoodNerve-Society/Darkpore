# Learning Proposal: Livestream Master Prompt Architecture & Ingest Patterns

## Overview
This document synthesizes reusable patterns, technical constraints, and architectural learnings identified during the comprehensive audit of the Food Nerve Society Livestream Ecosystem (Phase 1 Ideation & Blueprint Engine and Phase 2 Slide Drafting & Scripting Engine).

---

## 1. Multi-Stage Prompt Chaining with Clean Hand-Offs
### Context
The broadcast authoring process is split into two distinct macro-phases and eight sequenced prompt templates:
- **Phase 1: Ideation & Broadcast Blueprinting**
  - `LS-Doc 1a`: The Deep Dossier Engine (pure isolated intelligence extraction from articles and CTAs).
  - `LS-Doc 1b`: Pattern & Intersection Mapping (The "Smear Matrix" unpacking commonalities, tensions, evolution, and profiteers).
  - `LS-Doc 1c`: Angles of Attack & Broadcast Synthesizer (4 distinct pitches: Head-On Assault, Flank Attack, Trojan Horse, Contrarian Crossfire outputting `[LIVESTREAM_MENU_PAYLOAD]`).
- **Phase 2: Slide Drafting & Scripting**
  - `LS-Doc 2a`: Act 1 Open & Tension (Media snapshot, killer stat card, strategic reframe question).
  - `LS-Doc 2b`: Act 2 The Meat & Diagnostic Map (3-layer funnel, ideal vs. feasible, scaled burden, power map, response audit, boundary test, preempt objections).
  - `LS-Doc 2c`: Act 3 The Close & Conversion (Re-evaluated case, diverging futures Path A vs Path B, ecosystem job/deal conversion).
  - `LS-Doc 3`: Executive Presenter Notes & Bionic Teleprompter Script (Verbatim spoken copy, bracketed cues like `[PAUSE 2s]`, chat hooks, transitions).
  - `LS-Doc 4`: Headless CMS Slide Payload Compiler (Strict `RundownItem` JSON array).

### Pattern & Best Practice
- **Explicit Step Hand-Off Blocks (`[PREVIOUS STEP HAND-OFF]`):** In LLM conversations, models can suffer from drift across multiple generation turns. Every prompt must explicitly instruct the model on what prior inputs are being ingested and how the current step maintains narrative continuity (e.g., Act 3 Slide 1 explicitly looping back to resolve the exact crisis scene described in Act 1 Slide 1).
- **Metadata Preservation Backpack:** Every prompt builder must pass an explicit metadata block (`Broadcast Title`, `Strategic Category`, `Hub Pillar`, `Temporal Era`, `Broadcast Format`, `Expected Slide Count`). This guarantees that even if a user pastes a prompt into a clean, new browser window or different AI model, the model never loses the broadcast's strategic coordinates.

---

## 2. Resilient Parsing for External LLM Payloads
### The Problem
When users copy LLM outputs from ChatGPT, Claude, or Gemini into headless ingest boxes:
1. LLMs frequently output preamble/postamble conversational text (e.g., *"Here is your JSON array..."*).
2. LLMs frequently format code fences as ```` ```markdown ````, ```` ```json ````, or bare ```` ``` ````.
3. LLMs often introduce trailing commas (`{"key": "value",}`) which cause standard `JSON.parse` to throw `SyntaxError`.
4. LLMs may output unescaped newlines or tabs within multi-line string properties (e.g., inside presenter teleprompter notes or descriptions).
5. Prompts requesting delimiter tags (e.g., `[LIVESTREAM_MENU_PAYLOAD]` or `[LIVESTREAM_SLIDES_PAYLOAD]`) can result in greedy regular expressions matching the header brackets as part of the JSON array, breaking parsing.

### The Solution: 5-Tier Resilient Ingestion
Both `parseLivestreamPayload` (Phase 1) and `normalizeLivestreamSlidePayload` (Phase 2) implement this standard 5-tier pattern:
1. **Delimiter Stripping:** Strip known platform tags (`[LIVESTREAM_MENU_PAYLOAD]`, `[LIVESTREAM_SLIDES_PAYLOAD]`, `[RUNDOWN_PAYLOAD]`) before string matching.
2. **Fence Unwrapping:** Safely unwrap markdown code fences matching `/```(?:json|markdown)?\s*([\s\S]*?)\s*```/i`.
3. **Outermost Structural Detection:** Find the true outermost `[` ... `]` (or `{` ... `}`) bounds.
4. **Trailing Comma Cleanup:** Strip trailing commas via `candidate.replace(/,\s*([\]}])/g, '$1')`.
5. **Relaxed Error Recovery:** On initial parse failure:
   - Repair unescaped newlines and tabs inside double-quoted string literals via regex: `/"([^"\\]*(?:\\.[^"\\]*)*)"/g`.
   - As a final recovery, extract the innermost balanced array substring between the first `[` and last `]`.

---

## 3. Grounded Plain-English Guardrails in Agribusiness Prompts
### Problem
Without explicit negative constraints, LLMs default to generic corporate management consultant vocabulary ("synergize", "paradigm shift", "leverage", "transformative ecosystem alignment"). This hollows out editorial credibility in specialized domains like agribusiness and food security.

### Reusable Prompt Standard
Every prompt builder must enforce two paired constraints:
1. **Explicit Negative Bans:**
   - *"Strictly avoid high-falutin corporate buzzwords and abstract jargon (e.g. 'synergy', 'paradigm shift', 'leverage', 'ecosystem alignment', 'transformative paradigms')."*
2. **Explicit Positive Domain Lexicon:**
   - *"Express every finding in plain-English, authentic field agribusiness terms (tonnage, spoilage rates, corridor haulage, jetty delays, off-take contracts, farmgate pricing, cold-chain breakages, informal toll checkpoints, bankable collateral)."*
3. **Active Voice & Grade Level:**
   - *"Write in active voice, direct 8th-grade clarity, and punchy declarative sentences."*

---

## 4. Dynamic DEF Slide Counting & SubSlide Alignment
### Discrepancy Clarified
- The DEF framework is not a fixed 1:1 mapping of blocks to slides. Individual DEF blocks contain multiple canonical sub-slides (defined in `defBlocksConfig.ts` under `subSlideTemplates`):
  - `anchor_tension`: 2 sub-slides (Crisis media snapshot + killer stat card)
  - `reframe_question`: 1 sub-slide
  - `funnel_system`: 3 sub-slides (Symptoms ➔ Logistics ➔ Policy)
  - `ideal_vs_feasible`: 3 sub-slides (NGO dream ➔ Point of failure ➔ Feasible fix)
  - `scaled_burden`: 2 sub-slides
  - `power_map`: 3 sub-slides (Deciders, enforcers, payers)
  - `response_audit`: 2 sub-slides
  - `boundary_test`: 2 sub-slides
  - `preempt_objections`: 2 sub-slides
  - `return_to_case`: 1 sub-slide
  - `forked_close`: 2 sub-slides
  - `talent_spotlight`: 2 sub-slides
- Therefore, total slides per broadcast format are dynamically calculated by `calculateExpectedSlideCount(format)`:
  - `industry_teardown` (10 blocks): **21 slides**
  - `panel_debate` (8 blocks): **17 slides**
  - `talent_spotlight` (6 blocks): **12 slides**
- Prompts must dynamically inject `calculateExpectedSlideCount(ctx.format)` into LS-Doc 3 and LS-Doc 4 rather than relying on hardcoded slide counts.

---

## 5. Workflow Decision Gates
As encoded in platform guidelines:
- **Phase 1 Ingest (`LS-Doc 1c`)** must populate the Step 1 card carousel and scroll the user into view without auto-selecting or auto-advancing past the user evaluation gate.
- **Blueprint Selection Gate** transitions the user to the Step 2 Framework Preview (`step === 2 && !frameworkLoaded`), giving them the conscious choice to launch the Phase 2 AI Drafting Assistant or start with blank templates.
- **Phase 2 Ingest (`LS-Doc 4`)** compiles the final `RundownItem` array and only advances to `frameworkLoaded = true` upon explicit user review and trigger in the Fast Ingest Terminal.
