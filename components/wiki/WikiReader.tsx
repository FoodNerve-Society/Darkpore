'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Chip, Divider, IconButton, Stepper, Step, StepLabel, StepContent, Breadcrumbs, Link, Checkbox, FormControlLabel, Paper, Alert } from '@mui/material';
import { WikiBlock, getWikiHierarchy, getUserWikiState, saveUserWikiState, resetUserWikiState, UserWikiStatePayload } from '@/lib/actions/wiki';
import { useSociety } from '@/context/SocietyContext';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SecurityIcon from '@mui/icons-material/Security';
import DocIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import FolderIcon from '@mui/icons-material/Folder';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import Tooltip from '@mui/material/Tooltip';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// --- Text Block Component with Checklists ---
function TextBlock({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('- [ ]')) {
          return <FormControlLabel key={i} control={<Checkbox sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }} />} label={<Typography sx={{ fontSize: '1.05rem', color: '#334155' }}>{trimmed.replace('- [ ]', '').trim()}</Typography>} />;
        }
        if (trimmed.startsWith('- [x]') || trimmed.startsWith('- [X]')) {
          return <FormControlLabel key={i} control={<Checkbox defaultChecked sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }} />} label={<Typography sx={{ fontSize: '1.05rem', color: '#94a3b8', textDecoration: 'line-through' }}>{trimmed.substring(5).trim()}</Typography>} />;
        }
        if (trimmed.startsWith('# ')) {
          return <Typography key={i} variant="h5" sx={{ fontWeight: 800, mt: 2, mb: 1, color: '#0f172a' }}>{trimmed.replace('# ', '')}</Typography>;
        }
        if (trimmed.startsWith('## ')) {
          return <Typography key={i} variant="h6" sx={{ fontWeight: 700, mt: 2, mb: 1, color: '#1e293b' }}>{trimmed.replace('## ', '')}</Typography>;
        }
        if (!trimmed) return <Box key={i} sx={{ height: 8 }} />;
        return <Typography key={i} sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#334155', fontSize: '1.05rem' }}>{line}</Typography>;
      })}
    </Box>
  );
}

// --- Header Block Component ---
function HeaderBlock({ block }: { block: WikiBlock }) {
  const level = block.headerLevel || 2;
  const Tag = `h${level}` as any;
  const variant = level === 1 ? 'h4' : level === 2 ? 'h5' : 'h6';
  return <Typography variant={variant} component={Tag} sx={{ fontWeight: 800, color: '#0f172a', mt: 2, mb: 1 }}>{block.content}</Typography>;
}

// --- Callout Block Component ---
function CalloutBlock({ block }: { block: WikiBlock }) {
  const severity = block.calloutType === 'danger' ? 'error' : block.calloutType === 'warning' ? 'warning' : 'info';
  return (
    <Alert severity={severity} sx={{ mb: 2, borderRadius: '12px', '& .MuiAlert-message': { width: '100%' } }}>
      <Typography sx={{ whiteSpace: 'pre-wrap', fontWeight: 500 }}>{block.content}</Typography>
    </Alert>
  );
}

// --- Code Snippet Block Component ---
function CodeSnippetBlock({ block }: { block: WikiBlock }) {
  return (
    <Box sx={{ position: 'relative', bgcolor: '#0f172a', borderRadius: '12px', overflow: 'hidden', mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1, bgcolor: 'rgba(255,255,255,0.1)' }}>
        <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{block.codeLanguage || 'text'}</Typography>
        <IconButton size="small" onClick={() => { navigator.clipboard.writeText(block.content); alert('Code copied!'); }} sx={{ color: '#94a3b8' }}><ContentCopyIcon fontSize="small" /></IconButton>
      </Box>
      <Box sx={{ p: 2, overflowX: 'auto' }}>
        <Typography component="pre" sx={{ color: '#f8fafc', fontFamily: 'monospace', fontSize: '0.9rem', m: 0 }}>{block.content}</Typography>
      </Box>
    </Box>
  );
}

