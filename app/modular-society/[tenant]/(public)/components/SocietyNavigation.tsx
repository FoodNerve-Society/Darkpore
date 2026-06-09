"use client";

import { useState, useEffect } from 'react';
import { AppBar, Toolbar, Container, Box, Typography, Button, useTheme } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SocietyLogo from './SocietyLogo';

export default function SocietyNavigation() {
    const theme = useTheme();
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                top: scrolled ? 16 : 0,
                left: 0,
                right: 0,
                width: scrolled ? 'calc(100% - 32px)' : '100%',
                maxWidth: scrolled ? '1200px' : 'none',
                mx: 'auto',
                borderRadius: scrolled ? 100 : 0, // M3 fully rounded floating pill
                background: scrolled ? 'rgba(49, 14, 58, 0.95)' : 'rgba(49, 14, 58, 0.4)', // Deep Plum
                backdropFilter: 'blur(24px)',
                boxShadow: scrolled ? '0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)' : '0 10px 30px rgba(0,0,0,0.2)',
                border: scrolled ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'all 0.4s cubic-bezier(0.2, 0, 0, 1)',
                zIndex: 1100,
                px: scrolled ? 1 : 0,
            }}
        >
            <Container maxWidth="xl" sx={{ position: 'relative' }}>
                <Toolbar disableGutters sx={{ minHeight: { xs: 50, md: 60 } }}>
                    {/* The Logo "Badge" - Absolutely positioned to bulge down */}
                    <Box 
                        sx={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: { xs: 0, md: 24 },
                            zIndex: 1200 
                        }} 
                        onClick={() => router.push('/')}
                    >
                        <SocietyLogo />
                    </Box>

                    {/* Spacer to push nav links to the right */}
                    <Box sx={{ flexGrow: 1 }} />

                    {/* Navigation Links & CTA */}
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', pr: scrolled ? 1 : 0, transition: 'padding 0.3s' }}>
                        <Link href="/explore" passHref style={{ textDecoration: 'none' }}>
                            <Button sx={{ 
                                color: scrolled ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.7)', 
                                fontWeight: 700, fontSize: '0.9rem', 
                                textTransform: 'none', borderRadius: 100, px: 2, py: 0.8,
                                transition: 'all 0.2s', display: { xs: 'none', sm: 'block' },
                                '&:hover': { 
                                    color: scrolled ? 'white' : '#1b5e20', 
                                    bgcolor: scrolled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(27, 94, 32, 0.08)' 
                                } 
                            }}>
                                Explore
                            </Button>
                        </Link>
                        <Link href="/about" passHref style={{ textDecoration: 'none' }}>
                            <Button sx={{ 
                                color: scrolled ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.7)', 
                                fontWeight: 700, fontSize: '0.9rem', 
                                textTransform: 'none', borderRadius: 100, px: 2, py: 0.8,
                                transition: 'all 0.2s', display: { xs: 'none', sm: 'block' },
                                '&:hover': { 
                                    color: scrolled ? 'white' : '#1b5e20', 
                                    bgcolor: scrolled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(27, 94, 32, 0.08)' 
                                } 
                            }}>
                                Our Story
                            </Button>
                        </Link>
                        <Link href="/join" passHref style={{ textDecoration: 'none' }}>
                            <Button
                                variant="contained"
                                size="small"
                                sx={{
                                    bgcolor: '#d97706',
                                    color: 'white',
                                    borderRadius: 100, // M3 Expressive Fully rounded
                                    px: 3.5,
                                    py: 1,
                                    fontWeight: 800,
                                    fontSize: '0.85rem',
                                    textTransform: 'none',
                                    boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)',
                                    transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
                                    '&:hover': { bgcolor: '#b45309', transform: 'scale(1.02)' },
                                }}
                            >
                                Join
                            </Button>
                        </Link>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
