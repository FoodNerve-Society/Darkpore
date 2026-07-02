import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, CardActionArea, Chip, alpha } from '@mui/material';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/cms';
import { getKnowledgeMaterials } from '@/lib/db/knowledge';
import KnowledgeTeaser from './components/KnowledgeTeaser';
import ShowcaseCarousel from './components/ShowcaseCarousel';
import BentoGridTeaser from './components/BentoGridTeaser';
import CinematicHero from './components/CinematicHero';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { getChallengeUpdatesBySubcategories } from '@/lib/actions/db';
import PremiumButton from '@/components/PremiumButton';
import { prisma } from '@/lib/db/client';

export default async function InnovationsHomepage() {
  const headersList = await headers();
  const rawTenantId = headersList.get('x-tenant-id') || 'food';
  const tenantId = rawTenantId.includes('energy') ? 'energy' : 'food'; // Normalized
  const tenant = getTenantConfig(tenantId);
  const homepageConfig = tenant.com.homepage;

  // Gather all subcategory IDs to fetch coherent data matching the challenge pages
  const allSubcatIds: string[] = [];
  const subcatToChallengeMap: Record<string, { id: string, title: string }> = {};
  
  homepageConfig.challenges.forEach(b => {
    (b.subcategories || []).forEach(s => {
      allSubcatIds.push(s.id);
      subcatToChallengeMap[s.id] = { id: b.id, title: b.title };
    });
  });

  let rawUpdates: any[] = [];
  try {
    rawUpdates = await getChallengeUpdatesBySubcategories(allSubcatIds);
  } catch (e) {
    console.warn("SERVER LOG - Database connection failed, falling back to mock data.");
  }
  
  let marqueeItems = rawUpdates.map((u: any) => ({
    ...u,
    challengeTitle: subcatToChallengeMap[u.subcategoryId]?.title || 'Global Alert',
    challengeId: subcatToChallengeMap[u.subcategoryId]?.id || 'global'
  }));

  if (marqueeItems.length === 0) {
    marqueeItems = [
      { challengeTitle: '1. Land', challengeId: 'land', subcategoryId: 'third-party-mortgage', section: 'innovations', title: 'New Agritech Hub Launched in Nairobi', date: new Date().toISOString(), importance: 'high' },
      { challengeTitle: '3. Inputs', challengeId: 'inputs', subcategoryId: 'improved-crop-breeding', section: 'community', title: 'Seed Distribution Network Expands to 50k Farmers', date: new Date().toISOString(), importance: 'medium' },
      { challengeTitle: '4. Energy', challengeId: 'energy', subcategoryId: 'storage-refrigeration', section: 'library', title: 'Research Report: Cold Chain Innovations in East Africa', date: new Date().toISOString(), importance: 'high' },
      { challengeTitle: '6. Post-Harvest Loss', challengeId: 'loss', subcategoryId: 'tomato', section: 'livestreams', title: 'Commodity Trading Strategies Masterclass', date: new Date().toISOString(), importance: 'low' },
    ];
  }

  // Fetch recent learning materials from the simulated database
  let recentIntelligence: any[] = [];
  try {
    recentIntelligence = await getKnowledgeMaterials({
      tenantId: tenantId,
      limit: 20 // Fetch a good number so Client component can filter
    });
  } catch (e) {
    console.warn("SERVER LOG - Database connection failed, falling back to empty intelligence.");
  }

  // Pick all challenges for BentoGrid and fallback slideshow
  const allChallenges = homepageConfig.challenges;

  // Fetch real database stats and slideshow content for the Hero
  let learnContentCount = 142;
  let userCount = 12500;
  let slideshowItems: { image: string, title: string }[] = [];

  try {
    const [lcCount, uCount, recentLC] = await Promise.all([
      prisma.learnContent.count(),
      prisma.user.count(),
      prisma.learnContent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          article: {
            include: {
              blocks: {
                orderBy: { orderIndex: 'asc' }
              }
            }
          }
        }
      })
    ]);
    
    learnContentCount = lcCount;
    userCount = uCount;
    slideshowItems = recentLC.map((lc: any) => {
      // Find the first image block to use as thumbnail
      const imageBlock = lc.article?.blocks?.find((b: any) => b.type === 'image' && b.payload?.url);
      const imageUrl = imageBlock ? imageBlock.payload.url : (lc.thumbnailUrl || '');
      
      // Determine proper routing parameters
      const challengeId = subcatToChallengeMap[lc.subcategory]?.id || lc.category || 'land';
      const subcatId = lc.subcategory || 'third-party-mortgage';

      return {
        image: imageUrl,
        title: lc.title,
        link: `/innovations/${challengeId}/${subcatId}/learn/article/${lc.slug}`
      };
    });
  } catch (e) {
    console.warn("SERVER LOG - Failed to fetch hero stats from DB.");
  }

  // Fallback to static challenge images if DB is empty or fails
  if (slideshowItems.length === 0) {
    slideshowItems = allChallenges
      .filter((c: any) => c.imageUrl)
      .map((c: any) => ({
        image: c.imageUrl,
        title: c.title
      }));
  }

  console.log("SERVER LOG - Normalized Tenant ID:", tenantId);
  console.log("SERVER LOG - Recent Intelligence count:", recentIntelligence.length);

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      
      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: THE CINEMATIC HERO
          Full viewport, animated, glowing orbs, stats cards
      ═══════════════════════════════════════════════════════════ */}
      <CinematicHero 
        tenantName={tenant.name}
        headline={homepageConfig.heroHeadline}
        subheadline={homepageConfig.heroSubheadline}
        stats={{
          activeSolutions: learnContentCount,
          communitySize: userCount
        }}
        slideshowItems={slideshowItems}
      />


      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: LIVE UPDATES MARQUEE
          Auto-scrolling horizontal ticker of recent updates
      ═══════════════════════════════════════════════════════════ */}
      <Box sx={{ 
        py: 4, 
        bgcolor: '#050505',
        color: 'white',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 4, mb: 2 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff4444', mr: 1.5, animation: 'pulse 2s infinite', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.4 } } }} />
          <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: 3 }}>
            GLOBAL ALERTS
          </Typography>
        </Box>
        
        <Box sx={{
          display: 'flex',
          animation: 'marquee 40s linear infinite',
          '&:hover': { animationPlayState: 'paused' },
          '@keyframes marquee': {
            '0%': { transform: 'translateX(0)' },
            '100%': { transform: 'translateX(-50%)' },
          },
          width: 'max-content',
        }}>
          {/* Double the items for seamless infinite loop */}
          {[...marqueeItems, ...marqueeItems].map((item, idx) => {
            const eventDate = new Date(item.date);
            const today = new Date();
            
            // Heuristic for time-sensitive language
            const isToday = eventDate.toDateString() === today.toDateString();
            const isFuture = eventDate > today;
            
            let statusLabel = "POSTED";
            let statusValue = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            let statusColor = "rgba(255,255,255,0.4)";
            let valueColor = "rgba(255,255,255,0.7)";

            if (item.section === 'livestreams' || item.section === 'activities') {
              if (isToday || item.importance === 'high') {
                statusLabel = "HAPPENING";
                statusValue = "LIVE NOW";
                statusColor = "#00e676";
                valueColor = "#00e676";
              } else if (isFuture) {
                statusLabel = "STARTS";
                statusColor = "#ff9933";
                valueColor = "white";
              }
            } else if (item.section === 'jobs' || item.section === 'community') {
              if (isFuture || item.importance === 'high') {
                statusLabel = "CLOSES BY";
                statusColor = "#ff9933";
                valueColor = "white";
              }
            } else if (item.importance === 'high') {
               statusLabel = "ACTION REQ";
               statusColor = "#ff4444";
               valueColor = "white";
            }

            return (
              <Box key={idx} sx={{ 
                position: 'relative',
                background: 'linear-gradient(90deg, rgba(10,10,10,0.85) 0%, rgba(20,20,20,0.2) 100%)',
                backdropFilter: 'blur(8px)',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                borderBottom: `2px solid ${statusColor}`,
                transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
                '&:hover': {
                  background: 'linear-gradient(90deg, rgba(20,20,20,0.95) 0%, rgba(30,30,30,0.3) 100%)',
                },
                mr: 3,
                display: 'flex',
                alignItems: 'center',
                height: 64,
                pr: 4,
                pl: 3,
              }}>
                <Link href={`/${item.challengeId}/${item.subcategoryId}/${item.section}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%', gap: 16 }}>
                  
                  {/* Glowing Icon Hexagon */}
                  <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, mr: 1 }}>
                    <Box sx={{ 
                       width: 16, height: 16, bgcolor: statusColor, 
                       clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                       boxShadow: `0 0 12px ${statusColor}`,
                       animation: (statusLabel === 'HAPPENING' || statusLabel === 'ACTION REQ') ? 'urgentPulse 2s ease-in-out infinite' : 'none',
                    }} />
                  </Box>

                  {/* Status & Title Stack */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                    <Typography variant="caption" sx={{ color: statusColor, fontWeight: 900, letterSpacing: 1.5, fontSize: '0.6rem', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
                       {statusLabel === 'POSTED' ? 'NEW' : statusLabel} <span style={{ color: 'rgba(255,255,255,0.5)', margin: '0 4px' }}>//</span> <span style={{ color: valueColor, fontWeight: 600 }}>{statusValue}</span>
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: { xs: 200, sm: 300, md: 400, lg: 500 } }}>
                      {item.title}
                    </Typography>
                  </Box>

                  {/* Context Text */}
                  <Box sx={{ ml: 4, flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.1)', pl: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '0.5rem', letterSpacing: 1, mb: 0.2 }}>
                      CHALLENGE
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.65rem', letterSpacing: 1, textTransform: 'uppercase' }}>
                      {item.challengeTitle.replace(/^\d+\.\s*/, '')}
                    </Typography>
                  </Box>

                </Link>
              </Box>
            );
          })}
        </Box>
      </Box>


      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: THE CHALLENGES TEASER
          Dark manifesto excerpt + premium challenge cards
      ═══════════════════════════════════════════════════════════ */}
      <Box sx={{ 
        pt: { xs: 12, md: 18 }, 
        pb: { xs: 12, md: 18 }, 
        px: 2, 
        position: 'relative',
        bgcolor: '#050505', 
        color: 'white',
        overflow: 'hidden',
        '&::before': {
          content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(20, 20, 20, 0.8) 0%, #050505 100%)',
          zIndex: 0
        },
        // Subtle grid texture
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ maxWidth: '800px', mb: 10 }}>
            <Typography variant="overline" sx={{ color: 'error.main', fontWeight: 900, letterSpacing: 3, mb: 3, display: 'block' }}>
              THE CHALLENGES
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 4, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              We mapped the supply chain to isolate exact points of failure.
            </Typography>
            <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400, lineHeight: 1.7 }}>
              Keep scrolling to explore the systemic infrastructure deficits preventing scale. Each one has a dedicated dashboard with active solutions.
            </Typography>
          </Box>

          <Box sx={{ mt: 6 }}>
            <BentoGridTeaser challenges={allChallenges} />
          </Box>

          <Box sx={{ mt: 10, textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <Link href="/challenges" passHref style={{ textDecoration: 'none' }}>
              <PremiumButton 
                variant="outlined" 
                size="large"
                baseColor="white"
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.15)', 
                  px: 6, 
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)', boxShadow: '0 0 20px rgba(255,255,255,0.2)' },
                }}
              >
                See all {homepageConfig.challenges.length} Challenges
              </PremiumButton>
            </Link>
          </Box>
        </Container>
      </Box>


      {/* ═══════════════════════════════════════════════════════════
          SECTION 4: THE INNOVATIONS SHOWCASE
          Horizontal Scrollable Cinematic Projects
      ═══════════════════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: '#022c22', color: 'white', overflow: 'hidden' }}>
        {/* Section Header */}
        <Container maxWidth="lg" sx={{ pt: { xs: 10, md: 15 }, pb: 4 }}>
          <Box sx={{ maxWidth: '700px' }}>
            <Typography variant="overline" sx={{ color: 'primary.light', fontWeight: 900, letterSpacing: 3, mb: 2, display: 'block' }}>
              ACTIVE DEPLOYMENTS
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 3, lineHeight: 1.2 }}>
              We don&apos;t just fund startups. We build infrastructure.
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400, lineHeight: 1.7 }}>
              Scroll to explore the massive infrastructure projects currently gaining traction in our ecosystem.
            </Typography>
          </Box>
        </Container>

        {/* Interactive Showcase Carousel */}
        <ShowcaseCarousel projects={homepageConfig.showcaseProjects} />
      </Box>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5: THE KNOWLEDGE CENTER TEASER
          Premium intelligence cards (Client Component)
      ═══════════════════════════════════════════════════════════ */}
      <KnowledgeTeaser materials={recentIntelligence} />


      {/* ═══════════════════════════════════════════════════════════
          SECTION 6: THE SOCIETY GATEWAY
          Dark dramatic closer — the cross-domain hook
      ═══════════════════════════════════════════════════════════ */}
      <Box sx={{ 
        pt: { xs: 12, md: 16 }, 
        pb: { xs: 12, md: 16 }, 
        px: 2, 
        bgcolor: 'primary.main',
        color: 'primary.contrastText', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle radial glow */}
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
        }} />
        
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ mb: 4, display: 'inline-flex', p: 2.5, bgcolor: 'rgba(255,255,255,0.06)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }}>
            <LockOutlinedIcon sx={{ fontSize: 36, color: 'rgba(255,255,255,0.5)' }} />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 3 }}>
            Welcome to the Factory Floor.
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)', mb: 6, lineHeight: 1.7, maxWidth: '600px', mx: 'auto', fontWeight: 400 }}>
            {tenant.name}.com is just the public registry. The real work — deal rooms, trade floors, live operations — happens inside Society OS.
          </Typography>
          <Link href="/join" style={{ textDecoration: 'none' }}>
            <PremiumButton 
              variant="filled" 
              size="large" 
              baseColor="white"
              sx={{ 
                color: '#0a0a0a', 
                px: 6, 
                py: 2, 
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: '0 8px 30px rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              }}
            >
              Join the {tenant.name} Society
            </PremiumButton>
          </Link>
        </Container>
      </Box>

    </Box>
  );
}
