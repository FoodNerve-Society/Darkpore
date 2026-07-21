'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, Chip, CircularProgress, Container, Button, Paper, IconButton } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { getPublicUser, getCurrentSessionUser } from '@/lib/actions/users';
import VerifiedIcon from '@mui/icons-material/Verified';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import FlipContainer from '@/components/shared/FlipContainer';

export default function PublicUserProfile({ username, tenant, onFlipRequest }: { username: string, tenant: string, onFlipRequest?: () => void }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSelf, setIsSelf] = useState(false);

  useEffect(() => {
    async function load() {
      if (!username) return;
      const userRes = await getPublicUser(username);
      if (userRes.success) {
        setUser(userRes.data);
        
        // Check if viewing own profile
        const sessionRes = await getCurrentSessionUser();
        if (sessionRes.success && sessionRes.data) {
          if (sessionRes.data.username === username) {
            setIsSelf(true);
          }
        }
      }
      setLoading(false);
    }
    load();
  }, [username]);

  if (loading) return <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><CircularProgress sx={{ color: '#3b82f6' }} /></Box>;
  if (!user) return <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant="h5">User not found</Typography></Box>;

  return (
    <FlipContainer>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 10 }}>
        {/* HERO BANNER */}
        <Box sx={{ 
          height: 240, 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Glass overlay */}
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.2) 0%, transparent 60%)' }} />
        </Box>

        <Container maxWidth="md" sx={{ mt: -10, position: 'relative', zIndex: 10 }}>
          {/* PROFILE CARD */}
          <Paper elevation={0} sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: '24px', 
            bgcolor: 'rgba(255, 255, 255, 0.9)', 
            backdropFilter: 'blur(20px)',
            boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)',
            border: '1px solid rgba(255,255,255,0.5)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
          }}>
            <Avatar 
              src={user.avatarUrl || ''} 
              sx={{ 
                width: 140, height: 140, 
                border: '6px solid #fff', 
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                mb: 3
              }} 
            />
            
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              {user.name}
              {user.rank >= 4 && <VerifiedIcon sx={{ color: '#3b82f6', fontSize: 28 }} />}
            </Typography>
            
            <Typography sx={{ color: '#64748b', fontSize: '1.2rem', fontWeight: 500, mb: 2 }}>
              {user.specialization || 'Ecosystem Member'} • Rank {user.rank}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', mb: 4 }}>
              {user.location && (
                <Chip icon={<LocationOnIcon sx={{ fontSize: 16 }} />} label={user.location} size="small" sx={{ bgcolor: 'rgba(15, 23, 42, 0.05)', fontWeight: 600 }} />
              )}
              {user.hasBusinessVerification && (
                <Chip icon={<BusinessIcon sx={{ fontSize: 16 }} />} label="Business Verified" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 700 }} />
              )}
            </Box>

            {user.bio && (
              <Typography sx={{ color: '#334155', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: 600, mx: 'auto', mb: 4 }}>
                {user.bio}
              </Typography>
            )}

            {isSelf && (
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />}
                onClick={() => {
                  if (onFlipRequest) {
                    onFlipRequest();
                  } else {
                    router.push(`/modular-society/${tenant}/profile`);
                  }
                }}
                sx={{ mb: 4, borderRadius: '12px', fontWeight: 600, borderColor: '#cbd5e1', color: '#475569', '&:hover': { bgcolor: '#f1f5f9' } }}
              >
                Edit Profile Settings
              </Button>
            )}

            {/* ORGANIZATIONAL AFFILIATIONS */}
            {user.organizationMemberships?.length > 0 && (
              <Box sx={{ width: '100%', mt: 4, pt: 4, borderTop: '1px solid rgba(15, 23, 42, 0.08)' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 3 }}>Official Affiliations</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {user.organizationMemberships.map((membership: any) => (
                    <Box 
                      key={membership.id}
                      onClick={() => router.push(`/modular-society/${tenant}/@o-${membership.organization.slug}`)}
                      sx={{ 
                        display: 'flex', alignItems: 'center', gap: 2, p: 2, 
                        borderRadius: '16px', border: '1px solid #e2e8f0', 
                        bgcolor: '#fff', cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: '#cbd5e1', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                      }}
                    >
                      <Avatar src={membership.organization.logoUrl} sx={{ width: 48, height: 48, borderRadius: '12px' }} variant="rounded">
                        <BusinessIcon />
                      </Avatar>
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography sx={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {membership.organization.name}
                          {membership.organization.verified && <VerifiedIcon sx={{ fontSize: 14, color: '#3b82f6' }} />}
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'capitalize' }}>
                          {membership.role}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* CALL TO ACTION */}
            {!isSelf && (
              <Box sx={{ mt: 6, p: 3, bgcolor: '#0f172a', borderRadius: '16px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                 <Box sx={{ textAlign: 'left' }}>
                   <Typography sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>Connect with {user.firstName || user.name.split(' ')[0]}</Typography>
                   <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>Join the Food Nerve ecosystem to view their full portfolio and send messages.</Typography>
                 </Box>
                 <Button variant="contained" startIcon={<LockOpenIcon />} sx={{ bgcolor: '#3b82f6', fontWeight: 700, borderRadius: '12px', '&:hover': { bgcolor: '#2563eb' } }}>
                   Unlock Access
                 </Button>
              </Box>
            )}

          </Paper>
        </Container>
      </Box>
    </FlipContainer>
  );
}
