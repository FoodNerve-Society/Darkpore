import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Chip } from '@mui/material';
import Link from 'next/link';
import { headers } from 'next/headers';
import { TENANTS, getTenantConfig } from '@/lib/cms';
import { getKnowledgeMaterials } from '@/lib/db/knowledge';

export function generateStaticParams() {
  const slugs: { bottleneck: string }[] = [];
  Object.values(TENANTS).forEach((tenant) => {
    tenant.com.homepage.bottlenecks.forEach((w) => slugs.push({ bottleneck: w.id }));
  });
  return slugs;
}

export default async function BottleneckLearnHub({ params }: { params: Promise<{ bottleneck: string }> }) {
  const { bottleneck } = await params;
  const headersList = await headers();
  const rawTenantId = headersList.get('x-tenant-id') || 'food';
  const tenantId = rawTenantId.includes('energy') ? 'energy' : 'food';
  const tenant = getTenantConfig(tenantId);
  
  const bottleneckData = tenant.com.homepage.bottlenecks.find(w => w.id === bottleneck);

  if (!bottleneckData) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Bottleneck not found.</div>;
  }

  const materials = await getKnowledgeMaterials({ tenantId, bottleneckId: bottleneckData.id });
  const featured = materials[0];
  const others = materials.slice(1);

  return (
    <Box sx={{ minHeight: '100vh', pb: 15, bgcolor: 'background.default' }}>
      
      {/* Specific Bottleneck Hero */}
      <Box sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', pt: 15, pb: 10, px: 2 }}>
        <Container maxWidth="lg">
          <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 2 }}>KNOWLEDGE AREA</Typography>
          <Typography variant="h2" sx={{ fontWeight: 900, mb: 2 }}>
            {bottleneckData.title}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: '800px' }}>
            Explore our curated intelligence on {bottleneckData.desc.toLowerCase()}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -6, position: 'relative', zIndex: 10 }}>
        
        {/* Featured Content */}
        {featured && (
          <Link href={`/${bottleneck}/learn/${featured.slug}`} passHref style={{ textDecoration: 'none' }}>
            <Card sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              borderRadius: 6, 
              mb: 8,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <CardMedia
                component="img"
                sx={{ width: { xs: '100%', md: '60%' }, height: { xs: 250, md: 400 } }}
                image={featured.thumbnailUrl}
                alt={featured.title}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', width: { xs: '100%', md: '40%' } }}>
                <CardContent sx={{ flex: '1 0 auto', p: { xs: 4, md: 6 } }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    <Chip label="FEATURED" color="error" sx={{ fontWeight: 'bold' }} />
                    <Chip label={featured.type.toUpperCase()} variant="outlined" sx={{ fontWeight: 'bold' }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, color: 'text.primary', lineHeight: 1.2 }}>
                    {featured.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                    {featured.previewText}
                  </Typography>
                  {featured.isPremium && (
                     <Typography variant="overline" color="error.main" sx={{ fontWeight: 900 }}>REQUIRES SOCIETY ACCESS</Typography>
                  )}
                </CardContent>
              </Box>
            </Card>
          </Link>
        )}

        {/* Other Recent Uploads */}
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 4 }}>More {bottleneckData.title} Intelligence</Typography>
        <Grid container spacing={4}>
          {others.map((material, idx) => (
            <Grid xs={12} md={4} key={idx} sx={{ p: 2 }}>
              <Link href={`/${bottleneck}/learn/${material.slug}`} passHref style={{ textDecoration: 'none' }}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: 4, 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }
                }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={material.thumbnailUrl}
                      alt={material.title}
                    />
                    <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 1 }}>
                      <Chip label={material.type.toUpperCase()} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.6)', color: 'white', fontWeight: 'bold', backdropFilter: 'blur(4px)' }} />
                    </Box>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, lineHeight: 1.3, color: 'text.primary' }}>
                      {material.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {material.previewText}
                    </Typography>
                    {material.isPremium && (
                      <Chip label="PREMIUM" size="small" color="error" variant="outlined" sx={{ fontWeight: 'bold', borderRadius: 1, mt: 2 }} />
                    )}
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
          {materials.length === 0 && (
             <Typography sx={{ p: 4, width: '100%', textAlign: 'center', color: 'text.secondary' }}>No intelligence uploaded yet.</Typography>
          )}
        </Grid>

      </Container>
    </Box>
  );
}
