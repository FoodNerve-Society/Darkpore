import { getTradeListings, getEvents, getLearnContent, getCampaigns, getMembers } from './society';
import { foodChallenges } from '../cms/food/challenges';

// The 6 CTA sections on the Explore Page
export type ExploreSection = 'innovations' | 'library' | 'community' | 'activities' | 'livestreams' | 'jobs';

export interface ExploreFeedItem {
    id: string;
    type: ExploreSection;
    title: string;
    description: string;
    imageUrl: string;
    authorName?: string;
    date?: string;
    meta?: string; // e.g., '8 min read', '₦250,000/month', '$12M Raised'
    isPremium?: boolean;
    challengeTags: string[];
    originalData: any; // The raw data from society DB
}

// Helper to check if an item matches a selected challenge
const matchesChallenge = (itemTags: string[] = [], itemWahaala: string[] = [], challengeId: string) => {
    if (challengeId === 'all') return true;
    
    // Convert all to lowercase for safe matching
    const searchTerms = [challengeId.toLowerCase()];
    // Add common synonyms based on challengeId
    if (challengeId === 'land') searchTerms.push('soil', 'tractor', 'mechanization');
    if (challengeId === 'capital') searchTerms.push('funding', 'defi', 'investing');
    if (challengeId === 'inputs') searchTerms.push('seeds', 'fertilizer');
    
    const allItemKeywords = [...itemTags, ...itemWahaala].map(t => t.toLowerCase());
    
    return allItemKeywords.some(keyword => 
        searchTerms.some(term => keyword.includes(term) || term.includes(keyword))
    ) || allItemKeywords.length === 0; // If no tags, show it everywhere for now (fallback)
};

export async function getExploreFeed(section: ExploreSection, challengeId: string = 'all'): Promise<ExploreFeedItem[]> {
    const feedItems: ExploreFeedItem[] = [];

    // 1. INNOVATIONS -> Campaigns (Tier: innovation)
    if (section === 'innovations') {
        const campaigns = await getCampaigns({ tier: 'innovation' });
        campaigns.forEach((c: any) => {
            if (matchesChallenge(c.tags, c.wahaalaCategories, challengeId)) {
                feedItems.push({
                    id: c.id, type: 'innovations', title: c.title, description: c.description,
                    imageUrl: c.imageUrl, authorName: c.organizer, date: c.deadline,
                    meta: `Raised: ₦${(c.raisedAmount || 0).toLocaleString()}`,
                    isPremium: false, challengeTags: c.tags, originalData: c
                });
            }
        });
    }

    // 2. LIBRARY -> Learn Content (articles, reports)
    if (section === 'library') {
        const [articles, reports] = await Promise.all([
            getLearnContent({ swimlane: 'articles' }),
            getLearnContent({ swimlane: 'reports' })
        ]);
        [...articles, ...reports].forEach((l: any) => {
            if (matchesChallenge(l.tags, l.wahaalaCategories, challengeId)) {
                feedItems.push({
                    id: l.id, type: 'library', title: l.title, description: l.description,
                    imageUrl: l.thumbnailUrl, authorName: l.author.name, date: l.createdAt,
                    meta: l.readTime || l.duration,
                    isPremium: l.isPaid, challengeTags: l.tags, originalData: l
                });
            }
        });
    }

    // 3. COMMUNITY -> Members & Group Buys
    if (section === 'community') {
        const members = await getMembers();
        members.forEach((m: any) => {
            if (matchesChallenge([], m.wahaalaCategories, challengeId)) {
                feedItems.push({
                    id: m.id, type: 'community', title: m.name, description: m.bio,
                    imageUrl: m.avatarUrl || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', 
                    authorName: m.role.toUpperCase(), date: m.joinedAt,
                    meta: `${m.rating} ★ (${m.reviewCount} reviews)`,
                    isPremium: false, challengeTags: m.wahaalaCategories, originalData: m
                });
            }
        });
    }

    // 4. ACTIVITIES -> Meet Events
    if (section === 'activities') {
        const events = await getEvents();
        events.forEach((e: any) => {
            if (matchesChallenge([], e.wahaalaCategories, challengeId)) {
                feedItems.push({
                    id: e.id, type: 'activities', title: e.title, description: e.description,
                    imageUrl: e.imageUrl, authorName: e.hostName, date: e.date,
                    meta: e.isVirtual ? 'Virtual' : e.location,
                    isPremium: false, challengeTags: e.wahaalaCategories || [], originalData: e
                });
            }
        });
    }

    // 5. LIVESTREAMS -> Learn Content (livestreams)
    if (section === 'livestreams') {
        const streams = await getLearnContent({ swimlane: 'livestreams' });
        streams.forEach((s: any) => {
            if (matchesChallenge(s.tags, s.wahaalaCategories, challengeId)) {
                feedItems.push({
                    id: s.id, type: 'livestreams', title: s.title, description: s.description,
                    imageUrl: s.thumbnailUrl, authorName: s.author.name, date: s.scheduledAt || s.createdAt,
                    meta: s.liveStatus?.toUpperCase() || 'VOD',
                    isPremium: s.isPaid, challengeTags: s.tags, originalData: s
                });
            }
        });
    }

    // 6. JOBS -> Trade Listings (category: jobs)
    if (section === 'jobs') {
        const jobs = await getTradeListings({ category: 'jobs' });
        jobs.forEach((j: any) => {
            if (matchesChallenge([], j.wahaalaCategories, challengeId)) {
                feedItems.push({
                    id: j.id, type: 'jobs', title: j.title, description: j.description,
                    imageUrl: j.imageUrl, authorName: j.postedBy.name, date: j.postedAt,
                    meta: j.priceOrAsk,
                    isPremium: false, challengeTags: j.wahaalaCategories || [], originalData: j
                });
            }
        });
    }

    return feedItems;
}
