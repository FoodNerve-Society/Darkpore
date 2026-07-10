'use client';

import React, { useState, useEffect, forwardRef, FC } from 'react';
import { Tooltip, InputAdornment, Typography, Fade, TextFieldProps } from '@mui/material';
import PremiumTextField from './PremiumTextField';

// Helper: 1000000 -> "1 Million"
const formatPlaceValue = (num: number): string => {
    if (num < 1000) return "";
    if (num < 1000000) return `${(num / 1000).toLocaleString()} Thousand`;
    if (num < 1000000000) return `${(num / 1000000).toLocaleString()} Million`;
    return `${(num / 1000000000).toLocaleString()} Billion`;
};

interface PremiumPriceInputProps extends Omit<TextFieldProps, 'onChange'> {
    value: number | string | undefined;
    onChange: (event: { target: { value: string } }) => void;
    placeholder?: string;
    label?: string;
    helperText?: string;
    colorTheme: string;
    errorHelperText?: string | null;
    currencySymbol?: string; // Optional: To support different currencies
}

const PremiumPriceInput: FC<PremiumPriceInputProps> = forwardRef<HTMLDivElement, PremiumPriceInputProps>(
    ({ value, onChange, placeholder, label, helperText, colorTheme, errorHelperText, currencySymbol = "₦", ...props }, ref) => {
        const [displayValue, setDisplayValue] = useState('');
        const [tooltipOpen, setTooltipOpen] = useState(false);
        const [tooltipText, setTooltipText] = useState('');

        useEffect(() => {
            // Sync display value with prop, formatting with commas
            // Guard: Only sync if NOT focused (using tooltipOpen as focus proxy) to prevent cursor jumps
            if (!tooltipOpen) {
                if (value === undefined || value === '') {
                    setDisplayValue('');
                } else {
                    const num = Number(String(value).replace(/,/g, ''));
                    if (!isNaN(num)) {
                        setDisplayValue(num.toLocaleString());
                    } else {
                        setDisplayValue(String(value));
                    }
                }
            }
        }, [value, tooltipOpen]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value.replace(/,/g, '');
            if (raw === '' || /^\d+$/.test(raw)) {
                // Optimistic update
                setDisplayValue(e.target.value); // Keep user's input as-is while typing
                // Update parent with raw number
                onChange({ target: { value: raw } });
            }
        };

        const handleFocus = () => {
            setTooltipOpen(true);
            updateTooltip(displayValue);
        };

        const handleBlur = () => {
            setTooltipOpen(false);
        };

        const updateTooltip = (val: string) => {
            const num = Number(val.replace(/,/g, ''));
            if (!isNaN(num) && num > 0) {
                setTooltipText(formatPlaceValue(num));
            } else {
                setTooltipText('');
            }
        };

        // Update tooltip when value changes while focused
        useEffect(() => {
            if (tooltipOpen) {
                updateTooltip(displayValue);
            }
        }, [displayValue, tooltipOpen]);

        return (
            <Tooltip
                title={tooltipText || "Enter Amount"}
                open={tooltipOpen && !!tooltipText}
                arrow
                placement="top"
                TransitionComponent={Fade}
                componentsProps={{
                    tooltip: {
                        sx: {
                            bgcolor: colorTheme, // Match the liquid glass theme
                            color: '#fff',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            py: 1, px: 2,
                            borderRadius: '12px',
                            boxShadow: `0 8px 24px ${colorTheme}40` // Dynamic shadow
                        }
                    },
                    arrow: { sx: { color: colorTheme } }
                }}
            >
                <div>
                    <PremiumTextField
                        {...props as any}
                        ref={ref}
                        fullWidth
                        label={label}
                        placeholder={placeholder}
                        value={displayValue}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        colorTheme={colorTheme}
                        errorHelperText={errorHelperText}
                        helperText={helperText}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Typography sx={{ fontWeight: 800, color: colorTheme }}>{currencySymbol}</Typography>
                                </InputAdornment>
                            ),
                            ...props.InputProps as any
                        }}
                    />
                </div>
            </Tooltip>
        );
    }
);

PremiumPriceInput.displayName = 'PremiumPriceInput';

export default PremiumPriceInput;
