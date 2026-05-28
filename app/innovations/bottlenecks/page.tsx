import React from 'react';
import { Box, Container, Typography, Grid, Card, Button, Chip } from '@mui/material';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/cms';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

export default async function BottlenecksManifestoPage() {
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'food';
  const tenant = getTenantConfig(tenantId);
  const homepageConfig = tenant.com.homepage;

  return (
    <Box sx={{ bgcolor: '#000', minHeight: '100vh' }}>

      {/* ═══════════════════════════════════════════════════════════════
          1. THE MANIFESTO HERO
      ═══════════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          position: 'relative',
          bgcolor: '#050505',
          color: 'white',
          pt: { xs: 18, md: 24 },
          pb: { xs: 14, md: 20 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(244,67,54,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        {/* Grid texture */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          <Typography
            variant="overline"
            sx={{
              color: 'error.main',
              fontWeight: 900,
              letterSpacing: 5,
              mb: 3,
              display: 'block',
              fontSize: { xs: '0.7rem', md: '0.8rem' },
            }}
          >
            THE {homepageConfig.bottlenecks.length} BOTTLENECKS
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              mb: 4,
              lineHeight: 1.15,
              fontSize: { xs: '2rem', md: '3.2rem' },
              background: 'linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.6) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            The systemic failures preventing scale.
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.8,
              fontWeight: 400,
              maxWidth: 600,
              fontSize: { xs: '0.95rem', md: '1.05rem' },
            }}
          >
            We mapped the entire supply chain to isolate these exact infrastructure deficits. Each one has a dedicated dashboard with active solutions. Tap any to explore.
          </Typography>
        </Container>
      </Box>

      {/* ═══════════════════════════════════════════════════════════════
          2. ALTERNATING BOTTLENECK ROWS
      ═══════════════════════════════════════════════════════════════ */}
      {homepageConfig.bottlenecks.map((bottleneck, idx) => {
        const isEven = idx % 2 === 0;

        return (
          <React.Fragment key={bottleneck.id}>
            {/* Divider between items */}
            {idx > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                <Box sx={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)' }} />
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', mx: 3, position: 'relative', '&::after': { content: '""', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 3, height: 3, borderRadius: '50%', bgcolor: 'error.main' } }} />
                <Box sx={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)' }} />
              </Box>
            )}

            <Link href={`/${bottleneck.id}`} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
              <Box
                sx={{
                  position: 'relative',
                  minHeight: { xs: 'auto', md: 500 },
                  display: 'flex',
                  alignItems: 'center',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.4s',
                  '&:hover .bottleneck-img': { transform: 'scale(1.03)', filter: 'brightness(0.35) saturate(1.3)' },
                }}
              >
                {/* Background image */}
                <Box
                  className="bottleneck-img"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${bottleneck.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'brightness(0.25) saturate(1.2)',
                    transition: 'transform 0.6s ease, filter 0.4s ease',
                  }}
                />

                {/* Directional gradient overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: isEven
                      ? 'linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.2) 100%)'
                      : 'linear-gradient(270deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.2) 100%)',
                  }}
                />

                {/* Content */}
                <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2, py: { xs: 8, md: 12 } }}>
                  <Grid container spacing={6} alignItems="center">
                    {/* Text column */}
                    <Grid
                      item
                      xs={12}
                      md={7}
                      sx={{
                        order: { xs: 1, md: isEven ? 1 : 2 },
                        textAlign: { xs: 'left', md: isEven ? 'left' : 'right' },
                      }}
                    >
                      {/* Number + tag */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          mb: 3,
                          justifyContent: { xs: 'flex-start', md: isEven ? 'flex-start' : 'flex-end' },
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 900,
                            fontSize: '0.75rem',
                            letterSpacing: 4,
                            color: 'rgba(255,255,255,0.25)',
                            fontFamily: 'monospace',
                          }}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </Typography>
                        <Chip
                          label="BOTTLENECK"
                          size="small"
                          sx={{
                            bgcolor: 'rgba(244,67,54,0.15)',
                            color: 'error.light',
                            fontWeight: 700,
                            letterSpacing: 2,
                            fontSize: '0.6rem',
                            border: '1px solid rgba(244,67,54,0.2)',
                            borderRadius: '4px',
                            height: 24,
                          }}
                        />
                      </Box>

                      <Typography
                        variant="h2"
                        sx={{
                          fontWeight: 900,
                          color: '#fff',
                          lineHeight: 1.1,
                          mb: 3,
                          fontSize: { xs: '2rem', md: '3rem', lg: '3.5rem' },
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {bottleneck.title}
                      </Typography>

                      <Typography
                        sx={{
                          color: 'rgba(255,255,255,0.55)',
                          fontSize: { xs: '1rem', md: '1.2rem' },
                          lineHeight: 1.8,
                          mb: 4,
                          maxWidth: { md: 520 },
                          ml: { md: isEven ? 0 : 'auto' },
                        }}
                      >
                        {bottleneck.longDesc}
                      </Typography>

                      <Button
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          borderRadius: 0,
                          px: 5,
                          py: 1.8,
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          letterSpacing: 2,
                          textTransform: 'uppercase',
                          bgcolor: 'rgba(255,255,255,0.08)',
                          color: '#fff',
                          border: '1px solid rgba(255,255,255,0.12)',
                          boxShadow: 'none',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: '#fff',
                            color: '#000',
                            boxShadow: '0 0 40px rgba(255,255,255,0.1)',
                          },
                        }}
                      >
                        View Dashboard
                      </Button>
                    </Grid>

                    {/* Stats column */}
                    <Grid
                      item
                      xs={12}
                      md={5}
                      sx={{ order: { xs: 2, md: isEven ? 2 : 1 } }}
                    >
                      <Grid container spacing={2}>
                        {[
                          { label: 'Active Solutions', value: String(bottleneck.stats.activeSolutions), icon: <RocketLaunchIcon sx={{ fontSize: 20, color: 'primary.light' }} /> },
                          { label: 'Capital Deployed', value: bottleneck.stats.capitalDeployed, icon: <TrendingUpIcon sx={{ fontSize: 20, color: '#f59e0b' }} /> },
                          { label: 'Community', value: bottleneck.stats.communitySize, icon: <GroupsIcon sx={{ fontSize: 20, color: '#6366f1' }} /> },
                        ].map((stat, sidx) => (
                          <Grid item xs={12} sm={4} md={12} key={sidx}>
                            <Card
                              sx={{
                                bgcolor: 'rgba(255,255,255,0.03)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 3,
                                p: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                transition: 'all 0.3s',
                                '&:hover': {
                                  bgcolor: 'rgba(255,255,255,0.06)',
                                  borderColor: 'rgba(255,255,255,0.12)',
                                },
                              }}
                            >
                              <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)' }}>
                                {stat.icon}
                              </Box>
                              <Box>
                                <Typography
                                  sx={{
                                    color: 'rgba(255,255,255,0.35)',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    letterSpacing: 2,
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  {stat.label}
                                </Typography>
                                <Typography
                                  sx={{
                                    color: '#fff',
                                    fontWeight: 900,
                                    fontSize: '1.5rem',
                                    letterSpacing: '-0.02em',
                                  }}
                                >
                                  {stat.value}
                                </Typography>
                              </Box>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  </Grid>
                </Container>
              </Box>
            </Link>
          </React.Fragment>
        );
      })}

      {/* ═══════════════════════════════════════════════════════════════
          3. CLOSING CTA
      ═══════════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 12, md: 18 },
          textAlign: 'center',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(244,67,54,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
          <Typography variant="overline" sx={{ color: 'error.main', fontWeight: 900, letterSpacing: 5, mb: 3, display: 'block', fontSize: '0.7rem' }}>
            JOIN THE INTELLIGENCE NETWORK
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#fff', mb: 3, fontSize: { xs: '1.8rem', md: '2.5rem' }, lineHeight: 1.2 }}>
            See a bottleneck we missed?
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.45)', mb: 5, fontSize: '1.1rem', lineHeight: 1.7 }}>
            The bottleneck map is a living document built by the Society. If you've identified a systemic failure we haven't cataloged, submit it.
          </Typography>
          <Button
            variant="outlined"
            size="large"
            sx={{
              borderRadius: 0,
              px: 5,
              py: 1.8,
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: 2,
              textTransform: 'uppercase',
              borderColor: 'rgba(255,255,255,0.15)',
              color: '#fff',
              '&:hover': { borderColor: 'error.main', bgcolor: 'rgba(244,67,54,0.08)' },
            }}
          >
            Submit a Bottleneck
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
