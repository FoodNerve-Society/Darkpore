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
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (profile && !hasInitialized) {
      setActiveView('split');
      setHasInitialized(true);
    }
  }, [profile, activeOrg, hasInitialized]);

  const isOrgEmpty = !activeOrg;

  if (!profile) return <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><CircularProgress sx={{ color: '#3b82f6' }} /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, pt: { xs: 2, md: 4 }, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, flex: 1, minHeight: 0 }}>
        
        {/* USER CONTAINER */}
        <Box 
          onClickCapture={() => {
            if (activeView === 'split') setActiveView('user');
          }}
          sx={{ 
            flex: activeView === 'split' 
              ? 1 
              : (activeView === 'user' 
                  ? { xs: 9, md: 8 } 
                  : { xs: 1, md: 2 }
                ),
            transition: 'flex 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            minHeight: 0,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
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
          onClickCapture={() => {
            if (activeView === 'split') setActiveView('org');
          }}
          sx={{ 
            flex: activeView === 'split' 
              ? 1 
              : (activeView === 'org' 
                  ? { xs: 9, md: 8 } 
                  : { xs: 1, md: 2 }
                ),
            transition: 'flex 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            minHeight: 0,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
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
