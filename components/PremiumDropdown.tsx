'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, Popover, Chip, alpha } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';

export interface PremiumDropdownOption<T = any> {
  id: string | number;
  label: string;
  secondaryLabel?: string;
  tag?: string;
  icon?: React.ReactNode;
  emoji?: string;
  color?: string;
  data?: T;
}

export interface PremiumDropdownProps<T = any> {
  options: (PremiumDropdownOption<T> | T)[];
  value: PremiumDropdownOption<T> | T | null;
  onChange: (option: any) => void;
  label?: string;
  prefix?: string;
  popoverTitle?: string;
  popoverSubtitle?: string;
  colorTheme?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  maxHeight?: number | string;
  popoverWidth?: number | string;
  getOptionLabel?: (opt: any) => string;
  getOptionId?: (opt: any) => string | number;
  getOptionSecondary?: (opt: any) => string | undefined;
  getOptionTag?: (opt: any) => string | undefined;
  getOptionEmoji?: (opt: any) => string | undefined;
  renderOption?: (opt: any, isSelected: boolean) => React.ReactNode;
}

export function PremiumDropdown<T = any>({
  options = [],
  value,
  onChange,
  label = 'Select option...',
  prefix,
  popoverTitle,
  popoverSubtitle,
  colorTheme = '#f59e0b',
  disabled = false,
  fullWidth = false,
  maxHeight = 360,
  popoverWidth = 380,
  getOptionLabel,
  getOptionId,
  getOptionSecondary,
  getOptionTag,
  getOptionEmoji,
  renderOption,
}: PremiumDropdownProps<T>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isOpen = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (option: any) => {
    onChange(option);
    handleClose();
  };

  // Helper extraction routines
  const resolveId = (opt: any): string | number => {
    if (!opt) return '';
    if (getOptionId) return getOptionId(opt);
    return opt.id ?? opt.value ?? JSON.stringify(opt);
  };

  const resolveLabel = (opt: any): string => {
    if (!opt) return '';
    if (getOptionLabel) return getOptionLabel(opt);
    return opt.label ?? opt.name ?? opt.title ?? String(opt);
  };

  const resolveSecondary = (opt: any): string | undefined => {
    if (!opt) return undefined;
    if (getOptionSecondary) return getOptionSecondary(opt);
    return opt.secondaryLabel ?? opt.desc ?? opt.description ?? opt.title;
  };

  const resolveTag = (opt: any): string | undefined => {
    if (!opt) return undefined;
    if (getOptionTag) return getOptionTag(opt);
    return opt.tag;
  };

  const resolveEmoji = (opt: any): string | undefined => {
    if (!opt) return undefined;
    if (getOptionEmoji) return getOptionEmoji(opt);
    return opt.emoji;
  };

  const selectedId = value ? resolveId(value) : null;
  const currentDisplayLabel = value ? resolveLabel(value) : label;
  const currentDisplayEmoji = value ? resolveEmoji(value) : undefined;

  return (
    <>
      {/* ═══ INTERACTIVE PILL TRIGGER BUTTON ═══ */}
      <Button
        onClick={handleOpen}
        disabled={disabled}
        endIcon={
          <KeyboardArrowDownIcon
            sx={{
              fontSize: '18px !important',
              transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: isOpen ? 'rotate(180deg)' : 'none',
              color: isOpen ? colorTheme : 'inherit',
            }}
          />
        }
        sx={{
          width: fullWidth ? '100%' : 'auto',
          justifyContent: fullWidth ? 'space-between' : 'center',
          bgcolor: isOpen ? alpha(colorTheme, 0.16) : alpha(colorTheme, 0.08),
          color: colorTheme,
          fontWeight: 900,
          fontSize: '0.86rem',
          px: 2,
          py: 0.8,
          borderRadius: '14px',
          border: `1.5px solid ${isOpen ? colorTheme : alpha(colorTheme, 0.3)}`,
          textTransform: 'none',
          boxShadow: isOpen
            ? `0 4px 16px ${alpha(colorTheme, 0.2)}`
            : `0 2px 8px ${alpha(colorTheme, 0.08)}`,
          transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            bgcolor: alpha(colorTheme, 0.16),
            borderColor: colorTheme,
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 14px ${alpha(colorTheme, 0.2)}`,
          },
          '&.Mui-disabled': {
            bgcolor: 'rgba(0,0,0,0.04)',
            color: '#94a3b8',
            borderColor: 'rgba(0,0,0,0.08)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85, minWidth: 0, flex: fullWidth ? 1 : 'none', mr: fullWidth ? 1.5 : 0 }}>
          {prefix && (
            <Typography
              component="span"
              sx={{
                fontWeight: 800,
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: alpha(colorTheme, 0.8),
                mr: 0.25,
                flexShrink: 0,
              }}
            >
              {prefix}
            </Typography>
          )}
          {currentDisplayEmoji && (
            <span style={{ fontSize: '0.95rem', lineHeight: 1, flexShrink: 0 }}>{currentDisplayEmoji}</span>
          )}
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: '0.86rem',
              color: colorTheme,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: fullWidth ? '100%' : { xs: 230, sm: 380 },
              textAlign: 'left',
            }}
          >
            {currentDisplayLabel}
          </Typography>
        </Box>
      </Button>

      {/* ═══ FLOATING GLASSY POPOVER MENU ═══ */}
      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          backdrop: {
            sx: {
              bgcolor: 'transparent',
              backdropFilter: 'none',
            },
          },
          paper: {
            elevation: 0,
            sx: {
              mt: 1.25,
              p: 1.25,
              borderRadius: '22px',
              width: { xs: 'calc(100vw - 32px)', sm: popoverWidth },
              maxWidth: { xs: 'calc(100vw - 32px)', sm: 460 },
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(28px)',
              border: '1.5px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 20px 48px -8px rgba(0, 0, 0, 0.18), 0 8px 24px -4px rgba(0, 0, 0, 0.08)',
            },
          },
        }}
      >
        {/* Optional Header */}
        {(popoverTitle || popoverSubtitle) && (
          <Box sx={{ px: 1.5, pt: 1, pb: 1.25, borderBottom: '1px solid rgba(0, 0, 0, 0.06)', mb: 0.75 }}>
            {popoverTitle && (
              <Typography
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#94a3b8',
                }}
              >
                {popoverTitle}
              </Typography>
            )}
            {popoverSubtitle && (
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25, fontWeight: 500 }}>
                {popoverSubtitle}
              </Typography>
            )}
          </Box>
        )}

        {/* Scrollable Option Items */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            maxHeight,
            overflowY: 'auto',
            pr: 0.5,
          }}
        >
          {options.length === 0 ? (
            <Box sx={{ p: 2.5, textAlign: 'center' }}>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>
                No options available
              </Typography>
            </Box>
          ) : (
            options.map((opt, idx) => {
              const optId = resolveId(opt);
              const optLabel = resolveLabel(opt);
              const optSecondary = resolveSecondary(opt);
              const optTag = resolveTag(opt);
              const optEmoji = resolveEmoji(opt);
              const isSelected = selectedId !== null && selectedId === optId;

              if (renderOption) {
                return (
                  <Box key={optId || idx} onClick={() => handleSelect(opt)}>
                    {renderOption(opt, isSelected)}
                  </Box>
                );
              }

              return (
                <Box
                  key={optId || idx}
                  onClick={() => handleSelect(opt)}
                  sx={{
                    p: 1.25,
                    borderRadius: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    bgcolor: isSelected ? alpha(colorTheme, 0.08) : 'transparent',
                    border: `1.5px solid ${isSelected ? alpha(colorTheme, 0.35) : 'transparent'}`,
                    transition: 'all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    '&:hover': {
                      bgcolor: alpha(colorTheme, 0.12),
                      transform: 'translateX(3px)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, flex: 1 }}>
                    {/* Visual Icon / Emoji Box */}
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '12px',
                        bgcolor: isSelected ? colorTheme : alpha(colorTheme, 0.12),
                        color: isSelected ? '#ffffff' : colorTheme,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.05rem',
                        flexShrink: 0,
                        boxShadow: isSelected ? `0 4px 12px ${alpha(colorTheme, 0.35)}` : 'none',
                        transition: 'all 0.18s',
                      }}
                    >
                      {optEmoji || '🌿'}
                    </Box>

                    {/* Text Details */}
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.86rem',
                            color: '#0f172a',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {optLabel}
                        </Typography>
                        {optTag && (
                          <Chip
                            label={optTag}
                            size="small"
                            sx={{
                              bgcolor: isSelected ? alpha(colorTheme, 0.2) : 'rgba(0,0,0,0.04)',
                              color: isSelected ? colorTheme : '#64748b',
                              fontWeight: 800,
                              fontSize: '0.62rem',
                              height: 18,
                              borderRadius: '6px',
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Box>
                      {optSecondary && (
                        <Typography
                          sx={{
                            fontSize: '0.72rem',
                            color: '#64748b',
                            mt: 0.25,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {optSecondary}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Active Selection Checkmark Circle */}
                  {isSelected && (
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        bgcolor: colorTheme,
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: `0 2px 8px ${alpha(colorTheme, 0.4)}`,
                      }}
                    >
                      <CheckIcon sx={{ fontSize: 14 }} />
                    </Box>
                  )}
                </Box>
              );
            })
          )}
        </Box>
      </Popover>
    </>
  );
}

export default PremiumDropdown;
