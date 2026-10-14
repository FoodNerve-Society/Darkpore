import { normalizeLivestreamSlidePayload } from './lib/config/livestreamMasterPrompts';

// Simulate an LLM output from LS-Doc 4 with 21 slides without explicit canonical defBlockId
const testPayload = JSON.stringify(Array.from({ length: 21 }, (_, i) => ({
  id: `slide-${i + 1}`,
  title: `Slide Title ${i + 1}`,
  originalBlockType: 'media',
  speakerNotes: `Spoken notes for slide ${i + 1}`,
  originalContent: { title: `Slide ${i + 1}` }
})));

const parsed = normalizeLivestreamSlidePayload(testPayload, { format: 'industry_teardown' });
console.log('Total parsed slides:', parsed.length);
parsed.forEach((s, i) => {
  console.log(`Slide ${i + 1}: defBlockId = ${s.defBlockId}`);
});
