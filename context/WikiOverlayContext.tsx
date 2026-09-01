'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Drawer, Box, IconButton, useMediaQuery, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Button, MenuItem, Select, InputLabel, FormControl, Tooltip } from '@mui/material';
import { getHotspotMappings, getWikiDoc, WikiBlock, createRegistryHotspot } from '@/lib/actions/wiki';
import { useSociety } from './SocietyContext';
import WikiReader from '@/components/wiki/WikiReader';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import MenuBookIcon from '@mui/icons-material/MenuBook';
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
  const [isDocked, setIsDocked] = useState(false);
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

  // Fetch doc when slug changes or drawer/dock opens
  useEffect(() => {
    if (activeSlug && (isOpen || isDocked)) {
      loadDoc(activeSlug);
    } else if (!isOpen && !isDocked) {
      setDoc(null);
    }
  }, [activeSlug, isOpen, isDocked]);

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
    setIsDocked(false);
    setIsOpen(true);
  };

  const openWikiByHotspot = (hotspotId: string) => {
    const slug = mappings[hotspotId];
    if (slug) {
      openWikiBySlug(slug);
    } else {
      openRegisterModal(hotspotId);
    }
  };

  const closeWiki = () => {
    setIsOpen(false);
    setIsDocked(false);
    setActiveSlug(null);
  };

  const minimizeWiki = () => {
    setIsOpen(false);
    setIsDocked(true);
  };

  const expandWiki = () => {
    setIsDocked(false);
    setIsOpen(true);
  };

  // Access Control Helpers
  const userRoles = profile?.roles || ['guest'];
  const isAdmin = profile?.isAdmin || false;
  const uid = profile?.uid || 'guest';

  const canSeeBlock = (block: WikiBlock) => {
    if (isAdmin) return true;
    if (block.visibility === 'public') return true;
    if (block.visibility === 'internal_staff' && (userRoles as string[]).includes('internal_staff')) return true;
    if (block.visibility === 'admin' && (userRoles as string[]).includes('admin')) return true;
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
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 600, md: 800 },
            height: { xs: '90vh', sm: '100%' },
            borderRadius: { xs: '24px 24px 0 0', sm: 0 },
            bgcolor: '#ffffff',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
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
          onMinimize={minimizeWiki}
          onClose={closeWiki}
        />
      </Drawer>

      {/* FLOATING DOCKED WIKI PILL */}
      {isDocked && doc && (
        <Box
          sx={{
            position: 'fixed',
            bottom: { xs: 80, sm: 24 },
            right: 24,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            bgcolor: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.35), 0 0 20px rgba(16, 185, 129, 0.2)',
            borderRadius: '100px',
            px: 2,
            py: 1,
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 16px 44px rgba(0,0,0,0.4), 0 0 28px rgba(16, 185, 129, 0.35)',
              borderColor: '#10b981',
            },
          }}
          onClick={expandWiki}
        >
          {/* Live pulsing emerald dot */}
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
            <Box sx={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%', bgcolor: '#10b981', opacity: 0.4, animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
          </Box>

          <MenuBookIcon sx={{ fontSize: 18, color: '#10b981' }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: { xs: 150, sm: 220 } }}>
            <Typography noWrap sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#fff' }}>
              {doc.title}
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'capitalize' }}>
              {doc.category || 'Playbook'} • Docked
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 0.5 }}>
            <Tooltip title="Expand Playbook">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  expandWiki();
                }}
                sx={{
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  width: 26,
                  height: 26,
                  '&:hover': { bgcolor: '#10b981', color: '#fff' },
                  transition: 'all 0.2s',
                }}
              >
                <OpenInFullIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Close Playbook">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  closeWiki();
                }}
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  bgcolor: 'rgba(255,255,255,0.05)',
                  width: 26,
                  height: 26,
                  '&:hover': { bgcolor: 'rgba(239,68,68,0.3)', color: '#ef4444' },
                  transition: 'all 0.2s',
                }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

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
