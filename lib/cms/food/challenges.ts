import { ChallengeData } from '../types';

export const foodChallenges: ChallengeData[] = [
  {
    id: 'land',
    title: '1. Land',
    desc: 'Access, mechanization, and soil regeneration pathways.',
    longDesc: 'Land is the fundamental challenge in African agriculture. We are addressing the fragmentation of arable land through diverse pathways including sole ownership, shared LLCs, long-term ground leases, and short-term crop-share agreements to unlock millions of hectares.',
    imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1200&auto=format&fit=crop',
    stats: { activeSolutions: 12, capitalDeployed: '$4.2M', communitySize: '2,400+' },
    subcategories: [
      // GROUP 1: Sole Farmland Ownership
      {
        id: 'third-party-mortgage',
        title: 'Third-Party Mortgage',
        groupName: 'Sole Farmland Ownership',
        desc: 'Traditional lending and commercial mortgage pathways to accelerate sole farmland ownership.',
        imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop',
        updates: [
          { id: 'mortgage-upd-1', title: 'NAMT Taskforce Meeting: Standardizing Interest Rates', section: 'community', date: new Date().toISOString(), importance: 'high', linkText: 'View Agenda', summary: 'The National Agrarian Mortgage Taskforce is convening this week to negotiate subsidized rates with top-tier commercial banks.' },
          { id: 'mortgage-upd-2', title: 'AgriFi Launches Zero-Down Mortgage Product', section: 'innovations', date: new Date().toISOString(), importance: 'normal', linkText: 'Read Announcement', summary: 'AgriFi just secured $5M to roll out a zero-down mortgage product specifically for youth farmers backed by off-taker guarantees.' },
          { id: 'mortgage-upd-3', title: 'Whitepaper: Risk Assessment in Agrarian Mortgages', section: 'library', date: new Date().toISOString(), importance: 'normal', linkText: 'Download PDF', summary: 'A comprehensive 40-page report outlining the new AI-driven underwriting standards for unbanked rural farmers.' },
          { id: 'mortgage-upd-4', title: 'Bankers & Farmers Mixer Event - Lagos', section: 'activities', date: new Date().toISOString(), importance: 'high', linkText: 'RSVP Now', summary: 'Join 50+ commercial lenders and 200+ cooperative leaders for a direct networking and deal-making session.' },
          { id: 'mortgage-upd-5', title: 'Live AMA: Securing Your First Farmland Mortgage', section: 'livestreams', date: new Date().toISOString(), importance: 'high', linkText: 'Set Reminder', summary: 'Expert credit officers break down exactly what they look for in a farm business plan before approving a mortgage.' },
          { id: 'mortgage-upd-6', title: 'Credit Risk Analyst needed at AgriFi', section: 'jobs', date: new Date().toISOString(), importance: 'normal', linkText: 'Apply Here', summary: 'AgriFi is hiring a senior credit analyst with deep experience in agricultural value chains.' },
        ],
        learningMaterials: [
          { slug: 'understanding-amortization', title: 'Understanding Amortization Schedules', type: 'article', previewText: 'Learn how your mortgage principal and interest are structured over a 15-year term.', isPremium: false, dateAdded: new Date().toISOString(), thumbnailUrl: '' }
        ],
        sections: { 
          innovations: {title:'Innovations',content:'Tracking emerging fintech solutions and alternative credit scoring models designed to bypass traditional collateral requirements.'}, 
          library: {title:'Library',content:'Open-source underwriting templates, risk assessment models, and historical default rate data.'}, 
          community: {title:'Community',content:'Join the National Agrarian Mortgage Taskforce (NAMT) to lobby for subsidized interest rates and standardized terms.'}, 
          activities: {title:'Activities',content:'Local bootcamps on credit readiness and financial literacy for cooperative leaders.'}, 
          livestreams: {title:'Livestreams',content:'Weekly breakdowns of successful mortgage applications and interviews with lenders.'}, 
          jobs: {title:'Jobs',content:'Open roles at agricultural banks, fintech startups, and credit bureaus.'} 
        }
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
    ]
  },
  {
    id: 'capital',
    title: '2. Capital',
    desc: 'Unlocking capital via subsidies, credit, and grants.',
    longDesc: 'Bridging the agricultural financing gap by architecting structured capital pathways. We coordinate blended finance mechanisms including government subsidies, commercial credit, foreign direct investment, and impact grants to empower scalable farming operations.',
    imageUrl: 'https://images.unsplash.com/photo-1553729459-afe8f2e2ed65?q=80&w=1200&auto=format&fit=crop',
    stats: { activeSolutions: 10, capitalDeployed: '$12.8M', communitySize: '1,800+' },
    subcategories: [
      // GROUP 1
      {
        id: 'savings',
        title: 'Personal Savings',
        groupName: 'Basic Liquidity & Transactions',
        desc: 'Unlocking personal savings for rural operators.',
        imageUrl: 'https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'remittances',
        title: 'Remittances',
        groupName: 'Basic Liquidity & Transactions',
        desc: 'Remittance services and direct cash transfers.',
        imageUrl: 'https://images.unsplash.com/photo-1580519542036-ed47f3e42a9b?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'payments',
        title: 'Payments',
        groupName: 'Basic Liquidity & Transactions',
        desc: 'Payment accounts and gateways for seamless transactions.',
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 2
      {
        id: 'cooperatives',
        title: 'Cooperatives (Esusu)',
        groupName: 'Grassroots Borrowing',
        desc: 'Rotating savings and credit clubs for local liquidity.',
        imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'microcredit',
        title: 'Micro-Credit',
        groupName: 'Grassroots Borrowing',
        desc: 'Accessible small loans for operational growth.',
        imageUrl: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 3
      {
        id: 'insurance',
        title: 'Insurance',
        groupName: 'Risk Mitigation & Future-Proofing',
        desc: 'Crop protection and livelihood insurance.',
        imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'pensions',
        title: 'Pensions',
        groupName: 'Risk Mitigation & Future-Proofing',
        desc: 'Safe third-pillar pension products for generational wealth.',
        imageUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'advisory',
        title: 'Financial Advisory',
        groupName: 'Risk Mitigation & Future-Proofing',
        desc: 'ERP and financial literacy assistance.',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 4
      {
        id: 'payg',
        title: 'Installments (PAYG)',
        groupName: 'B2B & Advanced Structuring',
        desc: 'Installmental-pay and lease-to-own equipment models.',
        imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'inventory',
        title: 'Inventory Financing',
        groupName: 'B2B & Advanced Structuring',
        desc: 'Supply chain and warehousing liquidity.',
        imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      }
    ]
  },
  {
    id: 'inputs',
    title: '3. Inputs',
    desc: 'Optimizing seeds, fertilizers, and mechanized power.',
    longDesc: 'Overcoming reduced yields by streamlining access to critical agro-inputs. We focus on drought-resistant seed breeding, advanced crop protection, animal feed optimization, and deploying mechanized farm equipment to multiply baseline productivity.',
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
  },
  {
    id: 'energy',
    title: '4. Energy',
    desc: 'Eradicating energy poverty across the supply chain.',
    longDesc: 'Resolving the critical energy deficit that cripples agro-processing. We are tackling lighting, thermal/cold chain demands, and operational power gaps to ensure continuous, energy-efficient manufacturing, storage, and irrigation.',
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
  },
  {
    id: 'insecurity',
    title: '5. Insecurity',
    desc: 'Mitigating systemic violence, theft, and pastoral conflict.',
    longDesc: 'Securing the agricultural ecosystem against existential threats. We deploy strategies to neutralize disruptions caused by armed banditry, farmer-herder clashes, commercial kidnapping, and resource theft, ensuring uninterrupted food production.',
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
  },
  {
    id: 'loss',
    title: '6. Post-Harvest Loss',
    desc: 'Preventing post-harvest loss across all food categories.',
    longDesc: 'Building robust preservation infrastructure to halt post-harvest waste. We construct cold-chain logistics, processing facilities, and secure storage for volatile spices, grains, roots, tubers, and fresh fruits to maximize market access.',
    imageUrl: 'https://images.unsplash.com/photo-1595856453084-2f960c91ba41?q=80&w=1200&auto=format&fit=crop',
    stats: { activeSolutions: 22, capitalDeployed: '$11.2M', communitySize: '3,100+' },
    subcategories: [
      // GROUP 1: Ingredients
      {
        id: 'tomato',
        title: 'Tomato',
        groupName: 'Spices',
        desc: 'Processing and cold-storage for tomatoes.',
        imageUrl: 'https://images.unsplash.com/photo-1592921870789-04563d55041c?q=80&w=1000&auto=format&fit=crop',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'pepper',
        title: 'Pepper',
        groupName: 'Spices',
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
  },
  {
    id: 'protein',
    title: '7. Protein',
    desc: 'Scaling accessible animal, farmed, and seafood proteins.',
    longDesc: 'Combating nutritional insecurity by industrializing protein production. We optimize the rearing, harvesting, and processing of diverse protein sources—from poultry and beef to pulses and pelagic fish—making high-quality dietary protein affordable.',
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
      {
        id: 'dairy',
        title: 'Dairy',
        groupName: 'Animal Protein',
        desc: 'Milk from cattle and buffalo.',
        imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=1000&auto=format&fit=crop',
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
      {
        id: 'cephalopods',
        title: 'Cephalopods',
        groupName: 'Seafood',
        desc: 'Squid, octopus, and cuttlefish harvesting.',
        imageUrl: 'https://images.unsplash.com/photo-1616854157121-65b38edfc4bb?q=80&w=1000&auto=format&fit=crop',
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
      }
    ]
  }
];
