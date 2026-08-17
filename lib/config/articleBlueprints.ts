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
  | 'call_to_action';

export interface SopBlock {
  type: BlockType;
  role: string;
  desc: string;
  hint: string;
}

export const FORMAT_CONFIG: Record<ArticleFormat, { label: string; icon: string; emoji: string; color: string; desc: string }> = {
  brief: {
    label: 'Market Brief',
    icon: 'Article',
    emoji: '📑',
    color: '#3b82f6',
    desc: 'Systemic market focus. What is breaking or working, and why?',
  },
  memo: {
    label: 'Investment Memo',
    icon: 'TrendingUp',
    emoji: '💼',
    color: '#10b981',
    desc: 'Capital allocation focus. Deal-flow, TAM, IRR, and M&A buyouts.',
  },
  playbook: {
    label: 'Operator Playbook',
    icon: 'Build',
    emoji: '🛠️',
    color: '#f59e0b',
    desc: 'Tactical operator focus. Step-by-step SOPs, teardowns, and survival hacks.',
  },
  comparison: {
    label: 'Head-to-Head Comparison',
    icon: 'CompareArrows',
    emoji: '⚖️',
    color: '#8b5cf6',
    desc: 'Head-to-head benchmark across technologies, locations, or key actors.',
  },
  culture: {
    label: 'Cultural & Human Ground',
    icon: 'People',
    emoji: '🌾',
    color: '#ec4899',
    desc: 'Human-interest, demographics, labor sociology, and rural lifestyle shifts.',
  },
};

export const ERA_CONFIG: Record<ArticleEra, { label: string; emoji: string; color: string; desc: string }> = {
  past: {
    label: 'The Autopsy',
    emoji: '🔴',
    color: '#ef4444',
    desc: 'Historical autopsies. Why initiatives failed or succeeded prior to 2026.',
  },
  present: {
    label: 'The Battlefield Report',
    emoji: '🟢',
    color: '#10b981',
    desc: 'The reality today. How operators are surviving current market shocks.',
  },
  future: {
    label: 'The 2030 Horizon',
    emoji: '🔵',
    color: '#3b82f6',
    desc: 'The forward thesis. Emerging technologies, R&D, and 2030 scale.',
  },
};

// ═══════════════════════════════════════════════════════════════
// THE 15 EDITORIAL BLUEPRINTS (5 FORMATS × 3 ERAS)
// ═══════════════════════════════════════════════════════════════

