'use client';

import React, { FC, forwardRef } from 'react';
import { TextField, alpha, TextFieldProps, Stack, Alert } from '@mui/material';
import { Cancel } from '@mui/icons-material';

// Define our custom props that this component will accept
interface CustomProps {
    colorTheme: string;
    // --- NEW: A prop specifically for displaying a premium alert ---
    errorHelperText?: string | null;
}

// Combine our custom props with all standard TextFieldProps
type PremiumTextFieldProps = TextFieldProps & CustomProps;

// Use forwardRef to ensure the component can be used by libraries like MUI's Autocomplete
const PremiumTextField: FC<PremiumTextFieldProps> = forwardRef<HTMLDivElement, PremiumTextFieldProps>(
    ({ colorTheme, errorHelperText, ...props }, ref) => {
        const hasError = !!errorHelperText;

        return (
            <Stack spacing={1} sx={{ width: props.fullWidth ? '100%' : 'auto' }}>
                <TextField
                    variant="filled" // We use 'filled' as a base to easily override styles
                    fullWidth={props.fullWidth}
                    error={hasError}
                    {...props}
                    helperText={!errorHelperText ? props.helperText : undefined}
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
                            '&::before, &::after': { display: 'none' },
                            '&:hover': { bgcolor: alpha('#000', 0.04) },
                            '&:hover:not(.Mui-disabled, .Mui-error):before': { borderBottom: 'none' },
                            // The definitive "Lit" Focus State
                            '&.Mui-focused': {
                                bgcolor: alpha(colorTheme, 0.03), // heavily toned down focus bg
                                boxShadow: `
                                    inset 0 2px 4px rgba(0,0,0,0.03),
                                    0 0 0 2px ${alpha(colorTheme, 0.5)}
                                `,
                            },

                            // The definitive error state style
                            '&.Mui-error': {
                                bgcolor: (theme) => alpha(theme.palette.error.main, 0.02),
                                boxShadow: (theme) => `
                                    inset 0 2px 4px rgba(0,0,0,0.03),
                                    0 0 0 2px ${theme.palette.error.main}
                                `,
                            }
                        },
                        '& .MuiFormHelperText-root.Mui-error': {
                            display: 'none',
                        },
                        ...props.sx
                    }}
                    // @ts-expect-error InputProps typing conflict with TextField in newer MUI
                    InputProps={{
                        ...(props as any).InputProps,
                        inputRef: ref,
                        disableUnderline: true,
                        sx: {
                            ...(props as any).InputProps?.sx,
                        }
                    }}
                />
                {hasError && (
                    <Alert
                        severity="error"
                        icon={<Cancel fontSize="small" />}
                        sx={{ bgcolor: (theme) => alpha(theme.palette.error.main, 0.1), borderRadius: 2 }}
                    >
                        {errorHelperText}
                    </Alert>
                )}
            </Stack>
        );
    }
);

PremiumTextField.displayName = 'PremiumTextField'; // Important for debugging

export default PremiumTextField;
