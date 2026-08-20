import React from 'react';
import { Box, Container, Typography, Grid, Card, CardActionArea } from '@mui/material';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/cms';

export default async function TeamDirectoryPage() {
  const headersList = await headers();
  const rawTenantId = headersList.get('x-tenant-id') || 'food';
  const tenantId = rawTenantId.includes('energy') ? 'energy' : 'food';
  const tenant = getTenantConfig(tenantId);
  const people = tenant.people || [];

  return (
    <Box sx={{ pt: { xs: 15, md: 20 }, pb: 10, bgcolor: '#050505', color: 'white', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Typography variant="overline" sx={{ color: 'primary.light', fontWeight: 900, letterSpacing: 3, mb: 2, display: 'block' }}>
          LEADERSHIP & EXPERTS
        </Typography>
        <Typography variant="h2" sx={{ fontWeight: 900, mb: 3 }}>
          The Team Behind {tenant.name}
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.6)', mb: 8, maxWidth: 600 }}>
          Meet the operators, engineers, and strategists deploying capital and infrastructure across the ecosystem.
        </Typography>

        <Grid container spacing={4}>
          {people.map((person, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
              <Link href={`/team/${person.slug}`} passHref style={{ textDecoration: 'none' }}>
                <Card sx={{ 
                  bgcolor: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: 4,
                  overflow: 'hidden',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    borderColor: 'rgba(255,255,255,0.3)'
                  }
                }}>
                  <CardActionArea sx={{ display: 'block' }}>
                    <Box sx={{ 
                      height: 300, 
                      backgroundImage: `url(${person.imageUrl})`, 
                      backgroundSize: 'cover', 
                      backgroundPosition: 'center',
                    }} />
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', mb: 0.5 }}>
                        {person.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'primary.light', fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {person.role}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {person.bio}
                      </Typography>
                    </Box>
                  </CardActionArea>
                </Card>
              </Link>
            </Grid>
          ))}
          {people.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>No profiles found.</Typography>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}
