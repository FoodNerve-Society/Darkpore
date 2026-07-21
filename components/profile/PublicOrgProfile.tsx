'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, Chip, CircularProgress, Container, Button, Paper, Grid } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { getPublicOrganization } from '@/lib/actions/organizations';
import { getCurrentSessionUser } from '@/lib/actions/users';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import WorkIcon from '@mui/icons-material/Work';
import FlipContainer from '@/components/shared/FlipContainer';

export default function PublicOrgProfile({ slug, tenant, onFlipRequest }: { slug: string, tenant: string, onFlipRequest?: () => void }) {
  const router = useRouter();
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'people' | 'jobs'>('people');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      const orgRes = await getPublicOrganization(slug);
      if (orgRes.success) {
        setOrg(orgRes.data);
        
        // Check admin status
        const userRes = await getCurrentSessionUser();
        if (userRes.success && userRes.data) {
          const currentUserId = userRes.data.id;
          const memberRecord = orgRes.data.members?.find((m: any) => m.userId === currentUserId);
          if (memberRecord && (memberRecord.role === 'admin' || memberRecord.role === 'owner')) {
            setIsAdmin(true);
          }
        }
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) return <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><CircularProgress sx={{ color: '#3b82f6' }} /></Box>;
  if (!org) return <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant="h5">Organization not found</Typography></Box>;

  return (
    <FlipContainer>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 10 }}>
        {/* HERO BANNER */}
        <Box sx={{ 
          height: 280, 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Glass overlay */}
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.2) 0%, transparent 60%)' }} />
        </Box>

        <Container maxWidth="lg" sx={{ mt: -12, position: 'relative', zIndex: 10 }}>
          {/* PROFILE CARD */}
          <Paper elevation={0} sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: '24px', 
            bgcolor: 'rgba(255, 255, 255, 0.9)', 
            backdropFilter: 'blur(20px)',
            boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)',
            border: '1px solid rgba(255,255,255,0.5)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            mb: 4
          }}>
            <Avatar 
              src={org.logoUrl || ''} 
              variant="rounded"
              sx={{ 
                width: 140, height: 140, 
                borderRadius: '24px',
                border: '6px solid #fff', 
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                mb: 3,
                bgcolor: '#f1f5f9'
              }} 
            >
                <BusinessIcon sx={{ fontSize: 64, color: '#cbd5e1' }} />
            </Avatar>
            
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              {org.name}
              {org.verified && <VerifiedIcon sx={{ color: '#3b82f6', fontSize: 28 }} />}
            </Typography>
            
            <Typography sx={{ color: '#64748b', fontSize: '1.2rem', fontWeight: 500, mb: 2 }}>
              {org.isPlatformOwner ? 'Platform Core' : (org.rank >= 4 ? 'Verified Partner' : 'Community Entity')}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', mb: isAdmin ? 3 : 0 }}>
              {(org.state || org.country) && (
                <Chip icon={<LocationOnIcon sx={{ fontSize: 16 }} />} label={`${org.state ? org.state + ', ' : ''}${org.country || ''}`} size="small" sx={{ bgcolor: 'rgba(15, 23, 42, 0.05)', fontWeight: 600 }} />
              )}
            </Box>

            {isAdmin && (
              <Button 
                variant="contained" 
                onClick={() => {
                  if (onFlipRequest) {
                    onFlipRequest();
                  } else {
                    router.push(`/modular-society/${tenant}/org/${slug}/manage`);
                  }
                }}
                sx={{ bgcolor: '#0f172a', color: '#fff', fontWeight: 700, borderRadius: '12px', px: 4, py: 1, '&:hover': { bgcolor: '#1e293b' } }}
              >
                Manage Organization
              </Button>
            )}
          </Paper>

          {/* TAB NAVIGATION */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center' }}>
            <Button 
              onClick={() => setActiveTab('people')}
              sx={{ 
                px: 4, py: 1.5, borderRadius: '16px', fontWeight: 700, textTransform: 'none',
                bgcolor: activeTab === 'people' ? '#0f172a' : 'transparent',
                color: activeTab === 'people' ? '#fff' : '#64748b',
                '&:hover': { bgcolor: activeTab === 'people' ? '#0f172a' : 'rgba(15, 23, 42, 0.05)' }
              }}
            >
              Our People ({org.members?.length || 0})
            </Button>
            <Button 
              onClick={() => setActiveTab('jobs')}
              sx={{ 
                px: 4, py: 1.5, borderRadius: '16px', fontWeight: 700, textTransform: 'none',
                bgcolor: activeTab === 'jobs' ? '#0f172a' : 'transparent',
                color: activeTab === 'jobs' ? '#fff' : '#64748b',
                '&:hover': { bgcolor: activeTab === 'jobs' ? '#0f172a' : 'rgba(15, 23, 42, 0.05)' }
              }}
            >
              Opportunities ({org.tradeListings?.length || 0})
            </Button>
          </Box>

          {/* TAB CONTENT */}
          {activeTab === 'people' && (
            <Grid container spacing={3}>
              {org.members?.map((member: any) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={member.id}>
                  <Box 
                    onClick={() => router.push(`/modular-society/${tenant}/@u-${member.user.username}`)}
                    sx={{ 
                      display: 'flex', alignItems: 'center', gap: 2, p: 2, 
                      borderRadius: '16px', border: '1px solid #e2e8f0', 
                      bgcolor: '#fff', cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: '#cbd5e1', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                    }}
                  >
                    <Avatar src={member.user.avatarUrl} sx={{ width: 56, height: 56 }} />
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography sx={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {member.user.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 600, textTransform: 'capitalize' }}>
                        {member.role}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {member.user.specialization || `Rank ${member.user.rank} Member`}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
              {(!org.members || org.members.length === 0) && (
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <Typography sx={{ color: '#64748b', fontWeight: 500 }}>No public members listed.</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}

          {activeTab === 'jobs' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {org.tradeListings?.map((job: any) => (
                <Box 
                  key={job.id}
                  onClick={() => router.push(`/innovations/careers/${job.id}`)}
                  sx={{ 
                    display: 'flex', alignItems: 'flex-start', gap: 3, p: 3, 
                    borderRadius: '16px', border: '1px solid #e2e8f0', 
                    bgcolor: '#fff', cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: '#cbd5e1', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                  }}
                >
                  <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
                    <WorkIcon />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>{job.title}</Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                      <Typography sx={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnIcon sx={{ fontSize: 14 }} /> {job.location}
                      </Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                        {job.priceOrAsk}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.9rem', color: '#334155', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {job.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
              {(!org.tradeListings || org.tradeListings.length === 0) && (
                <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <Typography sx={{ color: '#64748b', fontWeight: 500 }}>No active opportunities posted.</Typography>
                </Box>
              )}
            </Box>
          )}
        </Container>
      </Box>
    </FlipContainer>
  );
}
