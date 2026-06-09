"use client";

import React, { FC, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowForward } from '@mui/icons-material';

interface Role {
    id: string;
    icon: ReactNode;
    title: string;
    mantra: string;
    color: string;
    imageUrl: string;
    description: string;
}

interface RoleCardProps {
    role: Role;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onExplore: (id: string) => void;
    isDesktop: boolean;
}

const RoleCard: FC<RoleCardProps> = ({ role, isSelected, onSelect, onExplore, isDesktop }) => {
    return (
        <motion.div
            layout
            transition={{ layout: { type: "spring", stiffness: 200, damping: 30 } }}
            onClick={() => onSelect(role.id)}
            style={{
                flexGrow: isSelected ? 5 : 1,
                flexBasis: 'auto',
                position: 'relative',
                cursor: 'pointer',
                perspective: '1000px',
                minHeight: isDesktop ? 340 : 120,
                borderRadius: '24px',
            }}
        >
            <motion.div
                animate={{ rotateY: isSelected ? 0 : -5, scale: isSelected ? 1 : 1.05 }}
                whileHover={!isSelected ? { scale: 1.07, rotateY: -10, rotateX: 5 } : {}}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    borderRadius: '24px',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        background: '#181E25',
                        zIndex: 1,
                    }}
                >
                    <Box
                        component="img"
                        src={role.imageUrl}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: isSelected ? 0.2 : 0.1,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        position: 'relative',
                        zIndex: 2,
                        p: isSelected ? 3 : 2,
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                    }}
                >
                    {isSelected ? (
                        <Box sx={{ textAlign: 'center', width: '100%' }}>
                            <Typography variant={isDesktop ? "h3" : "h4"} sx={{ fontWeight: 700, color: 'white' }}>{role.title}</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 500, color: role.color, mt: 1 }}>{role.mantra}</Typography>
                            <Typography sx={{ maxWidth: '45ch', mx: 'auto', my: 2, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{role.description}</Typography>
                            <Button
                                variant="contained" endIcon={<ArrowForward />}
                                onClick={(e) => { e.stopPropagation(); onExplore(role.id); }}
                                sx={{
                                    bgcolor: role.color, color: 'white', borderRadius: '50px',
                                    textTransform: 'none', fontWeight: 600, px: 4, py: 1.5,
                                    '&:hover': { bgcolor: role.color, filter: 'brightness(1.1)' }
                                }}
                            >
                                Explore Journey
                            </Button>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                                justifyContent: isDesktop ? 'center' : 'flex-start',
                                flexDirection: isDesktop ? 'column' : 'row',
                                gap: 2,
                            }}
                        >
                            {role.icon}
                            <Typography sx={{
                                fontWeight: 600, color: 'rgba(255,255,255,0.9)',
                                ...(isDesktop && { writingMode: 'vertical-rl', textOrientation: 'mixed' })
                            }}>
                                {role.title}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </motion.div>
        </motion.div>
    );
};

export default RoleCard;
