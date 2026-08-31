import React from 'react';

export const dynamic = 'force-dynamic';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, CardActionArea, Chip, alpha } from '@mui/material';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/cms';
import { getKnowledgeMaterials } from '@/lib/db/knowledge';
import KnowledgeTeaser from './components/KnowledgeTeaser';
import ShowcaseCarousel from './components/ShowcaseCarousel';
import BentoGridTeaser from './components/BentoGridTeaser';
import RadarIndexOverview from './components/RadarIndexOverview';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import CinematicHero from './components/CinematicHero';
import CommandCenterHero from './components/CommandCenterHero';
import SocietyGatewayCTA from './components/SocietyGatewayCTA';
import Swimlane from './components/Swimlane';
import EmailCaptureTrigger from './components/EmailCaptureTrigger';
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
      where: { status: 'published' },
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
        link: `/learn/article/${lc.slug}`,
        blocks: lc.article?.blocks || []
      };
    });

    if (recentIntelligence.length === 0) {
      // Do not fallback to mock data, just show the empty state skeleton
      // so the user knows there is no real data yet.
    }
  } catch (e) {
    console.warn("SERVER LOG - Database connection failed, returning empty intelligence.");
  }

  // Pick all challenges for BentoGrid and fallback slideshow
  const allChallenges = homepageConfig.challenges;

  // Fetch real database stats and slideshow content for the Hero
  let statsObj = { articles: 0, livestreams: 0, jobs: 0, missions: 0, users: 0 };
  let learnContentCount = 142;
  let userCount = 12500;
  let slideshowItems: { image: string, title: string }[] = [];

  try {
    const [lcCount, uCount, recentLC, articlesCount, livestreamsCount, jobsCount, missionsCount] = await Promise.all([
      prisma.learnContent.count(),
      prisma.user.count(),
      prisma.learnContent.findMany({
        where: { status: 'published' },
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
      prisma.tradeListing.count({ where: { category: { in: ['jobs', 'job', 'volunteer', 'internship', 'internships'] }, status: 'active' } }),
      prisma.campaign.count({ where: { status: 'active_deployment' } })
    ]);
    
    statsObj = { articles: articlesCount, livestreams: livestreamsCount, jobs: jobsCount, missions: missionsCount, users: uCount };
    
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

  // Fetch Live Jobs & Volunteering Opportunities
  let activeOpportunities: any[] = [];
  try {
    const rawListings = await prisma.tradeListing.findMany({
      where: { 
        category: { in: ['jobs', 'job', 'volunteer', 'internship', 'internships'] },
        status: 'active'
      },
      include: { postedBy: true, organization: true },
      take: 20,
      orderBy: { postedAt: 'desc' }
    });
    
    activeOpportunities = rawListings.map((l: any) => {
        const isVolunteer = l.category === 'volunteer';
        const isInternship = l.category === 'internship' || l.category === 'internships';
        const typeLabel = isVolunteer ? 'Volunteering' : isInternship ? 'Internships' : 'Jobs';
        const companyLogo = l.organization?.logoUrl || l.postedBy?.avatarUrl || '';
        const authorName = l.organization?.name || l.postedBy?.name || 'FoodNerve Network';
        const compDisplay = isVolunteer ? `${l.npReward || 'Earn'} NP` : (l.priceOrAsk || 'Competitive Salary');

        return {
          id: l.id,
          title: l.title,
          type: typeLabel,
          imageUrl: l.imageUrl || '/images/default-thumbnail.jpg',
          companyLogo,
          author: authorName,
          locationOrSalary: l.location || 'Pan-African Operations',
          metric: compDisplay,
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
            newCount: 0,
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
          { id: 'lane-articles', title: 'Latest Articles', color: '#3b82f6', newCount: 0 },
          { id: 'lane-livestreams', title: 'Livestreams', color: '#f59e0b', newCount: 0 },
          { id: 'lane-jobs', title: 'Careers & Opportunities', color: '#10b981', newCount: 0 },
          { id: 'lane-missions', title: 'Missions', color: '#ec4899', newCount: 0 }
        ].map((lane) => {
          if (lane.id === 'lane-top-stories') {
            return <Swimlane key={lane.id} lane={{ ...lane, newCount: lane.items?.length || 0, totalCount: statsObj.articles }} />;
          }
          if (lane.id === 'lane-articles') {
            const articleItems = recentIntelligence.filter((i: any) => i.type === 'article').map((i: any) => {
              let tags: string[] = [];
              if (i.blocks && i.blocks.length > 0) {
                tags = i.blocks.map((b: any) => {
                  try {
                    const payload = typeof b.content === 'string' ? JSON.parse(b.content) : b.content;
                    let textVal = '';
                    if (b.blockType === 'subheading') textVal = payload?.text;
                    else if (b.blockType === 'exec_summary') textVal = payload?.point1 || payload?.point2;
                    else if (b.blockType === 'highlight_card') textVal = payload?.caption || payload?.label;
                    else if (b.blockType === 'core_interactive') textVal = payload?.heading;
                    if (typeof textVal === 'string' && textVal.trim().length > 0) {
                      const clean = textVal.replace(/<[^>]*>?/gm, '').trim();
                      return clean.length > 45 ? clean.substring(0, 42) + '...' : clean;
                    }
                  } catch(e) {}
                  return null;
                }).filter((t: any) => t && t.length > 3);
              }
              return {
                id: i.id,
                type: 'Article',
                title: i.title,
                authorOrOperator: i.author,
                metaInfo: i.readTime,
                thumbnailUrl: i.thumbnailUrl,
                link: i.link,
                tags: tags.length > 0 ? tags : ['🌾 System Intelligence', '📊 Field Report', '💡 Architecture'],
                categoryLabel: i.categoryLabel
              };
            });
            return <Swimlane key={lane.id} lane={{ ...lane, items: articleItems, newCount: articleItems.length, totalCount: statsObj.articles }} />;
          }
          if (lane.id === 'lane-livestreams') {
            const streamItems = recentIntelligence.filter((i: any) => i.type === 'livestream' || i.type === 'video').map((i: any) => ({
              id: i.id,
              type: i.type === 'livestream' ? 'Live' : 'Video',
              title: i.title,
              authorOrOperator: i.author,
              metaInfo: i.readTime,
              thumbnailUrl: i.thumbnailUrl,
              link: i.link,
              tags: ['🔴 Live Broadcast', '🎙️ Expert Panel', '📈 Strategy Session'],
              categoryLabel: i.categoryLabel
            }));
            return (
              <React.Fragment key={lane.id}>
                <EmailCaptureTrigger />
                <Swimlane lane={{ ...lane, items: streamItems, newCount: streamItems.length, totalCount: statsObj.livestreams }} />
              </React.Fragment>
            );
          }
          // Generate consolidated items for careers
          if (lane.id === 'lane-jobs') {
            const combinedItems = activeOpportunities.map((opp: any) => ({
              id: opp.id,
              type: opp.type,
              title: opp.title,
              authorOrOperator: opp.author,
              companyLogo: opp.companyLogo,
              locationOrSalary: opp.locationOrSalary,
              metaInfo: opp.metric,
              link: opp.link,
              thumbnailUrl: opp.imageUrl
            }));
            return <Swimlane key={lane.id} lane={{ ...lane, items: combinedItems, newCount: combinedItems.length, totalCount: statsObj.jobs || combinedItems.length }} />;
          }
          // Generate basic items for missions
          if (lane.id === 'lane-missions') {
            const missionItems = activeDeployments.map((dep: any) => ({
              id: dep.id,
              type: 'Missions',
              title: dep.title,
              authorOrOperator: dep.operator?.name || 'FoodNerve Society',
              metaInfo: dep.traction,
              thumbnailUrl: dep.imageUrl || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=800',
              link: dep.link,
              progress: dep.progress || 45
            }));
            return <Swimlane key={lane.id} lane={{ ...lane, items: missionItems, newCount: missionItems.length, totalCount: statsObj.missions }} />;
          }
          return <Swimlane key={lane.id} lane={lane} />;
        })}
      </Box>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: THE SOCIETY GATEWAY
          Light premium closer — the cross-domain hook focusing on Community
      ═══════════════════════════════════════════════════════════ */}
      <SocietyGatewayCTA userCount={userCount} tenantName={tenant.name} />

    </Box>
  );
}
