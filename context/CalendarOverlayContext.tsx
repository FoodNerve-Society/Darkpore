'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Dialog, DialogContent, IconButton, Typography, Box, 
  alpha, useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { motion } from 'framer-motion';
import { useSociety } from './SocietyContext';
import EcosystemCalendar, { ViewMode } from '@/app/components/calendar/EcosystemCalendar';

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
  const [initialView, setInitialView] = useState<ViewMode>('month');
  const [initialDate, setInitialDate] = useState<Date | undefined>(undefined);
  
  const theme = useTheme();
  const { profile } = useSociety();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const viewParam = url.searchParams.get('view');
      const dateParam = url.searchParams.get('date');
      
      if (viewParam === 'month' || viewParam === 'week' || viewParam === 'day') {
        setIsOpen(true);
        setInitialView(viewParam);
        if (dateParam) {
          const parsed = new Date(dateParam);
          if (!isNaN(parsed.getTime())) {
            // Need to adjust for timezone shifts if they strictly passed YYYY-MM-DD
            parsed.setMinutes(parsed.getMinutes() + parsed.getTimezoneOffset());
            setInitialDate(parsed);
          }
        }
      }
    }
  }, []);

  const openCalendar = () => setIsOpen(true);
  
  const closeCalendar = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      url.searchParams.delete('date');
      window.history.replaceState(null, '', url.pathname + url.search);
    }
  };

  return (
    <CalendarOverlayContext.Provider value={{ isOpen, openCalendar, closeCalendar }}>
      {children}

      <Dialog 
        open={isOpen} 
        onClose={closeCalendar}
        maxWidth="lg"
        slotProps={{
          paper: {
            sx: {
              width: '90vw', height: '90vh', maxWidth: 'none', maxHeight: 'none',
              borderRadius: 6, bgcolor: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(32px)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.5)', overflow: 'hidden'
            }
          },
          backdrop: { sx: { backdropFilter: 'blur(4px)', backgroundColor: alpha('#000', 0.4) } }
        }}
      >
        <IconButton 
          onClick={closeCalendar}
          sx={{ 
            position: 'absolute', right: 16, top: 16, zIndex: 10,
            bgcolor: 'rgba(0,0,0,0.05)', '&:hover': { bgcolor: 'rgba(0,0,0,0.1)', transform: 'rotate(90deg)' },
            transition: 'all 0.2s ease'
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Content (Ecosystem Calendar Grid) */}
        <DialogContent sx={{ p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ mb: 2, pl: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CalendarMonthIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} /> Ecosystem Calendar
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500, mt: 0.5 }}>
              Explore deadlines, livestreams, and events across the network.
            </Typography>
          </Box>
          <EcosystemCalendar 
            tenantId={(profile as any)?.tenantId || 'foodnerve'} 
            initialView={initialView}
            initialDate={initialDate}
          />
        </DialogContent>


      </Dialog>
    </CalendarOverlayContext.Provider>
  );
}
