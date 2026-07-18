'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, IconButton, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useSociety } from '@/context/SocietyContext';
import { getAllVisibleWikiDocs, getWikiDoc, createOrUpdateWikiDoc, WikiBlock, WikiDocInput, getRegistryHotspots, createRegistryHotspot } from '@/lib/actions/wiki';
import FlipContainer from '../../components/shared/FlipContainer';
import WikiReader from '@/components/wiki/WikiReader';
import WikiStudioDashboard from '../../components/forms/WikiStudioDashboard';
import WikiFrontContent from '@/components/wiki/WikiFrontContent';
import WikiEditor from '@/components/wiki/WikiEditor';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const sharedPaperSx = {
  flex: 1,
  m: { xs: 1, md: 2 },
  minHeight: 0,
  height: { xs: 'calc(100% - 16px)', md: 'calc(100% - 32px)' },
  bgcolor: '#ffffff',
  borderRadius: 4,
  boxShadow: { xs: '0 8px 32px rgba(0,0,0,0.06)', md: '0 10px 40px rgba(0,0,0,0.04)' },
  overflowY: 'auto',
  overflowX: 'hidden',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
};

export default function WikiDashboardPage() {
  const { profile } = useSociety();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const tenant = params.tenant as string;
  
  // Dashboard State
  const [wikiDocs, setWikiDocs] = useState<any[]>([]);
  
  // Hotspot Registry State
  const [registryHotspots, setRegistryHotspots] = useState<any[]>([]);
  const [showHotspotModal, setShowHotspotModal] = useState(false);
  const [newHotspotId, setNewHotspotId] = useState('');
  const [newHotspotLabel, setNewHotspotLabel] = useState('');

  const loadHotspots = async () => {
    const res = await getRegistryHotspots();
    if (res.success && res.data) {
      setRegistryHotspots(res.data);
    }
  };

  const handleCreateHotspot = async () => {
    if (!newHotspotId || !newHotspotLabel) return;
    const res = await createRegistryHotspot(newHotspotId, newHotspotLabel);
    if (res.success) {
      await loadHotspots();
      setNewHotspotId('');
      setNewHotspotLabel('');
      setShowHotspotModal(false);
    } else {
      alert("Error: " + res.error);
    }
  };
  
  // SPA Flip State
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<'reader' | 'editor' | 'lobby'>('reader');
  
  // Reader / Editor State
  const [activeDocSlug, setActiveDocSlug] = useState<string | null>(null);
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [editForm, setEditForm] = useState<WikiDocInput>({
    slug: '', title: '', category: 'operations', isPublic: false, allowedRoles: [], allowedUsers: [], blocks: [], tags: [], authorId: '', hotspotId: '', parentId: ''
  });

  const loadDashboard = async () => {
    if (profile) {
      const res = await getAllVisibleWikiDocs(profile.roles || [], profile.uid || 'guest', profile.isAdmin || false);
      if (res.success && res.data) {
        setWikiDocs(res.data);
      }
    }
  };

  useEffect(() => {
    loadDashboard();
    loadHotspots().then(() => {
      const qsHotspot = searchParams.get('hotspot');
      if (qsHotspot && profile?.isAdmin) {
        setNewHotspotId(qsHotspot);
        setNewHotspotLabel(qsHotspot.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
        setShowHotspotModal(true);
        router.replace(`/modular-society/${tenant}/profile/wiki`);
      }
    });
  }, [profile, searchParams, router, tenant]);

  useEffect(() => {
    if (isFlipped) {
      if (activeDocSlug) {
        loadDoc(activeDocSlug);
      } else {
         setDoc(null);
         setViewMode('lobby');
         setEditForm({
           slug: '', title: '', category: 'operations', isPublic: false, allowedRoles: ['internal_staff'], allowedUsers: [], blocks: [], tags: [], authorId: profile?.uid || '', hotspotId: '', parentId: ''
         });
      }
    } else {
      setDoc(null);
      setActiveDocSlug(null);
      loadDashboard();
    }
  }, [isFlipped, activeDocSlug, profile]);

  const loadDoc = async (slug: string) => {
    setLoading(true);
    const res = await getWikiDoc(slug);
    if (res.success && res.data) {
      setDoc(res.data);
      setEditForm({
        slug: res.data.slug, 
        title: res.data.title, 
        category: res.data.category, 
        isPublic: res.data.isPublic,
        allowedRoles: res.data.allowedRoles,
        allowedUsers: res.data.allowedUsers,
        blocks: res.data.blocks,
        tags: res.data.tags, 
        authorId: res.data.authorId,
        hotspotId: res.data.hotspotId || '',
        parentId: res.data.parentId || ''
      });
      setViewMode('reader');
    } else {
      setDoc(null);
      setEditForm({
        slug: slug, title: '', category: 'operations', isPublic: false, allowedRoles: ['internal_staff'], allowedUsers: [], blocks: [], tags: [], authorId: profile?.uid || '', hotspotId: '', parentId: ''
      });
      setViewMode('editor');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    const res = await createOrUpdateWikiDoc({ ...editForm, authorId: profile?.uid || 'unknown' });
    if (res.success) {
      await loadDoc(editForm.slug);
      setViewMode('reader');
    } else {
      alert("Error saving: " + res.error);
    }
    setLoading(false);
  };

  const handleStartFresh = (type: string, taxonomy: any, templateBlocks: any[] = []) => {
    setEditForm({
      ...editForm,
      category: taxonomy.category || 'operations',
      tags: taxonomy.subcategory ? [taxonomy.subcategory] : [],
      isPublic: taxonomy.clearance === 'public',
      allowedRoles: taxonomy.clearance === 'public' ? [] : [taxonomy.clearance],
      blocks: templateBlocks.map((b: any) => ({ ...b, id: `block-${Date.now()}-${Math.random()}` }))
    });
    setViewMode('editor');
  };

  if (!profile) return null;

  const userRoles = profile?.roles || ['guest'];
  const isAdmin = profile?.isAdmin || false;
  const uid = profile?.uid || 'guest';

  const canSeeBlock = (block: WikiBlock) => {
    if (isAdmin) return true;
    if (block.visibility === 'public') return true;
    if (block.visibility === 'internal_staff' && userRoles.includes('internal_staff' as any)) return true;
    if (block.visibility === 'admin' && userRoles.includes('admin' as any)) return true;
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

  const FrontContent = (
    <WikiFrontContent 
      wikiDocs={wikiDocs}
      isAdmin={isAdmin}
      onDocSelect={(slug) => {
        setActiveDocSlug(slug);
        setIsFlipped(true);
      }}
      onCreateClick={() => {
        setActiveDocSlug(null);
        setIsFlipped(true);
      }}
    />
  );

  const BackContent = (
    <Paper elevation={0} sx={{ ...sharedPaperSx, bgcolor: '#ffffff', p: 0 }}>
      {viewMode === 'reader' ? (
        <WikiReader 
          doc={doc}
          loading={loading}
          isAdmin={isAdmin}
          hasAccess={hasAccess()}
          canSeeBlock={canSeeBlock}
          onEdit={() => setViewMode('editor')}
          onNavigate={(slug) => {
            if (slug) {
              setActiveDocSlug(slug);
              loadDoc(slug);
            } else {
              setIsFlipped(false);
            }
          }}
          headerContent={
            <IconButton onClick={() => setIsFlipped(false)} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
          }
        />
      ) : viewMode === 'lobby' ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => setIsFlipped(false)} sx={{ mr: 1, color: '#64748b' }}><ArrowBackIcon /></IconButton>
            <Typography sx={{ fontWeight: 700, color: '#64748b' }}>Cancel</Typography>
          </Box>
          <WikiStudioDashboard docs={wikiDocs} onStartFresh={handleStartFresh} userName={profile.displayName || profile.uid} />
        </Box>
      ) : (
        <WikiEditor 
          doc={doc}
          editForm={editForm}
          setEditForm={setEditForm}
          loading={loading}
          onSave={handleSave}
          onCancel={() => { if(doc) setViewMode('reader'); else setViewMode('lobby'); }}
          registryHotspots={registryHotspots}
          wikiDocs={wikiDocs}
        />
      )}
    </Paper>
  );

  return (
    <>
      <FlipContainer 
        isFlipped={isFlipped}
        frontContent={FrontContent}
        backContent={BackContent}
      />

      {/* Hotspot Modal */}
      <Dialog open={showHotspotModal} onClose={() => setShowHotspotModal(false)} sx={{ '& .MuiDialog-paper': { bgcolor: '#1e293b', color: '#fff', borderRadius: 4, p: 2, minWidth: 400 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Register New Hotspot</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
            Register a Hotspot ID that a developer has placed in the codebase (e.g., "dashboard-header").
          </Typography>
          <TextField 
            label="Hotspot ID (e.g. trade_btn)" 
            value={newHotspotId} onChange={e => setNewHotspotId(e.target.value)}
            sx={{ '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '& .MuiInputBase-root': { color: '#fff' }, '& .MuiFormLabel-root': { color: 'rgba(255,255,255,0.7)' } }}
          />
          <TextField 
            label="Human Readable Label" 
            value={newHotspotLabel} onChange={e => setNewHotspotLabel(e.target.value)}
            sx={{ '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '& .MuiInputBase-root': { color: '#fff' }, '& .MuiFormLabel-root': { color: 'rgba(255,255,255,0.7)' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHotspotModal(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>Cancel</Button>
          <Button onClick={handleCreateHotspot} variant="contained" sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}>Register</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
