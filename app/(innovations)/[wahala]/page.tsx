import React from 'react';
import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails, Button, Paper } from '@mui/material';
import AuthwallGate from '../components/AuthwallGate';
import { headers } from 'next/headers';
import { TENANTS, getTenantConfig } from '@/lib/tenants.config';

export function generateStaticParams() {
  const slugs: { wahala: string }[] = [];
  Object.values(TENANTS).forEach((tenant) => {
    tenant.wahaalas.forEach((w) => slugs.push({ wahala: w.id }));
  });
  return slugs;
}

export default async function WahaalaPage({ params }: { params: Promise<{ wahala: string }> }) {
  const { wahala } = await params;
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'food';
  const tenant = getTenantConfig(tenantId);
  
  // Find the specific wahaala info
  const wahaalaData = tenant.wahaalas.find(w => w.id === wahala) || { title: wahala, desc: '' };

  return (
    <Box sx={{ minHeight: '100vh', pb: 10, bgcolor: 'background.default' }}>
      
      {/* Top Half: The Hooks */}
      <Box sx={{ bgcolor: 'primary.dark', color: 'primary.contrastText', pt: 10, pb: 6, px: 2 }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ fontWeight: 900, textTransform: 'capitalize' }} gutterBottom>
            {wahaalaData.title} Solutions
          </Typography>
          
          {/* Dynamic Hot CTA */}
          <Paper elevation={4} sx={{ bgcolor: 'error.main', color: 'white', p: 3, borderRadius: 3, mb: 4, display: 'inline-block' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              🔥 HOT: 5 New {wahala}-focused Solar Grants Just Added.
            </Typography>
            <Button variant="contained" color="inherit" sx={{ color: 'error.main', mt: 2, fontWeight: 'bold' }}>
              View Grants Now
            </Button>
          </Paper>

          {/* Premier League Content (Knowledge Base) */}
          <Box sx={{ bgcolor: 'rgba(0,0,0,0.4)', borderRadius: 4, p: 4, border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }} gutterBottom>
              The {wahala} Townhall (Livestream Replay)
            </Typography>
            <Box sx={{ width: '100%', height: 300, bgcolor: '#000', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">Video Player Placeholder (Cloudflare R2)</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Bottom Half: The 5 Universal Dropdowns */}
      <Container maxWidth="lg" sx={{ mt: -4 }}>
        <Paper elevation={6} sx={{ borderRadius: 4, overflow: 'hidden' }}>
          
          <Accordion disableGutters defaultExpanded>
            <AccordionSummary sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', py: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>1. Innovations (0-to-1 R&D)</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 4 }}>
              <Typography gutterBottom>Lab-Grown Meat JV & Policy Drafts for {wahala}.</Typography>
              <AuthwallGate>
                <Box sx={{ p: 3, bgcolor: 'grey.100', borderRadius: 2, mt: 2 }}>
                  <Typography variant="h6">Project X: 10,000 Hectare Policy Draft</Typography>
                  <Typography color="text.secondary">Confidential timelines and blueprints mapping the next 5 years of land acquisition strategies...</Typography>
                </Box>
              </AuthwallGate>
            </AccordionDetails>
          </Accordion>

          <Accordion disableGutters>
            <AccordionSummary sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', py: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>2. Community</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 4 }}>
              <Typography>Teasers of who is in the Rolodex solving {wahala}.</Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion disableGutters>
            <AccordionSummary sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', py: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>3. Activities</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 4 }}>
              <Typography>Upcoming tree planting initiatives and bootcamps.</Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion disableGutters>
            <AccordionSummary sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', py: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>4. Livestreams</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 4 }}>
              <Typography>Upcoming radio shows and community townhalls.</Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion disableGutters>
            <AccordionSummary sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', py: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>5. Jobs & Earn</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 4 }}>
              <Typography gutterBottom>High-paying roles in {wahala} management.</Typography>
              
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', mt: 3 }}>
                {/* SEO Teaser (Always Visible) */}
                <Box sx={{ p: 3, bgcolor: 'background.paper' }}>
                  <Typography variant="h5" color="primary.main" sx={{ fontWeight: 'bold' }}>Agritech Manager - Solar Cold Chain</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Salary: ₦1,500,000/month</Typography>
                  <Typography variant="body1">
                    We are looking for a senior manager to deploy solar cold chain infrastructure across 5 major markets. You will be responsible for...
                  </Typography>
                </Box>
                {/* The Trap */}
                <AuthwallGate>
                  <Box sx={{ p: 3, pt: 0, bgcolor: 'background.paper' }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      ...managing a team of 50 technicians, interfacing with local market leaders, and ensuring 99.9% uptime for the solar arrays.
                    </Typography>
                    <Typography variant="h6" gutterBottom>Requirements:</Typography>
                    <ul>
                      <li>5+ Years in Solar Infrastructure</li>
                      <li>MBA preferred</li>
                    </ul>
                    <Button variant="contained" size="large" sx={{ mt: 2 }}>Apply Now</Button>
                  </Box>
                </AuthwallGate>
              </Box>

            </AccordionDetails>
          </Accordion>

        </Paper>
      </Container>

    </Box>
  );
}
