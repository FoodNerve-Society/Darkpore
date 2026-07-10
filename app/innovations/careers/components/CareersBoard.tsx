"use client";

import React, { useState } from 'react';
import { Box, Typography, alpha, Card, CardContent, Chip, Button, Container } from '@mui/material';
import Link from 'next/link';
import WorkOutlineIcon from '@mui/icons-material/WorkOutlined';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import PublicIcon from '@mui/icons-material/Public';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { format } from 'date-fns';

const EMERALD = '#10b981';
const FILTERS = ['All', 'Full-Time', 'Internships', 'Volunteer'];

function JobCard({ job, tenantId }: { job: any, tenantId: string, key?: React.Key }) {
    const commitment = job.metadata?.commitment || (job.category === 'volunteer' ? 'volunteer' : 'full-time');
    const isVolunteer = commitment === 'volunteer';
    const isIntern = commitment === 'internship';
    const isContract = commitment === 'contract';
    const org = job.organization;
    const isExternal = org?.isExternal;
    
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
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: isVolunteer ? '#3b82f6' : isIntern ? '#f59e0b' : EMERALD }} />
            
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
                        label={isVolunteer ? 'Volunteer' : isIntern ? 'Internship' : isContract ? 'Contract' : 'Full-time'} 
                        size="small" 
                        sx={{ 
                            bgcolor: isVolunteer ? alpha('#3b82f6', 0.1) : isIntern ? alpha('#f59e0b', 0.1) : alpha(EMERALD, 0.1), 
                            color: isVolunteer ? '#3b82f6' : isIntern ? '#f59e0b' : EMERALD, 
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
                        href={`/innovations/careers/${job.id}`}
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

function Swimlane({ title, subtitle, icon, jobs, tenantId }: { title: string, subtitle: string, icon: React.ReactNode, jobs: any[], tenantId: string, key?: React.Key }) {
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

export default function CareersBoard({ 
    coreEcosystemRoles, 
    societyPartners, 
    externalSourced, 
    tenantId 
}: { 
    coreEcosystemRoles: any[], 
    societyPartners: any[], 
    externalSourced: any[], 
    tenantId: string 
}) {
    const [activeFilter, setActiveFilter] = useState('All');

    const filterJobs = (jobs: any[]) => {
        if (activeFilter === 'All') return jobs;
        return jobs.filter(job => {
            const commitment = job.metadata?.commitment || (job.category === 'volunteer' ? 'volunteer' : 'full-time');
            if (activeFilter === 'Full-Time') return commitment === 'full-time' || commitment === 'contract';
            if (activeFilter === 'Internships') return commitment === 'internship';
            if (activeFilter === 'Volunteer') return commitment === 'volunteer';
            return true;
        });
    };

    return (
        <Container maxWidth="lg" sx={{ mt: -6, position: 'relative', zIndex: 10 }}>
            {/* Filter Bar */}
            <Box sx={{ display: 'flex', gap: 1, mb: 6, overflowX: 'auto', pb: 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                {FILTERS.map(f => (
                    <Chip 
                        key={f}
                        label={f}
                        onClick={() => setActiveFilter(f)}
                        sx={{
                            fontWeight: 700,
                            px: 2,
                            py: 2.5,
                            borderRadius: '100px',
                            bgcolor: activeFilter === f ? EMERALD : '#fff',
                            color: activeFilter === f ? '#fff' : '#64748b',
                            border: '1px solid',
                            borderColor: activeFilter === f ? EMERALD : '#e2e8f0',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                bgcolor: activeFilter === f ? EMERALD : alpha(EMERALD, 0.05),
                                color: activeFilter === f ? '#fff' : EMERALD
                            }
                        }}
                    />
                ))}
            </Box>

            <Swimlane 
                title="Core Ecosystem Roles" 
                subtitle="Direct opportunities at Food Nerve and our foundational partners."
                icon={<WorkOutlineIcon sx={{ color: EMERALD, fontSize: 32 }} />}
                jobs={filterJobs(coreEcosystemRoles)} 
                tenantId={tenantId}
            />
            
            <Swimlane 
                title="Society Partners" 
                subtitle="Join validated organizations driving change within our network."
                icon={<GroupWorkIcon sx={{ color: '#3b82f6', fontSize: 32 }} />}
                jobs={filterJobs(societyPartners)} 
                tenantId={tenantId}
            />
            
            <Swimlane 
                title="External Opportunities" 
                subtitle="Curated roles sourced from the broader industry."
                icon={<PublicIcon sx={{ color: '#f59e0b', fontSize: 32 }} />}
                jobs={filterJobs(externalSourced)} 
                tenantId={tenantId}
            />
        </Container>
    );
}
