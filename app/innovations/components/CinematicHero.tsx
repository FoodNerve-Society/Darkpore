"use client";

import React, { useState } from 'react';
import { Box, Container, Typography, Button, Stack, useTheme, alpha, Card } from '@mui/material';
import { EmojiEvents, RocketLaunch, ShowChart, PeopleAlt } from '@mui/icons-material';
import Link from 'next/link';

interface CinematicHeroProps {
    tenantName: string;
    headline: string;
    subheadline: string;
    stats: {
        activeSolutions: number;
        totalCapital: string;
        communitySize: string;
    };
    slideshowImages?: string[];
}

export default function CinematicHero({ tenantName, headline, subheadline, stats, slideshowImages = [] }: CinematicHeroProps) {
    const theme = useTheme();
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    React.useEffect(() => {
        if (!slideshowImages.length) return;
        const interval = setInterval(() => {
            setCurrentSlideIndex((prev) => (prev + 1) % slideshowImages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [slideshowImages.length]);

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
                            {/* Active Solutions Card */}
                            <Card 
                                elevation={0} 
                                sx={{ 
                                    bgcolor: alpha('#000', 0.4),
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: 3,
                                    p: { xs: 1.5, sm: 2 },
                                    flex: 1,
                                    minWidth: { xs: 0, sm: 140 },
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                    textAlign: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                                        opacity: 0,
                                        transition: 'opacity 0.3s ease',
                                    },
                                    '&:hover': {
                                        transform: 'translateY(-6px)',
                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        borderColor: alpha(theme.palette.primary.main, 0.4),
                                        boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.25)}`,
                                        '&::before': { opacity: 1 }
                                    }
                                }}
                            >
                                <Box sx={{ 
                                    mb: 1, 
                                    p: 1, 
                                    borderRadius: '50%', 
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    display: 'inline-flex',
                                }}>
                                    <RocketLaunch sx={{ color: theme.palette.primary.light, fontSize: { xs: 20, sm: 24 } }} />
                                </Box>
                                <Typography variant="h3" color="white" sx={{ fontWeight: 900, mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
                                    {stats.activeSolutions}+
                                </Typography>
                                <Typography variant="body1" color="rgba(255,255,255,0.7)" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.65rem' }}>
                                    Active Solutions
                                </Typography>
                            </Card>

                            {/* Community Card */}
                            <Card 
                                elevation={0} 
                                sx={{ 
                                    bgcolor: alpha('#000', 0.4),
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: 3,
                                    p: { xs: 1.5, sm: 2 },
                                    flex: 1,
                                    minWidth: { xs: 0, sm: 140 },
                                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                                    textAlign: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
                                        opacity: 0,
                                        transition: 'opacity 0.3s ease',
                                    },
                                    '&:hover': {
                                        transform: 'translateY(-6px)',
                                        bgcolor: alpha(theme.palette.secondary.main, 0.08),
                                        borderColor: alpha(theme.palette.secondary.main, 0.4),
                                        boxShadow: `0 8px 30px ${alpha(theme.palette.secondary.main, 0.25)}`,
                                        '&::before': { opacity: 1 }
                                    }
                                }}
                            >
                                <Box sx={{ 
                                    mb: 1, 
                                    p: 1, 
                                    borderRadius: '50%', 
                                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                    display: 'inline-flex',
                                }}>
                                    <PeopleAlt sx={{ color: theme.palette.secondary.light, fontSize: { xs: 20, sm: 24 } }} />
                                </Box>
                                <Typography variant="h3" color="white" sx={{ fontWeight: 900, mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
                                    {stats.communitySize}
                                </Typography>
                                <Typography variant="body1" color="rgba(255,255,255,0.7)" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.65rem' }}>
                                    Members
                                </Typography>
                            </Card>
                        </Stack>

                        {/* Slideshow CTA Card */}
                        <Card 
                            elevation={0} 
                            sx={{ 
                                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.dark, 0.4)} 0%, ${alpha(theme.palette.secondary.dark, 0.8)} 100%)`,
                                borderRadius: 3,
                                flex: 1.8,
                                minWidth: { xs: '100%', sm: 180 },
                                minHeight: { xs: 150, sm: 'auto' },
                                border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                                cursor: 'default',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': { 
                                    transform: 'translateY(-8px) scale(1.02)',
                                    borderColor: alpha(theme.palette.secondary.main, 0.4),
                                    boxShadow: `0 12px 40px ${alpha(theme.palette.secondary.main, 0.3)}`,
                                }
                            }}
                        >
                            {/* Slideshow image container */}
                <Box
                    sx={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0,
                        backgroundColor: '#050505',
                        backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(27, 94, 32, 0.2) 0%, rgba(5,5,5,1) 100%)', // Premium fallback gradient
                        transition: 'opacity 1.5s ease-in-out',
                        opacity: 1,
                    }}
                >
                    {slideshowImages.map((src, idx) => (
                        <Box
                            key={src}
                            sx={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                backgroundImage: `url(${src})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                opacity: currentSlideIndex === idx ? 1 : 0,
                                transition: 'opacity 2s ease-in-out, transform 8s linear',
                                transform: currentSlideIndex === idx ? 'scale(1.05)' : 'scale(1)',
                            }}
                        />
                    ))}
                    
                    {/* Progress Indicator */}
                    {slideshowImages.length > 1 && (
                        <Box sx={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 1, zIndex: 2 }}>
                            {slideshowImages.map((_, idx) => (
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
                            {/* Overlay gradient so it still matches the theme aesthetics slightly */}
                            <Box sx={{
                                position: 'absolute',
                                inset: 0,
                                background: `linear-gradient(180deg, transparent 0%, ${alpha('#000', 0.6)} 100%)`,
                                zIndex: 2,
                            }} />
                        </Card>

                        {/* Join CTA Card - HERO Detailed */}
                        <Card 
                            elevation={0} 
                            sx={{ 
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                backgroundSize: '200% 200%',
                                borderRadius: 3,
                                p: { xs: 2.5, sm: 3 },
                                flex: 2,
                                minWidth: { xs: '100%', sm: 220 },
                                border: `1px solid ${alpha('#fff', 0.2)}`,
                                textAlign: 'left',
                                position: 'relative',
                                overflow: 'hidden',
                                animation: 'glow-pulse 4s infinite ease-in-out, slide-gradient 6s ease infinite',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: '-50%',
                                    left: '-50%',
                                    width: '200%',
                                    height: '200%',
                                    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 70%)`,
                                    opacity: 0,
                                    transition: 'opacity 0.3s ease',
                                },
                                '&:hover': { 
                                    transform: 'translateY(-8px) scale(1.03)',
                                    boxShadow: `0 15px 50px ${alpha(theme.palette.primary.main, 0.3)}`,
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                                    '&::before': { opacity: 1 }
                                }
                            }}
                        >
                            <Stack spacing={1.5} sx={{ position: 'relative', zIndex: 1, height: '100%', justifyContent: 'center' }}>
                                <Box sx={{ 
                                    p: 1, 
                                    borderRadius: 2, 
                                    bgcolor: alpha('#fff', 0.15),
                                    display: 'inline-flex',
                                    alignSelf: 'flex-start',
                                }}>
                                    <EmojiEvents sx={{ color: 'white', fontSize: { xs: 24, sm: 28 } }} />
                                </Box>
                                <Box>
                                    <Typography variant="h3" color="white" sx={{ fontWeight: 900, mb: 0.5, letterSpacing: '0px', fontSize: { xs: '1.5rem', sm: '1.8rem' } }}>
                                        Join the Society
                                    </Typography>
                                    <Typography variant="body1" color="rgba(255,255,255,0.95)" sx={{ mb: 2, lineHeight: 1.5, fontWeight: 500, fontSize: '0.9rem' }}>
                                        Want a say in shaping our food systems? The real work happens inside the Society. Join us to execute workflows, deploy capital, and collaborate with top innovators.
                                    </Typography>
                                    <Link href="/login" style={{ textDecoration: 'none' }}>
                                        <Box sx={{ 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            gap: 1,
                                            bgcolor: alpha('#fff', 0.2),
                                            px: 2,
                                            py: 1,
                                            borderRadius: 2,
                                            fontWeight: 800,
                                            fontSize: '0.85rem',
                                            color: 'white',
                                            transition: 'background-color 0.2s',
                                            '&:hover': { bgcolor: alpha('#fff', 0.3) }
                                        }}>
                                            Authenticate Now
                                            <Typography component="span" sx={{ fontSize: '1.1rem' }}>→</Typography>
                                        </Box>
                                    </Link>
                                </Box>
                            </Stack>
                        </Card>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}
