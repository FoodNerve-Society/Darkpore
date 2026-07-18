'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Chip, Divider, IconButton } from '@mui/material';
import { WikiBlock } from '@/lib/actions/wiki';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SecurityIcon from '@mui/icons-material/Security';
import DocIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';

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
  headerContent?: React.ReactNode;
}

export default function WikiReader({ doc, loading, isAdmin, hasAccess, canSeeBlock, onEdit, headerContent }: WikiReaderProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#ffffff' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {headerContent}
          <DocIcon sx={{ color: '#10b981' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#0f172a' }}>
            Omni-Wiki Reader {loading && <span style={{ opacity: 0.5, fontSize: '0.8rem', marginLeft: 8 }}>Loading...</span>}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAdmin && doc && onEdit && (
            <Button 
              onClick={onEdit} 
              startIcon={<EditIcon />}
              sx={{ color: '#3b82f6', fontWeight: 700 }}
            >
              Edit SOP
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 6 } }}>
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
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f172a' }}>{doc.title}</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
               <Chip label={doc.category} size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#059669', fontWeight: 700 }} />
               {doc.isPublic ? (
                 <Chip label="Public" size="small" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', fontWeight: 700 }} />
               ) : (
                 <Chip label="Restricted" size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', fontWeight: 700 }} />
               )}
            </Box>
            
            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {doc.blocks.filter(canSeeBlock).map((block: WikiBlock, index: number) => (
                <Box key={block.id}>
                  {isAdmin && (
                    <Typography variant="caption" sx={{ color: '#f59e0b', mb: 1, display: 'block', fontWeight: 700 }}>
                      [Admin View] Block {index + 1} - Visibility: {block.visibility}
                    </Typography>
                  )}
                  {block.type === 'TEXT' && (
                    <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: '#334155', fontSize: '1.05rem' }}>
                      {block.content}
                    </Typography>
                  )}
                  {block.type === 'PROMPT_BUILDER' && (
                    <PromptBuilderBlock block={block} />
                  )}
                </Box>
              ))}
              
              {doc.blocks.filter(canSeeBlock).length === 0 && (
                 <Typography sx={{ color: 'text.disabled', fontStyle: 'italic' }}>No visible steps available in this SOP.</Typography>
              )}
            </Box>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
