import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/cms';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ContactsIcon from '@mui/icons-material/Contacts';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const pillars = [
  {
    title: 'Trade',
    icon: HandshakeIcon,
    accent: '#10b981', // Emerald
    desc: 'Exchange harvest yields, execute bulk inputs, and coordinate supply routing with vetted operators.',
    stat: '4,892 Tons Traded',
    link: '/login',
    imageUrl: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=800&auto=format&fit=crop',
  },
  {
    title: 'Meet',
    icon: ContactsIcon,
    accent: '#6366f1', // Indigo
    desc: 'Match with co-founders, connect with local cold-chain riders, and align with regional field agents.',
    stat: '1,200+ Profiles',
    link: '/login',
    imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae4400f7b?q=80&w=800&auto=format&fit=crop',
  },
  {
    title: 'Learn',
    icon: SchoolIcon,
    accent: '#f59e0b', // Amber
    desc: 'Study open-source machinery blueprints, regional soil analysis reports, and field operator logs.',
    stat: '85 Blueprints',
    link: '/about',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
  },
  {
    title: 'Support',
    icon: AttachMoneyIcon,
    accent: '#ec4899', // Pink
    desc: 'Donate resources, back Food Nerve initiatives, claim project grants, and scale local innovations.',
    stat: 'Active Initiatives',
    link: '/support',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=800&auto=format&fit=crop',
  },
];

