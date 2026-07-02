import { ChallengeData } from '../types';

export const foodChallenges: ChallengeData[] = [
  {
    id: 'land',
    title: '1. Land',
    desc: 'Access, mechanization, and soil regeneration pathways.',
    longDesc: 'Land is the fundamental challenge in African agriculture. We are addressing the fragmentation of arable land through diverse pathways including sole ownership, shared LLCs, long-term ground leases, and short-term crop-share agreements to unlock millions of hectares.',
    imageUrl: '/images/challenges/land.webp',
    stats: { activeSolutions: 12, capitalDeployed: '$4.2M', communitySize: '2,400+' },
    subcategories: [
      // GROUP 1: Sole Farmland Ownership
      {
        id: 'third-party-mortgage',
        title: 'Third-Party Mortgage',
        groupName: 'Sole Farmland Ownership',
        desc: 'Traditional lending and commercial mortgage pathways to accelerate sole farmland ownership.',
        imageUrl: '/images/subcategories/third-party-mortgage.webp',
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
        imageUrl: '/images/subcategories/installment-sale.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'crowdfunding',
        title: 'Crowdfunding',
        groupName: 'Sole Farmland Ownership',
        desc: 'Crowdfunding pathway to sole farmland ownership.',
        imageUrl: '/images/subcategories/crowdfunding.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'cdfi-lending',
        title: 'Community Based Lending',
        groupName: 'Sole Farmland Ownership',
        desc: 'CDFI pathway to sole farmland ownership.',
        imageUrl: '/images/subcategories/cdfi-lending.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 2: Shared Farmland Ownership
      {
        id: 'llc-shared-ownership',
        title: 'LLC Pathway',
        groupName: 'Shared Farmland Ownership',
        desc: 'LLC pathway to shared farmland ownership.',
        imageUrl: '/images/subcategories/llc-shared-ownership.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'cooperative-ownership',
        title: 'Cooperative Pathway',
        groupName: 'Shared Farmland Ownership',
        desc: 'Cooperative pathway to shared farmland ownership.',
        imageUrl: '/images/subcategories/cooperative-ownership.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 3: Long Term Farmland Use
      {
        id: 'ground-lease',
        title: 'Ground-Lease (40-99 Yrs)',
        groupName: 'Long Term Farmland Use',
        desc: 'Ground-lease pathway to long term farmland use.',
        imageUrl: '/images/subcategories/ground-lease.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'conservation-easement',
        title: 'Conservation Easement',
        groupName: 'Long Term Farmland Use',
        desc: 'Agricultural conservation easement pathway to long term use.',
        imageUrl: '/images/subcategories/conservation-easement.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 4: Short / Medium Term Farmland Use
      {
        id: 'cash-lease',
        title: 'Cash Lease (Short Term)',
        groupName: 'Short / Medium Term Farmland Use',
        desc: 'Cash lease pathway to short term farmland use.',
        imageUrl: '/images/subcategories/cash-lease.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'crop-share-lease',
        title: 'Crop-Share Lease',
        groupName: 'Short / Medium Term Farmland Use',
        desc: 'Crop-share lease pathway to medium term farmland use.',
        imageUrl: '/images/subcategories/crop-share-lease.webp',
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
    imageUrl: '/images/challenges/capital.webp',
    stats: { activeSolutions: 10, capitalDeployed: '$12.8M', communitySize: '1,800+' },
    subcategories: [
      // GROUP 1
      {
        id: 'savings',
        title: 'Personal Savings',
        groupName: 'Basic Liquidity & Transactions',
        desc: 'Unlocking personal savings for rural operators.',
        imageUrl: '/images/subcategories/savings.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'remittances',
        title: 'Remittances',
        groupName: 'Basic Liquidity & Transactions',
        desc: 'Remittance services and direct cash transfers.',
        imageUrl: '/images/subcategories/remittances.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'payments',
        title: 'Payments',
        groupName: 'Basic Liquidity & Transactions',
        desc: 'Payment accounts and gateways for seamless transactions.',
        imageUrl: '/images/subcategories/payments.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 2
      {
        id: 'cooperatives',
        title: 'Cooperatives (Esusu)',
        groupName: 'Grassroots Borrowing',
        desc: 'Rotating savings and credit clubs for local liquidity.',
        imageUrl: '/images/subcategories/cooperatives.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'microcredit',
        title: 'Micro-Credit',
        groupName: 'Grassroots Borrowing',
        desc: 'Accessible small loans for operational growth.',
        imageUrl: '/images/subcategories/microcredit.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 3
      {
        id: 'insurance',
        title: 'Insurance',
        groupName: 'Risk Mitigation & Future-Proofing',
        desc: 'Crop protection and livelihood insurance.',
        imageUrl: '/images/subcategories/insurance.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'pensions',
        title: 'Pensions',
        groupName: 'Risk Mitigation & Future-Proofing',
        desc: 'Safe third-pillar pension products for generational wealth.',
        imageUrl: '/images/subcategories/pensions.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'advisory',
        title: 'Financial Advisory',
        groupName: 'Risk Mitigation & Future-Proofing',
        desc: 'ERP and financial literacy assistance.',
        imageUrl: '/images/subcategories/advisory.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 4
      {
        id: 'payg',
        title: 'Installments (PAYG)',
        groupName: 'B2B & Advanced Structuring',
        desc: 'Installmental-pay and lease-to-own equipment models.',
        imageUrl: '/images/subcategories/payg.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'inventory',
        title: 'Inventory Financing',
        groupName: 'B2B & Advanced Structuring',
        desc: 'Supply chain and warehousing liquidity.',
        imageUrl: '/images/subcategories/inventory.webp',
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
    imageUrl: '/images/challenges/inputs.webp',
    stats: { activeSolutions: 15, capitalDeployed: '$5.0M', communitySize: '1,200+' },
    subcategories: [
      // GROUP 1: Seeds & Yield Enhancement
      {
        id: 'improved-crop-breeding',
        title: 'Improved Crop Breeding',
        groupName: 'Seeds & Yield Enhancement',
        desc: 'Advanced crop breeding techniques.',
        imageUrl: '/images/subcategories/improved-crop-breeding.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'drought-resistant-seeds',
        title: 'Drought Resistant Seeds',
        groupName: 'Seeds & Yield Enhancement',
        desc: 'Development of drought-resistant seed varieties.',
        imageUrl: '/images/subcategories/drought-resistant-seeds.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'fertilizers',
        title: 'Fertilizers',
        groupName: 'Seeds & Yield Enhancement',
        desc: 'Organic and synthetic fertilizer supply chains.',
        imageUrl: '/images/subcategories/fertilizers.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 2: Crop Protection
      {
        id: 'pesticides',
        title: 'Pesticides',
        groupName: 'Crop Protection',
        desc: 'Safe and effective pesticide applications.',
        imageUrl: '/images/subcategories/pesticides.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'herbicides',
        title: 'Herbicides',
        groupName: 'Crop Protection',
        desc: 'Targeted herbicide formulations.',
        imageUrl: '/images/subcategories/herbicides.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'fungicides',
        title: 'Fungicides',
        groupName: 'Crop Protection',
        desc: 'Fungal disease control mechanisms.',
        imageUrl: '/images/subcategories/fungicides.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'insecticides',
        title: 'Insecticides',
        groupName: 'Crop Protection',
        desc: 'Integrated pest management strategies.',
        imageUrl: '/images/subcategories/insecticides.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 3: Livestock Feed
      {
        id: 'animal-feed',
        title: 'Animal Feed',
        groupName: 'Livestock Feed',
        desc: 'High-yield nutritional feed for livestock.',
        imageUrl: '/images/subcategories/animal-feed.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 4: Farm Power & Mechanization
      {
        id: 'mechanized-farm-equipment',
        title: 'Mechanized Farm Equipment',
        groupName: 'Farm Power & Mechanization',
        desc: 'Tractors and heavy farm machinery.',
        imageUrl: '/images/subcategories/mechanized-farm-equipment.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'draught-animal-power',
        title: 'Draught-Animal Power',
        groupName: 'Farm Power & Mechanization',
        desc: 'Using draught animals for efficient farm power.',
        imageUrl: '/images/subcategories/draught-animal-power.webp',
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
    imageUrl: '/images/challenges/energy.webp',
    stats: { activeSolutions: 18, capitalDeployed: '$7.4M', communitySize: '1,500+' },
    subcategories: [
      // GROUP 1: Domestic & Communication Energy
      {
        id: 'lighting',
        title: 'Lighting Poverty',
        groupName: 'Domestic & Communication Energy',
        desc: 'Access to sustainable lighting solutions.',
        imageUrl: '/images/subcategories/lighting.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'ict',
        title: 'ICT Poverty',
        groupName: 'Domestic & Communication Energy',
        desc: 'Energy for information and communication tech.',
        imageUrl: '/images/subcategories/ict.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 2: Thermal & Cold Chain Energy
      {
        id: 'cooking-fuel',
        title: 'Cooking Fuel Poverty',
        groupName: 'Thermal & Cold Chain Energy',
        desc: 'Clean and accessible cooking fuels.',
        imageUrl: '/images/subcategories/cooking-fuel.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'heating-fuel',
        title: 'Heating Fuel Poverty',
        groupName: 'Thermal & Cold Chain Energy',
        desc: 'Energy for greenhouse and livestock heating.',
        imageUrl: '/images/subcategories/heating-fuel.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'storage-refrigeration',
        title: 'Storage & Refrigeration',
        groupName: 'Thermal & Cold Chain Energy',
        desc: 'Cold chain energy infrastructure.',
        imageUrl: '/images/subcategories/storage-refrigeration.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 3: Agricultural Operations Energy
      {
        id: 'processing-manufacturing',
        title: 'Processing & Manufacturing',
        groupName: 'Agricultural Operations Energy',
        desc: 'Energy for agro-processing.',
        imageUrl: '/images/subcategories/processing-manufacturing.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'water-supply-irrigation',
        title: 'Water-Supply & Irrigation',
        groupName: 'Agricultural Operations Energy',
        desc: 'Energy for large scale irrigation.',
        imageUrl: '/images/subcategories/water-supply-irrigation.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'transportation',
        title: 'Transportation Energy',
        groupName: 'Agricultural Operations Energy',
        desc: 'Fueling agricultural logistics.',
        imageUrl: '/images/subcategories/transportation.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'harvesting',
        title: 'Harvesting Energy',
        groupName: 'Agricultural Operations Energy',
        desc: 'Power for mechanized harvesting.',
        imageUrl: '/images/subcategories/harvesting.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 4: Energy Efficiency & Systems
      {
        id: 'energy-inefficiency',
        title: 'Energy Inefficiency',
        groupName: 'Energy Efficiency & Systems',
        desc: 'Systemic energy loss prevention.',
        imageUrl: '/images/subcategories/energy-inefficiency.webp',
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
    imageUrl: '/images/challenges/insecurity.webp',
    stats: { activeSolutions: 8, capitalDeployed: '$2.1M', communitySize: '950+' },
    subcategories: [
      // GROUP 1: Systemic & Political Violence
      {
        id: 'terrorism',
        title: 'Terrorism & Extremism',
        groupName: 'Systemic & Political Violence',
        desc: 'Terrorism and violent extremism operations.',
        imageUrl: '/images/subcategories/terrorism.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'armed-banditry',
        title: 'Armed Banditry',
        groupName: 'Systemic & Political Violence',
        desc: 'Armed banditry and transnational organized crimes.',
        imageUrl: '/images/subcategories/armed-banditry.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'secessionist-agitations',
        title: 'Secessionist Agitations',
        groupName: 'Systemic & Political Violence',
        desc: 'Secessionist agitations affecting trade routes.',
        imageUrl: '/images/subcategories/secessionist-agitations.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 2: Agro-Pastoral Conflict
      {
        id: 'cattle-rustling',
        title: 'Cattle Rustling',
        groupName: 'Agro-Pastoral Conflict',
        desc: 'Livestock theft and associated violence.',
        imageUrl: '/images/subcategories/cattle-rustling.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'farmers-herder-conflict',
        title: 'Farmers-Herder Conflict',
        groupName: 'Agro-Pastoral Conflict',
        desc: 'Complex conflicts over land and water usage.',
        imageUrl: '/images/subcategories/farmers-herder-conflict.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 3: Kidnapping & Ritual Violence
      {
        id: 'commercial-kidnapping',
        title: 'Commercial Kidnapping',
        groupName: 'Kidnapping & Ritual Violence',
        desc: 'Abduction for ransom operations.',
        imageUrl: '/images/subcategories/commercial-kidnapping.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'ritual-killings',
        title: 'Ritual Killings',
        groupName: 'Kidnapping & Ritual Violence',
        desc: 'Targeted killings for ritualistic purposes.',
        imageUrl: '/images/subcategories/ritual-killings.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 4: Resource Theft & Maritime
      {
        id: 'illegal-fishing-poaching',
        title: 'Illegal Fishing & Poaching',
        groupName: 'Resource Theft & Maritime',
        desc: 'Unregulated depletion of aquatic and wildlife resources.',
        imageUrl: '/images/subcategories/illegal-fishing-poaching.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'oil-pipeline-vandalism',
        title: 'Oil Pipeline Vandalism',
        groupName: 'Resource Theft & Maritime',
        desc: 'Destruction and theft of energy infrastructure.',
        imageUrl: '/images/subcategories/oil-pipeline-vandalism.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'piracy',
        title: 'Piracy',
        groupName: 'Resource Theft & Maritime',
        desc: 'Maritime insecurity affecting coastal logistics.',
        imageUrl: '/images/subcategories/piracy.webp',
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
    imageUrl: '/images/challenges/loss.webp',
    stats: { activeSolutions: 22, capitalDeployed: '$11.2M', communitySize: '3,100+' },
    subcategories: [
      // GROUP 1: Ingredients
      {
        id: 'tomato',
        title: 'Tomato',
        groupName: 'Spices',
        desc: 'Processing and cold-storage for tomatoes.',
        imageUrl: '/images/subcategories/tomato.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'pepper',
        title: 'Pepper',
        groupName: 'Spices',
        desc: 'Drying and market access for peppers.',
        imageUrl: '/images/subcategories/pepper.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 2: Grains
      {
        id: 'rice',
        title: 'Rice',
        groupName: 'Grains',
        desc: 'Milling, parboiling, and packaging of rice.',
        imageUrl: '/images/subcategories/rice.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'maize',
        title: 'Maize',
        groupName: 'Grains',
        desc: 'Silos and aflatoxin prevention for maize.',
        imageUrl: '/images/subcategories/maize.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'sorghum',
        title: 'Sorghum',
        groupName: 'Grains',
        desc: 'Industrial processing and malting of sorghum.',
        imageUrl: '/images/subcategories/sorghum.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'beans',
        title: 'Beans',
        groupName: 'Grains',
        desc: 'Weevil prevention and hermetic storage for beans.',
        imageUrl: '/images/subcategories/beans.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 3: Roots & Tubers
      {
        id: 'potato',
        title: 'Potato',
        groupName: 'Roots & Tubers',
        desc: 'Curing and temperature-controlled storage.',
        imageUrl: '/images/subcategories/potato.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'yam',
        title: 'Yam',
        groupName: 'Roots & Tubers',
        desc: 'Tuber preservation and processing into flour.',
        imageUrl: '/images/subcategories/yam.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'cassava',
        title: 'Cassava',
        groupName: 'Roots & Tubers',
        desc: 'Rapid processing to prevent post-harvest spoilage.',
        imageUrl: '/images/subcategories/cassava.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 4: Fruits
      {
        id: 'mango',
        title: 'Mango',
        groupName: 'Fruits',
        desc: 'Juicing, drying, and cold-chain transport.',
        imageUrl: '/images/subcategories/mango.webp',
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
    imageUrl: '/images/challenges/protein.webp',
    stats: { activeSolutions: 42, capitalDeployed: '$15.8M', communitySize: '4,500+' },
    subcategories: [
      // GROUP 1: Animal Protein
      {
        id: 'chicken-and-eggs',
        title: 'Chicken and Eggs',
        groupName: 'Animal Protein',
        desc: 'Poultry farming and egg production.',
        imageUrl: '/images/subcategories/chicken-and-eggs.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'beef',
        title: 'Beef',
        groupName: 'Animal Protein',
        desc: 'Cattle rearing and beef processing.',
        imageUrl: '/images/subcategories/beef.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'lamb-and-ram',
        title: 'Lamb & Ram',
        groupName: 'Animal Protein',
        desc: 'Sheep farming for meat.',
        imageUrl: '/images/subcategories/lamb-and-ram.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'pork',
        title: 'Pork',
        groupName: 'Animal Protein',
        desc: 'Pig farming and pork processing.',
        imageUrl: '/images/subcategories/pork.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'dairy',
        title: 'Dairy',
        groupName: 'Animal Protein',
        desc: 'Milk from cattle and buffalo.',
        imageUrl: '/images/subcategories/dairy.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 2: Seafood
      {
        id: 'fish',
        title: 'Fish',
        groupName: 'Seafood',
        desc: 'Fresh water and pelagic fish farming/catching.',
        imageUrl: '/images/subcategories/fish.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'shellfish',
        title: 'Shellfish',
        groupName: 'Seafood',
        desc: 'Crustaceans and molluscs production.',
        imageUrl: '/images/subcategories/shellfish.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'cephalopods',
        title: 'Cephalopods',
        groupName: 'Seafood',
        desc: 'Squid, octopus, and cuttlefish harvesting.',
        imageUrl: '/images/subcategories/cephalopods.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 3: Farmed Protein
      {
        id: 'beans-and-lentils',
        title: 'Beans & Lentils',
        groupName: 'Farmed Protein',
        desc: 'Pulses, chickpeas, lentils, and dry peas.',
        imageUrl: '/images/subcategories/beans-and-lentils.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'nuts-and-seeds',
        title: 'Nuts & Seeds',
        groupName: 'Farmed Protein',
        desc: 'Oil seeds, nuts, and meals.',
        imageUrl: '/images/subcategories/nuts-and-seeds.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      }
    ]
  }
];
