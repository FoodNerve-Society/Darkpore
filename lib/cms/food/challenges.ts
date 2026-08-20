import { ChallengeData } from '../types';

export const foodChallenges: ChallengeData[] = [
  {
    id: 'land',
    title: '2. Obstacles to Farm / Land Access & Tenure',
    desc: 'Unlocking agricultural land access, tenure security, title registration, and dispute resolution.',
    longDesc: 'Unlocking agricultural land access, tenure security, title registration, and dispute resolution across customary, public, and private property frameworks in Africa to secure long-term productive farming assets.',
    imageUrl: '/images/challenges/land.webp',
    stats: { activeSolutions: 12, capitalDeployed: '$4.2M', communitySize: '2,400+' },
    subcategories: [
      // GROUP 1: Property Acquisition & Freehold
      {
        id: 'owning-land',
        title: 'Owning Land (Land & Property Ownership)',
        groupName: 'Property Acquisition & Freehold',
        desc: 'Fee-simple freehold land acquisition, real estate transfer rights, and legal documentation securing permanent agricultural property ownership.',
        imageUrl: '/images/subcategories/third-party-mortgage.webp',
        updates: [
          { id: 'mortgage-upd-1', title: 'Taskforce Meeting: Land Title Acquisition Reforms', section: 'community', date: new Date().toISOString(), importance: 'high', linkText: 'View Agenda', summary: 'Convening agricultural legal experts and state land registries to streamline private land acquisition processes.' },
          { id: 'mortgage-upd-2', title: 'TitleDeed.ng Launches Digital Farmland Verification', section: 'innovations', date: new Date().toISOString(), importance: 'normal', linkText: 'Read Announcement', summary: 'AI-assisted satellite surveying and deed verification now live for private agricultural land buyers.' },
        ],
        learningMaterials: [
          { slug: 'understanding-land-ownership', title: 'Navigating Farmland Ownership & Freeholds', type: 'article', previewText: 'Key legal steps and due diligence required when purchasing agricultural land in Nigeria.', isPremium: false, dateAdded: new Date().toISOString(), thumbnailUrl: '' }
        ],
        sections: { 
          innovations: {title:'Innovations',content:'Tracking emerging prop-tech and legal-tech solutions streamlining private agricultural land acquisitions.'}, 
          library: {title:'Library',content:'Standard sale agreements, deed transfer templates, and legal due diligence checklists.'}, 
          community: {title:'Community',content:'Join agrarian legal taskforces to advocate for lower stamp duties and standardized land transfer processes.'}, 
          activities: {title:'Activities',content:'Workshops on freehold title verification and navigating land registry bureaucracies.'}, 
          livestreams: {title:'Livestreams',content:'Interactive sessions with agricultural property attorneys and seasoned landowners.'}, 
          jobs: {title:'Jobs',content:'Open roles for conveyancing lawyers, cadastral surveyors, and land acquisition specialists.'} 
        }
      },
      // GROUP 2: Tenancy & Commercial Leasing
      {
        id: 'renting-spaces',
        title: 'Renting Spaces (Leasing & Rental)',
        groupName: 'Tenancy & Commercial Leasing',
        desc: 'Short, medium, and long-term agricultural leases, greenhouse facility rentals, and commercial processing ground-rent agreements.',
        imageUrl: '/images/subcategories/ground-lease.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 3: Public & Institutional Concessions
      {
        id: 'public-land-allocation',
        title: 'Getting Public Land (Public Land Allocation & Concessions)',
        groupName: 'Public & Institutional Concessions',
        desc: 'Government agricultural land allocations, state farm reserves, special agro-processing zones (SAPZ), and long-term sovereign concessions.',
        imageUrl: '/images/subcategories/conservation-easement.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 4: Customary & Indigenous Rights
      {
        id: 'ancestral-customary-lands',
        title: 'Ancestral Lands (Customary, Communal & Indigenous Access)',
        groupName: 'Customary & Indigenous Rights',
        desc: 'Navigating customary tenure, indigenous stool land rights, traditional authority protocols, community trust frameworks, and family land inheritance.',
        imageUrl: '/images/subcategories/cdfi-lending.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 5: Collaborative & Shared Facilities
      {
        id: 'sharing-land-premises',
        title: 'Sharing Land (Shared Land & Premises)',
        groupName: 'Collaborative & Shared Facilities',
        desc: 'Collaborative farming syndicates, shared aggregation yards, co-located processing hubs, and fractional cooperative land-sharing schemes.',
        imageUrl: '/images/subcategories/llc-shared-ownership.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 6: Financing & Affordability
      {
        id: 'affording-land',
        title: 'Affording Land (Land & Premises Affordability)',
        groupName: 'Financing & Affordability',
        desc: 'Overcoming speculative real estate pricing, rural land inflation, and financing barriers through subsidized purchase schemes and blended micro-leases.',
        imageUrl: '/images/subcategories/crowdfunding.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 7: Titling & Cadastral Perfection
      {
        id: 'registering-land-titles',
        title: 'Registering Land (Titles, Registration & Property Records)',
        groupName: 'Titling & Cadastral Perfection',
        desc: 'Certificate of Occupancy (C of O), cadastral surveying, deed registration, governor’s consent, and digital land title perfection.',
        imageUrl: '/images/subcategories/installment-sale.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 8: Planning & Environmental Zoning
      {
        id: 'zoning-permitted-use',
        title: 'Zoning Land (Zoning & Permitted Use)',
        groupName: 'Planning & Environmental Zoning',
        desc: 'Agricultural master-plan zoning compliance, environmental impact assessments (EIA), greenbelt conservation, and peri-urban permitted use rights.',
        imageUrl: '/images/subcategories/cash-lease.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 9: Statutory Permits & Compliance
      {
        id: 'land-permits-approvals',
        title: 'Land Permits (Construction, Conversion & Occupancy Approvals)',
        groupName: 'Statutory Permits & Compliance',
        desc: 'Securing farm infrastructure building permits, agro-processing facility conversion rights, water extraction licenses, and commercial occupancy approvals.',
        imageUrl: '/images/subcategories/cooperative-ownership.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 10: Legal Defense & Conflict Resolution
      {
        id: 'eviction-property-disputes',
        title: 'Eviction & Disputes (Eviction, Displacement & Property Disputes)',
        groupName: 'Legal Defense & Conflict Resolution',
        desc: 'Legal defense against arbitrary evictions, boundary disputes, communal title clashes, and institutional alternative dispute resolution (ADR) mechanisms.',
        imageUrl: '/images/subcategories/crop-share-lease.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      }
    ]
  },
  {
    id: 'capital',
    title: '1. Financial Exclusion & Access to Capital',
    desc: 'Accelerating rural liquidity, credit access, and structured agricultural financing.',
    longDesc: 'Bridging the agricultural financing divide by architecting structured capital pathways. We coordinate blended finance mechanisms including grassroots microcredit, statutory compliance optimization, cross-border remittances, instant digital payment rails, risk management, asset leasing, supplier financing, and institutional capital markets.',
    imageUrl: '/images/challenges/capital.webp',
    stats: { activeSolutions: 18, capitalDeployed: '$14.2M', communitySize: '3,100+' },
    subcategories: [
      // GROUP 1: Basic Liquidity & Savings
      {
        id: 'savings-asset-building',
        title: 'Savings & Asset Building',
        groupName: 'Basic Liquidity & Savings',
        desc: 'Personal wealth accumulation, rural savings mobilization, and tangible asset-building strategies shielding farm households from seasonal shocks.',
        imageUrl: '/images/subcategories/savings.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 2: Inclusive Debt & Microcredit
      {
        id: 'credit-loans',
        title: 'Credit & Loans',
        groupName: 'Inclusive Debt & Microcredit',
        desc: 'Inclusive credit channels spanning informal rotating clubs (Esusu, Ajo, Susu), member-owned vehicles (Chamas, VSLA, SACCOs, Cooperatives), microfinance banks, and instant digital microloans.',
        imageUrl: '/images/subcategories/cooperatives.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 3: Policy, Levies & Compliance
      {
        id: 'tax-levies-compliance',
        title: 'Tax & Levies Compliance',
        groupName: 'Policy, Levies & Compliance',
        desc: 'Navigating multiple taxation, informal transit levies, market dues, traditional authority tolls, regulatory fees, compliance burdens, and statutory agricultural tax incentives.',
        imageUrl: '/images/subcategories/advisory.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 4: Cross-Border & Direct Liquidity
      {
        id: 'remittances-transfers',
        title: 'Remittances Services & Cash Transfers',
        groupName: 'Cross-Border & Direct Liquidity',
        desc: 'Cross-border remittance corridors, diaspora capital inflows, direct humanitarian cash transfers, and mobile cash rails fueling rural economic activity.',
        imageUrl: '/images/subcategories/remittances.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 5: Payment Rails & Gateways
      {
        id: 'payments-digital-gateways',
        title: 'Payments & Instant Digital Gateways',
        groupName: 'Payment Rails & Gateways',
        desc: 'Real-time settlement rails, merchant payment gateways, USSD offline wallets, and interoperable digital POS infrastructure for agricultural commerce.',
        imageUrl: '/images/subcategories/payments.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 6: Risk Mitigation & Protection
      {
        id: 'insurance-risk-management',
        title: 'Insurance & Risk Management',
        groupName: 'Risk Mitigation & Protection',
        desc: 'Comprehensive agricultural insurance, parametric weather-index coverage, crop yield guarantees, livestock indemnity, and enterprise risk management protocols.',
        imageUrl: '/images/subcategories/insurance.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 7: Long-Term Wealth Preservation
      {
        id: 'pension-products',
        title: 'Safe Third-Pillar Pension Products',
        groupName: 'Long-Term Wealth Preservation',
        desc: 'Voluntary micro-pensions, informal sector retirement savings, and dedicated long-term wealth preservation schemes tailored for smallholders and agri-traders.',
        imageUrl: '/images/subcategories/pensions.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 8: Asset & Equipment Financing
      {
        id: 'lease-to-own-financing',
        title: 'Lease-to-Own Asset Financing Models',
        groupName: 'Asset & Equipment Financing',
        desc: 'Flexible lease-to-own equipment contracts, pay-as-you-go (PAYG) asset financing, and milestone-based repayments for tractors, solar irrigation, and machinery.',
        imageUrl: '/images/subcategories/payg.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 9: Value Chain & Trade Financing
      {
        id: 'suppliers-offtakers-financing',
        title: 'Suppliers & Off-Takers Financing',
        groupName: 'Value Chain & Trade Financing',
        desc: 'Buyer-led trade credit, supplier invoice discounting, off-taker working capital advances, and input financing tied to guaranteed purchase contracts.',
        imageUrl: '/images/subcategories/inventory.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 10: Institutional & Equity Capital
      {
        id: 'capital-markets-investment',
        title: 'Capital Markets & Investment Funds',
        groupName: 'Institutional & Equity Capital',
        desc: 'Institutional capital mobilization through public equity, corporate bonds, private equity, private debt funds, venture capital, and commodity-linked financial instruments.',
        imageUrl: '/images/subcategories/advisory.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      }
    ]
  },
  {
    id: 'inputs',
    title: '3. Reduced Yields from Under-Used Agro Inputs & Feed',
    desc: 'Closing yield gaps through certified seeds, soil-specific fertilizers, crop protection, and mechanization.',
    longDesc: 'Closing Africa\'s crop and livestock yield gaps by accelerating access to certified high-yielding seeds, soil-specific fertilizers, targeted crop protection, optimized animal feed, and scaled tractor mechanization to multiply baseline farmgate productivity.',
    imageUrl: '/images/challenges/inputs.webp',
    stats: { activeSolutions: 15, capitalDeployed: '$5.0M', communitySize: '1,200+' },
    subcategories: [
      // GROUP 1: Seeds & Genetic Potential
      {
        id: 'improved-crop-breeding',
        title: 'Improved Crop Breeding',
        groupName: 'Seeds & Genetic Potential',
        desc: 'Advanced plant genetics, hybrid seed varieties, and biofortified cultivars bred for high harvest index and regional pest tolerance.',
        imageUrl: '/images/subcategories/improved-crop-breeding.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'drought-resistant-seeds',
        title: 'Drought-Resistant Seeds',
        groupName: 'Seeds & Genetic Potential',
        desc: 'Early-maturing, heat-tolerant, and water-efficient seed varieties designed to withstand rainfall volatility and climate shifts.',
        imageUrl: '/images/subcategories/drought-resistant-seeds.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 2: Soil Health & Crop Nutrition
      {
        id: 'fertilizers',
        title: 'Fertilizers & Soil Nutrients',
        groupName: 'Soil Health & Crop Nutrition',
        desc: 'Blended inorganic NPK formulations, liquid foliar feeds, micro-dosing techniques, and organic composts restoring depleted soil micro-nutrients.',
        imageUrl: '/images/subcategories/fertilizers.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 3: Crop Protection & Biosecurity
      {
        id: 'pesticides',
        title: 'Pesticides & Integrated Pest Management',
        groupName: 'Crop Protection & Biosecurity',
        desc: 'Broad-spectrum crop protectants, bio-pesticides, and IPM protocols suppressing devastating farmgate pest infestations safely.',
        imageUrl: '/images/subcategories/pesticides.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'herbicides',
        title: 'Herbicides & Weed Control',
        groupName: 'Crop Protection & Biosecurity',
        desc: 'Pre-emergence and post-emergence selective herbicides minimizing labor-intensive hand weeding and protecting vegetative canopy growth.',
        imageUrl: '/images/subcategories/herbicides.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'fungicides',
        title: 'Fungicides & Disease Control',
        groupName: 'Crop Protection & Biosecurity',
        desc: 'Systemic and contact fungicidal treatments safeguarding crops against blights, rusts, downy mildew, and soil-borne fungal pathogens.',
        imageUrl: '/images/subcategories/fungicides.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'insecticides',
        title: 'Insecticides & Vector Suppression',
        groupName: 'Crop Protection & Biosecurity',
        desc: 'Targeted insecticide formulations combating armyworms, stem borers, bollworms, whiteflies, and destructive locust swarms.',
        imageUrl: '/images/subcategories/insecticides.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 4: Livestock & Aquaculture Nutrition
      {
        id: 'animal-feed',
        title: 'Animal Feed & Nutritional Supplements',
        groupName: 'Livestock & Aquaculture Nutrition',
        desc: 'High-protein livestock feeds, commercial poultry mashes, extruded floating aquafeed, and mineral premixes maximizing feed conversion ratios.',
        imageUrl: '/images/subcategories/animal-feed.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 5: Farm Power & Mechanization
      {
        id: 'mechanized-farm-equipment',
        title: 'Mechanized Farm Equipment',
        groupName: 'Farm Power & Mechanization',
        desc: 'Two-wheel and four-wheel tractors, rotary tillers, automated seeders, boom sprayers, and combine harvesters scaling commercial acreage per operator.',
        imageUrl: '/images/subcategories/mechanized-farm-equipment.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'draught-animal-power',
        title: 'Draught-Animal Power & Traction',
        groupName: 'Farm Power & Mechanization',
        desc: 'Work oxen, draught animal harnesses, animal-drawn plows, and carts providing low-cost tillage and haulage for smallholder plots.',
        imageUrl: '/images/subcategories/draught-animal-power.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      }
    ]
  },
  {
    id: 'energy',
    title: '4. Energy Poverty',
    desc: 'Eliminating energy poverty across agro-processing, cold chains, and mechanized farming.',
    longDesc: 'Eliminating agricultural energy deficits by deploying decentralized solar, clean cooking fuels, cold-chain refrigeration, mini-grid agro-processing, solar irrigation, and sustainable logistics power to ensure continuous food preservation and value addition.',
    imageUrl: '/images/challenges/energy.webp',
    stats: { activeSolutions: 18, capitalDeployed: '$7.4M', communitySize: '1,500+' },
    subcategories: [
      // GROUP 1: Domestic & Base Energy
      {
        id: 'lighting-poverty',
        title: 'Lighting Poverty',
        groupName: 'Domestic & Base Energy',
        desc: 'Decentralized solar home systems, solar lanterns, and farmstead micro-lighting replacing hazardous kerosene in rural farming settlements.',
        imageUrl: '/images/subcategories/lighting.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 2: Thermal & Clean Cooking Energy
      {
        id: 'cooking-fuel-poverty',
        title: 'Cooking Fuel Poverty',
        groupName: 'Thermal & Clean Cooking Energy',
        desc: 'Clean biomass briquettes, biogas digesters, ethanol stoves, and LPG adoption eliminating reliance on unsustainable firewood and charcoal.',
        imageUrl: '/images/subcategories/cooking-fuel.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'heating-fuel-poverty',
        title: 'Heating Fuel Poverty',
        groupName: 'Thermal & Clean Cooking Energy',
        desc: 'Energy-efficient thermal solutions, biomass heaters, and solar thermal collectors for poultry brooding, livestock rearing, and greenhouse climate control.',
        imageUrl: '/images/subcategories/heating-fuel.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 3: Cold-Chain & Storage Power
      {
        id: 'storage-refrigeration-energy',
        title: 'Storage & Refrigeration Energy Poverty',
        groupName: 'Cold-Chain & Storage Power',
        desc: 'Off-grid solar cold rooms, evaporative cooling chambers, and thermal-battery refrigeration preventing perishable produce spoilage at aggregation hubs.',
        imageUrl: '/images/subcategories/storage-refrigeration.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 4: Agro-Industrial & Mechanical Power
      {
        id: 'processing-manufacturing-energy',
        title: 'Processing & Manufacturing Energy Poverty',
        groupName: 'Agro-Industrial & Mechanical Power',
        desc: 'Renewable mini-grids, three-phase agro-industrial power, biomass steam boilers, and electric grain milling reducing diesel reliance.',
        imageUrl: '/images/subcategories/processing-manufacturing.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 5: Water & Irrigation Power
      {
        id: 'water-supply-irrigation-energy',
        title: 'Water-Supply & Irrigation Energy Poverty',
        groupName: 'Water & Irrigation Power',
        desc: 'Solar-powered submersible pumps, pressurized drip irrigation systems, and surface water pumping eliminating expensive petrol generators.',
        imageUrl: '/images/subcategories/water-supply-irrigation.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 6: Agri-Logistics & Mobility
      {
        id: 'transportation-energy-poverty',
        title: 'Transportation Energy Poverty',
        groupName: 'Agri-Logistics & Mobility',
        desc: 'Electric cargo tricycles, retrofitted EV farm trucks, bio-CNG conversion, and fuel-efficient haulage fleets cutting farmgate transport costs.',
        imageUrl: '/images/subcategories/transportation.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 7: Field Power & Mechanization
      {
        id: 'harvesting-energy-poverty',
        title: 'Harvesting Energy Poverty',
        groupName: 'Field Power & Mechanization',
        desc: 'Mechanical reapers, portable electric threshers, battery-powered crop cutters, and combine harvesters eliminating manual harvesting bottlenecks.',
        imageUrl: '/images/subcategories/harvesting.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 8: Digital Infrastructure Power
      {
        id: 'ict-energy-poverty',
        title: 'ICT & Communication Energy Poverty',
        groupName: 'Digital Infrastructure Power',
        desc: 'Dedicated solar power supplies for rural telecom masts, smartphone charging hubs, IoT farm sensors, and digital marketplace terminals.',
        imageUrl: '/images/subcategories/ict.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 9: Energy Efficiency & Grid Systems
      {
        id: 'energy-inefficiency',
        title: 'Energy-Inefficiency & Systemic Losses',
        groupName: 'Energy Efficiency & Grid Systems',
        desc: 'Energy audit protocols, variable frequency drives (VFDs), power factor correction, and waste-heat recovery systems optimizing industrial processing efficiency.',
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
