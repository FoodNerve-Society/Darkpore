export interface DEFBlockDefinition {
  id: string;
  blockNumber: number;
  act: 'OPEN' | 'MEAT' | 'CLOSE';
  actLabel: string;
  name: string;
  subtitle: string;
  description: string;
  themeColor: string;
  defaultDuration: string;
  subSlideTemplates: {
    title: string;
    slideType: string;
    subheadline?: string;
    dataValue?: string;
    speakerNotes: string;
    durationStr: string;
  }[];
}

export const DEF_BLOCK_DEFINITIONS: Record<string, DEFBlockDefinition> = {
  // ── ACT 1: THE OPEN (Tension & Reframe) ───────────────────
  anchor_tension: {
    id: 'anchor_tension',
    blockNumber: 1,
    act: 'OPEN',
    actLabel: 'ACT 1: THE OPEN',
    name: 'Anchor Tension',
    subtitle: 'Crisis Imagery & Killer Stat',
    description: 'Exposes the gap between the official PR narrative and harsh ground truth.',
    themeColor: '#ef4444', // Red tension
    defaultDuration: '2m',
    subSlideTemplates: [
      {
        title: 'The Operational Reality: Field Crisis Snapshot',
        slideType: 'media',
        subheadline: 'The ground disconnect nobody is reporting on',
        speakerNotes: 'Look closely at this image. This is the reality on the ground right now, not the sanitized PR releases.',
        durationStr: '45s',
      },
      {
        title: 'The Killer Stat: The Ground Disconnect',
        slideType: 'highlight_card',
        dataValue: '₦340B Lost Annually',
        subheadline: 'Capital evaporated between farm gate and off-taker',
        speakerNotes: 'Three hundred and forty billion naira. That is what evaporates annually in this corridor alone before anyone gets paid.',
        durationStr: '45s',
      },
    ],
  },

  reframe_question: {
    id: 'reframe_question',
    blockNumber: 2,
    act: 'OPEN',
    actLabel: 'ACT 1: THE OPEN',
    name: 'Reframe Question',
    subtitle: 'Strategic Pivot Question',
    description: 'Pivotal question that reframes the real bottleneck before proposing solutions.',
    themeColor: '#f59e0b', // Amber pivot
    defaultDuration: '1m',
    subSlideTemplates: [
      {
        title: 'What if the barrier isn’t seed access, but spatial land tenure?',
        slideType: 'subheading',
        subheadline: 'Pivoting from the symptom to the structural lock',
        speakerNotes: 'We have spent a decade funding inputs. But what if inputs were never the bottleneck? What if it is spatial tenure?',
        durationStr: '60s',
      },
    ],
  },

  // ── ACT 2: THE MEAT (Diagnose, Map, Defend) ───────────────
  funnel_system: {
    id: 'funnel_system',
    blockNumber: 3,
    act: 'MEAT',
    actLabel: 'ACT 2: DIAGNOSE',
    name: 'Funnel System',
    subtitle: '3-Layer Diagnostic',
    description: 'Immediate symptoms → Environmental barriers → Structural root policy.',
    themeColor: '#3b82f6', // Blue diagnostic
    defaultDuration: '3m',
    subSlideTemplates: [
      {
        title: 'Layer 1: Immediate Field Symptoms',
        slideType: 'subheading',
        subheadline: 'Spoilage at aggregation centers within 48 hours',
        speakerNotes: 'At the farm level, farmers are forced into distress sales because off-takers arrive 72 hours late.',
        durationStr: '45s',
      },
      {
        title: 'Layer 2: Logistics & Corridors',
        slideType: 'subheading',
        subheadline: 'Cold chain breakages and highway extortion points',
        speakerNotes: 'Reefer trucks hit 14 informal checkpoints along the northern corridor, compounding transit time by 18 hours.',
        durationStr: '45s',
      },
      {
        title: 'Layer 3: Structural Policy Lock',
        slideType: 'highlight_card',
        dataValue: 'Zero Secondary Titles',
        subheadline: 'Why commercial banks refuse to pledge cold infrastructure',
        speakerNotes: 'The root cause is bankability. Without titled rights, infrastructure cannot be bonded or insured.',
        durationStr: '45s',
      },
    ],
  },

  ideal_vs_feasible: {
    id: 'ideal_vs_feasible',
    blockNumber: 4,
    act: 'MEAT',
    actLabel: 'ACT 2: DIAGNOSE',
    name: 'Ideal vs. Feasible',
    subtitle: 'The Disconnect & Workaround',
    description: 'The NGO Dream vs The Point of Failure vs The Gritty Fix.',
    themeColor: '#8b5cf6', // Violet contrast
    defaultDuration: '3m',
    subSlideTemplates: [
      {
        title: 'The NGO Ideal: "Just Build Solar Cold Hubs Everywhere"',
        slideType: 'myth_fact',
        subheadline: 'The well-funded proposal presented at global summits',
        speakerNotes: 'Donors love this slide: install solar cold rooms at every cluster and problem solved.',
        durationStr: '45s',
      },
      {
        title: 'The Ground Fracture: Inverter Theft & Diesel Fuel Spikes',
        slideType: 'myth_fact',
        subheadline: 'Why 78% of pilot cold rooms are abandoned within 14 months',
        speakerNotes: 'Here is what happens in month six: inverters are stripped, battery storage degrades, and grid tariffs spike.',
        durationStr: '45s',
      },
      {
        title: 'The Feasible Fix: Decentralized Dry Storage & Aggregation Rails',
        slideType: 'myth_fact',
        subheadline: 'Operator-tested workaround with zero cold reliance',
        speakerNotes: 'This is what working operators actually do: dry aggregation, moisture barrier bags, and scheduled night logistics.',
        durationStr: '45s',
      },
    ],
  },

  scaled_burden: {
    id: 'scaled_burden',
    blockNumber: 5,
    act: 'MEAT',
    actLabel: 'ACT 2: DIAGNOSE',
    name: 'Scaled Burden',
    subtitle: 'Macro Loss & Capital Bleed',
    description: 'National/regional tonnage loss metric and who absorbs the financial hit.',
    themeColor: '#ec4899', // Pink bleed
    defaultDuration: '2m',
    subSlideTemplates: [
      {
        title: '42% Aggregate Tonnage Spoilage',
        slideType: 'highlight_card',
        dataValue: '2.4M Metric Tons',
        subheadline: 'Annual perishable crop loss across the belt',
        speakerNotes: 'Over two million metric tons of fresh produce never reach an end consumer. That is lost national sovereign wealth.',
        durationStr: '45s',
      },
      {
        title: 'Who Absorbs The Loss: Smallholders vs Off-Takers',
        slideType: 'subheading',
        subheadline: 'Smallholder margins compress to -8% while consumers pay 3x',
        speakerNotes: 'The off-taker passes the premium to urban consumers; the farmer takes the write-down.',
        durationStr: '45s',
      },
    ],
  },

  power_map: {
    id: 'power_map',
    blockNumber: 6,
    act: 'MEAT',
    actLabel: 'ACT 2: MAP SYSTEM',
    name: 'Power Map',
    subtitle: 'Deciders, Enforcers & Payers',
    description: 'Identifies the political economy: who decides, who enforces, who pays.',
    themeColor: '#0ea5e9', // Cyan system
    defaultDuration: '3m',
    subSlideTemplates: [
      {
        title: 'The Deciders: Federal Export Boards & State Port Councils',
        slideType: 'subheading',
        subheadline: 'Policy gatekeepers controlling clearance documentation',
        speakerNotes: 'These are the three agencies that hold absolute regulatory veto over inter-state transit permits.',
        durationStr: '45s',
      },
      {
        title: 'The Enforcers: Market Middlemen & Transport Unions',
        slideType: 'subheadline',
        subheadline: 'Informal toll collectors dictating depot access fees',
        speakerNotes: 'If you do not negotiate with the union leadership at Mile 12, your trucks do not offload.',
        durationStr: '45s',
      },
      {
        title: 'The Payers: Downstream Processing Plants',
        slideType: 'highlight_card',
        dataValue: '₦125M / Quarter',
        subheadline: 'Underutilized factory capacity due to volatile supply',
        speakerNotes: 'Industrial processing lines sit idle four days a week because feedstock delivery cannot be guaranteed.',
        durationStr: '45s',
      },
    ],
  },

  response_audit: {
    id: 'response_audit',
    blockNumber: 7,
    act: 'MEAT',
    actLabel: 'ACT 2: MAP SYSTEM',
    name: 'Response Audit',
    subtitle: 'Status Quo vs. What Works',
    description: 'Audits standard subsidized programs vs empirical needle-moving interventions.',
    themeColor: '#10b981', // Emerald audit
    defaultDuration: '2m',
    subSlideTemplates: [
      {
        title: 'What The Industry Keeps Doing: Subsidized Input Handouts',
        slideType: 'subheading',
        subheadline: '₦40B spent with 0% measurable margin improvement',
        speakerNotes: 'Subsidies are politically convenient, but they treat input costs without solving the market clearing price.',
        durationStr: '45s',
      },
      {
        title: 'What Actually Moves The Needle: Forward Contract Clearing Houses',
        slideType: 'highlight_card',
        dataValue: '+34% Net Realization',
        subheadline: 'Locking guaranteed off-take contracts before planting',
        speakerNotes: 'When you guarantee the off-take price at planting, capital floods in privately without government grants.',
        durationStr: '45s',
      },
    ],
  },

  boundary_test: {
    id: 'boundary_test',
    blockNumber: 8,
    act: 'MEAT',
    actLabel: 'ACT 2: DEFEND',
    name: 'Boundary Test',
    subtitle: 'The 4-Part Gateway',
    description: 'Pathway, Scale, Intervention Point, and 90-day verifiable KPI.',
    themeColor: '#6366f1', // Indigo test
    defaultDuration: '3m',
    subSlideTemplates: [
      {
        title: 'Gate 1 & 2: Regulatory Pathway & Scale Velocity',
        slideType: 'subheading',
        subheadline: 'Can this operate within existing state gazettes without constitutional reform?',
        speakerNotes: 'We pass the first gate: this structure requires no legislative amendments—it leverages existing warehousing acts.',
        durationStr: '45s',
      },
      {
        title: 'Gate 3 & 4: Exact Intervention Point & 90-Day KPI',
        slideType: 'highlight_card',
        dataValue: 'Day 90 Target: 500 Tons',
        subheadline: 'First commercial aggregation corridor live by Q3',
        speakerNotes: 'Within 90 days of closing this model, the first 500 tons will clear through the bonded corridor.',
        durationStr: '45s',
      },
    ],
  },

  preempt_objections: {
    id: 'preempt_objections',
    blockNumber: 9,
    act: 'MEAT',
    actLabel: 'ACT 2: DEFEND',
    name: 'Preempt Objections',
    subtitle: 'Voice The Skeptic',
    description: 'Voices the skeptic quote aloud before chat asks, followed by hard disproof.',
    themeColor: '#d97706', // Amber warning
    defaultDuration: '2m',
    subSlideTemplates: [
      {
        title: '"Farmers will default and side-sell as soon as open market prices spike"',
        slideType: 'pull_quote',
        subheadline: 'The classic commercial skepticism voiced by institutional lenders',
        speakerNotes: 'Every banker watching this is thinking: the moment market price jumps 10%, farmers will sell to middlemen.',
        durationStr: '45s',
      },
      {
        title: 'The Empirical Disproof: 94.2% Honor Rate via Input Escrow',
        slideType: 'highlight_card',
        dataValue: '94.2% Compliance',
        subheadline: 'Structured milestone payouts prevent predatory side-selling',
        speakerNotes: 'Historical cohort data shows that when input escrow is tied to final clearance, side-selling drops below 6%.',
        durationStr: '45s',
      },
    ],
  },

  // ── ACT 3: THE CLOSE (Return & Convert) ───────────────────
  return_to_case: {
    id: 'return_to_case',
    blockNumber: 10,
    act: 'CLOSE',
    actLabel: 'ACT 3: THE CLOSE',
    name: 'Return to Case',
    subtitle: 'Opening Case Re-Evaluated',
    description: 'Re-evaluates the opening crisis image with the proven operational model.',
    themeColor: '#059669', // Deep emerald
    defaultDuration: '1m',
    subSlideTemplates: [
      {
        title: 'Re-evaluating the Opening Case: A Solved Equation',
        slideType: 'subheading',
        subheadline: 'From unquantifiable risk to an engineered supply chain',
        speakerNotes: 'Remember the picture from slide one? With this infrastructure in place, that pile of spoilage becomes profitable inventory.',
        durationStr: '60s',
      },
    ],
  },

  forked_close: {
    id: 'forked_close',
    blockNumber: 11,
    act: 'CLOSE',
    actLabel: 'ACT 3: THE CLOSE',
    name: 'Forked Close',
    subtitle: 'Two Diverging Futures',
    description: 'Path A (status quo daily bleed) vs Path B (verified intervention ROI).',
    themeColor: '#7c3aed', // Purple fork
    defaultDuration: '2m',
    subSlideTemplates: [
      {
        title: 'Path A: Status Quo Bleed — ₦850K Lost Per Day',
        slideType: 'subheading',
        subheadline: 'Continuing the same legacy aggregation practices',
        speakerNotes: 'Option one: keep operating as usual, and bleed almost a million naira a day in avoidable shrinkage.',
        durationStr: '45s',
      },
      {
        title: 'Path B: Corridor Deployment — 3.2x Capital Return',
        slideType: 'highlight_card',
        dataValue: '3.2x Multiple in 18 Mos',
        subheadline: 'Executing the structured forward contract protocol',
        speakerNotes: 'Option two: adopt the corridor standard, secure bonded off-take, and realize three times the capital efficiency.',
        durationStr: '45s',
      },
    ],
  },

  talent_spotlight: {
    id: 'talent_spotlight',
    blockNumber: 12,
    act: 'CLOSE',
    actLabel: 'ACT 3: THE CLOSE',
    name: 'Talent Spotlight',
    subtitle: 'Verified Roles & Deal Links',
    description: 'Ecosystem conversion connecting viewers to live roles, deals, and bounties.',
    themeColor: '#f97316', // Orange conversion
    defaultDuration: '2m',
    subSlideTemplates: [
      {
        title: 'Lead Logistics Operator — Northern Corridor Rail Aggregation',
        slideType: 'job',
        subheadline: 'FoodNerve Verified Role · $45k - $60k / yr + Equity',
        speakerNotes: 'We are actively hiring for the Lead Logistics Operator role to execute this exact corridor protocol.',
        durationStr: '60s',
      },
      {
        title: 'Scan QR or Visit foodnerve.org/talent to Apply Now',
        slideType: 'subheading',
        subheadline: 'Applications open for 48 hours following this broadcast',
        speakerNotes: 'Scan the code or tap the link on your screen to submit your application directly to the hiring committee.',
        durationStr: '45s',
      },
    ],
  },
};

