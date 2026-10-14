import {
  DEF_BLOCK_DEFINITIONS,
  LIVESTREAM_TYPE_FLOWS
} from './app/modular-society/[tenant]/(authenticated)/components/forms/livestream/defBlocksConfig';

function getFlowBlocksForFormat(format?: string): string[] {
  const normFmt = (format || '').toLowerCase();
  if (normFmt.includes('teardown') || normFmt.includes('audit')) {
    return LIVESTREAM_TYPE_FLOWS.industry_teardown;
  }
  if (normFmt.includes('debate') || normFmt.includes('panel')) {
    return LIVESTREAM_TYPE_FLOWS.panel_debate;
  }
  if (normFmt.includes('talent') || normFmt.includes('spotlight') || normFmt.includes('job')) {
    return LIVESTREAM_TYPE_FLOWS.talent_spotlight;
  }
  return LIVESTREAM_TYPE_FLOWS.default;
}

function getFormatSlideRundownBlueprint(format?: string) {
  const flowBlocks = getFlowBlocksForFormat(format);
  const sequence: any[] = [];
  flowBlocks.forEach((blockId) => {
    const def = DEF_BLOCK_DEFINITIONS[blockId];
    const subTemplates = def?.subSlideTemplates || [];
    const count = subTemplates.length || 1;
    if (subTemplates.length > 0) {
      subTemplates.forEach((t, i) => {
        sequence.push({
          defBlockId: blockId,
          defBlockLabel: def ? `Block ${def.blockNumber}: ${def.name}` : `Block (${blockId})`,
          act: def?.act || 'MEAT',
          slideIndex: i + 1,
          slideCount: count,
          defaultSlideType: t.slideType,
          defaultDuration: t.durationStr || '45s',
        });
      });
    } else {
      sequence.push({
        defBlockId: blockId,
        defBlockLabel: def ? `Block ${def.blockNumber}: ${def.name}` : `Block (${blockId})`,
        act: def?.act || 'MEAT',
        slideIndex: 1,
        slideCount: 1,
        defaultSlideType: 'subheading',
        defaultDuration: '45s',
      });
    }
  });
  return sequence;
}

const bp = getFormatSlideRundownBlueprint('industry_teardown');
console.log('Blueprint total slides:', bp.length);
bp.forEach((s, i) => {
  console.log(`Slide ${i + 1}: ${s.defBlockId} (Slide ${s.slideIndex} of ${s.slideCount}) [${s.act}]`);
});
