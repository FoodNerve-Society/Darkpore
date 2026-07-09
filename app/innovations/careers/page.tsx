import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, alpha, IconButton, Chip } from '@mui/material';
import { getCareersListings } from '@/lib/actions/trade';
import Link from 'next/link';
import { format } from 'date-fns';
import { headers } from 'next/headers';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import WorkOutlineIcon from '@mui/icons-material/WorkOutlined';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import PublicIcon from '@mui/icons-material/Public';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// MUI Colors for Food Nerve
const EMERALD = '#10b981';

export default async function CareersPage() {
    const headersList = await headers();
    const rawTenantId = headersList.get('x-tenant-id') || 'food';
    const tenantId = rawTenantId.includes('energy') ? 'energy' : 'food'; // Normalized

    const result = await getCareersListings();

    if (!result.success) {
        return (
            <Container sx={{ py: 10, textAlign: 'center' }}>
                <Typography variant="h5" color="error">Failed to load careers.</Typography>
            </Container>
        );
    }

    const { coreEcosystemRoles, societyPartners, externalSourced } = result;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 10 }}>
            {/* Hero Section */}
            <Box sx={{ 
                pt: { xs: 15, md: 20 }, 
                pb: { xs: 8, md: 12 }, 
                background: `linear-gradient(135deg, ${alpha(EMERALD, 0.1)} 0%, #f8fafc 100%)`,
                borderBottom: `1px solid ${alpha(EMERALD, 0.1)}`,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                    <Box sx={{ maxWidth: 800 }}>
                        <Typography variant="overline" sx={{ color: EMERALD, fontWeight: 700, letterSpacing: 2, display: 'block', mb: 2 }}>
                            IMPACT CAREERS
                        </Typography>
                        <Typography variant="h1" sx={{ fontSize: { xs: '3rem', md: '5rem' }, fontWeight: 900, color: '#0f172a', mb: 3, lineHeight: 1.1 }}>
                            Build the <br />Future of Food.
                        </Typography>
                        <Typography variant="h5" sx={{ color: '#475569', mb: 4, fontWeight: 400, lineHeight: 1.6, maxWidth: 600 }}>
                            Join the movement. Discover roles across our core ecosystem, network partners, and the global industry.
                        </Typography>
                    </Box>
                </Container>
                {/* Decorative background circle */}
                <Box sx={{ 
                    position: 'absolute', top: -100, right: -100, width: 500, height: 500, 
                    borderRadius: '50%', background: `radial-gradient(circle, ${alpha(EMERALD, 0.05)} 0%, transparent 70%)`, zIndex: 1
                }} />
            </Box>

            <Container maxWidth="lg" sx={{ mt: { xs: -4, md: -6 }, position: 'relative', zIndex: 3 }}>
                <Swimlane 
                    title="Core Ecosystem Roles" 
                    subtitle="Direct opportunities at Food Nerve and our foundational partners."
                    icon={<WorkOutlineIcon sx={{ color: EMERALD, fontSize: 32 }} />}
                    jobs={coreEcosystemRoles} 
                    tenantId={tenantId}
                />
                
                <Swimlane 
                    title="Society Partners" 
                    subtitle="Join validated organizations driving change within our network."
                    icon={<GroupWorkIcon sx={{ color: '#3b82f6', fontSize: 32 }} />}
                    jobs={societyPartners} 
                    tenantId={tenantId}
                />
                
                <Swimlane 
                    title="External Opportunities" 
                    subtitle="Curated roles sourced from the broader industry."
                    icon={<PublicIcon sx={{ color: '#f59e0b', fontSize: 32 }} />}
                    jobs={externalSourced} 
                    tenantId={tenantId}
                />
            </Container>
        </Box>
    );
}

