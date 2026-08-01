'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Dialog, DialogContent, IconButton, Typography, Box, 
  alpha, useTheme, Fab
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { motion } from 'framer-motion';
import { useSociety } from './SocietyContext';

interface CalendarOverlayContextType {
  isOpen: boolean;
  openCalendar: () => void;
  closeCalendar: () => void;
}

const CalendarOverlayContext = createContext<CalendarOverlayContextType>({
  isOpen: false,
  openCalendar: () => {},
  closeCalendar: () => {},
});

export const useCalendarOverlay = () => useContext(CalendarOverlayContext);

export function CalendarOverlayProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();
  const { profile } = useSociety();

  const openCalendar = () => setIsOpen(true);
  const closeCalendar = () => setIsOpen(false);

  return (
    <CalendarOverlayContext.Provider value={{ isOpen, openCalendar, closeCalendar }}>
      {children}

      <Dialog 
        open={isOpen} 
        onClose={closeCalendar}
        fullScreen
        TransitionComponent={motion.div as any}
        TransitionProps={{
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 },
          transition: { type: 'spring', damping: 25, stiffness: 300 }
        } as any}
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(40px) saturate(200%)',
              border: 'none',
              boxShadow: 'none',
              color: 'text.primary'
            }
          }
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 3 }}>
              <CalendarMonthIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', fontFamily: 'var(--font-dosis)' }}>
                Ecosystem Calendar
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Aggregating Society, Organization, and Personal events.
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={closeCalendar} 
            sx={{ 
              bgcolor: 'rgba(0,0,0,0.05)', 
              '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' } 
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content (Placeholder for full calendar grid) */}
        <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
          <Box 
            sx={{ 
              height: '100%', 
              width: '100%', 
              borderRadius: 4, 
              border: '1px dashed rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              bgcolor: 'rgba(255,255,255,0.4)',
              minHeight: 400
            }}
          >
            <CalendarMonthIcon sx={{ fontSize: 80, color: 'rgba(0,0,0,0.05)', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.secondary' }}>
              Full Month View Coming Soon
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.disabled', maxWidth: 400, textAlign: 'center' }}>
              This overlay will render the complete grid view of your aggregated schedule without forcing you to leave your current module.
            </Typography>
          </Box>
        </DialogContent>

        {/* Floating Action Button for adding events */}
        <Fab 
          color="primary" 
          aria-label="add" 
          sx={{ 
            position: 'fixed', 
            bottom: 32, 
            right: 32,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            transform: 'scale(1.1)'
          }}
        >
          <AddIcon />
        </Fab>
      </Dialog>
    </CalendarOverlayContext.Provider>
  );
}
