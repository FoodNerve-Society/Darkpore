import {
  canonicalizeDefBlockId,
  calculateExpectedSlideCount,
  getFlowBlocksForFormat,
  resolveCustomBlockDescriptions,
  buildLSDoc2aPrompt,
  buildLSDoc2bPrompt,
  buildLSDoc2cPrompt,
  buildLSDoc3Prompt,
  buildLSDoc4Prompt,
  normalizeLivestreamSlidePayload,
} from './lib/config/livestreamMasterPrompts';
import { DEF_BLOCK_DEFINITIONS, LIVESTREAM_TYPE_FLOWS } from './app/modular-society/[tenant]/(authenticated)/components/forms/livestream/defBlocksConfig';

console.log('--- TEST SUITE START ---');

// 1. Test Format Block Flows & Slide Counts
console.log('\n[1] Slide Counts & DEF Block Parity:');
const teardownCount = calculateExpectedSlideCount('industry_teardown');
const debateCount = calculateExpectedSlideCount('panel_debate');
const talentCount = calculateExpectedSlideCount('talent_spotlight');
console.log(`Teardown slides: ${teardownCount}`);
console.log(`Debate slides: ${debateCount}`);
console.log(`Talent slides: ${talentCount}`);

// 2. Test Canonical Block IDs
console.log('\n[2] Canonical Block ID Fuzzy Matching:');
const testKeys = [
  'anchor_tension',
  'Field Crisis Media',
  'Strategic Reframe Question',
  '3-layer diagnostic funnel',
  'The NGO Dream vs Ground Reality',
  'macro sovereign loss',
  'deciders and enforcers',
  'Status Quo Audit',
  '4-Part Gateway Boundary',
  'Skeptic Preempt Objection',
  'Return to Opening Case Study',
  'Two Diverging Paths',
  'Talent Spotlight / Job',
];
testKeys.forEach(k => {
  console.log(`"${k}" -> "${canonicalizeDefBlockId(k)}"`);
});

// 3. Test Plain-English Guardrails in all Phase 2 Prompts
console.log('\n[3] Grounded Plain-English Guardrails in Master Prompts:');
const dummyCtx = {
  title: 'Corridor Logistics Breakdown',
  category: 'capital',
  timeframe: 'present' as const,
  format: 'industry_teardown',
  hubTitle: 'Production & Capital'
};

const forbiddenWords = ['synergy', 'paradigm shift', 'leverage', 'ecosystem alignment'];
const requiredTerms = ['tonnage', 'spoilage rates', 'corridor haulage', 'jetty delays', 'off-take contracts'];

const p2a = buildLSDoc2aPrompt(dummyCtx);
const p2b = buildLSDoc2bPrompt(dummyCtx);
const p2c = buildLSDoc2cPrompt(dummyCtx);
const p3 = buildLSDoc3Prompt(dummyCtx);
const p4 = buildLSDoc4Prompt(dummyCtx);

const prompts = [
  { name: 'LS-Doc 2a', p: p2a },
  { name: 'LS-Doc 2b', p: p2b },
  { name: 'LS-Doc 2c', p: p2c },
  { name: 'LS-Doc 3', p: p3 },
  { name: 'LS-Doc 4', p: p4 },
];

prompts.forEach(({ name, p }) => {
  const missingTerms = requiredTerms.filter(t => !p.toLowerCase().includes(t.toLowerCase()));
  const hasNegativeBan = forbiddenWords.some(w => p.toLowerCase().includes(w.toLowerCase()));
  console.log(`${name}: hasNegativeBan=${hasNegativeBan}, missingTerms=[${missingTerms.join(', ')}]`);
});
