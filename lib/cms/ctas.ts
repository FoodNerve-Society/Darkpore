export interface MicroCTA {
  id: string;
  text: string;
  url: string;
}

export interface MacroCTA {
  id: string;
  hook: string;
  subtext: string;
  buttonText: string;
  url: string;
}

// Global Library of Tactical Micro-CTAs (For Block 9: Strategic Directive)
export const MICRO_CTAS: MicroCTA[] = [
  { id: 'custom', text: 'Custom Action', url: '#' }, // Fallback for manual override
  { id: 'investor_deal_flow', text: 'Request Vetted Startup List', url: '/deals' },
  { id: 'policy_template', text: 'Download Regulatory Draft PDF', url: '/policy' },
  { id: 'operator_toolkit', text: 'View Recommended Hardware Vendors', url: '/toolkit' },
  { id: 'ussd_wallet_startups', text: 'View Vetted Ag-Tech Startups', url: '/deals?tag=ussd' },
];

// Global Library of Platform Growth CTAs (For Block 11: Main CTA)
export const MACRO_CTAS: MacroCTA[] = [
  { 
    id: 'livestream', 
    hook: "Don't navigate the 2026 Food Crisis alone.", 
    subtext: "Join 400+ operators and VCs in the Rockefeller Action Group for weekly livestream briefings.", 
    buttonText: "RSVP for Friday's Founders Livestream", 
    url: "/livestream" 
  },
  { 
    id: 'action_group', 
    hook: "Move from observation to deployment.", 
    subtext: "Join 400+ operators and VCs building resilient infrastructure.", 
    buttonText: "Apply to the Rockefeller Syndicate", 
    url: "/syndicate" 
  },
  { 
    id: 'newsletter', 
    hook: "Stay ahead of the disruption.", 
    subtext: "Get these high-signal intelligence briefs delivered straight to your inbox.", 
    buttonText: "Get Weekly Intelligence Briefs", 
    url: "/newsletter" 
  }
];
