import {
  buildLSDoc2cPrompt,
  buildLSDoc4Prompt,
  calculateExpectedSlideCount,
  getFlowBlocksForFormat
} from './lib/config/livestreamMasterPrompts';

const ctx = {
  title: 'Test Panel Debate',
  category: 'capital',
  timeframe: 'present' as const,
  format: 'panel_debate',
  appliedBlueprint: {
    format: 'panel_debate',
    blocks: {
      talent_spotlight: 'Opportunity link for forward purchase contracts and escrow verification.'
    },
    suggestedJobsFocus: 'Offtake Arbitration & Contract Auditor'
  }
};

const p4 = buildLSDoc4Prompt(ctx);
console.log('--- LSDoc4 DEF blocks ---');
console.log(p4.substring(p4.indexOf('[ORDER OF DEF BLOCKS TO COMPILE]')));

const p2c = buildLSDoc2cPrompt(ctx);
console.log('--- LSDoc2c ACT 3 DEF BLOCKS TO DRAFT ---');
const act3Start = p2c.indexOf('[ACT 3 DEF BLOCKS TO DRAFT]');
const act3End = p2c.indexOf('[SLIDE DRAFTING SPECIFICATIONS PER ACTIVE BLOCK]');
console.log(p2c.substring(act3Start, act3End));
