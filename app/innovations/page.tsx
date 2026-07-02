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
    const upcomingEvents = await prisma.learnContent.findMany({
      where: {
        subcategory: { in: allSubcatIds },
        targetDate: { gte: new Date() }
      },
      orderBy: { targetDate: 'asc' },
      take: 15
    });

    rawUpdates = upcomingEvents.map(event => ({
      title: event.title,
      date: event.targetDate,
      section: event.type === 'livestream' || event.type === 'class' ? 'livestreams' : 'innovations',
      importance: 'high',
      challengeTitle: subcatToChallengeMap[event.subcategory || '']?.title || 'Global Alert',
      challengeId: subcatToChallengeMap[event.subcategory || '']?.id || 'global',
      link: `/innovations/${subcatToChallengeMap[event.subcategory || '']?.id || 'global'}/${event.subcategory}/learn/article/${event.slug}`
    }));
  } catch (e) {
    console.warn("SERVER LOG - Database connection failed, falling back to mock data.", e);
  }
  
  let marqueeItems = rawUpdates;

  // We no longer inject fake/mocked data if marqueeItems is empty.
  // The frontend component handles the empty array gracefully by rendering a STANDBY state.

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
        link: `/innovations/${challengeId}/${subcatId}/learn/article/${lc.slug}`,
        updatedAt: lc.updatedAt,
        createdAt: lc.createdAt
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

  // Fetch Live Active Deployments
  let activeDeployments: any[] = [];
  try {
    const rawCampaigns = await prisma.campaign.findMany({
      where: { status: 'active_deployment' },
      include: { organizer: true },
      take: 5
    });
    
    // Map to the ShowcaseCarousel props format
    activeDeployments = rawCampaigns.map((c: any) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      imageUrl: c.imageUrl,
      type: c.tier === 'initiative' ? 'Initiative' : c.tier === 'innovation' ? 'Innovation' : 'Venture',
      origin: c.originTag || 'Core Deployment',
      operator: {
        name: c.organizer?.name || 'Society Hub',
        avatarUrl: c.organizer?.avatarUrl || '/images/default-avatar.png'
      },
      traction: c.tractionMetric || 'Active Operations',
      link: `/support/${c.id}`
    }));
  } catch (e) {
    console.warn("SERVER LOG - Failed to fetch active deployments from DB.", e);
  }

  // Fallback to static CMS data if the database is completely empty
  if (activeDeployments.length === 0) {
    activeDeployments = homepageConfig.showcaseProjects.map((p: any) => ({
      ...p,
      type: 'Venture',
      origin: 'Core Platform',
      operator: { name: 'Society Base', avatarUrl: '/images/default-avatar.png' },
      traction: 'Recently Deployed'
    }));
  }

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
        py: marqueeItems.length === 0 ? 3 : 4, 
        bgcolor: '#050505',
        color: 'white',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        {marqueeItems.length === 0 ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: 3, display: 'block', mb: 0.5 }}>
              GLOBAL ALERTS
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', fontSize: '0.9rem' }}>
              System Alerts — Monitoring Ecosystem... Check back for time updates.
            </Typography>
          </Box>
        ) : (
          <>
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
              {[...marqueeItems, ...marqueeItems].map((item: any, idx) => {
                let statusLabel = 'ACTIVE';
                let statusColor = '#ffffff';

                if (item.date) {
                  const diffDays = Math.ceil((new Date(item.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                  if (diffDays < 3) {
                    statusLabel = 'HAPPENING';
                    statusColor = '#ff1744';
                  } else if (diffDays < 7) {
                    statusLabel = 'ACTION REQ';
                    statusColor = '#ff9100';
                  } else {
                    statusLabel = 'UPCOMING';
                    statusColor = '#2196f3';
                  }
                }

                return (
                  <Box key={idx} sx={{ 
                    position: 'relative',
                    background: 'rgba(15, 15, 15, 0.6)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '100px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                    transition: 'all 0.4s cubic-bezier(.4,0,.2,1)',
                    '&:hover': {
                      background: 'rgba(25, 25, 25, 0.9)',
                      borderColor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-2px)'
                    },
                    mr: 4,
                    display: 'flex',
                    alignItems: 'center',
                    height: 54,
                    pr: 4,
                    pl: 1.5,
                    my: 2,
                  }}>
                    <Link href={item.link || `/${item.challengeId}/${item.subcategoryId}/${item.section}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%', gap: 12 }}>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <Box sx={{ 
                           width: 36, height: 36, 
                           borderRadius: '50%',
                           bgcolor: alpha(statusColor, 0.15),
                           border: `1px solid ${alpha(statusColor, 0.5)}`,
                           display: 'flex', alignItems: 'center', justifyContent: 'center',
                           boxShadow: `0 0 12px ${alpha(statusColor, 0.4)}`,
                        }}>
                           <Box sx={{
                               width: 8, height: 8, borderRadius: '50%', bgcolor: statusColor,
                               animation: (statusLabel === 'HAPPENING' || statusLabel === 'ACTION REQ') ? 'urgentPulse 2s ease-in-out infinite' : 'none',
                           }} />
                        </Box>
                      </Box>

                      {/* Status & Title Stack */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                        <Typography variant="caption" sx={{ color: statusColor, fontWeight: 900, letterSpacing: 1.5, fontSize: '0.6rem', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
                           {statusLabel} <span style={{ color: 'rgba(255,255,255,0.5)', margin: '0 4px' }}>//</span>
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'var(--font-dosis)', fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: { xs: 200, sm: 300, md: 400, lg: 500 } }}>
                          {item.title}
                        </Typography>
                      </Box>

                      {/* Context Text */}
                      {item.challengeTitle && (
                        <Box sx={{ ml: 4, flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.1)', pl: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontWeight: 800, fontSize: '0.5rem', letterSpacing: 1, mb: 0.2 }}>
                            CHALLENGE
                          </Typography>
                          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.65rem', letterSpacing: 1, textTransform: 'uppercase' }}>
                            {item.challengeTitle.replace(/^\d+\.\s*/, '')}
                          </Typography>
                        </Box>
                      )}

                    </Link>
                  </Box>
                );
              })}
            </Box>
          </>
        )}
      </Box>


      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: THE CHALLENGES TEASER
          Dark manifesto excerpt + premium challenge cards
      ═══════════════════════════════════════════════════════════ */}
      <Box sx={{ 
        pt: { xs: 4, md: 6 }, 
        pb: { xs: 4, md: 5 }, 
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
          <Box sx={{ maxWidth: '800px', mb: 3 }}>
            <Typography variant="overline" sx={{ color: 'error.main', fontWeight: 900, letterSpacing: 3, mb: 1, display: 'block' }}>
              THE CHALLENGES
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, lineHeight: 1.1, letterSpacing: '-0.02em', fontSize: { xs: '2rem', md: '2.5rem' } }}>
              Systemic Fault Lines Isolated.
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400, lineHeight: 1.6, fontSize: '1rem' }}>
              Explore the core infrastructure deficits preventing scale.
            </Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <BentoGridTeaser challenges={allChallenges} />
          </Box>

          <Box sx={{ mt: 4, textAlign: 'center', position: 'relative', zIndex: 2 }}>
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
                  py: 1.5,
                  fontSize: '0.9rem',
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
        <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 10 }, pb: 4 }}>
          <Box sx={{ maxWidth: '700px' }}>
            <Typography variant="overline" sx={{ color: 'primary.light', fontWeight: 900, letterSpacing: 3, mb: 1, display: 'block' }}>
              ACTIVE DEPLOYMENTS
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, lineHeight: 1.1 }}>
              Building core infrastructure.
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400, lineHeight: 1.6 }}>
              Explore the massive operational deployments gaining traction.
            </Typography>
          </Box>
        </Container>

        {/* Interactive Showcase Carousel */}
        <ShowcaseCarousel projects={activeDeployments} />
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
