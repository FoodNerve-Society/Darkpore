'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Drawer, Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { getHotspotMappings, getWikiDoc, WikiBlock } from '@/lib/actions/wiki';
import { useSociety } from './SocietyContext';
import WikiReader from '@/components/wiki/WikiReader';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';

interface WikiOverlayContextType {
  mappings: Record<string, string>;
  openWikiBySlug: (slug: string) => void;
  openWikiByHotspot: (hotspotId: string) => void;
  closeWiki: () => void;
}

const WikiOverlayContext = createContext<WikiOverlayContextType>({
  mappings: {},
  openWikiBySlug: () => {},
  openWikiByHotspot: () => {},
  closeWiki: () => {},
});

export const useWikiOverlay = () => useContext(WikiOverlayContext);

export function WikiOverlayProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useSociety();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load mappings on mount
  useEffect(() => {
    async function loadMappings() {
      const res = await getHotspotMappings();
      if (res.success && res.data) {
        setMappings(res.data);
      }
    }
    loadMappings();
  }, []);

  // Fetch doc when slug changes
  useEffect(() => {
    if (activeSlug && isOpen) {
      loadDoc(activeSlug);
    } else {
      setDoc(null);
    }
  }, [activeSlug, isOpen]);

  const loadDoc = async (slug: string) => {
    setLoading(true);
    const res = await getWikiDoc(slug);
    if (res.success && res.data) {
      setDoc(res.data);
    } else {
      setDoc(null);
    }
    setLoading(false);
  };

  const openWikiBySlug = (slug: string) => {
    setActiveSlug(slug);
    setIsOpen(true);
  };

  const openWikiByHotspot = (hotspotId: string) => {
    const slug = mappings[hotspotId];
    if (slug) {
      openWikiBySlug(slug);
    } else {
      console.warn(`No wiki document mapped to hotspot: ${hotspotId}`);
    }
  };

  const closeWiki = () => {
    setIsOpen(false);
    // Add slight delay before clearing doc to allow exit animation
    setTimeout(() => setActiveSlug(null), 300);
  };

  // Access Control Helpers
  const userRoles = profile?.roles || ['guest'];
  const isAdmin = profile?.isAdmin || false;
  const uid = profile?.uid || 'guest';

  const canSeeBlock = (block: WikiBlock) => {
    if (isAdmin) return true;
    if (block.visibility === 'public') return true;
    if (block.visibility === 'internal_staff' && userRoles.includes('internal_staff')) return true;
    if (block.visibility === 'admin' && userRoles.includes('admin')) return true;
    if (block.visibility === 'whitelist_only' && block.whitelistUsers?.includes(uid)) return true;
    return false;
  };

  const hasAccess = () => {
    if (!doc) return false;
    if (isAdmin) return true;
    if (doc.isPublic) return true;
    if (doc.allowedRoles.some((r: string) => userRoles.includes(r as any))) return true;
    if (doc.allowedUsers.includes(uid)) return true;
    return false;
  };

  const handleEdit = () => {
    closeWiki();
    // Assuming tenant routing structure, we'd need to extract tenant from url if needed.
    // For now, doing a simple push. Wait, router push needs tenant.
    // Let's rely on standard path structure: /modular-society/[tenant]/profile/wiki
    const tenant = window.location.pathname.split('/')[2];
    if (tenant) {
       router.push(`/modular-society/${tenant}/profile/wiki?edit=${activeSlug}`);
    }
  };

  return (
    <WikiOverlayContext.Provider value={{ mappings, openWikiBySlug, openWikiByHotspot, closeWiki }}>
      {children}
      
      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={isOpen}
        onClose={closeWiki}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 600, md: 800 },
            height: { xs: '90vh', sm: '100%' },
            borderRadius: { xs: '24px 24px 0 0', sm: 0 },
            bgcolor: '#ffffff',
          }
        }}
      >
        <WikiReader 
          doc={doc}
          loading={loading}
          isAdmin={isAdmin}
          hasAccess={hasAccess()}
          canSeeBlock={canSeeBlock}
          onEdit={handleEdit}
          headerContent={
            <IconButton onClick={closeWiki} sx={{ mr: 1 }}>
              <CloseIcon />
            </IconButton>
          }
        />
      </Drawer>
    </WikiOverlayContext.Provider>
  );
}
