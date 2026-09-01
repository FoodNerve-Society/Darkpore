'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, Button, IconButton, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Avatar, Tooltip, Select, MenuItem
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useSociety } from '@/context/SocietyContext';
import { getAllVisibleWikiDocs, getWikiDoc, createOrUpdateWikiDoc, deleteWikiDoc, WikiBlock, WikiDocInput, getRegistryHotspots, createRegistryHotspot } from '@/lib/actions/wiki';
import { WorkspaceTab } from '@/app/components/studio/WorkspaceContentManager';
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
  
  const [postingAs, setPostingAs] = useState<'personal'|'organization'>('personal');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.organizations?.length > 0 && !selectedOrgId) {
      setSelectedOrgId(profile.organizations[0].id);
    }
  }, [profile, selectedOrgId]);

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

  const workspaceTabs: WorkspaceTab[] = useMemo(() => {
    if (!profile) return [];

    // 1. Personal Tab
    const personalItems = wikiDocs
      .filter((d: any) => !d.authorId || d.authorId === profile.uid)
      .map((d: any) => ({
        id: d.slug,
        title: d.title,
        type: 'article',
        status: d.tags?.includes('STATUS_DRAFT') ? 'draft' : 'published',
        date: d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : 'Recent',
        authorName: profile.displayName || profile.firstName || 'Personal',
        authorAvatar: profile.avatarUrl,
      }));

    const tabs: WorkspaceTab[] = [
      {
        id: 'personal',
        label: 'Personal',
        logoUrl: profile.avatarUrl,
        items: personalItems,
      },
    ];

    // 2. Organization Tabs
    if (profile.organizations && profile.organizations.length > 0) {
      profile.organizations.forEach((org: any) => {
        const orgItems = wikiDocs
          .filter((d: any) => d.authorId === org.id)
          .map((d: any) => ({
            id: d.slug,
            title: d.title,
            type: 'article',
            status: d.tags?.includes('STATUS_DRAFT') ? 'draft' : 'published',
            date: d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : 'Recent',
            authorName: org.name,
            authorAvatar: org.logoUrl,
          }));

        tabs.push({
          id: org.id,
          label: org.name,
          logoUrl: org.logoUrl,
          items: orgItems,
        });
      });
    }

    return tabs;
  }, [wikiDocs, profile]);

  const handleDeleteDoc = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this wiki document? This cannot be undone.')) return;
    const res = await deleteWikiDoc(slug);
    if (res.success) {
      await loadDashboard();
    } else {
      alert('Error deleting document: ' + res.error);
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

      const qsEdit = searchParams.get('edit');
      if (qsEdit) {
        setActiveDocSlug(qsEdit);
        setIsFlipped(true);
        loadDoc(qsEdit).then(() => setViewMode('editor'));
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
    const authorId = postingAs === 'organization' ? (selectedOrgId || profile?.uid) : profile?.uid;
    const res = await createOrUpdateWikiDoc({ ...editForm, authorId: authorId || 'unknown' });
    if (res.success) {
      await loadDoc(editForm.slug);
      setViewMode('reader');
    } else {
      alert("Error saving: " + res.error);
    }
    setLoading(false);
  };

  const handleStartFresh = (type: string, taxonomy: any, templateBlocks: any[] = [], fullPayload?: any) => {
    if (fullPayload) {
      setEditForm({
        ...editForm,
        ...fullPayload,
        slug: fullPayload.slug || `sop-${Date.now()}`,
        title: fullPayload.title || 'Untitled SOP',
        blocks: fullPayload.blocks || templateBlocks,
        tags: fullPayload.tags || ['sop', taxonomy.subcategory].filter(Boolean),
        authorId: postingAs === 'organization' ? (selectedOrgId || profile?.uid) : (profile?.uid || ''),
      });
    } else {
      setEditForm({
        slug: `sop-${Date.now()}`,
        title: 'Untitled SOP',
        category: taxonomy.category || 'operations',
        isPublic: taxonomy.clearance === 'public',
        allowedRoles: taxonomy.clearance === 'internal_staff' ? ['internal_staff'] : taxonomy.clearance === 'admin' ? ['admin'] : ['guest'],
        allowedUsers: [],
        blocks: templateBlocks,
        tags: ['sop', taxonomy.subcategory].filter(Boolean),
        authorId: postingAs === 'organization' ? (selectedOrgId || profile?.uid) : (profile?.uid || ''),
        hotspotId: '',
        parentId: ''
      });
    }
    setViewMode('editor');
  };

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
    if (isAdmin) return true;
    if (doc.isPublic) return true;
    if (doc.allowedRoles.some((r: string) => (userRoles as string[]).includes(r))) return true;
    if (doc.allowedUsers.includes(uid)) return true;
    if (doc.authorId === uid) return true;
    return false;
  };

  // --- Front Content (List) ---
  const FrontContent = (
    <WikiFrontContent 
      wikiDocs={wikiDocs}
      isAdmin={isAdmin}
      currentUserId={profile?.uid}
      onDocSelect={(slug) => {
        setActiveDocSlug(slug);
        setIsFlipped(true);
        setViewMode('reader');
        loadDoc(slug);
      }}
      onEditDoc={(slug) => {
        setActiveDocSlug(slug);
        setIsFlipped(true);
        loadDoc(slug).then(() => setViewMode('editor'));
      }}
      onCreateClick={() => {
        setActiveDocSlug(null);
        setIsFlipped(true);
        setViewMode('lobby');
      }}
    />
  );

  // --- Back Content (Workspace) ---
  const BackContent = (
    <Paper elevation={0} sx={sharedPaperSx}>
      {/* Top Header Bar for Studio view */}
      {viewMode !== 'reader' && (
        <Box sx={{ 
          px: { xs: 2.5, md: 3.5 }, py: 2, 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(0,0,0,0.05)', flexShrink: 0 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Tooltip title={viewMode === 'editor' ? "Back to Studio" : "Back to Playbooks"}>
              <IconButton
                onClick={() => {
                  if (viewMode === 'editor') {
                    if (doc) setViewMode('reader');
                    else setViewMode('lobby');
                  } else {
                    setIsFlipped(false);
                  }
                }}
                sx={{ width: 36, height: 36, bgcolor: 'rgba(0,0,0,0.03)', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' } }}
              >
                <ArrowBackIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ opacity: 0.5 }}>Omni-Wiki</span>
                <span style={{ opacity: 0.5 }}>/</span>
                <span style={{ textTransform: 'capitalize' }}>
                  {viewMode === 'lobby' ? 'Studio' : editForm.title || 'New Playbook'}
                </span>
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Post as Personal">
              <IconButton onClick={() => setPostingAs('personal')} sx={{ bgcolor: postingAs === 'personal' ? 'rgba(0,0,0,0.04)' : 'transparent', width: 36, height: 36, border: postingAs === 'personal' ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent', transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' } }}>
                <Avatar src={profile?.avatarUrl} sx={{ width: 24, height: 24 }} />
              </IconButton>
            </Tooltip>
            {profile?.organizations && profile.organizations.length > 0 && (
              <Tooltip title="Post as Organization">
                <IconButton onClick={() => setPostingAs('organization')} sx={{ bgcolor: postingAs === 'organization' ? 'rgba(0,0,0,0.04)' : 'transparent', width: 36, height: 36, border: postingAs === 'organization' ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent', transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' } }}>
                  <BusinessIcon sx={{ color: postingAs === 'organization' ? '#0f172a' : '#94a3b8', fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}
            {postingAs === 'organization' && profile?.organizations && profile.organizations.length > 0 && (
              <Select size="small" value={selectedOrgId || ''} onChange={(e) => setSelectedOrgId(e.target.value as string)} renderValue={(selected) => { const org = profile.organizations?.find((o: any) => o.id === selected); if (!org) return null; return (<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Avatar src={org.logoUrl} sx={{ width: 20, height: 20 }} /><Typography sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 700, fontSize: '0.85rem' }}>{org.name}</Typography></Box>); }} sx={{ ml: 0.5, height: 36, minWidth: { xs: 60, sm: 140 }, borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.02)', '& .MuiOutlinedInput-notchedOutline': { border: '1px solid rgba(0,0,0,0.08)' }, '&:hover .MuiOutlinedInput-notchedOutline': { border: '1px solid rgba(0,0,0,0.15)' }, '& .MuiSelect-select': { py: 0, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700, fontSize: '0.85rem' } }}>
                {profile.organizations.map((org: any) => (
                  <MenuItem key={org.id} value={org.id} sx={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', gap: 1.5, alignItems: 'center' }}><Avatar src={org.logoUrl} sx={{ width: 20, height: 20 }} />{org.name}</MenuItem>
                ))}
              </Select>
            )}
          </Box>
        </Box>
      )}

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
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => setIsFlipped(false)}
              size="small"
              sx={{
                color: '#475569',
                fontWeight: 800,
                fontSize: '0.82rem',
                textTransform: 'none',
                borderRadius: '10px',
                px: 1.5,
                py: 0.6,
                bgcolor: 'rgba(0,0,0,0.04)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.08)', color: '#0f172a' },
              }}
            >
              ← Back to List
            </Button>
          }
        />
      ) : viewMode === 'lobby' ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <WikiStudioDashboard 
            docs={wikiDocs} 
            workspaceTabs={workspaceTabs}
            onStartFresh={handleStartFresh} 
            onEditDoc={(slug) => {
              setActiveDocSlug(slug);
              loadDoc(slug).then(() => setViewMode('editor'));
            }}
            onDeleteDoc={handleDeleteDoc}
            userName={profile?.displayName || profile?.uid} 
          />
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
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowHotspotModal(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>Cancel</Button>
          <Button onClick={handleCreateHotspot} variant="contained" sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}>Register Hotspot</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
