const fs = require('fs');
let code = fs.readFileSync('lib/cms/food/challenges.ts', 'utf8');

const newInsecurityChallenge = `
  {
    id: 'insecurity',
    title: '5. Insecurity',
    desc: 'Insecurity, banditry, and kidnapping disrupting the food supply.',
    longDesc: 'Detailed breakdown of the insecurity crisis and the society\\'s approach to resolving and operating amidst these threats. Note the nuanced perspectives required (e.g. "Don\\'t Call It Farmer-Herder Conflict").',
    imageUrl: 'https://images.unsplash.com/photo-1596484552993-9c86a1175620?q=80&w=1200&auto=format&fit=crop',
    stats: { activeSolutions: 8, capitalDeployed: '$2.1M', communitySize: '950+' },
    subcategories: [
      // GROUP 1: Systemic & Political Violence
      {
        id: 'terrorism',
        title: 'Terrorism & Extremism',
        groupName: 'Systemic & Political Violence',
        desc: 'Terrorism and violent extremism operations.',
        imageUrl: 'https://images.unsplash.com/photo-1596484552993-9c86a1175620?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'armed-banditry',
        title: 'Armed Banditry',
        groupName: 'Systemic & Political Violence',
        desc: 'Armed banditry and transnational organized crimes.',
        imageUrl: 'https://images.unsplash.com/photo-1596484552993-9c86a1175620?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'secessionist-agitations',
        title: 'Secessionist Agitations',
        groupName: 'Systemic & Political Violence',
        desc: 'Secessionist agitations affecting trade routes.',
        imageUrl: 'https://images.unsplash.com/photo-1596484552993-9c86a1175620?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 2: Agro-Pastoral Conflict
      {
        id: 'cattle-rustling',
        title: 'Cattle Rustling',
        groupName: 'Agro-Pastoral Conflict',
        desc: 'Livestock theft and associated violence.',
        imageUrl: 'https://images.unsplash.com/photo-1596484552993-9c86a1175620?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'farmers-herder-conflict',
        title: 'Farmers-Herder Conflict',
        groupName: 'Agro-Pastoral Conflict',
        desc: 'Complex conflicts over land and water usage.',
        imageUrl: 'https://images.unsplash.com/photo-1596484552993-9c86a1175620?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 3: Kidnapping & Ritual Violence
      {
        id: 'commercial-kidnapping',
        title: 'Commercial Kidnapping',
        groupName: 'Kidnapping & Ritual Violence',
        desc: 'Abduction for ransom operations.',
        imageUrl: 'https://images.unsplash.com/photo-1596484552993-9c86a1175620?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'ritual-killings',
        title: 'Ritual Killings',
        groupName: 'Kidnapping & Ritual Violence',
        desc: 'Targeted killings for ritualistic purposes.',
        imageUrl: 'https://images.unsplash.com/photo-1596484552993-9c86a1175620?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 4: Resource Theft & Maritime
      {
        id: 'illegal-fishing-poaching',
        title: 'Illegal Fishing & Poaching',
        groupName: 'Resource Theft & Maritime',
        desc: 'Unregulated depletion of aquatic and wildlife resources.',
        imageUrl: 'https://images.unsplash.com/photo-1596484552993-9c86a1175620?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'oil-pipeline-vandalism',
        title: 'Oil Pipeline Vandalism',
        groupName: 'Resource Theft & Maritime',
        desc: 'Destruction and theft of energy infrastructure.',
        imageUrl: 'https://images.unsplash.com/photo-1596484552993-9c86a1175620?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'piracy',
        title: 'Piracy',
        groupName: 'Resource Theft & Maritime',
        desc: 'Maritime insecurity affecting coastal logistics.',
        imageUrl: 'https://images.unsplash.com/photo-1596484552993-9c86a1175620?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      }
    ]
  }`;

// 1. Insert insecurity challenge before the dynamic array
code = code.replace(
  `...['insecurity', 'loss', 'protein']`,
  newInsecurityChallenge.trim() + `,\n  ...['loss', 'protein']`
);

// 2. Adjust the mapping index for the remaining challenges (idx + 5 -> idx + 6)
code = code.replace(
  /title: \`\$\{idx \+ 5\}\. \$\{id\.charAt\(0\)\.toUpperCase\(\) \+ id\.slice\(1\)\}\`,/g,
  `title: \`\$\{idx + 6\}. \$\{id.charAt(0).toUpperCase() + id.slice(1)}\`,`
);

fs.writeFileSync('lib/cms/food/challenges.ts', code);
console.log('Successfully injected Insecurity challenge!');
