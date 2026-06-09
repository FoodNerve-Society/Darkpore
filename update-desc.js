const fs = require('fs');
let code = fs.readFileSync('lib/cms/food/challenges.ts', 'utf8');

const descriptions = {
  land: {
    desc: 'Access, mechanization, and soil regeneration pathways.',
    longDesc: 'Land is the fundamental challenge in African agriculture. We are addressing the fragmentation of arable land through diverse pathways including sole ownership, shared LLCs, long-term ground leases, and short-term crop-share agreements to unlock millions of hectares.'
  },
  capital: {
    desc: 'Unlocking capital via subsidies, credit, and grants.',
    longDesc: 'Bridging the agricultural financing gap by architecting structured capital pathways. We coordinate blended finance mechanisms including government subsidies, commercial credit, foreign direct investment, and impact grants to empower scalable farming operations.'
  },
  inputs: {
    desc: 'Optimizing seeds, fertilizers, and mechanized power.',
    longDesc: 'Overcoming reduced yields by streamlining access to critical agro-inputs. We focus on drought-resistant seed breeding, advanced crop protection, animal feed optimization, and deploying mechanized farm equipment to multiply baseline productivity.'
  },
  energy: {
    desc: 'Eradicating energy poverty across the supply chain.',
    longDesc: 'Resolving the critical energy deficit that cripples agro-processing. We are tackling lighting, thermal/cold chain demands, and operational power gaps to ensure continuous, energy-efficient manufacturing, storage, and irrigation.'
  },
  insecurity: {
    desc: 'Mitigating systemic violence, theft, and pastoral conflict.',
    longDesc: 'Securing the agricultural ecosystem against existential threats. We deploy strategies to neutralize disruptions caused by armed banditry, farmer-herder clashes, commercial kidnapping, and resource theft, ensuring uninterrupted food production.'
  },
  loss: {
    desc: 'Preventing post-harvest loss across all food categories.',
    longDesc: 'Building robust preservation infrastructure to halt post-harvest waste. We construct cold-chain logistics, processing facilities, and secure storage for volatile spices, grains, roots, tubers, and fresh fruits to maximize market access.'
  },
  protein: {
    desc: 'Scaling accessible animal, farmed, and seafood proteins.',
    longDesc: 'Combating nutritional insecurity by industrializing protein production. We optimize the rearing, harvesting, and processing of diverse protein sources—from poultry and beef to pulses and pelagic fish—making high-quality dietary protein affordable.'
  }
};

for (const [id, data] of Object.entries(descriptions)) {
  const regex = new RegExp(`(id: '${id}',[\\s\\S]*?title: '[^']+',\\s*)desc: '[^']+',\\s*longDesc: '[^']+'`, 'g');
  code = code.replace(regex, `$1desc: '${data.desc}',\n    longDesc: '${data.longDesc}'`);
}

fs.writeFileSync('lib/cms/food/challenges.ts', code);
console.log('Updated descriptions!');
