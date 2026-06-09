"use client";

import React, { FC, ReactNode } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

interface Role {
    id: string;
    icon: ReactNode;
    title: string;
    mantra: string;
    color: string;
    imageUrl: string;
    description: string;
}

const roles: Role[] = [
    { id: 'student', icon: <div />, title: 'Students', mantra: 'Learn. Build. Earn.', color: '#47B5A2', imageUrl: '', description: '' },
    { id: 'teacher', icon: <div />, title: 'Teachers', mantra: 'Empowerment. Engagement. Ease.', color: '#42A5F5', imageUrl: '', description: '' },
    { id: 'parent', icon: <div />, title: 'Parents', mantra: 'Future-Ready Skills.', color: '#FFA726', imageUrl: '', description: '' },
    { id: 'school_leader', icon: <div />, title: 'School Leaders', mantra: 'Innovation. Revenue. Reputation.', color: '#7E57C2', imageUrl: '', description: '' },
];

interface DotNavigatorProps {
    isDesktop: boolean;
    selectedRole: string | null;
    onSelect: (id: string) => void;
}

const DotNavigator: FC<DotNavigatorProps> = ({ isDesktop, selectedRole, onSelect }) => (
    <Box sx={{
        display: 'flex',
        flexDirection: isDesktop ? 'column' : 'row',
        gap: 2,
        p: 2,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    }}>
        {roles.map(role => (
            <Box
                key={role.id}
                onClick={() => onSelect(role.id)}
                sx={{
                    cursor: 'pointer',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.3s ease',
                    '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.5)',
                    }
                }}
            >
                {selectedRole === role.id && (
                    <motion.div
                        layoutId="active-dot"
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            border: `2px solid ${role.color}`,
                            position: 'absolute'
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                )}
            </Box>
        ))}
    </Box>
);

export default DotNavigator;
