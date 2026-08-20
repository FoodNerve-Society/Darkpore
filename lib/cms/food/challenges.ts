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
    desc: 'Closing yield gaps through certified seeds, soil nutrition, plant protection, livestock genetics, and mechanization.',
    longDesc: 'Overcoming yield gaps by streamlining access to certified planting materials, soil nutrition, plant protection, livestock genetics, veterinary health, irrigation water, machinery, and trusted extension advisory to multiply baseline farmgate productivity.',
    imageUrl: '/images/challenges/inputs.webp',
    stats: { activeSolutions: 15, capitalDeployed: '$5.0M', communitySize: '1,200+' },
    subcategories: [
      // GROUP 1: Plant Genetics & Seed Systems
      {
        id: 'getting-seeds',
        title: 'Getting Seeds (Breeding, Seeds & Planting Materials)',
        groupName: 'Plant Genetics & Seed Systems',
        desc: 'Sourcing certified hybrid seeds, drought-resilient cultivars, tissue-culture suckers, and quality stem cuttings.',
        imageUrl: '/images/subcategories/improved-crop-breeding.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 2: Soil Health & Crop Nutrition
      {
        id: 'feeding-the-soil',
        title: 'Feeding the Soil (Fertilizers & Soil Nutrition)',
        groupName: 'Soil Health & Crop Nutrition',
        desc: 'Soil testing, customized blended NPK formulations, liquid bio-fertilizers, agricultural lime, and organic composts.',
        imageUrl: '/images/subcategories/fertilizers.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 3: Crop Protection & Biosecurity
      {
        id: 'protecting-crops',
        title: 'Protecting Crops (Pesticides & Plant Health)',
        groupName: 'Crop Protection & Biosecurity',
        desc: 'Integrated pest management (IPM), biological controls, safe crop protectants, fungicides, and targeted weed control.',
        imageUrl: '/images/subcategories/pesticides.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 4: Livestock & Aquaculture Genetics
      {
        id: 'breeding-animals',
        title: 'Breeding Animals (Breeds, Chicks & Fingerlings)',
        groupName: 'Livestock & Aquaculture Genetics',
        desc: 'High-yield poultry day-old chicks (DOC), aquaculture fingerlings/juveniles, pedigree cattle/goats, and artificial insemination.',
        imageUrl: '/images/subcategories/drought-resistant-seeds.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 5: Livestock & Aquaculture Nutrition
      {
        id: 'feeding-animals',
        title: 'Feeding Animals (Animal Feed, Fodder & Nutrition)',
        groupName: 'Livestock & Aquaculture Nutrition',
        desc: 'High-protein commercial livestock feed, silage, hydroponic fodder, floating aquafeed pellets, and mineral supplements.',
        imageUrl: '/images/subcategories/animal-feed.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 6: Veterinary & Biosecurity
      {
        id: 'animal-health',
        title: 'Animal Health (Veterinary Medicines & Vaccines)',
        groupName: 'Veterinary & Biosecurity',
        desc: 'Preventative livestock vaccination protocols, veterinary pharmaceuticals, pest control dips, and herd disease surveillance.',
        imageUrl: '/images/subcategories/herbicides.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 7: Irrigation & Water Systems
      {
        id: 'getting-water',
        title: 'Getting Water (Irrigation & Production Water)',
        groupName: 'Irrigation & Water Systems',
        desc: 'Agricultural borehole drilling, solar-powered drip irrigation kits, center pivots, water harvesting, and canal drainage.',
        imageUrl: '/images/subcategories/fungicides.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 8: Farm Power & Mechanization
      {
        id: 'machines-equipment',
        title: 'Machines (Machinery, Tools & Draught Power)',
        groupName: 'Farm Power & Mechanization',
        desc: 'Two-wheel and four-wheel tractors, motorized tillers, combine harvesters, artisanal hand tools, and animal traction.',
        imageUrl: '/images/subcategories/mechanized-farm-equipment.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 9: Agronomic Advisory & Extension
      {
        id: 'dear-foodnerve',
        title: 'Dear FoodNerve (Extension & Technical Advisory)',
        groupName: 'Agronomic Advisory & Extension',
        desc: 'On-demand agronomic advisory, field diagnostics, pest outbreak alerts, soil-crop matching guides, and producer support.',
        imageUrl: '/images/subcategories/draught-animal-power.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 10: Quality Assurance & Input Markets
      {
        id: 'finding-inputs',
        title: 'Finding Inputs (Supply, Quality & Regulation)',
        groupName: 'Quality Assurance & Input Markets',
        desc: 'Certified input dealer networks, anti-counterfeit seed/fertilizer verification, regulatory standards, and last-mile agro-dealers.',
        imageUrl: '/images/subcategories/insecticides.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      }
    ]
  },
  {
    id: 'energy',
    title: '4. Energy Poverty',
    desc: 'Eradicating energy poverty across agricultural generation, fuels, storage, and distribution.',
    longDesc: 'Eradicating agricultural power deficits through utility grid expansion, solar mini-grids, captive on-site power, clean gas supply, solid biomass, battery storage, distribution networks, reliability assurance, and cost reduction across Africa.',
    imageUrl: '/images/challenges/energy.webp',
    stats: { activeSolutions: 18, capitalDeployed: '$7.4M', communitySize: '1,500+' },
    subcategories: [
      // GROUP 1: Utility & Grid Interconnection
      {
        id: 'grid-power-access',
        title: 'Grid Power (Centralized Electricity Access & Connections)',
        groupName: 'Utility & Grid Interconnection',
        desc: 'Securing national grid connections, industrial tariff classifications, dedicated feeders, and high-voltage transformer drops for processing mills.',
        imageUrl: '/images/subcategories/lighting.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 2: Decentralized Community Power
      {
        id: 'mini-grids-community',
        title: 'Mini-Grids (Local & Community Electricity Systems)',
        groupName: 'Decentralized Community Power',
        desc: 'Solar-hybrid, hydro, and biomass mini-grids powering agricultural clusters, irrigation cooperatives, and rural cottage industries.',
        imageUrl: '/images/subcategories/processing-manufacturing.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 3: Captive & Standalone Generation
      {
        id: 'onsite-power-generation',
        title: 'On-Site Power (Standalone & Self-Generation Systems)',
        groupName: 'Captive & Standalone Generation',
        desc: 'Captive rooftop/ground solar PV arrays, wind generation, biomass gasifiers, and standalone industrial generators.',
        imageUrl: '/images/subcategories/water-supply-irrigation.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 4: Liquid Hydrocarbons & Biofuels
      {
        id: 'liquid-fuels-petrol-diesel',
        title: 'Petrol & Diesel (Liquid Fuels, Kerosene & Biofuels)',
        groupName: 'Liquid Hydrocarbons & Biofuels',
        desc: 'Bulk farmgate diesel procurement, petrol supply for smallholder equipment, kerosene, ethanol, and biodiesel blending.',
        imageUrl: '/images/subcategories/transportation.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 5: Gaseous Fuels & Clean Thermal
      {
        id: 'gas-supply-biogas',
        title: 'Gas Supply (LPG, Natural Gas & Biogas)',
        groupName: 'Gaseous Fuels & Clean Thermal',
        desc: 'Commercial LPG cylinder distribution, piped natural gas (PNG), compressed natural gas (CNG), and farmstead anaerobic biogas digesters.',
        imageUrl: '/images/subcategories/cooking-fuel.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 6: Solid Fuels & Biomass Energy
      {
        id: 'firewood-solid-fuels',
        title: 'Firewood & Solid Fuels (Charcoal & Crop Residues)',
        groupName: 'Solid Fuels & Biomass Energy',
        desc: 'Sustainable charcoal briquettes, crop residue pelletization, palm kernel shell boilers, and fuel-wood alternatives for commercial agro-heating.',
        imageUrl: '/images/subcategories/heating-fuel.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 7: Energy Storage & Backup Systems
      {
        id: 'batteries-energy-storage',
        title: 'Batteries & Backup (Energy Storage & Emergency Power)',
        groupName: 'Energy Storage & Backup Systems',
        desc: 'Industrial Lithium Iron Phosphate (LiFePO4) battery packs, thermal energy storage, solar inverters, and automated emergency backup systems.',
        imageUrl: '/images/subcategories/storage-refrigeration.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 8: Transmission & Delivery Rails
      {
        id: 'energy-distribution-infra',
        title: 'Energy Distribution (Transmission & Last-Mile Delivery)',
        groupName: 'Transmission & Delivery Rails',
        desc: 'Last-mile distribution poles, three-phase transformers, underground cabling, and energy-as-a-service rural delivery infrastructure.',
        imageUrl: '/images/subcategories/harvesting.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 9: Grid Quality & Power Reliability
      {
        id: 'reliable-energy-quality',
        title: 'Reliable Energy (Continuity, Quality & Capacity)',
        groupName: 'Grid Quality & Power Reliability',
        desc: 'Voltage stabilization, harmonic filtering, industrial surge protection, uninterrupted uptime, and peak capacity management.',
        imageUrl: '/images/subcategories/ict.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 10: Tariffs, Economics & Affordability
      {
        id: 'energy-costs-tariffs',
        title: 'Energy Costs (Tariffs, Fuel Prices & Operating Costs)',
        groupName: 'Tariffs, Economics & Affordability',
        desc: 'Mitigating high DisCo band tariffs, off-grid power levelized cost of energy (LCOE) optimization, connection subsidies, and fuel hedging.',
        imageUrl: '/images/subcategories/energy-inefficiency.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      }
    ]
  },
  {
    id: 'insecurity',
    title: '5. Insecurity & Deliberate Human Threats',
    desc: 'Mitigating physical violence, insurgencies, resource conflicts, asset theft, and cyber disruptions.',
    longDesc: 'Neutralizing physical, environmental, and digital threats to African food systems—including insurgencies, banditry, resource conflicts, asset theft, maritime piracy, pollution, and cyber disruption to guarantee uninterrupted agricultural production and trade.',
    imageUrl: '/images/challenges/insecurity.webp',
    stats: { activeSolutions: 8, capitalDeployed: '$2.1M', communitySize: '950+' },
    subcategories: [
      // GROUP 1: Violent Extremism & Insurgency
      {
        id: 'jihadism-insurgency',
        title: 'Jihadism (Jihadist Insurgency, Territorial Control & Extremist Governance)',
        groupName: 'Violent Extremism & Insurgency',
        desc: 'Countering extremist territorial control, agrarian taxation extortion, forced conscription, and insurgent blockades of fertile river basins.',
        imageUrl: '/images/subcategories/terrorism.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      {
        id: 'terrorism-attacks',
        title: 'Terrorism (Terrorist Attacks & Violent Extremism)',
        groupName: 'Violent Extremism & Insurgency',
        desc: 'Protecting open-air commodity markets, grain silos, and transport hubs against explosive attacks, suicide bombings, and asymmetrical violence.',
        imageUrl: '/images/subcategories/armed-banditry.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 2: State Instability & Warfare
      {
        id: 'war-armed-conflict',
        title: 'War (Interstate War, Civil War, Rebellion & Separatist Conflict)',
        groupName: 'State Instability & Warfare',
        desc: 'Mitigating supply chain breakdown, civilian displacement, and scorched-earth devastation caused by civil war and violent separatist conflicts.',
        imageUrl: '/images/subcategories/secessionist-agitations.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 3: Organized Crime & Banditry
      {
        id: 'banditry-organised-crime',
        title: 'Banditry & Organised Crime (Armed Raids, Trafficking & Smuggling)',
        groupName: 'Organized Crime & Banditry',
        desc: 'Combating rural armed militias, transnational smuggling routes, arms trafficking, and violent raids on isolated farming settlements.',
        imageUrl: '/images/subcategories/armed-banditry.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 4: Agro-Ecological Resource Clashes
      {
        id: 'resource-conflicts',
        title: 'Resource Conflicts (Farmer-Herder Land, Water & Grazing Disputes)',
        groupName: 'Agro-Ecological Resource Clashes',
        desc: 'Resolving violent clashes over transhumance stock routes, dry-season grazing reserves, river basin water rights, and arable crop encroachment.',
        imageUrl: '/images/subcategories/farmers-herder-conflict.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 5: Criminal Coercion & Extortion
      {
        id: 'kidnapping-extortion',
        title: 'Kidnapping & Extortion (Abduction, Ransom & Protection Payments)',
        groupName: 'Criminal Coercion & Extortion',
        desc: 'Neutralizing commercial kidnapping rings targeting commercial farm managers, haulage drivers, and illegal protection levies demanded at harvest.',
        imageUrl: '/images/subcategories/commercial-kidnapping.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 6: Asset Protection & Rural Theft
      {
        id: 'theft-asset-looting',
        title: 'Theft (Cattle Rustling & Theft of Crops, Equipment & Assets)',
        groupName: 'Asset Protection & Rural Theft',
        desc: 'Stopping organized cattle rustling raids, night-time farm produce harvesting theft, solar pump vandalization, and in-transit cargo hijacking.',
        imageUrl: '/images/subcategories/cattle-rustling.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 7: Maritime & Coastal Security
      {
        id: 'piracy-maritime-threats',
        title: 'Piracy (Piracy, Armed Robbery at Sea & Fishing Threats)',
        groupName: 'Maritime & Coastal Security',
        desc: 'Safeguarding commercial trawlers, artisanal canoe fleets, and coastal food trade vessels from armed pirates in territorial and international waters.',
        imageUrl: '/images/subcategories/piracy.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 8: Environmental Destruction & Pollution
      {
        id: 'pipeline-vandalism-pollution',
        title: 'Oil Pipeline Vandalism (Oil Spills, Farmland Pollution & Contamination)',
        groupName: 'Environmental Destruction & Pollution',
        desc: 'Remediation and legal defense against crude oil spills, illegal bunkering fires, poisoned aquaculture ponds, and heavy metal agricultural pollution.',
        imageUrl: '/images/subcategories/oil-pipeline-vandalism.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 9: Cyber & Supply Chain Defense
      {
        id: 'cyberattacks-digital-threats',
        title: 'Cyberattacks (Cyber Insecurity, Ransomware, Digital Fraud & Disruption)',
        groupName: 'Cyber & Supply Chain Defense',
        desc: 'Securing digital grain warehouse receipts, cold storage IoT telemetry, commodity trading platforms, and agricultural fintech settlement rails.',
        imageUrl: '/images/subcategories/ritual-killings.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      }
    ]
  },
  {
    id: 'harvest-to-market',
    title: '6. Post-Harvest Systems & Market Access',
    desc: 'Halting food loss through modern storage, cold chains, processing, packaging, and structured off-take markets.',
    longDesc: 'Transforming African farmgate produce into shelf-stable, high-value commercial goods through modern harvesting, hermetic storage, cold-chain refrigeration, industrial processing, quality packaging, food safety certification, streamlined aggregation, and structured off-take markets.',
    imageUrl: '/images/challenges/loss.webp',
    stats: { activeSolutions: 22, capitalDeployed: '$11.2M', communitySize: '3,100+' },
    subcategories: [
      // GROUP 1: First-Mile Harvest Operations
      {
        id: 'harvesting-handling',
        title: 'Harvesting & Handling (Timing, Sorting & First-Mile)',
        groupName: 'First-Mile Harvest Operations',
        desc: 'Optimal harvest maturity indexing, gentle field collection, automated optical sorting, field de-stoning, and standardized plastic crate handling.',
        imageUrl: '/images/subcategories/tomato.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 2: Preservation & Shelf-Life Extension
      {
        id: 'preservation-methods',
        title: 'Preservation (Drying, Curing, Smoking & Fermentation)',
        groupName: 'Preservation & Shelf-Life Extension',
        desc: 'Commercial solar hybrid dryers, fish smoking kilns, root crop curing chambers, and controlled microbial fermentation technologies.',
        imageUrl: '/images/subcategories/pepper.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 3: Dry Storage & Inventory Systems
      {
        id: 'storage-warehousing',
        title: 'Storage (Warehouses, Silos & Hermetic Systems)',
        groupName: 'Dry Storage & Inventory Systems',
        desc: 'Hermetic Purdue Improved Crop Storage (PICS) bags, galvanized grain silos, pest-proof warehouses, and collateral management systems.',
        imageUrl: '/images/subcategories/maize.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 4: Cold-Chain & Fresh Preservation
      {
        id: 'cold-chain-refrigeration',
        title: 'Cold Chain (Refrigeration & Temperature Control)',
        groupName: 'Cold-Chain & Fresh Preservation',
        desc: 'Evaporative cooling chambers, off-grid solar cold hubs, commercial blast freezers, and temperature-monitored refrigerated transport fleets.',
        imageUrl: '/images/subcategories/potato.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 5: Industrial Value Addition
      {
        id: 'processing-value-addition',
        title: 'Processing (Primary Transformation & Manufacturing)',
        groupName: 'Industrial Value Addition',
        desc: 'Grain milling, cassava starch/flour processing, fruit juicing/pulping lines, oilseed pressing, and culinary food manufacturing plants.',
        imageUrl: '/images/subcategories/cassava.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 6: Packaging & Presentation
      {
        id: 'packaging-presentation',
        title: 'Packaging (Materials, Labelling & Protection)',
        groupName: 'Packaging & Presentation',
        desc: 'Multi-layer barrier pouches, vacuum packaging, corrugated produce cartons, automated sealing lines, and retail branding/labeling.',
        imageUrl: '/images/subcategories/rice.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 7: Quality Assurance & Certification
      {
        id: 'food-safety-standards',
        title: 'Food Safety & Standards (QA, Testing & Traceability)',
        groupName: 'Quality Assurance & Certification',
        desc: 'Rapid mycotoxin/aflatoxin test strips, pesticide residue screening, NAFDAC/SON certification, and GS1 digital QR code traceability.',
        imageUrl: '/images/subcategories/beans.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 8: Agri-Logistics & Freight
      {
        id: 'aggregation-logistics',
        title: 'Aggregation & Logistics (Bulking & Last-Mile Delivery)',
        groupName: 'Agri-Logistics & Freight',
        desc: 'Rural aggregation hubs, freight consolidation networks, return-trip backhaul matching, and temperature-monitored urban last-mile distribution.',
        imageUrl: '/images/subcategories/yam.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 9: Market Access & Off-Take
      {
        id: 'market-access-trade',
        title: 'Market Access (Buyers, Price Discovery & Contracts)',
        groupName: 'Market Access & Off-Take',
        desc: 'Real-time commodity spot price discovery, formal off-take purchase contracts, supermarket supply programs, and cross-border AfCFTA trade.',
        imageUrl: '/images/subcategories/sorghum.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 10: Circular Food Systems & Recovery
      {
        id: 'food-recovery-circular',
        title: 'Food Recovery (Surplus Redistribution & Recycling)',
        groupName: 'Circular Food Systems & Recovery',
        desc: 'Surplus crop redistribution to food rescue networks, spent grain livestock feed valorization, fruit peel bio-extracts, and insect protein upcycling.',
        imageUrl: '/images/subcategories/mango.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      }
    ]
  },
  {
    id: 'people',
    title: '7. People & Human Capital',
    desc: 'Empowering the workforce, talent, leadership, and enterprises powering the African food system.',
    longDesc: 'Powering the African food economy by nurturing human potential—through academy training, continuous upskilling, apprenticeships, talent recruitment, executive leadership, ethical management, enterprise succession, family renewal, and decent work standards.',
    imageUrl: '/images/challenges/protein.webp',
    stats: { activeSolutions: 42, capitalDeployed: '$15.8M', communitySize: '4,500+' },
    subcategories: [
      // GROUP 1: Education & Entry Pathways
      {
        id: 'careers-academy',
        title: 'Careers (FoodNerve Academy & Entry Pathways)',
        groupName: 'Education & Entry Pathways',
        desc: 'Foundational courses, curriculum certification, career orientation, and structured entry pathways into modern agriculture.',
        imageUrl: '/images/subcategories/chicken-and-eggs.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 2: Skills & Emerging Capabilities
      {
        id: 'future-skills-upskilling',
        title: 'Future Skills (Continuous Upskilling & Adaptation)',
        groupName: 'Skills & Emerging Capabilities',
        desc: 'Reskilling and upskilling programs in precision agronomy, drone operations, post-harvest engineering, and climate adaptation.',
        imageUrl: '/images/subcategories/beef.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 3: Experiential & Work-Based Learning
      {
        id: 'gaining-experience',
        title: 'Gaining Experience (Internships & Mentorship)',
        groupName: 'Experiential & Work-Based Learning',
        desc: 'Hands-on farm apprenticeships, academic internships, enterprise fellowships, and 1-on-1 industry mentorship programs.',
        imageUrl: '/images/subcategories/lamb-and-ram.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 4: Job Placement & Careers
      {
        id: 'getting-hired-jobs',
        title: 'Getting Hired (Jobs, Placements & Pathways)',
        groupName: 'Job Placement & Careers',
        desc: 'Verified candidate job applications, practical skills assessments, interview preparation, and direct employment placements.',
        imageUrl: '/images/subcategories/pork.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 5: Employer Recruitment & Sourcing
      {
        id: 'hiring-talent-workforce',
        title: 'Hiring Talent (Recruitment & Workforce Planning)',
        groupName: 'Employer Recruitment & Sourcing',
        desc: 'Employer job broadcasting, AI-driven candidate matching, seasonal workforce planning, and labor regulation compliance.',
        imageUrl: '/images/subcategories/dairy.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 6: Executive Search & Governance
      {
        id: 'hiring-leaders-executives',
        title: 'Hiring Leaders (Executive Search & Board Appointments)',
        groupName: 'Executive Search & Governance',
        desc: 'C-suite agricultural headhunting, farm general manager searches, technical director vetting, and board appointments.',
        imageUrl: '/images/subcategories/fish.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 7: People Management & Leadership
      {
        id: 'growing-managing-people',
        title: 'Growing & Managing People (Culture, Coaching & Retention)',
        groupName: 'People Management & Leadership',
        desc: 'Building high-performance workplace cultures, frontline manager coaching, career mobility paths, and talent retention.',
        imageUrl: '/images/subcategories/shellfish.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 8: Enterprise Building & Succession
      {
        id: 'building-enterprises-legacies',
        title: 'Building Enterprises & Legacies (Entrepreneurship & Succession)',
        groupName: 'Enterprise Building & Succession',
        desc: 'Agri-entrepreneurship acceleration, family business governance frameworks, equity alliances, and multi-generational succession.',
        imageUrl: '/images/subcategories/cephalopods.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 9: Family & Social Wellbeing
      {
        id: 'love-family-renewal',
        title: 'Love & Family (Belonging & Intergenerational Renewal)',
        groupName: 'Family & Social Wellbeing',
        desc: 'Supporting rural family formation, work-life balance for agrarian households, social cohesion, and generational youth renewal.',
        imageUrl: '/images/subcategories/beans-and-lentils.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      },
      // GROUP 10: Labor Standards & Worker Dignity
      {
        id: 'decent-work-labor-rights',
        title: 'Decent Work (Fair Wages, Safety & Labor Rights)',
        groupName: 'Labor Standards & Worker Dignity',
        desc: 'Fair compensation benchmarks, farm safety protocols (PPE), formal written contracts, and inclusive labor protections.',
        imageUrl: '/images/subcategories/nuts-and-seeds.webp',
        updates: [], learningMaterials: [],
        sections: { innovations: {title:'Innovations',content:''}, library: {title:'Library',content:''}, community: {title:'Community',content:''}, activities: {title:'Activities',content:''}, livestreams: {title:'Livestreams',content:''}, jobs: {title:'Jobs',content:''} }
      }
    ]
  }
];
