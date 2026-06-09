"use client";

import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Paper, Chip, Stack, Button, CircularProgress, Grid } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowBack, FilterList, Lightbulb, MenuBook, Groups, EmojiEvents, PlayCircleFilled, Work, Lock } from '@mui/icons-material';
import { getExploreFeed, ExploreSection, ExploreFeedItem } from '@/lib/db/explore';
import { foodChallenges } from '@/lib/cms/food/challenges';
import { useRouter } from 'next/navigation';

interface ExploreFeedProps {
    role: any;
    onBack: () => void;
    onTabChange: (tabId: string) => void;
}

export default function ExploreFeed({ role, onBack, onTabChange }: ExploreFeedProps) {
    const router = useRouter();
    const [activeChallenge, setActiveChallenge] = useState('all');
    const [feedItems, setFeedItems] = useState<ExploreFeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCom, setIsCom] = useState(false);

    const tabs = [
        { id: 'innovations', label: 'Innovations', icon: <Lightbulb fontSize="small" /> },
        { id: 'library', label: 'Library', icon: <MenuBook fontSize="small" /> },
        { id: 'community', label: 'Community', icon: <Groups fontSize="small" /> },
        { id: 'activities', label: 'Activities', icon: <EmojiEvents fontSize="small" /> },
        { id: 'livestreams', label: 'Livestreams', icon: <PlayCircleFilled fontSize="small" /> },
        { id: 'jobs', label: 'Jobs', icon: <Work fontSize="small" /> },
    ];

    // Build dynamic challenges list from the CMS config
    const dynamicChallenges = ['all', ...foodChallenges.map(c => c.id)];

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsCom(window.location.hostname.includes('foodnerve.com'));
        }
        
        async function loadFeed() {
            setLoading(true);
            try {
                // Fetch using the new explore engine
                const items = await getExploreFeed(role.id as ExploreSection, activeChallenge);
                setFeedItems(items);
            } catch (err) {
                console.error("Failed to load feed", err);
            } finally {
                setLoading(false);
            }
        }
        loadFeed();
    }, [role.id, activeChallenge]);

    const handleCardClick = (item: ExploreFeedItem) => {
        // .org Behavior: Funnel to Join
        if (!isCom) {
            router.push('/join');
            return;
        }

        // .com Behavior: Free access unless Premium
        if (item.isPremium) {
            router.push('/join');
        } else {
            // In a real app, this would route to a public details page.
            // For now, we mock the routing.
            alert(`Opening public details for: ${item.title}`);
        }
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', color: 'white' }}>
            {/* Header */}
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={onBack} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}>
                    <ArrowBack />
                </IconButton>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>{role.title} Hub</Typography>
                    <Typography variant="body2" sx={{ color: role.color }}>{role.mantra}</Typography>
                </Box>
            </Box>

            {/* Navigation Tabs (The 6 CTAs) */}
            <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', px: 3, pt: 2 }}>
                <Stack direction="row" spacing={4} sx={{ overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                    {tabs.map(tab => (
                        <Box
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, cursor: 'pointer',
                                color: role.id === tab.id ? role.color : 'rgba(255,255,255,0.5)',
                                borderBottom: role.id === tab.id ? `3px solid ${role.color}` : '3px solid transparent',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap',
                                '&:hover': { color: role.color }
                            }}
                        >
                            {tab.icon}
                            <Typography sx={{ fontWeight: 700 }}>{tab.label}</Typography>
                        </Box>
                    ))}
                </Stack>
            </Box>

            {/* Main Content Area */}
            <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
                {/* Filters */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, overflowX: 'auto', pb: 1 }}>
                    <FilterList sx={{ color: 'rgba(255,255,255,0.5)' }} />
                    {dynamicChallenges.map(c => (
                        <Chip
                            key={c}
                            label={c === 'all' ? 'All Bottlenecks' : c.replace(/-/g, ' ').toUpperCase()}
                            onClick={() => setActiveChallenge(c)}
                            sx={{
                                bgcolor: activeChallenge === c ? role.color : 'rgba(255,255,255,0.1)',
                                color: activeChallenge === c ? 'white' : 'rgba(255,255,255,0.7)',
                                fontWeight: 700,
                                '&:hover': { bgcolor: activeChallenge === c ? role.color : 'rgba(255,255,255,0.2)' }
                            }}
                        />
                    ))}
                </Box>

                {/* Grid */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                        <CircularProgress sx={{ color: role.color }} />
                    </Box>
                ) : feedItems.length === 0 ? (
                    <Box sx={{ textAlign: 'center', p: 5, color: 'rgba(255,255,255,0.5)' }}>
                        <Typography variant="h6">No {role.id} found for this bottleneck yet.</Typography>
                        <Typography variant="body2">Be the first to create one in the Society OS.</Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        <AnimatePresence mode="popLayout">
                            {feedItems.map((item, i) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3, delay: i * 0.05 }}
                                    >
                                        <Paper sx={{ 
                                            bgcolor: 'rgba(255,255,255,0.05)', 
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 4,
                                            color: 'white',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            overflow: 'hidden'
                                        }}>
                                            <Box sx={{ 
                                                height: 160, 
                                                backgroundImage: `url(${item.imageUrl})`, 
                                                backgroundSize: 'cover', 
                                                backgroundPosition: 'center',
                                                position: 'relative'
                                            }}>
                                                {item.isPremium && (
                                                    <Chip 
                                                        icon={<Lock sx={{ fontSize: 14 }}/>} 
                                                        label="Premium" 
                                                        size="small" 
                                                        sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(0,0,0,0.7)', color: '#d97706' }} 
                                                    />
                                                )}
                                            </Box>
                                            <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                                <Typography variant="overline" sx={{ color: role.color, fontWeight: 800 }}>
                                                    {item.meta || item.type.toUpperCase()}
                                                </Typography>
                                                <Typography variant="h6" gutterBottom sx={{ mt: 0.5, fontWeight: 700 }}>
                                                    {item.title}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2, flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {item.description}
                                                </Typography>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                                        {item.authorName}
                                                    </Typography>
                                                    {item.date && (
                                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                                            {new Date(item.date).toLocaleDateString()}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Button 
                                                    variant="contained" 
                                                    fullWidth
                                                    onClick={() => handleCardClick(item)}
                                                    sx={{ 
                                                        bgcolor: 'white', 
                                                        color: 'black', 
                                                        borderRadius: 8,
                                                        fontWeight: 700,
                                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' }
                                                    }}
                                                >
                                                    {(!isCom || item.isPremium) ? 'Login to Access' : 'View Details'}
                                                </Button>
                                            </Box>
                                        </Paper>
                                    </motion.div>
                                </Grid>
                            ))}
                        </AnimatePresence>
                    </Grid>
                )}
            </Box>
        </Box>
    );
}
