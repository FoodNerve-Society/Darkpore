'use client';

import React, { useState, useRef } from 'react';
import { alpha, Popover, Box, InputAdornment } from '@mui/material';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PremiumTextField from './PremiumTextField';
import { format } from 'date-fns';

interface PremiumDatePickerProps {
  label: string;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  fullWidth?: boolean;
  colorTheme?: string;
  minDate?: Date;
  maxDate?: Date;
}

export default function PremiumDatePicker({
  label,
  value,
  onChange,
  fullWidth = true,
  colorTheme = '#3b82f6',
  minDate,
  maxDate
}: PremiumDatePickerProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const parsedValue = value ? new Date(value) : null;

  const handleDateSelect = (newValue: Date | null) => {
    if (newValue && !isNaN(newValue.getTime())) {
      const year = newValue.getFullYear();
      const month = String(newValue.getMonth() + 1).padStart(2, '0');
      const day = String(newValue.getDate()).padStart(2, '0');
      onChange({ target: { value: `${year}-${month}-${day}` } });
    } else {
      onChange({ target: { value: '' } });
    }
    setOpen(false);
  };

  const displayValue = parsedValue && !isNaN(parsedValue.getTime())
    ? format(parsedValue, 'dd MMM yyyy')
    : '';

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box ref={anchorRef} sx={{ width: fullWidth ? '100%' : 'auto', position: 'relative' }}>
        <PremiumTextField
          colorTheme={colorTheme}
          fullWidth={fullWidth}
          label={label}
          value={displayValue}
          onClick={() => setOpen(true)}
          inputProps={{ readOnly: true, style: { cursor: 'pointer' } }}
          sx={{ 
            cursor: 'pointer',
            '& .MuiInputBase-root': { cursor: 'pointer' },
          }}
        />
        {/* Calendar icon positioned absolutely on the right */}
        <CalendarMonthIcon 
          onClick={() => setOpen(true)}
          sx={{ 
            position: 'absolute', 
            right: 14, 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: alpha(colorTheme, 0.4),
            fontSize: 22,
            cursor: 'pointer',
            transition: 'color 0.2s ease',
            '&:hover': { color: colorTheme },
          }} 
        />
      </Box>

      {/* Calendar Popover */}
      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
        disableScrollLock
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        // Kill the backdrop completely via CSS — works in every MUI version
        sx={{
          '& .MuiBackdrop-root, & .MuiModal-backdrop': {
            backgroundColor: 'transparent !important',
            backdropFilter: 'none !important',
            WebkitBackdropFilter: 'none !important',
          }
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              borderRadius: '24px',
              border: '1px solid rgba(0,0,0,0.06)',
              backgroundColor: '#fff',
              boxShadow: `0 20px 60px ${alpha('#000', 0.12)}, 0 0 0 1px ${alpha(colorTheme, 0.08)}`,
              overflow: 'hidden',
            }
          }
        }}
      >
        <StaticDatePicker
          value={parsedValue}
          onChange={handleDateSelect}
          minDate={minDate}
          maxDate={maxDate}
          slotProps={{
            actionBar: { actions: [] },
          }}
          sx={{
            bgcolor: 'transparent',
            '& .MuiPickersDay-root': {
              borderRadius: '12px',
              fontWeight: 600,
              transition: 'all 0.15s ease',
              '&:not(.Mui-selected)': {
                border: '1px solid transparent',
              },
              '&:hover:not(.Mui-selected)': {
                backgroundColor: alpha(colorTheme, 0.1),
                borderColor: alpha(colorTheme, 0.2),
              },
              '&.Mui-selected': {
                backgroundColor: colorTheme,
                color: '#fff',
                boxShadow: `0 4px 12px ${alpha(colorTheme, 0.4)}`,
                '&:hover': {
                  backgroundColor: colorTheme,
                }
              },
              '&.MuiPickersDay-today:not(.Mui-selected)': {
                borderColor: alpha(colorTheme, 0.5),
              }
            },
            '& .MuiPickersCalendarHeader-root': {
              mt: 1,
              mb: 0.5,
              px: 2.5,
              '& .MuiPickersCalendarHeader-label': {
                fontWeight: 800,
                fontSize: '1.05rem',
                color: '#0f172a',
              }
            },
            '& .MuiDayCalendar-weekDayLabel': {
              fontWeight: 800,
              color: alpha('#0f172a', 0.35),
              fontSize: '0.8rem',
            },
            '& .MuiPickersYear-yearButton': {
              borderRadius: '12px',
              fontWeight: 600,
              '&.Mui-selected': {
                backgroundColor: colorTheme,
                color: '#fff',
              }
            },
            '& .MuiPickersArrowSwitcher-button': {
              color: colorTheme,
            },
          }}
        />
      </Popover>
    </LocalizationProvider>
  );
}
