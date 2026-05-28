"use client";

import React, { useEffect } from 'react';
import { useSociety } from '@/context/SocietyContext';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSociety();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // User is not logged in, force login redirect or Authwall
      // Here we push them to the public society page with a login intent, or back to .com
      router.push('/?auth=required');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
