"use client";

import { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { Box, Container, Grid, Stack, Typography, Chip, Button, Paper, useTheme, alpha, Avatar, AvatarGroup } from '@mui/material';
import { Spa } from '@mui/icons-material';
import AnimatedCounter from './AnimatedCounter';
import Link from 'next/link';

export interface Stat {
    label: string;
    value: number;
    icon: any;
    description: string;
    gradient: string;
    bgGradient: string;
    imageUrl?: string;
}

interface HeroSectionProps {
    boardData: {
        displayName: string;
        tagline: string;
        publicPageSettings?: {
            valueProposition?: string;
        };
    };
    stats: Stat[];
    activeStatIndex: number;
    progress: number;
}

export default function SocietyHero({ boardData, stats }: Omit<HeroSectionProps, 'activeStatIndex' | 'progress'>) {
    const theme = useTheme();
    const [activeStatIndex, setActiveStatIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!stats || stats.length === 0) return;
        
        const duration = 5000; // 5 seconds per slide
        const interval = 50; // Update progress every 50ms
        const step = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    setActiveStatIndex((current) => (current + 1) % stats.length);
                    return 0;
                }
                return prev + step;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [stats.length]);

    const getCardPosition = (cardIndex: number) => {
        const diff = (cardIndex - activeStatIndex + stats.length) % stats.length;
        
        if (diff === 0) {
            return { x: 0, y: 0, scale: 1, opacity: 1, zIndex: 10 };
        } else if (diff === 1) {
            return { x: 35, y: 25, scale: 0.94, opacity: 1, zIndex: 9 };
        } else if (diff === 2) {
            return { x: 60, y: 45, scale: 0.88, opacity: 1, zIndex: 8 };
        }
        
        return { x: 80, y: 60, scale: 0.82, opacity: 0, zIndex: 7 };
    };

    return (
        <Box
            sx={{
                position: 'relative',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                backgroundColor: '#f8faf9', // Light theme background
                backgroundImage: `
                  radial-gradient(circle at 10% 20%, rgba(76, 175, 80, 0.15), transparent 60%),
                  radial-gradient(circle at 90% 80%, rgba(217, 119, 6, 0.1), transparent 60%),
                  radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.8), transparent 70%)
                `,
                backgroundSize: '100% 100%, 100% 100%, 100% 100%',
                backgroundPosition: '0 0, 0 0, 0 0',
                pt: { xs: 12, md: 8 }
            }}
        >
            <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
                <Grid container spacing={{ xs: 6, md: 10 }} sx={{ alignItems: 'center' }}>
                    {/* Left: Content */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, bgcolor: 'rgba(255,255,255,0.8)', p: 1, pr: 2.5, borderRadius: 10, width: 'fit-content', boxShadow: `0 4px 15px rgba(0,0,0,0.05)`, border: `1px solid rgba(0,0,0,0.05)` }}>
                                    <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.8rem' } }}>
                                        <Avatar alt="Remy Sharp" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" />
                                        <Avatar alt="Travis Howard" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop" />
                                        <Avatar alt="Cindy Baker" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" />
                                        <Avatar alt="Agnes Walker" src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=200&auto=format&fit=crop" />
                                        <Avatar alt="Trevor Henderson" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" />
                                    </AvatarGroup>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                                        Backed by innovators worldwide
                                    </Typography>
                                </Box>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <Typography
                                    variant="h1"
                                    sx={{
                                        fontSize: { xs: '2.2rem', md: '2.8rem', lg: '3.2rem' },
                                        fontWeight: 900,
                                        color: '#0f2414',
                                        lineHeight: 1.15,
                                        letterSpacing: '-0.02em',
                                        fontFamily: 'var(--font-playfair)',
                                        textShadow: '0 2px 10px rgba(0,0,0,0.02)',
                                        textAlign: 'left',
                                    }}
                                >
                                    {boardData.tagline}
                                </Typography>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: 'rgba(0,0,0,0.7)',
                                        textAlign: 'left',
                                        lineHeight: 1.6,
                                        fontWeight: 400,
                                        maxWidth: '550px'
                                    }}
                                >
                                    {boardData.publicPageSettings?.valueProposition}
                                </Typography>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                            >
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <Link href="/join" passHref style={{ textDecoration: 'none' }}>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            sx={{
                                                borderRadius: 8, // Fully rounded per instructions
                                                px: 5,
                                                py: 2,
                                                fontSize: '1.1rem',
                                                textTransform: 'none',
                                                fontWeight: 700,
                                                background: `linear-gradient(135deg, #d97706 0%, #b45309 100%)`,
                                                boxShadow: `0 8px 24px rgba(217, 119, 6, 0.3)`,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    boxShadow: `0 12px 30px rgba(217, 119, 6, 0.5)`,
                                                    transform: 'translateY(-3px)',
                                                },
                                            }}
                                        >
                                            Join the Society
                                        </Button>
                                    </Link>
                                    <Link href="/explore" passHref style={{ textDecoration: 'none' }}>
                                        <Button
                                            variant="outlined"
                                            size="large"
                                            sx={{
                                                borderRadius: 8, // Fully rounded per instructions
                                                px: 5,
                                                py: 2,
                                                fontSize: '1.1rem',
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                borderColor: 'rgba(0,0,0,0.2)',
                                                color: '#0f2414',
                                                bgcolor: 'rgba(255,255,255,0.5)',
                                                backdropFilter: 'blur(10px)',
                                                borderWidth: 2,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    borderColor: 'rgba(0,0,0,0.5)',
                                                    bgcolor: 'rgba(255,255,255,0.8)',
                                                    borderWidth: 2,
                                                    transform: 'translateY(-3px)',
                                                },
                                            }}
                                        >
                                            Explore Opportunities
                                        </Button>
                                    </Link>
                                </Stack>
                            </motion.div>
                        </Stack>
                    </Grid>

                    {/* Right: Stacked Cards */}
                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box
                            sx={{
                                width: '100%', // EXPLICIT WIDTH: prevents collapsing to 0
                                height: { xs: 550, md: 620 },
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pt: { xs: 5, md: 0 },
                            }}
                        >
                            <Box
                                sx={{
                                    width: '100%',
                                    maxWidth: { xs: 320, sm: 360, md: 400 }, // Explicit width constraints
                                    height: { xs: 450, md: 520 }, 
                                    position: 'relative',
                                }}
                            >
                                <AnimatePresence mode="sync">
                                    {stats.map((stat, index) => {
                                        const position = getCardPosition(index);
                                        const isActive = index === activeStatIndex;

                                        return (
                                            <motion.div
                                                key={index}
                                                initial={false}
                                                animate={position}
                                                exit={{
                                                    y: -700,
                                                    x: -50,
                                                    opacity: 0,
                                                    scale: 0.7,
                                                    rotateZ: -8,
                                                    transition: {
                                                        duration: 0.8,
                                                        ease: [0.43, 0.13, 0.23, 0.96],
                                                    },
                                                }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 260,
                                                    damping: 28,
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    width: '100%',
                                                    height: '100%',
                                                    top: 0,
                                                    left: 0,
                                                }}
                                            >
                                                <Paper
                                                    sx={{
                                                        height: '100%',
                                                        width: '100%',
                                                        background: 'white', // Light theme card
                                                        borderRadius: 5,
                                                        boxShadow: isActive 
                                                            ? `0 25px 60px rgba(0,0,0,0.15)`
                                                            : `0 10px 30px rgba(0,0,0,0.05)`,
                                                        border: `1px solid rgba(0,0,0,0.05)`,
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        transition: 'box-shadow 0.3s ease',
                                                        '&::before': {
                                                            content: '""',
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            right: 0,
                                                            height: 6,
                                                            background: stat.gradient,
                                                            zIndex: 2,
                                                        },
                                                    }}
                                                >
                                                    {stat.imageUrl && (
                                                        <Box 
                                                            sx={{ 
                                                                height: { xs: 180, md: 220 }, // Fixed explicit height
                                                                flexShrink: 0,
                                                                width: '100%',
                                                                backgroundImage: `url(${stat.imageUrl})`, 
                                                                backgroundSize: 'cover', 
                                                                backgroundPosition: 'center',
                                                                position: 'relative'
                                                            }} 
                                                        >
                                                            <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, white, transparent)' }} />
                                                        </Box>
                                                    )}
                                                    
                                                    <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', p: 4, pt: stat.imageUrl ? 2 : 4, flex: 1, justifyContent: 'center' }}>
                                                        <Box
                                                            sx={{
                                                                width: 80,
                                                                height: 80,
                                                                borderRadius: 4,
                                                                background: stat.bgGradient,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                border: `1px solid rgba(0,0,0,0.05)`,
                                                            }}
                                                        >
                                                            <stat.icon sx={{ fontSize: 40, color: stat.gradient.includes('4CAF50') ? '#2e7d32' : stat.gradient.includes('d97706') ? '#b45309' : '#1565c0' }} />
                                                        </Box>

                                                        <Typography
                                                            variant="h1"
                                                            sx={{
                                                                fontWeight: 900,
                                                                background: stat.gradient,
                                                                WebkitBackgroundClip: 'text',
                                                                WebkitTextFillColor: 'transparent',
                                                                fontSize: { xs: '3rem', md: '4rem' },
                                                                lineHeight: 1,
                                                            }}
                                                        >
                                                            {isActive ? (
                                                                <AnimatedCounter 
                                                                    key={`${index}-${activeStatIndex}`} 
                                                                    end={stat.value} 
                                                                    duration={1.5} 
                                                                />
                                                            ) : (
                                                                stat.value
                                                            )}
                                                        </Typography>

                                                        <Box>
                                                            <Typography
                                                                variant="h4"
                                                                gutterBottom
                                                                sx={{ fontWeight: 700, fontSize: { xs: '1.2rem', md: '1.4rem' }, color: '#0f2414', fontFamily: 'var(--font-playfair)' }}
                                                            >
                                                                {stat.label}
                                                            </Typography>
                                                            <Typography
                                                                variant="body1"
                                                                sx={{ fontSize: { xs: '0.9rem', md: '0.95rem' }, color: 'rgba(0,0,0,0.6)' }}
                                                            >
                                                                {stat.description}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </Paper>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </Box>

                            {/* Progress Indicators */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    gap: 1.5,
                                    alignItems: 'center',
                                    position: 'absolute',
                                    bottom: -40,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    bgcolor: 'rgba(255,255,255,0.8)',
                                    backdropFilter: 'blur(10px)',
                                    px: 2.5,
                                    py: 1.5,
                                    borderRadius: 3,
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                }}
                            >
                                {stats.map((_, index) => {
                                    const isActive = index === activeStatIndex;
                                    
                                    return isActive ? (
                                        <Box
                                            key={index}
                                            sx={{
                                                width: 50,
                                                height: 8,
                                                borderRadius: 4,
                                                bgcolor: 'rgba(0,0,0,0.05)',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                boxShadow: `inset 0 1px 3px rgba(0,0,0,0.1)`,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: 0,
                                                    height: '100%',
                                                    width: `${progress}%`,
                                                    background: `linear-gradient(90deg, #4CAF50, #81c784)`,
                                                    borderRadius: 4,
                                                    transition: 'width 50ms linear',
                                                    boxShadow: `0 0 8px rgba(76, 175, 80, 0.4)`,
                                                }}
                                            />
                                        </Box>
                                    ) : (
                                        <Box
                                            key={index}
                                            sx={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: '50%',
                                                bgcolor: 'rgba(0,0,0,0.1)',
                                                transition: 'all 0.3s ease',
                                                border: `2px solid rgba(255,255,255,1)`,
                                            }}
                                        />
                                    );
                                })}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
