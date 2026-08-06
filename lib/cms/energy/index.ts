import { TenantConfig } from '../types';
import { energyChallenges } from './challenges';

export const energyTenantConfig: TenantConfig = {
  name: 'EnergyNerve',
  domain: 'energynerve.com',
  socialLinks: {
    x: '', // Empty to test disabled state
    linkedin: 'https://linkedin.com/company/energynerve',
  },
  people: [
    {
      slug: 'michael-chen',
      name: 'Michael Chen',
      role: 'Director of Grid Infrastructure',
      bio: 'Michael oversees our investments in decentralized grid systems. He previously led infrastructure projects across sub-Saharan Africa.',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop',
    },
    {
      slug: 'amara-diop',
      name: 'Amara Diop',
      role: 'Renewables Lead',
      bio: 'Amara drives innovation in solar and clean energy storage solutions, focusing on scalable community projects.',
      imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop',
    }
  ],  palette: {
    light: {
      primary: { main: '#0277bd' },
      secondary: { main: '#ff9800' },
      background: { default: '#e1f5fe', paper: '#ffffff' },
      text: { primary: '#01579b', secondary: '#0288d1' },
      custom: {
        watch: { main: '#29b6f6', contrastText: '#ffffff', gradientStart: '#4fc3f7', gradientEnd: '#0288d1' },
        meet: { main: '#ffb74d', contrastText: '#000000', gradientStart: '#ffcc80', gradientEnd: '#f57c00' },
        manage: { main: '#ffa726', contrastText: '#000000', gradientStart: '#ffb74d', gradientEnd: '#ef6c00' },
        default: { main: '#0277bd', contrastText: '#ffffff', gradientStart: '#039be5', gradientEnd: '#01579b' }
      }
    },
    dark: {
      primary: { main: '#4fc3f7' },
      secondary: { main: '#ffb74d' },
      background: { default: '#01579b', paper: '#0277bd' },
      text: { primary: '#e1f5fe', secondary: '#b3e5fc' },
      custom: {
        watch: { main: '#81d4fa', contrastText: '#000000', gradientStart: '#b3e5fc', gradientEnd: '#29b6f6' },
        meet: { main: '#ffcc80', contrastText: '#000000', gradientStart: '#ffe0b2', gradientEnd: '#ffa726' },
        manage: { main: '#ffb74d', contrastText: '#000000', gradientStart: '#ffcc80', gradientEnd: '#fb8c00' },
        default: { main: '#4fc3f7', contrastText: '#000000', gradientStart: '#81d4fa', gradientEnd: '#039be5' }
      }
    }
  },
  com: {
    homepage: {
      heroHeadline: "The Decentralized Grid of Tomorrow.",
      heroSubheadline: "Powering African innovation through decentralized energy solutions. Choose your biggest Challenge below to find capital, tech, and the builders.",
      challengesTitle: "The Core Challenges",
      challenges: energyChallenges,
      showcaseProjects: [
        {
          title: "Operation 100MW Mini-Grid",
          desc: "Scaling distributed solar mini-grids across 15 off-grid commercial clusters in West Africa.",
          imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1000&auto=format&fit=crop",
          link: "/generation/innovations"
        },
        {
          title: "Battery Storage Subsidies",
          desc: "Providing $2M in matched funding for localized lithium-ion assembly plants.",
          imageUrl: "https://images.unsplash.com/photo-1620287341056-49a2f1ab2fdc?q=80&w=1000&auto=format&fit=crop",
          link: "/storage/innovations"
        }
      ]
    }
  },
  org: {
    homepage: {
      title: 'Energy Nerve Society',
      heroHeadline: 'Powering the Future. Together.',
      heroSubheadline: 'Join the premier ecosystem of innovators solving Africa’s biggest energy challenges.',
      ctaText: 'Join the Society',
      aboutLinkText: 'Learn more about our mission',
      featuredSlideshow: []
    },
    about: {
      title: 'About Energy Nerve',
      subtitle: 'We are a community-driven organization dedicated to transforming the energy landscape in Africa through sustainable technology and collaboration.',
      features: [
        {
          title: 'Innovation Hubs',
          desc: 'Access state-of-the-art facilities and resources to develop your clean energy solutions.'
        },
        {
          title: 'Funding Opportunities',
          desc: 'Connect with investors and secure funding to scale your impact.'
        },
        {
          title: 'Expert Mentorship',
          desc: 'Learn from industry veterans and navigate the complexities of the energy sector.'
        }
      ],
      ctaText: 'Become a Member Today'
    }
  }
};
