'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Avatar, Chip, Button, CircularProgress, alpha } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ArticleIcon from '@mui/icons-material/Article';
import WorkIcon from '@mui/icons-material/Work';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams } from 'next/navigation';
import { useSociety } from '@/context/SocietyContext';
import { getPublicOrganization } from '@/lib/actions/organizations';

export default function OrgManageBackstage({ onClose }: { onClose?: () => void }) {
  const { profile, activeOrg } = useSociety();
  const params = useParams();
  const tenant = params.tenant as string || 'darkpore';
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeOrg?.slug) {
      setLoading(true);
      getPublicOrganization(activeOrg.slug).then(res => {
        if (res.success) {
          setOrg(res.data);
        }
        setLoading(false);
      });
    }
  }, [activeOrg]);

  if (!profile || !activeOrg) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><Typography>No active organization context.</Typography></Box>;
  }

  if (loading) {
    return <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;
  }

  if (!org) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><Typography>Organization not found.</Typography></Box>;
  }

  const memberRecord = org.members.find((m: any) => m.user.firebaseUid === profile.uid);
  const isAdmin = memberRecord && (memberRecord.role === 'admin' || memberRecord.role === 'owner');
  const isGlobalAdmin = profile.isAdmin;

  if (!isAdmin && !isGlobalAdmin) {
    return (
      <Box sx={{ p: 6, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'flex-end', mb: 2 }}>
          {onClose && (
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onClose} sx={{ borderRadius: '12px', fontWeight: 700 }}>
              Back to Profile
            </Button>
          )}
        </Box>
        <SecurityIcon sx={{ fontSize: 64, color: '#ef4444', mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>Access Denied</Typography>
        <Typography sx={{ color: '#64748b' }}>You do not have administrative privileges for {org.name}.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100%' }}>
      {/* HEADER */}
      <Box sx={{ display: 'flex', width: '100%', justifyContent: 'flex-end', mb: 2 }}>
        {onClose && (
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onClose} sx={{ borderRadius: '12px', fontWeight: 700 }}>
            Back to Profile
          </Button>
        )}
      </Box>
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
          href={`/modular-society/${tenant}/@o-${org.slug}`}
          sx={{ fontWeight: 700, borderRadius: '12px', borderColor: '#cbd5e1', color: '#0f172a', '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' } }}
        >
          View Public Profile
        </Button>
      </Box>

      <Grid container spacing={3}>
        
        {/* ROW 1: VERIFICATION & STATS */}
        <Grid size={{ xs: 12, md: 4 }}>
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

        <Grid size={{ xs: 12, md: 8 }}>
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
        <Grid size={{ xs: 12 }}>
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
                  {org.members?.map((member: any) => (
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

        {/* ROW 3: ORG ACTIVITY & AUDIT LOG */}
        <Grid size={{ xs: 12 }}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: '24px', border: '1px solid #e2e8f0', mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Organization Activity & Updates
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Real-time audit log of team actions, verification milestones, and system updates
                </Typography>
              </Box>
              <Chip label="Live Feed" color="success" size="small" sx={{ fontWeight: 700, borderRadius: '8px' }} />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                {
                  title: 'New Team Member Onboarded',
                  desc: 'Member added to organization workspace with Default Member permissions.',
                  time: '1 hour ago',
                  tag: 'ROSTER',
                  color: '#3b82f6',
                },
                {
                  title: 'CAC Corporate Documents Submitted',
                  desc: 'Corporate Registration filing submitted for Rank 4 verification review.',
                  time: 'Yesterday at 11:15',
                  tag: 'COMPLIANCE',
                  color: '#f59e0b',
                },
                {
                  title: 'Ecosystem Grant Application Initiated',
                  desc: 'Agricultural Logistics Expansion proposal drafted under Society Grants.',
                  time: '4 days ago',
                  tag: 'PROPOSALS',
                  color: '#10b981',
                },
                {
                  title: 'Tax Clearance Certificate Verified',
                  desc: 'Institutional tax compliance document verified by FoodNerve Admin.',
                  time: '1 week ago',
                  tag: 'VERIFICATION',
                  color: '#8b5cf6',
                },
              ].map((act, i) => (
                <Paper
                  key={i}
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: '#f8fafc',
                    borderRadius: '14px',
                    border: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                        {act.title}
                      </Typography>
                      <Chip
                        label={act.tag}
                        size="small"
                        sx={{
                          fontSize: '0.6rem',
                          fontWeight: 800,
                          bgcolor: alpha(act.color, 0.1),
                          color: act.color,
                          borderRadius: '6px',
                        }}
                      />
                    </Box>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {act.desc}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {act.time}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}
