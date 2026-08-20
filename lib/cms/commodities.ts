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

