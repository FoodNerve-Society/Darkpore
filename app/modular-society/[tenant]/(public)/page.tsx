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
    desc: 'Donate resources, back FoodNerve initiatives, claim project grants, and scale local innovations.',
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
              displayName: 'FoodNerve Society',
              tagline: content.heroHeadline,
              publicPageSettings: { valueProposition: content.heroSubheadline }
          }} 
          updates={[
            {
                id: 'act_1',
                userName: 'Aisha Ibrahim',
                avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1bfa82?q=80&w=200&auto=format&fit=crop',
                timeAgo: '2m ago',
                tab: 'TRADE',
                action: 'listed 500kg of Cassava Tubers',
                gradient: `linear-gradient(135deg, #10b981 0%, #047857 100%)`, // Emerald
                icon: HandshakeIcon
            },
            {
                id: 'act_2',
                userName: 'David Okeke',
                avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop',
                timeAgo: '5m ago',
                tab: 'LEARN',
                action: 'published "Northern Soil Analysis" blueprint',
                gradient: `linear-gradient(135deg, #f59e0b 0%, #b45309 100%)`, // Amber
                icon: SchoolIcon
            },
            {
                id: 'act_3',
                userName: 'Chioma O.',
                avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
                timeAgo: '12m ago',
                tab: 'MEET',
                action: 'responded to the Daily Spark discussion',
                gradient: `linear-gradient(135deg, #6366f1 0%, #4338ca 100%)`, // Indigo
                icon: ContactsIcon
            },
            {
                id: 'act_4',
                userName: 'FarmTech Solutions',
                avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop',
                timeAgo: '18m ago',
                tab: 'SUPPORT',
                action: 'donated $500 to the Rural Irrigation Initiative',
                gradient: `linear-gradient(135deg, #ec4899 0%, #be185d 100%)`, // Pink
                icon: AttachMoneyIcon
            },
            {
                id: 'act_5',
                userName: 'Musa Bello',
                avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
                timeAgo: '22m ago',
                tab: 'PROFILE',
                action: 'verified their Pioneer business account',
                gradient: `linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)`, // Sky Blue
                icon: PublicIcon
            },
            {
                id: 'act_6',
                userName: 'Grace Nnamdi',
                avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
                timeAgo: '28m ago',
                tab: 'TRADE',
                action: 'purchased 2 tons of Fertilizer',
                gradient: `linear-gradient(135deg, #10b981 0%, #047857 100%)`, // Emerald
                icon: HandshakeIcon
            },
            {
                id: 'act_7',
                userName: 'Dr. Tunde Alabi',
                avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
                timeAgo: '35m ago',
                tab: 'LEARN',
                action: 'completed the "Cold Chain Logistics" module',
                gradient: `linear-gradient(135deg, #f59e0b 0%, #b45309 100%)`, // Amber
                icon: SchoolIcon
            },
            {
                id: 'act_8',
                userName: 'Sarah Adeyemi',
                avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
                timeAgo: '41m ago',
                tab: 'MEET',
                action: 'upvoted the top Daily Spark response',
                gradient: `linear-gradient(135deg, #6366f1 0%, #4338ca 100%)`, // Indigo
                icon: ContactsIcon
            },
            {
                id: 'act_9',
                userName: 'Global Agritech',
                avatarUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=200&auto=format&fit=crop',
                timeAgo: '49m ago',
                tab: 'SUPPORT',
                action: 'launched a new Grant for Solar Machinery',
                gradient: `linear-gradient(135deg, #ec4899 0%, #be185d 100%)`, // Pink
                icon: AttachMoneyIcon
            },
            {
                id: 'act_10',
                userName: 'Ikenna Okafor',
                avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
                timeAgo: '1h ago',
                tab: 'PROFILE',
                action: 'updated their KYC documentation',
                gradient: `linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)`, // Sky Blue
                icon: PublicIcon
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
