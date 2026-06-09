'use client';

import React, { FC, useState } from 'react';
import { Box, Paper, InputBase, IconButton, CircularProgress, alpha, useTheme, FormHelperText } from '@mui/material';
import { Search } from '@mui/icons-material';

interface PremiumSearchFieldProps {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyPress?: (event: React.KeyboardEvent) => void;
    onSearch: () => void;
    isLoading?: boolean;
    label: string;
    error?: boolean;
    helperText?: string;
    colorTheme: string;
}

const PremiumSearchField: FC<PremiumSearchFieldProps> = ({
    value, onChange, onKeyPress, onSearch, isLoading, label, error, helperText, colorTheme
}) => {
    const theme = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    return (
        <Box>
            <Paper
                elevation={0}
                sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    height: 56,
                    borderRadius: 3,
                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                    bgcolor: alpha('#000', 0.05),
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.08)',
                    ...(isFocused && {
                        bgcolor: alpha(colorTheme, 0.1),
                        boxShadow: `inset 0 2px 4px rgba(0,0,0,0.08), 0 0 0 2px ${alpha(colorTheme, 0.5)}`,
                    }),
                    ...(error && {
                        boxShadow: `inset 0 2px 4px rgba(0,0,0,0.08), 0 0 0 2px ${theme.palette.error.main}`,
                    }),
                }}
            >
                <InputBase
                    sx={{ ml: 2, flex: 1 }}
                    placeholder={label}
                    value={value}
                    onChange={onChange}
                    onKeyPress={onKeyPress}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    inputProps={{
                        sx: { textTransform: 'uppercase' }
                    }}
                />
                <IconButton
                    onClick={onSearch}
                    disabled={isLoading}
                    sx={{
                        p: '10px',
                        bgcolor: colorTheme, // Use colorTheme instead of hardcoded primary
                        color: 'white', // High contrast text
                        borderRadius: 2.5,
                        '&:hover': {
                            bgcolor: alpha(colorTheme, 0.8),
                        }
                    }}
                >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : <Search />}
                </IconButton>
            </Paper>
            {error && helperText && (
                <FormHelperText error={error} sx={{ ml: 1, mt: 0.5 }}>
                    {helperText}
                </FormHelperText>
            )}
        </Box>
    );
};

export default PremiumSearchField;
