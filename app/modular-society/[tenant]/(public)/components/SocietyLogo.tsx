"use client";

import React from 'react';
import { Box, Typography } from '@mui/material';
import Link from 'next/link';

interface SocietyLogoProps {
    variant?: 'dark' | 'light';
}

export default function SocietyLogo({ variant = 'dark' }: SocietyLogoProps) {
    const isLight = variant === 'light';
    const bgColor = isLight ? 'white' : '#0f2414';
    const mainTextColor = isLight ? '#0f2414' : 'white';
    
    return (
        <Link href="/" style={{ textDecoration: 'none' }}>
            <Box
                sx={{
                    bgcolor: bgColor,
                    px: 1.5, // Reduced horizontal padding to make it thinner
                    pt: 5, // Top empty space (approx 30%)
                    pb: 1.5,
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start', // Bottom left alignment
                    justifyContent: 'flex-end',
                    cursor: 'pointer',
                    boxShadow: '0 8px 25px rgba(15, 36, 20, 0.15)',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)'
                    }
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontFamily: 'var(--font-dosis)',
                        fontWeight: 900,
                        fontSize: '1rem', // Reduced font size
                        color: mainTextColor,
                        lineHeight: 1,
                        letterSpacing: '-0.02em',
                        textAlign: 'left', // Align text to left
                    }}
                >
                    FOOD
                    <br />
                    NERVE
                </Typography>
                <Typography
                    variant="overline"
                    sx={{
                        fontFamily: 'var(--font-dosis)',
                        fontWeight: 800,
                        fontSize: '0.55rem', // Reduced font size
                        color: '#d97706', // Society is gold
                        letterSpacing: '2px',
                        lineHeight: 1,
                        mt: 1,
                        textAlign: 'left', // Align text to left
                    }}
                >
                    SOCIETY
                </Typography>
            </Box>
        </Link>
    );
}
