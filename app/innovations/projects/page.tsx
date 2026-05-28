import React from 'react';
import { Box, Container, Typography, Grid, Card, Button, Chip } from '@mui/material';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/cms';

/* ── dummy metrics per project index ── */
const projectMetrics: Record<number, { label: string; value: string }[]> = {
  0: [
    { label: 'Target Market', value: '$12.5B' },
    { label: 'Stage', value: 'Pilot' },
    { label: 'Region', value: 'Northern Nigeria' },
    { label: 'Hectares Mapped', value: '10,000+' },
  ],
  1: [
    { label: 'Units Funded', value: '50' },
    { label: 'Stage', value: 'Deployment' },
    { label: 'Region', value: 'Lagos, Nigeria' },
    { label: 'Food Saved/yr', value: '8,200 tons' },
  ],
};

const fallbackMetrics = [
  { label: 'Target Market', value: '$8B+' },
  { label: 'Stage', value: 'Scaling' },
  { label: 'Region', value: 'West Africa' },
  { label: 'Impact', value: 'Transformative' },
];

/* ── sector tags per project ── */
const sectorTags: Record<number, string> = {
  0: 'PRECISION AGRICULTURE',
  1: 'COLD-CHAIN LOGISTICS',
};

export default async function ProjectsManifestoPage() {
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
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(46,125,50,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        {/* Subtle grid overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          <Typography
            variant="overline"
            sx={{
              color: 'primary.main',
              fontWeight: 900,
              letterSpacing: 5,
              mb: 3,
              display: 'block',
              fontSize: { xs: '0.7rem', md: '0.8rem' },
            }}
          >
            CAPITAL DEPLOYMENT
          </Typography>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              mb: 5,
              lineHeight: 1.15,
              fontSize: { xs: '2rem', md: '3.2rem' },
              background: 'linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.6) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            We don't just fund startups.
            <br />
            We build infrastructure.
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.9,
              mb: 4,
              fontWeight: 400,
              maxWidth: 680,
              fontSize: { xs: '1rem', md: '1.15rem' },
            }}
          >
            Thousands of engineers, farmers, and operators submit blueprints. The best blueprints are aggressively funded and deployed as Active Innovations.
          </Typography>

          {/* Scroll indicator */}
          <Box
            sx={{
              mt: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              opacity: 0.35,
            }}
          >
            <Box
              sx={{
                width: 1,
                height: 48,
                bgcolor: 'rgba(255,255,255,0.4)',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                letterSpacing: 3,
                textTransform: 'uppercase',
                fontSize: '0.65rem',
              }}
            >
              Scroll to explore deployments
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* ═══════════════════════════════════════════════════════════════
          2. IMMERSIVE PROJECT SECTIONS
      ═══════════════════════════════════════════════════════════════ */}
      {homepageConfig.showcaseProjects.map((project, idx) => {
        const isEven = idx % 2 === 0;
        const metrics = projectMetrics[idx] || fallbackMetrics;
        const sector = sectorTags[idx] || 'INNOVATION';

        return (
          <React.Fragment key={idx}>
            {/* ── Divider ── */}
            {idx > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 1,
                  position: 'relative',
                }}
              >
                {/* Left line */}
                <Box
                  sx={{
                    flex: 1,
                    height: '1px',
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
                  }}
                />
                {/* Center circle */}
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    border: '1.5px solid rgba(255,255,255,0.15)',
                    mx: 3,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                    },
                  }}
                />
                {/* Right line */}
                <Box
                  sx={{
                    flex: 1,
                    height: '1px',
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
                  }}
                />
              </Box>
            )}

            {/* ── Full-width cinematic project section ── */}
            <Box
              sx={{
                position: 'relative',
                minHeight: { xs: 'auto', md: '100vh' },
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              {/* Background image */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${project.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'brightness(0.3) saturate(1.2)',
                  transform: 'scale(1.05)',
                  transition: 'transform 8s ease-out',
                }}
              />

              {/* Dark gradient overlay for text legibility */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: isEven
                    ? 'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.3) 100%)'
                    : 'linear-gradient(270deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.3) 100%)',
                }}
              />

              {/* Subtle noise texture */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.03,
                  backgroundImage:
                    'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
                  pointerEvents: 'none',
                }}
              />

              {/* Content */}
              <Container
                maxWidth="xl"
                sx={{
                  position: 'relative',
                  zIndex: 2,
                  py: { xs: 10, md: 16 },
                }}
              >
                <Grid container spacing={6} alignItems="center">
                  {/* Text column — switches sides based on even/odd */}
                  <Grid
                    item
                    xs={12}
                    md={7}
                    sx={{
                      order: { xs: 1, md: isEven ? 1 : 2 },
                      textAlign: { xs: 'left', md: isEven ? 'left' : 'right' },
                    }}
                  >
                    {/* Project number + sector tag */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 3,
                        justifyContent: {
                          xs: 'flex-start',
                          md: isEven ? 'flex-start' : 'flex-end',
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: { xs: '0.7rem', md: '0.75rem' },
                          letterSpacing: 4,
                          color: 'rgba(255,255,255,0.3)',
                          fontFamily: 'monospace',
                        }}
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </Typography>
                      <Chip
                        label={sector}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.06)',
                          color: 'primary.main',
                          fontWeight: 700,
                          letterSpacing: 2,
                          fontSize: '0.65rem',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '4px',
                          height: 26,
                        }}
                      />
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: 900,
                        color: '#fff',
                        lineHeight: 1.1,
                        mb: 4,
                        fontSize: { xs: '2.2rem', md: '3.5rem', lg: '4rem' },
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {project.title}
                    </Typography>

                    {/* Description */}
                    <Typography
                      sx={{
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: { xs: '1.05rem', md: '1.25rem' },
                        lineHeight: 1.8,
                        mb: 5,
                        maxWidth: { md: 560 },
                        ml: { md: isEven ? 0 : 'auto' },
                      }}
                    >
                      {project.desc}
                    </Typography>

                    {/* CTA */}
                    <Link href={`${project.link}`} passHref style={{ textDecoration: 'none' }}>
                      <Button
                        variant="contained"
                        size="large"
                        sx={{
                          borderRadius: '0px',
                          px: 5,
                          py: 1.8,
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          letterSpacing: 2,
                          textTransform: 'uppercase',
                          bgcolor: 'primary.main',
                          color: '#000',
                          boxShadow: '0 0 40px rgba(46,125,50,0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: '#fff',
                            color: '#000',
                            boxShadow: '0 0 60px rgba(255,255,255,0.15)',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        View Deployment →
                      </Button>
                    </Link>
                  </Grid>

                  {/* Metrics column */}
                  <Grid
                    item
                    xs={12}
                    md={5}
                    sx={{
                      order: { xs: 2, md: isEven ? 2 : 1 },
                    }}
                  >
                    <Grid container spacing={2}>
                      {metrics.map((metric, mIdx) => (
                        <Grid item xs={6} key={mIdx}>
                          <Card
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.04)',
                              backdropFilter: 'blur(24px)',
                              WebkitBackdropFilter: 'blur(24px)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              borderRadius: '12px',
                              p: { xs: 2.5, md: 3 },
                              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                transform: 'translateY(-4px)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                              },
                            }}
                          >
                            <Typography
                              sx={{
                                color: 'rgba(255,255,255,0.35)',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                letterSpacing: 2.5,
                                textTransform: 'uppercase',
                                mb: 1,
                              }}
                            >
                              {metric.label}
                            </Typography>
                            <Typography
                              sx={{
                                color: '#fff',
                                fontWeight: 900,
                                fontSize: { xs: '1.3rem', md: '1.6rem' },
                                letterSpacing: '-0.02em',
                                lineHeight: 1.2,
                              }}
                            >
                              {metric.value}
                            </Typography>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              </Container>
            </Box>
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
            background:
              'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(46,125,50,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
          <Typography
            variant="overline"
            sx={{
              color: 'primary.main',
              fontWeight: 900,
              letterSpacing: 5,
              mb: 3,
              display: 'block',
              fontSize: '0.7rem',
            }}
          >
            JOIN THE MOVEMENT
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              color: '#fff',
              mb: 3,
              fontSize: { xs: '1.8rem', md: '2.5rem' },
              lineHeight: 1.2,
            }}
          >
            Have a blueprint that can change the game?
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.45)',
              mb: 5,
              fontSize: '1.1rem',
              lineHeight: 1.7,
            }}
          >
            We fund aggressive infrastructure plays. Submit your blueprint
            to the Society and get it in front of our capital partners.
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
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'rgba(46,125,50,0.08)',
              },
            }}
          >
            Submit a Blueprint
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
