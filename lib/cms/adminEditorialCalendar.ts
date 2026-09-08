/**
 * Admin Editorial Calendar Data Store
 * Internal pre-planned editorial schedules and strategic article angles for admin workflows.
 */

import { ArticleFormat, ArticleEra } from '@/lib/config/articleBlueprints';

export interface AdminCalendarArticle {
  id: string;
  month: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  commodity: string;
  categoryId: string;
  subcategoryId: string;
  subcategoryTitle: string;
  spectrumRank: string; // '#1', '#2', etc.
  spectrumRankName: string;
  format: ArticleFormat;
  era: ArticleEra;
  location: string;
  targetPersona: string;
  plannedTitle: string;
  synopsis: string;
  bottleneck: string;
  keyMetrics: string[];
  strategicPlaybook: string;
  politicalEconomyTakeaway: string;
}

export interface AdminEditorialMonthSchedule {
  month: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  commodity: string;
  theme: string;
  corridor: string;
  leadAnalyst: string;
  targetArticlesCount: number;
  articles: AdminCalendarArticle[];
}

/**
 * Master Admin Editorial Calendar Database (Pre-planned strategic pipeline)
 */
export const ADMIN_EDITORIAL_CALENDAR: AdminEditorialMonthSchedule[] = [
  // ─────────────────────────────────────────────────────────────
  // GINGER (Southern Kaduna & Export Corridors)
  // ─────────────────────────────────────────────────────────────
  {
    month: 'August',
    quarter: 'Q3',
    commodity: 'Ginger',
    theme: 'Wet Rhizome Evacuation & Post-Blight Quality Preservation',
    corridor: 'Kachia – Kafanchan – Abuja – Lagos Port Transit Axis',
    leadAnalyst: 'Systems Lead / Agro-Logistics Desk',
    targetArticlesCount: 6,
    articles: [
      {
        id: 'cal-ginger-01',
        month: 'August',
        quarter: 'Q3',
        commodity: 'Ginger',
        categoryId: 'logistics',
        subcategoryId: 'sub-logistics-cold-chain',
        subcategoryTitle: 'Transit Preservation & Evacuation Logistics',
        spectrumRank: '#1',
        spectrumRankName: 'The Bleeding Neck',
        format: 'brief',
        era: 'present',
        location: 'Kachia Aggregation Depot, Kaduna',
        targetPersona: 'Truck Fleet Operators & Evacuation Aggregators',
        plannedTitle: 'The Kaduna Ginger Splice: Evacuating Wet Rhizomes Ahead of Southbound Haulage Surges',
        synopsis: 'Heavy rainfall across Southern Kaduna elevates moisture content above 82%, triggering bacterial soft rot within 48 hours of harvest if transit is delayed.',
        bottleneck: 'Inadequate regional solar curing pads and diesel haulage rate spikes on the Kachia-Abuja transit axis.',
        keyMetrics: [
          '82% raw moisture level at harvest',
          '38% post-harvest loss on delayed flatbeds',
          '₦1.35M per 30-tonne haulage truck to Apapa port'
        ],
        strategicPlaybook: 'Deploy localized solar-tunnel dry shelters at Kachia yards and implement mandatory 48-hour transit pre-cooling protocol.',
        politicalEconomyTakeaway: 'State-level transit checkpoints must grant priority green-lane clearance for perishable rhizome freights.'
      },
      {
        id: 'cal-ginger-02',
        month: 'August',
        quarter: 'Q3',
        commodity: 'Ginger',
        categoryId: 'capital',
        subcategoryId: 'sub-capital-receipts',
        subcategoryTitle: 'Structured Export Escrow & Trade Finance',
        spectrumRank: '#2',
        spectrumRankName: 'Institutional Pivot',
        format: 'memo',
        era: 'present',
        location: 'Lagos Financial District & Port Harcourt Port',
        targetPersona: 'Commercial Trade Finance Desks & Export Allocators',
        plannedTitle: 'The Oleoresin Arbitrage: Collateralizing Cured Split Ginger for European Off-Take Escrow',
        synopsis: 'Tier-1 commodity desks are shifting from unstandardized raw ginger exports to certified oleoresin processing contracts with guaranteed Euro off-take.',
        bottleneck: 'Lack of accredited testing laboratories in Northern corridors leaves exporters vulnerable to European MRL rejection.',
        keyMetrics: [
          '$4,200/MT international spot price for grade-A dried split',
          '18% export financing rate via NEXIM/commercial facilities',
          '99.2% assay acceptance threshold for European pharmaceutical buyers'
        ],
        strategicPlaybook: 'Structure tripartite escrow accounts tied to accredited pre-shipment lab assays at the dry port terminal.',
        politicalEconomyTakeaway: 'Federal incentives should subsidize ISO/IEC 17025 testing facilities within 50km of prime farmgates.'
      },
      {
        id: 'cal-ginger-03',
        month: 'August',
        quarter: 'Q3',
        commodity: 'Ginger',
        categoryId: 'inputs',
        subcategoryId: 'sub-inputs-processing',
        subcategoryTitle: 'Decentralized Washing & Milling Equipment',
        spectrumRank: '#3',
        spectrumRankName: 'The Grassroots Hack',
        format: 'playbook',
        era: 'present',
        location: 'Kafanchan Secondary Market, Kaduna',
        targetPersona: 'Women Processor Cooperatives & Informal Sorters',
        plannedTitle: 'The Kafanchan Wash Protocol: Low-Cost Rotary Scrubbers Halving Drying Time for Smallholders',
        synopsis: 'Local washing groups adapt fabricated motorcycle-driven rotary drums to remove sticky clay soil from ginger fingers prior to sun-drying.',
        bottleneck: 'Manual knife peeling causes 12% crop loss and finger bruising that invites mold contamination.',
        keyMetrics: [
          '₦140,000 local fabrication cost per rotary drum',
          '5x faster root cleaning throughput compared to manual scrubbing',
          '2.5 days shaved off open-air solar drying cycles'
        ],
        strategicPlaybook: 'Distribute blueprint CADs for open-source rotary scrubbers to local blacksmiths in Kafanchan and Zonkwa.',
        politicalEconomyTakeaway: 'Micro-grants targeting localized agro-fabrication yield higher ROI than imported complex combine equipment.'
      },
      {
        id: 'cal-ginger-04',
        month: 'August',
        quarter: 'Q3',
        commodity: 'Ginger',
        categoryId: 'land',
        subcategoryId: 'sub-land-biosecurity',
        subcategoryTitle: 'Soil Regeneration & Bacterial Wilt Quarantine',
        spectrumRank: '#4',
        spectrumRankName: 'The R&D Horizon',
        format: 'brief',
        era: 'future',
        location: 'National Root Crops Research Institute (NRCRI) Outstation',
        targetPersona: 'Agronomists & Commercial Seed Nursery Managers',
        plannedTitle: 'Blight-Resistant Micropropagation: Re-Seeding Southern Kaduna with Clean Tissue-Culture Plantlets',
        synopsis: 'Deploying disease-free tissue-cultured ginger plantlets to eliminate bacterial wilt and fungal pathogens that devastated prior harvests.',
        bottleneck: 'Informal seed rhizome sharing continually re-infects newly tilled parcels across adjoining local government areas.',
        keyMetrics: [
          '4.5x yield multiplier over diseased conventional seed roots',
          'Zero pathogen trace in lab tissue cultures',
          '₦85 unit cost per certified hardened nursery plantlet'
        ],
        strategicPlaybook: 'Establish rapid multiplication shade-houses in partnership with local universities and youth extension agents.',
        politicalEconomyTakeaway: 'Certified clean seed distribution must be ring-fenced against speculative hoarding by merchant cartels.'
      },
      {
        id: 'cal-ginger-05',
        month: 'August',
        quarter: 'Q3',
        commodity: 'Ginger',
        categoryId: 'policy',
        subcategoryId: 'sub-policy-interstate',
        subcategoryTitle: 'Interstate Haulage Levies & Non-Tariff Barriers',
        spectrumRank: '#5',
        spectrumRankName: 'The Macro Threat',
        format: 'memo',
        era: 'present',
        location: 'Niger – Kogi – Ondo – Lagos Haulage Belt',
        targetPersona: 'National Logistics Coordinators & Freight Forwarders',
        plannedTitle: 'The Toll of 18 Checkpoints: Why Interstate Informal Levies Cost More Than Diesel on Northern Freight',
        synopsis: 'Unregulated local government tolls and informal revenue collection points add up to 26% to total transport costs from Kaduna to export terminals.',
        bottleneck: 'Fragmented state tax enforcement and non-harmonized produce movement passes across border jurisdictions.',
        keyMetrics: [
          '18 to 24 arbitrary stops along the Kaduna-Lagos corridor',
          '₦280,000 in unreceipted cash payouts per single articulated lorry',
          '36 hours added to total transit turnaround time'
        ],
        strategicPlaybook: 'Implement digital single-window cargo transit QR passes backed by Federal Ministry of Transportation enforcement.',
        politicalEconomyTakeaway: 'Harmonizing interstate transit taxes directly protects Nigeria’s foreign exchange earnings in non-oil commodities.'
      },
      {
        id: 'cal-ginger-06',
        month: 'August',
        quarter: 'Q3',
        commodity: 'Ginger',
        categoryId: 'markets',
        subcategoryId: 'sub-markets-synthetics',
        subcategoryTitle: 'Synthetic Flavor Competitors & Market Disruption',
        spectrumRank: '#6',
        spectrumRankName: 'The Black Swan',
        format: 'comparison',
        era: 'future',
        location: 'Global Flavoring & Extract Trading Exchanges',
        targetPersona: 'Agro-Industrial Strategists & Long-term Allocators',
        plannedTitle: 'Fermentation Gingerol: The Looming Bio-Synthetic Threat to Natural African Spice Premiums',
        synopsis: 'European biotechnology labs scaling precision fermentation of synthetic gingerol molecules could undercut African field-grown spice margins by 2028.',
        bottleneck: 'Natural ginger commands a premium today, but lack of origin denomination branding leaves it vulnerable to synthetic parity.',
        keyMetrics: [
          '65% cheaper synthesis cost projected for lab gingerol by 2028',
          'Top 3 multinational food conglomerates investing in bio-flavor fermentation',
          'Nigeria controls 16% of global ginger volume but under 3% of processed extraction value'
        ],
        strategicPlaybook: 'Fast-track geographical indication (GI) certification for Nigerian "Kachia Ginger" emphasizing high natural pungent oleoresin content.',
        politicalEconomyTakeaway: 'Nigeria must transition from raw commodity supplier to certified functional food and pharmaceutical origin.'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // SOYBEANS, NUTS AND MEALS (Middle Belt / Poultry Feed Axis)
  // ─────────────────────────────────────────────────────────────
  {
    month: 'September',
    quarter: 'Q3',
    commodity: 'Soybeans, Nuts and Meals',
    theme: 'Poultry Feed Crisis & Oil Mill Crushing Capacities',
    corridor: 'Benue – Plateau – Kano – Ibadan Feed Belt',
    leadAnalyst: 'Grain Analytics & Animal Nutrition Specialist',
    targetArticlesCount: 6,
    articles: [
      {
        id: 'cal-soybeans-01',
        month: 'September',
        quarter: 'Q3',
        commodity: 'Soybeans, Nuts and Meals',
        categoryId: 'markets',
        subcategoryId: 'sub-markets-crushing',
        subcategoryTitle: 'Crusher Margin Crushes & Feed Mill Allocations',
        spectrumRank: '#1',
        spectrumRankName: 'The Bleeding Neck',
        format: 'brief',
        era: 'present',
        location: 'Ibadan Feed Mill Cluster & Kano Industrial Hub',
        targetPersona: 'Poultry Feed Formulators & Commercial Millers',
        plannedTitle: 'The 48% Protein Squeeze: Why Nigerian Feed Millers Are Paying 40% Above Global Parity for Soymeal',
        synopsis: 'Severe domestic soybean deficit forces commercial feed millers to compete aggressively for dry grain, pushing broiler starter mash prices to record highs.',
        bottleneck: 'Industrial crushing facilities operating at barely 35% installed capacity due to harvest hoarding and speculative middleman buying.',
        keyMetrics: [
          '₦850,000/MT spot price for solvent-extracted de-oiled soybean meal',
          '35% average operational utilization across major Nigerian crushing plants',
          '62% of total poultry production cost tied strictly to feed protein components'
        ],
        strategicPlaybook: 'Establish direct contractual outgrower linkages between major feed conglomerates and farmer cooperatives in Benue and Kaduna.',
        politicalEconomyTakeaway: 'Zero-tariff temporary import corridors must be calibrated to protect local poultry farmers without collapsing farmgate grain prices.'
      },
      {
        id: 'cal-soybeans-02',
        month: 'September',
        quarter: 'Q3',
        commodity: 'Soybeans, Nuts and Meals',
        categoryId: 'capital',
        subcategoryId: 'sub-capital-outgrower',
        subcategoryTitle: 'Blended Input Financing & Grain Buyback Deals',
        spectrumRank: '#2',
        spectrumRankName: 'Institutional Pivot',
        format: 'memo',
        era: 'present',
        location: 'Makurdi – Otukpo Corridor, Benue State',
        targetPersona: 'Agri-Fintech Lenders & Corporate Grain Aggregators',
        plannedTitle: 'The Closed-Loop Crush: How Industrial Oil Processors Are Underwriting Smallholder Input Bundles',
        synopsis: 'Major consumer goods and edible oil processors are replacing cash loans with certified seed and inoculant packages tied to binding harvest off-take.',
        bottleneck: 'Side-selling by farmers when open market spot prices spike above agreed seasonal forward contract benchmarks.',
        keyMetrics: [
          '92% recovery rate on closed-loop input voucher disbursements',
          '2.2 MT/ha average yield on inoculated plots vs 1.1 MT/ha on conventional fields',
          '₦450,000 per hectare total input bundle investment'
        ],
        strategicPlaybook: 'Implement dynamic indexed pricing mechanisms that share harvest spot upside with participating smallholders.',
        politicalEconomyTakeaway: 'Enforceable digital commodity trade contracts are the foundation of sustainable domestic agro-industrialization.'
      },
      {
        id: 'cal-soybeans-03',
        month: 'September',
        quarter: 'Q3',
        commodity: 'Soybeans, Nuts and Meals',
        categoryId: 'inputs',
        subcategoryId: 'sub-inputs-inoculants',
        subcategoryTitle: 'Biological Rhizobium Inoculants & Nitrogen Fixing',
        spectrumRank: '#3',
        spectrumRankName: 'The Grassroots Hack',
        format: 'playbook',
        era: 'present',
        location: 'Gboko Rural Farmsteads, Benue State',
        targetPersona: 'Agronomy Field Officers & Farmstead Leaders',
        plannedTitle: 'The Peat Slurry Method: How ₦3,000 Inoculant Sachets Replace ₦80,000 in Synthetic Urea',
        synopsis: 'Smallholder clusters are coating soybean seed with Rhizobium bio-fertilizer peat packets, eliminating the need for expensive nitrogen fertilizer.',
        bottleneck: 'Bio-inoculant bacteria are living organisms killed by exposure to ambient heat during open market transit and distribution.',
        keyMetrics: [
          '₦3,500 cost per 100g sachet sufficient for 1 hectare of seed',
          '35% reduction in total synthetic input expenditure',
          'Zero residual soil acidification compared to repeated chemical urea applications'
        ],
        strategicPlaybook: 'Build insulated cold-box distribution networks through existing rural agro-dealers and veterinary supply shops.',
        politicalEconomyTakeaway: 'Domestic bio-fertilizer manufacturing reduces national foreign exchange demand for imported petrochemical inputs.'
      },
      {
        id: 'cal-ginger-04-soy',
        month: 'September',
        quarter: 'Q3',
        commodity: 'Soybeans, Nuts and Meals',
        categoryId: 'land',
        subcategoryId: 'sub-land-intercropping',
        subcategoryTitle: 'Maize-Soybean Strip Farming & Soil Health',
        spectrumRank: '#4',
        spectrumRankName: 'The R&D Horizon',
        format: 'brief',
        era: 'future',
        location: 'IITA Savanna Agricultural Research Station',
        targetPersona: 'Regenerative Agriculture Leads & Extension Scientists',
        plannedTitle: 'Strip Cropping the Guinea Savanna: 4:2 Maize-Soybean Relays Maximizing Caloric & Protein Yields',
        synopsis: 'Precision relay intercropping models alternating 4 rows of early-maturing maize with 2 rows of nodulating soybean boost total land productivity.',
        bottleneck: 'Mechanical harvest equipment is typically designed for monoculture plantings and struggles with alternating row heights.',
        keyMetrics: [
          '1.38 Land Equivalent Ratio (LER) over single-crop monoculture',
          '28% reduction in Striga parasitic weed infestation',
          '45kg atmospheric nitrogen fixed naturally per hectare per season'
        ],
        strategicPlaybook: 'Standardize row geometry guidelines optimized for walking two-wheel tractors and custom multi-crop cutter bars.',
        politicalEconomyTakeaway: 'Intercropping is the key ecological defense against Savanna soil depletion and synthetic input cost spirals.'
      },
      {
        id: 'cal-soybeans-05',
        month: 'September',
        quarter: 'Q3',
        commodity: 'Soybeans, Nuts and Meals',
        categoryId: 'logistics',
        subcategoryId: 'sub-logistics-river',
        subcategoryTitle: 'River Niger Barging vs Road Freight Arbitrage',
        spectrumRank: '#5',
        spectrumRankName: 'The Macro Threat',
        format: 'memo',
        era: 'present',
        location: 'Lokoja River Port & Baro Transit Nexus',
        targetPersona: 'Bulk Grain Transporters & Port Logistics Planners',
        plannedTitle: 'The River Highway That Isn’t: Why Inland Waterway Grain Barging Remains Silted at Lokoja',
        synopsis: 'Barging grain down the River Niger to coastal mills should cost 60% less than road trucks, but silted navigation channels force cargo onto crumbling highways.',
        bottleneck: 'Seasonal sandbars, unlit navigation buoys, and stalled federal dredging contracts leave river barges stranded 8 months a year.',
        keyMetrics: [
          '₦45/tonne-kilometer road haulage cost vs estimated ₦18/tonne-kilometer river barge potential',
          '3,000 tonnes capacity on single river push-tug flotilla (equivalent to 100 articulated trucks)',
          '14 days average transit on broken road corridors from North-Central to South-West'
        ],
        strategicPlaybook: 'Deploy shallow-draft catamaran bulk barges engineered specifically for seasonal water levels between Baro and Onitsha.',
        politicalEconomyTakeaway: 'Revitalizing inland waterways is the single highest-impact infrastructure intervention to deflate national food prices.'
      },
      {
        id: 'cal-soybeans-06',
        month: 'September',
        quarter: 'Q3',
        commodity: 'Soybeans, Nuts and Meals',
        categoryId: 'markets',
        subcategoryId: 'sub-markets-bsf',
        subcategoryTitle: 'Black Soldier Fly Larvae & Alternative Feed Protein',
        spectrumRank: '#6',
        spectrumRankName: 'The Black Swan',
        format: 'comparison',
        era: 'future',
        location: 'Commercial Insect Bioconversion Plants, Ogun State',
        targetPersona: 'Agri-Tech Investors & Alternative Protein Founders',
        plannedTitle: 'The Insect Protein Disruptor: Can Black Soldier Fly Meal Break the Soybean Monopoly on Aquafeed?',
        synopsis: 'Automated insect bioconversion facilities feeding brewery waste to black soldier fly larvae are yielding 55% crude protein meal for aquaculture.',
        bottleneck: 'High capital expenditure for automated climate-controlled insect breeding chambers and regulatory hurdles for livestock feed certification.',
        keyMetrics: [
          '55% crude protein in dried BSF larvae vs 44-48% in commercial soybean meal',
          '0.8 hectares required to produce equivalent protein of 1,000 hectares of arable field soy',
          '40% lower greenhouse gas footprint compared to imported soymeal'
        ],
        strategicPlaybook: 'Partner insect bioconverters with urban beer and cassava processing plants to utilize organic effluent as zero-cost feedstock.',
        politicalEconomyTakeaway: 'Alternative biological proteins decouple national food security from global arable land and water availability constraints.'
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // MAIZE & FEED GRAINS (Kano – Kaduna – Plateau Corridors)
  // ─────────────────────────────────────────────────────────────
  {
    month: 'October',
    quarter: 'Q4',
    commodity: 'Maize & Feed Grains',
    theme: 'Harvest Gluts, Aflatoxin Decontamination & Strategic Grain Reserves',
    corridor: 'Kano – Zaria – Funtua – Jos Commercial Triangle',
    leadAnalyst: 'Grain Storage Systems & Silo Operations Lead',
    targetArticlesCount: 6,
    articles: [
      {
        id: 'cal-maize-01',
        month: 'October',
        quarter: 'Q4',
        commodity: 'Maize & Feed Grains',
        categoryId: 'inputs',
        subcategoryId: 'sub-inputs-drying',
        subcategoryTitle: 'Grain Drying & Aflatoxin Mitigation',
        spectrumRank: '#1',
        spectrumRankName: 'The Bleeding Neck',
        format: 'brief',
        era: 'present',
        location: 'Funtua Grain Market & Dawanau International Market, Kano',
        targetPersona: 'Grain Aggregators, Silo Operators & Brewery Buyers',
        plannedTitle: 'The 20-PPB Threshold: Why 40% of Northern Harvest Maize Fails Commercial Brewery Intake Assays',
        synopsis: 'Untimely late rains during October harvest elevate ear-rot fungus and aflatoxin contamination well beyond the strict 10-20 parts per billion industrial limit.',
        bottleneck: 'Farmers drying grain directly on damp tarmac or roadside soil without tarpaulins or moisture-testing probes.',
        keyMetrics: [
          '42% of tested open-market grain batches exceed 20 ppb aflatoxin threshold',
          '₦40,000/MT price discount applied by industrial off-takers on high-aflatoxin lots',
          '13% target moisture content required for safe hermetic silo storage'
        ],
        strategicPlaybook: 'Distribute low-cost handheld moisture meters to aggregator collection hubs and establish community clean-drying slabs.',
        politicalEconomyTakeaway: 'Food safety standards must be enforced upstream at rural markets to protect consumers from chronic mycotoxin exposure.'
      },
      {
        id: 'cal-maize-02',
        month: 'October',
        quarter: 'Q4',
        commodity: 'Maize & Feed Grains',
        categoryId: 'capital',
        subcategoryId: 'sub-capital-warehousing',
        subcategoryTitle: 'Electronic Warehouse Receipts & Grain Collateral',
        spectrumRank: '#2',
        spectrumRankName: 'Institutional Pivot',
        format: 'memo',
        era: 'present',
        location: 'AFEX / Commodities Exchange Silo Complex, Kaduna',
        targetPersona: 'Structured Commodity Financiers & Grain Traders',
        plannedTitle: 'The Harvest Glut Liquidity Trap: Unlocking Working Capital via Electronic Warehouse Receipts',
        synopsis: 'Instead of dumping wet grain at rock-bottom harvest spot prices, structured aggregators are placing dried grain into certified bonded silos.',
        bottleneck: 'High storage and fumigation fees per month deter cash-strapped smallholder farmers from holding grain past harvest.',
        keyMetrics: [
          '45% typical price appreciation of maize between October harvest and June lean season',
          '70% loan-to-value (LTV) liquidity unlocked within 48 hours of warehouse receipt generation',
          '₦1,200 monthly storage fee per 100kg jute bag'
        ],
        strategicPlaybook: 'Introduce fractional warehouse receipt trading so smallholders can liquidate 10-bag increments as needed for family expenses.',
        politicalEconomyTakeaway: 'Warehouse receipt ecosystems eliminate distress selling and dampen seasonal price volatility across urban centers.'
      },
      {
        id: 'cal-maize-03',
        month: 'October',
        quarter: 'Q4',
        commodity: 'Maize & Feed Grains',
        categoryId: 'logistics',
        subcategoryId: 'sub-logistics-hermetic',
        subcategoryTitle: 'Hermetic Storage Bags & Weevil Prevention',
        spectrumRank: '#3',
        spectrumRankName: 'The Grassroots Hack',
        format: 'playbook',
        era: 'present',
        location: 'Dutsin-Ma Rural Communities, Katsina State',
        targetPersona: 'Village Aggregators & Smallholder Households',
        plannedTitle: 'The Triple-Bag Air Seal: Storing Grain for 18 Months Without Harmful Chemical Phostoxin Tablets',
        synopsis: 'Adoption of triple-layer hermetic polyethylene storage bags suffocates weevils and insects naturally, preserving grain quality with zero chemical pesticides.',
        bottleneck: 'Proliferation of cheap counterfeit single-ply bags in village markets that puncture easily and fail to maintain airtight anaerobic conditions.',
        keyMetrics: [
          '₦1,800 unit price for authentic multi-layer hermetic bag',
          'Zero chemical residue on grain sold to human consumption markets',
          'Up to 24 months storage stability with zero weevil propagation'
        ],
        strategicPlaybook: 'Verify bag authenticity with tamper-evident QR scratch codes and educate local women cooperatives on tight zip-tying techniques.',
        politicalEconomyTakeaway: 'Chemical-free post-harvest storage safeguards rural health and eliminates pesticide poisoning incidents.'
      },
      {
        id: 'cal-maize-04',
        month: 'October',
        quarter: 'Q4',
        commodity: 'Maize & Feed Grains',
        categoryId: 'land',
        subcategoryId: 'sub-land-drought',
        subcategoryTitle: 'TELA Maize & Drought-Tolerant Hybrids',
        spectrumRank: '#4',
        spectrumRankName: 'The R&D Horizon',
        format: 'brief',
        era: 'future',
        location: 'Institute for Agricultural Research (IAR), Samaru, Zaria',
        targetPersona: 'Seed System Regulators & Commercial Seed Companies',
        plannedTitle: 'The TELA Maize Transition: Drought and Fall Armyworm Resistant Genetics Entering Smallholder Furrows',
        synopsis: 'Commercial deployment of transgenic and hybrid TELA maize varieties engineered to resist drought stress and lepidopteran stem borers without heavy pesticide spraying.',
        bottleneck: 'Seed multiplication bottlenecks leave certified seed companies unable to meet more than 15% of national farmer demand each planting season.',
        keyMetrics: [
          '35% yield advantage under moderate drought conditions',
          '₦65,000 saved per hectare on eliminated insecticide spray cycles',
          '7.5 MT/ha maximum yield potential under optimized agronomic management'
        ],
        strategicPlaybook: 'Expand public-private seed multiplication outgrower networks across the Southern Guinea Savanna.',
        politicalEconomyTakeaway: 'Climate-resilient seed sovereignty is the primary prerequisite for national caloric self-sufficiency.'
      },
      {
        id: 'cal-maize-05',
        month: 'October',
        quarter: 'Q4',
        commodity: 'Maize & Feed Grains',
        categoryId: 'policy',
        subcategoryId: 'sub-policy-reserves',
        subcategoryTitle: 'Strategic Food Reserve Procurement & Market Distortions',
        spectrumRank: '#5',
        spectrumRankName: 'The Macro Threat',
        format: 'memo',
        era: 'present',
        location: 'National Food Reserve Agency Silos, Abuja',
        targetPersona: 'Macroeconomic Policy Advisors & Food Security Taskforces',
        plannedTitle: 'The Market Distortion of Government Grain Purchases: When Strategic Buys Spike Open Market Spot Prices',
        synopsis: 'Large-scale uncoordinated government procurement drives for national food security reserves during harvest unexpectedly crowd out private commercial food processors.',
        bottleneck: 'Public procurement tenders announcing above-market minimum support prices trigger merchant hoarding across wholesale markets.',
        keyMetrics: [
          '500,000 MT target national strategic grain reserve procurement volume',
          '18% immediate spot price jump in Northern wholesale markets following procurement tenders',
          '33 federal silo complexes nationwide with varying levels of operational automation'
        ],
        strategicPlaybook: 'Adopt algorithmic forward procurement and seasonal purchase spreads to avoid sudden market price shocks.',
        politicalEconomyTakeaway: 'Government grain intervention must be counter-cyclical and transparently communicated to prevent speculative market hoarding.'
      },
      {
        id: 'cal-maize-06',
        month: 'October',
        quarter: 'Q4',
        commodity: 'Maize & Feed Grains',
        categoryId: 'markets',
        subcategoryId: 'sub-markets-cassava-substitution',
        subcategoryTitle: 'Industrial Starch & Feed Grain Substitution',
        spectrumRank: '#6',
        spectrumRankName: 'The Black Swan',
        format: 'comparison',
        era: 'future',
        location: 'Industrial Starch Processing Clusters, Kogi & Ogun States',
        targetPersona: 'Agro-Industrial Innovators & Beverage Procurement Directors',
        plannedTitle: 'The Cassava Starch Substitution Shock: Can High-Quality Cassava Flour permanently Replace Maize in Breweries?',
        synopsis: 'Rapid enzyme formulation advances allow commercial beer and glucose syrup manufacturers to substitute maize grits with processed cassava starch at a 30% cost discount.',
        bottleneck: 'Variable cyanide content and fluctuating supply consistency of fresh cassava roots within the 24-hour post-harvest processing window.',
        keyMetrics: [
          '30% cost savings on fermentable sugars by replacing imported or domestic maize with cassava grits',
          '2.8 million metric tons of annual maize demand currently absorbed by commercial processors',
          'Zero flavor or quality variance in finished beverage products under new enzymatic conversion'
        ],
        strategicPlaybook: 'Establish integrated cassava-to-fructose refining hubs directly adjacent to industrial consumer goods manufacturing zones.',
        politicalEconomyTakeaway: 'Inter-commodity substitution creates systemic resilience when single grain crops suffer climate shocks.'
      }
    ]
  }
];

/**
 * Returns pre-planned admin calendar articles for a given commodity and category.
 * If exact match isn't found, returns the 6 most relevant entries or falls back cleanly.
 */
export function getAdminCalendarSchedule(commodity: string, category: string, dateStr?: string): AdminEditorialMonthSchedule {
  // Try exact commodity match
  const cleanComm = commodity.toLowerCase();
  const schedule = ADMIN_EDITORIAL_CALENDAR.find(s => 
    s.commodity.toLowerCase().includes(cleanComm) || cleanComm.includes(s.commodity.toLowerCase())
  );

  if (schedule) {
    return schedule;
  }

  // Fallback: adapt the primary schedule (Ginger or Soybeans) to the user's active commodity
  const base = ADMIN_EDITORIAL_CALENDAR[0];
  return {
    ...base,
    commodity,
    theme: `${commodity} Supply Chain Integrity & Strategic Off-Take Alignment`,
    corridor: 'National Agri-Logistics & Processing Corridors',
    articles: base.articles.map((art, idx) => ({
      ...art,
      id: `cal-custom-${idx + 1}`,
      commodity,
      plannedTitle: art.plannedTitle.replace(/Ginger/g, commodity),
      synopsis: art.synopsis.replace(/ginger/gi, commodity),
      bottleneck: art.bottleneck.replace(/ginger/gi, commodity),
    }))
  };
}

/**
 * Raw compact JSON representation for injection into Prompt 1.
 */
export function getAdminCalendarPromptJSON(commodity: string, category: string): string {
  const schedule = getAdminCalendarSchedule(commodity, category);
  return JSON.stringify({
    calendarSchedule: {
      commodity: schedule.commodity,
      month: schedule.month,
      quarter: schedule.quarter,
      theme: schedule.theme,
      corridor: schedule.corridor,
      targetArticlesCount: 6,
      prePlannedArticles: schedule.articles.map(a => ({
        rank: a.spectrumRank,
        rankName: a.spectrumRankName,
        format: a.format,
        era: a.era,
        location: a.location,
        targetPersona: a.targetPersona,
        title: a.plannedTitle,
        bottleneck: a.bottleneck,
        keyMetrics: a.keyMetrics,
        strategicPlaybook: a.strategicPlaybook,
        politicalEconomyTakeaway: a.politicalEconomyTakeaway,
      }))
    }
  }, null, 2);
}
