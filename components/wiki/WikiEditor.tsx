'use client';

import React, { useState, useMemo } from 'react';
import { 
  Box, Typography, Button, IconButton, TextField, 
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  Dialog, Chip, DialogTitle, DialogContent, DialogActions, Collapse, Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CloseIcon from '@mui/icons-material/Close';

import WikiBlockBuilder from './WikiBlockBuilder';
import WikiReader from './WikiReader';

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

export default function WikiEditor({
  doc,
  editForm,
  setEditForm,
  loading,
  onSave,
  onCancel,
  registryHotspots,
  wikiDocs,
}: {
  doc: any;
  editForm: any;
  setEditForm: (form: any) => void;
  loading: boolean;
  onSave: () => void;
  onCancel: () => void;
  registryHotspots: any[];
  wikiDocs: any[];
}) {
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [reorderUnlocked, setReorderUnlocked] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isActionItemsMinimized, setIsActionItemsMinimized] = useState(false);
  const [identityExpanded, setIdentityExpanded] = useState(true);

  const getBlockFillStats = (b: any) => {
    let total = 1;
    let filled = 0;
    if (b.type === 'TEXT') {
      if (b.content && b.content.trim().length > 0) filled = 1;
    } else if (b.type === 'PROMPT_BUILDER') {
      total = 1 + (b.variables?.length || 0);
      if (b.content && b.content.trim().length > 0) filled++;
      b.variables?.forEach((v: any) => { if (v.name && v.label) filled++; });
    } else if (b.type === 'HEADER') {
      if (b.content && b.content.trim().length > 0) filled = 1;
    } else if (b.type === 'CALLOUT') {
      if (b.content && b.content.trim().length > 0) filled = 1;
    } else if (b.type === 'CODE_SNIPPET') {
      total = 2;
      if (b.codeLanguage && b.codeLanguage.trim().length > 0) filled++;
      if (b.content && b.content.trim().length > 0) filled++;
    } else if (b.type === 'CHECKLIST') {
      total = Math.max(1, b.checklistItems?.length || 1);
      if (b.checklistItems && b.checklistItems.length > 0) {
        filled = b.checklistItems.filter((i: any) => i.text.trim().length > 0).length;
      }
    } else if (b.type === 'MEDIA') {
      if (b.mediaUrl || b.mediaFile) filled = 1;
    }
    return { filled, total, percent: Math.round((filled / total) * 100) };
  };

  const actionItems = useMemo(() => {
    const items: Array<{ id: string, text: string }> = [];
    
    if (!editForm.title?.trim()) items.push({ id: 'doc-title', text: 'Document Title is missing' });
    if (!editForm.slug?.trim()) items.push({ id: 'doc-slug', text: 'Document Slug is missing' });
    
    editForm.blocks.forEach((b: any, index: number) => {
      const stats = getBlockFillStats(b);
      if (stats.filled < stats.total) {
        items.push({ id: b.id, text: `Block ${index + 1} (${b.type}) is incomplete` });
      }
    });
    
    return items;
  }, [editForm]);

  const addBlock = () => {
    const newId = `block-${Date.now()}`;
    setEditForm({
      ...editForm,
      blocks: [...editForm.blocks, { id: newId, type: 'TEXT', visibility: 'public', content: '', variables: [] }]
    });
    setExpandedBlockId(newId);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', color: '#0f172a', position: 'relative' }}>
      
      {/* Editor Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: { xs: 2, md: 3 }, borderBottom: '1px solid rgba(0,0,0,0.08)', bgcolor: '#fff', zIndex: 10 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={onCancel} sx={{ mr: 1, color: '#64748b' }}><ArrowBackIcon /></IconButton>
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
            onClick={onSave} 
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
            <Paper elevation={0} sx={{
              borderRadius: '24px', overflow: 'hidden', border: identityExpanded ? '2px solid #3b82f6' : '1px solid #e2e8f0',
              boxShadow: identityExpanded ? '0 12px 40px rgba(59, 130, 246, 0.15)' : '0 4px 20px rgba(0,0,0,0.02)',
              transition: 'all 0.3s ease', bgcolor: '#fff'
            }}>
              {/* Header */}
              <Box 
                onClick={() => setIdentityExpanded(!identityExpanded)}
                sx={{ 
                  p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  cursor: 'pointer', bgcolor: identityExpanded ? '#f8fafc' : '#fff',
                  borderBottom: identityExpanded ? '1px solid #e2e8f0' : 'none',
                  '&:hover': { bgcolor: '#f8fafc' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {editForm.title && editForm.slug && editForm.category ? (
                      <CheckCircleIcon sx={{ color: '#10b981', fontSize: 24 }} />
                    ) : (
                      <InfoOutlinedIcon sx={{ color: '#cbd5e1', fontSize: 24 }} />
                    )}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
                      Document Identity
                    </Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {editForm.title || 'Set title, slug, and routing'}
                    </Typography>
                  </Box>
                </Box>
                <IconButton size="small" sx={{ transform: identityExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                  <ExpandMoreIcon />
                </IconButton>
              </Box>

              {/* Content */}
              <Collapse in={identityExpanded}>
                <Box sx={{ p: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
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
              </Collapse>
            </Paper>

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
            <WikiBlockBuilder 
              blocks={editForm.blocks}
              onBlocksChange={(blocks) => setEditForm({ ...editForm, blocks })}
              expandedBlockId={expandedBlockId}
              setExpandedBlockId={setExpandedBlockId}
              reorderUnlocked={reorderUnlocked}
              getBlockFillStats={getBlockFillStats}
            />
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

      {/* Live Preview Modal */}
      <Dialog 
        open={showPreviewModal} 
        onClose={() => setShowPreviewModal(false)} 
        maxWidth="lg" 
        fullWidth 
        sx={{ '& .MuiDialog-paper': { height: '90vh', borderRadius: '24px', overflow: 'hidden', bgcolor: '#f8fafc' } }}
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
    </Box>
  );
}
