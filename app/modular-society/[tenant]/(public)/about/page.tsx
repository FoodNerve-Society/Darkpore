import React from 'react';
import { Box, Typography, Container, Grid } from '@mui/material';
import Link from 'next/link';
import Button from '@mui/material/Button';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/cms';
import SouthIcon from '@mui/icons-material/South';
import ScrollReveal from './ScrollReveal';

const storyImages = [
  "https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1558904541-efa843a96f0f?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=800&auto=format&fit=crop"
];

export default async function AboutPage() {
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'food';
  const tenant = getTenantConfig(tenantId);
  const content = tenant.org.about;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f2f7f1', color: '#0f2414' }}>
      
      {/* Premium Header */}
      <Box sx={{ 
        p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        background: 'rgba(242, 247, 241, 0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(15, 36, 20, 0.05)', position: 'fixed', width: '100%', top: 0, zIndex: 1000 
      }}>
        <Link href="/" passHref style={{ textDecoration: 'none' }}>
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-1.5px', color: '#1b5e20', textTransform: 'uppercase', cursor: 'pointer' }}>
            {tenant.org.homepage.title}
          </Typography>
        </Link>
        <Box>
          <Link href="/join" passHref style={{ textDecoration: 'none' }}>
            <Button variant="contained" sx={{ 
              bgcolor: '#1b5e20', color: 'white', borderRadius: '14px', px: 4, fontWeight: 800, textTransform: 'none',
              boxShadow: '0 4px 14px 0 rgba(27, 94, 32, 0.2)', '&:hover': { bgcolor: '#112918' }
            }}>
              Join Society
            </Button>
          </Link>
        </Box>
      </Box>

      {/* Hero Section */}
      <Box sx={{ position: 'relative', pt: { xs: 20, md: 30 }, pb: { xs: 10, md: 15 }, px: 3, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 4, color: '#2e7d32', mb: 3, display: 'block' }}>
            OUR MANIFESTO
          </Typography>
          <Typography variant="h1" sx={{ fontWeight: 900, mb: 4, letterSpacing: '-0.04em', fontSize: { xs: '3rem', md: '5rem' }, lineHeight: 1 }}>
            {content.title}
          </Typography>
          <Typography variant="h5" sx={{ color: 'rgba(15, 36, 20, 0.7)', mb: 8, lineHeight: 1.6, maxWidth: '700px', mx: 'auto', fontWeight: 400 }}>
            {content.subtitle}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', animation: 'bounce 2s infinite' }}>
            <style suppressHydrationWarning>{`
              @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(10px); }
                60% { transform: translateY(5px); }
              }
            `}</style>
            <SouthIcon sx={{ fontSize: 40, color: '#1b5e20', opacity: 0.5 }} />
          </Box>
        </Container>
      </Box>

      {/* Storytelling Content */}
      <Box sx={{ position: 'relative', zIndex: 1, pb: 15 }}>
        {content.features.map((feature, index) => {
          const isEven = index % 2 === 0;
          return (
            <Box key={index} sx={{ 
              py: { xs: 8, md: 12 }, 
              bgcolor: isEven ? 'white' : 'transparent',
              borderTop: isEven ? '1px solid rgba(15, 36, 20, 0.03)' : 'none',
              borderBottom: isEven ? '1px solid rgba(15, 36, 20, 0.03)' : 'none',
              overflow: 'hidden' // prevent horizontal scroll on reveal
            }}>
              <Container maxWidth="lg">
                <Grid container spacing={{ xs: 6, md: 10 }} sx={{ alignItems: 'center' }} direction={isEven ? 'row' : 'row-reverse'}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <ScrollReveal direction={isEven ? 'right' : 'left'}>
                      <Box sx={{ 
                        position: 'relative', 
                        borderRadius: '32px', 
                        overflow: 'hidden',
                        boxShadow: '0 20px 60px rgba(15, 36, 20, 0.1)',
                        aspectRatio: '4/5',
                        transform: isEven ? 'rotate(-2deg)' : 'rotate(2deg)',
                        transition: 'transform 0.5s',
                        '&:hover': { transform: 'rotate(0deg) scale(1.02)' }
                      }}>
                        <Box sx={{ 
                          position: 'absolute', inset: 0, 
                          backgroundImage: `url(${storyImages[index % storyImages.length]})`,
                          backgroundSize: 'cover', backgroundPosition: 'center',
                        }} />
                      </Box>
                    </ScrollReveal>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <ScrollReveal direction={isEven ? 'left' : 'right'} delay={150}>
                      <Box sx={{ pr: isEven ? 0 : { md: 6 }, pl: isEven ? { md: 6 } : 0 }}>
                        <Typography variant="h2" sx={{ fontWeight: 900, mb: 3, letterSpacing: '-2px', fontSize: { xs: '2.5rem', md: '3.5rem' }, color: '#0f2414' }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(15, 36, 20, 0.7)', fontSize: '1.25rem', lineHeight: 1.8 }}>
                          {feature.desc}
                        </Typography>
                      </Box>
                    </ScrollReveal>
                  </Grid>
                </Grid>
              </Container>
            </Box>
          );
        })}
      </Box>

      {/* CTA Section */}
      <Box sx={{ 
        bgcolor: '#0f2414', color: 'white', textAlign: 'center', py: { xs: 12, md: 16 }, px: 3,
        position: 'relative', overflow: 'hidden'
      }}>
        <Box sx={{ 
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '800px', height: '800px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46, 125, 50, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" sx={{ fontWeight: 900, mb: 4, letterSpacing: '-1.5px' }}>
            Ready to rewrite the future?
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.6)', mb: 8, fontWeight: 400 }}>
            Step into the arena. Connect, trade, and build alongside the best.
          </Typography>
          <Link href="/join" passHref style={{ textDecoration: 'none' }}>
            <Button variant="contained" size="large" sx={{ 
              py: 2.5, px: 8, fontSize: '1.2rem', borderRadius: '16px', fontWeight: 800,
              bgcolor: '#2e7d32', color: 'white',
              boxShadow: '0 12px 35px rgba(46, 125, 50, 0.3)', textTransform: 'none',
              transition: 'all 0.3s', '&:hover': { transform: 'translateY(-3px)', bgcolor: '#1b5e20' }
            }}>
              {content.ctaText}
            </Button>
          </Link>
        </Container>
      </Box>
    </Box>
  );
}
