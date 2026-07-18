'use client';

import React, { useState } from 'react';
import { 
  Box, Typography, IconButton, Paper, TextField, 
  FormControl, InputLabel, Select, MenuItem, Collapse, Button, Checkbox, FormControlLabel
} from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ImageIcon from '@mui/icons-material/Image';

export default function SortableWikiBlock({ 
  block, index, isExpanded, reorderUnlocked, 
  onUpdate, onRemove, onToggleExpand, isComplete 
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id, disabled: !reorderUnlocked });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    position: 'relative' as const,
  };

  const getBlockTitle = () => {
    switch (block.type) {
      case 'HEADER': return 'Header Block';
      case 'CALLOUT': return 'Callout (Alert)';
      case 'CHECKLIST': return 'Interactive Checklist';
      case 'CODE_SNIPPET': return 'Code Snippet';
      case 'MEDIA': return 'Media (Image/Video)';
      case 'PROMPT_BUILDER': return 'Prompt Builder';
      case 'TEXT': default: return 'Text Block';
    }
  };

  return (
    <Box ref={setNodeRef} style={style}>
      <Paper elevation={0} sx={{
        borderRadius: '24px', overflow: 'hidden', border: isExpanded ? '2px solid #3b82f6' : '1px solid #e2e8f0',
        boxShadow: isExpanded ? '0 12px 40px rgba(59, 130, 246, 0.15)' : '0 4px 20px rgba(0,0,0,0.02)',
        transition: 'all 0.3s ease', bgcolor: '#fff', opacity: isDragging ? 0.8 : 1
      }}>
        {/* Card Header (Always visible) */}
        <Box 
          onClick={() => !reorderUnlocked && onToggleExpand()}
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
                {getBlockTitle()}
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                Step {index + 1}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!reorderUnlocked && (
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onRemove(block.id); }} sx={{ color: '#ef4444' }}>
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
                <Select value={block.type} label="Type" onChange={e => onUpdate(block.id, { type: e.target.value })} sx={{ color: '#0f172a' }}>
                  <MenuItem value="TEXT">Text Markdown</MenuItem>
                  <MenuItem value="HEADER">Header</MenuItem>
                  <MenuItem value="CALLOUT">Callout (Alert)</MenuItem>
                  <MenuItem value="CHECKLIST">Checklist</MenuItem>
                  <MenuItem value="CODE_SNIPPET">Code Snippet</MenuItem>
                  <MenuItem value="MEDIA">Media / Image</MenuItem>
                  <MenuItem value="PROMPT_BUILDER">Prompt Builder</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ '& fieldset': { borderColor: '#cbd5e1' } }}>
                <InputLabel sx={{ color: '#64748b' }}>Visibility</InputLabel>
                <Select value={block.visibility} label="Visibility" onChange={e => onUpdate(block.id, { visibility: e.target.value })} sx={{ color: '#0f172a' }}>
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="internal_staff">Internal Staff</MenuItem>
                  <MenuItem value="admin">Admin Only</MenuItem>
                  <MenuItem value="whitelist_only">Whitelist Only</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Dynamic UI based on block type */}

            {block.type === 'HEADER' && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl sx={{ width: 120, '& fieldset': { borderColor: '#cbd5e1' } }}>
                  <InputLabel sx={{ color: '#64748b' }}>Size</InputLabel>
                  <Select value={block.headerLevel || 2} label="Size" onChange={e => onUpdate(block.id, { headerLevel: e.target.value })} sx={{ color: '#0f172a' }}>
                    <MenuItem value={1}>H1 (Large)</MenuItem>
                    <MenuItem value={2}>H2 (Medium)</MenuItem>
                    <MenuItem value={3}>H3 (Small)</MenuItem>
                  </Select>
                </FormControl>
                <TextField 
                  fullWidth label="Header Text" value={block.content} onChange={e => onUpdate(block.id, { content: e.target.value })}
                  sx={{ '& fieldset': { borderColor: '#cbd5e1' } }}
                />
              </Box>
            )}

            {block.type === 'CALLOUT' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl sx={{ '& fieldset': { borderColor: '#cbd5e1' } }}>
                  <InputLabel sx={{ color: '#64748b' }}>Callout Style</InputLabel>
                  <Select value={block.calloutType || 'info'} label="Callout Style" onChange={e => onUpdate(block.id, { calloutType: e.target.value })} sx={{ color: '#0f172a' }}>
                    <MenuItem value="info">Info (Blue)</MenuItem>
                    <MenuItem value="warning">Warning (Yellow)</MenuItem>
                    <MenuItem value="danger">Danger (Red)</MenuItem>
                  </Select>
                </FormControl>
                <TextField 
                  multiline fullWidth minRows={2} label="Callout Text" value={block.content} onChange={e => onUpdate(block.id, { content: e.target.value })}
                  sx={{ '& fieldset': { borderColor: '#cbd5e1' } }}
                />
              </Box>
            )}

            {block.type === 'CODE_SNIPPET' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField 
                  label="Language (e.g. javascript, python)" value={block.codeLanguage || ''} onChange={e => onUpdate(block.id, { codeLanguage: e.target.value })}
                  sx={{ '& fieldset': { borderColor: '#cbd5e1' } }}
                />
                <TextField 
                  multiline fullWidth minRows={4} label="Code Content" value={block.content} onChange={e => onUpdate(block.id, { content: e.target.value })}
                  sx={{ '& fieldset': { borderColor: '#cbd5e1' }, '& .MuiInputBase-root': { fontFamily: 'monospace', bgcolor: '#f8fafc' } }}
                />
              </Box>
            )}

            {block.type === 'CHECKLIST' && (
              <Box sx={{ bgcolor: '#f1f5f9', p: 3, borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                <Typography variant="subtitle2" sx={{ color: '#3b82f6', mb: 1, display: 'block', fontWeight: 800 }}>Checklist Items</Typography>
                {(block.checklistItems || []).map((item: any, iIndex: number) => (
                  <Box key={item.id} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                    <Checkbox disabled checked={item.checked} />
                    <TextField 
                      size="small" placeholder="Checklist item text..." value={item.text} 
                      onChange={e => {
                        const newItems = [...(block.checklistItems || [])];
                        newItems[iIndex].text = e.target.value;
                        onUpdate(block.id, { checklistItems: newItems });
                      }}
                      sx={{ flex: 1, '& fieldset': { borderColor: '#cbd5e1' }, bgcolor: '#fff' }}
                    />
                    <IconButton color="error" onClick={() => {
                      const newItems = [...(block.checklistItems || [])];
                      newItems.splice(iIndex, 1);
                      onUpdate(block.id, { checklistItems: newItems });
                    }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button size="small" variant="outlined" onClick={() => {
                  const newItems = [...(block.checklistItems || []), { id: Date.now().toString(), text: '', checked: false }];
                  onUpdate(block.id, { checklistItems: newItems });
                }} sx={{ color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.3)', bgcolor: '#fff', borderRadius: 2, fontWeight: 700 }}>
                  + Add Item
                </Button>
              </Box>
            )}

            {block.type === 'MEDIA' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {block.mediaUrl ? (
                  <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                    <img src={block.mediaUrl} alt="Block Media" style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }} />
                    <IconButton size="small" color="error" sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.8)' }} onClick={() => onUpdate(block.id, { mediaUrl: '', mediaFile: null })}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Box component="label" sx={{ flex: 1, borderRadius: '16px', bgcolor: 'rgba(0,0,0,0.02)', border: '2px dashed', borderColor: 'rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
                    <input type="file" hidden accept="image/*,video/*" onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const file = e.target.files[0];
                        const url = URL.createObjectURL(file);
                        onUpdate(block.id, { mediaUrl: url, mediaFile: file });
                      }
                    }} />
                    <ImageIcon sx={{ fontSize: 40, color: 'rgba(0,0,0,0.2)', mb: 1 }} />
                    <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>Click to select media</Typography>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem', mt: 0.5 }}>Will be uploaded when published</Typography>
                  </Box>
                )}
                <TextField 
                  fullWidth label="Caption (Optional)" value={block.content} onChange={e => onUpdate(block.id, { content: e.target.value })}
                  sx={{ '& fieldset': { borderColor: '#cbd5e1' } }}
                />
              </Box>
            )}

            {block.type === 'PROMPT_BUILDER' && (
              <Box sx={{ bgcolor: '#f1f5f9', p: 3, borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                <Typography variant="subtitle2" sx={{ color: '#3b82f6', mb: 1, display: 'block', fontWeight: 800 }}>Prompt Variables</Typography>
                <Typography variant="caption" sx={{ color: '#64748b', mb: 3, display: 'block' }}>
                  Add curly braces {"{{variable_name}}"} in your prompt, then define them below.
                </Typography>
                
                {(block.variables || []).map((v: any, vIndex: number) => (
                  <Box key={vIndex} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField 
                      size="small" label="Variable Name (no braces)" value={v.name} 
                      onChange={e => {
                        const newVars = [...(block.variables || [])];
                        newVars[vIndex].name = e.target.value;
                        onUpdate(block.id, { variables: newVars });
                      }}
                      sx={{ flex: 1, '& fieldset': { borderColor: '#cbd5e1' }, '& .MuiInputBase-root': { color: '#0f172a', bgcolor: '#fff' }, '& .MuiFormLabel-root': { color: '#64748b' } }}
                    />
                    <TextField 
                      size="small" label="Input Label" value={v.label} 
                      onChange={e => {
                        const newVars = [...(block.variables || [])];
                        newVars[vIndex].label = e.target.value;
                        onUpdate(block.id, { variables: newVars });
                      }}
                      sx={{ flex: 1, '& fieldset': { borderColor: '#cbd5e1' }, '& .MuiInputBase-root': { color: '#0f172a', bgcolor: '#fff' }, '& .MuiFormLabel-root': { color: '#64748b' } }}
                    />
                    <IconButton 
                      color="error" 
                      onClick={() => {
                        const newVars = [...(block.variables || [])];
                        newVars.splice(vIndex, 1);
                        onUpdate(block.id, { variables: newVars });
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
                    onUpdate(block.id, { variables: newVars });
                  }}
                  sx={{ color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.3)', bgcolor: '#fff', borderRadius: 2, fontWeight: 700 }}
                >
                  + Add Variable
                </Button>
              </Box>
            )}

            {(block.type === 'PROMPT_BUILDER' || block.type === 'TEXT') && (
              <TextField 
                multiline fullWidth minRows={6}
                label={block.type === 'PROMPT_BUILDER' ? "Prompt Template" : "Content (Markdown Supported)"}
                value={block.content}
                onChange={e => onUpdate(block.id, { content: e.target.value })}
                sx={{ '& fieldset': { borderColor: '#cbd5e1' }, '& .MuiInputBase-root': { color: '#0f172a', fontFamily: 'monospace', bgcolor: '#f8fafc' }, '& .MuiFormLabel-root': { color: '#64748b' } }}
              />
            )}
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
}
