'use client';

import React, { useState } from 'react';
import { Box, Typography, Card, Button, Chip, Stack, CardMedia, useTheme } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import WorkOutlinedIcon from '@mui/icons-material/WorkOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import { EcosystemItem } from './TabbedHero';
import { useRouter } from 'next/navigation';

interface EcosystemCardProps {
    item: EcosystemItem;
    themeColor: string;
    hideTags?: boolean;
}

export const EcosystemCard: React.FC<EcosystemCardProps> = ({ item, themeColor, hideTags = false }) => {
    const theme = useTheme();
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);

    // Determine Action Text & Icon based on Type
    const getActionProps = () => {
        switch (item.type) {
            case 'Intelligence': return { text: 'Read Now', icon: <ArticleOutlinedIcon sx={{ fontSize: 18 }} /> };
            case 'Innovations': return { text: 'View Project', icon: <RocketLaunchOutlinedIcon sx={{ fontSize: 18 }} /> };
            case 'Jobs': return { text: 'Apply Now', icon: <WorkOutlinedIcon sx={{ fontSize: 18 }} /> };
            case 'Activities': return { text: 'RSVP', icon: <EventOutlinedIcon sx={{ fontSize: 18 }} /> };
            case 'Community': return { text: 'Join', icon: <PeopleAltOutlinedIcon sx={{ fontSize: 18 }} /> };
            default: return { text: 'View', icon: <ArrowForwardIcon sx={{ fontSize: 18 }} /> };
        }
    };

    const actionProps = getActionProps();

    const handleAction = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(item.link);
    };

    return (
        <Card
            variant="outlined"
            onClick={() => router.push(item.link)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
                height: '100%',
                borderRadius: { xs: 2, sm: 4 },
                boxShadow: isHovered ? '0 20px 40px -4px rgba(0,0,0,0.2)' : '0 8px 30px -4px rgba(0,0,0,0.1)',
                transform: isHovered ? 'translateY(-4px)' : 'none',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                bgcolor: '#f1f5f9',
                border: 'none',
                width: '100%' // Fluid width to fit Grid
            }}
        >
            {/* WIDESCREEN MEDIA CONTAINER (16:9 / 4:3 Hybrid to prevent heavy crop) */}
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    pt: '65%', // Wide enough to not crop 16:9 heavily, tall enough for the deck
                    zIndex: 0,
                    overflow: 'hidden'
                }}
            >
                <CardMedia
                    component="img"
                    image={item.thumbnailUrl}
                    alt={item.title}
                    sx={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover',
                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                        transition: 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)',
                        zIndex: 1,
                        willChange: 'transform'
                    }}
                />

                {/* Ecosystem Badge */}
                {!hideTags && (
                  <Chip
                      label={item.type.toUpperCase()}
                      size="small"
                      sx={{
                          position: 'absolute', top: 16, right: 12, zIndex: 2,
                          bgcolor: themeColor, color: 'white', fontWeight: 800, fontSize: '0.65rem', height: 20,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)', letterSpacing: 1
                      }}
                  />
                )}
            </Box>

            {/* TRANSLUCENT GLASS DECK OVERLAID ON IMAGE */}
            <Box sx={{
                position: 'absolute',
                bottom: { xs: 8, sm: 12 },
                left: { xs: 8, sm: 12 },
                right: { xs: 8, sm: 12 },
                p: { xs: 1.5, sm: 2 },
                borderRadius: { xs: 1.5, sm: 3 },
                bgcolor: 'rgba(255, 255, 255, 0.70)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '1px solid rgba(255,255,255,0.6)',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 0.5, sm: 1 }
            }}>
                {/* 1. Title */}
                <Typography variant="body1" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.25, fontSize: { xs: '0.75rem', sm: '1rem' }, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.title}
                </Typography>

                {/* 2. Sub-info & Meta */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mt: 0.5, gap: { xs: 0.5, sm: 0 } }}>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontWeight: 600,
                            opacity: 0.85,
                            fontSize: { xs: '0.6rem', sm: '0.75rem' }
                        }}
                    >
                        {item.authorOrOperator}
                    </Typography>
                    
                    <Typography variant="caption" sx={{ fontWeight: 800, color: themeColor, flexShrink: 0, ml: { xs: 0, sm: 2 }, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
                        {item.metaInfo}
                    </Typography>
                </Box>
            </Box>

            {/* Hidden link for SEO */}
            <a href={item.link} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0 }}>
                {item.title}
            </a>
        </Card>
    );
};