export const DEF_BLOCKS_ORDER = [
  'anchor_tension',
  'reframe_question',
  'funnel_system',
  'ideal_vs_feasible',
  'scaled_burden',
  'power_map',
  'response_audit',
  'boundary_test',
  'preempt_objections',
  'return_to_case',
  'forked_close',
  'talent_spotlight',
];

// Grouped by Act for rendering in the 12-block catalog tray
export const DEF_ACTS = [
  {
    act: 'OPEN' as const,
    label: 'Act 1: The Open',
    subtitle: 'Tension & Reframe',
    blockIds: ['anchor_tension', 'reframe_question'],
    color: '#ef4444',
  },
  {
    act: 'MEAT' as const,
    label: 'Act 2: The Meat',
    subtitle: 'Diagnose, Map System & Defend',
    blockIds: [
      'funnel_system',
      'ideal_vs_feasible',
      'scaled_burden',
      'power_map',
      'response_audit',
      'boundary_test',
      'preempt_objections',
    ],
    color: '#3b82f6',
  },
  {
    act: 'CLOSE' as const,
    label: 'Act 3: The Close',
    subtitle: 'Return, Fork & Convert',
    blockIds: ['return_to_case', 'forked_close', 'talent_spotlight'],
    color: '#10b981',
  },
];

// Template blueprints for different Livestream Types
export const LIVESTREAM_TYPE_FLOWS: Record<string, string[]> = {
  default: [
    'anchor_tension',
    'reframe_question',
    'funnel_system',
    'ideal_vs_feasible',
    'scaled_burden',
    'power_map',
    'response_audit',
    'boundary_test',
    'preempt_objections',
    'return_to_case',
    'forked_close',
    'talent_spotlight',
  ],
  industry_teardown: [
    'anchor_tension',
    'reframe_question',
    'funnel_system',
    'ideal_vs_feasible',
    'scaled_burden',
    'power_map',
    'preempt_objections',
    'return_to_case',
    'forked_close',
    'talent_spotlight',
  ],
  panel_debate: [
    'anchor_tension',
    'reframe_question',
    'ideal_vs_feasible',
    'power_map',
    'response_audit',
    'boundary_test',
    'preempt_objections',
    'forked_close',
  ],
  talent_spotlight: [
    'anchor_tension',
    'reframe_question',
    'power_map',
    'boundary_test',
    'forked_close',
    'talent_spotlight',
  ],
};
