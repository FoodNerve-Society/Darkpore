import { TenantConfig } from '../types';
import { foodBottlenecks } from './bottlenecks';

export const foodTenantConfig: TenantConfig = {
  name: 'Food Nerve',
  domain: 'foodnerve.com',
  palette: {
    light: {
      primary: { main: '#2e7d32' },
      secondary: { main: '#cddc39' },
      background: { default: '#f1f8e9', paper: '#ffffff' },
      text: { primary: '#1b5e20', secondary: '#33691e' },
      custom: {
        watch: { main: '#4caf50', contrastText: '#ffffff', gradientStart: '#81c784', gradientEnd: '#388e3c' },
        meet: { main: '#8bc34a', contrastText: '#000000', gradientStart: '#aed581', gradientEnd: '#689f38' },
        manage: { main: '#cddc39', contrastText: '#000000', gradientStart: '#dce775', gradientEnd: '#afb42b' },
        default: { main: '#2e7d32', contrastText: '#ffffff', gradientStart: '#4caf50', gradientEnd: '#1b5e20' }
      }
    },
    dark: {
      primary: { main: '#81c784' },
      secondary: { main: '#dce775' },
      background: { default: '#1b5e20', paper: '#2e7d32' },
      text: { primary: '#e8f5e9', secondary: '#c8e6c9' },
      custom: {
        watch: { main: '#66bb6a', contrastText: '#000000', gradientStart: '#a5d6a7', gradientEnd: '#43a047' },
        meet: { main: '#9ccc65', contrastText: '#000000', gradientStart: '#c5e1a5', gradientEnd: '#7cb342' },
        manage: { main: '#d4e157', contrastText: '#000000', gradientStart: '#e6ee9c', gradientEnd: '#c0ca33' },
        default: { main: '#81c784', contrastText: '#000000', gradientStart: '#a5d6a7', gradientEnd: '#4caf50' }
      }
    }
  },
  com: {
    homepage: {
      heroHeadline: "Architecting the African Agritech Ecosystem.",
      heroSubheadline: "We are engineering the future of African food systems. Choose your biggest Bottleneck below to find solutions, capital, and the people solving it.",
      bottlenecksTitle: "The 7 Bottlenecks (Pain Points)",
      bottlenecks: foodBottlenecks,
      showcaseProjects: [
        {
          title: "Project Oasis: 10,000 Hectare Mapping",
          desc: "Deploying hyperspectral drone analysis across Northern Nigeria to identify viable soil for wheat production.",
          imageUrl: "https://images.unsplash.com/photo-1592982537447-6f2a6a0a3824?q=80&w=1000&auto=format&fit=crop",
          link: "/land/innovations"
        },
        {
          title: "The Solar Cold-Chain Initiative",
          desc: "Funding the deployment of 50 decentralized solar cold rooms across major perishable goods markets in Lagos.",
          imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1000&auto=format&fit=crop",
          link: "/loss/innovations"
        }
      ]
    }
  },
  org: {
    homepage: {
      title: 'Food Nerve Society',
      heroHeadline: 'Connect. Build. Scale.',
      heroSubheadline: 'Join the premier ecosystem of agritech innovators solving Africa’s biggest food challenges.',
      ctaText: 'Join the Society',
      aboutLinkText: 'Learn more about our mission',
    },
    about: {
      title: 'About Food Nerve',
      subtitle: 'We are a community-driven organization dedicated to transforming the agricultural landscape in Africa through technology and collaboration.',
      features: [
        {
          title: 'Innovation Hubs',
          desc: 'Access state-of-the-art facilities and resources to develop your agritech solutions.'
        },
        {
          title: 'Funding Opportunities',
          desc: 'Connect with investors and secure funding to scale your impact.'
        },
        {
          title: 'Expert Mentorship',
          desc: 'Learn from industry veterans and navigate the complexities of the agricultural sector.'
        }
      ],
      ctaText: 'Become a Member Today'
    }
  }
};
