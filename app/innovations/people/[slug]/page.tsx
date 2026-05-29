import React from 'react';
import { Box, Container, Typography, Button, IconButton, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/cms';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';

export default async function PersonProfilePage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const headersList = await headers();
  const rawTenantId = headersList.get('x-tenant-id') || 'food';
  const tenantId = rawTenantId.includes('energy') ? 'energy' : 'food';
  const tenant = getTenantConfig(tenantId);
  
  const person = tenant.people?.find(p => p.slug === slug);
  if (!person) {
    notFound();
  }

  return (
    <Box sx={{ pb: 10, bgcolor: '#050505', color: 'white', minHeight: '100vh' }}>
      {/* Cover Banner */}
      <Box sx={{ 
        height: { xs: 250, md: 350 }, 
        bgcolor: '#1a1a1a', 
        backgroundImage: person.coverUrl ? `url(${person.coverUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        '&::after': {
          content: '""', position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, #050505 0%, transparent 100%)'
        }
      }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 5, height: '100%' }}>
          <Box sx={{ position: 'absolute', top: { xs: 100, md: 120 } }}>
            <Link href="/people" passHref style={{ textDecoration: 'none' }}>
              <Button startIcon={<ArrowBackIcon />} sx={{ color: 'rgba(255,255,255,0.8)', bgcolor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', '&:hover': { color: 'white', bgcolor: 'rgba(0,0,0,0.6)' } }}>
                Back to Directory
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: -10, md: -12 }, position: 'relative', zIndex: 10 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: { xs: 4, md: 8 },
          alignItems: 'flex-start'
        }}>
          {/* Profile Image (Avatar) */}
          <Box sx={{ 
            width: { xs: 180, md: 280 }, 
            height: { xs: 180, md: 280 }, 
            flexShrink: 0,
            borderRadius: '50%', 
            backgroundImage: `url(${person.imageUrl})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'top center',
            border: '8px solid #050505',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            bgcolor: '#333'
          }} />

          {/* Profile Info */}
          <Box sx={{ flexGrow: 1, pt: { xs: 0, md: 14 } }}>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 1, letterSpacing: -1 }}>
              {person.name}
            </Typography>
            <Typography variant="h5" sx={{ color: 'primary.light', fontWeight: 600, mb: 4, textTransform: 'uppercase', letterSpacing: 2 }}>
              {person.role}
            </Typography>

            {/* Socials Box */}
            <Box sx={{ display: 'flex', gap: 2, mb: 6 }}>
              {person.linkedin && (
                <Link href={person.linkedin} target="_blank" passHref>
                  <Box sx={{ 
                    width: 44, height: 44, borderRadius: '50%', 
                    bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s',
                    '&:hover': { bgcolor: '#0077b5', borderColor: '#0077b5', transform: 'scale(1.1)' }
                  }}>
                    <LinkedInIcon sx={{ fontSize: '1.4rem', color: 'white' }} />
                  </Box>
                </Link>
              )}
              {person.twitter && (
                <Link href={person.twitter} target="_blank" passHref>
                  <Box sx={{ 
                    width: 44, height: 44, borderRadius: '50%', 
                    bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s',
                    '&:hover': { bgcolor: '#1DA1F2', borderColor: '#1DA1F2', transform: 'scale(1.1)' }
                  }}>
                    <TwitterIcon sx={{ fontSize: '1.4rem', color: 'white' }} />
                  </Box>
                </Link>
              )}
            </Box>

            {/* Highlights Grid */}
            {person.highlights && person.highlights.length > 0 && (
              <Box sx={{ 
                display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3, mb: 6,
                p: 3, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)'
              }}>
                {person.highlights.map((h, i) => (
                  <Box key={i}>
                    <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, letterSpacing: 1, display: 'block', lineHeight: 1 }}>
                      {h.label}
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mt: 0.5 }}>
                      {h.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400, lineHeight: 1.8 }}>
              {person.bio}
            </Typography>

            {/* Timeline CV Section */}
            {person.timeline && person.timeline.length > 0 && (
              <Box sx={{ mt: 6, pt: 6, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <WorkHistoryIcon sx={{ color: 'primary.light', fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Experience & Milestones
                  </Typography>
                </Box>
                
                {person.timeline.map((event, idx) => (
                  <Accordion 
                    key={idx} 
                    defaultExpanded={idx === 0}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.02)', 
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.05)',
                      mb: 2,
                      borderRadius: '12px !important',
                      '&:before': { display: 'none' },
                      transition: 'all 0.3s',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                    }}
                  >
                    <AccordionSummary 
                      expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                      sx={{ p: 3, '& .MuiAccordionSummary-content': { my: 0 } }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 4 }, alignItems: { xs: 'flex-start', sm: 'center' }, width: '100%' }}>
                        <Typography sx={{ fontWeight: 800, color: 'primary.light', minWidth: 120 }}>
                          {event.year}
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
                          {event.title}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 3, pb: 3, pt: 0, ml: { xs: 0, sm: '152px' } }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                        {event.description}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}

            <Box sx={{ mt: 8, p: 4, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white', mb: 1 }}>
                Want to connect with {person.name.split(' ')[0]}?
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 3 }}>
                Reach out regarding partnerships, media, or infrastructure deployments.
              </Typography>
              <Button variant="contained" color="primary" sx={{ borderRadius: 8, px: 4, py: 1.5, fontWeight: 'bold' }}>
                Contact {person.name.split(' ')[0]}
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}