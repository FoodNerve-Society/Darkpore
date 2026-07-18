'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Box, Container, Typography, Button, Chip, IconButton, Paper, TextField, 
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Collapse, alpha
} from '@mui/material';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useSociety } from '@/context/SocietyContext';
import { getAllVisibleWikiDocs, getWikiDoc, createOrUpdateWikiDoc, WikiBlock, WikiDocInput, getRegistryHotspots, createRegistryHotspot } from '@/lib/actions/wiki';
import FlipContainer from '../../components/shared/FlipContainer';
import WikiReader from '@/components/wiki/WikiReader';
import WikiStudioDashboard from '../../components/forms/WikiStudioDashboard';

// DND Kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Icons
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CloseIcon from '@mui/icons-material/Close';

// ── Shared Paper Styles ──────────────────────────────────
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

// ----------------------------------------------------------------------
// SORTABLE WRAPPER
// ----------------------------------------------------------------------
function SortableBlockWrapper({ id, reorderUnlocked, children }: { id: string, reorderUnlocked: boolean, children: (attributes: any, listeners: any, setNodeRef: any, style: any, isDragging: boolean) => React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !reorderUnlocked });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    position: 'relative' as const,
  };

  return <>{children(attributes, listeners, setNodeRef, style, isDragging)}</>;
}


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

  // Editor UI State
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [reorderUnlocked, setReorderUnlocked] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isActionItemsMinimized, setIsActionItemsMinimized] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
        router.replace(`/profile/wiki`);
      }
    });
  }, [profile, searchParams]);

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

  // --- Block Builder Helpers ---
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = editForm.blocks.findIndex(item => item.id === active.id);
      const newIndex = editForm.blocks.findIndex(item => item.id === over.id);
      setEditForm({ ...editForm, blocks: arrayMove(editForm.blocks, oldIndex, newIndex) });
    }
  }, [editForm]);

  const addBlock = () => {
    const newId = `block-${Date.now()}`;
    setEditForm({
      ...editForm,
      blocks: [...editForm.blocks, { id: newId, type: 'TEXT', visibility: 'public', content: '', variables: [] }]
    });
    setExpandedBlockId(newId);
  };

  const updateBlock = (id: string, updates: Partial<WikiBlock>) => {
    const newBlocks = editForm.blocks.map(b => b.id === id ? { ...b, ...updates } : b);
    setEditForm({ ...editForm, blocks: newBlocks });
  };

  const removeBlock = (id: string) => {
    const newBlocks = editForm.blocks.filter(b => b.id !== id);
    setEditForm({ ...editForm, blocks: newBlocks });
    if (expandedBlockId === id) setExpandedBlockId(null);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === editForm.blocks.length - 1) return;
    
    const newBlocks = [...editForm.blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;
    setEditForm({ ...editForm, blocks: newBlocks });
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
    if (templateBlocks.length > 0) {
      setExpandedBlockId(templateBlocks[0].id);
    }
    setViewMode('editor');
  };

  // --- Completion Stats ---
  const getBlockFillStats = (b: WikiBlock) => {
    let total = 1;
    let filled = 0;
    if (b.type === 'TEXT') {
      if (b.content && b.content.trim().length > 0) filled = 1;
    } else if (b.type === 'PROMPT_BUILDER') {
      total = 1 + (b.variables?.length || 0);
      if (b.content && b.content.trim().length > 0) filled++;
      b.variables?.forEach(v => { if (v.name && v.label) filled++; });
    }
    return { filled, total, percent: Math.round((filled / total) * 100) };
  };

  const actionItems = useMemo(() => {
    const items: Array<{ id: string, text: string }> = [];
    if (viewMode !== 'editor') return items;
    
    if (!editForm.title?.trim()) items.push({ id: 'doc-title', text: 'Document Title is missing' });
    if (!editForm.slug?.trim()) items.push({ id: 'doc-slug', text: 'Document Slug is missing' });
    
    editForm.blocks.forEach((b, index) => {
      const stats = getBlockFillStats(b);
      if (stats.filled < stats.total) {
        items.push({ id: b.id, text: `Block ${index + 1} (${b.type}) is incomplete` });
      }
    });
    
    return items;
  }, [editForm, viewMode]);

  if (!profile) return null;

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

  // ========================================================================
  // FRONT CONTENT: Dashboard
  // ========================================================================
  const FrontContent = (
    <Paper elevation={0} sx={{ ...sharedPaperSx, bgcolor: '#f8fafc', p: 0 }}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#0f172a', letterSpacing: '-0.02em', mb: 1 }}>
              Omni-Wiki Hub
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: '1.1rem' }}>
              Internal Playbooks, SOPs, and AI Context Libraries
            </Typography>
          </Box>
          {profile.isAdmin && (
            <Button 
              variant="contained" 
              onClick={() => {
                setActiveDocSlug(null);
                setIsFlipped(true);
              }}
              sx={{ 
                bgcolor: '#10b981', color: '#fff', borderRadius: '14px', py: 1.5, px: 3, fontWeight: 800,
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
                '&:hover': { bgcolor: '#059669', transform: 'translateY(-2px)' }
              }}
            >
              + Create Document
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
          {wikiDocs.length === 0 ? (
            <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 10, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '24px' }}>
               <Typography sx={{ color: '#94a3b8', fontSize: '1.1rem', fontStyle: 'italic' }}>
                 No playbooks available for your clearance level.
               </Typography>
            </Box>
          ) : (
            wikiDocs.map(item => (
              <Box
                key={item.id}
                onClick={() => {
                  setActiveDocSlug(item.slug);
                  setIsFlipped(true);
                }}
                sx={{
                  bgcolor: '#0f172a',
                  borderRadius: '24px',
                  p: 3,
                  display: 'flex', alignItems: 'center', gap: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 12px 32px rgba(15,23,42,0.15)',
                  '&:hover': {
                     transform: 'translateY(-4px)',
                     boxShadow: '0 20px 40px rgba(15,23,42,0.25)',
                     bgcolor: '#1e293b',
                  }
                }}
              >
                <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '16px', color: '#10b981' }}>
                  <MenuBookIcon sx={{ fontSize: 36 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>{item.title}</Typography>
                    {item.isPublic ? (
                       <Chip label="Public" size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 800, bgcolor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }} />
                    ) : (
                       <Chip label="Restricted" size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 800, bgcolor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }} />
                    )}
                  </Box>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                    Category: <span style={{ textTransform: 'capitalize' }}>{item.category}</span>
                  </Typography>
                </Box>
                <ArrowForwardIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 28 }} />
              </Box>
            ))
          )}
        </Box>

        <Box sx={{ position: 'fixed', bottom: { xs: 24, md: 32 }, left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
          <Button
            onClick={() => router.push(`/profile`)}
            startIcon={<ArrowBackIcon />}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              color: '#0f2414',
              fontWeight: 800,
              fontSize: '0.95rem',
              px: 4,
              py: 1.2,
              borderRadius: '100px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid rgba(255,255,255,0.4)',
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#fff',
                transform: 'scale(1.02)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              },
              transition: 'all 0.2s',
            }}
          >
            Back to Profile
          </Button>
        </Box>
      </Container>
    </Paper>
  );

  // ========================================================================
  // BACK CONTENT: Reader / Editor
  // ========================================================================
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
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', color: '#0f172a', position: 'relative' }}>
          
          {/* Editor Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: { xs: 2, md: 3 }, borderBottom: '1px solid rgba(0,0,0,0.08)', bgcolor: '#fff', zIndex: 10 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={() => { if(doc) setViewMode('reader'); else setViewMode('lobby'); }} sx={{ mr: 1, color: '#64748b' }}><ArrowBackIcon /></IconButton>
              <EditIcon sx={{ color: '#10b981' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#0f172a' }}>
                Studio Builder {loading && <span style={{ opacity: 0.5, fontSize: '0.8rem', marginLeft: 8 }}>Saving...</span>}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button 
                onClick={() => setShowPreviewModal(true)}
                variant="outlined"
                startIcon={<VisibilityIcon />}
                sx={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)', borderRadius: '20px', fontWeight: 800, display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Preview
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={loading} 
                variant="contained" 
                startIcon={<SaveIcon />}
                sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, borderRadius: '20px', fontWeight: 800, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
              >
                Save
              </Button>
            </Box>
          </Box>

          <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            
            {/* Main Editor Column */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 4, md: 6 }, display: 'flex', flexDirection: 'column', gap: 4, bgcolor: '#f8fafc' }}>
               
               {/* Document Identity Block */}
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, bgcolor: '#ffffff', p: 4, borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 8px 32px rgba(0,0,0,0.03)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <InfoOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Document Identity</Typography>
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                    <TextField 
                      label="Title" variant="outlined" 
                      value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})}
                      sx={{ '& fieldset': { borderColor: '#cbd5e1' }, '& .MuiInputBase-root': { color: '#0f172a', bgcolor: '#fff' }, '& .MuiFormLabel-root': { color: '#64748b' } }}
                    />
                    <TextField 
                      label="Unique Slug" variant="outlined" 
                      value={editForm.slug} onChange={e => setEditForm({...editForm, slug: e.target.value})}
                      sx={{ '& fieldset': { borderColor: '#cbd5e1' }, '& .MuiInputBase-root': { color: '#0f172a', bgcolor: '#fff' }, '& .MuiFormLabel-root': { color: '#64748b' } }}
                    />
                    <FormControl sx={{ '& fieldset': { borderColor: '#cbd5e1' } }}>
                      <InputLabel sx={{ color: '#64748b' }}>Domain (Category)</InputLabel>
                      <Select 
                        value={editForm.category} label="Domain (Category)"
                        onChange={e => setEditForm({...editForm, category: e.target.value as string, tags: []})}
                        sx={{ color: '#0f172a', bgcolor: '#fff' }}
                      >
                        {WIKI_DOMAINS.map(domain => (
                          <MenuItem key={domain.id} value={domain.id}>{domain.title}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl sx={{ '& fieldset': { borderColor: '#cbd5e1' } }}>
                      <InputLabel sx={{ color: '#64748b' }}>Tag (Subcategory)</InputLabel>
                      <Select 
                        value={editForm.tags[0] || ''} label="Tag (Subcategory)"
                        onChange={e => setEditForm({...editForm, tags: [e.target.value as string]})}
                        sx={{ color: '#0f172a', bgcolor: '#fff' }}
                      >
                        {WIKI_DOMAINS.find(d => d.id === editForm.category)?.subcategories.map(sub => (
                          <MenuItem key={sub.id} value={sub.id}>{sub.title}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl sx={{ '& fieldset': { borderColor: '#cbd5e1' } }}>
                      <InputLabel sx={{ color: '#64748b' }}>Link to UI Hotspot</InputLabel>
                      <Select 
                        value={editForm.hotspotId || ''} label="Link to UI Hotspot"
                        onChange={e => setEditForm({...editForm, hotspotId: e.target.value as string})}
                        sx={{ color: '#0f172a', bgcolor: '#fff' }}
                      >
                        <MenuItem value=""><em>None (Unlinked)</em></MenuItem>
                        {registryHotspots
                          .filter(h => h.category === editForm.category && h.subcategory === editForm.tags[0])
                          .map(h => (
                          <MenuItem key={h.id} value={h.id}>{h.label} ({h.id})</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl sx={{ '& fieldset': { borderColor: '#cbd5e1' } }}>
                      <InputLabel sx={{ color: '#64748b' }}>Parent Document (Optional)</InputLabel>
                      <Select 
                        value={editForm.parentId || ''} label="Parent Document (Optional)"
                        onChange={e => setEditForm({...editForm, parentId: e.target.value as string})}
                        sx={{ color: '#0f172a', bgcolor: '#fff' }}
                      >
                        <MenuItem value=""><em>None (Top Level)</em></MenuItem>
                        {wikiDocs
                          .filter(d => d.id !== doc?.id) // Prevent self-nesting
                          .map(d => (
                          <MenuItem key={d.id} value={d.id}>{d.title}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormControlLabel 
                        control={<Switch checked={editForm.isPublic} onChange={e => setEditForm({...editForm, isPublic: e.target.checked})} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#10b981' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#10b981' } }} />} 
                        label={<Typography sx={{ fontWeight: 600 }}>Is Public Document?</Typography>} 
                        sx={{ color: '#0f172a' }}
                      />
                    </Box>
                  </Box>
               </Box>

               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 2 }}>
                 <Box>
                   <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>Architecture Blocks</Typography>
                   <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>Build your step-by-step SOP or context document.</Typography>
                 </Box>
                 <Box sx={{ display: 'flex', gap: 2 }}>
                   <Button 
                     size="small" 
                     onClick={() => setReorderUnlocked(!reorderUnlocked)} 
                     startIcon={<SwapHorizIcon />}
                     sx={{ color: reorderUnlocked ? '#ef4444' : '#64748b', bgcolor: reorderUnlocked ? 'rgba(239, 68, 68, 0.1)' : 'transparent', fontWeight: 700, borderRadius: 2 }}
                   >
                     {reorderUnlocked ? 'Lock Reorder' : 'Unlock Reorder'}
                   </Button>
                   <Button startIcon={<AddIcon />} variant="contained" onClick={addBlock} sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, borderRadius: '16px', fontWeight: 800, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                     Add Block
                   </Button>
                 </Box>
               </Box>

               {/* Sortable Blocks */}
               <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                 <SortableContext items={editForm.blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                     {editForm.blocks.map((block, index) => {
                       const isExpanded = expandedBlockId === block.id;
                       const stats = getBlockFillStats(block);
                       const isComplete = stats.filled === stats.total;

                       return (
                         <SortableBlockWrapper key={block.id} id={block.id} reorderUnlocked={reorderUnlocked}>
                           {(attributes, listeners, setNodeRef, style, isDragging) => (
                             <Box ref={setNodeRef} style={style}>
                               <Paper elevation={0} sx={{
                                 borderRadius: '24px', overflow: 'hidden', border: isExpanded ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                 boxShadow: isExpanded ? '0 12px 40px rgba(59, 130, 246, 0.15)' : '0 4px 20px rgba(0,0,0,0.02)',
                                 transition: 'all 0.3s ease', bgcolor: '#fff', opacity: isDragging ? 0.8 : 1
                               }}>
                                 {/* Card Header (Always visible) */}
                                 <Box 
                                   onClick={() => !reorderUnlocked && setExpandedBlockId(isExpanded ? null : block.id)}
                                   sx={{ 
                                     p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                                     cursor: reorderUnlocked ? 'default' : 'pointer', bgcolor: isExpanded ? '#f8fafc' : '#fff',
                                     borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                                     '&:hover': { bgcolor: !reorderUnlocked ? '#f8fafc' : undefined }
                                   }}
                                 >
                                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                     {reorderUnlocked && (
                                       <Box {...attributes} {...listeners} sx={{ cursor: 'grab', color: '#94a3b8', display: 'flex' }}>
                                         <DragIndicatorIcon />
                                       </Box>
                                     )}
                                     
                                     {/* Progress Indicator */}
                                     <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                       {isComplete ? (
                                         <CheckCircleIcon sx={{ color: '#10b981', fontSize: 24 }} />
                                       ) : (
                                         <RadioButtonUncheckedIcon sx={{ color: '#cbd5e1', fontSize: 24 }} />
                                       )}
                                     </Box>

                                     <Box>
                                       <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>
                                         {block.type === 'PROMPT_BUILDER' ? 'Prompt Builder' : 'Text Block'}
                                       </Typography>
                                       <Typography sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                                         Step {index + 1}
                                       </Typography>
                                     </Box>
                                   </Box>

                                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                     {!reorderUnlocked && (
                                       <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }} sx={{ color: '#ef4444' }}>
                                         <DeleteIcon fontSize="small" />
                                       </IconButton>
                                     )}
                                     <IconButton size="small" sx={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                                       <ExpandMoreIcon />
                                     </IconButton>
                                   </Box>
                                 </Box>

                                 {/* Expandable Content */}
                                 <Collapse in={isExpanded}>
                                   <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                                        <FormControl sx={{ '& fieldset': { borderColor: '#cbd5e1' } }}>
                                          <InputLabel sx={{ color: '#64748b' }}>Type</InputLabel>
                                          <Select value={block.type} label="Type" onChange={e => updateBlock(block.id, { type: e.target.value as any })} sx={{ color: '#0f172a' }}>
                                            <MenuItem value="TEXT">Text Markdown</MenuItem>
                                            <MenuItem value="PROMPT_BUILDER">Prompt Builder</MenuItem>
                                          </Select>
                                        </FormControl>
                                        <FormControl sx={{ '& fieldset': { borderColor: '#cbd5e1' } }}>
                                          <InputLabel sx={{ color: '#64748b' }}>Visibility</InputLabel>
                                          <Select value={block.visibility} label="Visibility" onChange={e => updateBlock(block.id, { visibility: e.target.value as any })} sx={{ color: '#0f172a' }}>
                                            <MenuItem value="public">Public</MenuItem>
                                            <MenuItem value="internal_staff">Internal Staff</MenuItem>
                                            <MenuItem value="admin">Admin Only</MenuItem>
                                            <MenuItem value="whitelist_only">Whitelist Only</MenuItem>
                                          </Select>
                                        </FormControl>
                                      </Box>

                                      {block.type === 'PROMPT_BUILDER' && (
                                        <Box sx={{ bgcolor: '#f1f5f9', p: 3, borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                                          <Typography variant="subtitle2" sx={{ color: '#3b82f6', mb: 1, display: 'block', fontWeight: 800 }}>Prompt Variables</Typography>
                                          <Typography variant="caption" sx={{ color: '#64748b', mb: 3, display: 'block' }}>
                                            Add curly braces {"{{variable_name}}"} in your prompt, then define them below.
                                          </Typography>
                                          
                                          {(block.variables || []).map((v, vIndex) => (
                                            <Box key={vIndex} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                              <TextField 
                                                size="small" label="Variable Name (no braces)" value={v.name} 
                                                onChange={e => {
                                                  const newVars = [...(block.variables || [])];
                                                  newVars[vIndex].name = e.target.value;
                                                  updateBlock(block.id, { variables: newVars });
                                                }}
                                                sx={{ flex: 1, '& fieldset': { borderColor: '#cbd5e1' }, '& .MuiInputBase-root': { color: '#0f172a', bgcolor: '#fff' }, '& .MuiFormLabel-root': { color: '#64748b' } }}
                                              />
                                              <TextField 
                                                size="small" label="Input Label" value={v.label} 
                                                onChange={e => {
                                                  const newVars = [...(block.variables || [])];
                                                  newVars[vIndex].label = e.target.value;
                                                  updateBlock(block.id, { variables: newVars });
                                                }}
                                                sx={{ flex: 1, '& fieldset': { borderColor: '#cbd5e1' }, '& .MuiInputBase-root': { color: '#0f172a', bgcolor: '#fff' }, '& .MuiFormLabel-root': { color: '#64748b' } }}
                                              />
                                              <IconButton 
                                                color="error" 
                                                onClick={() => {
                                                  const newVars = [...(block.variables || [])];
                                                  newVars.splice(vIndex, 1);
                                                  updateBlock(block.id, { variables: newVars });
                                                }}
                                              >
                                                <DeleteIcon />
                                              </IconButton>
                                            </Box>
                                          ))}
                                          <Button 
                                            size="small" 
                                            variant="outlined" 
                                            onClick={() => {
                                              const newVars = [...(block.variables || []), { name: 'new_var', label: 'New Variable' }];
                                              updateBlock(block.id, { variables: newVars });
                                            }}
                                            sx={{ color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.3)', bgcolor: '#fff', borderRadius: 2, fontWeight: 700 }}
                                          >
                                            + Add Variable
                                          </Button>
                                        </Box>
                                      )}

                                      <TextField 
                                        multiline fullWidth minRows={6}
                                        label={block.type === 'PROMPT_BUILDER' ? "Prompt Template" : "Content (Markdown Supported)"}
                                        value={block.content}
                                        onChange={e => updateBlock(block.id, { content: e.target.value })}
                                        sx={{ '& fieldset': { borderColor: '#cbd5e1' }, '& .MuiInputBase-root': { color: '#0f172a', fontFamily: 'monospace', bgcolor: '#f8fafc' }, '& .MuiFormLabel-root': { color: '#64748b' } }}
                                      />
                                   </Box>
                                 </Collapse>
                               </Paper>
                             </Box>
                           )}
                         </SortableBlockWrapper>
                       );
                     })}
                     
                     {editForm.blocks.length === 0 && (
                       <Typography sx={{ color: '#94a3b8', textAlign: 'center', my: 6, fontStyle: 'italic' }}>
                         No blocks added yet. Click "Add Block" to start building your template.
                       </Typography>
                     )}
                   </Box>
                 </SortableContext>
               </DndContext>
            </Box>

            {/* Action Items Drawer */}
            <Box sx={{ 
              width: isActionItemsMinimized ? 60 : 320, 
              borderLeft: '1px solid rgba(0,0,0,0.08)', bgcolor: '#ffffff',
              transition: 'width 0.3s ease', display: 'flex', flexDirection: 'column' 
            }}>
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: isActionItemsMinimized ? 'center' : 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                {!isActionItemsMinimized && (
                  <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Action Items
                  </Typography>
                )}
                <IconButton size="small" onClick={() => setIsActionItemsMinimized(!isActionItemsMinimized)} sx={{ color: '#64748b' }}>
                  {isActionItemsMinimized ? <KeyboardArrowRightIcon sx={{ transform: 'rotate(180deg)' }} /> : <KeyboardArrowRightIcon />}
                </IconButton>
              </Box>

              {!isActionItemsMinimized && (
                <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Missing Elements</Typography>
                    <Chip label={actionItems.length} size="small" sx={{ bgcolor: actionItems.length > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: actionItems.length > 0 ? '#ef4444' : '#10b981', fontWeight: 800 }} />
                  </Box>

                  {actionItems.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <CheckCircleIcon sx={{ color: '#10b981', fontSize: 32, mb: 1 }} />
                      <Typography sx={{ color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>All Good!</Typography>
                      <Typography sx={{ color: '#64748b', fontSize: '0.8rem', mt: 0.5 }}>Your document is fully configured.</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {actionItems.map((item) => (
                        <Box key={item.id} sx={{ p: 1.5, bgcolor: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ef4444', mt: 1, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 500, lineHeight: 1.4 }}>{item.text}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </Box>

          </Box>
        </Box>
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
      <Dialog open={showHotspotModal} onClose={() => setShowHotspotModal(false)} PaperProps={{ sx: { bgcolor: '#1e293b', color: '#fff', borderRadius: 4, p: 2, minWidth: 400 } }}>
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

      {/* Live Preview Modal */}
      <Dialog 
        open={showPreviewModal} 
        onClose={() => setShowPreviewModal(false)} 
        maxWidth="lg" 
        fullWidth 
        PaperProps={{ sx: { height: '90vh', borderRadius: '24px', overflow: 'hidden', bgcolor: '#f8fafc' } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid rgba(0,0,0,0.05)', bgcolor: '#fff', zIndex: 10 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VisibilityIcon sx={{ color: '#10b981' }} />
            <Typography sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Live Reader Preview</Typography>
          </Box>
          <IconButton onClick={() => setShowPreviewModal(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <WikiReader 
            doc={editForm} 
            loading={false} 
            isAdmin={true} 
            hasAccess={true} 
            canSeeBlock={() => true} 
            onEdit={() => setShowPreviewModal(false)} 
            onNavigate={() => {}} 
          />
        </Box>
      </Dialog>
    </>
  );
}
