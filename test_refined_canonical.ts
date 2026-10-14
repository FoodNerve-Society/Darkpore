function testCanonical(rawId: string): string {
  const s = String(rawId).toLowerCase().replace(/[^a-z0-9_]+/g, '_').trim();

  // Return to case before open
  if (s.includes('return') || s.includes('case') || s.includes('re_evaluat')) {
    return 'return_to_case';
  }
  if (s.includes('reframe') || s.includes('pivot')) {
    return 'reframe_question';
  }
  if (s.includes('ideal') || s.includes('feasible') || s.includes('ngo') || s.includes('myth') || s.includes('disconnect') || s.includes('fracture') || s.includes('workaround')) {
    return 'ideal_vs_feasible';
  }
  if (s.includes('funnel') || s.includes('diagnostic') || s.includes('symptom') || s.includes('layer')) {
    return 'funnel_system';
  }
  if (s.includes('scaled') || s.includes('burden') || s.includes('bleed') || s.includes('loss')) {
    return 'scaled_burden';
  }
  if (s.includes('power') || s.includes('decider') || s.includes('enforcer') || s.includes('payer') || s.includes('cartel')) {
    return 'power_map';
  }
  if (s.includes('response') || s.includes('audit') || s.includes('needle') || s.includes('status_quo')) {
    return 'response_audit';
  }
  if (s.includes('boundary') || s.includes('gateway') || s.includes('gate') || s.includes('kpi')) {
    return 'boundary_test';
  }
  if (s.includes('preempt') || s.includes('objection') || s.includes('skeptic') || s.includes('disproof')) {
    return 'preempt_objections';
  }
  if (s.includes('fork') || s.includes('diverg') || s.includes('path') || (s.includes('close') && !s.includes('talent'))) {
    return 'forked_close';
  }
  if (s.includes('talent') || s.includes('spotlight') || s.includes('job') || s.includes('deal') || s.includes('bounty') || s.includes('hiring') || s.includes('career')) {
    return 'talent_spotlight';
  }
  if (s.includes('anchor') || s.includes('tension') || s.includes('crisis') || s.includes('snapshot') || s.includes('stat') || s.includes('open')) {
    return 'anchor_tension';
  }
  return 'anchor_tension';
}

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
  console.log(`"${k}" -> "${testCanonical(k)}"`);
});