function Swimlane({ title, subtitle, icon, jobs, tenantId }: { title: string, subtitle: string, icon: React.ReactNode, jobs: any[], tenantId: string }) {
    if (!jobs || jobs.length === 0) return null;

    return (
        <Box sx={{ mb: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
                <Box sx={{ 
                    width: 56, height: 56, borderRadius: '16px', 
                    bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                    {icon}
                </Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>{title}</Typography>
                </Box>
            </Box>
            <Typography variant="body1" sx={{ color: '#64748b', mb: 4, ml: { xs: 0, sm: 9 } }}>{subtitle}</Typography>

            <Box sx={{ 
                display: 'flex', 
                overflowX: 'auto', 
                gap: 3, 
                pb: 4, 
                px: { xs: 2, sm: 1, md: 0 },
                ml: { xs: -2, sm: -1, md: 0 },
                mr: { xs: -2, sm: -1, md: 0 },
                scrollSnapType: 'x mandatory',
                '&::-webkit-scrollbar': { height: 8 },
                '&::-webkit-scrollbar-track': { bgcolor: alpha('#0f172a', 0.05), borderRadius: 4 },
                '&::-webkit-scrollbar-thumb': { bgcolor: alpha('#0f172a', 0.2), borderRadius: 4, '&:hover': { bgcolor: alpha('#0f172a', 0.3) } },
            }}>
                {jobs.map((job) => (
                    <JobCard key={job.id} job={job} tenantId={tenantId} />
                ))}
            </Box>
        </Box>
    );
}

function JobCard({ job, tenantId }: { job: any, tenantId: string }) {
    const isVolunteer = job.category === 'volunteer';
    const org = job.organization;
    const isExternal = org?.isExternal;
    
    // Fallback UI data
    const orgName = isExternal ? org.externalEntityName : org?.name;
    const orgLogo = isExternal ? org.externalEntityLogoUrl : org?.logoUrl;

    const locationText = [job.city?.name, job.state?.name, job.country?.name].filter(Boolean).join(', ');

    return (
        <Card sx={{ 
            minWidth: { xs: 280, sm: 320, md: 360 }, 
            maxWidth: { xs: 280, sm: 320, md: 360 }, 
            borderRadius: '24px',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease',
            border: '1px solid',
            borderColor: alpha('#0f172a', 0.05),
            scrollSnapAlign: 'start',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#fff',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                borderColor: alpha(EMERALD, 0.2),
                '& .hover-arrow': { transform: 'translateX(4px)', color: EMERALD }
            }
        }}>
            {/* Top accent line */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: isVolunteer ? '#3b82f6' : EMERALD }} />
            
            <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ 
                        width: 48, height: 48, borderRadius: '12px', bgcolor: '#f1f5f9', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                        border: '1px solid', borderColor: '#e2e8f0'
                    }}>
                        {orgLogo ? (
                            <img src={orgLogo} alt={orgName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <Typography variant="h6" sx={{ color: '#94a3b8', fontWeight: 800 }}>
                                {orgName?.substring(0,2).toUpperCase() || 'ORG'}
                            </Typography>
                        )}
                    </Box>
                    <Chip 
                        label={isVolunteer ? 'Volunteer' : 'Full-time'} 
                        size="small" 
                        sx={{ 
                            bgcolor: isVolunteer ? alpha('#3b82f6', 0.1) : alpha(EMERALD, 0.1), 
                            color: isVolunteer ? '#3b82f6' : EMERALD, 
                            fontWeight: 700, borderRadius: '8px' 
                        }} 
                    />
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, lineHeight: 1.3 }}>
                    {job.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600, mb: 2 }}>
                    {orgName || 'Unknown Organization'}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, color: '#64748b' }}>
                    <LocationOnIcon sx={{ fontSize: 18 }} />
                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                        {job.locationType === 'remote' ? 'Remote' : locationText || 'Unknown Location'}
                    </Typography>
                </Box>

                <Box sx={{ mt: 'auto' }}>
                    {job.endDate ? (
                        <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 600, display: 'block', mb: 2 }}>
                            Closes {format(new Date(job.endDate), 'MMM d, yyyy')}
                        </Typography>
                    ) : (
                        <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600, display: 'block', mb: 2 }}>
                            Open Role
                        </Typography>
                    )}
                    <Button 
                        component={Link} 
                        href={`/modular-society/${tenantId}/trade/${job.id}`}
                        fullWidth 
                        variant="outlined" 
                        endIcon={<ArrowForwardIosIcon className="hover-arrow" sx={{ fontSize: '14px !important', transition: '0.2s' }} />}
                        sx={{ 
                            borderRadius: '12px', py: 1.5, fontWeight: 700, 
                            color: '#0f172a', borderColor: '#e2e8f0', textTransform: 'none',
                            '&:hover': { bgcolor: alpha(EMERALD, 0.05), borderColor: EMERALD }
                        }}
                    >
                        View Details
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}
