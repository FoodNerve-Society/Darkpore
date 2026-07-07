import React from 'react';
import { alpha } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

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
  
  const parsedValue = value ? new Date(value) : null;

  const handleChange = (newValue: Date | null) => {
    if (newValue && !isNaN(newValue.getTime())) {
      // Format as YYYY-MM-DD
      const year = newValue.getFullYear();
      const month = String(newValue.getMonth() + 1).padStart(2, '0');
      const day = String(newValue.getDate()).padStart(2, '0');
      onChange({ target: { value: `${year}-${month}-${day}` } });
    } else {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label={label}
        value={parsedValue}
        onChange={handleChange}
        minDate={minDate}
        maxDate={maxDate}
        format="dd/MM/yyyy"
        slotProps={{
          textField: { 
            fullWidth,
            variant: 'filled',
            sx: {
              width: fullWidth ? '100%' : 'auto',
              // 1) Unfocused label
              '& label': { color: alpha(colorTheme, 0.8), fontWeight: 400 },
              // 2) Focused label
              '& label.Mui-focused': { color: colorTheme, fontWeight: 600 },
              // 3) Color the actual typed text
              '& .MuiInputBase-input': { color: colorTheme, fontWeight: 500 },
              '& .MuiFilledInput-root': {
                  borderRadius: 3,
                  transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                  bgcolor: alpha('#000', 0.02),
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)',
                  '&::before, &::after': { display: 'none' },
                  '&:hover': { bgcolor: alpha('#000', 0.04) },
                  '&:hover:not(.Mui-disabled, .Mui-error):before': { borderBottom: 'none' },
                  '&.Mui-focused': {
                      bgcolor: alpha(colorTheme, 0.03),
                      boxShadow: `
                          inset 0 2px 4px rgba(0,0,0,0.03),
                          0 0 0 2px ${alpha(colorTheme, 0.5)}
                      `,
                  },
              },
            }
          } as any,
          input: {
            disableUnderline: true,
          } as any,
          desktopPaper: {
              sx: {
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(24px)',
                boxShadow: `0 24px 64px ${alpha(colorTheme, 0.15)}`,
                overflow: 'hidden',
                '& .MuiPickersDay-root': {
                  borderRadius: '12px',
                  fontWeight: 600,
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
                  }
                },
                '& .MuiPickersCalendarHeader-root': {
                  marginTop: 2,
                  marginBottom: 1,
                  paddingLeft: 3,
                  paddingRight: 3,
                  '& .MuiPickersCalendarHeader-label': {
                    fontWeight: 800,
                    fontSize: '1.1rem',
                  }
                },
                '& .MuiDayCalendar-weekDayLabel': {
                  fontWeight: 800,
                  color: alpha('#0f172a', 0.4),
                },
                '& .MuiPickersYear-yearButton': {
                  borderRadius: '12px',
                  fontWeight: 600,
                  '&.Mui-selected': {
                    backgroundColor: colorTheme,
                  }
                }
              }
            }
          }}
        />
    </LocalizationProvider>
  );
}
