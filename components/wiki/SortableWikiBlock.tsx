'use client';

import React, { useState } from 'react';
import { 
  Box, Typography, IconButton, Paper, TextField, 
  FormControl, InputLabel, Select, MenuItem, Collapse, Button, Checkbox, FormControlLabel, alpha, Tooltip, Chip
} from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import PremiumTextField from '@/components/PremiumTextField';
import PremiumAutocomplete from '@/components/PremiumAutocomplete';
import PremiumButton from '@/components/PremiumButton';
import PremiumMarkdownEditor from '@/components/PremiumMarkdownEditor';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ImageIcon from '@mui/icons-material/Image';
import CheckIcon from '@mui/icons-material/Check';

const getBlockColor = (type: string, calloutType?: string) => {
  switch (type) {
    case 'HEADER': return '#3b82f6';
    case 'CALLOUT': 
       if (calloutType === 'danger') return '#ef4444';
       if (calloutType === 'warning') return '#f59e0b';
       return '#3b82f6';
    case 'CHECKLIST': return '#10b981';
    case 'CODE_SNIPPET': return '#8b5cf6';
    case 'MEDIA': return '#ec4899';
    case 'PROMPT_BUILDER': return '#f43f5e';
    case 'TEXT': default: return '#64748b';
  }
};

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

  const color = getBlockColor(block.type, block.calloutType);
  const isFlipped = isExpanded;

  return (
    <Box ref={setNodeRef} style={style}>
      <Box sx={{ perspective: '1000px', mb: 2, opacity: isDragging ? 0.8 : 1 }}>
        <Box sx={{
          position: 'relative',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateX(-180deg)' : 'none',
        }}>
          {/* FRONT FACE (Overview) */}
          <Box sx={{
            backfaceVisibility: 'hidden',
            position: isFlipped ? 'absolute' : 'relative',
            width: '100%',
            borderRadius: '24px',
            border: `1px solid ${isComplete ? alpha(color, 0.4) : '#e2e8f0'}`,
            background: isComplete ? `linear-gradient(135deg, ${alpha(color, 0.8)} 0%, ${color} 100%)` : '#fff',
            boxShadow: isComplete ? `0 8px 24px ${alpha(color, 0.25)}` : '0 4px 20px rgba(0,0,0,0.02)',
            overflow: 'hidden',
            cursor: reorderUnlocked ? 'default' : 'pointer',
            pointerEvents: isFlipped ? 'none' : 'auto',
          }} onClick={() => !reorderUnlocked && onToggleExpand()}>
            <Box sx={{ display: 'flex', alignItems: 'stretch', position: 'relative', zIndex: 1 }}>
              {/* Left Accent Bar */}
              <Box sx={{
                width: isComplete ? 0 : 8, flexShrink: 0,
                background: isComplete ? 'transparent' : `linear-gradient(180deg, ${alpha(color, 0.5)} 0%, ${alpha(color, 0.1)} 100%)`,
              }} />
              
              <Box sx={{ p: 2, px: 3, flex: 1, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                {/* Number Badge & Progress */}
                <Box sx={{
                  width: 44, height: 44, borderRadius: '14px', flexShrink: 0,
                  bgcolor: isComplete ? 'rgba(255,255,255,0.2)' : alpha(color, 0.1), 
                  border: isComplete ? '1px solid rgba(255,255,255,0.3)' : `1px solid ${alpha(color, 0.2)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isComplete ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {isComplete ? <CheckIcon sx={{ color: '#fff' }} /> : <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color }}>{index + 1}</Typography>}
                </Box>
                
                {/* Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                    <Typography sx={{ fontWeight: 800, color: isComplete ? '#fff' : '#0f172a', fontSize: '1.1rem' }}>
                      {getBlockTitle()}
                    </Typography>
                    <Chip label={block.type} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: isComplete ? 'rgba(255,255,255,0.2)' : alpha(color, 0.15), color: isComplete ? '#fff' : color, fontWeight: 700 }} />
                  </Box>
                  <Typography sx={{ color: isComplete ? 'rgba(255,255,255,0.8)' : '#64748b', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {isComplete ? 'Content added — tap to edit' : 'Tap to fill this block'}
                  </Typography>
                </Box>

                {/* Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                  {reorderUnlocked && (
                    <Box {...attributes} {...listeners} sx={{ cursor: 'grab', display: 'flex', color: isComplete ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}>
                      <DragIndicatorIcon />
                    </Box>
                  )}
                  {!reorderUnlocked && (
                    <IconButton size="small" onClick={() => onRemove(block.id)} sx={{ color: isComplete ? '#fff' : '#ef4444' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* BACK FACE (Editor) */}
          <Box sx={{
            backfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
            position: isFlipped ? 'relative' : 'absolute',
            width: '100%', top: 0,
            borderRadius: '24px',
            border: `2px solid ${alpha(color, 0.5)}`,
            background: `linear-gradient(135deg, #fff 0%, #f8fafc 100%)`,
            boxShadow: `0 16px 48px ${alpha(color, 0.15)}`,
            overflow: 'hidden',
            pointerEvents: isFlipped ? 'auto' : 'none',
          }}>
            {/* Back header */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 2,
              px: 3, py: 2,
              borderBottom: `1px solid rgba(0,0,0,0.06)`,
              background: alpha(color, 0.05),
            }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '10px', bgcolor: alpha(color, 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${alpha(color, 0.2)}` }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color }}>{index + 1}</Typography>
              </Box>
              <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', flex: 1 }}>
                Editing {getBlockTitle()}
              </Typography>
              <Tooltip title="Done editing">
                <IconButton
                  size="medium"
                  onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
                  sx={{
                    bgcolor: color, color: '#fff',
                    boxShadow: `0 4px 12px ${alpha(color, 0.3)}`,
                    '&:hover': { bgcolor: alpha(color, 0.9), transform: 'scale(1.05)' },
                  }}
                >
                  <CheckIcon sx={{ fontSize: 20, fontWeight: 900 }} />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <PremiumAutocomplete
                  label="Block Type"
                  value={block.type}
                  options={[
                    { label: 'Text Markdown', value: 'TEXT', description: 'Standard formatted content area' },
                    { label: 'Header', value: 'HEADER', description: 'Large section titles and dividers' },
                    { label: 'Callout (Alert)', value: 'CALLOUT', description: 'Highlight important information' },
                    { label: 'Checklist', value: 'CHECKLIST', description: 'Interactive to-do list items' },
                    { label: 'Code Snippet', value: 'CODE_SNIPPET', description: 'Formatted code block with syntax styling' },
                    { label: 'Media / Image', value: 'MEDIA', description: 'Embed images and visual assets' },
                    { label: 'Prompt Builder', value: 'PROMPT_BUILDER', description: 'Interactive AI prompt interface' },
                  ]}
                  onChange={(_, val: any) => onUpdate(block.id, { type: val?.value || val })}
                  colorTheme={color}
                  disableClearable
                  renderOption={(props, option: any) => (
                    <Box component="li" {...props} sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-start !important',
                      p: '12px 16px !important',
                      mb: '8px !important',
                      borderRadius: '14px !important',
                      border: '1px solid rgba(255, 255, 255, 0.6)',
                      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 100%)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:active': { transform: 'scale(0.97)' },
                      '&[aria-selected="true"]': {
                          background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
                          borderColor: alpha(color, 0.5),
                          boxShadow: `0 8px 24px ${alpha(color, 0.4)}`,
                          '& .label-text, & .desc-text': { color: '#ffffff' },
                      },
                      '&.Mui-focused:not([aria-selected="true"])': {
                          background: `linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))`,
                          boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                          transform: 'translateY(-2px)',
                          borderColor: 'rgba(255,255,255,0.9)',
                      }
                    }}>
                      <Typography className="label-text" variant="body2" sx={{ fontFamily: 'inherit', fontWeight: 600, color: '#334155', letterSpacing: '-0.01em', fontSize: '0.95rem', transition: 'color 0.2s ease' }}>{option.label}</Typography>
                      {option.description && (
                        <Typography className="desc-text" variant="caption" sx={{ fontFamily: 'inherit', color: '#64748b', mt: 0.5, lineHeight: 1.3, fontWeight: 500, transition: 'color 0.2s ease' }}>
                          {option.description}
                        </Typography>
                      )}
                    </Box>
                  )}
                />
                <PremiumAutocomplete
                  label="Visibility"
                  value={block.visibility}
                  options={[
                    { label: 'Public', value: 'public', description: 'Visible to anyone on the internet' },
                    { label: 'Internal Staff', value: 'internal_staff', description: 'Visible to logged-in team members' },
                    { label: 'Admin Only', value: 'admin', description: 'Visible to platform administrators only' },
                    { label: 'Whitelist Only', value: 'whitelist_only', description: 'Visible only to explicitly permitted users' },
                  ]}
                  onChange={(_, val: any) => onUpdate(block.id, { visibility: val?.value || val })}
                  colorTheme={color}
                  disableClearable
                  renderOption={(props, option: any) => (
                    <Box component="li" {...props} sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-start !important',
                      p: '12px 16px !important',
                      mb: '8px !important',
                      borderRadius: '14px !important',
                      border: '1px solid rgba(255, 255, 255, 0.6)',
                      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 100%)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:active': { transform: 'scale(0.97)' },
                      '&[aria-selected="true"]': {
                          background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
                          borderColor: alpha(color, 0.5),
                          boxShadow: `0 8px 24px ${alpha(color, 0.4)}`,
                          '& .label-text, & .desc-text': { color: '#ffffff' },
                      },
                      '&.Mui-focused:not([aria-selected="true"])': {
                          background: `linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))`,
                          boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                          transform: 'translateY(-2px)',
                          borderColor: 'rgba(255,255,255,0.9)',
                      }
                    }}>
                      <Typography className="label-text" variant="body2" sx={{ fontFamily: 'inherit', fontWeight: 600, color: '#334155', letterSpacing: '-0.01em', fontSize: '0.95rem', transition: 'color 0.2s ease' }}>{option.label}</Typography>
                      {option.description && (
                        <Typography className="desc-text" variant="caption" sx={{ fontFamily: 'inherit', color: '#64748b', mt: 0.5, lineHeight: 1.3, fontWeight: 500, transition: 'color 0.2s ease' }}>
                          {option.description}
                        </Typography>
                      )}
                    </Box>
                  )}
                />
              </Box>

              {/* Dynamic UI based on block type */}
              {block.type === 'HEADER' && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ width: 160 }}>
                    <PremiumAutocomplete
                      label="Size"
                      value={block.headerLevel || 2}
                      options={[
                        { label: 'H1 (Large)', value: 1 },
                        { label: 'H2 (Medium)', value: 2 },
                        { label: 'H3 (Small)', value: 3 },
                      ]}
                      onChange={(_, val: any) => onUpdate(block.id, { headerLevel: val?.value || val })}
                      colorTheme={color}
                      disableClearable
                    />
                  </Box>
                  <PremiumTextField 
                    fullWidth label="Header Text" value={block.content} onChange={e => onUpdate(block.id, { content: e.target.value })}
                    colorTheme={color}
                  />
                </Box>
              )}

              {block.type === 'CALLOUT' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <PremiumAutocomplete
                    label="Callout Style"
                    value={block.calloutType || 'info'}
                    options={[
                      { label: 'Info (Blue)', value: 'info' },
                      { label: 'Warning (Yellow)', value: 'warning' },
                      { label: 'Danger (Red)', value: 'danger' },
                    ]}
                    onChange={(_, val: any) => onUpdate(block.id, { calloutType: val?.value || val })}
                    colorTheme={color}
                    disableClearable
                  />
                  <PremiumMarkdownEditor 
                    fullWidth minRows={2} label="Callout Text" value={block.content} onChange={(e: any) => onUpdate(block.id, { content: e.target.value })}
                    colorTheme={color}
                  />
                </Box>
              )}

              {block.type === 'CODE_SNIPPET' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <PremiumTextField 
                    label="Language (e.g. javascript, python)" value={block.codeLanguage || ''} onChange={e => onUpdate(block.id, { codeLanguage: e.target.value })}
                    colorTheme={color}
                  />
                  <PremiumTextField 
                    multiline fullWidth minRows={4} label="Code Content" value={block.content} onChange={e => onUpdate(block.id, { content: e.target.value })}
                    colorTheme={color}
                    sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace', bgcolor: alpha(color, 0.02) } }}
                  />
                </Box>
              )}

              {block.type === 'CHECKLIST' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <PremiumTextField 
                    label="Checklist Title / Context" value={block.content || ''} onChange={e => onUpdate(block.id, { content: e.target.value })}
                    colorTheme={color} placeholder="e.g. CRITICAL: Verify the AI output for Step 3"
                  />
                  
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Type:</Typography>
                    {['regular', 'important'].map(t => (
                      <Chip 
                        key={t} label={t.toUpperCase()}
                        onClick={() => onUpdate(block.id, { checklistType: t as any })}
                        sx={{ 
                          fontWeight: 800, fontSize: '0.75rem', borderRadius: '8px', cursor: 'pointer',
                          bgcolor: block.checklistType === t || (!block.checklistType && t === 'regular') ? alpha(color, 0.2) : alpha('#94a3b8', 0.1),
                          color: block.checklistType === t || (!block.checklistType && t === 'regular') ? color : '#64748b',
                          border: `1px solid ${block.checklistType === t || (!block.checklistType && t === 'regular') ? color : 'transparent'}`
                        }} 
                      />
                    ))}
                  </Box>

                  <Box sx={{ bgcolor: alpha(color, 0.03), p: 3, borderRadius: '16px', border: `1px dashed ${alpha(color, 0.2)}` }}>
                    <Typography variant="subtitle2" sx={{ color: color, mb: 2, display: 'block', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Checklist Items</Typography>
                  {(block.checklistItems || []).map((item: any, iIndex: number) => (
                    <Box key={item.id} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'center', p: 1, pr: 2, bgcolor: '#fff', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <DragIndicatorIcon sx={{ color: 'rgba(0,0,0,0.2)' }} />
                      <Checkbox disabled checked={item.checked} sx={{ color: alpha(color, 0.4), '&.Mui-checked': { color } }} />
                      <PremiumTextField 
                        size="small" placeholder="Checklist item text..." value={item.text} 
                        onChange={e => {
                          const newItems = [...(block.checklistItems || [])];
                          newItems[iIndex].text = e.target.value;
                          onUpdate(block.id, { checklistItems: newItems });
                        }}
                        colorTheme={color}
                        sx={{ flex: 1 }}
                      />
                      <IconButton color="error" size="small" sx={{ '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }} onClick={() => {
                        const newItems = [...(block.checklistItems || [])];
                        newItems.splice(iIndex, 1);
                        onUpdate(block.id, { checklistItems: newItems });
                      }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                  <Box sx={{ mt: 2 }}>
                    <PremiumButton size="small" baseColor={color} onClick={() => {
                      const newItems = [...(block.checklistItems || []), { id: Date.now().toString(), text: '', checked: false }];
                      onUpdate(block.id, { checklistItems: newItems });
                    }}>
                      + Add Item
                    </PremiumButton>
                  </Box>
                  </Box>
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
                  <PremiumTextField 
                    fullWidth label="Caption (Optional)" value={block.content} onChange={e => onUpdate(block.id, { content: e.target.value })}
                    colorTheme={color}
                  />
                </Box>
              )}

              {block.type === 'PROMPT_BUILDER' && (
                <Box sx={{ bgcolor: alpha(color, 0.03), p: 3, borderRadius: '16px', border: `1px dashed ${alpha(color, 0.2)}` }}>
                  <Typography variant="subtitle2" sx={{ color: color, mb: 1, display: 'block', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prompt Variables</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', mb: 3, display: 'block' }}>
                    Add curly braces {"{{variable_name}}"} in your prompt, then define them below.
                  </Typography>
                  
                  {(block.variables || []).map((v: any, vIndex: number) => (
                    <Box key={vIndex} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'center', p: 1, pr: 2, bgcolor: '#fff', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <DragIndicatorIcon sx={{ color: 'rgba(0,0,0,0.2)' }} />
                      <PremiumTextField 
                        size="small" label="Variable Name (no braces)" value={v.name} 
                        onChange={e => {
                          const newVars = [...(block.variables || [])];
                          newVars[vIndex].name = e.target.value;
                          onUpdate(block.id, { variables: newVars });
                        }}
                        colorTheme={color}
                        sx={{ flex: 1 }}
                      />
                      <PremiumTextField 
                        size="small" label="Input Label" value={v.label} 
                        onChange={e => {
                          const newVars = [...(block.variables || [])];
                          newVars[vIndex].label = e.target.value;
                          onUpdate(block.id, { variables: newVars });
                        }}
                        colorTheme={color}
                        sx={{ flex: 1 }}
                      />
                      <IconButton 
                        color="error" size="small" sx={{ '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}
                        onClick={() => {
                          const newVars = [...(block.variables || [])];
                          newVars.splice(vIndex, 1);
                          onUpdate(block.id, { variables: newVars });
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                  <Box sx={{ mt: 2 }}>
                    <PremiumButton 
                      size="small" 
                      baseColor={color}
                      onClick={() => {
                        const newVars = [...(block.variables || []), { name: 'new_var', label: 'New Variable' }];
                        onUpdate(block.id, { variables: newVars });
                      }}
                    >
                      + Add Variable
                    </PremiumButton>
                  </Box>
                </Box>
              )}

              {block.type === 'TEXT' && (
                <PremiumMarkdownEditor
                  fullWidth minRows={6}
                  label="Content (Markdown Supported)"
                  value={block.content}
                  onChange={(e: any) => onUpdate(block.id, { content: e.target.value })}
                  colorTheme={color}
                />
              )}

              {block.type === 'PROMPT_BUILDER' && (
                <PremiumTextField 
                  multiline fullWidth minRows={6}
                  label="Prompt Template"
                  value={block.content}
                  onChange={e => onUpdate(block.id, { content: e.target.value })}
                  colorTheme={color}
                  sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace', bgcolor: alpha(color, 0.02) } }}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
