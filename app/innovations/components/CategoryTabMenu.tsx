'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Stack, useTheme, IconButton, Dialog, DialogTitle, DialogContent, TextField } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { GridView, Close, Search } from '@mui/icons-material';
import { SearchBar } from './SearchBar';

export interface Category {
    id: string;
    title: string;
    count: number;
    themeColor?: string;
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
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
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
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', mb: 4 }}>
            <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
            {/* Search Icon Button */}
            <IconButton 
                onClick={() => setSearchOpen(!searchOpen)}
                sx={{ 
                    mr: 1, 
                    width: 48,
                    height: 48,
                    color: searchOpen ? themeColor : 'text.secondary',
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                    bgcolor: searchOpen ? `${themeColor}15` : 'transparent',
                    '&:hover': { color: themeColor, transform: 'scale(1.05)', bgcolor: `${themeColor}20` }
                }}
            >
                {searchOpen ? <Close /> : <Search />}
            </IconButton>

            <Box sx={{ position: 'relative', width: 'max-content', maxWidth: 'calc(100% - 56px)' }}>
                <Box
                    component={motion.div}
                    key="category-list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    sx={{ position: 'relative', width: '100%' }}
                >
                    {canScrollRight && (
                        <Box sx={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 40, background: 'linear-gradient(to right, transparent, #ffffff)', zIndex: 10, pointerEvents: 'none' }} />
                    )}
                    <Box 
                        ref={scrollContainerRef}
                        onScroll={checkScroll}
                        sx={{ 
                        width: '100%',
                        display: 'flex', 
                        justifyContent: 'flex-start',
                        alignItems: 'center', 
                        overflowX: 'auto', 
                        py: 2,
                        px: 1, 
                        gap: 0.5, // Tighter gap for segmented look
                        scrollSnapType: 'x mandatory', 
                        '&::-webkit-scrollbar': { display: 'none' }, 
                        'scrollbarWidth': 'none'
                    }}>
            {categories.map((cat, index) => {
                const isActive = selectedCategoryId === cat.id;
                const isFirst = index === 0;
                const isLast = index === categories.length - 1;
                const catColor = cat.themeColor || themeColor;
                        
                        return (
                            <Box
                                key={cat.id}
                                ref={(el) => { tabRefs.current.set(cat.id, el as HTMLDivElement | null); }}
                                onClick={() => onSelectCategory(cat.id)}
                                sx={{
                                    px: isActive ? 4 : 3, py: 1.25, position: 'relative', zIndex: 2,
                                    color: isActive ? 'white' : catColor,
                                    cursor: 'pointer', whiteSpace: 'nowrap',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    borderRadius: isActive 
                                        ? '999px !important' 
                                        : (isFirst 
                                            ? '999px 12px 12px 999px !important' 
                                            : isLast 
                                                ? '12px 999px 999px 12px !important' 
                                                : '12px !important'),
                                    scrollSnapAlign: 'center',
                                    border: cat.id === 'Offers for Today' && !isActive ? `1px solid ${catColor}80` : '1px solid transparent',
                                    background: isActive 
                                        ? 'transparent' 
                                        : (cat.id === 'Offers for Today' 
                                            ? `linear-gradient(135deg, ${catColor}15 0%, ${catColor}20 100%)` 
                                            : `${catColor}15`), // Tinted version of category color
                                    boxShadow: cat.id === 'Offers for Today' && !isActive ? `inset 0 0 12px ${catColor}10` : 'none',
                                    '&:hover': { 
                                        color: isActive ? 'white' : catColor,
                                        background: isActive ? 'transparent' : `${catColor}25`,
                                        borderColor: cat.id === 'Offers for Today' && !isActive ? catColor : 'transparent',
                                        transform: cat.id === 'Offers for Today' && !isActive ? 'translateY(-1px)' : 'none'
                                    }
                                }}
                            >
                            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <Box sx={{ 
                                        fontWeight: isActive ? 800 : 700, 
                                        letterSpacing: '-0.01em',
                                        fontSize: '0.9rem',
                                        lineHeight: 1.2
                                    }}>
                                        {cat.title}
                                    </Box>
                                    {cat.count > 0 && (
                                        <Box sx={{ 
                                            bgcolor: isActive ? 'rgba(255,255,255,0.2)' : `${catColor}20`, 
                                            color: isActive ? '#ffffff' : catColor,
                                            px: 0.8, py: 0.2, borderRadius: 1, fontSize: '0.7rem', ml: 1.5
                                        }}>
                                            {cat.count}
                                        </Box>
                                    )}
                                </Box>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-category-highlight"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        style={{
                                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                            borderRadius: '999px', backgroundColor: catColor,
                                            zIndex: -1, 
                                            boxShadow: `0 4px 12px ${catColor}50, inset 0 -2px 4px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.2)`
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
            </Box>
            </Box>

            {/* Expanding SearchBar below categories */}
            <AnimatePresence>
                {searchOpen && (
                    <Box
                        component={motion.div}
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        sx={{ width: '100%', maxWidth: '800px', mx: 'auto', px: 2, overflow: 'hidden' }}
                    >
                        <Box sx={{ mt: 2 }}>
                            <SearchBar value={searchQuery} onChange={setSearchQuery} themeColor={themeColor} />
                        </Box>
                    </Box>
                )}
            </AnimatePresence>

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
