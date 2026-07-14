"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Container, Grid, Stack, Typography, Chip, Button, Paper, useTheme, alpha, Avatar, AvatarGroup } from '@mui/material';
import Link from 'next/link';

export interface ActivityEvent {
    id: string;
    userName: string;
    avatarUrl: string;
    timeAgo: string;
    tab: string;
    action: string;
    gradient: string;
    icon: any;
}

interface HeroSectionProps {
    boardData: {
        displayName: string;
        tagline: string;
        publicPageSettings?: {
            valueProposition?: string;
        };
    };
    updates: ActivityEvent[];
}

export default function SocietyHero({ boardData, updates }: HeroSectionProps) {
    const theme = useTheme();
    const [startIndex, setStartIndex] = useState(0);
    const [isExpanding, setIsExpanding] = useState(false);

    useEffect(() => {
        if (!updates || updates.length <= 5) return;
        
        const interval = setInterval(() => {
            // Phase 1: Start expanding the skeleton
            setIsExpanding(true);
            
            // Phase 2: After expansion completes, commit the new card and reset skeleton
            setTimeout(() => {
                setStartIndex(prev => (prev + 1) % updates.length);
                setIsExpanding(false);
            }, 700);
        }, 3500);

        return () => clearInterval(interval);
    }, [updates]);

    // Construct the live feed by taking 5 items starting from startIndex
    const feed = [];
    if (updates && updates.length > 0) {
        for (let i = 0; i < Math.min(5, updates.length); i++) {
            feed.push(updates[(startIndex + i) % updates.length]);
        }
    }

    // Tab color map for the ambient glow
    const tabColorMap: Record<string, string> = {
        'TRADE': '#10b981',
        'LEARN': '#f59e0b',
        'MEET': '#6366f1',
        'SUPPORT': '#ec4899',
        'PROFILE': '#0ea5e9',
    };

    // 3D drum perspective: cards curve away at top and bottom
    // index 0 = top, index 4 = bottom
    // Center (index 2) is flat and fully opaque
    const getCardTransform = (index: number) => {
        const center = 2;
        const offset = index - center; // -2, -1, 0, 1, 2
        const rotateX = offset * -4; // top tilts back (+8°), bottom tilts forward (-8°)
        const distFromCenter = Math.abs(offset);
        const opacity = 1 - distFromCenter * 0.12; // 0.76, 0.88, 1.0, 0.88, 0.76
        const scale = 1 - distFromCenter * 0.02; // slight scale reduction at edges
        return { rotateX, opacity, scale };
    };

    return (
        <Box
            sx={{
                position: 'relative',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                backgroundColor: '#f8faf9',
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
                                <a href="https://foodnerve.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 1, bgcolor: 'rgba(255,255,255,0.8)', px: 2.5, py: 1, borderRadius: '14px', width: 'fit-content', boxShadow: `0 4px 15px rgba(0,0,0,0.05)`, border: `1px solid rgba(0,0,0,0.05)`, transition: 'all 0.2s', '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' } }}>
                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#2e7d32' }} />
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'rgba(0,0,0,0.5)', fontSize: '0.78rem', letterSpacing: '0.3px' }}>
                                            Part of the{' '}
                                            <Box component="span" sx={{ color: '#1b5e20', fontWeight: 800 }}>FoodNerve</Box>
                                            {' '}Ecosystem
                                        </Typography>
                                    </Box>
                                </a>

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
                                                borderRadius: '16px',
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
                                                borderRadius: '16px',
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

                    {/* Right: Live Activity Feed — 3D drum perspective */}
                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ 
                            width: '100%', 
                            maxWidth: { xs: '100%', md: 480 }, 
                            pt: { xs: 5, md: 0 },
                            perspective: '1200px',
                        }}>
                            {/* Live Indicator */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, px: 1 }}>
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: '#ef4444',
                                        boxShadow: '0 0 12px rgba(239, 68, 68, 0.6)',
                                    }}
                                />
                                <Typography variant="overline" sx={{ color: 'rgba(0,0,0,0.45)', letterSpacing: '2.5px', fontWeight: 700, fontSize: '0.65rem' }}>
                                    LIVE ACROSS THE ECOSYSTEM
                                </Typography>
                            </Box>

                            <Stack spacing={1.5} sx={{ transformStyle: 'preserve-3d' }}>
                                <AnimatePresence initial={false} mode="popLayout">
                                    {feed.map((stat, index) => {
                                        const accentColor = tabColorMap[stat.tab] || '#10b981';
                                        const { rotateX, opacity, scale } = getCardTransform(index);

                                        return (
                                            <motion.div
                                                key={stat.id || `${stat.userName}-${index}`}
                                                layout
                                                initial={{ opacity: 0, y: 50, scale: 0.92 }}
                                                animate={{ 
                                                    opacity, 
                                                    y: 0, 
                                                    scale,
                                                    rotateX,
                                                }}
                                                exit={{ opacity: 0, y: -30, scale: 0.9, rotateX: 12, transition: { duration: 0.3 } }}
                                                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                                                style={{ width: '100%', transformStyle: 'preserve-3d' }}
                                            >
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        width: '100%',
                                                        background: 'rgba(18, 24, 20, 0.92)',
                                                        backdropFilter: 'blur(20px)',
                                                        borderRadius: '22px',
                                                        boxShadow: `0 6px 28px ${alpha(accentColor, 0.18)}, 0 1.5px 4px rgba(0,0,0,0.08)`,
                                                        border: `1px solid ${alpha(accentColor, 0.12)}`,
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        px: 2.5,
                                                        py: 1.5,
                                                        cursor: 'default',
                                                        transition: 'box-shadow 0.3s ease, border 0.3s ease',
                                                        '&:hover': {
                                                            boxShadow: `0 12px 40px ${alpha(accentColor, 0.28)}, 0 2px 6px rgba(0,0,0,0.1)`,
                                                            border: `1px solid ${alpha(accentColor, 0.25)}`,
                                                        },
                                                    }}
                                                >
                                                    <Avatar 
                                                        variant="rounded"
                                                        src={stat.avatarUrl} 
                                                        alt={stat.userName}
                                                        sx={{ 
                                                            width: 42, 
                                                            height: 42, 
                                                            mr: 2,
                                                            borderRadius: '13px',
                                                            border: `2px solid ${alpha(accentColor, 0.4)}`,
                                                            boxShadow: `0 0 12px ${alpha(accentColor, 0.2)}`,
                                                        }} 
                                                    />
                                                    
                                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: 0.3 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <Chip 
                                                                label={stat.tab} 
                                                                size="small" 
                                                                sx={{ 
                                                                    height: 18, 
                                                                    fontSize: '0.6rem', 
                                                                    fontWeight: 800, 
                                                                    color: '#fff', 
                                                                    background: stat.gradient,
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.8px',
                                                                    borderRadius: '6px',
                                                                    '& .MuiChip-label': { px: 1 }
                                                                }} 
                                                            />
                                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontWeight: 500, fontSize: '0.7rem' }}>
                                                                {stat.timeAgo}
                                                            </Typography>
                                                        </Box>
                                                        
                                                        <Typography
                                                            variant="body2"
                                                            sx={{ 
                                                                fontSize: '0.84rem', 
                                                                color: 'rgba(255,255,255,0.7)',
                                                                lineHeight: 1.35,
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}
                                                        >
                                                            <Box component="span" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>
                                                                {stat.userName}
                                                            </Box>
                                                            {' '}
                                                            {stat.action}
                                                        </Typography>
                                                    </Box>
                                                </Paper>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>

                                {/* Skeleton conveyor belt — expands from pill into full card */}
                                <motion.div
                                    animate={{
                                        width: isExpanding ? '100%' : '50%',
                                        height: isExpanding ? 62 : 28,
                                        opacity: isExpanding ? 0.7 : 0.35,
                                        borderRadius: isExpanding ? 22 : 14,
                                    }}
                                    transition={{ 
                                        duration: 0.65,
                                        ease: [0.4, 0, 0.2, 1],
                                    }}
                                    style={{ 
                                        alignSelf: 'center',
                                        overflow: 'hidden',
                                        position: 'relative',
                                    }}
                                >
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            background: 'rgba(18, 24, 20, 0.45)',
                                            backdropFilter: 'blur(8px)',
                                            borderRadius: 'inherit',
                                            border: '1px dashed rgba(255,255,255,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: isExpanding ? 'flex-start' : 'center',
                                            px: isExpanding ? 2.5 : 0,
                                            overflow: 'hidden',
                                            position: 'relative',
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: '-100%',
                                                width: '100%',
                                                height: '100%',
                                                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
                                                animation: 'shimmer 2s ease-in-out infinite',
                                            },
                                            '@keyframes shimmer': {
                                                '0%': { left: '-100%' },
                                                '100%': { left: '100%' },
                                            },
                                        }}
                                    >
                                        {/* When expanding, show skeleton content */}
                                        <AnimatePresence>
                                            {isExpanding && (
                                                <motion.div 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.2, duration: 0.3 }}
                                                    style={{ display: 'flex', alignItems: 'center', width: '100%' }}
                                                >
                                                    <Box sx={{ 
                                                        width: 36, height: 36, borderRadius: '11px', 
                                                        bgcolor: 'rgba(255,255,255,0.08)', mr: 1.5, flexShrink: 0 
                                                    }} />
                                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.6 }}>
                                                        <Box sx={{ 
                                                            width: 55, height: 10, borderRadius: '3px', 
                                                            bgcolor: 'rgba(255,255,255,0.08)' 
                                                        }} />
                                                        <Box sx={{ 
                                                            width: '70%', height: 8, borderRadius: '3px', 
                                                            bgcolor: 'rgba(255,255,255,0.05)' 
                                                        }} />
                                                    </Box>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* When collapsed, show subtle loading dots */}
                                        {!isExpanding && (
                                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', width: '100%' }}>
                                                {[0, 1, 2].map(i => (
                                                    <motion.div
                                                        key={i}
                                                        animate={{ opacity: [0.2, 0.6, 0.2] }}
                                                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                                                        style={{
                                                            width: 4,
                                                            height: 4,
                                                            borderRadius: '50%',
                                                            backgroundColor: 'rgba(255,255,255,0.3)',
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        )}
                                    </Paper>
                                </motion.div>
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
