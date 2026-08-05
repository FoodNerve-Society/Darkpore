import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, CardActionArea, Chip, alpha } from '@mui/material';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/cms';
import { getKnowledgeMaterials } from '@/lib/db/knowledge';
import KnowledgeTeaser from './components/KnowledgeTeaser';
import ShowcaseCarousel from './components/ShowcaseCarousel';
import BentoGridTeaser from './components/BentoGridTeaser';
import RadarIndexOverview from './components/RadarIndexOverview';
import CinematicHero from './components/CinematicHero';
import CommandCenterHero from './components/CommandCenterHero';
import Swimlane from './components/Swimlane';
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

  // Fetch Today's Calendar Events for the Hero Slider
  let marqueeItems: any[] = [];
  try {
    const { fetchCalendarEvents } = await import('@/lib/actions/calendar');
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const result = await fetchCalendarEvents({
      tenantId: 'foodnerve',
      startDate: todayStart.toISOString(),
      endDate: todayEnd.toISOString(),
      limit: 10
    });

    if (result.success && result.events) {
      marqueeItems = result.events.map(evt => ({
        ...evt,
        categoryLabel: evt.sourceType === 'job' ? 'DEADLINE' : evt.sourceType === 'livestream' ? 'LIVESTREAM' : evt.category?.toUpperCase() || 'EVENT',
        startDate: evt.date,
        endDate: evt.endDate,
        imageUrl: evt.imageUrl || "https://images.unsplash.com/photo-1591696205602-2f950c417cb9?auto=format&fit=crop&q=80&w=800", // Fallback imagery
      }));
    }
  } catch (e) {
    console.warn("SERVER LOG - Failed to fetch today's calendar events.", e);
  }

  // We no longer inject fake/mocked data if marqueeItems is empty.
  // The frontend component handles the empty array gracefully by rendering a STANDBY state.

  // Fetch recent learning materials directly from the database
  let recentIntelligence: any[] = [];
  try {
    const recentLC = await prisma.learnContent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        article: {
          include: {
            blocks: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        }
      }
    });

    recentIntelligence = recentLC.map((lc: any) => {
      // Find the first image block to use as thumbnail
      const imageBlock = lc.article?.blocks?.find((b: any) => b.type === 'image' && b.payload?.url);
      return {
        id: lc.id,
        challengeId: lc.challengeId || 'global',
        subcategoryId: lc.subcategory || 'general',
        slug: lc.slug,
        title: lc.title,
        type: lc.type, // 'article', 'video', 'class', 'livestream'
        thumbnailUrl: lc.thumbnailUrl || imageBlock?.payload?.url || '/images/default-thumbnail.jpg',
        author: lc.authorName || 'Society Architect',
        dateAdded: lc.createdAt,
        readTime: lc.type === 'video' || lc.type === 'livestream' ? 'Watch' : '5 min read',
        link: `/${lc.challengeId || 'global'}/${lc.subcategory || 'general'}/learn/article/${lc.slug}`
      };
    });

    if (recentIntelligence.length === 0) {
      const mockData = await getKnowledgeMaterials({ tenantId, limit: 20 });
      // Map mock types to the new types if needed
      recentIntelligence = mockData.map(m => ({
        ...m,
        type: m.type === 'pdf' ? 'class' : m.type,
        link: `/${m.challengeId || 'global'}/${(m as any).subcategory || 'general'}/learn/article/${m.slug}`
      }));
    }
  } catch (e) {
    console.warn("SERVER LOG - Database connection failed, falling back to mock intelligence.");
    const mockData = await getKnowledgeMaterials({ tenantId, limit: 20 });
    recentIntelligence = mockData.map(m => ({
      ...m,
      type: m.type === 'pdf' ? 'class' : m.type,
      link: `/${m.challengeId || 'global'}/${(m as any).subcategory || 'general'}/learn/article/${m.slug}`
    }));
  }

  // Pick all challenges for BentoGrid and fallback slideshow
  const allChallenges = homepageConfig.challenges;

  // Fetch real database stats and slideshow content for the Hero
  let statsObj = { articles: 0, livestreams: 0, jobs: 0, missions: 0 };
  let learnContentCount = 142;
  let userCount = 12500;
  let slideshowItems: { image: string, title: string }[] = [];

  try {
    const [lcCount, uCount, recentLC, articlesCount, livestreamsCount, jobsCount, missionsCount] = await Promise.all([
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
      }),
      prisma.learnContent.count({ where: { status: 'published' } }),
      prisma.calendarEvent.count({ where: { sourceType: 'livestream', status: { in: ['upcoming', 'live'] } } }),
      prisma.tradeListing.count({ where: { category: { in: ['jobs', 'volunteer', 'internship'] }, status: 'active' } }),
      prisma.campaign.count({ where: { status: 'active_deployment' } })
    ]);
    
    statsObj = { articles: articlesCount, livestreams: livestreamsCount, jobs: jobsCount, missions: missionsCount };
    
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
        link: `/${challengeId}/${subcatId}/learn/article/${lc.slug}`,
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
      link: `/projects`
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

  // Fetch Jobs & Volunteering Opportunities
  let activeOpportunities: any[] = [];
  try {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const rawListings = await prisma.tradeListing.findMany({
      where: { 
        category: { in: ['jobs', 'volunteer'] },
        status: 'active',
        postedAt: { gte: tenDaysAgo } // Auto-archive jobs older than 10 days
      },
      include: { postedBy: true, organization: true },
      take: 10,
      orderBy: { postedAt: 'desc' }
    });
    
    activeOpportunities = rawListings.map((l: any) => {
        const isVolunteer = l.category === 'volunteer' || (l.category === 'jobs' && l.metadata?.commitment === 'volunteer');
        const isInternship = l.category === 'jobs' && l.metadata?.commitment === 'internship';
        const typeLabel = isVolunteer ? 'Volunteering' : isInternship ? 'Internships' : 'Jobs';
        return {
          id: l.id,
          title: l.title,
          type: typeLabel,
          imageUrl: l.imageUrl || '/images/default-thumbnail.jpg',
          author: l.postedBy?.name || l.organization?.name || 'FoodNerve Network',
          metric: isVolunteer ? `${l.npReward || l.metadata?.npAmount || 'Earn'} NP` : l.priceOrAsk,
          link: `/careers/${l.id}`
        };
      });
  } catch (e) {
    console.warn("SERVER LOG - Failed to fetch trade listings from DB.", e);
  }

  // Group mixed ecosystem items by Category for the TabbedHero
  const ecosystemCategories = homepageConfig.challenges.map((c: any) => {
    // 1. Intelligence Items
    const intelligenceItems = recentIntelligence
      .filter((ri: any) => ri.challengeId === c.id)
      .map((ri: any) => ({
        id: `intel-${ri.id}`,
        type: 'Intelligence' as any,
        title: ri.title,
        slug: ri.slug,
        thumbnailUrl: ri.thumbnailUrl,
        link: ri.link,
        authorOrOperator: ri.author,
        metaInfo: ri.readTime
      }));

    // 2. Innovation Items
    // Since activeDeployments don't currently have a strict challengeId mapped in the DB in this demo,
    // we randomly distribute them or show them across all categories for demo purposes.
      const innovationItems = activeDeployments.map((ad: any) => ({
        id: `innov-${ad.id}`,
        type: 'Innovations' as any,
        title: ad.title,
        thumbnailUrl: ad.imageUrl || '/images/default-thumbnail.jpg',
        link: ad.link,
        authorOrOperator: ad.operator.name,
        metaInfo: ad.traction
    }));

    // 3. Jobs and Volunteer Opportunities
    const opportunityItems = activeOpportunities.map((opp: any) => ({
        id: `opp-${opp.id}`,
        type: opp.type as any,
        title: opp.title,
        thumbnailUrl: opp.imageUrl,
        link: opp.link,
        authorOrOperator: opp.author,
        metaInfo: opp.metric
    }));

    // Mix them up (Innovations first, then Opportunities, then Intelligence)
    const items = [...innovationItems, ...opportunityItems, ...intelligenceItems];

    // Elegant, saturated theme colors for each category
    const categoryColors = ['#166534', '#b45309', '#4338ca', '#b91c1c', '#0f766e', '#86198f', '#0369a1'];
    const themeColor = c.color || categoryColors[homepageConfig.challenges.indexOf(c) % categoryColors.length];

    return {
      id: c.id,
      title: c.title,
      themeColor,
      items
    };
  });

  // ── HYBRID RANKING HIERARCHY FOR EDITORIAL HERO (VERSION B) ───────
  let editorialFeaturedStory: any | null = null;
  let editorialTopStories: any[] = [];

  try {
    const publishedArticles = await prisma.learnContent.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        article: {
          include: {
            blocks: { orderBy: { orderIndex: 'asc' } }
          }
        }
      }
    });

    if (publishedArticles.length > 0) {
      const scoredArticles = publishedArticles.map((lc: any) => {
        const firstImgBlock = lc.article?.blocks?.find((b: any) => b.type === 'image' && b.payload?.url);
        const imgUrl = lc.thumbnailUrl || firstImgBlock?.payload?.url || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=1200';

        const likes = lc.likes || 0;
        const views = lc.views || 0;
        const isVerifiedBonus = lc.isVerified ? 500 : 0;
        const isHighImportance = lc.timeframe === 'high' || lc.category === 'featured';

        // Ranking score formula: Admin High Priority (10000) > Verified (500) + Likes*3 + Views
        const score = (likes * 3) + views + isVerifiedBonus + (isHighImportance ? 10000 : 0);

        let tags: string[] = [];
        try {
          if (lc.article?.blocks && lc.article.blocks.length > 0) {
            tags = lc.article.blocks.map((b: any) => {
              try {
                const payload = typeof b.content === 'string' ? JSON.parse(b.content) : b.content;
                let textVal = '';
                if (b.blockType === 'subheading') textVal = payload?.text;
                else if (b.blockType === 'exec_summary') textVal = payload?.point1 || payload?.point2;
                else if (b.blockType === 'highlight_card') textVal = payload?.caption || payload?.label;
                else if (b.blockType === 'core_interactive') textVal = payload?.heading;
                else if (b.blockType === 'myth_fact') textVal = payload?.pairs?.[0]?.myth || payload?.pairs?.[0]?.fact;
                else if (b.blockType === 'pull_quote') textVal = payload?.quote;
                else if (b.blockType === 'live_poll') textVal = payload?.question;
                else if (b.blockType === 'strategic_directive') textVal = payload?.urgencyLevel || payload?.point1;

                if (typeof textVal === 'string' && textVal.trim().length > 0) {
                  const clean = textVal.replace(/<[^>]*>?/gm, '').trim();
                  return clean.length > 45 ? clean.substring(0, 42) + '...' : clean;
                }
              } catch (err) {}
              // Do not fallback to block name, so we don't just see "IMAGE"
              return null;
            }).filter((t: any) => t && t.length > 3);
          }
        } catch(e) {}

        return {
          id: lc.id,
          title: lc.title,
          summary: lc.description,
          imageUrl: imgUrl,
          authorName: lc.authorName || 'FoodNerve Editorial',
          authorAvatarUrl: lc.authorAvatarUrl || '/images/default-avatar.png',
          readTime: lc.article?.readTime || '6 min read',
          categoryLabel: (lc.subcategory || lc.category || 'ANALYSIS').toUpperCase(),
          link: `/learn/article/${lc.slug}`,
          score,
          createdAt: lc.createdAt,
          tags
        };
      });

      // Sort by score descending
      scoredArticles.sort((a, b) => b.score - a.score);

      editorialFeaturedStory = scoredArticles[0];
      editorialTopStories = scoredArticles.slice(1, 5);
    }
  } catch (e) {
    console.warn("SERVER LOG - Failed to fetch editorial ranked stories from DB.", e);
  }

  return (
    <Box sx={{ bgcolor: '#050505', minHeight: '100vh' }}>
      
      {/* ═══════════════════════════════════════════════════════════
          THE COMMAND CENTER HOMEPAGE
      ═══════════════════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: '#ffffff' }}>
        <CommandCenterHero 
          globalAlerts={marqueeItems}
          stats={statsObj}
        />
      </Box>

      <Box sx={{ bgcolor: '#ffffff', py: 8 }}>
        {[
          { 
            id: 'lane-top-stories', 
            title: 'Top Stories', 
            color: '#dc2626', 
            newCount: 5,
            items: (editorialTopStories && editorialTopStories.length > 0)
              ? [editorialFeaturedStory, ...editorialTopStories].filter(Boolean).map((s: any) => ({
                  id: s.id,
                  type: 'Intelligence',
                  title: s.title,
                  thumbnailUrl: s.imageUrl || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=1200',
                  link: s.link,
                  authorOrOperator: s.authorName || 'FoodNerve Editorial',
                  authorAvatarUrl: s.authorAvatarUrl,
                  categoryLabel: s.categoryLabel || 'TOP STORY',
                  metaInfo: s.readTime || '5 min read',
                  tags: s.tags,
                }))
              : undefined
          },
          { id: 'lane-articles', title: 'Latest Articles', color: '#3b82f6', newCount: 12 },
          { id: 'lane-livestreams', title: 'Livestreams', color: '#f59e0b', newCount: 3 },
          { id: 'lane-jobs', title: 'Careers & Opportunities', color: '#10b981', newCount: 18 },
          { id: 'lane-missions', title: 'Missions', color: '#ec4899', newCount: 2 }
        ].map((lane) => {
          if (lane.id === 'lane-top-stories') {
            return <Swimlane key={lane.id} lane={lane} />;
          }
          // Generate consolidated items for careers
          if (lane.id === 'lane-jobs') {
            const combinedItems = activeOpportunities.map((opp: any) => ({
              id: opp.id,
              type: opp.type,
              title: opp.title,
              authorOrOperator: opp.author,
              locationOrSalary: opp.location || 'Remote',
              metaInfo: opp.metric,
              link: opp.link,
              thumbnailUrl: opp.imageUrl
            }));
            return <Swimlane key={lane.id} lane={{ ...lane, items: combinedItems }} />;
          }
          // Generate basic items for missions
          if (lane.id === 'lane-missions') {
            const missionItems = activeDeployments.map((dep: any) => ({
              id: dep.id,
              type: dep.type,
              title: dep.title,
              authorOrOperator: dep.operator?.name || 'FoodNerve Society',
              metaInfo: dep.traction,
              thumbnailUrl: dep.imageUrl || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=800',
              link: dep.link
            }));
            return <Swimlane key={lane.id} lane={{ ...lane, items: missionItems }} />;
          }
          return <Swimlane key={lane.id} lane={lane} />;
        })}
      </Box>

      {/* RADAR INDEX OVERVIEW SECTION */}
      <RadarIndexOverview />


      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: THE CHALLENGES TEASER
          Dark manifesto excerpt + premium challenge cards
      ═══════════════════════════════════════════════════════════ */}
      <Box id="section-challenges" sx={{ 
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
      <Box id="section-deployments" sx={{ bgcolor: '#022c22', color: 'white', overflow: 'hidden' }}>
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
      <Box id="section-knowledge">
        <KnowledgeTeaser materials={recentIntelligence} />
      </Box>


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
