export const TAXONOMY = {
  "Primary Production": [
    "Crop Farming & Horticulture",
    "Livestock & Poultry",
    "Aquaculture",
    "Greenhouse & Hydroponics"
  ],
  "Processing & Manufacturing": [
    "Milling & Extrusion",
    "Cold Storage & Preservation",
    "Packaging & Labeling",
    "Fermentation & Bio-processing"
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

export const JOB_FUNCTIONS = [
  "Agronomy & Farm Operations",
  "Engineering & Technology (Software, IoT, Mechanical)",
  "Supply Chain & Logistics",
  "Sales, Marketing & Communications",
  "Finance & Accounting",
  "Legal & Compliance",
  "HR & Administration",
  "Research & Development (R&D)",
  "Quality Assurance & Food Safety",
  "Executive & Management"
];
