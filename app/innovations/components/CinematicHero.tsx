"use client";

import React, { useState } from 'react';
import { Box, Container, Typography, Button, Stack, useTheme, alpha, Card } from '@mui/material';
import { EmojiEvents, RocketLaunch, ShowChart, PeopleAlt } from '@mui/icons-material';
import Link from 'next/link';

export interface SlideshowItem {
    image: string;
    title: string;
    link?: string;
    updatedAt?: Date | string;
    createdAt?: Date | string;
}

interface CinematicHeroProps {
    tenantName: string;
    headline: string;
    subheadline: string;
    stats: {
        activeSolutions: number;
        communitySize: number; // changed to number for direct count
    };
    slideshowItems?: SlideshowItem[];
}

export default function CinematicHero({ tenantName, headline, subheadline, stats, slideshowItems = [] }: CinematicHeroProps) {
    const theme = useTheme();
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    React.useEffect(() => {
        if (!slideshowItems.length) return;
        const interval = setInterval(() => {
            setCurrentSlideIndex((prev) => (prev + 1) % slideshowItems.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [slideshowItems.length]);

    const keyframes = `
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
        }
        @keyframes glow-pulse {
            0%, 100% { 
                box-shadow: 0 0 30px ${alpha(theme.palette.primary.main, 0.5)},
                            0 0 60px ${alpha(theme.palette.primary.main, 0.3)},
                            inset 0 0 20px ${alpha(theme.palette.primary.main, 0.1)};
            }
            50% { 
                box-shadow: 0 0 50px ${alpha(theme.palette.primary.main, 0.8)},
                            0 0 100px ${alpha(theme.palette.primary.main, 0.5)},
                            inset 0 0 30px ${alpha(theme.palette.primary.main, 0.2)};
            }
        }
        @keyframes glow-secondary {
            0%, 100% { 
                box-shadow: 0 0 20px ${alpha(theme.palette.secondary.main, 0.4)},
                            0 0 40px ${alpha(theme.palette.secondary.main, 0.2)};
            }
            50% { 
                box-shadow: 0 0 35px ${alpha(theme.palette.secondary.main, 0.6)},
                            0 0 70px ${alpha(theme.palette.secondary.main, 0.4)};
            }
        }
        @keyframes slide-gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
    `;

    const charLimit = 220;
    const isTruncated = subheadline.length > charLimit;

    const displayedDescription = isTruncated && !isDescriptionExpanded 
        ? `${subheadline.substring(0, charLimit)}...` 
        : subheadline;

    return (
        <Box 
            sx={{ 
                minHeight: '85vh',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#050505',
                // We use a subtle grid texture for the background instead of a cover image
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                pt: { xs: 14, md: 16 }, // Added extra top padding to account for fixed navbar
                pb: { xs: 8, md: 4 }
            }}
        >
            <style>{keyframes}</style>
            
            {/* Enhanced gradient overlays to fade the bottom into the next section */}
            <Box sx={{ 
                position: 'absolute', 
                inset: 0, 
                background: `linear-gradient(to top, 
                    rgba(5, 5, 5, 1) 0%, 
                    rgba(5, 5, 5, 0.6) 40%,
                    rgba(5, 5, 5, 0.3) 70%, 
                    rgba(5, 5, 5, 0.8) 100%)`,
                zIndex: 0
            }} />
            
            {/* Animated gradient orbs (Using user's glow concept) */}
            <Box sx={{ 
                position: 'absolute', 
                top: '15%', 
                left: '5%', 
                width: { xs: '200px', md: '450px' }, 
                height: { xs: '200px', md: '450px' }, 
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 70%)`,
                filter: 'blur(60px)',
                animation: 'float 8s ease-in-out infinite',
                zIndex: 0
            }} />
            <Box sx={{ 
                position: 'absolute', 
                bottom: '15%', 
                right: '5%', 
                width: { xs: '180px', md: '350px' }, 
                height: { xs: '180px', md: '350px' }, 
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 70%)`,
                filter: 'blur(60px)',
                animation: 'float 10s ease-in-out infinite',
                animationDelay: '2s',
                zIndex: 0
            }} />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'left' }}>
                <Stack spacing={2.5} sx={{ alignItems: 'flex-start' }}>
                    
                    {/* Main Heading with Gradient Text */}
                    <Typography 
                        variant="h1" 
                        sx={{ 
                            fontWeight: 900,
                            background: `linear-gradient(135deg, #ffffff 0%, ${alpha('#fff', 0.9)} 50%, ${theme.palette.primary.light} 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            textShadow: `0px 4px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
                            fontSize: { xs: '2rem', sm: '3rem', md: '4rem' }, 
                            animation: 'fadeInUp 0.8s ease-out 0.1s',
                            animationFillMode: 'backwards',
                            letterSpacing: '-0.02em',
                            lineHeight: 1.1,
                            maxWidth: '800px'
                        }}
                    >
                        {headline}
                    </Typography>

                    {/* Description */}
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            color: 'rgba(255,255,255,0.7)', 
                            maxWidth: '650px',
                            animation: 'fadeInUp 0.8s ease-out 0.2s',
                            animationFillMode: 'backwards',
                            fontSize: { xs: '0.95rem', sm: '1.1rem' },
                            fontWeight: 400,
                            lineHeight: 1.6,
                        }}
                    >
                        {displayedDescription}
                        {isTruncated && (
                            <Button 
                                variant="text" 
                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} 
                                sx={{ 
                                    color: theme.palette.primary.light, 
                                    ml: 1,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    '&:hover': { 
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    } 
                                }}
                            >
                                {isDescriptionExpanded ? '← Show Less' : 'Read More →'}
                            </Button>
                        )}
                    </Typography>

                    {/* Stats & CTA Cards - Stacked on mobile, row on desktop */}
                    <Stack 
                        direction={{ xs: 'column', lg: 'row' }} 
                        spacing={{ xs: 1.5, sm: 2 }} 
                        sx={{ 
                            pt: 3,
                            justifyContent: "flex-start",
                            animation: 'fadeInUp 0.8s ease-out 0.4s',
                            animationFillMode: 'backwards',
                            width: '100%',
                            maxWidth: '1100px',
                        }}
                    >
                        {/* Info Cards Stack */}
                        <Stack 
                            direction={{ xs: 'row', sm: 'column' }} 
                            spacing={{ xs: 2, sm: 2 }}
                            sx={{ flex: { xs: '1 1 auto', lg: 'none' } }}
                        >
                            {/* Total Contents Card - Neo-Minimal */}
                            <Card 
                                component={Link}
                                href="/learn"
                                elevation={0} 
                                sx={{ 
                                    textDecoration: 'none',
                                    bgcolor: '#080808',
                                    borderRadius: 3,
                                    p: { xs: 1.5, sm: 2.5 },
                                    flex: 1,
                                    minWidth: { xs: 0, sm: 140 },
                                    border: '3px solid rgba(255,255,255,0.08)',
                                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.5)',
                                    textAlign: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        borderColor: alpha(theme.palette.primary.main, 0.4),
                                        boxShadow: `inset 0 0 20px ${alpha(theme.palette.primary.main, 0.05)}, 0 12px 30px rgba(0,0,0,0.8)`,
                                    }
                                }}
                            >
                                <Typography variant="h3" sx={{ color: theme.palette.primary.light, fontWeight: 900, mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.75rem' }, fontFamily: 'var(--font-dosis)' }}>
                                    {stats.activeSolutions}+
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.6rem' }}>
                                    Total Contents
                                </Typography>
                            </Card>

                            {/* Community Card - Neo-Minimal */}
                            <Card 
                                elevation={0} 
                                sx={{ 
                                    bgcolor: '#080808',
                                    borderRadius: 3,
                                    p: { xs: 1.5, sm: 2.5 },
                                    flex: 1,
                                    minWidth: { xs: 0, sm: 140 },
                                    border: '3px solid rgba(255,255,255,0.08)',
                                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.5)',
                                    textAlign: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        borderColor: alpha(theme.palette.secondary.main, 0.4),
                                        boxShadow: `inset 0 0 20px ${alpha(theme.palette.secondary.main, 0.05)}, 0 12px 30px rgba(0,0,0,0.8)`,
                                    }
                                }}
                            >
                                <Typography variant="h3" sx={{ color: theme.palette.primary.light, fontWeight: 900, mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.75rem' }, fontFamily: 'var(--font-dosis)' }}>
                                    {stats.communitySize.toLocaleString()}
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.6rem' }}>
                                    Members
                                </Typography>
                            </Card>
                        </Stack>

                        {/* Slideshow CTA Container (Sliding Track) */}
                        <Box 
                            sx={{ 
                                flex: 1.8,
                                minWidth: { xs: '100%', sm: 180 },
                                minHeight: { xs: 150, sm: 'auto' },
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: 3,
                                border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                                cursor: 'pointer',
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    width: `${slideshowItems.length * 100}%`,
                                    height: '100%',
                                    transform: `translateX(-${currentSlideIndex * (100 / (slideshowItems.length || 1))}%)`,
                                    transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
                                }}
                            >
                                {slideshowItems.map((item, idx) => (
                                    <Box
                                        key={idx}
                                        component={item.link ? Link : 'div'}
                                        href={item.link || '#'}
                                        sx={{
                                            width: `${100 / (slideshowItems.length || 1)}%`,
                                            height: '100%',
                                            position: 'relative',
                                            display: 'block',
                                            textDecoration: 'none',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                                backgroundImage: item.image ? `url(${item.image})` : 'radial-gradient(circle at 50% 50%, rgba(27, 94, 32, 0.4) 0%, rgba(5,5,5,1) 100%)',
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                            }}
                                        />
                                        {/* Gradient overlay */}
                                        <Box sx={{
                                            position: 'absolute', inset: 0,
                                            background: `linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 60%)`,
                                        }} />
                                        {/* Title and Date */}
                                        <Box sx={{
                                            position: 'absolute', bottom: 0, left: 0, right: 0, p: 3, pb: 4, zIndex: 2,
                                        }}>
                                            {(item.updatedAt || item.createdAt) && (
                                                <Typography variant="caption" sx={{ color: theme.palette.primary.light, fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', mb: 0.5, display: 'block' }}>
                                                    {(() => {
                                                        const date = new Date(item.updatedAt || item.createdAt || new Date());
                                                        const diffMs = Date.now() - date.getTime();
                                                        const diffMins = Math.floor(diffMs / 60000);
                                                        if (diffMins < 60) return `${diffMins}m ago`;
                                                        const diffHours = Math.floor(diffMins / 60);
                                                        if (diffHours < 24) return `${diffHours}h ago`;
                                                        const diffDays = Math.floor(diffHours / 24);
                                                        if (diffDays < 7) return `${diffDays}d ago`;
                                                        const diffWeeks = Math.floor(diffDays / 7);
                                                        if (diffWeeks < 4) return `${diffWeeks}w ago`;
                                                        const diffMonths = Math.floor(diffDays / 30);
                                                        return `${diffMonths}mo ago`;
                                                    })()}
                                                </Typography>
                                            )}
                                            <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 800, fontSize: '1.05rem', textShadow: '0px 4px 12px rgba(0,0,0,0.8), 0px 1px 3px rgba(0,0,0,1)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }}>
                                                {item.title}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                            
                            {/* Progress Indicators */}
                            {slideshowItems.length > 1 && (
                                <Box sx={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 1, zIndex: 3 }}>
                                    {slideshowItems.map((_, idx) => (
                                        <Box
                                            key={idx}
                                            sx={{
                                                width: currentSlideIndex === idx ? 24 : 6,
                                                height: 4,
                                                borderRadius: 2,
                                                bgcolor: currentSlideIndex === idx ? 'primary.main' : 'rgba(255,255,255,0.4)',
                                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            }}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>

                        {/* Join CTA Card - Solid Premium Dark */}
                        <Card 
                            component={Link}
                            href="/join"
                            elevation={0} 
                            sx={{ 
                                bgcolor: '#080808',
                                textDecoration: 'none',
                                borderRadius: 4,
                                p: { xs: 3, sm: 4 },
                                flex: 2,
                                minWidth: { xs: '100%', sm: 280 },
                                border: '3px solid rgba(255,255,255,0.08)',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 40px rgba(0,0,0,0.6)',
                                textAlign: 'left',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.4s cubic-bezier(.4,0,.2,1)',
                                '&::before': {
                                    content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    opacity: 0.3, transition: 'opacity 0.4s'
                                },
                                '&:hover': { 
                                    transform: 'translateY(-6px)',
                                    borderColor: alpha(theme.palette.secondary.main, 0.3),
                                    boxShadow: `0 20px 60px ${alpha(theme.palette.secondary.main, 0.15)}`,
                                    '&::before': { opacity: 1 }
                                }
                            }}
                        >
                            <Stack spacing={2} sx={{ position: 'relative', zIndex: 1, height: '100%', justifyContent: 'center' }}>
                                <Box>
                                    <Typography variant="overline" sx={{ color: theme.palette.primary.light, fontWeight: 900, letterSpacing: 3, mb: 1, display: 'block' }}>
                                        EXCLUSIVE ACCESS
                                    </Typography>
                                    <Typography variant="h3" sx={{ color: theme.palette.primary.light, fontWeight: 900, mb: 1, letterSpacing: '-0.5px', fontSize: { xs: '1.6rem', sm: '1.9rem' } }}>
                                        Join the Society
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', mb: 3.5, lineHeight: 1.6, fontWeight: 400, fontSize: '0.95rem' }}>
                                        Want a say in shaping our food systems? The real work happens inside the Society. Join us to execute workflows, deploy capital, and collaborate with top innovators.
                                    </Typography>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            gap: 1.5,
                                            bgcolor: 'white',
                                            px: 3,
                                            py: 1.5,
                                            borderRadius: '100px',
                                            fontWeight: 800,
                                            fontSize: '0.85rem',
                                            color: '#000',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': { 
                                                bgcolor: theme.palette.secondary.main,
                                                color: '#000',
                                                transform: 'scale(1.05)'
                                            }
                                        }}>
                                            Authenticate Now
                                            <Typography component="span" sx={{ fontSize: '1.2rem', transition: 'transform 0.3s', '.MuiBox-root:hover &': { transform: 'translateX(4px)' } }}>→</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Stack>
                        </Card>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}
