'use client';

import React, { useState, useRef } from 'react';
import { alpha, Popover, Box } from '@mui/material';
import { StaticTimePicker } from '@mui/x-date-pickers/StaticTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PremiumTextField from './PremiumTextField';
import { format } from 'date-fns';

interface PremiumTimePickerProps {
  label: string;
  value: string; // HH:mm format
  onChange: (e: { target: { value: string } }) => void;
  fullWidth?: boolean;
  colorTheme?: string;
}

export default function PremiumTimePicker({
  label,
  value,
  onChange,
  fullWidth = true,
  colorTheme = '#3b82f6',
}: PremiumTimePickerProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  
  const parsedValue = value ? (() => {
    const d = new Date();
    const [h, m] = value.split(':');
    d.setHours(parseInt(h, 10));
    d.setMinutes(parseInt(m, 10));
    return d;
  })() : null;

  const handleTimeSelect = (newValue: Date | null) => {
    if (newValue && !isNaN(newValue.getTime())) {
      const hours = String(newValue.getHours()).padStart(2, '0');
      const minutes = String(newValue.getMinutes()).padStart(2, '0');
      onChange({ target: { value: `${hours}:${minutes}` } });
    } else {
      onChange({ target: { value: '' } });
    }
  };

  const displayValue = parsedValue && !isNaN(parsedValue.getTime())
    ? format(parsedValue, 'h:mm a')
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
          InputProps={{
            readOnly: true,
            style: { cursor: 'pointer' }
          }}
          sx={{ 
            cursor: 'pointer',
            '& .MuiInputBase-root': { cursor: 'pointer' },
          }}
        />
        <AccessTimeIcon 
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

      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
        disableScrollLock
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
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
              overflow: 'visible', // allows am/pm to pop out if needed
              minWidth: 320, // ensures enough width
            }
          }
        }}
      >
        <StaticTimePicker
          value={parsedValue}
          onChange={handleTimeSelect}
          onAccept={() => setOpen(false)}
          onClose={() => setOpen(false)}
          sx={{
            bgcolor: 'transparent',
            '& .MuiPickersToolbar-root': {
              color: colorTheme,
              '& .MuiTypography-root': { fontWeight: 800 },
            },
            '& .MuiClockPointer-root': { bgcolor: colorTheme },
            '& .MuiClockPointer-thumb': { bgcolor: colorTheme, borderColor: colorTheme },
            '& .MuiClock-pin': { bgcolor: colorTheme },
            '& .MuiClockNumber-root.Mui-selected': { bgcolor: colorTheme },
            '& .MuiButtonBase-root.MuiIconButton-root': {
              color: colorTheme,
            },
            '& .MuiPickersLayout-root': {
              bgcolor: 'transparent'
            },
            '& .MuiClock-root': {
              margin: 'auto'
            }
          }}
        />
      </Popover>
    </LocalizationProvider>
  );
}
