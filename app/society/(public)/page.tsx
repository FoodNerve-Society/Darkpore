import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/cms';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ContactsIcon from '@mui/icons-material/Contacts';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ClientOneTapAuth from '../components/ClientOneTapAuth';

const pillars = [
  {
    title: 'Trade',
    icon: HandshakeIcon,
    accent: '#10b981', // Emerald
    desc: 'Exchange harvest yields, execute bulk inputs, and coordinate supply routing with vetted operators.',
    stat: '4,892 Tons Traded',
    link: '/login',
    imageUrl: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=600&auto=format&fit=crop',
  },
  {
    title: 'Meet',
    icon: ContactsIcon,
    accent: '#6366f1', // Indigo
    desc: 'Match with co-founders, connect with local cold-chain riders, and align with regional field agents.',
    stat: '1,200+ Directory Profiles',
    link: '/login',
    imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae4400f7b?q=80&w=600&auto=format&fit=crop',
  },
  {
    title: 'Learn',
    icon: SchoolIcon,
    accent: '#f59e0b', // Amber
    desc: 'Study open-source machinery blueprints, regional soil analysis reports, and field operator logs.',
    stat: '85 blueprints published',
    link: '/about',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
  },
  {
    title: 'Support',
    icon: AttachMoneyIcon,
    accent: '#ec4899', // Pink
    desc: 'Donate resources, back Food Nerve initiatives, claim project grants, and scale local innovations.',
    stat: 'Back Nerve Initiatives',
    link: '/support',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=600&auto=format&fit=crop',
  },
];

export default async function SocietyPublicHomepage() {
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'food';
  const tenant = getTenantConfig(tenantId);
  const content = tenant.org.homepage;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f5f9f3', // Soft organic cream-green canvas
        color: '#112918', // Deep forest green-charcoal text
        pb: 12,
      }}
    >
      {/* Premium Header */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(245, 249, 243, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(27, 94, 32, 0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 900,
            letterSpacing: '-1px',
            color: '#2e7d32',
            background: 'linear-gradient(to right, #2e7d32, #689f38)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {content.title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Link href="/about" passHref style={{ textDecoration: 'none' }}>
            <Button
              variant="outlined"
              sx={{
                borderColor: 'rgba(27, 94, 32, 0.15)',
                color: '#1b5e20',
                borderRadius: '8px',
                px: 3,
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#1b5e20',
                  bgcolor: 'rgba(27, 94, 32, 0.03)',
                },
              }}
            >
              About
            </Button>
          </Link>
          <Link href="/login" passHref style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#2e7d32',
                color: 'white',
                fontWeight: 800,
                borderRadius: '8px',
                px: 3,
                fontSize: '0.8rem',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(46, 125, 50, 0.15)',
                '&:hover': {
                  bgcolor: '#1b5e20',
                },
              }}
            >
              Enter Dashboard
            </Button>
          </Link>
        </Box>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          pt: { xs: 15, md: 20 },
          pb: { xs: 10, md: 14 },
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Subtle background image overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1625246370192-88a31f844060?q=80&w=1200&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.04,
            filter: 'grayscale(1)',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        {/* Glow meshes */}
        <Box
          sx={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(46, 125, 50, 0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              mb: 3,
              fontSize: { xs: '2.5rem', md: '4.2rem' },
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              background: 'linear-gradient(to bottom, #112918, #2a5235)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {content.heroHeadline}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 6,
              color: 'rgba(17, 41, 24, 0.65)',
              lineHeight: 1.7,
              maxWidth: '750px',
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.2rem' },
              fontWeight: 400,
            }}
          >
            {content.heroSubheadline}
          </Typography>
          <Link href="/login" passHref style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                py: 2,
                px: 6,
                fontSize: '1rem',
                borderRadius: '12px',
                bgcolor: '#2e7d32',
                color: 'white',
                fontWeight: 800,
                boxShadow: '0 8px 30px rgba(46, 125, 50, 0.25)',
                transition: 'transform 0.2s, background-color 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  bgcolor: '#1b5e20',
                },
              }}
            >
              {content.ctaText}
            </Button>
          </Link>
        </Container>
      </Box>

      {/* Grid of the Four Pillars */}
      <Container maxWidth="lg">
        <Typography
          variant="overline"
          sx={{
            textAlign: 'center',
            display: 'block',
            mb: 1.5,
            color: 'rgba(17, 41, 24, 0.4)',
            fontWeight: 800,
            letterSpacing: 2,
            fontSize: '0.75rem',
          }}
        >
          SOCIETY PILLARS
        </Typography>
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            fontWeight: 900,
            mb: 8,
            color: '#112918',
            letterSpacing: '-0.02em',
            fontSize: { xs: '1.8rem', md: '2.5rem' },
          }}
        >
          What people are doing in the Society
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 4,
          }}
        >
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Link key={idx} href={pillar.link} style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    bgcolor: 'rgba(255, 255, 255, 0.65)',
                    border: '1px solid rgba(27, 94, 32, 0.08)',
                    borderRadius: '20px',
                    p: 3,
                    transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'pointer',
                    boxShadow: '0 8px 30px rgba(27, 94, 32, 0.02)',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      borderColor: pillar.accent,
                      bgcolor: '#ffffff',
                      boxShadow: `0 16px 40px rgba(27, 94, 32, 0.08), 0 0 15px ${pillar.accent}15`,
                      '& .pillar-icon-box': {
                        bgcolor: `${pillar.accent}12`,
                        color: pillar.accent,
                      },
                      '& .pillar-image': {
                        transform: 'scale(1.05)',
                      },
                    },
                  }}
                >
                  {/* Thumbnail Image */}
                  <Box
                    sx={{
                      width: '100%',
                      aspectRatio: '16/9',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      mb: 2.5,
                      border: '1px solid rgba(27, 94, 32, 0.05)',
                    }}
                  >
                    <Box
                      className="pillar-image"
                      sx={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${pillar.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  </Box>

                  {/* Icon & Title Row */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box
                      className="pillar-icon-box"
                      sx={{
                        display: 'inline-flex',
                        p: 1.2,
                        borderRadius: '10px',
                        bgcolor: 'rgba(27, 94, 32, 0.04)',
                        color: 'rgba(27, 94, 32, 0.6)',
                        transition: 'all 0.25s ease',
                      }}
                    >
                      <Icon sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        color: '#112918',
                        fontSize: '1.05rem',
                      }}
                    >
                      {pillar.title}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(17, 41, 24, 0.6)',
                      lineHeight: 1.6,
                      fontSize: '0.82rem',
                      mb: 3,
                      flexGrow: 1,
                    }}
                  >
                    {pillar.desc}
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      pt: 2.5,
                      borderTop: '1px solid rgba(27, 94, 32, 0.06)',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: pillar.accent,
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {pillar.stat}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'rgba(17, 41, 24, 0.3)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                      }}
                    >
                      →
                    </Typography>
                  </Box>
                </Box>
              </Link>
            );
          })}
        </Box>
      </Container>
      
      {/* Google One Tap Trigger Component */}
      <ClientOneTapAuth />
    </Box>
  );
}
