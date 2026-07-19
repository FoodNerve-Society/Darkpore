'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Drawer, Box, IconButton, useMediaQuery, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Button, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { getHotspotMappings, getWikiDoc, WikiBlock, createRegistryHotspot } from '@/lib/actions/wiki';
import { useSociety } from './SocietyContext';
import WikiReader from '@/components/wiki/WikiReader';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';
import PremiumTextField from '@/components/PremiumTextField';
import PremiumAutocomplete from '@/components/PremiumAutocomplete';

const WIKI_DOMAINS = [
  {
    id: 'platform_features', title: 'Platform Features',
    subcategories: [
      { id: 'innovations', title: 'Innovations Hub' },
      { id: 'workspace', title: 'Workspace Hub' },
      { id: 'society', title: 'Modular Society' }
    ]
  },
  {
    id: 'operations', title: 'Operations & Admin',
    subcategories: [
      { id: 'moderation', title: 'Moderation' },
      { id: 'finance', title: 'Finance & Escrow' }
    ]
  },
  {
    id: 'engineering', title: 'Engineering',
    subcategories: [
      { id: 'frontend', title: 'Frontend (UI/UX)' },
      { id: 'backend', title: 'Backend (Data)' }
    ]
  }
];

interface WikiOverlayContextType {
  mappings: Record<string, string>;
  openWikiBySlug: (slug: string) => void;
  openWikiByHotspot: (hotspotId: string) => void;
  closeWiki: () => void;
  openRegisterModal: (id: string, defaultLabel?: string) => void;
}

const WikiOverlayContext = createContext<WikiOverlayContextType>({
  mappings: {},
  openWikiBySlug: () => {},
  openWikiByHotspot: () => {},
  closeWiki: () => {},
  openRegisterModal: () => {},
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

  // Quick Register Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerId, setRegisterId] = useState('');
  const [registerLabel, setRegisterLabel] = useState('');
  const [registerCategory, setRegisterCategory] = useState('');
  const [registerSubcategory, setRegisterSubcategory] = useState('');
  const [isCategoryLocked, setIsCategoryLocked] = useState(false);

  const openRegisterModal = (id: string, defaultLabel?: string) => {
    setRegisterId(id);
    setRegisterLabel(defaultLabel || id.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
    
    // Auto-detect based on window.location
    let autoCat = '';
    let autoSub = '';
    
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host.includes('.org') || host.includes('society')) {
        autoCat = 'platform_features';
        autoSub = 'society';
      } else if (host.includes('foodnerve.com') || host.includes('innovations')) {
        autoCat = 'platform_features';
        autoSub = 'innovations';
      } else if (host.includes('darkpore.com') || host.includes('workspace')) {
        autoCat = 'platform_features';
        autoSub = 'workspace';
      }
    }

    if (autoCat && autoSub) {
      setRegisterCategory(autoCat);
      setRegisterSubcategory(autoSub);
      setIsCategoryLocked(true);
    } else {
      setRegisterCategory('');
      setRegisterSubcategory('');
      setIsCategoryLocked(false);
    }
    
    setShowRegisterModal(true);
  };

  const handleCreateHotspot = async () => {
    if (!registerId || !registerLabel) return;
    const res = await createRegistryHotspot(registerId, registerLabel, registerCategory, registerSubcategory);
    if (res.success) {
      setShowRegisterModal(false);
      // Let the developer know they should link it in the studio
      router.push(`/profile/wiki`);
    } else {
      alert("Error: " + res.error);
    }
  };

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
    
    // Drafts are ONLY visible to the author
    if (doc.tags?.includes("STATUS_DRAFT")) {
      return doc.authorId === uid;
    }
    
    if (isAdmin) return true; // Admins see everything published
    if (doc.isPublic) return true; // Public docs (Everyone authenticated)
    if (doc.allowedUsers.includes(uid)) return true; // Whitelist
    if (doc.authorId === uid) return true; // Author always sees their own doc
    
    return false;
  };

  const handleEdit = () => {
    closeWiki();
    router.push(`/profile/wiki?edit=${activeSlug}`);
  };

  return (
    <WikiOverlayContext.Provider value={{ mappings, openWikiBySlug, openWikiByHotspot, closeWiki, openRegisterModal }}>
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

      <Dialog 
        open={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)}
        slotProps={{
          paper: {
            sx: { 
              bgcolor: 'rgba(255, 255, 255, 0.8)', 
              color: '#0f172a', 
              borderRadius: 4, 
              p: 2, 
              minWidth: 400, 
              zIndex: 9999,
              backdropFilter: 'blur(32px) saturate(200%)',
              border: '1px solid rgba(255,255,255,1)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,1)',
            }
          },
          backdrop: {
            sx: {
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, letterSpacing: '-0.02em', fontSize: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Register Hotspot
          <IconButton onClick={() => setShowRegisterModal(false)} size="small" sx={{ color: 'rgba(15, 23, 42, 0.4)', '&:hover': { color: '#0f172a', bgcolor: 'rgba(15, 23, 42, 0.05)' } }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(15, 23, 42, 0.6)', mt: 1, mb: 1, fontWeight: 500 }}>
            Register a Hotspot ID that a developer has placed in the codebase.
          </Typography>
          
          <PremiumTextField 
            colorTheme="#0f172a"
            label="Hotspot ID (e.g. trade_btn)" 
            value={registerId} onChange={e => setRegisterId(e.target.value)}
          />
          <PremiumTextField 
            colorTheme="#0f172a"
            label="Human Readable Label" 
            value={registerLabel} onChange={e => setRegisterLabel(e.target.value)}
          />
          
          {isCategoryLocked ? (
            <PremiumTextField
              disabled
              colorTheme="#0f172a"
              label="Domain & Tag (Auto-detected)"
              value={`${WIKI_DOMAINS.find(d => d.id === registerCategory)?.title || registerCategory} / ${WIKI_DOMAINS.find(d => d.id === registerCategory)?.subcategories.find(s => s.id === registerSubcategory)?.title || registerSubcategory}`}
              onChange={() => {}}
            />
          ) : (
            <>
              <PremiumAutocomplete
                colorTheme="#0f172a"
                label="Domain (Category)"
                options={WIKI_DOMAINS}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.title}
                value={WIKI_DOMAINS.find(d => d.id === registerCategory) || null}
                onChange={(e, newValue: any) => {
                  setRegisterCategory(newValue ? newValue.id : '');
                  setRegisterSubcategory('');
                }}
              />

              {registerCategory && (
                <PremiumAutocomplete
                  colorTheme="#0f172a"
                  label="Tag (Subcategory)"
                  options={WIKI_DOMAINS.find(d => d.id === registerCategory)?.subcategories || []}
                  getOptionLabel={(option) => typeof option === 'string' ? option : option.title}
                  value={WIKI_DOMAINS.find(d => d.id === registerCategory)?.subcategories.find(sub => sub.id === registerSubcategory) || null}
                  onChange={(e, newValue: any) => setRegisterSubcategory(newValue ? newValue.id : '')}
                />
              )}
            </>
          )}

        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'flex-end' }}>
          <Button onClick={handleCreateHotspot} variant="contained" sx={{ bgcolor: '#0f172a', color: '#fff', borderRadius: 3, px: 4, py: 1, fontWeight: 800, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', '&:hover': { bgcolor: '#1e293b', transform: 'translateY(-2px)', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }, transition: 'all 0.2s ease' }}>Register</Button>
        </DialogActions>
      </Dialog>

    </WikiOverlayContext.Provider>
  );
}
