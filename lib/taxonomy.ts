export const TAXONOMY = {
  "Primary Production": [
    "Crop Farming & Horticulture",
    "Livestock & Poultry",
    "Aquaculture",
    "Greenhouse & Hydroponics"
  ],
  "Processing & Manufacturing": [
    "Food Processing & Manufacturing",
    "Quality Assurance & Food Safety",
    "Milling & Extrusion",
    "Cold Storage & Preservation",
    "Packaging & Labeling",
    "Fermentation & Bio-processing",
    "Food Product Development (R&D)"
  ],
  "Culinary, Food Service & Hospitality": [
    "Culinary & Kitchen Operations (Chef / Cook)",
    "Restaurant & Bar Management",
    "Catering & Institutional Feeding",
    "Food Safety & Hygiene Inspection"
  ],
  "Logistics & Supply Chain": [
    "Cold-Chain Transport",
    "Warehousing & Aggregation",
    "Last-Mile Delivery"
  ],
  "Agritech & Data Ecosystem": [
    "IoT & Farm Sensors",
    "Drone Mapping & GIS",
    "Farm Management Software",
    "Marketplace Platforms"
  ],
  "Policy, Research & Education": [
    "Agronomy & Extension Services",
    "Biotech & Seed Research",
    "Regulatory & NGO"
  ],
  "Retail, Trade & Market Access": [
    "B2B Export",
    "Wholesale Aggregation",
    "B2C E-commerce & Grocery"
  ],
  "Finance & Investment": [
    "Microfinance & Credit",
    "Venture Capital & Private Equity",
    "Insurance & Risk Mitigation"
  ]
};

// Flatten for autocomplete options where we want a flat list with indentation
export const CATEGORY_OPTIONS = Object.entries(TAXONOMY).map(([influencer, actors]) => {
  return [influencer, ...actors.map(actor => `  ↳ ${actor}`)];
}).flat();

/**
 * The 8 Core Value Chain Actors of the FoodNerve Agricultural Ecosystem.
 */
export const CORE_VALUE_CHAIN_ACTORS = [
  "Farmer / Producer",
  "Processor / Manufacturer",
  "Distributor / Transporter",
  "Retailer / Vendor",
  "Consumer",
  "Regulator / Policymaker",
  "Researcher / Innovator",
  "Investor / Financier"
] as const;

export const VALUE_CHAIN_ACTORS = CORE_VALUE_CHAIN_ACTORS;

export const DEPARTMENT_FUNCTIONS = Object.values(TAXONOMY).flat();

export const JOB_FUNCTIONS = CORE_VALUE_CHAIN_ACTORS;

