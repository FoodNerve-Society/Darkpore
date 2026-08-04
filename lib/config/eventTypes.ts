export type EcosystemTab = 'learn' | 'support' | 'trade' | 'meet' | 'general';

export interface EcosystemEventType {
  id: string;
  label: string;
  tab: EcosystemTab;
  description?: string;
}

export const ECOSYSTEM_EVENT_TYPES: EcosystemEventType[] = [
  { id: 'general', label: 'General Event', tab: 'general', description: 'A standard calendar event.' },
  { id: 'article', label: 'Article Draft', tab: 'learn', description: 'Schedule an article for publication.' },
  { id: 'livestream', label: 'Livestream', tab: 'learn', description: 'Host a live video session.' },
  { id: 'masterclass', label: 'Masterclass', tab: 'learn', description: 'Create an in-depth educational course.' },
  { id: 'flash-sale', label: 'Flash Sale', tab: 'trade', description: 'Schedule a limited-time product discount.' },
  { id: 'listing', label: 'Market Listing', tab: 'trade', description: 'Post a new commodity or equipment listing.' },
  { id: 'meetup', label: 'Meetup', tab: 'meet', description: 'Organize a physical or virtual gathering.' },
  { id: 'ticket-support', label: 'Support Ticket', tab: 'support', description: 'Schedule a technical or agricultural support session.' },
];
