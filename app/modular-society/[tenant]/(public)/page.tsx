import React from 'react';
import { Box, Typography, Button, Container, Grid } from '@mui/material';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/cms';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ContactsIcon from '@mui/icons-material/Contacts';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SocietyHero from './components/SocietyHero';
import SocietyNavigation from './components/SocietyNavigation';
import SpaIcon from '@mui/icons-material/Spa';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PublicIcon from '@mui/icons-material/Public';
const pillars = [
  {
    title: 'Trade',
    icon: HandshakeIcon,
    accent: '#10b981', // Emerald
    desc: 'Exchange harvest yields, execute bulk inputs, and coordinate supply routing with vetted operators.',
    stat: '4,892 Tons Traded',
    link: '/join',
    imageUrl: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=800&auto=format&fit=crop',
  },
  {
    title: 'Meet',
    icon: ContactsIcon,
    accent: '#6366f1', // Indigo
    desc: 'Match with co-founders, connect with local cold-chain riders, and align with regional field agents.',
    stat: '1,200+ Profiles',
    link: '/join',
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
  const slideshow = content.featuredSlideshow || [];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f2f7f1',
        color: '#0f2414',
        pb: 12,
        overflow: 'hidden',
      }}
    >
      <style suppressHydrationWarning>{`
        @keyframes scrollMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
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
          45% { transform: scale(1.2); }
        }
        @keyframes bgShift {
          0% { background-position: 0% 0%, 0% 0%, 0 0, 0 0; }
          100% { background-position: 100% 100%, -100% -100%, 40px 40px, 40px 40px; }
        }
      `}</style>

      {/* Royal Society Inspired Hero Section */}
      <SocietyNavigation />
      <SocietyHero 
          boardData={{
              displayName: 'Food Nerve Society',
              tagline: content.heroHeadline,
              publicPageSettings: { valueProposition: content.heroSubheadline }
          }} 
          updates={[
            {
                id: 'upd_1',
                label: 'New Innovation Lab Opened',
                value: 142,
                icon: SpaIcon,
                description: 'Pioneering agricultural and food system solutions.',
                gradient: `linear-gradient(135deg, #4CAF50 0%, #1b5e20 100%)`,
                bgGradient: `linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(27, 94, 32, 0.2) 100%)`,
                imageUrl: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=800&auto=format&fit=crop',
                tag: 'Innovator',
            },
            {
                id: 'upd_2',
                label: 'Series A Capital Deployed',
                value: 5200000,
                icon: MonetizationOnIcon,
                description: 'Funding channeled into sustainable food ventures.',
                gradient: `linear-gradient(135deg, #d97706 0%, #b45309 100%)`,
                bgGradient: `linear-gradient(135deg, rgba(217, 119, 6, 0.2) 0%, rgba(180, 83, 9, 0.2) 100%)`,
                imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop',
                tag: 'Investor',
            },
            {
                id: 'upd_3',
                label: 'Global Membership Milestone',
                value: 12000,
                icon: PublicIcon,
                description: 'Farmers, scientists, and investors uniting.',
                gradient: `linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)`,
                bgGradient: `linear-gradient(135deg, rgba(25, 118, 210, 0.2) 0%, rgba(13, 71, 161, 0.2) 100%)`,
                imageUrl: 'https://images.unsplash.com/photo-1559884743-74a57598c6c7?q=80&w=800&auto=format&fit=crop',
                tag: 'Pioneer',
            },
            {
                id: 'upd_4',
                label: 'New Regional Hub',
                value: 4,
                icon: ContactsIcon,
                description: 'Connecting farmers directly with cold-chain transport.',
                gradient: `linear-gradient(135deg, #9c27b0 0%, #4a148c 100%)`,
                bgGradient: `linear-gradient(135deg, rgba(156, 39, 176, 0.2) 0%, rgba(74, 20, 140, 0.2) 100%)`,
                imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae4400f7b?q=80&w=800&auto=format&fit=crop',
                tag: 'Operator',
            },
            {
                id: 'upd_5',
                label: 'Soil Blueprint Published',
                value: 85,
                icon: SchoolIcon,
                description: 'Open-source blueprints for regional soil analysis.',
                gradient: `linear-gradient(135deg, #e91e63 0%, #880e4f 100%)`,
                bgGradient: `linear-gradient(135deg, rgba(233, 30, 99, 0.2) 0%, rgba(136, 14, 79, 0.2) 100%)`,
                imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
                tag: 'Researcher',
            },
            {
                id: 'upd_6',
                label: 'Bulk Crop Traded',
                value: 4892,
                icon: HandshakeIcon,
                description: 'Tons of harvest yields exchanged this quarter.',
                gradient: `linear-gradient(135deg, #00bcd4 0%, #006064 100%)`,
                bgGradient: `linear-gradient(135deg, rgba(0, 188, 212, 0.2) 0%, rgba(0, 96, 100, 0.2) 100%)`,
                imageUrl: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=800&auto=format&fit=crop',
                tag: 'Pioneer',
            },
            {
                id: 'upd_7',
                label: 'Grant Backing Secured',
                value: 200000,
                icon: AttachMoneyIcon,
                description: 'Local initiative backed by Food Nerve grants.',
                gradient: `linear-gradient(135deg, #ff9800 0%, #e65100 100%)`,
                bgGradient: `linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(230, 81, 0, 0.2) 100%)`,
                imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=800&auto=format&fit=crop',
                tag: 'Regulator',
            },
            {
                id: 'upd_8',
                label: 'Ecosystem Expansion',
                value: 24,
                icon: PublicIcon,
                description: 'New partners joined the Sustainable Soil Consortium.',
                gradient: `linear-gradient(135deg, #3f51b5 0%, #1a237e 100%)`,
                bgGradient: `linear-gradient(135deg, rgba(63, 81, 181, 0.2) 0%, rgba(26, 35, 126, 0.2) 100%)`,
                imageUrl: 'https://images.unsplash.com/photo-1559884743-74a57598c6c7?q=80&w=800&auto=format&fit=crop',
                tag: 'Innovator',
            }
          ]} 
      />

      {/* Social Proof Marquee */}
      <Box sx={{ 
          py: { xs: 4, md: 5 }, 
          borderBottom: '1px solid rgba(27, 94, 32, 0.08)', 
          background: 'linear-gradient(to right, rgba(255,255,255,0.95), rgba(255,255,255,0.8), rgba(255,255,255,0.95))', 
          backdropFilter: 'blur(10px)',
          overflow: 'hidden' 
        }}>
        <Typography variant="overline" sx={{ textAlign: 'center', display: 'block', mb: 3, color: 'rgba(15, 36, 20, 0.5)', fontWeight: 900, letterSpacing: 3 }}>
          TRUSTED BY PIONEERS ACROSS THE GLOBE
        </Typography>
        <Box sx={{ display: 'flex', width: '200%', animation: 'scrollMarquee 40s linear infinite' }}>
          {[...partners, ...partners].map((partner, idx) => (
            <Typography key={idx} sx={{ 
                flex: 1, 
                textAlign: 'center', 
                fontSize: { xs: '1.2rem', md: '1.6rem' }, 
                fontWeight: 900, 
                color: 'transparent',
                WebkitTextStroke: '1px rgba(15, 36, 20, 0.2)', // Premium outline text
                letterSpacing: '1px' 
            }}>
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
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: '28px',
                    overflow: 'hidden',
                    opacity: 0, // Starts invisible for cascade
                    animation: `slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                    animationDelay: `${idx * 0.15}s`, // Cascade delay
                    cursor: 'pointer',
                    boxShadow: '0 10px 40px rgba(15, 36, 20, 0.03)',
                    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s, background 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-12px)',
                      boxShadow: `0 30px 60px rgba(15, 36, 20, 0.08), 0 0 0 2px ${pillar.accent}`,
                      bgcolor: 'rgba(255,255,255,0.95)',
                      '& .pillar-image': { transform: 'scale(1.08)' },
                      '& .pillar-overlay': { opacity: 0.2 },
                    },
                  }}
                >
                  <Box
                    className="pillar-image"
                    sx={{
                      height: '240px',
                      background: `url(${pillar.imageUrl}) center/cover`,
                      transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />
                  <Box
                    className="pillar-overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '240px',
                      background: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)`,
                      opacity: 0.8,
                      transition: 'opacity 0.5s',
                    }}
                  />
                  <Box sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: `${pillar.accent}15`,
                        color: pillar.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                        animation: iconAnimation,
                        transformOrigin: 'center center',
                      }}
                    >
                        <Icon sx={{ fontSize: 28 }} />
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f2414', letterSpacing: '-1px' }}>
                        {pillar.title}
                      </Typography>

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
