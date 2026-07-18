'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Chip, Divider, IconButton, Stepper, Step, StepLabel, StepContent, Breadcrumbs, Link, Checkbox, FormControlLabel, Paper, Alert } from '@mui/material';
import { WikiBlock, getWikiHierarchy } from '@/lib/actions/wiki';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SecurityIcon from '@mui/icons-material/Security';
import DocIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import FolderIcon from '@mui/icons-material/Folder';

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
function ChecklistBlock({ block }: { block: WikiBlock }) {
  const [items, setItems] = useState(block.checklistItems || []);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
      {items.map((item, idx) => (
        <FormControlLabel 
          key={item.id} 
          control={
            <Checkbox 
              checked={item.checked} 
              onChange={(e) => {
                const newItems = [...items];
                newItems[idx].checked = e.target.checked;
                setItems(newItems);
              }}
              sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }} 
            />
          } 
          label={<Typography sx={{ fontSize: '1.05rem', color: '#334155', textDecoration: item.checked ? 'line-through' : 'none', opacity: item.checked ? 0.6 : 1, transition: 'all 0.2s' }}>{item.text}</Typography>} 
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
function PromptBuilderBlock({ block }: { block: WikiBlock }) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  
  const handleCopy = () => {
    let finalPrompt = block.content;
    if (block.variables) {
      block.variables.forEach(v => {
        const val = inputs[v.name] || `[${v.label}]`;
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
              value={inputs[v.name] || ''}
              onChange={(e) => setInputs({ ...inputs, [v.name]: e.target.value })}
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
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);

  useEffect(() => {
    if (doc?.slug) {
      getWikiHierarchy(doc.slug).then(res => {
        if (res.success && res.data) {
          setBreadcrumbs(res.data);
        }
      });
    }
  }, [doc?.slug]);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#ffffff', position: 'relative' }}>
      {headerContent && (
        <Box sx={{ p: 2, position: 'absolute', top: 0, left: 0, zIndex: 10 }}>
          {headerContent}
        </Box>
      )}

      <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 6 }, pt: headerContent ? { xs: 6, sm: 8 } : { xs: 2, sm: 6 } }}>
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
                      {block.type === 'CHECKLIST' && <ChecklistBlock block={block} />}
                      {block.type === 'CODE_SNIPPET' && <CodeSnippetBlock block={block} />}
                      {block.type === 'MEDIA' && <MediaBlock block={block} />}
                      {block.type === 'PROMPT_BUILDER' && <PromptBuilderBlock block={block} />}
                      
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
