"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Container, Grid, Stack, Typography, Chip, Button, Paper, useTheme, alpha, Avatar, AvatarGroup } from '@mui/material';
import { Spa } from '@mui/icons-material';
import AnimatedCounter from './AnimatedCounter';
import Link from 'next/link';

export interface Stat {
    id?: string;
    label: string;
    value: number;
    icon: any;
    description: string;
    gradient: string;
    bgGradient: string;
    imageUrl?: string;
    tag?: string;
}

interface HeroSectionProps {
    boardData: {
        displayName: string;
        tagline: string;
        publicPageSettings?: {
            valueProposition?: string;
        };
    };
    updates: Stat[];
}

export default function SocietyHero({ boardData, updates }: HeroSectionProps) {
    const theme = useTheme();
    const [startIndex, setStartIndex] = useState(0);

    useEffect(() => {
        if (!updates || updates.length <= 5) return;
        
        const interval = setInterval(() => {
            setStartIndex(prev => (prev - 1 + updates.length) % updates.length);
        }, 3500); // Slide a new one in every 3.5 seconds

        return () => clearInterval(interval);
    }, [updates]);

    // Construct the live feed by taking 5 items starting from startIndex
    const feed = [];
    if (updates && updates.length > 0) {
        for (let i = 0; i < Math.min(5, updates.length); i++) {
            feed.push(updates[(startIndex + i) % updates.length]);
        }
    }    return (
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

                    {/* Right: Stacked Cinematic Banners (Live Feed) */}
                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Stack spacing={2} sx={{ width: '100%', maxWidth: { xs: '100%', md: 500 }, pt: { xs: 5, md: 0 } }}>
                            <AnimatePresence initial={false} mode="popLayout">
                                {feed.map((stat, index) => {
                                    // Cinematic dark gradient merging into the image
                                    const cardBg = stat.imageUrl 
                                        ? `linear-gradient(90deg, rgba(15,36,20,0.95) 0%, rgba(15,36,20,0.7) 40%, rgba(15,36,20,0.85) 100%), url(${stat.imageUrl}) center/cover no-repeat`
                                        : `linear-gradient(135deg, rgba(15,36,20,0.95) 0%, rgba(15,36,20,0.85) 100%)`;

                                    return (
                                        <motion.div
                                            key={stat.id || `${stat.label}-${index}`}
                                            layout
                                            initial={{ opacity: 0, y: -40, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                            style={{ width: '100%' }}
                                        >
                                            <Paper
                                                sx={{
                                                    width: '100%',
                                                    height: { xs: 68, md: 76 }, // Shrunk height to match .com past cards closely while remaining legible
                                                    background: cardBg,
                                                    borderRadius: 3, // Slightly less rounded for a tighter card
                                                    boxShadow: `0 4px 12px rgba(0,0,0,0.1)`,
                                                    border: `1px solid rgba(255,255,255,0.08)`,
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    px: 2,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: 2,
                                                        background: 'rgba(255,255,255,0.1)',
                                                        backdropFilter: 'blur(10px)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        mr: 2,
                                                        border: `1px solid rgba(255,255,255,0.15)`,
                                                    }}
                                                >
                                                    <stat.icon sx={{ fontSize: 24, color: '#fff' }} />
                                                </Box>
                                                
                                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {stat.tag && (
                                                            <Chip 
                                                                label={stat.tag} 
                                                                size="small" 
                                                                sx={{ 
                                                                    height: 18, 
                                                                    fontSize: '0.65rem', 
                                                                    fontWeight: 800, 
                                                                    color: '#fff', 
                                                                    bgcolor: 'rgba(255,255,255,0.15)',
                                                                    backdropFilter: 'blur(4px)',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.5px'
                                                                }} 
                                                            />
                                                        )}
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{ 
                                                                fontWeight: 700, 
                                                                fontSize: { xs: '0.75rem', md: '0.8rem' }, 
                                                                color: stat.gradient.includes('4CAF50') ? '#81c784' : stat.gradient.includes('d97706') ? '#fbbf24' : '#64b5f6', 
                                                                textTransform: 'uppercase', 
                                                                letterSpacing: '0.5px',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis'
                                                            }}
                                                        >
                                                            {stat.label}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.2 }}>
                                                        <Typography
                                                            variant="h5"
                                                            sx={{
                                                                fontWeight: 900,
                                                                color: '#fff',
                                                                fontSize: { xs: '1.2rem', md: '1.4rem' },
                                                                lineHeight: 1,
                                                            }}
                                                        >
                                                            <AnimatedCounter 
                                                                end={stat.value} 
                                                                duration={1.5} 
                                                            />
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{ fontSize: { xs: '0.75rem', md: '0.8rem' }, color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                                        >
                                                            {stat.description}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
