import { ChallengeData } from '../types';

export const energyChallenges: ChallengeData[] = [
  {
    id: 'generation',
    title: '1. Generation',
    desc: 'Solar arrays, mini-grids, and sustainable sources.',
    longDesc: 'The backbone of the power grid. We are solving generation deficits by scaling decentralized solar mini-grids and hybrid power arrays.',
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200&auto=format&fit=crop',
    stats: { activeSolutions: 9, capitalDeployed: '$6.1M', communitySize: '1,200+' },
    subcategories: [
      {
        id: 'solar-mini-grids',
        title: 'Solar Mini-Grids',
        desc: 'Decentralized power for rural communities.',
        imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200&auto=format&fit=crop',
        updates: [
          {
            id: 'tender-5mw',
            title: '5MW Solar Array Deployment for Lagos Market',
            summary: 'We need an EPC to deploy a 5MW rooftop solar array across 3 major markets. Budget: $4M.',
            section: 'jobs',
            importance: 'high',
            date: '2026-05-25T14:00:00Z',
            linkText: 'View Tender Details'
          }
        ],
        learningMaterials: [],
        sections: {
          innovations: { title: 'Innovations', content: 'Advanced perovskite solar cell R&D updates.' },
          library: { title: 'The Library', content: 'Open-source schematics for 100kW mini-grids.' },
          community: { title: 'Community', content: 'Connect with 200+ solar installers.' },
          activities: { title: 'Activities', content: 'Mini-grid deployment bootcamp.' },
          livestreams: { title: 'Livestreams', content: 'Townhall: Financing your first 1MW.' },
          jobs: { 
            title: 'Jobs & Earn', 
            content: 'Tenders and jobs in generation.',
            lockedContent: {
              title: 'Lead EPC Contractor - 5MW Market Project',
              content: 'We need an EPC to deploy a 5MW rooftop solar array across 3 major markets. Budget: $4M.',
              ctaText: 'Bid on the Trade Floor'
            }
          }
        }
      }
    ]
  },
  ...['transmission', 'storage', 'diesel'].map((id, idx) => ({
    id,
    title: `${idx + 2}. ${id.charAt(0).toUpperCase() + id.slice(1)}`,
    desc: 'Core infrastructure challenge.',
    longDesc: `Detailed breakdown of the ${id} crisis and the society's approach to solving it.`,
    imageUrl: `https://images.unsplash.com/photo-${1550000000000 + idx * 12345678}?q=80&w=1200&auto=format&fit=crop`,
    stats: { activeSolutions: 4 + idx, capitalDeployed: `$${(2.0 + idx * 1.2).toFixed(1)}M`, communitySize: `${600 + idx * 300}+` },
    subcategories: [
      {
        id: `general-${id}`,
        title: `General ${id.charAt(0).toUpperCase() + id.slice(1)}`,
        desc: `General subcategory for ${id}.`,
        imageUrl: `https://images.unsplash.com/photo-${1550000000000 + idx * 12345678}?q=80&w=1200&auto=format&fit=crop`,
        updates: [
          {
            id: `update-${id}`,
            title: `New developments in ${id}`,
            summary: `Breaking updates regarding the ${id} crisis.`,
            section: 'innovations' as const,
            importance: 'high' as const,
            date: '2026-05-25T12:00:00Z',
            linkText: 'Read More'
          }
        ],
        learningMaterials: [],
        sections: {
          innovations: { title: 'Innovations', content: 'R&D updates.' },
          library: { title: 'The Library', content: 'Research papers.' },
          community: { title: 'Community', content: 'Join the discussion.' },
          activities: { title: 'Activities', content: 'Upcoming events.' },
          livestreams: { title: 'Livestreams', content: 'Watch the replay.' },
          jobs: { title: 'Jobs & Earn', content: 'Open positions.' }
        }
      }
    ]
  }))
];
