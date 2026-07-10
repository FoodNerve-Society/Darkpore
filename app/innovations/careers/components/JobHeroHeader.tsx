'use client';

import React from 'react';
import { Box, Typography, Container, alpha, Avatar, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { format } from 'date-fns';

interface JobHeroHeaderProps {
    title: string;
    organizationName: string;
    logoUrl?: string | null;
    location: string;
    workModel?: string | null;
    commitment?: string | null;
    postedAt: Date;
    color: string;
}

export default function JobHeroHeader({
    title,
    organizationName,
    logoUrl,
    location,
    workModel,
    commitment,
    postedAt,
    color
}: JobHeroHeaderProps) {
    return (
        <Box sx={{ 
            pt: { xs: 12, md: 16 }, 
            pb: { xs: 6, md: 8 },
            background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.0)} 100%)`,
            borderBottom: '1px solid',
            borderColor: alpha(color, 0.1),
            position: 'relative',
            overflow: 'hidden'
        }}>
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3 }}>
                    {/* Organization Logo & Name */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                            src={logoUrl || undefined} 
                            sx={{ 
                                width: 56, 
                                height: 56, 
                                bgcolor: alpha(color, 0.1),
                                color: color,
                                border: `1px solid ${alpha(color, 0.2)}`
                            }}
                        >
                            {organizationName.charAt(0)}
                        </Avatar>
                        <Typography variant="body1" sx={{ color, fontWeight: 700, letterSpacing: '1px' }}>
                            {organizationName}
                        </Typography>
                    </Box>

                    {/* Job Title and Commitment Badge */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                        <Typography 
                            variant="h1" 
                            sx={{ 
                                fontWeight: 900, 
                                fontSize: { xs: '2rem', md: '3rem' }, 
                                color: '#0f172a',
                                lineHeight: 1.1,
                                letterSpacing: '-1px'
                            }}
                        >
                            {title}
                        </Typography>
                        {commitment && (
                            <Chip 
                                label={commitment === 'volunteer' ? 'Volunteer' : commitment === 'internship' ? 'Internship' : commitment === 'contract' ? 'Contract' : 'Full-time'} 
                                sx={{ 
                                    bgcolor: commitment === 'volunteer' ? alpha('#3b82f6', 0.1) : commitment === 'internship' ? alpha('#f59e0b', 0.1) : alpha(color, 0.1), 
                                    color: commitment === 'volunteer' ? '#3b82f6' : commitment === 'internship' ? '#f59e0b' : color, 
                                    fontWeight: 800, 
                                    borderRadius: '8px',
                                    height: 32,
                                    px: 1,
                                    transform: 'translateY(2px)' // align visually with huge text
                                }} 
                            />
                        )}
                    </Box>

                    {/* Meta Row */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 4 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                            <LocationOnIcon fontSize="small" sx={{ color }} />
                            <Typography sx={{ fontWeight: 500 }}>{location}</Typography>
                        </Box>
                        
                        {workModel && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                                <WorkIcon fontSize="small" sx={{ color }} />
                                <Typography sx={{ fontWeight: 500, textTransform: 'capitalize' }}>{workModel}</Typography>
                            </Box>
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748b' }}>
                            <CalendarTodayIcon fontSize="small" sx={{ color }} />
                            <Typography sx={{ fontWeight: 500 }}>Posted {format(new Date(postedAt), 'MMM d, yyyy')}</Typography>
                        </Box>
                    </Box>
                </Box>
            </Container>

            {/* Decorative background blob */}
            <Box sx={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '600px',
                height: '600px',
                background: `radial-gradient(circle, ${alpha(color, 0.1)} 0%, rgba(255,255,255,0) 70%)`,
                filter: 'blur(60px)',
                zIndex: 1,
                pointerEvents: 'none'
            }} />
        </Box>
    );
}
