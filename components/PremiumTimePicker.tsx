'use client';

import React, { useState, useRef, useEffect } from 'react';
import { alpha, Popover, Box, Typography, Button } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PremiumTextField from './PremiumTextField';

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
  
  // Parse initial value
  const parseValue = () => {
    if (!value) return { h: 12, m: 0, ap: 'AM' };
    const [hours24, mins] = value.split(':').map(Number);
    const ap = hours24 >= 12 ? 'PM' : 'AM';
    const h = hours24 % 12 || 12;
    return { h, m: mins || 0, ap };
  };

  const [selH, setSelH] = useState(parseValue().h);
  const [selM, setSelM] = useState(parseValue().m);
  const [selAp, setSelAp] = useState(parseValue().ap);

  useEffect(() => {
    if (open) {
      const parsed = parseValue();
      setSelH(parsed.h);
      setSelM(parsed.m);
      setSelAp(parsed.ap);
    }
  }, [open, value]);

  const handleApply = () => {
    let hours24 = selH;
    if (selAp === 'PM' && selH !== 12) hours24 += 12;
    if (selAp === 'AM' && selH === 12) hours24 = 0;
    
    const hStr = String(hours24).padStart(2, '0');
    const mStr = String(selM).padStart(2, '0');
    onChange({ target: { value: `${hStr}:${mStr}` } });
    setOpen(false);
  };

  const displayValue = value ? (() => {
    const parsed = parseValue();
    return `${parsed.h}:${String(parsed.m).padStart(2, '0')} ${parsed.ap}`;
  })() : '';

  const renderColumn = (items: (number | string)[], selected: number | string, onSelect: (val: any) => void, idPrefix: string) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (open) {
        const el = document.getElementById(`timepicker-${idPrefix}-${selected}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, [selected, open, idPrefix]);

    return (
      <Box sx={{ 
        flex: 1, height: 240, overflowY: 'auto', 
        scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
        display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, gap: 0.5
      }}>
        {/* Padding items to allow scrolling to center at the extremes */}
        <Box sx={{ height: 90, flexShrink: 0 }} />
        {items.map(item => (
          <Box
            key={item}
            id={`timepicker-${idPrefix}-${item}`}
            onClick={() => onSelect(item)}
            sx={{
              py: 1.2, width: '85%', textAlign: 'center', cursor: 'pointer', flexShrink: 0,
              borderRadius: '12px', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              color: selected === item ? colorTheme : '#64748b',
              fontWeight: selected === item ? 900 : 600,
              fontSize: selected === item ? '1.25rem' : '1rem',
              bgcolor: selected === item ? alpha(colorTheme, 0.12) : 'transparent',
              border: selected === item ? `1px solid ${alpha(colorTheme, 0.2)}` : '1px solid transparent',
              boxShadow: selected === item ? `0 4px 12px ${alpha(colorTheme, 0.15)}` : 'none',
              '&:hover': { 
                bgcolor: selected === item ? alpha(colorTheme, 0.15) : 'rgba(0,0,0,0.03)',
                transform: selected === item ? 'scale(1.05)' : 'none'
              }
            }}
          >
            {typeof item === 'number' && item < 10 && items.length > 20 ? `0${item}` : item}
          </Box>
        ))}
        <Box sx={{ height: 90, flexShrink: 0 }} />
      </Box>
    );
  };

  return (
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
          position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
          color: alpha(colorTheme, 0.4), fontSize: 22, cursor: 'pointer',
          transition: 'color 0.2s ease', '&:hover': { color: colorTheme },
        }} 
      />

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
              mt: 1, width: 300, borderRadius: '24px', border: '1px solid rgba(0,0,0,0.06)',
              backgroundColor: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(24px)',
              boxShadow: `0 24px 64px ${alpha('#000', 0.15)}, 0 0 0 1px ${alpha(colorTheme, 0.15)}`,
              overflow: 'hidden', display: 'flex', flexDirection: 'column'
            }
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'center', bgcolor: alpha(colorTheme, 0.03) }}>
          <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
            {selH}:{String(selM).padStart(2, '0')} {selAp}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', height: 240, position: 'relative', bgcolor: '#fff' }}>
          {renderColumn(Array.from({length: 12}, (_, i) => i + 1), selH, setSelH, 'h')}
          {renderColumn(Array.from({length: 60}, (_, i) => i), selM, setSelM, 'm')}
          {renderColumn(['AM', 'PM'], selAp, setSelAp, 'ap')}
        </Box>

        <Box sx={{ p: 2.5, borderTop: '1px solid rgba(0,0,0,0.05)', bgcolor: alpha(colorTheme, 0.02) }}>
          <Button 
            fullWidth variant="contained" onClick={handleApply}
            sx={{ 
              borderRadius: 100, fontWeight: 800, bgcolor: colorTheme, textTransform: 'none', py: 1.2, fontSize: '1.05rem',
              boxShadow: `0 8px 24px ${alpha(colorTheme, 0.3)}, inset 0 2px 0 rgba(255,255,255,0.2)`,
              '&:hover': { bgcolor: colorTheme, transform: 'translateY(-2px)', boxShadow: `0 12px 32px ${alpha(colorTheme, 0.4)}, inset 0 2px 0 rgba(255,255,255,0.2)` }
            }}
          >
            Confirm Time
          </Button>
        </Box>
      </Popover>
    </Box>
  );
}
