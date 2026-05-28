import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, CardActionArea, Chip } from '@mui/material';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/cms';
import { getKnowledgeMaterials } from '@/lib/db/knowledge';
import KnowledgeTeaser from './components/KnowledgeTeaser';
import ShowcaseCarousel from './components/ShowcaseCarousel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export default async function InnovationsHomepage() {
  const headersList = await headers();
  const rawTenantId = headersList.get('x-tenant-id') || 'food';
  const tenantId = rawTenantId.includes('energy') ? 'energy' : 'food'; // Normalized
  const tenant = getTenantConfig(tenantId);
  const homepageConfig = tenant.com.homepage;

  // Gather recent high-priority updates across all bottlenecks for the marquee
  const marqueeItems = homepageConfig.bottlenecks
    .flatMap(b => b.updates.map(u => ({ ...u, bottleneckTitle: b.title, bottleneckId: b.id })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 12);

  // Fetch recent learning materials from the simulated database
  const recentIntelligence = await getKnowledgeMaterials({
    tenantId: tenantId,
    limit: 20 // Fetch a good number so Client component can filter
  });

  console.log("SERVER LOG - Normalized Tenant ID:", tenantId);
  console.log("SERVER LOG - Recent Intelligence count:", recentIntelligence.length);

  // Pick a few bottlenecks for the teaser (first 4)
  const teaserBottlenecks = homepageConfig.bottlenecks.slice(0, 4);

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      
      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: THE CINEMATIC HERO
          Full viewport, no buttons — just the message and a scroll indicator
      ═══════════════════════════════════════════════════════════ */}
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        color: 'primary.contrastText', 
        overflow: 'hidden',
        bgcolor: 'primary.main',
        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.3) 100%)',
      }}>
        {/* Ambient light effects */}
        <Box sx={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse at 25% 40%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(ellipse at 75% 70%, rgba(0,0,0,0.25) 0%, transparent 50%)',
          zIndex: 1,
        }} />
        
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, textAlign: 'center', px: { xs: 3, md: 2 } }}>
          <Typography 
            variant="overline" 
            sx={{ 
              color: 'rgba(255,255,255,0.5)', 
              fontWeight: 700, 
              letterSpacing: 4, 
              mb: 4, 
              display: 'block',
              fontSize: '0.85rem',
            }}
          >
            {tenant.name.toUpperCase()}
          </Typography>
          <Typography 
            variant="h1" 
            sx={{ 
              fontWeight: 900, 
              textShadow: '0 4px 30px rgba(0,0,0,0.3)', 
              mb: 4,
              fontSize: { xs: '2.5rem', md: '4rem' },
              lineHeight: 1.1,
            }}
          >
            {homepageConfig.heroHeadline}
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 400, 
              opacity: 0.85, 
              mb: 0, 
              textShadow: '0 2px 15px rgba(0,0,0,0.15)', 
              lineHeight: 1.7,
              maxWidth: '700px',
              mx: 'auto',
            }}
          >
            {homepageConfig.heroSubheadline}
          </Typography>
        </Container>

        {/* Scroll indicator */}
        <Box sx={{ 
          position: 'absolute', 
          bottom: { xs: 30, md: 50 }, 
          left: '50%', 
          transform: 'translateX(-50%)',
          zIndex: 2,
          textAlign: 'center',
          animation: 'bounce 2s infinite',
          '@keyframes bounce': {
            '0%, 20%, 50%, 80%, 100%': { transform: 'translateX(-50%) translateY(0)' },
            '40%': { transform: 'translateX(-50%) translateY(-12px)' },
            '60%': { transform: 'translateX(-50%) translateY(-6px)' },
          },
        }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', letterSpacing: 3, textTransform: 'uppercase', display: 'block', mb: 1 }}>
            Scroll to explore
          </Typography>
          <KeyboardArrowDownIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 32 }} />
        </Box>
      </Box>


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
            LIVE UPDATES
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
          {[...marqueeItems, ...marqueeItems].map((item, idx) => (
            <Link key={idx} href={`/${item.bottleneckId}/${item.section}`} passHref style={{ textDecoration: 'none', flexShrink: 0 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mr: 6,
                px: 3,
                py: 1.5,
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.2s',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' },
                minWidth: 320,
              }}>
                <Chip 
                  label={item.bottleneckTitle} 
                  size="small" 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    color: 'rgba(255,255,255,0.7)', 
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    height: 22,
                  }} 
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)' }}>
                    {item.section.toUpperCase()} · {new Date(item.date).toLocaleDateString()}
                  </Typography>
                </Box>
                {item.importance === 'high' && (
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ff4444', flexShrink: 0 }} />
                )}
              </Box>
            </Link>
          ))}
        </Box>
      </Box>


      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: THE BOTTLENECKS TEASER
          Dark manifesto excerpt + bottleneck cards
      ═══════════════════════════════════════════════════════════ */}
      <Box sx={{ pt: { xs: 10, md: 15 }, pb: { xs: 10, md: 15 }, px: 2, bgcolor: '#050505', color: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: '700px', mb: 8 }}>
            <Typography variant="overline" sx={{ color: 'error.main', fontWeight: 900, letterSpacing: 3, mb: 2, display: 'block' }}>
              THE BOTTLENECKS
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 3, lineHeight: 1.2 }}>
              We mapped the entire supply chain to isolate the exact points of failure.
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400, lineHeight: 1.7 }}>
              These are not random problems. They are the systemic infrastructure deficits that prevent scale across the African {tenantId} sector. Each one has a dedicated dashboard with active solutions.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {teaserBottlenecks.map((b) => (
              <Grid item xs={12} sm={6} md={3} key={b.id}>
                <Link href={`/${b.id}`} passHref style={{ textDecoration: 'none' }}>
                  <Card sx={{ 
                    height: '100%',
                    bgcolor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 4,
                    transition: 'all 0.3s',
                    '&:hover': { 
                      bgcolor: 'rgba(255,255,255,0.08)', 
                      borderColor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-6px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    },
                  }}>
                    <CardActionArea sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', mb: 2 }}>
                        {b.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', flexGrow: 1, lineHeight: 1.6 }}>
                        {b.desc}
                      </Typography>
                      <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', color: 'primary.light', fontWeight: 'bold', fontSize: '0.85rem' }}>
                        View Dashboard <ArrowForwardIcon sx={{ ml: 1, fontSize: 16 }} />
                      </Box>
                    </CardActionArea>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Link href="/bottlenecks" passHref style={{ textDecoration: 'none' }}>
              <Button 
                variant="outlined" 
                size="large" 
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.2)', 
                  borderRadius: 8, 
                  px: 5, 
                  py: 1.5,
                  '&:hover': { borderColor: 'rgba(255,255,255,0.5)', bgcolor: 'rgba(255,255,255,0.05)' },
                }}
              >
                See all {homepageConfig.bottlenecks.length} Bottlenecks
              </Button>
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
              We don't just fund startups. We build infrastructure.
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
          <a href={`https://${tenantId}nerve.org/login`} style={{ textDecoration: 'none' }}>
            <Button 
              variant="contained" 
              size="large" 
              sx={{ 
                bgcolor: 'white', 
                color: '#0a0a0a', 
                borderRadius: 8, 
                px: 6, 
                py: 2, 
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: '0 8px 30px rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              }}
            >
              Join the {tenant.name} Society
            </Button>
          </a>
        </Container>
      </Box>

    </Box>
  );
}
