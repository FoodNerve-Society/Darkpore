export type ArticleFormat = 'brief' | 'memo' | 'playbook' | 'comparison' | 'culture';
export type ArticleEra = 'past' | 'present' | 'future';
export type BlockType = 
  | 'subheading' 
  | 'exec_summary' 
  | 'highlight_card' 
  | 'core_interactive' 
  | 'media' 
  | 'myth_fact' 
  | 'pull_quote' 
  | 'live_poll' 
  | 'data_embed' 
  | 'strategic_directive' 
  | 'call_to_action'
  | 'comparison_matrix'
  | 'unit_economics_card'
  | 'protocol_steps'
  | 'timeline_tracker'
  | 'persona_dossier'
  | 'ecosystem_embed';

export interface SopBlock {
  type: BlockType;
  role: string;
  desc: string;
  hint: string;
}

export const BLOCK_DEFINITIONS: Record<BlockType, { label: string; color: string }> = {
  subheading: { label: 'Spiky Title', color: '#64748b' },
  exec_summary: { label: 'Key Takeaways', color: '#10b981' },
  highlight_card: { label: 'Big Stat Card', color: '#8b5cf6' },
  core_interactive: { label: 'Main Analysis', color: '#3b82f6' },
  media: { label: 'Evidence Gallery', color: '#0ea5e9' },
  myth_fact: { label: 'Myth vs Reality', color: '#ef4444' },
  pull_quote: { label: 'Strong Quote', color: '#f59e0b' },
  live_poll: { label: 'Quick Poll', color: '#d946ef' },
  data_embed: { label: 'Embedded Data', color: '#14b8a6' },
  strategic_directive: { label: 'Strategic Directive', color: '#111827' },
  call_to_action: { label: 'Call to Action', color: '#f59e0b' },
  comparison_matrix: { label: 'Showdown Table', color: '#8b5cf6' },
  unit_economics_card: { label: 'Financial Dashboard', color: '#10b981' },
  protocol_steps: { label: 'Action Checklist', color: '#f59e0b' },
  timeline_tracker: { label: 'Timeline Tracker', color: '#3b82f6' },
  persona_dossier: { label: 'Ground Dossier', color: '#ec4899' },
  ecosystem_embed: { label: 'Ecosystem Bridge', color: '#6366f1' },
};

export const FORMAT_CONFIG: Record<ArticleFormat, { label: string; icon: string; emoji: string; color: string; desc: string }> = {
  brief: {
    label: 'Brief',
    icon: 'Article',
    emoji: '📑',
    color: '#3b82f6',
    desc: 'Systemic market focus. What is breaking or working, and why?',
  },
  memo: {
    label: 'Memo',
    icon: 'TrendingUp',
    emoji: '💼',
    color: '#10b981',
    desc: 'Capital allocation focus. Deal-flow, TAM, IRR, and M&A buyouts.',
  },
  playbook: {
    label: 'Playbook',
    icon: 'Build',
    emoji: '🛠️',
    color: '#f59e0b',
    desc: 'Tactical operator focus. Step-by-step SOPs, teardowns, and survival hacks.',
  },
  comparison: {
    label: 'Comparison',
    icon: 'CompareArrows',
    emoji: '⚖️',
    color: '#8b5cf6',
    desc: 'Head-to-head benchmark across technologies, locations, or key actors.',
  },
  culture: {
    label: 'Culture',
    icon: 'People',
    emoji: '🌾',
    color: '#ec4899',
    desc: 'Human-interest, demographics, labor sociology, and rural lifestyle shifts.',
  },
};

export const ERA_CONFIG: Record<ArticleEra, { label: string; emoji: string; color: string; desc: string }> = {
  past: {
    label: 'Past',
    emoji: '⏳',
    color: '#ef4444',
    desc: 'Historical autopsy and legacy analysis.',
  },
  present: {
    label: 'Present',
    emoji: '⚡',
    color: '#10b981',
    desc: 'Real-time market dynamics and current reality.',
  },
  future: {
    label: 'Future',
    emoji: '🔮',
    color: '#3b82f6',
    desc: 'Forward-looking roadmap and 2030 predictions.',
  },
};

export const MATRIX_DESCRIPTIONS: Record<`${ArticleFormat}_${ArticleEra}`, string> = {
  brief_past: 'A retrospective brief on what happened in the past, analyzing root causes and historical precedent.',
  brief_present: 'A real-time market brief breaking down current supply-demand dynamics, pricing spreads, and immediate bottlenecks.',
  brief_future: 'A forward-looking market brief forecasting future commodity cycles, policy shifts, and supply disruption.',

  memo_past: 'An executive investment memo conducting an autopsy on prior capital allocation, deal structures, and lost returns.',
  memo_present: 'An actionable investment memo delivering live thesis, unit economics, and capital deployment opportunities today.',
  memo_future: 'A strategic investment memo modeling 2030 venture horizons, TAM expansion, and long-term risk exposure.',

  playbook_past: 'A forensic operator playbook examining past execution mistakes, stranded equipment, and hard-learned SOP lessons.',
  playbook_present: 'A step-by-step operator playbook for immediate execution, margin defense, and practical field survival.',
  playbook_future: 'A transformative operator playbook for building future-ready operations, automation, and next-gen protocols.',

  comparison_past: 'A head-to-head comparison studying historical models that failed versus those that endured.',
  comparison_present: 'A side-by-side comparison benchmarking active market players, competing logistics corridors, and cost structures.',
  comparison_future: 'A comparative scenario analysis evaluating competing emerging technologies, policies, and roadmap trajectories.',

  culture_past: 'A cultural deep-dive examining traditional agrarian norms, generational practices, and historical community dynamics.',
  culture_present: 'A sociological analysis exploring the reality of labor psychology, urban migration, and informal trader habits today.',
  culture_future: 'A cultural vision mapping emerging demographics, youth adoption of agtech, and future labor paradigms.',
};

// ═══════════════════════════════════════════════════════════════
// THE 15 EDITORIAL BLUEPRINTS (5 FORMATS × 3 ERAS)
// ═══════════════════════════════════════════════════════════════

