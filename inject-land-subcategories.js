const fs = require('fs');
let code = fs.readFileSync('lib/cms/food/challenges.ts', 'utf8');

const newLandSubcategories = `[
      // GROUP 1: Sole Farmland Ownership
      {
        id: 'third-party-mortgage',
        title: 'Third-Party Mortgage',
        groupName: 'Sole Farmland Ownership',
        desc: 'Traditional lending pathway to sole farmland ownership.',
        imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'installment-sale',
        title: 'Installment-Sale',
        groupName: 'Sole Farmland Ownership',
        desc: 'By current owners pathway to sole farmland ownership.',
        imageUrl: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0a3824?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'crowdfunding',
        title: 'Crowdfunding',
        groupName: 'Sole Farmland Ownership',
        desc: 'Crowdfunding pathway to sole farmland ownership.',
        imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'cdfi-lending',
        title: 'Community Based Lending',
        groupName: 'Sole Farmland Ownership',
        desc: 'CDFI pathway to sole farmland ownership.',
        imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 2: Shared Farmland Ownership
      {
        id: 'llc-shared-ownership',
        title: 'LLC Pathway',
        groupName: 'Shared Farmland Ownership',
        desc: 'LLC pathway to shared farmland ownership.',
        imageUrl: 'https://images.unsplash.com/photo-1505471768110-2c86e11b3bc2?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'cooperative-ownership',
        title: 'Cooperative Pathway',
        groupName: 'Shared Farmland Ownership',
        desc: 'Cooperative pathway to shared farmland ownership.',
        imageUrl: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 3: Long Term Farmland Use
      {
        id: 'ground-lease',
        title: 'Ground-Lease (40-99 Yrs)',
        groupName: 'Long Term Farmland Use',
        desc: 'Ground-lease pathway to long term farmland use.',
        imageUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'conservation-easement',
        title: 'Conservation Easement',
        groupName: 'Long Term Farmland Use',
        desc: 'Agricultural conservation easement pathway to long term use.',
        imageUrl: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 4: Short / Medium Term Farmland Use
      {
        id: 'cash-lease',
        title: 'Cash Lease (Short Term)',
        groupName: 'Short / Medium Term Farmland Use',
        desc: 'Cash lease pathway to short term farmland use.',
        imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'crop-share-lease',
        title: 'Crop-Share Lease',
        groupName: 'Short / Medium Term Farmland Use',
        desc: 'Crop-share lease pathway to medium term farmland use.',
        imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      }
    ]`;

const startIdx = code.indexOf(`subcategories: [`);
const endIdx = code.indexOf(`  },\n  {\n    id: 'capital',`);

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `subcategories: ${newLandSubcategories}\n`;
  code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
  fs.writeFileSync('lib/cms/food/challenges.ts', code);
  console.log('Successfully injected 10 new land subcategories!');
} else {
  console.log('Indices not found!');
}
