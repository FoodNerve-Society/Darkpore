'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Button, Chip, IconButton, Paper, TextField, 
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useSociety } from '@/context/SocietyContext';
import { getAllVisibleWikiDocs, getWikiDoc, createOrUpdateWikiDoc, WikiBlock, WikiDocInput, getRegistryHotspots, createRegistryHotspot, deleteRegistryHotspot } from '@/lib/actions/wiki';
import FlipContainer from '../../components/shared/FlipContainer';
import WikiReader from '@/components/wiki/WikiReader';
import WikiStudioDashboard from '../../components/forms/WikiStudioDashboard';

// Icons
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DocIcon from '@mui/icons-material/Description';
import SecurityIcon from '@mui/icons-material/Security';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

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

// Removed PromptBuilderBlock as it is now in WikiReader

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
    slug: '', title: '', category: 'operations', isPublic: false, allowedRoles: [], allowedUsers: [], blocks: [], tags: [], authorId: '', hotspotId: ''
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
        // Pre-fill
        setNewHotspotId(qsHotspot);
        setNewHotspotLabel(qsHotspot.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
        setShowHotspotModal(true);
        // Clear the param so we don't reopen it endlessly on re-renders
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
           slug: '', title: '', category: 'operations', isPublic: false, allowedRoles: ['internal_staff'], allowedUsers: [], blocks: [], tags: [], authorId: profile?.uid || '', hotspotId: ''
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
        hotspotId: res.data.hotspotId || ''
      });
      setViewMode('reader'); // Default to reader as requested
    } else {
      setDoc(null);
      setEditForm({
        slug: slug, title: '', category: 'operations', isPublic: false, allowedRoles: ['internal_staff'], allowedUsers: [], blocks: [], tags: [], authorId: profile?.uid || '', hotspotId: ''
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

  if (!profile) return null;

  const userRoles = profile?.roles || ['guest'];
  const isAdmin = profile?.isAdmin || false;
  const uid = profile?.uid || 'guest';

  // Helper to check if current user can see a block
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

  // --- Editor Helpers ---
  const addBlock = () => {
    setEditForm({
      ...editForm,
      blocks: [...editForm.blocks, { id: `block-${Date.now()}`, type: 'TEXT', visibility: 'public', content: '', variables: [] }]
    });
  };

  const updateBlock = (index: number, updates: Partial<WikiBlock>) => {
    const newBlocks = [...editForm.blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    setEditForm({ ...editForm, blocks: newBlocks });
  };

  const removeBlock = (index: number) => {
    const newBlocks = [...editForm.blocks];
    newBlocks.splice(index, 1);
    setEditForm({ ...editForm, blocks: newBlocks });
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
      isPublic: taxonomy.clearance === 'public',
      allowedRoles: taxonomy.clearance === 'public' ? [] : [taxonomy.clearance],
      blocks: templateBlocks
    });
    setViewMode('editor');
  };

  // ========================================================================
  // FRONT CONTENT: Dashboard
  // ========================================================================
  const FrontContent = (
    <Paper elevation={0} sx={{ ...sharedPaperSx, bgcolor: '#f8fafc', p: 0 }}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        {/* HEADER */}
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

        {/* DOCUMENTS LIST */}
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

        {/* FLOATING BACK BUTTON */}
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
    <Paper elevation={0} sx={{ ...sharedPaperSx, bgcolor: viewMode === 'editor' ? '#0f172a' : '#ffffff', p: 0 }}>
      {viewMode === 'reader' ? (
        // --- READER ---
        <WikiReader 
          doc={doc}
          loading={loading}
          isAdmin={isAdmin}
          hasAccess={hasAccess()}
          canSeeBlock={canSeeBlock}
          onEdit={() => setViewMode('editor')}
          headerContent={
            <IconButton onClick={() => setIsFlipped(false)} sx={{ mr: 1 }}><ArrowBackIcon /></IconButton>
          }
        />
      ) : viewMode === 'lobby' ? (
        // --- LOBBY ---
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => setIsFlipped(false)} sx={{ mr: 1, color: '#64748b' }}><ArrowBackIcon /></IconButton>
            <Typography sx={{ fontWeight: 700, color: '#64748b' }}>Cancel</Typography>
          </Box>
          <WikiStudioDashboard docs={wikiDocs} onStartFresh={handleStartFresh} userName={profile.displayName || profile.uid} />
        </Box>
      ) : (
        // --- EDITOR ---
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', color: '#fff' }}>
           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={() => { if(doc) setViewMode('reader'); else setViewMode('lobby'); }} sx={{ mr: 1, color: '#fff' }}><ArrowBackIcon /></IconButton>
              <EditIcon sx={{ color: '#60a5fa' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                Wiki Studio {loading && <span style={{ opacity: 0.5, fontSize: '0.8rem', marginLeft: 8 }}>Saving...</span>}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button 
                onClick={handleSave} 
                disabled={loading} 
                variant="contained" 
                startIcon={<SaveIcon />}
                sx={{ bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' }, borderRadius: '20px', fontWeight: 800 }}
              >
                Save Changes
              </Button>
            </Box>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 6 }, display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '900px', mx: 'auto', width: '100%' }}>
             {/* Settings Panel */}
             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, bgcolor: 'rgba(255,255,255,0.03)', p: 4, borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Document Settings</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  <TextField 
                    label="Title" variant="outlined" 
                    value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})}
                    sx={{ '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '& .MuiInputBase-root': { color: '#fff' }, '& .MuiFormLabel-root': { color: 'rgba(255,255,255,0.7)' } }}
                  />
                  <TextField 
                    label="Unique Slug" variant="outlined" 
                    value={editForm.slug} onChange={e => setEditForm({...editForm, slug: e.target.value})}
                    sx={{ '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '& .MuiInputBase-root': { color: '#fff' }, '& .MuiFormLabel-root': { color: 'rgba(255,255,255,0.7)' } }}
                  />
                  <FormControl sx={{ '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } }}>
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Category</InputLabel>
                    <Select 
                      value={editForm.category} label="Category"
                      onChange={e => setEditForm({...editForm, category: e.target.value as string})}
                      sx={{ color: '#fff' }}
                    >
                      <MenuItem value="operations">Operations</MenuItem>
                      <MenuItem value="playbooks">Playbooks</MenuItem>
                      <MenuItem value="academy">Academy</MenuItem>
                    </Select>
                  </FormControl>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControl sx={{ '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } }}>
                      <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Link to UI Hotspot</InputLabel>
                      <Select 
                        value={editForm.hotspotId || ''} label="Link to UI Hotspot"
                        onChange={e => setEditForm({...editForm, hotspotId: e.target.value as string})}
                        sx={{ color: '#fff' }}
                      >
                        <MenuItem value=""><em>None (Unlinked)</em></MenuItem>
                        {registryHotspots.map(h => (
                          <MenuItem key={h.id} value={h.id}>{h.label} ({h.id})</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button 
                      size="small" 
                      onClick={() => setShowHotspotModal(true)} 
                      sx={{ alignSelf: 'flex-start', color: '#60a5fa', fontSize: '0.75rem', p: 0 }}
                    >
                      + Register New Hotspot
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel 
                      control={<Switch checked={editForm.isPublic} onChange={e => setEditForm({...editForm, isPublic: e.target.checked})} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#3b82f6' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#3b82f6' } }} />} 
                      label="Is Public Document?" 
                      sx={{ color: 'rgba(255,255,255,0.8)' }}
                    />
                  </Box>
                </Box>
             </Box>

             <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

             {/* Blocks Editor */}
             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Content Blocks</Typography>
                <Button startIcon={<AddIcon />} variant="outlined" onClick={addBlock} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', borderRadius: '20px', fontWeight: 700 }}>
                  Add Block
                </Button>
             </Box>

             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
               {editForm.blocks.map((block, index) => (
                 <Box key={block.id} sx={{ bgcolor: 'rgba(255,255,255,0.03)', p: 4, borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 800 }}>Block {index + 1}</Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => moveBlock(index, 'up')} sx={{ color: 'rgba(255,255,255,0.5)' }}><ArrowUpwardIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => moveBlock(index, 'down')} sx={{ color: 'rgba(255,255,255,0.5)' }}><ArrowDownwardIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => removeBlock(index)} sx={{ color: '#ef4444' }}><DeleteIcon fontSize="small" /></IconButton>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
                      <FormControl sx={{ '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } }}>
                        <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Type</InputLabel>
                        <Select value={block.type} label="Type" onChange={e => updateBlock(index, { type: e.target.value as any })} sx={{ color: '#fff' }}>
                          <MenuItem value="TEXT">Text</MenuItem>
                          <MenuItem value="PROMPT_BUILDER">Prompt Builder</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl sx={{ '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } }}>
                        <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Visibility</InputLabel>
                        <Select value={block.visibility} label="Visibility" onChange={e => updateBlock(index, { visibility: e.target.value as any })} sx={{ color: '#fff' }}>
                          <MenuItem value="public">Public</MenuItem>
                          <MenuItem value="internal_staff">Internal Staff</MenuItem>
                          <MenuItem value="admin">Admin Only</MenuItem>
                          <MenuItem value="whitelist_only">Whitelist Only</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    {block.type === 'PROMPT_BUILDER' && (
                      <Box sx={{ mb: 3, bgcolor: 'rgba(0,0,0,0.2)', p: 3, borderRadius: '16px' }}>
                        <Typography variant="subtitle2" sx={{ color: '#60a5fa', mb: 1, display: 'block', fontWeight: 700 }}>Prompt Variables</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 3, display: 'block' }}>
                          Add curly braces {"{{variable_name}}"} in your prompt, then define them below.
                        </Typography>
                        
                        {block.variables?.map((v, vIndex) => (
                          <Box key={vIndex} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField 
                              size="small" label="Variable Name (no braces)" value={v.name} 
                              onChange={e => {
                                const newVars = [...(block.variables || [])];
                                newVars[vIndex].name = e.target.value;
                                updateBlock(index, { variables: newVars });
                              }}
                              sx={{ flex: 1, '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '& .MuiInputBase-root': { color: '#fff' }, '& .MuiFormLabel-root': { color: 'rgba(255,255,255,0.5)' } }}
                            />
                            <TextField 
                              size="small" label="Input Label" value={v.label} 
                              onChange={e => {
                                const newVars = [...(block.variables || [])];
                                newVars[vIndex].label = e.target.value;
                                updateBlock(index, { variables: newVars });
                              }}
                              sx={{ flex: 1, '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '& .MuiInputBase-root': { color: '#fff' }, '& .MuiFormLabel-root': { color: 'rgba(255,255,255,0.5)' } }}
                            />
                            <IconButton 
                              color="error" 
                              onClick={() => {
                                const newVars = [...(block.variables || [])];
                                newVars.splice(vIndex, 1);
                                updateBlock(index, { variables: newVars });
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
                            updateBlock(index, { variables: newVars });
                          }}
                          sx={{ color: '#60a5fa', borderColor: 'rgba(96, 165, 250, 0.3)' }}
                        >
                          + Add Variable
                        </Button>
                      </Box>
                    )}

                    <TextField 
                      multiline fullWidth minRows={6}
                      label={block.type === 'PROMPT_BUILDER' ? "Prompt Template" : "Content (Markdown)"}
                      value={block.content}
                      onChange={e => updateBlock(index, { content: e.target.value })}
                      sx={{ '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '& .MuiInputBase-root': { color: '#fff', fontFamily: 'monospace' }, '& .MuiFormLabel-root': { color: 'rgba(255,255,255,0.7)' } }}
                    />
                 </Box>
               ))}
               {editForm.blocks.length === 0 && (
                 <Typography sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', my: 6, fontStyle: 'italic' }}>
                   No blocks added yet. Click "Add Block" to start.
                 </Typography>
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
    </>
  );
}
