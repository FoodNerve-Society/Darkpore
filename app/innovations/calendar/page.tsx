import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import CalendarWidget from '@/components/calendar/CalendarWidget';
import Link from 'next/link';

export const metadata = {
  title: 'Ecosystem Calendar - FoodNerve',
  description: 'View all upcoming deadlines, jobs, livestreams, and events across the FoodNerve ecosystem.',
};

export default function InnovationsCalendarPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pt: { xs: 12, md: 16 }, pb: 8 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#64748b', fontWeight: 500 }}>
            ← Back to CommandCenter
          </Link>
          <Typography variant="h1" sx={{ fontWeight: 900, fontSize: { xs: '2rem', md: '3rem' }, color: '#0f172a' }}>
            Ecosystem Calendar
          </Typography>
        </Box>

        <CalendarWidget variant="full" />
      </Container>
    </Box>
  );
}
