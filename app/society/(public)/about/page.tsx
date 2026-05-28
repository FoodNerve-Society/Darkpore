import React from 'react';
import { Box, Typography, Container, Grid, Card, CardContent } from '@mui/material';
import Link from 'next/link';
import Button from '@mui/material/Button';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ContactsIcon from '@mui/icons-material/Contacts';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/cms';

// Dynamic icon mapping based on feature index for visual flair
const FeatureIcons = [HandshakeIcon, ContactsIcon, SchoolIcon, AttachMoneyIcon];

export default async function AboutPage() {
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'food';
  const tenant = getTenantConfig(tenantId);
  const content = tenant.org.about;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      
      {/* Premium Header */}
      <Box sx={{ 
        p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 
      }}>
        <Link href="/" passHref style={{ textDecoration: 'none' }}>
          <Typography variant="h5" color="primary" sx={{ fontWeight: 800, letterSpacing: '-0.5px', cursor: 'pointer' }}>{tenant.org.homepage.title}</Typography>
        </Link>
        <Box>
          <Link href="/login" passHref style={{ textDecoration: 'none' }}>
            <Button variant="contained" sx={{ borderRadius: 8, px: 4, boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)' }}>Sign Up / Login</Button>
          </Link>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <Box sx={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity: 0.5,
          background: `radial-gradient(circle at 100% 0%, ${tenant.palette.light.primary.main}1A 0%, transparent 60%), radial-gradient(circle at 0% 100%, ${tenant.palette.light.secondary.main}1A 0%, transparent 40%)`,
        }} />
        <Container maxWidth="lg" sx={{ py: 10, position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" sx={{ fontWeight: 900, textAlign: 'center', mb: 3, letterSpacing: '-1px' }}>
            {content.title}
          </Typography>
          <Typography variant="h5" color="text.secondary" textAlign="center" mb={10} maxWidth="800px" mx="auto" sx={{ lineHeight: 1.7 }}>
            {content.subtitle}
          </Typography>

          <Grid container spacing={4}>
            {content.features.map((feature, index) => {
              const IconComponent = FeatureIcons[index % FeatureIcons.length];
              return (
                <Grid item xs={12} md={6} key={index}>
                  <Card sx={{ 
                    height: '100%', 
                    borderRadius: 6, 
                    boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.8)',
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: `0 20px 40px rgba(0,0,0,0.08), 0 0 0 2px ${tenant.palette.light.primary.main}33` }
                  }}>
                    <CardContent sx={{ p: 5 }}>
                      <Box sx={{ 
                        display: 'inline-flex', p: 2, borderRadius: 4, mb: 3,
                        bgcolor: index === 3 ? `${tenant.palette.light.secondary.main}1A` : `${tenant.palette.light.primary.main}1A`
                      }}>
                        <IconComponent color={index === 3 ? "success" : "primary"} sx={{ fontSize: 40 }} />
                      </Box>
                      <Typography variant="h4" fontWeight="800" gutterBottom>{feature.title}</Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                        {feature.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Box textAlign="center" mt={12}>
            <Link href="/login" passHref style={{ textDecoration: 'none' }}>
              <Button variant="contained" size="large" sx={{ 
                py: 2.5, px: 8, fontSize: '1.3rem', borderRadius: 12,
                boxShadow: `0 10px 40px ${tenant.palette.light.primary.main}50`,
                transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-3px)' }
              }}>
                {content.ctaText}
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
