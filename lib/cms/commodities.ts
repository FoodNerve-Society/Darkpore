export const commoditiesList = [
  "Tomato and Pepper",
  "Poultry and Eggs",
  "Bananas and Plantains",
  "Oil Palm and Coconut",
  "Rice",
  "Beef",
  "Melons",
  "Soybeans, Nuts and Meals",
  "Maize and Maize Oil",
  "Lamb and Ram",
  "Apples and Grapes",
  "Rapeseed and Mustard Oil",
  "Sorghum",
  "Pork",
  "Citrus Fruits",
  "Sunflower and Cottonseed Oils",
  "Potatoes",
  "Pulses",
  "Mangoes, Guavas and Mangosteens",
  "Groundnut and Sesame Oils",
  "Yam and Cassava",
  "Milk",
  "Pineapples",
  "Fish",
  "Wheat and Sugar",
  "Cephalopods and Shellfish"
];

export interface CommodityMeta {
  category: string;
  color: string;
  glowColor: string;
  imageUrl: string;
}

export const COMMODITY_META_MAP: Record<string, CommodityMeta> = {
  "Tomato and Pepper": { category: "Horticulture", color: "#f43f5e", glowColor: "rgba(244, 63, 94, 0.35)", imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80" },
  "Poultry and Eggs": { category: "Livestock & Protein", color: "#f59e0b", glowColor: "rgba(245, 158, 11, 0.35)", imageUrl: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80" },
  "Bananas and Plantains": { category: "Horticulture", color: "#eab308", glowColor: "rgba(234, 179, 8, 0.35)", imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80" },
  "Oil Palm and Coconut": { category: "Oils & Tree Crops", color: "#10b981", glowColor: "rgba(16, 185, 129, 0.35)", imageUrl: "https://images.unsplash.com/photo-1543083477-4f785aeafaa9?auto=format&fit=crop&w=600&q=80" },
  "Rice": { category: "Grains & Staples", color: "#fbbf24", glowColor: "rgba(251, 191, 36, 0.35)", imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80" },
  "Beef": { category: "Livestock & Protein", color: "#ef4444", glowColor: "rgba(239, 68, 68, 0.35)", imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80" },
  "Melons": { category: "Horticulture", color: "#34d399", glowColor: "rgba(52, 211, 153, 0.35)", imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80" },
  "Soybeans, Nuts and Meals": { category: "Oils & Tree Crops", color: "#059669", glowColor: "rgba(5, 150, 105, 0.35)", imageUrl: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80" },
  "Maize and Maize Oil": { category: "Grains & Staples", color: "#f59e0b", glowColor: "rgba(255, 158, 11, 0.35)", imageUrl: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80" },
  "Lamb and Ram": { category: "Livestock & Protein", color: "#a855f7", glowColor: "rgba(168, 85, 247, 0.35)", imageUrl: "https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=600&q=80" },
  "Apples and Grapes": { category: "Horticulture", color: "#ec4899", glowColor: "rgba(236, 72, 153, 0.35)", imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80" },
  "Rapeseed and Mustard Oil": { category: "Oils & Tree Crops", color: "#eab308", glowColor: "rgba(234, 179, 8, 0.35)", imageUrl: "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=600&q=80" },
  "Sorghum": { category: "Grains & Staples", color: "#d97706", glowColor: "rgba(217, 119, 6, 0.35)", imageUrl: "https://images.unsplash.com/photo-1627920769842-6887c6df05ca?auto=format&fit=crop&w=600&q=80" },
  "Pork": { category: "Livestock & Protein", color: "#f43f5e", glowColor: "rgba(244, 63, 94, 0.35)", imageUrl: "https://images.unsplash.com/photo-1602498456745-e9503b30470b?auto=format&fit=crop&w=600&q=80" },
  "Citrus Fruits": { category: "Horticulture", color: "#f97316", glowColor: "rgba(249, 115, 22, 0.35)", imageUrl: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=600&q=80" },
  "Sunflower and Cottonseed Oils": { category: "Oils & Tree Crops", color: "#facc15", glowColor: "rgba(250, 204, 21, 0.35)", imageUrl: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80" },
  "Potatoes": { category: "Tubers & Roots", color: "#d97706", glowColor: "rgba(217, 119, 6, 0.35)", imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80" },
  "Pulses": { category: "Grains & Staples", color: "#10b981", glowColor: "rgba(16, 185, 129, 0.35)", imageUrl: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80" },
  "Mangoes, Guavas and Mangosteens": { category: "Horticulture", color: "#f97316", glowColor: "rgba(249, 115, 22, 0.35)", imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80" },
  "Groundnut and Sesame Oils": { category: "Oils & Tree Crops", color: "#b45309", glowColor: "rgba(180, 83, 9, 0.35)", imageUrl: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=600&q=80" },
  "Yam and Cassava": { category: "Tubers & Roots", color: "#d97706", glowColor: "rgba(217, 119, 6, 0.35)", imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80" },
  "Milk": { category: "Dairy & Protein", color: "#38bdf8", glowColor: "rgba(56, 189, 248, 0.35)", imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80" },
  "Pineapples": { category: "Horticulture", color: "#facc15", glowColor: "rgba(250, 204, 21, 0.35)", imageUrl: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80" },
  "Fish": { category: "Aquaculture & Marine", color: "#0284c7", glowColor: "rgba(2, 132, 199, 0.35)", imageUrl: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=600&q=80" },
  "Wheat and Sugar": { category: "Grains & Staples", color: "#eab308", glowColor: "rgba(234, 179, 8, 0.35)", imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80" },
  "Cephalopods and Shellfish": { category: "Aquaculture & Marine", color: "#06b6d4", glowColor: "rgba(6, 182, 212, 0.35)", imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80" }
};

export function getCommodityMeta(name: string | null): CommodityMeta {
  if (!name || !COMMODITY_META_MAP[name]) {
    return {
      category: "Agro Commodity",
      color: "#10b981",
      glowColor: "rgba(16, 185, 129, 0.35)",
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80"
    };
  }
  return COMMODITY_META_MAP[name];
}

export interface ThematicBasket {
  id: string;
  label: string;
  shortLabel: string;
  emoji: string;
  color: string;
  accentBg: string;
  description: string;
  commodities: string[];
}

export const THEMATIC_BASKETS: ThematicBasket[] = [
  {
    id: 'grains-staples',
    label: 'Grains & Dry Staples Basket',
    shortLabel: 'Grains & Staples',
    emoji: '🌾',
    color: '#f59e0b',
    accentBg: 'rgba(245, 158, 11, 0.12)',
    description: 'Northern cereal corridors, dry silos, and strategic buffer stocks',
    commodities: [
      'Rice',
      'Maize and Maize Oil',
      'Sorghum',
      'Wheat and Sugar',
      'Pulses'
    ]
  },
  {
    id: 'perishables-horticulture',
    label: 'Perishables & Horticulture Basket',
    shortLabel: 'Perishables',
    emoji: '🍅',
    color: '#ef4444',
    accentBg: 'rgba(239, 68, 68, 0.12)',
    description: 'Cold-chain transit, highway rot risk, and fresh terminal markets',
    commodities: [
      'Tomato and Pepper',
      'Bananas and Plantains',
      'Melons',
      'Apples and Grapes',
      'Citrus Fruits',
      'Mangoes, Guavas and Mangosteens',
      'Pineapples'
    ]
  },
  {
    id: 'livestock-protein',
    label: 'Livestock & Protein Basket',
    shortLabel: 'Livestock & Protein',
    emoji: '🥩',
    color: '#a855f7',
    accentBg: 'rgba(168, 85, 247, 0.12)',
    description: 'Pastoral corridors, grazing reserves, veterinary supplies, and feed conversion',
    commodities: [
      'Poultry and Eggs',
      'Beef',
      'Lamb and Ram',
      'Pork',
      'Milk',
      'Fish',
      'Cephalopods and Shellfish'
    ]
  },
  {
    id: 'oils-tree-crops',
    label: 'Industrial Oils & Tree Crops Basket',
    shortLabel: 'Oils & Tree Crops',
    emoji: '🌻',
    color: '#10b981',
    accentBg: 'rgba(16, 185, 129, 0.12)',
    description: 'Industrial solvent crushers, palm processing, and dollar-export parity',
    commodities: [
      'Oil Palm and Coconut',
      'Soybeans, Nuts and Meals',
      'Rapeseed and Mustard Oil',
      'Sunflower and Cottonseed Oils',
      'Groundnut and Sesame Oils'
    ]
  },
  {
    id: 'tubers-roots',
    label: 'Tubers & Starch Basket',
    shortLabel: 'Tubers & Roots',
    emoji: '🥔',
    color: '#d97706',
    accentBg: 'rgba(217, 119, 6, 0.12)',
    description: 'High-bulk domestic transit, wet starch extraction, and regional food security',
    commodities: [
      'Yam and Cassava',
      'Potatoes'
    ]
  }
];

import { getISOWeek } from 'date-fns';

export function findMatchingBasket(commodities: string[]): ThematicBasket | undefined {
  if (!commodities || commodities.length === 0) return undefined;
  return THEMATIC_BASKETS.find(b => 
    b.commodities.length === commodities.length &&
    b.commodities.every(c => commodities.includes(c))
  );
}

export function formatCommoditySelectionTitle(commodities: string[]): string {
  if (!commodities || commodities.length === 0) return 'All Commodities (Food System Wide)';
  if (commodities.length >= commoditiesList.length) return 'All Commodities (Food System Wide)';
  
  const basket = findMatchingBasket(commodities);
  if (basket) return basket.label;
  
  if (commodities.length === 1) return commodities[0];
  if (commodities.length === 2) return `${commodities[0]} & ${commodities[1]}`;
  return `${commodities[0]} + ${commodities.length - 1} More`;
}

/**
 * Returns the two 52-week calendar cycle weeks for a single commodity
 * (Cycle 1: Weeks 1-26, Cycle 2: Weeks 27-52).
 */
export function getWeeksForCommodity(commodity: string): number[] {
  const idx = commoditiesList.indexOf(commodity);
  if (idx === -1) return [];
  return [idx + 1, idx + 1 + commoditiesList.length];
}

/**
 * Derives all projected calendar weeks where this article is active.
 * For All Commodities or empty array, returns all 52 weeks (evergreen).
 */
export function getProjectedWeeksForCommodities(commodities: string[]): number[] {
  if (!commodities || commodities.length === 0 || commodities.length >= commoditiesList.length) {
    return Array.from({ length: 52 }, (_, i) => i + 1);
  }
  const weeks = new Set<number>();
  for (const c of commodities) {
    getWeeksForCommodity(c).forEach(w => {
      if (w <= 52) weeks.add(w);
    });
  }
  return Array.from(weeks).sort((a, b) => a - b);
}

export function isCommodityEvergreen(commodities: string[]): boolean {
  return !commodities || commodities.length === 0 || commodities.length >= commoditiesList.length;
}

export interface CorridorResurfaceInfo {
  isEvergreen: boolean;
  isResurfaced: boolean;
  currentWeek: number;
  authorWeek?: number;
  currentWeekCommodity: string;
  matchedCommodity?: string;
  coveredCommodities: string[];
  projectedWeeks: number[];
}

/**
 * Determines whether a given article is currently resurfaced for the active calendar week.
 */
export function getCorridorResurfaceInfo(params: {
  bottleneckTags?: string[] | string | null;
  targetDate?: Date | string | null;
  createdAt?: Date | string | null;
  currentDate?: Date;
}): CorridorResurfaceInfo {
  const now = params.currentDate || new Date();
  const currentWeek = getISOWeek(now);
  const currentCommodityIdx = (currentWeek - 1) % commoditiesList.length;
  const currentWeekCommodity = commoditiesList[currentCommodityIdx];

  let tags: string[] = [];
  if (Array.isArray(params.bottleneckTags)) {
    tags = params.bottleneckTags;
  } else if (typeof params.bottleneckTags === 'string') {
    try {
      tags = JSON.parse(params.bottleneckTags);
    } catch {
      tags = [];
    }
  }

  const isEvergreen = tags.includes('all_commodities') || tags.includes('evergreen') || tags.length >= commoditiesList.length;
  const coveredCommodities = commoditiesList.filter(c => tags.includes(c));

  let authorWeek: number | undefined;
  const dateAnchor = params.targetDate ? new Date(params.targetDate) : (params.createdAt ? new Date(params.createdAt) : null);
  if (dateAnchor && !isNaN(dateAnchor.getTime())) {
    authorWeek = getISOWeek(dateAnchor);
  }

  const projectedWeeks = isEvergreen
    ? Array.from({ length: 52 }, (_, i) => i + 1)
    : getProjectedWeeksForCommodities(coveredCommodities);

  const coversCurrentCommodity = coveredCommodities.includes(currentWeekCommodity) || isEvergreen;
  const isResurfaced = Boolean(coversCurrentCommodity && authorWeek !== undefined && authorWeek !== currentWeek);

  return {
    isEvergreen,
    isResurfaced,
    currentWeek,
    authorWeek,
    currentWeekCommodity,
    matchedCommodity: coveredCommodities.includes(currentWeekCommodity) ? currentWeekCommodity : undefined,
    coveredCommodities,
    projectedWeeks,
  };
}

