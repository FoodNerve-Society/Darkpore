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
}

export const COMMODITY_META_MAP: Record<string, CommodityMeta> = {
  "Tomato and Pepper": { category: "Horticulture", color: "#f43f5e", glowColor: "rgba(244, 63, 94, 0.35)" },
  "Poultry and Eggs": { category: "Livestock & Protein", color: "#f59e0b", glowColor: "rgba(245, 158, 11, 0.35)" },
  "Bananas and Plantains": { category: "Horticulture", color: "#eab308", glowColor: "rgba(234, 179, 8, 0.35)" },
  "Oil Palm and Coconut": { category: "Oils & Tree Crops", color: "#10b981", glowColor: "rgba(16, 185, 129, 0.35)" },
  "Rice": { category: "Grains & Staples", color: "#fbbf24", glowColor: "rgba(251, 191, 36, 0.35)" },
  "Beef": { category: "Livestock & Protein", color: "#ef4444", glowColor: "rgba(239, 68, 68, 0.35)" },
  "Melons": { category: "Horticulture", color: "#34d399", glowColor: "rgba(52, 211, 153, 0.35)" },
  "Soybeans, Nuts and Meals": { category: "Oils & Tree Crops", color: "#059669", glowColor: "rgba(5, 150, 105, 0.35)" },
  "Maize and Maize Oil": { category: "Grains & Staples", color: "#f59e0b", glowColor: "rgba(245, 158, 11, 0.35)" },
  "Lamb and Ram": { category: "Livestock & Protein", color: "#a855f7", glowColor: "rgba(168, 85, 247, 0.35)" },
  "Apples and Grapes": { category: "Horticulture", color: "#ec4899", glowColor: "rgba(236, 72, 153, 0.35)" },
  "Rapeseed and Mustard Oil": { category: "Oils & Tree Crops", color: "#eab308", glowColor: "rgba(234, 179, 8, 0.35)" },
  "Sorghum": { category: "Grains & Staples", color: "#d97706", glowColor: "rgba(217, 119, 6, 0.35)" },
  "Pork": { category: "Livestock & Protein", color: "#f43f5e", glowColor: "rgba(244, 63, 94, 0.35)" },
  "Citrus Fruits": { category: "Horticulture", color: "#f97316", glowColor: "rgba(249, 115, 22, 0.35)" },
  "Sunflower and Cottonseed Oils": { category: "Oils & Tree Crops", color: "#facc15", glowColor: "rgba(250, 204, 21, 0.35)" },
  "Potatoes": { category: "Tubers & Roots", color: "#d97706", glowColor: "rgba(217, 119, 6, 0.35)" },
  "Pulses": { category: "Grains & Staples", color: "#10b981", glowColor: "rgba(16, 185, 129, 0.35)" },
  "Mangoes, Guavas and Mangosteens": { category: "Horticulture", color: "#f97316", glowColor: "rgba(249, 115, 22, 0.35)" },
  "Groundnut and Sesame Oils": { category: "Oils & Tree Crops", color: "#b45309", glowColor: "rgba(180, 83, 9, 0.35)" },
  "Yam and Cassava": { category: "Tubers & Roots", color: "#d97706", glowColor: "rgba(217, 119, 6, 0.35)" },
  "Milk": { category: "Dairy & Protein", color: "#38bdf8", glowColor: "rgba(56, 189, 248, 0.35)" },
  "Pineapples": { category: "Horticulture", color: "#facc15", glowColor: "rgba(250, 204, 21, 0.35)" },
  "Fish": { category: "Aquaculture & Marine", color: "#0284c7", glowColor: "rgba(2, 132, 199, 0.35)" },
  "Wheat and Sugar": { category: "Grains & Staples", color: "#eab308", glowColor: "rgba(234, 179, 8, 0.35)" },
  "Cephalopods and Shellfish": { category: "Aquaculture & Marine", color: "#06b6d4", glowColor: "rgba(6, 182, 212, 0.35)" }
};

export function getCommodityMeta(name: string | null): CommodityMeta {
  if (!name || !COMMODITY_META_MAP[name]) {
    return {
      category: "Agro Commodity",
      color: "#10b981",
      glowColor: "rgba(16, 185, 129, 0.35)"
    };
  }
  return COMMODITY_META_MAP[name];
}

