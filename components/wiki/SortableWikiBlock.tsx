'use client';

import React from 'react';
import { 
  Box, Typography, IconButton, Paper, TextField, 
  FormControl, InputLabel, Select, MenuItem, Collapse 
} from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

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
                {block.type === 'PROMPT_BUILDER' ? 'Prompt Builder' : 'Text Block'}
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

            <TextField 
              multiline fullWidth minRows={6}
              label={block.type === 'PROMPT_BUILDER' ? "Prompt Template" : "Content (Markdown Supported)"}
              value={block.content}
              onChange={e => onUpdate(block.id, { content: e.target.value })}
              sx={{ '& fieldset': { borderColor: '#cbd5e1' }, '& .MuiInputBase-root': { color: '#0f172a', fontFamily: 'monospace', bgcolor: '#f8fafc' }, '& .MuiFormLabel-root': { color: '#64748b' } }}
            />
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
}
