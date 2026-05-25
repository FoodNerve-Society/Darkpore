import React from 'react';
import { Box, Container, Typography, Card, CardContent, CardActionArea, Grid } from '@mui/material';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/tenants.config';

export default async function FoodnerveHomepage() {
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'food';
  const tenant = getTenantConfig(tenantId);

  return (
    <Box sx={{ minHeight: '100vh', pb: 10, bgcolor: 'background.default' }}>
      
      {/* Dynamic Premium Hero Section */}
      <Box sx={{ 
        position: 'relative',
        color: 'primary.contrastText', 
        pt: { xs: 15, md: 20 }, 
        pb: { xs: 10, md: 15 },
        mb: 8,
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${tenant.palette.primary} 0%, ${tenant.palette.secondary} 100%)`,
      }}>
        {/* CSS Mesh Gradient Overlays */}
        <Box sx={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.2) 0%, transparent 50%)',
          zIndex: 1
        }} />
        
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 800, textShadow: '0 4px 20px rgba(0,0,0,0.2)' }} gutterBottom>
            {tenant.heroHeadline}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 400, opacity: 0.95, mb: 4, textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            {tenant.heroSubheadline}
          </Typography>
        </Container>
      </Box>

      {/* The Dynamic Wahaalas Grid */}
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 6, color: 'text.primary', textAlign: 'center' }}>
          {tenant.wahaalasTitle}
        </Typography>
        <Grid container spacing={4}>
          {tenant.wahaalas.map((wahaala) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={wahaala.id}>
              <Card elevation={0} sx={{ 
                height: '100%', 
                borderRadius: 6, // Premium roundness
                background: 'rgba(255, 255, 255, 0.7)', // Glass base
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: 'rgba(255,255,255,0.8)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Spring-like CSS animation
                '&:hover': {
                  transform: 'translateY(-10px) scale(1.02)',
                  boxShadow: `0 20px 40px rgba(0,0,0,0.12), 0 0 0 2px ${tenant.palette.primary}33`, // Glowing border effect
                  background: 'rgba(255, 255, 255, 0.9)',
                }
              }}>
                <Link href={`/${wahaala.id}`} passHref style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
                  <CardActionArea sx={{ height: '100%', p: 3 }}>
                    <CardContent sx={{ p: 0 }}>
                      <Typography variant="h5" color="primary.main" gutterBottom sx={{ fontWeight: 800 }}>
                        {wahaala.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {wahaala.desc}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Link>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
