import { BottleneckData } from '../types';

export const foodBottlenecks: BottleneckData[] = [
  {
    id: 'land',
    title: '1. Land',
    desc: 'Access, mechanization, and soil regeneration.',
    longDesc: 'Land is the fundamental bottleneck in African agriculture. We are addressing the fragmentation of arable land, scaling mechanization access, and pioneering soil regeneration to unlock millions of hectares of dead soil.',
    imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1200&auto=format&fit=crop',
    stats: { activeSolutions: 12, capitalDeployed: '$4.2M', communitySize: '2,400+' },
    updates: [
      {
        id: 'grant-50m',
        title: '₦50M Soil Regeneration Grant by the Gates Foundation',
        summary: 'The Gates Foundation is seeking 5 startups to deploy drone-based soil analysis across 10,000 hectares in Northern Nigeria.',
        section: 'innovations',
        importance: 'high',
        date: '2026-05-25T09:00:00Z',
        linkText: 'Apply in the Deal Room'
      },
      {
        id: 'job-gis',
        title: 'Senior GIS Analyst Needed',
        summary: 'We need a Senior GIS Analyst to map out 500,000 hectares for our new tractor deployment algorithm. Salary: ₦1,200,000/month.',
        section: 'jobs',
        importance: 'high',
        date: '2026-05-24T14:00:00Z',
        linkText: 'Apply via Rolodex'
      },
      {
        id: 'bootcamp-regen',
        title: 'Regenerative Ag Bootcamp',
        summary: 'Upcoming Bootcamps on regenerative agriculture practices starting next month in Kano.',
        section: 'activities',
        importance: 'normal',
        date: '2026-05-23T10:00:00Z',
        linkText: 'Register Now'
      },
      {
        id: 'learn-secure-land',
        title: 'How to Secure a 100-Hectare Lease in 30 Days',
        summary: 'New premium blueprint uploaded to the Knowledge Area detailing legal frameworks for massive land acquisition.',
        section: 'learn',
        importance: 'normal',
        date: '2026-05-22T08:00:00Z',
        linkText: 'Read Blueprint'
      }
    ],
    learningMaterials: [
      {
        slug: 'how-to-secure-100-hectares',
        title: 'How to Secure a 100-Hectare Lease in 30 Days',
        type: 'article',
        thumbnailUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop',
        previewText: 'Securing massive tracts of arable land in Nigeria is notoriously difficult due to fragmented ownership and political red tape. In this blueprint, we break down the exact legal and community frameworks you need...',
        fullContent: 'Securing massive tracts of arable land in Nigeria is notoriously difficult due to fragmented ownership and political red tape. In this blueprint, we break down the exact legal and community frameworks you need. \n\nFirstly, you must bypass the local government and go straight to the paramount ruler of the community. Offering a 5% equity stake in the farm yield usually bypasses 90% of the bureaucratic bottlenecks. Secondly, you need to engage a specialized Agritech legal firm to draft a MoU that protects you against the Land Use Act revokation clauses. \n\n[This is where the premium content begins] \n\nHere are the 3 specific law firms we use, along with the exact MoU templates you can copy and paste...',
        isPremium: true,
        dateAdded: '2026-05-20T10:00:00Z',
        author: 'Chief Agronomist',
        readTime: '8 min read'
      },
      {
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
        slug: 'land-use-act-teardown',
        title: 'The Land Use Act: A Complete Teardown',
        type: 'pdf',
        thumbnailUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1000&auto=format&fit=crop',
        previewText: 'A comprehensive 50-page PDF report analyzing the Nigerian Land Use Act and how Agritech startups can navigate its loopholes.',
        fullContent: '/dummy-report.pdf',
        isPremium: true,
        dateAdded: '2026-05-24T09:15:00Z',
        readTime: '50 Pages'
      }
    ],
    sections: {
      innovations: {
        title: 'Innovations (0-to-1 R&D)',
        content: 'Current research on hyper-spectral drone analysis for soil composition mapping.',
        lockedContent: {
          title: 'Gates Foundation ₦50M Soil Grant',
          content: 'The Gates Foundation is seeking 5 startups to deploy drone-based soil analysis across 10,000 hectares in Northern Nigeria. Applications close in 14 days.',
          ctaText: 'Apply in the Deal Room'
        }
      },
      library: {
        title: 'The Library',
        content: 'Open-source documentation on land tenure laws and mechanization ROI across 15 African states.',
      },
      community: {
        title: 'Community',
        content: 'Join the discussion with 400+ agronomists solving land fragmentation.',
      },
      activities: {
        title: 'Activities',
        content: 'Upcoming Bootcamps on regenerative agriculture practices.',
      },
      livestreams: {
        title: 'Livestreams & Townhalls',
        content: 'Next Townhall: How to secure a 100-hectare lease in 30 days without political connections.',
      },
      jobs: {
        title: 'Jobs & Earn',
        content: 'High-paying roles in farm management and GIS mapping.',
        lockedContent: {
          title: 'Senior GIS Analyst - Tractor on Demand',
          content: 'Salary: ₦1,200,000/month. We need a Senior GIS Analyst to map out 500,000 hectares for our new tractor deployment algorithm.',
          ctaText: 'Apply via Rolodex'
        }
      }
    }
  },
  {
    id: 'capital',
    title: '2. Capital',
    desc: 'Grants, decentralized finance, and subsidies.',
    longDesc: 'Capital flows in African agriculture are broken. We are building the rails for decentralized finance, frictionless subsidies, and direct farmer-to-investor liquidity.',
    imageUrl: 'https://images.unsplash.com/photo-1553729459-afe8f2e2ed65?q=80&w=1200&auto=format&fit=crop',
    stats: { activeSolutions: 8, capitalDeployed: '$12.8M', communitySize: '1,800+' },
    updates: [
      {
        id: 'series-a',
        title: 'Series A term sheets for Agritech Fintechs',
        summary: 'Multiple VCs are currently issuing term sheets for startups building DeFi rails for rural farmers.',
        section: 'innovations',
        importance: 'high',
        date: '2026-05-25T11:00:00Z',
        linkText: 'Enter the Deal Room'
      }
    ],
    learningMaterials: [],
    sections: {
      innovations: { title: 'Innovations', content: 'DeFi rails for rural farmers.' },
      library: { title: 'The Library', content: 'Database of 200+ active Agritech VCs.' },
      community: { title: 'Community', content: 'Meet founders who raised $1M+.' },
      activities: { title: 'Activities', content: 'Pitch deck teardown sessions.' },
      livestreams: { title: 'Livestreams', content: 'Townhall: Raising during a currency devaluation.' },
      jobs: { title: 'Jobs & Earn', content: 'Looking for a fractional CFO for your farm?' }
    }
  },
  // Dummy implementations for the rest to keep the file clean for now
  ...['inputs', 'energy', 'insecurity', 'loss', 'protein'].map((id, idx) => ({
    id,
    title: `${idx + 3}. ${id.charAt(0).toUpperCase() + id.slice(1)}`,
    desc: 'Core infrastructure bottleneck.',
    longDesc: `Detailed breakdown of the ${id} crisis and the society's approach to solving it.`,
    imageUrl: `https://images.unsplash.com/photo-${1500000000000 + idx * 11111111}?q=80&w=1200&auto=format&fit=crop`,
    stats: { activeSolutions: 3 + idx, capitalDeployed: `$${(1.5 + idx * 0.8).toFixed(1)}M`, communitySize: `${500 + idx * 200}+` },
    updates: [
      {
        id: `update-${id}`,
        title: `New developments in ${id}`,
        summary: `Breaking updates regarding the ${id} crisis.`,
        section: 'innovations',
        importance: 'high',
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
  }))
];