// --- Checklist Block Component ---
function ChecklistBlock({ block, value, onChange }: { block: WikiBlock, value: Record<string, boolean>, onChange: (val: Record<string, boolean>) => void }) {
  const items = block.checklistItems || [];
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
      {items.map((item, idx) => (
        <FormControlLabel 
          key={item.id} 
          control={
            <Checkbox 
              checked={!!value[item.id]} 
              onChange={(e) => {
                onChange({ ...value, [item.id]: e.target.checked });
              }}
              sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }} 
            />
          } 
          label={<Typography sx={{ fontSize: '1.05rem', color: '#334155', textDecoration: value[item.id] ? 'line-through' : 'none', opacity: value[item.id] ? 0.6 : 1, transition: 'all 0.2s' }}>{item.text}</Typography>} 
        />
      ))}
    </Box>
  );
}

// --- Media Block Component ---
function MediaBlock({ block }: { block: WikiBlock }) {
  if (!block.mediaUrl && !block.mediaFile) return null;
  const url = block.mediaUrl || (block.mediaFile ? URL.createObjectURL(block.mediaFile) : '');
  return (
    <Box sx={{ mb: 2, borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
      <img src={url} alt={block.content || 'Media'} style={{ width: '100%', maxHeight: 400, objectFit: 'contain', display: 'block' }} />
      {block.content && (
        <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', bgcolor: '#fff' }}>
          <Typography sx={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', fontStyle: 'italic' }}>{block.content}</Typography>
        </Box>
      )}
    </Box>
  );
}


// --- Prompt Builder Component ---
function PromptBuilderBlock({ block, value, onChange }: { block: WikiBlock, value: Record<string, string>, onChange: (val: Record<string, string>) => void }) {
  const handleCopy = () => {
    let finalPrompt = block.content;
    if (block.variables) {
      block.variables.forEach(v => {
        const val = value[v.name] || `[${v.label}]`;
        finalPrompt = finalPrompt.replace(new RegExp(`{{${v.name}}}`, 'g'), val);
      });
    }
    navigator.clipboard.writeText(finalPrompt);
    alert('Prompt copied to clipboard!');
  };

  return (
    <Box sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', p: 3, mb: 3 }}>
      <Typography variant="overline" sx={{ color: '#60a5fa', fontWeight: 700, mb: 2, display: 'block' }}>Prompt Builder</Typography>
      
      {block.variables && block.variables.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mb: 3 }}>
          {block.variables.map(v => (
            <TextField 
              key={v.name}
              label={v.label}
              variant="outlined"
              size="small"
              value={value[v.name] || ''}
              onChange={(e) => onChange({ ...value, [v.name]: e.target.value })}
              InputProps={{ sx: { color: '#0f172a' } }} 
              InputLabelProps={{ sx: { color: 'rgba(15,23,42,0.7)' } }}
              sx={{ '& fieldset': { borderColor: 'rgba(15,23,42,0.2)' } }}
            />
          ))}
        </Box>
      )}

      <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: '8px', mb: 2 }}>
        <Typography sx={{ color: 'rgba(15,23,42,0.8)', fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
          {block.content}
        </Typography>
      </Box>

      <Button variant="contained" startIcon={<ContentCopyIcon />} onClick={handleCopy} sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}>
        Copy Final Prompt
      </Button>
    </Box>
  );
}
// --- Scratchpad Block Component ---
function ScratchpadBlock({ 
  block, 
  value, 
  onChange 
}: { 
  block: WikiBlock; 
  value: string; 
  onChange: (val: string) => void; 
}) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="overline" sx={{ color: '#14b8a6', fontWeight: 700, mb: 1, display: 'block' }}>Scratchpad</Typography>
      <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '8px', mb: 2 }}>
        <Typography sx={{ color: 'rgba(15,23,42,0.8)', fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
          {block.content}
        </Typography>
      </Box>
      <TextField
        multiline
        minRows={5}
        fullWidth
        placeholder="Start typing your notes here..."
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: '#0f172a',
            color: '#f8fafc',
            fontFamily: 'monospace',
            fontSize: '0.95rem',
            borderRadius: '12px',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
            '&.Mui-focused fieldset': { borderColor: '#14b8a6' },
          }
        }}
      />
    </Box>
  );
}
interface WikiReaderProps {
  doc: any;
  loading: boolean;
  isAdmin: boolean;
  hasAccess: boolean;
  canSeeBlock: (block: WikiBlock) => boolean;
  onEdit?: () => void;
  onNavigate?: (slug: string) => void;
  headerContent?: React.ReactNode;
}

