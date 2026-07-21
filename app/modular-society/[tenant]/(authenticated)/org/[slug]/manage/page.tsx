import React from 'react';
import { Box, Typography, Paper, Grid, Avatar, Chip, Button } from '@mui/material';
import { prisma } from '@/lib/db/client';
import { redirect } from 'next/navigation';
import { getFirebaseUser } from '@/lib/auth/firebase-admin';
import { cookies } from 'next/headers';
import BusinessIcon from '@mui/icons-material/Business';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ArticleIcon from '@mui/icons-material/Article';
import WorkIcon from '@mui/icons-material/Work';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default async function OrgManagementDashboard({ params }: { params: { slug: string, tenant: string } }) {
  // 1. Auth Check
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  if (!sessionCookie) redirect('/login');
  
  const decodedToken = await getFirebaseUser(sessionCookie);
  if (!decodedToken) redirect('/login');

  const user = await prisma.user.findUnique({ where: { firebaseUid: decodedToken.uid } });
  if (!user) redirect('/login');

  // 2. Fetch Organization & Verify Admin Rights
  const org = await prisma.organization.findUnique({
    where: { slug: params.slug },
    include: {
      members: {
        include: { user: true }
      },
      tradeListings: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!org) {
    return <Box sx={{ p: 4 }}><Typography>Organization not found.</Typography></Box>;
  }

  // Check if current user is an admin or owner of this org
  const memberRecord = org.members.find(m => m.userId === user.id);
  const isAdmin = memberRecord && (memberRecord.role === 'admin' || memberRecord.role === 'owner');

  // Global platform owners can also access it
  const isGlobalAdmin = user.role === 'admin' || user.role === 'super_admin';

  if (!isAdmin && !isGlobalAdmin) {
    return (
      <Box sx={{ p: 6, textAlign: 'center', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <SecurityIcon sx={{ fontSize: 64, color: '#ef4444', mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>Access Denied</Typography>
        <Typography sx={{ color: '#64748b' }}>You do not have administrative privileges for {org.name}.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* HEADER */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar src={org.logoUrl || ''} variant="rounded" sx={{ width: 64, height: 64, borderRadius: '16px', bgcolor: '#e2e8f0' }}>
              <BusinessIcon sx={{ fontSize: 32, color: '#94a3b8' }} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
              {org.name} <Chip label="Backstage Admin" size="small" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontWeight: 700, borderRadius: '8px' }} />
            </Typography>
            <Typography sx={{ color: '#64748b', fontWeight: 500 }}>
              Management Dashboard
            </Typography>
          </Box>
        </Box>
        
        <Button 
          variant="outlined" 
          component="a"
          href={`/modular-society/${params.tenant}/@o-${org.slug}`}
          sx={{ fontWeight: 700, borderRadius: '12px', borderColor: '#cbd5e1', color: '#0f172a', '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' } }}
        >
          View Public Profile
        </Button>
      </Box>

      <Grid container spacing={3}>
        
        {/* ROW 1: VERIFICATION & STATS */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: '1px solid #e2e8f0', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <VerifiedUserIcon sx={{ color: org.verified ? '#3b82f6' : '#94a3b8' }} /> Verification Status
            </Typography>
            {org.verified ? (
              <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', p: 2, borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <Typography sx={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon fontSize="small" /> Rank 4: Verified Partner
                </Typography>
                <Typography sx={{ color: '#059669', fontSize: '0.85rem', mt: 1 }}>
                  This organization is fully vetted and receives official ecosystem badges.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', p: 2, borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <Typography sx={{ color: '#d97706', fontWeight: 700 }}>Rank 1: Unverified Entity</Typography>
                <Typography sx={{ color: '#b45309', fontSize: '0.85rem', mt: 1, mb: 2 }}>
                  Submit your CAC documents or institutional email to upgrade to Rank 4.
                </Typography>
                <Button variant="contained" size="small" sx={{ bgcolor: '#f59e0b', color: '#fff', fontWeight: 700, textTransform: 'none', borderRadius: '8px', boxShadow: 'none' }}>
                  Begin Verification
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', border: '1px solid #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column' }}>
             <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>Quick Actions</Typography>
             <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, flex: 1 }}>
                <Button variant="outlined" startIcon={<ArticleIcon />} sx={{ justifyContent: 'flex-start', p: 2, borderRadius: '16px', borderColor: '#e2e8f0', color: '#334155', fontWeight: 600, '&:hover': { bgcolor: '#f8fafc' } }}>
                  Draft New Wiki Article
                </Button>
                <Button variant="outlined" startIcon={<WorkIcon />} sx={{ justifyContent: 'flex-start', p: 2, borderRadius: '16px', borderColor: '#e2e8f0', color: '#334155', fontWeight: 600, '&:hover': { bgcolor: '#f8fafc' } }}>
                  Post New Job Listing
                </Button>
             </Box>
          </Paper>
        </Grid>

        {/* ROW 2: TEAM ROSTER */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: '24px', border: '1px solid #e2e8f0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>Team Roster</Typography>
                <Button size="small" sx={{ fontWeight: 700, borderRadius: '8px', bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>Manage Roles</Button>
            </Box>
            
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>Member</th>
                    <th style={{ padding: '12px 16px' }}>Platform Rank</th>
                    <th style={{ padding: '12px 16px' }}>Org Role</th>
                    <th style={{ padding: '12px 16px' }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {org.members.map(member => (
                    <tr key={member.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={member.user.avatarUrl || ''} sx={{ width: 40, height: 40 }} />
                          <Box>
                            <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>{member.user.name}</Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>{member.user.email}</Typography>
                          </Box>
                        </Box>
                      </td>
                      <td style={{ padding: '16px', color: '#334155', fontWeight: 600 }}>Rank {member.user.rank}</td>
                      <td style={{ padding: '16px' }}>
                        <Chip 
                          label={member.role} 
                          size="small" 
                          sx={{ 
                            fontWeight: 700, textTransform: 'capitalize', borderRadius: '8px',
                            bgcolor: member.role === 'owner' ? 'rgba(245, 158, 11, 0.1)' : (member.role === 'admin' ? 'rgba(139, 92, 246, 0.1)' : '#f1f5f9'),
                            color: member.role === 'owner' ? '#d97706' : (member.role === 'admin' ? '#8b5cf6' : '#64748b'),
                          }} 
                        />
                      </td>
                      <td style={{ padding: '16px', color: '#64748b', fontSize: '0.9rem' }}>
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}
