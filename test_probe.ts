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

console.log('Imports succeeded!');
console.log('Teardown slides:', calculateExpectedSlideCount('industry_teardown'));
console.log('Debate slides:', calculateExpectedSlideCount('panel_debate'));
console.log('Talent slides:', calculateExpectedSlideCount('talent_spotlight'));
