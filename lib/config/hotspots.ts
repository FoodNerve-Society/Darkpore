export const WIKI_HOTSPOTS = [
  { id: 'NONE', label: 'None (Standalone Document)' },
  { id: 'TRADE_FLASH_SALE', label: 'Trade: Flash Sale Form' },
  { id: 'TRADE_GROUP_BUY', label: 'Trade: Group Buy Form' },
  { id: 'SUPPORT_NEW_TICKET', label: 'Support: New Ticket Desk' },
  { id: 'LEARN_CREATOR_STUDIO', label: 'Learn: Creator Studio' },
  { id: 'MEET_COMMUNITY_HUB', label: 'Meet: Community Hub' },
];

export function getHotspotLabel(id: string | null | undefined): string {
  if (!id) return 'None (Standalone Document)';
  const hotspot = WIKI_HOTSPOTS.find(h => h.id === id);
  return hotspot ? hotspot.label : id;
}
