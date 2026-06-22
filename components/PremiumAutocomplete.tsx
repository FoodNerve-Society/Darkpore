'use client';

import React from 'react';
import { Autocomplete, AutocompleteProps, TextField, alpha } from '@mui/material';

// --- PROPS DEFINITION ---
interface CustomProps {
    colorTheme: string;
    label?: string;
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

    const { colorTheme, label, ...rest } = props;

    return (
        <Autocomplete
            {...rest}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
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
                paper: {
                    elevation: 0,
                    sx: {
                        borderRadius: 4,
                        marginTop: 1,
                        border: `1px solid ${alpha(colorTheme, 0.15)}`,
                        boxShadow: `0 16px 48px -12px ${alpha(colorTheme, 0.25)}`,
                        bgcolor: 'background.paper',
                        overflow: 'hidden',
                        backdropFilter: 'blur(10px)',
                    }
                },
                listbox: {
                    sx: {
                        padding: 1,
                        '& .MuiAutocomplete-option': {
                            borderRadius: 2,
                            px: 2,
                            py: 1.5,
                            mb: 0.5,
                            transition: 'background-color 0.2s ease, transform 0.2s ease',
                            '&:active': {
                                transform: 'scale(0.98)'
                            },
                            '&[aria-selected="true"]': {
                                bgcolor: alpha(colorTheme, 0.12),
                                color: colorTheme,
                                fontWeight: 600,
                                '&.Mui-focused': {
                                    bgcolor: alpha(colorTheme, 0.18),
                                },
                            },
                            '&.Mui-focused': {
                                bgcolor: alpha(colorTheme, 0.06),
                            },
                        }
                    }
                }
            }}
            sx={{
                ...props.sx
            }}
        />
    );
}

export default PremiumAutocomplete;
