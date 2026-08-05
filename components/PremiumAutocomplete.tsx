'use client';

import React from 'react';
import { Autocomplete, AutocompleteProps, TextField, alpha } from '@mui/material';

// --- PROPS DEFINITION ---
interface CustomProps {
    colorTheme: string;
    label?: string;
    placeholder?: string;
}

type PremiumAutocompleteProps<
    T,
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false,
    FreeSolo extends boolean | undefined = false
> = Omit<AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>, 'renderInput'> & CustomProps;

// --- COMPONENT IMPLEMENTATION ---
function PremiumAutocomplete<
    T,
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false,
    FreeSolo extends boolean | undefined = false
>(props: PremiumAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>) {

    const { colorTheme, label, placeholder, ...rest } = props;

    return (
        <Autocomplete
            forcePopupIcon
            {...rest}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    variant="filled"
                    sx={{
                        // 1) Unfocused label
                        '& label': {
                            color: alpha(colorTheme, 0.8),
                            fontWeight: 400,
                        },
                        // 2) Focused label
                        '& label.Mui-focused': {
                            color: colorTheme,
                            fontWeight: 600,
                        },
                        // 3) Color the actual typed text
                        '& .MuiInputBase-input': {
                            color: colorTheme,
                            fontWeight: 500, // Reduced from 700
                        },
                        '& .MuiFilledInput-root': {
                            borderRadius: 3,
                            transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                            bgcolor: alpha('#000', 0.02), // toned down bg
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)',
                            '&::before, &::after': { display: 'none' }, // Kill the MUI underline permanently
                            '&:hover': { bgcolor: alpha('#000', 0.04) },
                            '&:hover:not(.Mui-disabled, .Mui-error):before': { borderBottom: 'none' },
                            '&.Mui-focused': {
                                bgcolor: alpha(colorTheme, 0.03), // heavily toned down focus bg
                                boxShadow: `
                                    inset 0 2px 4px rgba(0,0,0,0.03),
                                    0 0 0 2px ${alpha(colorTheme, 0.5)}
                                `,
                            },
                            '&.Mui-error': {
                                boxShadow: (theme) => `
                                    inset 0 2px 4px rgba(0,0,0,0.03),
                                    0 0 0 2px ${theme.palette.error.main}
                                `,
                            }
                        }
                    }}
                    // @ts-expect-error InputProps typing conflict with Autocomplete in newer MUI
                    InputProps={{
                        ...(params as any).InputProps,
                        disableUnderline: true,
                        sx: {
                            ...(params as any).InputProps?.sx,
                        }
                    }}
                />
            )}
            slotProps={{
                popper: {
                    sx: {
                        zIndex: 10000,
                    }
                },
                paper: {
                    elevation: 0,
                    sx: {
                        borderRadius: '18px',
                        marginTop: '8px',
                        border: `1px solid rgba(255, 255, 255, 0.5)`,
                        boxShadow: `0 24px 64px -12px ${alpha(colorTheme, 0.3)}, 0 0 0 1px ${alpha(colorTheme, 0.05)}`,
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)',
                        backdropFilter: 'blur(24px)',
                        overflow: 'hidden',
                    }
                },
                listbox: {
                    sx: {
                        padding: '12px',
                        maxHeight: '40vh',
                        // Custom Webkit Scrollbar
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'transparent',
                            margin: '8px 0',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: alpha(colorTheme, 0.2),
                            borderRadius: '10px',
                            '&:hover': {
                                background: alpha(colorTheme, 0.4),
                            }
                        },
                        '& .MuiAutocomplete-option': {
                            borderRadius: '14px',
                            px: 2.5,
                            py: 1.5,
                            mb: '8px',
                            fontFamily: 'inherit',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            color: '#334155',
                            letterSpacing: '-0.01em',
                            border: '1px solid rgba(255, 255, 255, 0.6)',
                            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 100%)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:active': {
                                transform: 'scale(0.97)'
                            },
                            '&[aria-selected="true"]': {
                                background: `linear-gradient(135deg, ${colorTheme} 0%, ${alpha(colorTheme, 0.8)} 100%)`,
                                color: '#ffffff',
                                fontWeight: 700,
                                border: `1px solid ${alpha(colorTheme, 0.5)}`,
                                boxShadow: `0 8px 24px ${alpha(colorTheme, 0.4)}`,
                                '&.Mui-focused': {
                                    background: `linear-gradient(135deg, ${colorTheme} 0%, ${alpha(colorTheme, 0.9)} 100%)`,
                                    boxShadow: `0 12px 32px ${alpha(colorTheme, 0.5)}`,
                                },
                            },
                            '&.Mui-focused:not([aria-selected="true"])': {
                                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)',
                                color: '#0f172a',
                                borderColor: 'rgba(255, 255, 255, 0.9)',
                                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)',
                                transform: 'translateY(-2px)',
                            },
                        }
                    }
                }
            }}
            sx={{
                '& .MuiAutocomplete-popupIndicator, & .MuiAutocomplete-clearIndicator': {
                    color: alpha(colorTheme, 0.7),
                    '&:hover': {
                        color: colorTheme,
                        bgcolor: alpha(colorTheme, 0.1),
                    }
                },
                ...props.sx
            }}
        />
    );
}

export default PremiumAutocomplete;
