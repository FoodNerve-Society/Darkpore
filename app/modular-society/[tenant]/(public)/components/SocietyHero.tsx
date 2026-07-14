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

    useEffect(() => {
        if (!updates || updates.length <= 5) return;
        
        const interval = setInterval(() => {
            // Advance forward so the newest item appears at the bottom
            setStartIndex(prev => (prev + 1) % updates.length);
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

    // Tab color map for the gradient edge accent
    const tabColorMap: Record<string, string> = {
        'TRADE': '#10b981',
        'LEARN': '#f59e0b',
        'MEET': '#6366f1',
        'SUPPORT': '#ec4899',
        'PROFILE': '#0ea5e9',
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
                                                borderRadius: 8,
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
                                                borderRadius: 8,
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

                    {/* Right: Live Activity Feed (Chat-style, bottom-up) */}
                    <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Stack spacing={1.5} sx={{ width: '100%', maxWidth: { xs: '100%', md: 480 }, pt: { xs: 5, md: 0 } }}>
                            
                            {/* Live Indicator — sits above the feed */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, px: 1 }}>
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

                            <AnimatePresence initial={false} mode="popLayout">
                                {feed.map((stat, index) => {
                                    const accentColor = tabColorMap[stat.tab] || '#10b981';
                                    // Depth: oldest items at top are slightly faded
                                    const depthOpacity = 0.55 + (index / 4) * 0.45; // 0.55 → 1.0

                                    return (
                                        <motion.div
                                            key={stat.id || `${stat.userName}-${index}`}
                                            layout
                                            initial={{ opacity: 0, y: 50, scale: 0.92 }}
                                            animate={{ opacity: depthOpacity, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -30, scale: 0.95, transition: { duration: 0.25 } }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                            style={{ width: '100%' }}
                                        >
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    width: '100%',
                                                    background: 'rgba(18, 24, 20, 0.92)',
                                                    backdropFilter: 'blur(20px)',
                                                    borderRadius: '22px',
                                                    boxShadow: `0 4px 24px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)`,
                                                    border: `1px solid rgba(255,255,255,0.06)`,
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    px: 2.5,
                                                    py: 1.5,
                                                    cursor: 'default',
                                                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&:hover': {
                                                        transform: 'translateX(6px)',
                                                        boxShadow: `0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.08)`,
                                                    },
                                                    // Gradient accent line on the left via pseudo-element (preserves borderRadius)
                                                    '&::before': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        left: 0,
                                                        top: '15%',
                                                        bottom: '15%',
                                                        width: '3px',
                                                        borderRadius: '0 3px 3px 0',
                                                        background: stat.gradient,
                                                    }
                                                }}
                                            >
                                                {/* Avatar */}
                                                <Avatar 
                                                    variant="rounded"
                                                    src={stat.avatarUrl} 
                                                    alt={stat.userName}
                                                    sx={{ 
                                                        width: 42, 
                                                        height: 42, 
                                                        mr: 2,
                                                        borderRadius: '13px',
                                                        border: `1.5px solid ${alpha(accentColor, 0.3)}`,
                                                        boxShadow: `0 2px 8px ${alpha(accentColor, 0.15)}`,
                                                    }} 
                                                />
                                                
                                                {/* Content */}
                                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: 0.3 }}>
                                                    {/* Header row: Tab chip + timestamp */}
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
                                                    
                                                    {/* Action text */}
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
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}


import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Container, Grid, Stack, Typography, Chip, Button, Paper, useTheme, alpha, Avatar, AvatarGroup } from '@mui/material';
import { Spa } from '@mui/icons-material';
import AnimatedCounter from './AnimatedCounter';
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
                                    return (
                                        <motion.div
                                            key={stat.id || `${stat.userName}-${index}`}
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
                                                    minHeight: { xs: 68, md: 76 },
                                                    background: 'rgba(20,28,24,0.95)',
                                                    borderRadius: '24px', // Squircle appearance
                                                    boxShadow: `0 8px 32px rgba(0,0,0,0.12)`,
                                                    border: `1px solid rgba(255,255,255,0.08)`,
                                                    borderLeft: `4px solid transparent`,
                                                    borderImage: `${stat.gradient} 1`,
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    px: 2,
                                                    py: 1,
                                                }}
                                            >
                                                {/* Left side: Avatar */}
                                                <Avatar 
                                                    variant="rounded"
                                                    src={stat.avatarUrl} 
                                                    alt={stat.userName}
                                                    sx={{ 
                                                        width: 44, 
                                                        height: 44, 
                                                        mr: 2,
                                                        borderRadius: '14px', // Squircle appearance for avatar
                                                        border: '1px solid rgba(255,255,255,0.1)'
                                                    }} 
                                                />
                                                
                                                {/* Right side: Content */}
                                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Chip 
                                                            label={stat.tab} 
                                                            size="small" 
                                                            sx={{ 
                                                                height: 18, 
                                                                fontSize: '0.65rem', 
                                                                fontWeight: 800, 
                                                                color: '#fff', 
                                                                background: stat.gradient,
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.5px'
                                                            }} 
                                                        />
                                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                                                            {stat.timeAgo}
                                                        </Typography>
                                                    </Box>
                                                    
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ 
                                                            fontSize: { xs: '0.85rem', md: '0.9rem' }, 
                                                            color: 'rgba(255,255,255,0.8)',
                                                            lineHeight: 1.3
                                                        }}
                                                    >
                                                        <Box component="span" sx={{ fontWeight: 700, color: '#fff', mr: 0.5 }}>
                                                            {stat.userName}
                                                        </Box>
                                                        {stat.action}
                                                    </Typography>
                                                </Box>
                                            </Paper>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            
                            {/* Live Indicator */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1, gap: 1.5 }}>
                                <motion.div
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: '#ef4444',
                                        boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)'
                                    }}
                                />
                                <Typography variant="overline" sx={{ color: 'rgba(0,0,0,0.6)', letterSpacing: '2px', fontWeight: 800 }}>
                                    LIVE ECOSYSTEM FEED
                                </Typography>
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
