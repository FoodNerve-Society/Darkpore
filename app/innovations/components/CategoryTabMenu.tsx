'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Stack, useTheme, IconButton, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { motion } from 'framer-motion';
import { GridView, Close } from '@mui/icons-material';

export interface Category {
    id: string;
    title: string;
    count: number;
}

interface CategoryTabMenuProps {
    categories: Category[];
    selectedCategoryId: string;
    onSelectCategory: (id: string) => void;
    themeColor: string;
}

export const CategoryTabMenu: React.FC<CategoryTabMenuProps> = ({ categories, selectedCategoryId, onSelectCategory, themeColor }) => {
    const tabRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [gridOpen, setGridOpen] = useState(false);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollWidth, clientWidth, scrollLeft } = scrollContainerRef.current;
            // Allow a small 5px threshold
            setCanScrollRight(scrollWidth - clientWidth - scrollLeft > 5);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [categories]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const tab = tabRefs.current.get(selectedCategoryId);
            if (tab) {
                tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }, 100); 

        return () => clearTimeout(timer); 
    }, [selectedCategoryId]); 

    return (
        <Box sx={{ display: 'flex', width: '100%', mb: 4, alignItems: 'center', justifyContent: 'center' }}>
            {/* Grid Icon Button (Moved to left, styling stripped) */}
            <IconButton 
                onClick={() => setGridOpen(true)}
                sx={{ 
                    mr: 1, 
                    width: 48,
                    height: 48,
                    color: 'text.secondary',
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                    '&:hover': { color: themeColor, transform: 'scale(1.05)' }
                }}
            >
                <GridView />
            </IconButton>

            <Box sx={{ position: 'relative', width: 'max-content', maxWidth: 'calc(100% - 56px)' }}>
                <Box 
                    ref={scrollContainerRef}
                    onScroll={checkScroll}
                    sx={{ 
                    width: '100%',
                    display: 'flex', 
                    justifyContent: 'flex-start',
                    alignItems: 'center', 
                    overflowX: 'auto', 
                    p: 0.75, 
                    gap: 1.5, 
                    scrollSnapType: 'x mandatory', 
                    '&::-webkit-scrollbar': { display: 'none' }, 
                    'scrollbarWidth': 'none'
                }}>
                    {categories.map((cat) => {
                        const isActive = selectedCategoryId === cat.id;
                        
                        return (
                            <Box
                                key={cat.id}
                                ref={(el) => { tabRefs.current.set(cat.id, el as HTMLDivElement | null); }}
                                onClick={() => onSelectCategory(cat.id)}
                                sx={{
                                    px: 2.5, py: 1.25, position: 'relative', zIndex: 2,
                                    color: isActive ? 'white' : (cat.id === 'Offers for Today' ? '#dc2626' : 'text.secondary'),
                                    cursor: 'pointer', whiteSpace: 'nowrap',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    borderRadius: '999px',
                                    scrollSnapAlign: 'center',
                                    border: cat.id === 'Offers for Today' && !isActive ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid transparent',
                                    background: isActive 
                                        ? 'transparent' 
                                        : (cat.id === 'Offers for Today' 
                                            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(249, 115, 22, 0.08) 100%)' 
                                            : 'rgba(241, 245, 249, 0.8)'), // Soft frosted gray for inactive
                                    boxShadow: cat.id === 'Offers for Today' && !isActive ? 'inset 0 0 12px rgba(239, 68, 68, 0.05)' : 'none',
                                    '&:hover': { 
                                        color: isActive ? 'white' : (cat.id === 'Offers for Today' ? '#b91c1c' : theme.palette.text.primary),
                                        background: isActive ? 'transparent' : (cat.id === 'Offers for Today' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(249, 115, 22, 0.15) 100%)' : 'rgba(226, 232, 240, 0.9)'),
                                        borderColor: cat.id === 'Offers for Today' && !isActive ? 'rgba(239, 68, 68, 0.7)' : 'transparent',
                                        transform: cat.id === 'Offers for Today' && !isActive ? 'translateY(-1px)' : 'none'
                                    }
                                }}
                            >
                            <Stack spacing={1} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <Typography variant="button" sx={{ 
                                        fontWeight: isActive ? 800 : 700, 
                                        textTransform: 'none',
                                        letterSpacing: '-0.01em',
                                        fontSize: '0.9rem',
                                        lineHeight: 1
                                    }}>
                                        {cat.title}
                                    </Typography>
                                    {cat.count > 0 && (
                                        <Box sx={{ 
                                            bgcolor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(15, 23, 42, 0.06)', 
                                            px: 0.8, py: 0.4, borderRadius: 1, fontSize: '0.7rem',
                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                            lineHeight: 1
                                        }}>
                                            {cat.count}
                                        </Box>
                                    )}
                                </Stack>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-category-highlight"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        style={{
                                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                            borderRadius: '999px', backgroundColor: themeColor,
                                            zIndex: -1, 
                                            boxShadow: `0 4px 12px ${themeColor}50, inset 0 -2px 4px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.2)`
                                        }}
                                    />
                                )}
                            </Box>
                        );
                    })}
                    {/* Spacer to allow the very last item to scroll comfortably past the gradient */}
                    <Box sx={{ minWidth: 24, flexShrink: 0 }} />
                </Box>
            </Box>

            <Dialog 
                open={gridOpen} 
                onClose={() => setGridOpen(false)}
                maxWidth="md"
                fullWidth
                {...{ PaperProps: { sx: { borderRadius: '24px', bgcolor: 'background.paper', boxShadow: '0 24px 60px rgba(0,0,0,0.1)', p: { xs: 2, sm: 4 } } } } as any}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                        All Categories
                    </Typography>
                    <IconButton onClick={() => setGridOpen(false)} sx={{ bgcolor: 'action.hover' }}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1, pb: 2 }}>
                        {categories.map((cat) => {
                            const isActive = selectedCategoryId === cat.id;
                            const isOffers = cat.id === 'Offers for Today';
                            
                            return (
                                <Box
                                    key={`grid-${cat.id}`}
                                    onClick={() => {
                                        onSelectCategory(cat.id);
                                        setGridOpen(false);
                                    }}
                                    sx={{
                                        px: 3, py: 1.5, 
                                        borderRadius: '100px',
                                        cursor: 'pointer',
                                        border: isActive ? `2px solid ${themeColor}` : (isOffers ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid'),
                                        borderColor: isActive ? themeColor : (isOffers ? 'rgba(239, 68, 68, 0.5)' : 'divider'),
                                        bgcolor: isActive ? `${themeColor}15` : (isOffers ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(249, 115, 22, 0.08) 100%)' : 'transparent'),
                                        color: isActive ? themeColor : (isOffers ? '#dc2626' : 'text.primary'),
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        '&:hover': {
                                            bgcolor: isActive ? `${themeColor}20` : (isOffers ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(249, 115, 22, 0.15) 100%)' : 'action.hover'),
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    <Typography variant="button" sx={{ fontWeight: isActive ? 800 : (isOffers ? 800 : 600), textTransform: 'none', fontSize: '0.95rem' }}>
                                        {cat.title}
                                    </Typography>
                                    {cat.count > 0 && (
                                        <Box sx={{ 
                                            bgcolor: isActive ? `${themeColor}30` : (isOffers ? 'rgba(239, 68, 68, 0.15)' : 'action.selected'), 
                                            px: 1.2, py: 0.3, borderRadius: 2, fontSize: '0.75rem', fontWeight: 'bold' 
                                        }}>
                                            {cat.count}
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};