export const SOP_BLUEPRINTS: Record<`${ArticleFormat}_${ArticleEra}`, SopBlock[]> = {
  // ── 1. BRIEF (SYSTEMIC MARKET) ─────────────────────────────
  brief_past: [
    { type: 'subheading', role: 'The Spiky Title', desc: 'Hook the reader by explicitly naming the systemic failure and location.', hint: 'Why Nigeria\'s $500M Rice Initiative Collapsed in 2023' },
    { type: 'highlight_card', role: 'The Autopsy Metric', desc: 'The undeniable stat that proves the collapse.', hint: '82% of anchor loan defaults' },
    { type: 'exec_summary', role: 'Systemic TL;DR', desc: 'Deliver the core argument instantly for policy and trade executives.', hint: 'Three crisp takeaway bullets' },
    { type: 'myth_fact', role: 'The Disconnect', desc: 'Contrasting what Abuja believed with what occurred on the farm.', hint: 'Belief: Subsidies drive yields vs Reality: Arbitrage' },
    { type: 'core_interactive', role: 'The Breakdown Mechanics', desc: 'Root cause analysis of the systemic supply-chain rupture.', hint: 'Where did the physical commodity leak?' },
    { type: 'pull_quote', role: 'The Operator Truth', desc: 'Raw testimony from aggregators or trade participants.', hint: 'Quote from a local cooperative president' },
    { type: 'media', role: 'Evidence Gallery', desc: 'Photographic or data chart evidence of the failure.', hint: 'Chart showing abandoned processing units' },
    { type: 'strategic_directive', role: 'The Commander\'s Intent', desc: 'Strict directives on what never to repeat in policy or trade.', hint: 'Directives for policymakers and DFIs' },
    { type: 'live_poll', role: 'Ecosystem Pulse Check', desc: 'Engage readers on whether this systemic flaw still lingers.', hint: 'Is this structural flaw still present in your state?' },
    { type: 'call_to_action', role: 'Ecosystem Access CTA', desc: 'Direct readers to the FoodNerve Deal Room & Intelligence Network.', hint: 'Select Macro CTA' },
  ],
  brief_present: [
    { type: 'subheading', role: 'The Spiky Title', desc: 'Name the current systemic crisis and who is absorbing the shock.', hint: 'How Middle Belt Grain Truckers Are Surviving ₦1,200/L Fuel' },
    { type: 'highlight_card', role: 'The 2026 Macro-Trigger', desc: 'The killer metric driving the crisis right now.', hint: '340% increase in haulage costs since 2024' },
    { type: 'exec_summary', role: 'Battlefield TL;DR', desc: 'Key operational takeaways for immediate decision-makers.', hint: 'Three urgent takeaway bullets' },
    { type: 'pull_quote', role: 'The Ground Truth', desc: 'Raw quote from an active value-chain operator.', hint: 'Quote from an active logistics broker' },
    { type: 'core_interactive', role: 'The Survival Hack', desc: 'Detail the undocumented workaround operators are using to stay solvent.', hint: 'How are aggregators pooling diesel generators?' },
    { type: 'media', role: 'The Data Proof', desc: 'Supporting price index or logistics route diagram.', hint: 'Price spread map from Kano to Lagos' },
    { type: 'core_interactive', role: 'Winners vs. Crushed', desc: 'Clear breakdown of who is capturing margin versus who is going bankrupt.', hint: 'Off-takers vs smallholder brokers' },
    { type: 'strategic_directive', role: 'The Commander\'s Intent', desc: 'Aggressive commands on where to deploy capital or fix bottlenecks today.', hint: 'Immediate actions for trade syndicates' },
    { type: 'live_poll', role: 'Battlefield Poll', desc: 'Survey real-time sentiment from industry readers.', hint: 'Are you passing haulage inflation to retail buyers?' },
    { type: 'call_to_action', role: 'Platform Growth CTA', desc: 'Connect readers into the active FoodNerve trading network.', hint: 'Select Macro CTA' },
  ],
  brief_future: [
    { type: 'subheading', role: 'The Spiky Title', desc: 'Name the paradigm shift and the 2030 arrival date.', hint: 'Why Solar Micro-Grids Will Decentralize 60% of Grain Milling by 2030' },
    { type: 'highlight_card', role: 'The Horizon Metric', desc: 'The projected market transformation metric.', hint: '$1.4B decentralized milling TAM by 2030' },
    { type: 'exec_summary', role: 'The 2030 Thesis TL;DR', desc: 'Three core pillars of the transformation.', hint: 'Three future projection bullets' },
    { type: 'myth_fact', role: 'The Transition Myth', desc: 'Debunking why incumbents think the old way will survive.', hint: 'Myth: Grid power will stabilize first' },
    { type: 'core_interactive', role: 'Mechanism of Disruption', desc: 'Technical and economic explanation of how the shift scales.', hint: 'Capex payback curve of lithium storage in rural hubs' },
    { type: 'media', role: 'The Architecture Blueprint', desc: 'Schematic or forward-looking adoption curve.', hint: 'Deployment roadmap diagram' },
    { type: 'core_interactive', role: 'African Friction & Reality', desc: 'Realistic roadblocks (bad roads, tariffs) and how pioneers bypass them.', hint: 'How to handle local customs and currency risk' },
    { type: 'strategic_directive', role: 'The Strategic Play', desc: 'Where forward-thinking funds and builders must position capital now.', hint: 'Invest in distributed power infrastructure today' },
    { type: 'live_poll', role: 'Horizon Consensus Poll', desc: 'Poll the community on adoption timelines.', hint: 'Will solar milling reach 50% adoption before 2030?' },
    { type: 'call_to_action', role: 'Ecosystem CTA', desc: 'Join the FoodNerve R&D & Innovation Working Group.', hint: 'Select Macro CTA' },
  ],

  // ── 2. MEMO (CAPITAL ALLOCATION / VC / DEALS) ──────────────
  memo_past: [
    { type: 'subheading', role: 'Deal Post-Mortem Title', desc: 'Name the fund, valuation mistake, or debt collapse.', hint: 'The ₦2.5B Warehouse Receipt Default: An Investor Autopsy' },
    { type: 'highlight_card', role: 'Capital Destroyed', desc: 'Total write-down or loss metric.', hint: '₦2.5B in uncollateralized receipts' },
    { type: 'exec_summary', role: 'Investment Committee TL;DR', desc: 'Summary of the failed investment thesis and counterparty risk.', hint: '3 crucial LP lessons' },
    { type: 'myth_fact', role: 'The Valuation Illusion', desc: 'Paper ARR vs ground cash-flow reality.', hint: 'Valuation based on GMV vs actual net spread' },
    { type: 'core_interactive', role: 'Forensic Accounting Teardown', desc: 'Where the working capital leaked in the ledger.', hint: 'Unhedged commodity price volatility' },
    { type: 'pull_quote', role: 'LP / Deal Lead Retrospective', desc: 'Candid quote from the investment committee lead.', hint: 'Quote from the former GP' },
    { type: 'media', role: 'The Loss Waterfall', desc: 'Balance sheet or liquidation waterfall graphic.', hint: 'Liquidation recovery chart' },
    { type: 'strategic_directive', role: 'Underwriting Mandate', desc: 'Strict underwriting covenants that funds must adopt to prevent recurrence.', hint: 'New collateral requirements for agritech debt' },
    { type: 'live_poll', role: 'Investor Risk Poll', desc: 'Gauge current debt exposure among LPs in the network.', hint: 'Does your fund still hold uncollateralized inventory debt?' },
    { type: 'call_to_action', role: 'Deal Room Access', desc: 'Access vetted institutional deal pipelines in Darkpore.', hint: 'Select Macro CTA' },
  ],
  memo_present: [
    { type: 'subheading', role: 'Deal Memorandum Title', desc: 'Name the live asset, ticket size, and yield opportunity.', hint: 'Structuring a ₦500M Off-Taker SPV: 24% IRR in Middle Belt Maize' },
    { type: 'highlight_card', role: 'Target TAM & IRR', desc: 'Key financial metrics for institutional allocators.', hint: '24% Net IRR · 90-Day Cycle · ₦500M Facility' },
    { type: 'exec_summary', role: 'Executive Deal Summary', desc: 'Bullet points on structure, collateral, and repayment waterfall.', hint: 'Three core investment pillars' },
    { type: 'core_interactive', role: 'Unit Economics & Cash Waterfall', desc: 'Full breakdown of buy-price, transport, storage, and off-taker lock.', hint: 'Detailed margin per metric tonne' },
    { type: 'media', role: 'Term Sheet Schematic', desc: 'SPV structure diagram showing cash and commodity flows.', hint: 'Upload legal and escrow structure diagram' },
    { type: 'pull_quote', role: 'Anchor Off-Taker Commitment', desc: 'Letter of intent or verified quote from the creditworthy corporate buyer.', hint: 'Quote from the industrial FMCG buyer' },
    { type: 'core_interactive', role: 'Downside Mitigation', desc: 'How insurance, GPS tracking, and forward pricing de-risk the principal.', hint: 'Tri-party collateral management agreement details' },
    { type: 'strategic_directive', role: 'Capital Allocation Directive', desc: 'Specific deployment terms and ticket syndication guidelines.', hint: 'Co-investment criteria for syndicate members' },
    { type: 'live_poll', role: 'Syndication Appetite', desc: 'Gauge co-investment interest from accredited investors.', hint: 'Would your firm participate in a 90-day 24% APR grain note?' },
    { type: 'call_to_action', role: 'Enter Deal Room', desc: 'Direct accredited investors to request the confidential data room.', hint: 'Select Macro CTA' },
  ],
  memo_future: [
    { type: 'subheading', role: 'The 2030 Asset Class Title', desc: 'Name the emerging financial instrument and market size.', hint: 'Securitized Cold-Chain Yield: The ₦10B Infrastructure Play for 2030' },
    { type: 'highlight_card', role: 'Projected Asset TAM', desc: 'The multi-billion Naira market size projection.', hint: '₦10B Securitized Debt Market by 2030' },
    { type: 'exec_summary', role: 'The New Asset Class TL;DR', desc: 'Why this infrastructure asset will yield superior risk-adjusted returns.', hint: 'Three forward-looking investment theses' },
    { type: 'core_interactive', role: 'The Yield Architecture', desc: 'How tokenized or syndicated energy-as-a-service contracts generate cash.', hint: 'Pay-as-you-store revenue model' },
    { type: 'media', role: 'Institutional Cash Flow Model', desc: '10-year discounted cash flow and valuation trajectory.', hint: '10-year projected yield curve' },
    { type: 'myth_fact', role: 'Risk Perception vs Reality', desc: 'Why traditional banks miss this yield while private credit captures it.', hint: 'Myth: Rural infrastructure is unbankable' },
    { type: 'strategic_directive', role: 'Early M&A & Fund Positioning', desc: 'Where family offices and VC funds must plant equity seeds today.', hint: 'Back the operating systems and SPV managers now' },
    { type: 'live_poll', role: 'Institutional Sentiment Poll', desc: 'Poll allocators on infrastructure asset allocation.', hint: 'Are you allocating private debt to rural energy assets?' },
    { type: 'call_to_action', role: 'Institutional Access', desc: 'Join the Darkpore Sovereign & LP Syndicate.', hint: 'Select Macro CTA' },
  ],

  // ── 3. PLAYBOOK (TACTICAL OPERATOR SOPS) ────────────────────
  playbook_past: [
    { type: 'subheading', role: 'Defunct Protocol Title', desc: 'Name the outdated operational standard that causes heavy losses.', hint: 'The Open-Truck Grain Transport Trap: A Post-Mortem on 30% In-Transit Loss' },
    { type: 'highlight_card', role: 'The Waste Metric', desc: 'Metric quantifying the physical loss under the old protocol.', hint: '32% moisture damage during rainy season transit' },
    { type: 'exec_summary', role: 'Why This Failed', desc: 'Three fundamental errors in the traditional standard operating procedure.', hint: 'Three root operational errors' },
    { type: 'core_interactive', role: 'The Old SOP Teardown', desc: 'Step-by-step audit of where contamination and spillage occurred.', hint: 'Step 1: Bagging in damp jute · Step 2: Unsealed tarpaulins' },
    { type: 'pull_quote', role: 'Warehouse Manager Retrospective', desc: 'Testimony from a veteran site manager who dismantled this system.', hint: 'Quote from warehouse supervisor' },
    { type: 'media', role: 'Damage Documentation', desc: 'Visual proof of spoiled inventory and structural degradation.', hint: 'Photo of weevil infestation in unsealed bags' },
    { type: 'strategic_directive', role: 'Banned Operating Rules', desc: 'Strict rules on what processes are immediately prohibited in the field.', hint: 'Zero tolerance for uncertified tarps' },
    { type: 'live_poll', role: 'Field Audit Poll', desc: 'Check how many operators still use this defunct method.', hint: 'Are your trucks still using manual non-moisture tarps?' },
    { type: 'call_to_action', role: 'Operator Hub Access', desc: 'Upgrade your team with modern FoodNerve Operator SOPs.', hint: 'Select Macro CTA' },
  ],
  playbook_present: [
    { type: 'subheading', role: 'The Operator SOP Title', desc: 'Name the exact survival hack or standard operating procedure.', hint: 'The 48-Hour Cassava Processing Playbook: Slashing Post-Harvest Cyanide & Spoilage' },
    { type: 'highlight_card', role: 'The Efficiency Stat', desc: 'The operational gain from following this protocol.', hint: '98% grade-A flour yield · Zero spoilage' },
    { type: 'exec_summary', role: 'Operational Overview', desc: 'Summary of equipment, manpower, and timing required.', hint: 'Three key execution guidelines' },
    { type: 'core_interactive', role: 'Step-by-Step Execution Guide', desc: 'Detailed, tactical steps with timestamps (Hour 0 to Hour 48).', hint: 'Step 1: Harvesting at dawn · Step 2: Immediate washing & grating' },
    { type: 'media', role: 'Process Flow Schematic', desc: 'Visual workflow diagram or equipment arrangement schematic.', hint: 'Floor plan of modular processing unit' },
    { type: 'pull_quote', role: 'Lead Operator Tip', desc: 'Pro-tip from the highest-performing factory manager.', hint: 'Quote on controlling moisture levels in the flash dryer' },
    { type: 'core_interactive', role: 'Equipment & Tooling Checklist', desc: 'Exact specs of generators, peelers, pressers, and packaging seals.', hint: 'Specific motor horsepowers and fuel consumption benchmarks' },
    { type: 'strategic_directive', role: 'Quality Control Standards', desc: 'Non-negotiable parameters for passing off-taker lab tests.', hint: 'Moisture must remain below 10% on moisture meter' },
    { type: 'live_poll', role: 'Execution Audit Poll', desc: 'Ask peers what stage causes their greatest bottleneck.', hint: 'What is your biggest operational delay: peeling or drying?' },
    { type: 'call_to_action', role: 'Operator Certification CTA', desc: 'Certify your processing facility on FoodNerve.', hint: 'Select Macro CTA' },
  ],
  playbook_future: [
    { type: 'subheading', role: 'The 2030 Automated SOP Title', desc: 'Name the robotics, IoT, or automated protocol for 2030.', hint: 'Autonomous Drone Sorting & Grading: The 2030 Packing House Protocol' },
    { type: 'highlight_card', role: 'Speed & Throughput Benchmark', desc: 'Projected metric under full automation.', hint: '10 tonnes/hour with 0.1% sorting error' },
    { type: 'exec_summary', role: 'The Automated System Overview', desc: 'Hardware, software, and edge AI architecture required.', hint: 'Three components of the autonomous line' },
    { type: 'core_interactive', role: 'Automated Workflow Protocol', desc: 'How sensor arrays, conveyor vision, and pneumatic sorters operate.', hint: 'Computer vision sorting parameters' },
    { type: 'media', role: 'System Architecture Blueprint', desc: 'IoT sensor network diagram and data telemetry flow.', hint: 'Schematic of edge AI sorting station' },
    { type: 'core_interactive', role: 'Maintenance & Power Redundancy', desc: 'How to maintain robotics in rural environments without grid power.', hint: 'Solar battery redundancy and local modular spare parts' },
    { type: 'strategic_directive', role: 'Engineering Mandate', desc: 'Open-source standards and API protocols to adopt now.', hint: 'Standardize sensor protocols across modular hubs' },
    { type: 'live_poll', role: 'Automation Feasibility Poll', desc: 'Poll operators on when their hubs will deploy computer vision.', hint: 'When will your facility pilot AI optical sorting?' },
    { type: 'call_to_action', role: 'AgriTech Builders Guild', desc: 'Join the FoodNerve Hardware & Mechanization Guild.', hint: 'Select Macro CTA' },
  ],

  // ── 4. COMPARISON (HEAD-TO-HEAD BENCHMARK) ──────────────────
  comparison_past: [
    { type: 'subheading', role: 'Historical Benchmark Title', desc: 'Name the two competing models and who lost.', hint: 'Government Silos vs. Private Hermetic Bags: Why Centralized Storage Lost in 2022' },
    { type: 'highlight_card', role: 'The Efficiency Gap', desc: 'The metric comparing the performance of Option A vs Option B.', hint: '45% silo spoilage vs 2% hermetic bag loss' },
    { type: 'exec_summary', role: 'Head-to-Head Verdict', desc: 'Three fundamental reasons why one model outlived the other.', hint: 'Three comparison takeaways' },
    { type: 'myth_fact', role: 'Contrasting the Paradigms', desc: 'Side-by-side comparison of the assumptions of both models.', hint: 'Centralized mega-hubs vs decentralized farm-gate storage' },
    { type: 'core_interactive', role: 'Cost & Operational Breakdown', desc: 'Deep dive into capex, maintenance, corruption, and logistics.', hint: 'Capex per tonne stored: ₦180k vs ₦15k' },
    { type: 'media', role: 'Benchmark Comparison Table', desc: 'Comprehensive matrix comparing both systems across 6 metrics.', hint: 'Upload comparison matrix graphic' },
    { type: 'pull_quote', role: 'Independent Auditor Verdict', desc: 'Quote from an independent agronomist or supply chain auditor.', hint: 'Quote evaluating the two methods' },
    { type: 'strategic_directive', role: 'The Final Verdict', desc: 'Definitive command on which model to decommission entirely.', hint: 'Dismantle centralized grain reserves; subsidize hermetic tech' },
    { type: 'live_poll', role: 'Community Preference Poll', desc: 'Ask the network which model their business survived on.', hint: 'Did your cooperative abandon government silos for private bags?' },
    { type: 'call_to_action', role: 'Benchmark Library CTA', desc: 'Access all FoodNerve Technical Benchmarks.', hint: 'Select Macro CTA' },
  ],
  comparison_present: [
    { type: 'subheading', role: 'Live Head-to-Head Title', desc: 'Name the two active competing solutions, regions, or actors.', hint: 'Kano Dry Port vs. Kaduna Rail Corridor: The 72-Hour Grain Logistics Benchmark' },
    { type: 'highlight_card', role: 'The Margin Differential', desc: 'The clear financial or speed difference between both options.', hint: '₦45,000/tonne saved · 36 hours faster via rail' },
    { type: 'exec_summary', role: 'Current Winner TL;DR', desc: 'Key trade-offs between Cost, Speed, Reliability, and Security.', hint: 'Three decisive verdict bullets' },
    { type: 'core_interactive', role: 'Round 1: Unit Costs & Hidden Fees', desc: 'Detailed cost breakdown including road tolls, diesel, and port charges.', hint: 'Full fee schedules compared' },
    { type: 'core_interactive', role: 'Round 2: Security & Spoilage Risk', desc: 'Comparing banditry risks, moisture exposure, and driver reliability.', hint: 'Security checkpoints and transit insurance rates' },
    { type: 'media', role: 'Route Speed & Cost Graph', desc: 'Visual infographic comparing the two transit channels.', hint: 'Side-by-side transit comparison chart' },
    { type: 'pull_quote', role: 'Shipper / Trader Perspective', desc: 'Quote from a logistics manager currently running both routes.', hint: 'Quote on switching 100 trucks to rail' },
    { type: 'strategic_directive', role: 'The Tactical Decision', desc: 'Clear guidelines on when to choose Route A vs Route B.', hint: 'Use Rail for dry grains; use Dry Port for perishable export' },
    { type: 'live_poll', role: 'Shipper Sentiment Poll', desc: 'Poll active logistics operators on their primary route.', hint: 'Which transit corridor is your fleet prioritizing this harvest?' },
    { type: 'call_to_action', role: 'Logistics Network CTA', desc: 'Connect with verified freight haulers on FoodNerve.', hint: 'Select Macro CTA' },
  ],
  comparison_future: [
    { type: 'subheading', role: '2030 Tech vs Incumbent Title', desc: 'Name the upcoming disruptive tech vs the entrenched incumbent.', hint: 'USSD Feature Phones vs. On-Chain Smart Contracts: Who Powers Rural Ag-Credit in 2030?' },
    { type: 'highlight_card', role: 'Projected Cost Disparity', desc: 'The 10x cost reduction metric of the future system.', hint: '0.2% transaction fee vs 3.5% telco USSD toll' },
    { type: 'exec_summary', role: 'The 2030 Inflection Point', desc: 'Why the incumbent technology will hit scalability limits.', hint: 'Three core inflection drivers' },
    { type: 'myth_fact', role: 'Usability vs Trust Paradox', desc: 'Breaking down smartphone penetration vs offline connectivity.', hint: 'Myth: Rural farmers will never adopt digital keys' },
    { type: 'core_interactive', role: 'Technical Architecture Benchmark', desc: 'Latency, cryptography, settlement speed, and offline verification compared.', hint: 'Offline cryptographic proof of stake vs SMS gateways' },
    { type: 'media', role: 'Adoption Projection Curves', desc: '10-year technology s-curve adoption chart.', hint: 'S-curve transition visualization' },
    { type: 'strategic_directive', role: 'Architecture Directive for Startups', desc: 'What stack agritech founders should build on starting today.', hint: 'Build hybrid USSD/Account Abstraction bridges now' },
    { type: 'live_poll', role: 'Tech Bet Poll', desc: 'Poll founders and CTOs on where their engineering budget is going.', hint: 'Will on-chain settlement overtake USSD before 2030?' },
    { type: 'call_to_action', role: 'Tech Working Group CTA', desc: 'Join the FoodNerve Developer & FinTech Guild.', hint: 'Select Macro CTA' },
  ],

  // ── 5. CULTURE (HUMAN, LABOR & SOCIOLOGY) ────────────────────
  culture_past: [
    { type: 'subheading', role: 'Cultural Retrospective Title', desc: 'Name the historical labor pattern or demographic shift.', hint: 'The Disappearing Farm Hand: How Urban Migration Emptied Northern Fields in the 2010s' },
    { type: 'highlight_card', role: 'The Demographic Shift', desc: 'The population or labor departure metric.', hint: '64% average farmer age increase in 10 years' },
    { type: 'exec_summary', role: 'Sociological TL;DR', desc: 'Three fundamental drivers of the rural-to-urban labor exodus.', hint: 'Three key sociological findings' },
    { type: 'myth_fact', role: 'The Misunderstood Youth', desc: 'Debunking the myth that youth "dislike farming".', hint: 'Myth: Youth are lazy vs Reality: Daily wage vs Okada earnings' },
    { type: 'core_interactive', role: 'The Village Economy Breakdown', desc: 'How the loss of manual labor forced mechanization or abandonment.', hint: 'Daily manual labor cost inflation vs crop prices' },
    { type: 'pull_quote', role: 'Elder Farmer Testimony', desc: 'Touching quote from a community leader reflecting on the shift.', hint: 'Quote on land inheritance and youth leaving' },
    { type: 'media', role: 'Demographic Photo Essay', desc: 'Visual documentary evidence of changing rural communities.', hint: 'Photo essay of farming village demographic' },
    { type: 'strategic_directive', role: 'Community Rebuilding Directive', desc: 'How to structure modern rural housing, schools, and digital hubs.', hint: 'Create ag-townships with broadband to retain talent' },
    { type: 'live_poll', role: 'Labor Shortage Poll', desc: 'Poll farm owners on their current labor availability.', hint: 'Did your farm lose more than 30% of seasonal workers this year?' },
    { type: 'call_to_action', role: 'Rural Upskilling CTA', desc: 'Sponsor a rural youth fellowship on FoodNerve Society.', hint: 'Select Macro CTA' },
  ],
  culture_present: [
    { type: 'subheading', role: 'The 2026 Ground Reality Title', desc: 'Name the emerging sub-culture, syndicate, or labor lifestyle.', hint: 'The "Agro-Boys" Syndicate: How Youth Gangs Monopolize Yam Harvesting Wages in Benue' },
    { type: 'highlight_card', role: 'The Wage & Power Stat', desc: 'The wage hike or economic leverage commanded by the group.', hint: '₦12,000/day minimum rate dictated by harvesting unions' },
    { type: 'exec_summary', role: 'Cultural Ground TL;DR', desc: 'Three sociological dynamics reshaping farm-gate negotiations.', hint: 'Three ground truth bullets' },
    { type: 'pull_quote', role: 'Syndicate Leader Voice', desc: 'Direct voice from the youth crew leader setting the daily rules.', hint: 'Quote from youth harvesting cartel coordinator' },
    { type: 'core_interactive', role: 'The Day in the Life', desc: 'Intimate narrative detailing the morning muster, bargaining, and payment.', hint: 'How cash payments, food allowances, and gin are negotiated' },
    { type: 'media', role: 'Field Documentary Photo', desc: 'Authentic photo of the work crew in action.', hint: 'Photo of youth loading yam tubers onto articulated trucks' },
    { type: 'core_interactive', role: 'Power Shift & Commercial Impact', desc: 'How commercial aggregators adapt to unionized rural labor.', hint: 'Why big farms are switching to contract pricing per ridge' },
    { type: 'strategic_directive', role: 'Workforce Engagement Policy', desc: 'How corporate agribusinesses can form win-win pacts with youth crews.', hint: 'Offer health coverage and seasonal bonuses to secure labor' },
    { type: 'live_poll', role: 'Farm Labor Sentiment', desc: 'Poll growers on their relationship with local harvesting crews.', hint: 'Do you negotiate directly with community youth unions?' },
    { type: 'call_to_action', role: 'Community Guild CTA', desc: 'Support labor formalization on FoodNerve.', hint: 'Select Macro CTA' },
  ],
  culture_future: [
    { type: 'subheading', role: 'The 2030 Agri-Lifestyle Title', desc: 'Name the new breed of tech-savvy rural entrepreneurs.', hint: 'The Laptop Agronomist: How Digital Nomads Will Run 100-Hectare Smart Farms in 2030' },
    { type: 'highlight_card', role: 'The Talent Return Stat', desc: 'Projected influx of tech and business talent into agriculture.', hint: '40% of new farm owners holding STEM degrees by 2030' },
    { type: 'exec_summary', role: 'The New Rural Class TL;DR', desc: 'How solar power, Starlink, and automation create rural prosperity.', hint: 'Three pillars of the 2030 ag-lifestyle' },
    { type: 'myth_fact', role: 'The Modern Farm Life', desc: 'Contrasting the old subsistence stereotype with the tech-enabled hub.', hint: 'Stereotype: Mud huts vs Reality: Solar-powered IoT villas' },
    { type: 'core_interactive', role: 'The New Social Contract', desc: 'How generational inheritance and land leasing models will evolve.', hint: 'Long-term equity leasing vs fragmented family plots' },
    { type: 'media', role: 'The 2030 Ag-Township Vision', desc: 'Architectural rendering or visual concept of modern rural agro-hubs.', hint: 'Concept art of solar-powered farm co-working community' },
    { type: 'strategic_directive', role: 'Talent Magnet Strategy', desc: 'What states must build to attract high-earning agri-founders.', hint: 'Provide rural security guarantees and fiber/satellite zones' },
    { type: 'live_poll', role: 'Lifestyle Migration Poll', desc: 'Poll readers on their willingness to relocate to smart rural hubs.', hint: 'Would you move to a tech-enabled agro-township?' },
    { type: 'call_to_action', role: 'Join the Movement', desc: 'Apply to the FoodNerve Future Farmers & Founders Fellowship.', hint: 'Select Macro CTA' },
  ],
};

export function getBlueprint(format: ArticleFormat, era: ArticleEra): SopBlock[] {
  const key = `${format}_${era}` as const;
  return SOP_BLUEPRINTS[key] || SOP_BLUEPRINTS.brief_present;
}
