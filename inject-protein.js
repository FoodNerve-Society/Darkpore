const fs = require('fs');
let code = fs.readFileSync('lib/cms/food/challenges.ts', 'utf8');

const newProteinChallenge = `
  {
    id: 'protein',
    title: '7. Protein',
    desc: 'Expensive dietary protein and nutritional insecurity.',
    longDesc: 'Detailed breakdown of the expensive dietary protein crisis across animal, seafood, and farmed sources.',
    imageUrl: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?q=80&w=1200&auto=format&fit=crop',
    stats: { activeSolutions: 42, capitalDeployed: '$15.8M', communitySize: '4,500+' },
    subcategories: [
      // GROUP 1: Animal Protein
      {
        id: 'chicken-and-eggs',
        title: 'Chicken and Eggs',
        groupName: 'Animal Protein',
        desc: 'Poultry farming and egg production.',
        imageUrl: 'https://images.unsplash.com/photo-1548550023-2bf3c49b406f?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'beef',
        title: 'Beef',
        groupName: 'Animal Protein',
        desc: 'Cattle rearing and beef processing.',
        imageUrl: 'https://images.unsplash.com/photo-1551028150-64b9f398f678?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'lamb-and-ram',
        title: 'Lamb & Ram',
        groupName: 'Animal Protein',
        desc: 'Sheep farming for meat.',
        imageUrl: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'pork',
        title: 'Pork',
        groupName: 'Animal Protein',
        desc: 'Pig farming and pork processing.',
        imageUrl: 'https://images.unsplash.com/photo-1628148674910-097ed44337d1?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 2: Seafood
      {
        id: 'fish',
        title: 'Fish',
        groupName: 'Seafood',
        desc: 'Fresh water and pelagic fish farming/catching.',
        imageUrl: 'https://images.unsplash.com/photo-1521570776516-7243b9df7438?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'shellfish',
        title: 'Shellfish',
        groupName: 'Seafood',
        desc: 'Crustaceans and molluscs production.',
        imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 1: Animal Protein (cont.)
      {
        id: 'dairy',
        title: 'Dairy',
        groupName: 'Animal Protein',
        desc: 'Milk from cattle and buffalo.',
        imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 3: Farmed Protein
      {
        id: 'beans-and-lentils',
        title: 'Beans & Lentils',
        groupName: 'Farmed Protein',
        desc: 'Pulses, chickpeas, lentils, and dry peas.',
        imageUrl: 'https://images.unsplash.com/photo-1515589654460-6b6de1f32a76?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'nuts-and-seeds',
        title: 'Nuts & Seeds',
        groupName: 'Farmed Protein',
        desc: 'Oil seeds, nuts, and meals.',
        imageUrl: 'https://images.unsplash.com/photo-1599598425947-33000c01cb3b?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 2: Seafood (cont.)
      {
        id: 'cephalopods',
        title: 'Cephalopods',
        groupName: 'Seafood',
        desc: 'Squid, octopus, and cuttlefish harvesting.',
        imageUrl: 'https://images.unsplash.com/photo-1616854157121-65b38edfc4bb?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      }
    ]
  }`;

// 1. Replace the final dynamic map line entirely.
code = code.replace(
  /...\\['protein'\\]\\.map\\(\\(id, idx\\) => \\(\\{[\\s\\S]*?\\}\\)\\)/m,
  newProteinChallenge.trim()
);

fs.writeFileSync('lib/cms/food/challenges.ts', code);
console.log('Successfully injected Protein challenge!');
