import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import EcosystemCalendar from '@/app/components/calendar/EcosystemCalendar';
import Link from 'next/link';

export const metadata = {
  title: 'Ecosystem Calendar - FoodNerve',
  description: 'View all upcoming deadlines, jobs, livestreams, and events across the FoodNerve ecosystem.',
};

export default function InnovationsCalendarPage({ searchParams }: { searchParams: { view?: string, date?: string } }) {
  const initialView = (searchParams.view as 'month' | 'week' | 'day') || 'month';
  const initialDate = searchParams.date ? new Date(searchParams.date) : new Date();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pt: { xs: 12, md: 16 }, pb: 8 }}>
      <Container maxWidth="xl" sx={{ height: 'calc(100vh - 150px)' }}>
        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#64748b', fontWeight: 500 }}>
            ← Back to CommandCenter
          </Link>
          <Typography variant="h1" sx={{ fontWeight: 900, fontSize: { xs: '2rem', md: '3rem' }, color: '#0f172a' }}>
            Ecosystem Calendar
          </Typography>
        </Box>

        <Box sx={{ 
          width: '100%', 
          height: '100%', 
          bgcolor: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(16px)',
          borderRadius: 6,
          boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
          border: '1px solid rgba(255,255,255,0.4)',
          p: { xs: 2, md: 4 },
          display: 'flex',
          flexDirection: 'column'
        }}>
          <EcosystemCalendar 
            tenantId="foodnerve" 
            initialView={initialView} 
            initialDate={initialDate} 
          />
        </Box>
      </Container>
    </Box>
  );
}
