'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, CircularProgress } from '@mui/material';
import { useParams } from 'next/navigation';
import { useSociety } from '@/context/SocietyContext';
import UserCommandContainer from '@/components/profile/UserCommandContainer';
import OrgCommandContainer from '@/components/profile/OrgCommandContainer';

export default function CommandCenterLayout() {
  const { profile, activeOrg } = useSociety();
  const params = useParams();
  const tenant = params.tenant as string;
  
  const [activeView, setActiveView] = useState<'split' | 'user' | 'org'>('split');

  if (!profile) return <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><CircularProgress sx={{ color: '#3b82f6' }} /></Box>;

  return (
    <Box sx={{ height: '100vh', overflow: 'hidden', bgcolor: '#0f172a', p: { xs: 1, md: 2 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, height: '100%' }}>
        
        {/* USER CONTAINER */}
        <Box 
          sx={{ 
            flex: activeView === 'split' ? 1 : (activeView === 'user' ? 9 : 0.5),
            transition: 'flex 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            minHeight: 0,
            minWidth: 0,
          }}
        >
          <UserCommandContainer 
            tenant={tenant}
            username={profile.username || profile.uid} 
            isActive={activeView === 'user'} 
            isCollapsed={activeView === 'org'}
            onActivate={() => setActiveView(activeView === 'user' ? 'split' : 'user')} 
          />
        </Box>

        {/* ORG CONTAINER */}
        <Box 
          sx={{ 
            flex: activeView === 'split' ? 1 : (activeView === 'org' ? 9 : 0.5),
            transition: 'flex 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            minHeight: 0,
            minWidth: 0,
          }}
        >
          <OrgCommandContainer 
            tenant={tenant}
            slug={activeOrg?.slug || null} 
            isActive={activeView === 'org'} 
            isCollapsed={activeView === 'user'}
            onActivate={() => setActiveView(activeView === 'org' ? 'split' : 'org')} 
          />
        </Box>

      </Box>
    </Box>
  );
}
