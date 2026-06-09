const fs = require('fs');
let code = fs.readFileSync('lib/cms/food/challenges.ts', 'utf8');

const newEnergyChallenge = `
  {
    id: 'energy',
    title: '4. Energy',
    desc: 'Energy poverty across the agricultural value chain.',
    longDesc: 'Detailed breakdown of the energy crisis and the society\\'s approach to solving it.',
    imageUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ea9eeae?q=80&w=1200&auto=format&fit=crop',
    stats: { activeSolutions: 18, capitalDeployed: '$7.4M', communitySize: '1,500+' },
    subcategories: [
      // GROUP 1: Domestic & Communication Energy
      {
        id: 'lighting',
        title: 'Lighting Poverty',
        groupName: 'Domestic & Communication Energy',
        desc: 'Access to sustainable lighting solutions.',
        imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'ict',
        title: 'ICT Poverty',
        groupName: 'Domestic & Communication Energy',
        desc: 'Energy for information and communication tech.',
        imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 2: Thermal & Cold Chain Energy
      {
        id: 'cooking-fuel',
        title: 'Cooking Fuel Poverty',
        groupName: 'Thermal & Cold Chain Energy',
        desc: 'Clean and accessible cooking fuels.',
        imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'heating-fuel',
        title: 'Heating Fuel Poverty',
        groupName: 'Thermal & Cold Chain Energy',
        desc: 'Energy for greenhouse and livestock heating.',
        imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'storage-refrigeration',
        title: 'Storage & Refrigeration',
        groupName: 'Thermal & Cold Chain Energy',
        desc: 'Cold chain energy infrastructure.',
        imageUrl: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 3: Agricultural Operations Energy
      {
        id: 'processing-manufacturing',
        title: 'Processing & Manufacturing',
        groupName: 'Agricultural Operations Energy',
        desc: 'Energy for agro-processing.',
        imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4bffc269094?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'water-supply-irrigation',
        title: 'Water-Supply & Irrigation',
        groupName: 'Agricultural Operations Energy',
        desc: 'Energy for large scale irrigation.',
        imageUrl: 'https://images.unsplash.com/photo-1563212005-724bbd1a09ea?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'transportation',
        title: 'Transportation Energy',
        groupName: 'Agricultural Operations Energy',
        desc: 'Fueling agricultural logistics.',
        imageUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'harvesting',
        title: 'Harvesting Energy',
        groupName: 'Agricultural Operations Energy',
        desc: 'Power for mechanized harvesting.',
        imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 4: Energy Efficiency & Systems
      {
        id: 'energy-inefficiency',
        title: 'Energy Inefficiency',
        groupName: 'Energy Efficiency & Systems',
        desc: 'Systemic energy loss prevention.',
        imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      }
    ]
  }`;

// 1. Insert energy challenge before the dynamic array
code = code.replace(
  `...['energy', 'insecurity', 'loss', 'protein']`,
  newEnergyChallenge.trim() + `,\n  ...['insecurity', 'loss', 'protein']`
);

// 2. Adjust the mapping index for the remaining challenges (idx + 4 -> idx + 5)
code = code.replace(
  /title: \`\$\{idx \+ 4\}\. \$\{id\.charAt\(0\)\.toUpperCase\(\) \+ id\.slice\(1\)\}\`,/g,
  `title: \`\$\{idx + 5\}. \$\{id.charAt(0).toUpperCase() + id.slice(1)}\`,`
);

fs.writeFileSync('lib/cms/food/challenges.ts', code);
console.log('Successfully injected Energy challenge!');
