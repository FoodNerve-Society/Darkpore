// lib/tenants.config.ts

export type Wahaala = {
  id: string;
  title: string;
  desc: string;
};

export type TenantConfig = {
  name: string;
  domain: string;
  themeColor: string;
  heroHeadline: string;
  heroSubheadline: string;
  wahaalasTitle: string;
  wahaalas: Wahaala[];
};

export const TENANTS: Record<string, TenantConfig> = {
  food: {
    name: "Food Nerve",
    domain: "foodnerve.com",
    themeColor: "#2E7D32", // Food Nerve Green
    heroHeadline: "The Wakanda of Agriculture.",
    heroSubheadline: "We are engineering the future of African food systems. Choose your biggest Wahaala below to find solutions, capital, and the people solving it.",
    wahaalasTitle: "The 7 Wahaalas (Pain Points)",
    wahaalas: [
      { id: 'land', title: '1. Land', desc: 'Access, mechanization, and soil regeneration.' },
      { id: 'capital', title: '2. Capital', desc: 'Grants, decentralized finance, and subsidies.' },
      { id: 'inputs', title: '3. Agro-Inputs', desc: 'High-yield seeds and organic fertilizers.' },
      { id: 'energy', title: '4. Energy', desc: 'Solar cold-chains and off-grid power.' },
      { id: 'insecurity', title: '5. Insecurity', desc: 'Drone surveillance and farm safety.' },
      { id: 'loss', title: '6. Post-Harvest Loss', desc: 'Storage, logistics, and processing.' },
      { id: 'protein', title: '7. Expensive Protein', desc: 'Alt-protein, aquaculture, and livestock.' },
    ]
  },
  energy: {
    name: "Energy Nerve",
    domain: "energynerve.com",
    themeColor: "#0D47A1", // Energy Nerve Blue
    heroHeadline: "The Grid of Tomorrow.",
    heroSubheadline: "Powering African innovation through decentralized energy solutions. Choose your biggest Wahaala below to find capital, tech, and the builders.",
    wahaalasTitle: "The Core Wahaalas",
    wahaalas: [
      { id: 'generation', title: '1. Generation', desc: 'Solar arrays, mini-grids, and sustainable sources.' },
      { id: 'transmission', title: '2. Transmission', desc: 'Smart grids and loss reduction.' },
      { id: 'storage', title: '3. Storage', desc: 'Battery tech and load balancing.' },
      { id: 'diesel', title: '4. Diesel Dependency', desc: 'Transitioning SMEs off fossil fuels.' },
    ]
  }
};

/**
 * Helper function to safely get a tenant config.
 * Defaults to 'food' if the tenant is unknown.
 */
export function getTenantConfig(tenantId: string): TenantConfig {
  return TENANTS[tenantId] || TENANTS['food'];
}
