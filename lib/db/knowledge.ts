import { LearningMaterial } from '../cms/types';

// We map materials to a 'challengeId' so we know which challenge they relate to.
export interface DBLearningMaterial extends LearningMaterial {
  id: string; // Database document ID
  challengeId: string;
  tenantId: string; // 'food', 'energy'
}

export const mockKnowledgeData: DBLearningMaterial[] = [
  {
    id: 'mat-1',
    challengeId: 'land',
    tenantId: 'food',
    slug: 'how-to-secure-100-hectares',
    title: 'How to Secure a 100-Hectare Lease in 30 Days',
    type: 'article',
    thumbnailUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop',
    previewText: 'Securing massive tracts of arable land in Nigeria is notoriously difficult due to fragmented ownership and political red tape. In this blueprint, we break down the exact legal and community frameworks you need...',
    fullContent: 'Securing massive tracts of arable land in Nigeria is notoriously difficult due to fragmented ownership and political red tape. In this blueprint, we break down the exact legal and community frameworks you need. \n\nFirstly, you must bypass the local government and go straight to the paramount ruler of the community. Offering a 5% equity stake in the farm yield usually bypasses 90% of the bureaucratic challenges. Secondly, you need to engage a specialized Agritech legal firm to draft a MoU that protects you against the Land Use Act revokation clauses. \n\n[This is where the premium content begins] \n\nHere are the 3 specific law firms we use, along with the exact MoU templates you can copy and paste...',
    isPremium: true,
    dateAdded: '2026-05-20T10:00:00Z',
    author: 'Chief Agronomist',
    readTime: '8 min read'
  },
  {
    id: 'mat-2',
    challengeId: 'land',
    tenantId: 'food',
    slug: 'soil-regeneration-101',
    title: 'Soil Regeneration 101: The Micro-Biome Crash Course',
    type: 'video',
    thumbnailUrl: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0a3824?q=80&w=1000&auto=format&fit=crop',
    previewText: 'Watch our Lead Scientist explain how to revive dead soil using indigenous microbes and cover crops. This 10-minute crash course will save you millions in fertilizer costs.',
    fullContent: 'dQw4w9WgXcQ', // Dummy YouTube ID
    isPremium: false,
    dateAdded: '2026-05-22T14:30:00Z',
    author: 'Dr. Amina'
  },
  {
    id: 'mat-3',
    challengeId: 'land',
    tenantId: 'food',
    slug: 'land-use-act-teardown',
    title: 'The Land Use Act: A Complete Teardown',
    type: 'pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1000&auto=format&fit=crop',
    previewText: 'A comprehensive 50-page PDF report analyzing the Nigerian Land Use Act and how Agritech startups can navigate its loopholes.',
    fullContent: '/dummy-report.pdf',
    isPremium: true,
    dateAdded: '2026-05-24T09:15:00Z',
    readTime: '50 Pages'
  },
  {
    id: 'mat-4',
    challengeId: 'loss',
    tenantId: 'food',
    slug: 'cold-chain-logistics-report',
    title: 'Cold Chain Logistics in Sub-Saharan Africa',
    type: 'pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1585244390635-4cb25fba0bbb?q=80&w=1000&auto=format&fit=crop',
    previewText: 'Insights into current cold chain infrastructures and solutions for minimizing food waste during transit.',
    fullContent: '/cold-chain-report.pdf',
    isPremium: false,
    dateAdded: '2026-05-25T11:00:00Z',
    readTime: '20 Pages'
  },
  {
    id: 'mat-5',
    challengeId: 'capital',
    tenantId: 'food',
    slug: 'agritech-funding-pitch-deck',
    title: 'How to Build an Agritech Pitch Deck',
    type: 'video',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=1000&auto=format&fit=crop',
    previewText: 'Learn what top-tier VCs are looking for in African Agritech startups.',
    fullContent: 'e-ORhEE9VVg', 
    isPremium: true,
    dateAdded: '2026-05-26T16:45:00Z',
    author: 'Venture Partner'
  },
  {
    id: 'mat-6',
    challengeId: 'inputs',
    tenantId: 'food',
    slug: 'tractor-maintenance-guide',
    title: 'Definitive Guide to Tractor Maintenance',
    type: 'article',
    thumbnailUrl: 'https://images.unsplash.com/photo-1605335967005-728bdaac2565?q=80&w=1000&auto=format&fit=crop',
    previewText: 'A step-by-step breakdown of routine maintenance models that can extend a tractors lifespan by 15 years.',
    fullContent: 'Tractor maintenance requires...', 
    isPremium: false,
    dateAdded: '2026-05-26T14:45:00Z',
    author: 'Chief Engineer',
    readTime: '12 min read'
  },
  {
    id: 'mat-7',
    challengeId: 'loss',
    tenantId: 'food',
    slug: 'logistics-deep-dive',
    title: 'AI in Logistics: Routing Trucks Efficiently',
    type: 'video',
    thumbnailUrl: 'https://images.unsplash.com/photo-1616439062335-e1189ac1216d?q=80&w=1000&auto=format&fit=crop',
    previewText: 'How modern logistics companies use ML models for fuel-efficient routing.',
    fullContent: 'dQw4w9WgXcQ', 
    isPremium: true,
    dateAdded: '2026-05-27T10:45:00Z',
    author: 'Data Scientist'
  },
  {
    id: 'mat-8',
    challengeId: 'land',
    tenantId: 'food',
    slug: 'soil-nutrient-mapping-report',
    title: 'Soil Nutrient Mapping 2026',
    type: 'pdf',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1000&auto=format&fit=crop',
    previewText: 'A report covering the nutrient breakdown across the Sahel region of Africa.',
    fullContent: '/nutrient-map.pdf', 
    isPremium: false,
    dateAdded: '2026-05-28T09:00:00Z',
    readTime: '12 Pages'
  }
];

// Simulated DB queries
export async function getKnowledgeMaterials(options?: { type?: string; tenantId?: string; challengeId?: string; limit?: number }) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let result = [...mockKnowledgeData];
  
  if (options?.tenantId) {
    result = result.filter(m => m.tenantId === options.tenantId);
  }
  
  if (options?.challengeId) {
    result = result.filter(m => m.challengeId === options.challengeId);
  }
  
  if (options?.type && options.type.toLowerCase() !== 'all') {
    result = result.filter(m => m.type.toLowerCase() === options.type!.toLowerCase());
  }

  // Sort by date added (newest first)
  result.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());

  if (options?.limit) {
    result = result.slice(0, options.limit);
  }
  
  return result;
}
