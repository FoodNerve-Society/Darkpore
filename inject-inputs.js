const fs = require('fs');
let code = fs.readFileSync('lib/cms/food/challenges.ts', 'utf8');

const newInputsChallenge = `,
  {
    id: 'inputs',
    title: '3. Inputs',
    desc: 'Reduced yields from under-used agro inputs and feed.',
    longDesc: 'Detailed breakdown of the inputs crisis and the society\\'s approach to solving it.',
    imageUrl: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0a3824?q=80&w=1200&auto=format&fit=crop',
    stats: { activeSolutions: 15, capitalDeployed: '$5.0M', communitySize: '1,200+' },
    subcategories: [
      // GROUP 1: Seeds & Yield Enhancement
      {
        id: 'improved-crop-breeding',
        title: 'Improved Crop Breeding',
        groupName: 'Seeds & Yield Enhancement',
        desc: 'Advanced crop breeding techniques.',
        imageUrl: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0a3824?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'drought-resistant-seeds',
        title: 'Drought Resistant Seeds',
        groupName: 'Seeds & Yield Enhancement',
        desc: 'Development of drought-resistant seed varieties.',
        imageUrl: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0a3824?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'fertilizers',
        title: 'Fertilizers',
        groupName: 'Seeds & Yield Enhancement',
        desc: 'Organic and synthetic fertilizer supply chains.',
        imageUrl: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0a3824?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 2: Crop Protection
      {
        id: 'pesticides',
        title: 'Pesticides',
        groupName: 'Crop Protection',
        desc: 'Safe and effective pesticide applications.',
        imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'herbicides',
        title: 'Herbicides',
        groupName: 'Crop Protection',
        desc: 'Targeted herbicide formulations.',
        imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'fungicides',
        title: 'Fungicides',
        groupName: 'Crop Protection',
        desc: 'Fungal disease control mechanisms.',
        imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'insecticides',
        title: 'Insecticides',
        groupName: 'Crop Protection',
        desc: 'Integrated pest management strategies.',
        imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 3: Livestock Feed
      {
        id: 'animal-feed',
        title: 'Animal Feed',
        groupName: 'Livestock Feed',
        desc: 'High-yield nutritional feed for livestock.',
        imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 4: Farm Power & Mechanization
      {
        id: 'mechanized-farm-equipment',
        title: 'Mechanized Farm Equipment',
        groupName: 'Farm Power & Mechanization',
        desc: 'Tractors and heavy farm machinery.',
        imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'draught-animal-power',
        title: 'Draught-Animal Power',
        groupName: 'Farm Power & Mechanization',
        desc: 'Using draught animals for efficient farm power.',
        imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      }
    ]
  }`;

// 1. Insert inputs challenge before the dynamic array
code = code.replace(
  `...['inputs', 'energy', 'insecurity', 'loss', 'protein']`,
  newInputsChallenge + `\n  ...['energy', 'insecurity', 'loss', 'protein']`
);

// 2. Adjust the mapping index for the remaining challenges (idx + 3 -> idx + 4)
code = code.replace(
  /title: \`\$\{idx \+ 3\}\. \$\{id\.charAt\(0\)\.toUpperCase\(\) \+ id\.slice\(1\)\}\`,/g,
  `title: \`\$\{idx + 4\}. \$\{id.charAt(0).toUpperCase() + id.slice(1)}\`,`
);

fs.writeFileSync('lib/cms/food/challenges.ts', code);
console.log('Successfully injected Inputs challenge!');
