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
}

export const EcosystemCard: React.FC<EcosystemCardProps> = ({ item, themeColor }) => {
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
                borderRadius: 4,
                boxShadow: isHovered ? '0 20px 40px -4px rgba(0,0,0,0.2)' : '0 8px 30px -4px rgba(0,0,0,0.1)',
                transform: isHovered ? 'translateY(-4px)' : 'none',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                bgcolor: '#f1f5f9',
                border: 'none',
                minWidth: { xs: '300px', md: '420px' },
                maxWidth: '420px',
                flexShrink: 0
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
                <Chip
                    label={item.type.toUpperCase()}
                    size="small"
                    sx={{
                        position: 'absolute', top: 16, right: 12, zIndex: 2,
                        bgcolor: themeColor, color: 'white', fontWeight: 800, fontSize: '0.65rem', height: 20,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)', letterSpacing: 1
                    }}
                />
            </Box>

            {/* TRANSLUCENT GLASS DECK OVERLAID ON IMAGE */}
            <Box sx={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                right: 12,
                p: 2,
                borderRadius: 3,
                bgcolor: 'rgba(255, 255, 255, 0.70)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '1px solid rgba(255,255,255,0.6)',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
            }}>
                {/* 1. Title */}
                <Typography variant="body1" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.title}
                </Typography>

                {/* 2. Sub-info (Replacing Description) */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        fontSize: '0.85rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.5,
                        opacity: 0.85,
                        fontWeight: 600
                    }}
                >
                    {item.authorOrOperator}
                </Typography>

                {/* 3. Action Row (Meta Info Left, Button Right) */}
                <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: themeColor }}>
                        {item.metaInfo}
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={handleAction}
                        startIcon={actionProps.icon}
                        sx={{
                            bgcolor: '#0f172a',
                            color: 'white',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            px: 2,
                            py: 0.8,
                            boxShadow: 'none',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                bgcolor: themeColor,
                                boxShadow: `0 4px 12px ${themeColor}60`
                            }
                        }}
                    >
                         {actionProps.text}
                    </Button>
                </Stack>
            </Box>

            {/* Hidden link for SEO */}
            <a href={item.link} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0 }}>
                {item.title}
            </a>
        </Card>
    );
};
