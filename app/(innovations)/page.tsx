import React from 'react';
import { Box, Container, Typography, Card, CardContent, CardActionArea } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/tenants.config';

export default async function FoodnerveHomepage() {
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'food';
  const tenant = getTenantConfig(tenantId);

  return (
    <Box sx={{ minHeight: '100vh', pb: 10, bgcolor: 'background.default' }}>
      
      {/* Dynamic Hero Section */}
      <Box sx={{ 
        bgcolor: 'primary.dark', 
        color: 'primary.contrastText', 
        pt: 12, 
        pb: 8,
        mb: 8
      }}>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" sx={{ fontWeight: 800 }} gutterBottom>
            {tenant.heroHeadline}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 400, opacity: 0.9, mb: 4 }}>
            {tenant.heroSubheadline}
          </Typography>
        </Container>
      </Box>

      {/* The Dynamic Wahaalas Grid */}
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 4, color: 'text.primary' }}>
          {tenant.wahaalasTitle}
        </Typography>
        <Grid container spacing={3}>
          {tenant.wahaalas.map((wahaala) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={wahaala.id}>
              <Card elevation={0} sx={{ 
                height: '100%', 
                borderRadius: 4, 
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                  borderColor: 'primary.main'
                }
              }}>
                <Link href={`/${wahaala.id}`} passHref style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
                  <CardActionArea sx={{ height: '100%', p: 2 }}>
                    <CardContent>
                      <Typography variant="h5" color="primary.main" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {wahaala.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
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