export default function WikiReader({ doc, loading, isAdmin, hasAccess, canSeeBlock, onEdit, onNavigate, headerContent }: WikiReaderProps) {
  const { profile } = useSociety();
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);
  
  // Stateful IDE properties
  const [checkboxes, setCheckboxes] = useState<Record<string, boolean>>({});
  const [promptInputs, setPromptInputs] = useState<Record<string, string>>({});
  const [scratchpads, setScratchpads] = useState<Record<string, string>>({});
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const scrollRef = React.useRef<HTMLElement>(null);
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (doc?.slug) {
      getWikiHierarchy(doc.slug).then(res => {
        if (res.success && res.data) {
          setBreadcrumbs(res.data);
        }
      });
    }
  }, [doc?.slug]);

  // Load from DB or localStorage on mount
  useEffect(() => {
    if (doc?.id && profile?.uid) {
      const localKey = `wiki_state_${doc.id}_${profile.uid}`;
      const cached = localStorage.getItem(localKey);
      let localLastModified = 0;
      
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          localLastModified = parsed.lastModified || 0;
          setCheckboxes(parsed.checkboxes || {});
          setPromptInputs(parsed.promptInputs || {});
          setScratchpads(parsed.scratchpads || {});
          setScrollPosition(parsed.scrollPosition || 0);
          if (parsed.scrollPosition && scrollRef.current) {
            scrollRef.current.scrollTop = parsed.scrollPosition;
          }
        } catch(e) {}
      }

      getUserWikiState(doc.id, profile.uid).then(res => {
        if (res.success && res.data) {
          const dbLastModified = new Date(res.data.updatedAt).getTime();
          
          if (dbLastModified >= localLastModified) {
            // DB is newer or perfectly in sync, use DB data
            setCheckboxes(res.data.checkboxes || {});
            setPromptInputs(res.data.promptInputs || {});
            setScratchpads(res.data.scratchpads || {});
            setScrollPosition(res.data.scrollPosition || 0);
            if (res.data.scrollPosition && scrollRef.current) {
              scrollRef.current.scrollTop = res.data.scrollPosition;
            }
            setLastSaved(new Date(res.data.updatedAt));
            localStorage.setItem(localKey, JSON.stringify({
              checkboxes: res.data.checkboxes,
              promptInputs: res.data.promptInputs,
              scratchpads: res.data.scratchpads,
              scrollPosition: res.data.scrollPosition,
              lastModified: dbLastModified
            }));
            setHasUnsavedChanges(false);
          } else {
            // Local is newer, keep local data but log when it was last saved to DB
            setLastSaved(new Date(res.data.updatedAt));
            setHasUnsavedChanges(true);
          }
        }
      });
    }
  }, [doc?.id, profile?.uid]);

  // Auto-save to local storage
  useEffect(() => {
    if (doc?.id && profile?.uid) {
      const stateToCache = { 
        checkboxes, promptInputs, scratchpads, scrollPosition,
        lastModified: hasUnsavedChanges ? Date.now() : (lastSaved ? lastSaved.getTime() : 0)
      };
      localStorage.setItem(`wiki_state_${doc.id}_${profile.uid}`, JSON.stringify(stateToCache));
    }
  }, [checkboxes, promptInputs, scratchpads, scrollPosition, hasUnsavedChanges, lastSaved, doc?.id, profile?.uid]);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const top = (e.target as HTMLElement).scrollTop;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setScrollPosition(top);
      setHasUnsavedChanges(true);
    }, 500);
  };

  const handleSaveToCloud = async () => {
    if (!doc?.id || !profile?.uid) return;
    setIsSaving(true);
    const res = await saveUserWikiState(doc.id, profile.uid, { checkboxes, promptInputs, scratchpads, scrollPosition });
    setIsSaving(false);
    if (res.success) {
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } else {
      alert('Failed to save progress to cloud.');
    }
  };

  const handleResetWorkspace = async () => {
    if (!doc?.id || !profile?.uid) return;
    if (!confirm('Are you sure you want to clear your local progress? This cannot be undone.')) return;
    setCheckboxes({});
    setPromptInputs({});
    setScratchpads({});
    setScrollPosition(0);
    setHasUnsavedChanges(false);
    localStorage.removeItem(`wiki_state_${doc.id}_${profile.uid}`);
    await resetUserWikiState(doc.id, profile.uid);
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#ffffff', position: 'relative' }}>
      {headerContent && (
        <Box sx={{ p: 2, position: 'absolute', top: 0, left: 0, zIndex: 10 }}>
          {headerContent}
        </Box>
      )}

      {/* STICKY WORKSPACE NAVBAR */}
      {doc && hasAccess && !loading && (
        <Box sx={{ 
          position: 'sticky', top: 0, zIndex: 20, 
          bgcolor: 'rgba(255, 255, 255, 0.85)', 
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          px: { xs: 2, md: 4 }, py: 1.5,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          {/* Left side spacer to keep center balanced */}
          <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }} />
          
          {/* Center */}
          <Box sx={{ flex: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', letterSpacing: '-0.02em' }}>{doc.title}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: hasUnsavedChanges ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
              {hasUnsavedChanges ? 'Unsaved local changes' : (lastSaved ? `Saved to cloud at ${lastSaved.toLocaleTimeString()}` : 'No cloud saves yet')}
            </Typography>
          </Box>

          {/* Right */}
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Tooltip title="Reset Workspace to Default">
                <IconButton 
                  color="error"
                  onClick={handleResetWorkspace}
                  sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}
                >
                  <RestartAltIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Button 
                variant="contained" 
                disabled={!hasUnsavedChanges || isSaving}
                onClick={handleSaveToCloud}
                startIcon={<CloudSyncIcon />}
                sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 2, boxShadow: 'none' }}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
          </Box>
        </Box>
      )}

      <Box 
        ref={scrollRef}
        onScroll={handleScroll}
        sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 6 }, pt: headerContent ? { xs: 6, sm: 8 } : { xs: 2, sm: 6 } }}
      >
        {!doc && !loading ? (
          <Box sx={{ textAlign: 'center', mt: 10 }}>
             <Typography sx={{ color: 'text.secondary', mb: 3 }}>Document not found.</Typography>
             {isAdmin && onEdit && (
                <Button variant="outlined" onClick={onEdit} sx={{ borderRadius: '20px' }}>
                   Create Document
                </Button>
             )}
          </Box>
        ) : !hasAccess && !loading ? (
          <Box sx={{ textAlign: 'center', mt: 10 }}>
            <SecurityIcon sx={{ color: '#ef4444', fontSize: 60, opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Access Denied</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>Clearance level insufficient.</Typography>
          </Box>
        ) : doc ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '800px', mx: 'auto' }}>
            <Box sx={{ mb: 2 }}>
              {breadcrumbs.length > 0 && (
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
                  <Link underline="hover" color="inherit" sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => onNavigate && onNavigate('')}>
                     <DocIcon sx={{ mr: 0.5, fontSize: 18 }} /> Omni-Wiki
                  </Link>
                  {breadcrumbs.map((bc, idx) => {
                    const isLast = idx === breadcrumbs.length - 1;
                    return isLast ? (
                      <Typography key={bc.slug} color="text.primary" sx={{ fontWeight: 700 }}>{bc.title}</Typography>
                    ) : (
                      <Link key={bc.slug} underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => onNavigate && onNavigate(bc.slug)}>
                        {bc.title}
                      </Link>
                    );
                  })}
                </Breadcrumbs>
              )}
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f172a' }}>{doc.title}</Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
               <Chip label={doc.category} size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#059669', fontWeight: 700 }} />
               {doc.isPublic ? (
                 <Chip label="Public" size="small" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', fontWeight: 700 }} />
               ) : (
                 <Chip label="Restricted" size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', fontWeight: 700 }} />
               )}
            </Box>
            
            <Divider sx={{ my: 2 }} />

            {/* IN THIS SECTION (Children Documents) */}
            {/* IN THIS SECTION (Children Documents) - Premium Glassmorphism */}
            {doc.children && doc.children.length > 0 && (
              <Box sx={{ 
                mb: 4, p: 3, 
                background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8), rgba(241, 245, 249, 0.4))',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px', 
                border: '1px solid rgba(226, 232, 240, 0.6)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.04), inset 0 2px 4px rgba(255,255,255,1)' 
              }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FolderIcon sx={{ fontSize: 16, color: '#8b5cf6' }} /> In This Section
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {doc.children.map((child: any) => (
                    <Box 
                      key={child.id}
                      onClick={() => onNavigate && onNavigate(child.slug)}
                      sx={{ 
                        display: 'flex', alignItems: 'center', gap: 1.5,
                        background: 'rgba(255,255,255,0.9)', 
                        border: '1px solid rgba(0,0,0,0.04)', 
                        fontWeight: 600, color: '#0f172a', fontSize: '0.9rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)', 
                        py: 1, px: 2.5, borderRadius: '16px',
                        cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': { 
                          background: '#fff', 
                          transform: 'translateY(-2px)', 
                          boxShadow: '0 12px 24px rgba(139,92,246,0.15)',
                          borderColor: 'rgba(139,92,246,0.2)'
                        }
                      }}
                    >
                      <DocIcon sx={{ fontSize: '1.1rem', color: '#8b5cf6' }} />
                      {child.title}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Stepper orientation="vertical" nonLinear activeStep={-1} sx={{ mt: 2 }}>
                {doc.blocks.filter(canSeeBlock).map((block: WikiBlock, index: number) => (
                  <Step key={block.id} active={true} expanded={true}>
                    <StepLabel>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        Step {index + 1}
                      </Typography>
                    </StepLabel>
                    <StepContent sx={{ borderLeft: '2px solid rgba(16, 185, 129, 0.3)', ml: '12px', pl: 3 }}>
                      {isAdmin && (
                        <Typography variant="caption" sx={{ color: '#f59e0b', mb: 1, display: 'block', fontWeight: 700 }}>
                          [Admin View] Visibility: {block.visibility}
                        </Typography>
                      )}
                      
                      {/* Dynamic Renderer Mapping */}
                      {block.type === 'TEXT' && <TextBlock content={block.content} />}
                      {block.type === 'HEADER' && <HeaderBlock block={block} />}
                      {block.type === 'CALLOUT' && <CalloutBlock block={block} />}
                      {block.type === 'CHECKLIST' && <ChecklistBlock block={block} value={checkboxes} onChange={(v) => { setCheckboxes(v); setHasUnsavedChanges(true); }} />}
                      {block.type === 'CODE_SNIPPET' && <CodeSnippetBlock block={block} />}
                      {block.type === 'MEDIA' && <MediaBlock block={block} />}
                      {block.type === 'PROMPT_BUILDER' && <PromptBuilderBlock block={block} value={promptInputs} onChange={(v) => { setPromptInputs(v); setHasUnsavedChanges(true); }} />}
                      {block.type === 'SCRATCHPAD' && <ScratchpadBlock block={block} value={scratchpads[block.id]} onChange={(v) => { setScratchpads({ ...scratchpads, [block.id]: v }); setHasUnsavedChanges(true); }} />}
                      
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
              
              {doc.blocks.filter(canSeeBlock).length === 0 && (
                 <Typography sx={{ color: 'text.disabled', fontStyle: 'italic', pl: 2 }}>No visible steps available in this SOP.</Typography>
              )}
            </Box>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