export const SOP_BLUEPRINTS: Record<`${ArticleFormat}_${ArticleEra}`, SopBlock[]> = {
  // ── 1. BRIEF (SYSTEMIC MARKET) ─────────────────────────────
  brief_past: [
    { type: 'subheading', role: 'The Action-Spiky Title', desc: 'Hook the reader by explicitly naming the systemic failure, location, and action.', hint: 'The $500M Rice Collapse: Why Nigeria\'s Anchor Borrowers Imploded in 2023' },
    { type: 'highlight_card', role: 'The Time of Death', desc: 'Grim image + Total financial or physical yield loss metric.', hint: '82% default rate across ₦400B in disbursed credit' },
    { type: 'timeline_tracker', role: 'The Collapse Sequence', desc: 'A 3-node visual timeline mapping exactly when the dominoes fell.', hint: '2021: Subsidy Launch ➔ 2023: Currency Shock ➔ 2024: Mass Default' },
    { type: 'exec_summary', role: 'The Post-Mortem TL;DR', desc: '3 Bullets: The Original Promise, The Friction Point, The Loss.', hint: 'Three crisp post-mortem takeaway bullets' },
    { type: 'myth_fact', role: 'The Historical Disconnect', desc: 'What central planners believed vs. the brutal reality on the ground.', hint: 'Belief: Subsidies drive yields vs Reality: Arbitrage & diversion' },
    { type: 'core_interactive', role: 'Meat 1: The Breakdown', desc: 'The exact economic and operational mechanics of the systemic failure.', hint: 'Where did the physical commodity and money leak?' },
    { type: 'pull_quote', role: 'The Burned Operator', desc: 'Raw emotional testimony from the victim of the failed policy.', hint: 'Quote from a smallholder aggregator whose inventory was seized' },
    { type: 'media', role: 'The Evidence Gallery', desc: 'Photographic proof of abandoned infrastructure or crashed charts.', hint: 'Photos of rusted silos and abandoned tractors' },
    { type: 'core_interactive', role: 'Meat 2: The Collateral Damage', desc: 'How the failure rippled down the entire regional supply chain.', hint: 'The cascading bank debt and off-taker bankruptcies' },
    { type: 'strategic_directive', role: 'The Commander\'s Intent', desc: 'Terminal UI: Strict commands on policies and practices to dismantle today.', hint: 'Directives for policymakers, DFIs, and fund managers' },
    { type: 'call_to_action', role: 'The Global Banner', desc: 'Join the ecosystem intelligence network to avoid these fatal blind spots.', hint: 'Select Platform Growth Banner' },
  ],
  brief_present: [
    { type: 'subheading', role: 'The Action-Spiky Title', desc: 'The 2026 paradox, affected actors, and the urgent survival command.', hint: 'The ₦1,400/L Fuel Reality: Why Kano Grain Truckers Are Surviving via Nocturnal Haulage' },
    { type: 'highlight_card', role: 'The 2026 Macro-Trigger', desc: 'Tense image + today\'s bleeding-edge inflationary or yield stat.', hint: '340% increase in haulage costs since Q1 2025' },
    { type: 'pull_quote', role: 'The Front-Line Dispatch', desc: 'Frantic quote from a CEO or operator bleeding cash right now for massive FOMO.', hint: '"If our trucks stay parked for 48 hours, the margin on 30 tonnes is wiped out."' },
    { type: 'exec_summary', role: 'The Sit-Rep TL;DR', desc: '3 Bullets: The Crisis, The Underground Workaround, The Market Shift.', hint: 'Three urgent battlefield takeaway bullets' },
    { type: 'myth_fact', role: 'The Operational Disconnect', desc: 'Official government/corporate narrative vs. the underground reality.', hint: 'Official: Rail is operational vs Reality: 98% still on trucks' },
    { type: 'core_interactive', role: 'Meat 1: The Hacker\'s Survival Guide', desc: 'How operators are bypassing broken gatekeepers to stay solvent.', hint: 'The undocumented logistics pooling and nocturnal transit routes' },
    { type: 'media', role: 'The Proof of Concept', desc: 'Photos, manifests, or price charts proving the survival hack works.', hint: 'Waybill comparison and route GPS data' },
    { type: 'core_interactive', role: 'Meat 2: Winners vs. Crushed', desc: 'Who is capturing margin versus who is being wiped out.', hint: 'Direct-to-mill aggregators vs traditional middlemen' },
    { type: 'ecosystem_embed', role: 'The Active Crisis Market', desc: 'Live job listing, talent bounty, or deal room opportunity to solve the crisis.', hint: 'Embed an active Logistics Lead role or Fleet Bounty' },
    { type: 'strategic_directive', role: 'The Commander\'s Intent', desc: 'Terminal UI: Immediate commands on where to deploy capital and hedge today.', hint: 'Directives for trade syndicates and purchasing directors' },
    { type: 'live_poll', role: 'The Pulse Check', desc: 'Real-time industry poll on whether peers are adopting the workaround.', hint: 'Are you actively deploying this nocturnal haulage hack?' },
    { type: 'call_to_action', role: 'The Global Banner', desc: 'Connect into the active FoodNerve trading and liquidity engine.', hint: 'Select Platform Growth Banner' },
  ],
  brief_future: [
    { type: 'subheading', role: 'The Action-Spiky Title', desc: 'Dying paradigm, 2030 breakthrough tech, and strategic pivot command.', hint: 'The End of Diesel Milling: Why Solar Micro-Grids Will Decentralize 65% of Northern Grain by 2030' },
    { type: 'highlight_card', role: 'The Horizon Projection', desc: 'High-tech image + the exact year and market volume of commercial scale.', hint: '$1.8B decentralized milling TAM by 2030' },
    { type: 'exec_summary', role: 'The Strategic Forecast TL;DR', desc: '3 Bullets: The Dying Paradigm, The Disruption Mechanism, The 2030 Impact.', hint: 'Three future horizon projection bullets' },
    { type: 'timeline_tracker', role: 'The Road to 2030', desc: 'A 3-node investment roadmap from R&D pilot to market monopoly.', hint: '2026: Sub-kW Inverter Pilots ➔ 2028: Pay-As-You-Go Scale ➔ 2030: Grid Dominance' },
    { type: 'myth_fact', role: 'The Adoption Disconnect', desc: 'Conservative NGO/incumbent timelines vs. aggressive tech scaling.', hint: 'Myth: Rural farmers cannot afford CAPEX vs Reality: PAYG financing' },
    { type: 'media', role: 'The Blueprint', desc: 'Schematic, CAD diagram, or UI mockup of the future technology.', hint: 'Modular solar milling container schematic' },
    { type: 'core_interactive', role: 'Meat 1: The Mechanism of Disruption', desc: 'How the technology alters unit economics and crushes incumbents.', hint: 'Levelized Cost of Energy (LCOE) comparison vs diesel' },
    { type: 'pull_quote', role: 'The Visionary', desc: 'Direct quote from the AgTech founder or pioneer building the future.', hint: '"We aren\'t selling solar panels; we are selling guaranteed milling uptime."' },
    { type: 'core_interactive', role: 'Meat 2: The Global South Roadblocks', desc: 'Ground realities (tariffs, bad roads, currency) and how pioneers bypass them.', hint: 'Navigating component import clearance and battery degradation' },
    { type: 'strategic_directive', role: 'The Commander\'s Intent', desc: 'Terminal UI: Strict commands on which startups to acquire and seed today.', hint: 'Early-stage venture mandates and equipment financing rules' },
    { type: 'live_poll', role: 'The Pulse Check', desc: 'Engage readers on when they believe commercial parity will be reached.', hint: 'When will solar milling undercut diesel across 50% of the North?' },
    { type: 'call_to_action', role: 'The Global Banner', desc: 'Join the FoodNerve R&D, Deal Room & Venture Working Group.', hint: 'Select Platform Growth Banner' },
  ],

  // ── 2. MEMO (CAPITAL ALLOCATION / VC / DEALS) ──────────────
  memo_past: [
    { type: 'subheading', role: 'The Deal-Flow Autopsy Title', desc: 'Name the failed sector, micro-geography, and capital vaporized.', hint: 'The $12M Crowdfunded Farm Collapse: Why Retail Ag-Debt Blew Up in 2024' },
    { type: 'highlight_card', role: 'The Burn Rate (Killer Stat)', desc: 'Image of closed facility/rusted tech + negative IRR or millions lost.', hint: '-48% Net IRR · $12.4M Principal Vaporized' },
    { type: 'timeline_tracker', role: 'The Runway to Bankruptcy', desc: 'Maps the funding lifecycle from Seed/Series A to liquidation.', hint: '2021: $5M Series A ➔ 2023: Unit Economics Inversion ➔ 2024: Default & Liquidation' },
    { type: 'exec_summary', role: 'The Post-Mortem TL;DR', desc: '3 Bullets: The Original Thesis, The Fatal Flaw, The LP Impact.', hint: 'Three crucial LP post-mortem lessons' },
    { type: 'unit_economics_card', role: 'The Broken Math', desc: 'Hard financial data comparing projected vs actual CAC, margins, and burn.', hint: 'TAM: $200M · Projected IRR: 35% vs Actual: -48% · Ticket: $500k' },
    { type: 'myth_fact', role: 'Pitch Deck vs. Ground Reality', desc: 'What the founders promised vs. the brutal local physics and economics.', hint: 'Promise: 80% Software Gross Margin vs Reality: 12% Logistics Drag' },
    { type: 'core_interactive', role: 'Meat 1: The Execution Failure', desc: 'How inflation, FX devaluation, or bad hardware caused unit economics to flip.', hint: 'Forensic breakdown of working capital leakage and currency mismatch' },
    { type: 'pull_quote', role: 'The Liquidated Founder / Lead VC', desc: 'Raw quote on why they couldn\'t raise the bridge round or service debt.', hint: '"We built for 25% inflation; when it hit 34% and diesel tripled, our off-takers defaulted."' },
    { type: 'strategic_directive', role: 'The Capital Guardrail', desc: 'Terminal UI: Strict underwriting covenants that funds must mandate in due diligence.', hint: 'Never fund unhedged capex models. Require mandatory FX escrow.' },
    { type: 'call_to_action', role: 'The Global Banner', desc: 'Join our Syndicate to co-invest in vetted, de-risked deal flow.', hint: 'Select Platform Growth Banner' },
  ],
  memo_present: [
    { type: 'subheading', role: 'The Arbitrage Thesis Title', desc: 'Name the highly profitable asset/tech and the immediate capital call.', hint: 'The 28% Net IRR Grain Securitization: Deploying $2M into Middle Belt Maize Warehousing' },
    { type: 'highlight_card', role: 'The Active Margin (Killer Stat)', desc: 'Image of active facility + current profit margin or market spread.', hint: '28.4% Net IRR · 90-Day Liquidity Turn · $2.5M Facility' },
    { type: 'unit_economics_card', role: 'The Winning Math', desc: 'Instant financial readout: Input Cost, Yield Realization, Margins, and Payback Period.', hint: 'TAM: $650M · Target IRR: 28.4% · Ticket: $250k - $1M · Gross Margin: 42%' },
    { type: 'exec_summary', role: 'The Investment Thesis TL;DR', desc: '3 Bullets: The Market Gap, The Competitive Moat, The Capital Call.', hint: 'Three crisp investment thesis pillars' },
    { type: 'media', role: 'The Traction Chart', desc: 'Month-over-month revenue growth, off-taker volume, or adoption curve.', hint: 'MoM commodity throughput and off-taker lock-in chart' },
    { type: 'core_interactive', role: 'Meat 1: The Moat & Market Capture', desc: 'How the operator bypasses legacy gatekeepers, inflation, and FX risk.', hint: 'Tri-party collateral management and forward contract hedging' },
    { type: 'pull_quote', role: 'The Scaling CEO or Lead VC', desc: 'Social proof from the executive or partner writing the lead check.', hint: '"We have locked 15,000 MT of industrial grain with Tier-1 breweries before harvest."' },
    { type: 'core_interactive', role: 'Meat 2: Execution Risks', desc: 'Honest breakdown of supply-chain constraints, debt structure, and exit waterfall.', hint: 'Downside scenario sensitivity and default recovery protocols' },
    { type: 'ecosystem_embed', role: 'The Deal Room', desc: 'Live database embed of startups and SPVs currently raising Seed/Series A rounds.', hint: 'Embed active Deal Room investment opportunity or Syndicate allocation' },
    { type: 'strategic_directive', role: 'The Capital Call', desc: 'Terminal UI: Strict allocation directives on ticket size and debt structure.', hint: 'Deploy $500k into asset-backed grain notes with first-lien collateral today.' },
    { type: 'live_poll', role: 'The Allocation Pulse Check', desc: 'Survey accredited investors and fund managers on current deployment appetite.', hint: 'Are you actively allocating private debt to seasonal commodity storage this quarter?' },
    { type: 'call_to_action', role: 'The Global Banner', desc: 'Access the full Data Room and LP Syndicate.', hint: 'Select Platform Growth Banner' },
  ],
  memo_future: [
    { type: 'subheading', role: 'The Disruption Thesis Title', desc: 'Name the 2030 technology and the multi-billion legacy market it will disrupt.', hint: 'The $3.2B CRISPR Seed & Biocontrol Market: Why Early Venture Allocators Win 40x by 2030' },
    { type: 'highlight_card', role: 'Total Addressable Market (TAM)', desc: 'Futuristic image + projected 2030 market cap in billions.', hint: '$3.2B Sub-Saharan Seed Biotech TAM by 2030' },
    { type: 'timeline_tracker', role: 'The Commercialization Runway', desc: 'Visual investment roadmap from R&D pilot to regulatory sandbox to M&A buyout.', hint: '2026: Lab Trials ➔ 2028: Biosafety Clearance ➔ 2030: M&A Buyout by Global Ag' },
    { type: 'exec_summary', role: 'The 2030 Thesis TL;DR', desc: '3 Bullets: Legacy Vulnerability, Technology Catalyst, 10x Exit Path.', hint: 'Three forward-looking venture thesis bullets' },
    { type: 'unit_economics_card', role: 'The Projected Cost Curve', desc: 'Projected drop in hardware/bio-licensing costs (Wright\'s Law) reaching profitability.', hint: 'TAM: $3.2B · Target IRR: 45% · Ticket: $500k Seed · Projected Margin: 68%' },
    { type: 'myth_fact', role: 'The Adoption Skepticism', desc: 'Debunking why incumbents claim deep-tech cannot scale in emerging markets.', hint: 'Myth: Farmers won\'t pay for gene-edited traits vs Reality: 3x yield math' },
    { type: 'core_interactive', role: 'Meat 1: Technology & Defensibility', desc: 'How the underlying IP and biological patents create an unassailable moat.', hint: 'Germplasm patent architecture and climate-stress tolerance genetics' },
    { type: 'media', role: 'Value Chain Disruption Map', desc: 'Visual comparison of 2026 chemical-heavy supply chain vs 2030 biotech model.', hint: 'Flowchart showing elimination of synthetic pesticide inputs' },
    { type: 'pull_quote', role: 'The Deep-Tech Founder / IP Holder', desc: 'Visionary authority from the scientist or founder commercializing the asset.', hint: '"We aren\'t tweaking chemical formulas; we are programming crop immune systems."' },
    { type: 'strategic_directive', role: 'The Seed/Series A Mandate', desc: 'Terminal UI: Strict venture commands on IP acquisition and seed syndication.', hint: 'Lead Seed rounds in proprietary trait platforms before multinationals enter.' },
    { type: 'live_poll', role: 'The Risk Tolerance Pulse Check', desc: 'Poll fund managers on appetite for deep-tech agro investments.', hint: 'Is biotech IP within your fund\'s current risk and timeline mandate?' },
    { type: 'call_to_action', role: 'The Global Banner', desc: 'Join the Darkpore Sovereign, LP & Deep-Tech Venture Syndicate.', hint: 'Select Platform Growth Banner' },
  ],

  // ── 3. PLAYBOOK (TACTICAL OPERATOR SOPS) ────────────────────
  playbook_past: [
    { type: 'subheading', role: 'The Obsolete Protocol Title', desc: 'Name the broken hardware/workflow, micro-geography, and mandate to decommission.', hint: 'The Open-Truck Grain Transport Trap: Why Traditional Bulk Haulage Caused 30% In-Transit Loss' },
    { type: 'highlight_card', role: 'The Operational Bleed (Killer Stat)', desc: 'Image of rusted machinery or gridlocked trucks + exact downtime or yield loss.', hint: '32% moisture spoilage · ₦18M in quarterly inventory write-offs' },
    { type: 'timeline_tracker', role: 'The Wear-and-Tear Cycle', desc: 'Maps physical degradation from installation to maintenance overload to critical failure.', hint: '2022: Fleet Inception ➔ 2024: Maintenance Exceeds Gross Revenue ➔ 2025: Total System Collapse' },
    { type: 'exec_summary', role: 'The Teardown TL;DR', desc: '3 Bullets: The Legacy Workflow, The Point of Failure, The Operational Cost.', hint: 'Three critical operational teardown lessons' },
    { type: 'protocol_steps', role: 'The Flawed SOP', desc: 'Step-by-step breakdown of the legacy standard operating procedure highlighting the exact failure point.', hint: 'Step 1: Bagging in damp jute ➔ Step 2: Unsealed tarpaulin transit ➔ Step 3: Unmonitored offloading' },
    { type: 'media', role: 'The Broken Schematic', desc: 'Process-flow diagram showing the choke point, or photo of failed infrastructure.', hint: 'Photo of water ingress and mold infestation during open transit' },
    { type: 'myth_fact', role: 'The Maintenance Illusion', desc: 'Debunking why operators think repair is cheaper than a full systems overhaul.', hint: 'Myth: Patching old tarps saves cash vs Reality: Water damage costs 10x the tarp' },
    { type: 'core_interactive', role: 'Meat 1: The Cascading Facility Failure', desc: 'How this single broken workflow/machine destroyed downstream factory margins.', hint: 'How wet grain fouled downstream hammer mills and jammed sorting conveyors' },
    { type: 'pull_quote', role: 'The Frustrated Floor Manager', desc: 'Raw quote from the engineer/supervisor who struggled to keep the broken system alive.', hint: '"We were spending ₦450,000 every weekend patching generators that should have been scrapped."' },
    { type: 'strategic_directive', role: 'The Decommission Mandate', desc: 'Terminal UI: Strict commands to rip out legacy hardware and decommission obsolete routes immediately.', hint: 'Decommission open haulage immediately. Ban unsealed jute storage across all depots.' },
    { type: 'call_to_action', role: 'The Global Banner', desc: 'Upgrade your operations with verified modern FoodNerve Operator SOPs.', hint: 'Select Platform Growth Banner' },
  ],
  playbook_present: [
    { type: 'subheading', role: 'The Survival SOP Title', desc: 'Name the operational hack and the command to implement it today.', hint: 'The 48-Hour Cassava Flash-Drying SOP: Slashing Post-Harvest Cyanide & Spoilage to Zero' },
    { type: 'highlight_card', role: 'The Efficiency Metric (Killer Stat)', desc: 'Gritty photo of the hack in action + exact OPEX saved or yield gained.', hint: '98% Grade-A Flour Recovery · 400L Diesel Saved Weekly' },
    { type: 'media', role: 'The Tactical Schematic (Front-Loaded)', desc: 'Visual wiring diagram, retrofitted hardware layout, or floor plan before reading.', hint: 'CAD layout of modular flash-dryer and solar pre-heater assembly' },
    { type: 'exec_summary', role: 'The Protocol TL;DR', desc: '3 Bullets: The Operational Crisis, The Hardware Fix, The Margin Saved.', hint: 'Three immediate execution guidelines' },
    { type: 'protocol_steps', role: 'The Execution Checklist', desc: 'Actionable numbered checklist with roles, time windows, and procedural steps.', hint: 'Step 1: Dawn Harvest Triage ➔ Step 2: Mechanical Peeling ➔ Step 3: Pneumatic Pressing ➔ Step 4: Flash Drying' },
    { type: 'core_interactive', role: 'Meat 1: Safety & Calibration', desc: 'How to train floor staff to execute the new hack without causing equipment downtime.', hint: 'Calibrating burner temperatures and moisture testing protocols' },
    { type: 'pull_quote', role: 'The Active Floor Manager', desc: 'Quote from a local facility lead currently running this exact hack validating throughput.', hint: '"By pre-heating the drying chamber with solar collectors, we cut diesel startup time by 65%."' },
    { type: 'ecosystem_embed', role: 'The Talent/Vendor Hub', desc: 'Live database embed linking to certified local technicians or equipment suppliers.', hint: 'Embed certified Solar Thermal Technicians or Maintenance Engineers for hire' },
    { type: 'strategic_directive', role: 'The Implementation Command', desc: 'Terminal UI: Strict deadline and procedural mandate for facility leads.', hint: 'Deploy this pre-heater retrofit across all processing lines before September harvest.' },
    { type: 'live_poll', role: 'The Deployment Pulse Check', desc: 'Survey fellow operators on their implementation status and bottlenecks.', hint: 'Have you successfully retrofitted solar pre-heaters at your processing hub?' },
    { type: 'call_to_action', role: 'The Global Banner', desc: 'Download full technical CAD schematics and certify your facility on FoodNerve.', hint: 'Select Platform Growth Banner' },
  ],
  playbook_future: [
    { type: 'subheading', role: 'The Next-Gen SOP Title', desc: 'Name the 2030 automated upgrade and the command to start retraining staff now.', hint: 'Autonomous Drone Sorting & Optical Grading: The 2030 Packing House Standard Operating Procedure' },
    { type: 'highlight_card', role: 'The Automation Horizon (Killer Stat)', desc: 'Sleek photo of autonomous facility + projected efficiency and error rate.', hint: '12 Tonnes/Hour Throughput · 0.05% Sorting Error · 90% Labor Shift' },
    { type: 'exec_summary', role: 'The Transition TL;DR', desc: '3 Bullets: The Obsolete Skill, The New Tooling, The Training Protocol Required.', hint: 'Three pillars of the autonomous packing floor' },
    { type: 'media', role: 'The Operator Interface', desc: 'UI mockup of the future edge software dashboard or 3D render of automated floor layout.', hint: 'Edge AI telemetry dashboard showing real-time fruit defect grading' },
    { type: 'protocol_steps', role: 'The 2030 Workflow', desc: 'Step-by-step walkthrough of a Day in the Life of a 2030 high-tech facility manager.', hint: 'Step 1: Drone Fleet Morning Telemetry ➔ Step 2: Optical Belt Calibration ➔ Step 3: Pneumatic Sorter Routing' },
    { type: 'myth_fact', role: 'The Automation Fear', desc: 'Debunking labor panic vs reality of the high-value technical facility manager.', hint: 'Myth: Automation eliminates the plant manager vs Reality: Upgrades them into Systems Architect' },
    { type: 'core_interactive', role: 'Meat 1: The Skill-Gap & Retraining Protocol', desc: 'Exact technical certifications and IoT maintenance skills current employees must learn today.', hint: 'PLC programming, edge sensor diagnostics, and pneumatic calibration curriculum' },
    { type: 'pull_quote', role: 'The Hardware Engineer', desc: 'Quote from the robotics engineer building the technology on the learning curve.', hint: '"The hardest part isn\'t the AI vision; it\'s teaching rural operators how to calibrate air pressure valves."' },
    { type: 'strategic_directive', role: 'The Retraining Mandate', desc: 'Terminal UI: Strict executive directives on IoT upgrades and technician reskilling.', hint: 'Mandate edge IoT diagnostics training for all plant technicians by Q4 2026.' },
    { type: 'live_poll', role: 'The Workforce Readiness Pulse Check', desc: 'Survey plant owners on whether their current staff can manage high-tech infrastructure.', hint: 'Is your current technical team ready to operate automated optical sorters?' },
    { type: 'call_to_action', role: 'The Global Banner', desc: 'Join the FoodNerve Mechanization & Hardware Guild.', hint: 'Select Platform Growth Banner' },
  ],

  // ── 4. COMPARISON (HEAD-TO-HEAD BENCHMARK) ──────────────────
  comparison_past: [
    { type: 'subheading', role: 'The Showdown Title', desc: 'Name Option A vs Option B, historical crisis in micro-geography, and victor command.', hint: 'Government Silos vs. Private Hermetic Bags: Why Centralized Storage Lost in 2022' },
    { type: 'highlight_card', role: 'The Divergence Metric (Killer Stat)', desc: 'Split image showing both models + exact statistical gap in survival/loss rate.', hint: '45% silo spoilage vs 2% hermetic bag loss · ₦32B in wasted CAPEX' },
    { type: 'comparison_matrix', role: 'Pre-Crash Tale of the Tape', desc: 'Side-by-side spec grid of both models before the crisis hit showing initial metrics.', hint: 'Side-by-side criteria: CAPEX, Maintenance, Energy Dependency, Spoilage Risk' },
    { type: 'exec_summary', role: 'The Showdown TL;DR', desc: '3 Bullets: The Contenders, The Stress Test, The Undisputed Winner.', hint: 'Three decisive historical comparison takeaways' },
    { type: 'media', role: 'The Divergence Chart', desc: 'Line chart showing the moment during the crisis when Option A costs skyrocketed.', hint: 'Cumulative spoilage and maintenance cost curve during 2022 flood season' },
    { type: 'core_interactive', role: 'Meat 1: Fatal Flaw of the Loser', desc: 'Deconstruct why Option A looked good on paper but failed under real-world stress.', hint: 'Centralized grid failure, humidity traps, and bureaucratic maintenance backlog' },
    { type: 'myth_fact', role: 'The Historical Consensus', desc: 'What the market believed vs the hidden structural fragility.', hint: 'Myth: Centralized mega-silos are safest vs Reality: Single point of failure' },
    { type: 'core_interactive', role: 'Meat 2: Resilient Winner Mechanics', desc: 'How Option B physically absorbed the macro shock at farm-gate level.', hint: 'Decentralized hermetic storage, zero energy draw, and localized farmer control' },
    { type: 'pull_quote', role: 'The Referee', desc: 'Quote from a veteran market auditor or official who watched the showdown play out.', hint: '"The government spent billions building steel silos with no power to run aerators."' },
    { type: 'strategic_directive', role: 'The Procurement Mandate', desc: 'Terminal UI: Permanently strip Option A from supply chain; standardize on Option B.', hint: 'Dismantle centralized silo subsidies. Mandate 100% procurement of hermetic bags.' },
    { type: 'call_to_action', role: 'The Global Banner', desc: 'Access the full FoodNerve Historical Technical Benchmark Library.', hint: 'Select Platform Growth Banner' },
  ],
  comparison_present: [
    { type: 'subheading', role: 'The Live Benchmark Title', desc: 'Name the two active 2026 workarounds, micro-geography, and capital deployment command.', hint: 'Kano Dry Port vs. Kaduna Rail Freight: The 72-Hour Grain Logistics Showdown' },
    { type: 'highlight_card', role: 'The ROI Gap (Killer Stat)', desc: 'Split-screen photo of both systems + exact cost-savings differential.', hint: '₦45,000/Tonne Saved · 36 Hours Faster Transit via Rail Corridor' },
    { type: 'comparison_matrix', role: 'The TCO Benchmark Table (Front-Loaded)', desc: '4-row matrix comparing CAPEX, OPEX, Maintenance, and Local Repairability with Winner Verdict.', hint: 'CAPEX, OPEX/Tonne, Turnaround Time, Checkpoint Tolls · Winner: Kaduna Rail' },
    { type: 'exec_summary', role: 'The Benchmark TL;DR', desc: '3 Bullets: The Immediate Need, Cost/Benefit of A vs B, The Recommended Choice.', hint: 'Three immediate procurement decision takeaways' },
    { type: 'myth_fact', role: 'The Marketing Disconnect', desc: 'Sales rep promises for Option A vs brutal reality of dust, heat, and hidden costs.', hint: 'Promise: Dry Port automated customs vs Reality: 5-day demurrage bottleneck' },
    { type: 'core_interactive', role: 'Meat 1: Incumbent vs Challenger', desc: 'Introduce both options and their baseline physical and financial mechanics.', hint: 'Comparing flatbed road haulage logistics vs scheduled bulk freight wagons' },
    { type: 'pull_quote', role: 'The Active Operator', desc: 'Raw quote from a logistics CEO who ripped out Option A and adopted Option B.', hint: '"We pulled 60 trucks off the Abuja highway and shifted entirely to night rail wagons."' },
    { type: 'core_interactive', role: 'Meat 2: Field Test Results', desc: 'Real-world performance under current August 2026 inflation and fuel stress.', hint: 'Diesel sensitivity analysis and road security checkpoint expense logs' },
    { type: 'ecosystem_embed', role: 'The Vendor / Talent Match', desc: 'Live database link connecting to verified vendors selling Option B or technicians to install.', hint: 'Embed verified Freight Brokers or Fleet Operators with active booking capacity' },
    { type: 'strategic_directive', role: 'The Purchasing Command', desc: 'Terminal UI: Halt procurement of Option A; reallocate Q3/Q4 CAPEX entirely to Option B.', hint: 'Halt road haulage contracts. Reallocate Q3/Q4 logistics budget to rail SPVs.' },
    { type: 'live_poll', role: 'The Market Share Pulse Check', desc: 'Survey fellow operators on which solution their facility is actively deploying right now.', hint: 'Which transit corridor is your fleet prioritizing this harvest season?' },
    { type: 'call_to_action', role: 'The Global Banner', desc: 'Connect with verified freight haulers and equipment vendors on FoodNerve.', hint: 'Select Platform Growth Banner' },
  ],
  comparison_future: [
    { type: 'subheading', role: 'The 2030 Standard Title', desc: 'Name the two emerging technologies competing for dominance and the protocol to back.', hint: 'USSD Feature Phones vs. Account Abstraction Smart Contracts: Who Powers Rural Ag-Credit in 2030?' },
    { type: 'highlight_card', role: 'The Adoption Trajectory (Killer Stat)', desc: 'Futuristic split-screen image + projected market-capture percentage of winning tech.', hint: '0.2% Fee vs 3.5% Telco Toll · 74% Projected Smart Contract Share by 2030' },
    { type: 'timeline_tracker', role: 'The Overtake Horizon', desc: 'Visual roadmap showing exactly when Tech B crosses the parity threshold and kills Tech A.', hint: '2026: Competing Pilots ➔ 2028: Offline Gas Fee Parity ➔ 2030: Telco USSD Obsolescence' },
    { type: 'exec_summary', role: 'The Format War TL;DR', desc: '3 Bullets: Competing Paradigms, Deciding Tech Factor, Projected Monopoly.', hint: 'Three strategic format war pillars' },
    { type: 'core_interactive', role: 'Meat 1: Infrastructure Battle', desc: 'Fundamental difference in how Tech A vs Tech B solves the problem mechanically.', hint: 'Centralized telecom SMS gateways vs decentralized cryptographic state channels' },
    { type: 'comparison_matrix', role: 'The Scalability Scorecard', desc: 'Compare both futuristic technologies based on Global South viability and energy draw.', hint: 'Offline Verification, Transaction Cost, Telco Dependency, Settlement Speed' },
    { type: 'myth_fact', role: 'The Legacy Bias', desc: 'Debunking why market chooses lowest friction for offline users over pure complexity.', hint: 'Myth: Farmers won\'t adopt crypto keys vs Reality: Passkey abstraction is seamless' },
    { type: 'core_interactive', role: 'Meat 2: Network Effects & Roadblocks', desc: 'Which tech is hitting a scalability wall vs which is achieving exponential viral growth.', hint: 'Telco tariff pushback vs open-source smart contract liquidity pooling' },
    { type: 'pull_quote', role: 'The Standard-Setter', desc: 'Quote from a deep-tech standards architect declaring the fatal flaw in the losing tech.', hint: '"USSD is a rent-seeking toll road; Account Abstraction turns credit into open code."' },
    { type: 'strategic_directive', role: 'The Syndicate Mandate', desc: 'Terminal UI: Divest from startups on Protocol A; concentrate Seed capital into Protocol B.', hint: 'Divest from pure USSD agritechs. Lead Seed rounds in hybrid smart-contract protocols.' },
    { type: 'live_poll', role: 'The Betting Pulse Check', desc: 'Poll founders and venture partners on which standard will establish the 2030 monopoly.', hint: 'Which protocol will dominate rural agricultural settlements by 2030?' },
    { type: 'call_to_action', role: 'The Global Banner', desc: 'Join the FoodNerve Developer, FinTech & Standards Working Group.', hint: 'Select Platform Growth Banner' },
  ],

  // ── 5. CULTURE (HUMAN, LABOR & SOCIOLOGY) ────────────────────
  culture_past: [
    { type: 'subheading', role: 'The Action-Spiky Title', desc: 'Name the demographic collapse, micro-geography, and mandate for policy/HR leaders.', hint: 'The Disappearing Farm Hand: How Urban Migration Emptied Northern Fields in the 2010s' },
    { type: 'highlight_card', role: 'The Exodus Metric (Killer Stat)', desc: 'Stark photo of abandoned village + exact number of workers/youth who fled.', hint: '64% average farmer age increase · 40% of arable land left fallow' },
    { type: 'timeline_tracker', role: 'The Generational Drain', desc: 'Maps the slow decay and labor drain of the rural community over time.', hint: '2015: Urban Tech/Oil Boom ➔ 2020: Average Farmer Age Hits 62 ➔ 2024: 40% Fallow Land' },
    { type: 'exec_summary', role: 'The Sociological TL;DR', desc: '3 Bullets: Historical Community Structure, Catalyst for Exodus, Permanent Labor Void.', hint: 'Three decisive sociological findings' },
    { type: 'persona_dossier', role: 'The "Left-Behind" Profile', desc: 'Puts a human face on macro data: 65yo farm owner with no successor, acreage, and inheritance fears.', hint: 'Mallam Haruna Sanusi · 68 yrs · 45 Hectares · "My sons are driving tricycles in Kano."' },
    { type: 'myth_fact', role: 'The Labor Disconnect', desc: 'Debunking why youth left: not laziness, but sub-poverty manual labor unit economics.', hint: 'Myth: Youth dislike farming vs Reality: Daily farm wage fell 60% below city gig-work' },
    { type: 'core_interactive', role: 'Meat 1: The Cultural Fracture', desc: 'Trigger event and how it forced a specific demographic to abandon the micro-geography.', hint: 'The breakdown of traditional apprenticeship and community labor pooling' },
    { type: 'pull_quote', role: 'The Village Elder / Community Leader', desc: 'Raw emotional testimony reflecting on lost heritage and community fracturing.', hint: '"When the rain falls now, only old men and children come out to the fields."' },
    { type: 'core_interactive', role: 'Meat 2: The Generational Debt', desc: 'Long-term fallout: daughters pulled from school to cover labor gaps, land sold to corps.', hint: 'Generational wealth destruction and rural real estate fire-sales' },
    { type: 'strategic_directive', role: 'The Policy Mandate', desc: 'Terminal UI: Dismantle extractive labor practices; restructure rural incentive frameworks.', hint: 'Dismantle uncollateralized manual labor expectations. Subsidize youth mechanization pools.' },
    { type: 'call_to_action', role: 'The Global Banner', desc: 'Sponsor a rural youth fellowship and upskilling program on FoodNerve Society.', hint: 'Select Platform Growth Banner' },
  ],
  culture_present: [
    { type: 'subheading', role: 'The Human-Interest Title', desc: 'Name the lifestyle paradox or talent crisis, micro-geography, and recruiter mandate.', hint: 'The $120k Agronomist: Why Lagos Agribusinesses Are Poaching Talent From Northern Farms' },
    { type: 'highlight_card', role: 'The Talent Premium (Killer Stat)', desc: 'Photo of modern operator + jarring salary/deficit stat.', hint: '$120k Peak Salary · 300% Gig Labor Wage Spike · 14-Month Vacancy Average' },
    { type: 'persona_dossier', role: 'The Highly-Sought Operator (Front-Loaded)', desc: 'Profile the talent everyone is fighting over: avatar, role, location, and poaching reality.', hint: 'Sarah Adeyemi · Cold-Chain Logistics Lead · "I received 4 buyout offers this month alone."' },
    { type: 'exec_summary', role: 'The Lifestyle / Talent TL;DR', desc: '3 Bullets: The Human Crisis, The Operational Impact, The Hiring Workaround.', hint: 'Three urgent talent crisis takeaways' },
    { type: 'core_interactive', role: 'Meat 1: A Day in the Life', desc: 'Vivid narrative detailing what it takes to do this job and live in this region in August 2026.', hint: 'Morning telemetry monitoring, generator triage, and outgrower dispute mediation' },
    { type: 'ecosystem_embed', role: 'The Active Talent Pool', desc: 'Monetization engine: Live link to verified Agronomists and Logistics Leads looking for work.', hint: 'Embed active FoodNerve Talent Network Candidates & Job Openings' },
    { type: 'myth_fact', role: 'The "Cheap Labor" Illusion', desc: 'Debunking cheap manual labor myth: human energy is now the most expensive farm input.', hint: 'Myth: Rural labor is cheap and plentiful vs Reality: Daily wages inflated 300%' },
    { type: 'pull_quote', role: 'The Frustrated HR Director', desc: 'Raw quote from an agribusiness VP who cannot scale because of the specialized talent deficit.', hint: '"We have $5M in greenhouses sitting idle because we cannot find 4 qualified fertigation engineers."' },
    { type: 'core_interactive', role: 'Meat 2: The Social Ripple Effect', desc: 'Impact on families, gender dynamics, and rural lifestyle changes.', hint: 'The "Bachelor Belt" crisis and young farm managers struggling to balance rural life' },
    { type: 'strategic_directive', role: 'The Hiring Command', desc: 'Terminal UI: Overhaul compensation; aggressively recruit electro-mechanical engineers.', hint: 'Stop recruiting general agronomists. Retrain electro-mechanical technicians immediately.' },
    { type: 'live_poll', role: 'The Recruitment Pulse Check', desc: 'Survey hiring managers on whether they are struggling to fill specialized technical roles.', hint: 'Are you currently struggling to recruit qualified technical farm operators?' },
    { type: 'call_to_action', role: 'The Global Banner', desc: 'Browse the FoodNerve Talent Network or post a bounty for verified agronomists.', hint: 'Select Platform Growth Banner' },
  ],
  culture_future: [
    { type: 'subheading', role: 'The 2030 Workforce Title', desc: 'Name the next-gen white-collar job role, micro-geography, and education mandate.', hint: 'The Drone Swarm Commander: Why Farming Becomes a $90k STEM Career by 2030' },
    { type: 'highlight_card', role: 'The Reverse-Migration Metric (Killer Stat)', desc: 'Sleek image of youth operating tech in fields + projected tech-talent influx metric.', hint: '42% STEM Graduate Influx · $95k Average Remote Farm Architect Compensation' },
    { type: 'timeline_tracker', role: 'The Retraining Chasm', desc: 'Visual roadmap mapping the skills shift from manual labor to AI prompt engineering.', hint: '2026: Manual Harvesting ➔ 2028: IoT Fleet Maintenance ➔ 2030: AI Agronomy Systems' },
    { type: 'exec_summary', role: 'The Future Talent TL;DR', desc: '3 Bullets: The Dying Manual Role, The Emerging Tech Skillset, The 2030 Cultural Shift.', hint: 'Three future workforce pillars' },
    { type: 'persona_dossier', role: 'The "New Collar" Worker', desc: 'Profile of the 2030 operator: avatar, role, daily throughput, and AI-first philosophy.', hint: 'Zainab Danjuma · Autonomous Swarm Architect · "I manage 200 hectares from my solar villa."' },
    { type: 'myth_fact', role: 'The Job-Loss Fallacy', desc: 'Automation destroys back-breaking manual labor but creates huge deficit for tech fleet managers.', hint: 'Myth: Automation destroys agro employment vs Reality: Upgrades wages 5x for skilled tech' },
    { type: 'core_interactive', role: 'Meat 1: The New Daily Workflow', desc: 'Day-to-day operations of the 2030 worker interacting with robotics and AgroLLMs.', hint: 'Approving algorithmic spray plans, managing satellite vegetation indexes, and fleet uptime' },
    { type: 'pull_quote', role: 'The Ed-Tech Founder', desc: 'Quote from vocational training pioneer preparing the next-gen agricultural workforce.', hint: '"We aren\'t teaching kids how to swing a hoe; we are teaching them Python and soil sensor networks."' },
    { type: 'core_interactive', role: 'Meat 2: Who Gets Left Behind?', desc: 'The brutal transition reality for aging, unbanked farmers and how to bridge the gap.', hint: 'Voice-first AI interfaces and intergenerational tech-cooperative structures' },
    { type: 'strategic_directive', role: 'The Education Mandate', desc: 'Terminal UI: Partner with universities to launch IoT ag-curriculums today.', hint: 'Partner with regional polytechnics. Fund 500 annual vocational agritech scholarships.' },
    { type: 'live_poll', role: 'The Workforce Readiness Pulse Check', desc: 'Poll corporate leaders on whether their training budget is preparing staff for 2030.', hint: 'Is your current company training budget preparing staff for AI-assisted robotics?' },
    { type: 'call_to_action', role: 'The Global Banner', desc: 'Apply to the FoodNerve Future Farmers & Founders Fellowship.', hint: 'Select Platform Growth Banner' },
  ],
};

export function getBlueprint(format: ArticleFormat, era: ArticleEra): SopBlock[] {
  const key = `${format}_${era}` as const;
  return SOP_BLUEPRINTS[key] || SOP_BLUEPRINTS.brief_present;
}
