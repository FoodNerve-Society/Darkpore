'use client';

import React, { useState, useMemo } from 'react';
import { 
  Box, Typography, Button, IconButton, TextField, 
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  Dialog, Chip, DialogTitle, DialogContent, DialogActions, Collapse, Paper, Tooltip, alpha
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
import CheckIcon from '@mui/icons-material/Check';

import WikiBlockBuilder from './WikiBlockBuilder';
import WikiReader from './WikiReader';
import PremiumTextField from '@/components/PremiumTextField';
import PremiumAutocomplete from '@/components/PremiumAutocomplete';
import PremiumSwitch from '@/components/PremiumSwitch';

const WIKI_DOMAINS = [
  {
    id: 'platform_features', title: 'Platform Features', description: 'Core product capabilities and hubs',
    subcategories: [
      { id: 'innovations', title: 'Innovations Hub', description: 'Tools and systems for innovation management' },
      { id: 'workspace', title: 'Workspace Hub', description: 'Collaboration and productivity environments' },
      { id: 'society', title: 'Modular Society', description: 'Community and network structures' }
    ]
  },
  {
    id: 'operations', title: 'Operations & Admin', description: 'Internal management and controls',
    subcategories: [
      { id: 'moderation', title: 'Moderation', description: 'Content review and safety guidelines' },
      { id: 'finance', title: 'Finance & Escrow', description: 'Payment processing and ledger management' }
    ]
  },
  {
    id: 'engineering', title: 'Engineering', description: 'Technical documentation and architecture',
    subcategories: [
      { id: 'frontend', title: 'Frontend (UI/UX)', description: 'Client-side code, design systems, and components' },
      { id: 'backend', title: 'Backend (Data)', description: 'Server architecture, databases, and APIs' }
    ]
  }
];

const WIKI_BLOCK_DEFINITIONS = {
  HEADER: { label: 'Header / Section', color: '#3b82f6' },
  TEXT: { label: 'Rich Text', color: '#64748b' },
  CALLOUT: { label: 'Notice / Callout', color: '#f59e0b' },
  CHECKLIST: { label: 'Interactive Checklist', color: '#10b981' },
  CODE_SNIPPET: { label: 'Code Snippet', color: '#8b5cf6' },
  PROMPT_BUILDER: { label: 'AI Prompt Builder', color: '#f43f5e' },
  MEDIA: { label: 'Media / Image', color: '#ec4899' },
};

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

  const addSpecificBlock = (type: string) => {
    const newId = `block-${Date.now()}`;
    let initialData: any = { id: newId, type, visibility: 'public', content: '' };
    if (type === 'PROMPT_BUILDER') {
      initialData.variables = [];
      initialData.promptTemplate = '';
    } else if (type === 'CHECKLIST') {
      initialData.checklistItems = [{ id: `item-${Date.now()}`, text: '', isChecked: false }];
    } else if (type === 'CALLOUT') {
      initialData.calloutType = 'info';
    } else if (type === 'CODE_SNIPPET') {
      initialData.codeLanguage = 'javascript';
    } else if (type === 'MEDIA') {
      initialData.mediaUrl = '';
    }
    
    setEditForm({
      ...editForm,
      blocks: [...editForm.blocks, initialData]
    });
    setExpandedBlockId(newId);
    
    // Scroll to bottom
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
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
            <Box sx={{ perspective: '1000px', mb: 2 }}>
              <Box sx={{
                position: 'relative',
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                transformStyle: 'preserve-3d',
                transform: identityExpanded ? 'rotateX(-180deg)' : 'none',
              }}>
                {/* FRONT FACE (Overview) */}
                <Box sx={{
                  backfaceVisibility: 'hidden',
                  position: identityExpanded ? 'absolute' : 'relative',
                  width: '100%',
                  minHeight: 160,
                  borderRadius: '24px',
                  border: `1px solid ${editForm.title && editForm.slug && editForm.category ? 'rgba(15, 23, 42, 0.1)' : '#e2e8f0'}`,
                  background: editForm.title && editForm.slug && editForm.category 
                    ? `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)` 
                    : `linear-gradient(135deg, #fff 0%, #f8fafc 100%)`,
                  boxShadow: editForm.title && editForm.slug && editForm.category 
                    ? '0 12px 32px rgba(15, 23, 42, 0.25)' 
                    : '0 4px 20px rgba(0,0,0,0.02)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: editForm.title && editForm.slug && editForm.category ? '0 16px 40px rgba(15, 23, 42, 0.3)' : '0 8px 24px rgba(0,0,0,0.06)' },
                  transition: 'all 0.3s ease'
                }} onClick={() => setIdentityExpanded(true)}>
                  {/* Premium pattern overlay */}
                  {editForm.title && editForm.slug && editForm.category && (
                    <Box sx={{
                      position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
                      background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.15) 0%, transparent 60%)',
                      pointerEvents: 'none'
                    }} />
                  )}
                  
                  <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%', flex: 1, position: 'relative', zIndex: 1 }}>
                    {/* Top row: Badges */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip label="DOCUMENT CONFIGURATION" size="small" sx={{ height: 24, fontSize: '0.7rem', fontWeight: 800, letterSpacing: 1, bgcolor: editForm.title && editForm.slug && editForm.category ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '8px' }} />
                        {editForm.category && <Chip label={WIKI_DOMAINS.find(d => d.id === editForm.category)?.title || editForm.category} size="small" sx={{ height: 24, fontSize: '0.7rem', fontWeight: 700, bgcolor: editForm.title && editForm.slug && editForm.category ? 'rgba(255,255,255,0.1)' : '#f1f5f9', color: editForm.title && editForm.slug && editForm.category ? '#cbd5e1' : '#64748b', borderRadius: '8px' }} />}
                        {editForm.tags?.[0] && <Chip label={WIKI_DOMAINS.find(d => d.id === editForm.category)?.subcategories?.find(s => s.id === editForm.tags[0])?.title || editForm.tags[0]} size="small" sx={{ height: 24, fontSize: '0.7rem', fontWeight: 700, bgcolor: editForm.title && editForm.slug && editForm.category ? 'rgba(255,255,255,0.1)' : '#f1f5f9', color: editForm.title && editForm.slug && editForm.category ? '#cbd5e1' : '#64748b', borderRadius: '8px' }} />}
                      </Box>
                      <Box sx={{ 
                        width: 36, height: 36, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: editForm.title && editForm.slug && editForm.category ? 'rgba(16, 185, 129, 0.15)' : 'rgba(241, 245, 249, 1)',
                        color: editForm.title && editForm.slug && editForm.category ? '#10b981' : '#cbd5e1',
                        transition: 'all 0.3s ease'
                      }}>
                        {editForm.title && editForm.slug && editForm.category ? <CheckCircleIcon /> : <InfoOutlinedIcon />}
                      </Box>
                    </Box>

                    {/* Middle: Title */}
                    <Typography sx={{ 
                      fontWeight: 900, 
                      fontSize: { xs: '1.5rem', md: '1.8rem' }, 
                      color: editForm.title && editForm.slug && editForm.category ? '#fff' : '#94a3b8',
                      letterSpacing: '-0.03em',
                      lineHeight: 1.2,
                      mb: 1,
                      flex: 1,
                      display: 'flex', alignItems: 'center'
                    }}>
                      {editForm.title || 'Tap to configure Document Identity'}
                    </Typography>

                    {/* Bottom row: Meta info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, pt: 2, borderTop: `1px solid ${editForm.title && editForm.slug && editForm.category ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: editForm.title && editForm.slug && editForm.category ? '#94a3b8' : '#64748b' }}>
                        <SwapHorizIcon sx={{ fontSize: 18 }} />
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {editForm.slug ? `/wiki/${editForm.category || 'domain'}/${editForm.slug}` : 'URL routing pending...'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: editForm.isPublic ? '#10b981' : (editForm.title && editForm.slug && editForm.category ? '#f59e0b' : '#64748b') }}>
                        <VisibilityIcon sx={{ fontSize: 18 }} />
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{editForm.isPublic ? 'Publicly Visible' : 'Internal / Draft'}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* BACK FACE (Editor) */}
                <Box sx={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateX(180deg)',
                  position: identityExpanded ? 'relative' : 'absolute',
                  width: '100%', top: 0,
                  borderRadius: '24px',
                  border: `2px solid rgba(59, 130, 246, 0.5)`,
                  background: `linear-gradient(135deg, #fff 0%, #f8fafc 100%)`,
                  boxShadow: `0 16px 48px rgba(59, 130, 246, 0.15)`,
                  overflow: 'hidden',
                }}>
                  {/* Back header */}
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 2,
                    px: 3, py: 2,
                    borderBottom: `1px solid rgba(0,0,0,0.06)`,
                    background: 'rgba(59, 130, 246, 0.05)',
                  }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '10px', bgcolor: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid rgba(59, 130, 246, 0.2)` }}>
                      <InfoOutlinedIcon sx={{ fontSize: 20, color: '#3b82f6' }} />
                    </Box>
                    <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', flex: 1 }}>
                      Editing Document Identity
                    </Typography>
                    <Tooltip title="Done editing">
                      <IconButton
                        size="medium"
                        onClick={(e) => { e.stopPropagation(); setIdentityExpanded(false); }}
                        sx={{
                          bgcolor: '#3b82f6', color: '#fff',
                          boxShadow: `0 4px 12px rgba(59, 130, 246, 0.3)`,
                          '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.9)', transform: 'scale(1.05)' },
                        }}
                      >
                        <CheckIcon sx={{ fontSize: 20, fontWeight: 900 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Fields */}
                  <Box sx={{ p: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                    <PremiumTextField 
                      label="Title" 
                      value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})}
                      colorTheme="#3b82f6"
                    />
                    <PremiumTextField 
                      label="Unique Slug" 
                      value={editForm.slug} onChange={e => setEditForm({...editForm, slug: e.target.value})}
                      colorTheme="#3b82f6"
                    />
                    <PremiumAutocomplete
                      label="Domain (Category)"
                      value={editForm.category}
                      options={WIKI_DOMAINS.map(domain => ({ label: domain.title, value: domain.id, description: domain.description }))}
                      onChange={(_, val: any) => setEditForm({...editForm, category: val?.value || val, tags: []})}
                      colorTheme="#3b82f6"
                      disableClearable
                      renderOption={(props, option: any) => (
                        <Box component="li" {...props} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{option.label}</Typography>
                          {option.description && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, lineHeight: 1.2 }}>
                              {option.description}
                            </Typography>
                          )}
                        </Box>
                      )}
                    />
                    <PremiumAutocomplete
                      label="Tag (Subcategory)"
                      value={editForm.tags[0] || ''}
                      options={WIKI_DOMAINS.find(d => d.id === editForm.category)?.subcategories.map(sub => ({ label: sub.title, value: sub.id, description: sub.description })) || []}
                      onChange={(_, val: any) => setEditForm({...editForm, tags: [val?.value || val]})}
                      colorTheme="#3b82f6"
                      disableClearable
                      renderOption={(props, option: any) => (
                        <Box component="li" {...props} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{option.label}</Typography>
                          {option.description && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, lineHeight: 1.2 }}>
                              {option.description}
                            </Typography>
                          )}
                        </Box>
                      )}
                    />
                    <PremiumAutocomplete
                      label="Link to UI Hotspot"
                      value={editForm.hotspotId || ''}
                      options={[
                        { label: 'None (Unlinked)', value: '' },
                        ...registryHotspots.filter(h => h.category === editForm.category && h.subcategory === editForm.tags[0]).map(h => ({ label: `${h.label} (${h.id})`, value: h.id }))
                      ]}
                      onChange={(_, val: any) => setEditForm({...editForm, hotspotId: val?.value ?? val})}
                      colorTheme="#3b82f6"
                      disableClearable
                    />
                    <PremiumAutocomplete
                      label="Parent Document (Optional)"
                      value={editForm.parentId || ''}
                      options={[
                        { label: 'None (Top Level)', value: '' },
                        ...wikiDocs.filter(d => d.id !== doc?.id).map(d => ({ label: d.title, value: d.id }))
                      ]}
                      onChange={(_, val: any) => setEditForm({...editForm, parentId: val?.value ?? val})}
                      colorTheme="#3b82f6"
                      disableClearable
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PremiumSwitch
                        checked={editForm.isPublic}
                        onChange={e => setEditForm({...editForm, isPublic: e.target.checked})}
                        colorTheme="#10b981"
                        label="Is Public Document?"
                      />
                    </Box>
                  </Box>
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

            {/* ΓöÇΓöÇΓöÇ ADD BLOCK BAR ΓöÇΓöÇΓöÇ */}
            <Box sx={{
              mt: 4, p: 3, borderRadius: '24px',
              background: 'rgba(255,255,255,0.8)',
              border: '1px dashed rgba(0,0,0,0.15)',
              backdropFilter: 'blur(12px)',
            }}>
              <Typography sx={{ color: '#0f172a', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>
                + Add Architecture Block
              </Typography>
              <Box sx={{
                display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1,
                '&::-webkit-scrollbar': { display: 'none' },
              }}>
                {Object.entries(WIKI_BLOCK_DEFINITIONS).map(([key, def]) => (
                  <Chip
                    key={key}
                    label={def.label}
                    onClick={() => addSpecificBlock(key)}
                    sx={{
                      flexShrink: 0, cursor: 'pointer',
                      bgcolor: alpha(def.color, 0.1), color: def.color,
                      border: `1px solid ${alpha(def.color, 0.3)}`,
                      fontWeight: 800, fontSize: '0.85rem', px: 1, py: 2.5, borderRadius: '12px',
                      boxShadow: `0 2px 8px ${alpha(def.color, 0.1)}`,
                      '&:hover': { bgcolor: alpha(def.color, 0.2), borderColor: alpha(def.color, 0.6), transform: 'translateY(-2px)', boxShadow: `0 6px 16px ${alpha(def.color, 0.2)}` },
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </Box>
            </Box>
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
