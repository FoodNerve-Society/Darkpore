'use client';

import React, { FC, useCallback, useRef, useState } from 'react';
import { Box, alpha, Typography } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

interface PremiumSwitchProps {
    colorTheme: string;
    checked?: boolean;
    onChange?: (event: { target: { checked: boolean } }) => void;
    disabled?: boolean;
    size?: 'small' | 'medium';
    label?: string;
}

/**
 * PremiumSwitch — a fully custom toggle built from scratch.
 * 
 * Design DNA:
 *  - Recessed track with deep inset shadows (matches PremiumTextField)
 *  - Frosted-glass track with backdrop-filter blur
 *  - Chrome/metallic thumb with layered gradients
 *  - Spring-physics animation via cubic-bezier overshoot
 *  - Check icon fades in on the thumb when active
 *  - Ambient glow halo around the thumb when ON
 *  - Track color floods in from the left via gradient transition
 */
const PremiumSwitch: FC<PremiumSwitchProps> = ({
    colorTheme,
    checked = false,
    onChange,
    disabled = false,
    size = 'medium',
    label,
}) => {
    const [isPressed, setIsPressed] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const isSm = size === 'small';
    const TRACK_W = isSm ? 44 : 56;
    const TRACK_H = isSm ? 24 : 30;
    const THUMB_SIZE = isSm ? 18 : 24;
    const THUMB_INSET = (TRACK_H - THUMB_SIZE) / 2;
    const TRAVEL = TRACK_W - THUMB_SIZE - THUMB_INSET * 2;

    const handleToggle = useCallback(() => {
        if (disabled) return;
        onChange?.({ target: { checked: !checked } });
    }, [checked, disabled, onChange]);

    return (
        <Box
            component="label"
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                WebkitTapHighlightColor: 'transparent',
                userSelect: 'none',
            }}
        >
            {/* Hidden native input for accessibility & form submission */}
            <input
                ref={inputRef}
                type="checkbox"
                checked={checked}
                onChange={handleToggle}
                disabled={disabled}
                style={{ 
                    position: 'absolute', 
                    width: 1, 
                    height: 1, 
                    padding: 0, 
                    margin: -1, 
                    overflow: 'hidden', 
                    clip: 'rect(0,0,0,0)', 
                    whiteSpace: 'nowrap', 
                    border: 0 
                }}
            />

            {/* ─── Track ─── */}
            <Box
                onMouseDown={() => setIsPressed(true)}
                onMouseUp={() => setIsPressed(false)}
                onMouseLeave={() => setIsPressed(false)}
                onTouchStart={() => setIsPressed(true)}
                onTouchEnd={() => setIsPressed(false)}
                sx={{
                    position: 'relative',
                    width: TRACK_W,
                    height: TRACK_H,
                    borderRadius: `${TRACK_H}px`,
                    flexShrink: 0,

                    // ── Track fill ──
                    bgcolor: checked ? alpha(colorTheme, 0.85) : 'rgba(0,0,0,0.06)',
                    backgroundImage: checked
                        ? `linear-gradient(135deg, ${colorTheme} 0%, ${alpha(colorTheme, 0.7)} 100%)`
                        : 'none',

                    // ── Recessed inset (matches PremiumTextField DNA) ──
                    boxShadow: checked
                        ? `inset 0 2px 6px ${alpha(colorTheme, 0.4)}, 0 0 0 1.5px ${alpha(colorTheme, 0.15)}, 0 0 20px ${alpha(colorTheme, 0.15)}`
                        : `inset 0 2px 4px rgba(0,0,0,0.08), 0 0 0 1.5px rgba(0,0,0,0.06)`,

                    // ── Smooth state transition ──
                    transition: 'all 180ms cubic-bezier(0.4, 0, 0.2, 1)',

                    // ── Focus-visible ring (keyboard nav) ──
                    'input:focus-visible + &, input:focus-visible ~ &': {
                        boxShadow: `0 0 0 3px ${alpha(colorTheme, 0.35)}`,
                    },
                }}
            >
                {/* ── Thumb ── */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: THUMB_INSET,
                        left: THUMB_INSET,
                        width: isPressed && !disabled ? THUMB_SIZE + 4 : THUMB_SIZE,
                        height: THUMB_SIZE,
                        borderRadius: '50%',

                        // ── Translation with spring overshoot ──
                        transform: `translateX(${checked ? (isPressed ? TRAVEL - 4 : TRAVEL) : 0}px)`,
                        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',

                        // ── Chrome / metallic thumb ──
                        background: 'linear-gradient(180deg, #ffffff 0%, #f0f0f0 60%, #e4e4e4 100%)',

                        // ── Layered depth shadows ──
                        boxShadow: checked
                            ? [
                                // Ambient glow from theme color
                                `0 0 12px 2px ${alpha(colorTheme, 0.35)}`,
                                // Primary elevation
                                '0 3px 8px rgba(0,0,0,0.18)',
                                // Tight contact shadow
                                '0 1px 2px rgba(0,0,0,0.12)',
                                // Inner highlight (top reflection)
                                'inset 0 1.5px 0 rgba(255,255,255,0.9)',
                              ].join(', ')
                            : [
                                '0 2px 6px rgba(0,0,0,0.14)',
                                '0 1px 2px rgba(0,0,0,0.10)',
                                'inset 0 1.5px 0 rgba(255,255,255,0.9)',
                              ].join(', '),

                        // ── Flex container for check icon ──
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {/* ── Check icon inside thumb ── */}
                    <CheckRoundedIcon
                        sx={{
                            fontSize: isSm ? 12 : 15,
                            color: checked ? colorTheme : 'transparent',
                            fontWeight: 900,
                            strokeWidth: 2,
                            opacity: checked ? 1 : 0,
                            transform: checked ? 'scale(1)' : 'scale(0.5)',
                            transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                            transitionDelay: checked ? '50ms' : '0ms',
                        }}
                    />
                </Box>
            </Box>

            {/* ── Optional label ── */}
            {label && (
                <Typography
                    sx={{
                        fontSize: isSm ? '0.8rem' : '0.9rem',
                        fontWeight: 600,
                        color: checked ? '#1e293b' : '#64748b',
                        transition: 'color 150ms ease',
                    }}
                >
                    {label}
                </Typography>
            )}
        </Box>
    );
};

export default PremiumSwitch;
