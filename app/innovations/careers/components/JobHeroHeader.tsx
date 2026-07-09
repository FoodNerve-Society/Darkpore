'use client';

import React from 'react';
import { Box, Typography, Container, alpha, Avatar } from '@mui/material';
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
    postedAt: Date;
    color: string;
}

export default function JobHeroHeader({
    title,
    organizationName,
    logoUrl,
    location,
    workModel,
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
                        <Typography sx={{ fontWeight: 600, color: '#475569', fontSize: '1.1rem' }}>
                            {organizationName}
                        </Typography>
                    </Box>

                    {/* Job Title */}
                    <Typography 
                        variant="h1" 
                        sx={{ 
                            fontWeight: 800, 
                            fontSize: { xs: '2.5rem', md: '3.5rem' },
                            lineHeight: 1.1,
                            color: '#0f172a',
                            letterSpacing: '-0.02em'
                        }}
                    >
                        {title}
                    </Typography>

                    {/* Meta Row */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, md: 4 }, mt: 1 }}>
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
