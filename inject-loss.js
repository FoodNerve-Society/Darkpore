const fs = require('fs');
let code = fs.readFileSync('lib/cms/food/challenges.ts', 'utf8');

const newLossChallenge = `
  {
    id: 'loss',
    title: '6. Post-Harvest Loss',
    desc: 'Post-harvest food loss and access to market.',
    longDesc: 'Detailed breakdown of the post-harvest loss crisis across different crop types, focusing on processing, storage, and market access.',
    imageUrl: 'https://images.unsplash.com/photo-1595856453084-2f960c91ba41?q=80&w=1200&auto=format&fit=crop',
    stats: { activeSolutions: 22, capitalDeployed: '$11.2M', communitySize: '3,100+' },
    subcategories: [
      // GROUP 1: Ingredients
      {
        id: 'tomato',
        title: 'Tomato',
        groupName: 'Ingredients',
        desc: 'Processing and cold-storage for tomatoes.',
        imageUrl: 'https://images.unsplash.com/photo-1592921870789-04563d55041c?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'pepper',
        title: 'Pepper',
        groupName: 'Ingredients',
        desc: 'Drying and market access for peppers.',
        imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 2: Grains
      {
        id: 'rice',
        title: 'Rice',
        groupName: 'Grains',
        desc: 'Milling, parboiling, and packaging of rice.',
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'maize',
        title: 'Maize',
        groupName: 'Grains',
        desc: 'Silos and aflatoxin prevention for maize.',
        imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'sorghum',
        title: 'Sorghum',
        groupName: 'Grains',
        desc: 'Industrial processing and malting of sorghum.',
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'beans',
        title: 'Beans',
        groupName: 'Grains',
        desc: 'Weevil prevention and hermetic storage for beans.',
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 3: Roots & Tubers
      {
        id: 'potato',
        title: 'Potato',
        groupName: 'Roots & Tubers',
        desc: 'Curing and temperature-controlled storage.',
        imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'yam',
        title: 'Yam',
        groupName: 'Roots & Tubers',
        desc: 'Tuber preservation and processing into flour.',
        imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'cassava',
        title: 'Cassava',
        groupName: 'Roots & Tubers',
        desc: 'Rapid processing to prevent post-harvest spoilage.',
        imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 4: Fruits
      {
        id: 'mango',
        title: 'Mango',
        groupName: 'Fruits',
        desc: 'Juicing, drying, and cold-chain transport.',
        imageUrl: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      }
    ]
  }`;

// 1. Insert loss challenge before the dynamic array
code = code.replace(
  `...['loss', 'protein']`,
  newLossChallenge.trim() + `,\n  ...['protein']`
);

// 2. Adjust the mapping index for the remaining challenges (idx + 6 -> idx + 7)
code = code.replace(
  /title: \`\$\{idx \+ 6\}\. \$\{id\.charAt\(0\)\.toUpperCase\(\) \+ id\.slice\(1\)\}\`,/g,
  `title: \`\$\{idx + 7\}. \$\{id.charAt(0).toUpperCase() + id.slice(1)}\`,`
);

fs.writeFileSync('lib/cms/food/challenges.ts', code);
console.log('Successfully injected Loss challenge!');
