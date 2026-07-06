'use client';

import React from 'react';
import { Paper, InputBase, IconButton, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    themeColor: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, themeColor }) => {
    return (
        <Box sx={{ position: 'sticky', top: 20, zIndex: 100, mb: 4 }}>
            <Paper
                elevation={3}
                sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    borderRadius: '50px',
                    bgcolor: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:focus-within': {
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        borderColor: themeColor,
                        boxShadow: `0 0 20px ${themeColor}20`,
                        transform: 'scale(1.01)'
                    }
                }}
            >
                <IconButton sx={{ p: '10px', color: themeColor }} aria-label="search">
                    <SearchIcon />
                </IconButton>
                <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder="Search ecosystem"
                    inputProps={{ 'aria-label': 'search ecosystem' }}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </Paper>
        </Box>
    );
};
