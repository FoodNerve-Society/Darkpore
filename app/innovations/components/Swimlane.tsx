'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Typography, Container, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Link from 'next/link';
import { EcosystemCard } from './EcosystemCard';
import { EcosystemItem } from './TabbedHero';

export default function Swimlane({ lane }: { lane: any }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTickerIndex, setActiveTickerIndex] = useState(0);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
  };
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
  };

  // Generate mock items based on the lane type if real items aren't provided
  const itemsToDisplay: EcosystemItem[] = lane.items && lane.items.length > 0 ? lane.items : Array.from({ length: Math.max(1, lane.newCount) }).map((_, i) => {
    const isArticle = lane.title.includes('Articles') || lane.title.includes('Top Stories');
    const isLivestream = lane.title.includes('Livestreams');
    const isJob = lane.title.includes('Jobs') || lane.title.includes('Internships');
    const isOpportunity = lane.title.includes('Opportunities') || lane.title.includes('Volunteering');

    let itemType: any = 'Intelligence';
    if (isLivestream) itemType = 'Activities';
    else if (isJob) itemType = 'Jobs';
    else if (isOpportunity) itemType = 'Opportunities';

    const sampleArticleTitles = [
      'Can community savings groups transform food security?',
      'Why Nigeria loses so many tomatoes before they reach the market',
      'How insecurity is reshaping food trade across the Sahel',
      'Could one egg a day transform child nutrition in rural communities?',
      'Why fertilizer remains unaffordable for smallholder farmers',
      'Cold storage infrastructure: Solving post-harvest losses',
    ];

    const sampleJobTitles = [
      'Cold-Chain Logistics Operator',
      'Senior Agronomist & Soil Specialist',
      'Food Supply Chain Data Analyst',
      'Community Farm Manager',
      'Agricultural Equipment Technician',
      'Post-Harvest Research Fellow',
    ];

    const sampleLivestreamTitles = [
      'What This Week’s Three Stories Reveal About the Future of Food',
      'Masterclass: Scaling Solar Cold Rooms Across West Africa',
      'Financing AgTech Startups: VC Insights & Direct Grants',
      'Reducing Food Waste in Open Air Markets',
    ];

    const sampleAuthors = ['Amaka Okafor', 'Chinedu Eze', 'Dr. Tobi Adeyemi', 'Fatima Bello', 'Kelechi Iheanacho'];
    const sampleOrgs = ['FoodNerve Operations', 'AgroTech Global', 'GreenField Hub', 'Sahel Food Systems', 'FarmTrust Cooperative'];

    const title = isJob 
      ? sampleJobTitles[i % sampleJobTitles.length]
      : isLivestream
      ? sampleLivestreamTitles[i % sampleLivestreamTitles.length]
      : sampleArticleTitles[i % sampleArticleTitles.length];

    const sampleEras = ['Present', 'Past', 'Future'];
    const sampleBlockTags = [
      ['🌾 Cold Storage Deficit', '📉 34% Post-Harvest Loss', '💡 Solar Chilling Unit', '📊 Field Data 2026'],
      ['🥚 Rural Child Nutrition', '📈 1 Egg / Day Trial', '🤝 Community Savings', '🔍 Ogun State Findings'],
      ['🚜 Fertilizer Price Spike', '💰 $420 / Ton Impact', '🛠️ Soil Micro-Dosing', '📌 Contract Farming'],
      ['🚚 Sahel Trade Route', '⚠️ Border Bottlenecks', '🛰️ Satellite Tracking', '⚡ Fast-Track Logistics'],
    ];

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${i + 1}a9x`;

    return {
      id: `mock-${lane.id}-${i}`,
      title,
      type: itemType,
      thumbnailUrl: isLivestream 
        ? 'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?auto=format&fit=crop&q=80&w=800'
        : 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=800',
      link: isJob ? '/careers' : isLivestream ? '/calendar' : `/learn/article/${slug}`,
      slug,
      authorOrOperator: sampleAuthors[i % sampleAuthors.length],
      organizationName: sampleOrgs[i % sampleOrgs.length],
      authorAvatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`,
      categoryLabel: isJob ? (i % 2 === 0 ? 'FULL-TIME' : 'REMOTE') : isLivestream ? 'LIVESTREAM' : 'SAVINGS',
      era: sampleEras[i % sampleEras.length],
      tags: sampleBlockTags[i % sampleBlockTags.length],
      metaInfo: isJob ? 'Closing in 5 days' : isLivestream ? (i % 3 === 0 ? '🔴 Happening Now' : i % 3 === 1 ? 'Wed • 7:00 PM WAT' : '▶️ Replay Available') : `${(i + 4) * 2} min read`,
      readCount: `${(i + 2) * 1.4}k reads`,
      locationOrSalary: isJob ? `📍 Lagos, NG • 💰 $${(i + 1) * 800}/mo` : undefined,
    };
  });

  // Event-driven sequencing: no timer, each card drives the next
  const advanceToNextCard = useCallback(() => {
    setActiveTickerIndex((prev) => (prev + 1) % Math.max(1, itemsToDisplay.length));
  }, [itemsToDisplay.length]);

  // Smoothly scroll the newly active card to center
  useEffect(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const child = container.children[activeTickerIndex] as HTMLElement | undefined;
    if (!child) return;

    const scrollTarget = child.offsetLeft - (container.clientWidth / 2) + (child.clientWidth / 2);
    container.scrollTo({
      left: Math.max(0, scrollTarget),
      behavior: 'smooth',
    });
  }, [activeTickerIndex]);

  return (
    <Box id={lane.id} sx={{ mb: { xs: 2, md: 3 }, scrollMarginTop: '120px' }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 6 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 1.5, md: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
            <Box sx={{ width: { xs: 8, md: 12 }, height: { xs: 8, md: 12 }, borderRadius: '50%', bgcolor: lane.color }} />
            <Link href={`/categories/${lane.id.replace('lane-', '')}`} style={{ textDecoration: 'none' }}>
              <Typography 
                variant="h4" 
                sx={{ fontWeight: 900, color: '#0f172a', fontSize: { xs: '1.05rem', md: '1.6rem' }, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
              >
                {lane.title}
              </Typography>
            </Link>
            <Box sx={{ bgcolor: `${lane.color}15`, color: lane.color, px: { xs: 1, md: 1.5 }, py: { xs: 0.25, md: 0.5 }, borderRadius: '8px', fontSize: { xs: '0.65rem', md: '0.85rem' }, fontWeight: 800, display: { xs: 'none', sm: 'block' } }}>
              {lane.newCount} New
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Link href={`/categories/${lane.id.replace('lane-', '')}`} style={{ textDecoration: 'none' }}>
              <Box sx={{ 
                display: 'flex', alignItems: 'center', gap: 0.5, 
                color: lane.color, 
                fontWeight: 800, fontSize: { xs: '0.75rem', md: '0.9rem' },
                transition: 'all 0.2s',
                px: { xs: 1.5, md: 2 }, py: { xs: 0.75, md: 1 },
                borderRadius: '999px',
                bgcolor: `${lane.color}15`,
                '&:hover': { bgcolor: `${lane.color}25`, transform: 'translateX(4px)' }
              }}>
                Archive <ArrowForwardIosIcon sx={{ fontSize: '0.8rem' }} />
              </Box>
            </Link>
          </Box>          
        </Box>
        
        {/* Scroll container */}
        <Box sx={{ position: 'relative', width: '100%', mr: 'calc(-50vw + 50%)', py: 4, my: -4 }}>
          <Box 
            ref={scrollRef}
            sx={{ 
              display: 'flex', 
              gap: 3, 
              overflowX: 'auto', 
              pt: 2,
              pb: 6,
              px: 2,
              mx: -2,
              scrollBehavior: 'smooth',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {itemsToDisplay.map((item, idx) => (
              <Box key={item.id} sx={{ width: lane.id === 'lane-livestreams' ? { xs: 320, md: 480 } : lane.id === 'lane-top-stories' ? { xs: 260, md: 300 } : { xs: 280, md: 360 }, flexShrink: 0, pt: 1 }}>
                <EcosystemCard 
                  item={item} 
                  themeColor={lane.color} 
                  isFirst={idx === 0}
                  isLast={idx === itemsToDisplay.length - 1}
                  tickerIndex={idx}
                  activeTickerIndex={activeTickerIndex}
                  variant={lane.id === 'lane-top-stories' ? 'compact' : 'default'}
                  onTickerComplete={advanceToNextCard}
                />
              </Box>
            ))}

            {/* VIEW ALL CARD */}
            <Box 
              component={Link}
              href={`/categories/${lane.id.replace('lane-', '')}`}
              sx={{ 
                minWidth: { xs: '160px', sm: '220px' }, 
                scrollSnapAlign: 'start',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#f8fafc',
                borderRadius: { xs: 2, sm: 4 },
                border: '2px dashed #e2e8f0',
                textDecoration: 'none',
                color: lane.color,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: lane.color,
                  color: '#ffffff',
                  borderStyle: 'solid',
                  borderColor: lane.color,
                  boxShadow: `0 20px 40px -10px ${lane.color}80`
                }
              }}
            >
              <ArrowForwardIosIcon sx={{ fontSize: '2rem', mb: 2 }} />
              <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                View All 100+
              </Typography>
            </Box>
            
            {/* Right padding spacer to ensure last item can scroll fully into view */}
            <Box sx={{ minWidth: { xs: '20px', md: '50vw' } }} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