const partners = [
  "Global Agritech Partners", "Green Earth Initiative", "Sustainable Soil Consortium", "Future Farm Network", "AgriSupply Co", "Rural Innovators"
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
        bgcolor: '#f2f7f1', // Ultra-soft organic base
        color: '#0f2414',
        pb: 12,
        overflow: 'hidden',
      }}
    >
      <style suppressHydrationWarning>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes scrollMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes animTrade {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        @keyframes animMeet {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes animLearn {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes animSupport {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.2); }
          30% { transform: scale(1); }
          45% { transform: scale(1.2); }
        }
      `}</style>

      {/* Premium Header */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(242, 247, 241, 0.6)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(27, 94, 32, 0.05)',
          position: 'fixed',
          width: '100%',
          top: 0,
          zIndex: 1000,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 900,
            letterSpacing: '-1.5px',
            color: '#1b5e20',
            textTransform: 'uppercase',
            fontSize: '1.4rem'
          }}
        >
          {content.title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Link href="/about" passHref style={{ textDecoration: 'none' }}>
            <Button
              variant="text"
              sx={{
                color: '#1b5e20',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': { bgcolor: 'rgba(27, 94, 32, 0.05)' },
              }}
            >
              Our Story
            </Button>
          </Link>
          <Link href="/login" passHref style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#1b5e20',
                color: 'white',
                fontWeight: 800,
                borderRadius: '24px',
                px: 4,
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(27, 94, 32, 0.25)',
                '&:hover': { bgcolor: '#112918', transform: 'translateY(-1px)', boxShadow: '0 12px 28px rgba(27, 94, 32, 0.3)' },
                transition: 'all 0.2s',
              }}
            >
              Sign In
            </Button>
          </Link>
        </Box>
      </Box>

      {/* Immersive Hero Section */}
      <Box
        sx={{
          position: 'relative',
          pt: { xs: 20, md: 28 },
          pb: { xs: 12, md: 16 },
          textAlign: 'center',
          background: 'linear-gradient(-45deg, #e8f3e6, #f2f7f1, #e0efe0, #f2f7f1)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1625246370192-88a31f844060?q=80&w=1800&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.03,
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ animation: 'float 6s ease-in-out infinite' }}>
            <Typography
              variant="overline"
              sx={{
                fontWeight: 800,
                letterSpacing: '4px',
                color: '#2e7d32',
                mb: 2,
                display: 'block',
                bgcolor: 'rgba(46, 125, 50, 0.1)',
                py: 0.5,
                px: 2,
                borderRadius: '20px',
                width: 'fit-content',
                mx: 'auto'
              }}
            >
              THE NEW AGRITECH FRONTIER
            </Typography>
          </Box>
          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              mb: 3,
              fontSize: { xs: '3rem', md: '5.5rem' },
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              color: '#0f2414',
            }}
          >
            {content.heroHeadline}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 6,
              color: 'rgba(15, 36, 20, 0.7)',
              lineHeight: 1.6,
              maxWidth: '800px',
              mx: 'auto',
              fontSize: { xs: '1.1rem', md: '1.4rem' },
              fontWeight: 400,
            }}
          >
            {content.heroSubheadline}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" passHref style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  py: 2.5,
                  px: 6,
                  fontSize: '1.1rem',
                  borderRadius: '32px',
                  bgcolor: '#1b5e20',
                  color: 'white',
                  fontWeight: 800,
                  boxShadow: '0 12px 35px rgba(27, 94, 32, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.02)',
                    bgcolor: '#112918',
                    boxShadow: '0 20px 45px rgba(27, 94, 32, 0.4)',
                  },
                }}
              >
                {content.ctaText}
              </Button>
            </Link>
            <Link href="/about" passHref style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  py: 2.5,
                  px: 6,
                  fontSize: '1.1rem',
                  borderRadius: '32px',
                  borderColor: 'rgba(27, 94, 32, 0.2)',
                  color: '#1b5e20',
                  fontWeight: 800,
                  bgcolor: 'rgba(255,255,255,0.5)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s',
                  '&:hover': {
                    borderColor: '#1b5e20',
                    bgcolor: 'rgba(255,255,255,0.8)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Learn More
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>

      {/* Social Proof Marquee */}
      <Box sx={{ py: 6, borderBottom: '1px solid rgba(27, 94, 32, 0.05)', bgcolor: 'white', overflow: 'hidden' }}>
        <Typography variant="overline" sx={{ textAlign: 'center', display: 'block', mb: 3, color: 'rgba(15, 36, 20, 0.4)', fontWeight: 800, letterSpacing: 2 }}>
          TRUSTED BY PIONEERS ACROSS THE GLOBE
        </Typography>
        <Box sx={{ display: 'flex', width: '200%', animation: 'scrollMarquee 30s linear infinite' }}>
          {[...partners, ...partners].map((partner, idx) => (
            <Typography key={idx} sx={{ flex: 1, textAlign: 'center', fontSize: '1.4rem', fontWeight: 900, color: 'rgba(15, 36, 20, 0.2)', letterSpacing: '-0.5px' }}>
              {partner}
            </Typography>
          ))}
        </Box>
      </Box>

      {/* Grid of the Four Pillars */}
      <Container maxWidth="xl" sx={{ mt: { xs: 10, md: 16 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 12 } }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: '#0f2414',
              letterSpacing: '-0.03em',
              fontSize: { xs: '2.5rem', md: '4rem' },
              mb: 2
            }}
          >
            The Ecosystem
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(15, 36, 20, 0.6)', fontWeight: 400, maxWidth: '600px', mx: 'auto' }}>
            Four distinct operational pillars designed to propel your agricultural venture into the future.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: { xs: 4, xl: 6 },
            px: { xs: 2, lg: 4 }
          }}
        >
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            
            // Assign specific animation based on pillar
            let iconAnimation = 'none';
            if (pillar.title === 'Trade') iconAnimation = 'animTrade 2s infinite';
            if (pillar.title === 'Meet') iconAnimation = 'animMeet 3s ease-in-out infinite';
            if (pillar.title === 'Learn') iconAnimation = 'animLearn 10s linear infinite';
            if (pillar.title === 'Support') iconAnimation = 'animSupport 1.5s infinite';

            return (
              <Link key={idx} href={pillar.link} style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    bgcolor: 'white',
                    borderRadius: '28px',
                    overflow: 'hidden',
                    opacity: 0, // Starts invisible for cascade
                    animation: `slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                    animationDelay: `${idx * 0.15}s`, // Cascade delay
                    cursor: 'pointer',
                    boxShadow: '0 10px 40px rgba(15, 36, 20, 0.03)',
                    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s',
                    '&:hover': {
                      transform: 'translateY(-12px)',
                      boxShadow: `0 30px 60px rgba(15, 36, 20, 0.08), 0 0 0 2px ${pillar.accent}`,
                      '& .pillar-image': { transform: 'scale(1.08)' },
                      '& .pillar-overlay': { opacity: 0.2 },
                    },
                  }}
                >
                  {/* Thumbnail Image */}
                  <Box sx={{ width: '100%', height: '240px', position: 'relative', overflow: 'hidden' }}>
                    <Box
                      className="pillar-image"
                      sx={{
                        width: '100%', height: '100%',
                        backgroundImage: `url(${pillar.imageUrl})`,
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                    <Box className="pillar-overlay" sx={{ position: 'absolute', inset: 0, bgcolor: pillar.accent, opacity: 0, transition: 'opacity 0.5s', mixBlendMode: 'color' }} />
                  </Box>

                  {/* Content Box */}
                  <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box
                        className="pillar-icon-box"
                        sx={{
                          display: 'inline-flex', p: 1.5, borderRadius: '14px',
                          bgcolor: `${pillar.accent}15`, color: pillar.accent,
                          animation: iconAnimation, // Applies the specific feature animation
                        }}
                      >
                        <Icon sx={{ fontSize: 28 }} />
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f2414', letterSpacing: '-1px' }}>
                        {pillar.title}
                      </Typography>
                    </Box>

                    <Typography variant="body1" sx={{ color: 'rgba(15, 36, 20, 0.6)', lineHeight: 1.7, mb: 4, flexGrow: 1, fontSize: '1.05rem' }}>
                      {pillar.desc}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 3, borderTop: '1px solid rgba(15, 36, 20, 0.08)' }}>
                      <Typography variant="caption" sx={{ color: pillar.accent, fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                        {pillar.stat}
                      </Typography>
                      <Typography sx={{ color: '#0f2414', fontWeight: 900, fontSize: '1.2rem' }}>→</Typography>
                    </Box>
                  </Box>
                </Box>
              </Link>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}
