'use client';

import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, IconButton, Button, TextField, FormControl, InputLabel, Select, MenuItem, Chip, Switch, FormControlLabel, Divider } from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import { useSociety } from '@/context/SocietyContext';
import { getWikiDoc, createOrUpdateWikiDoc, WikiDocInput, WikiBlock } from '@/lib/actions/wiki';

import CloseIcon from '@mui/icons-material/Close';
import DocIcon from '@mui/icons-material/Description';
import SecurityIcon from '@mui/icons-material/Security';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
    <Box sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '16px', p: 4, mb: 4 }}>
      <Typography variant="overline" sx={{ color: '#60a5fa', fontWeight: 800, mb: 3, display: 'block', fontSize: '0.9rem' }}>Prompt Builder</Typography>
      
      {block.variables && block.variables.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mb: 4 }}>
          {block.variables.map(v => (
            <TextField 
              key={v.name}
              label={v.label}
              variant="outlined"
              size="medium"
              value={inputs[v.name] || ''}
              onChange={(e) => setInputs({ ...inputs, [v.name]: e.target.value })}
              slotProps={{
                input: { sx: { color: '#0f172a', bgcolor: '#fff', borderRadius: '12px' } } as any,
                inputLabel: { sx: { color: '#64748b' } } as any
              }}
              sx={{ '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' } }}
            />
          ))}
        </Box>
      )}

      <Box sx={{ p: 3, bgcolor: '#0f172a', borderRadius: '12px', mb: 3, boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)' }}>
        <Typography sx={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: '0.9rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          {block.content}
        </Typography>
      </Box>

      <Button variant="contained" size="large" startIcon={<ContentCopyIcon />} onClick={handleCopy} sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, borderRadius: '12px', fontWeight: 800 }}>
        Copy Final Prompt
      </Button>
    </Box>
  );
}

// --- Main Page Component ---
export default function WikiDocPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const tenant = params.tenant as string;
  const { profile } = useSociety();
  
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editForm, setEditForm] = useState<WikiDocInput>({
    slug: '', title: '', category: 'operations', isPublic: false, allowedRoles: ['internal_staff'], allowedUsers: [], blocks: [], tags: [], authorId: ''
  });

  useEffect(() => {
    if (profile) {
      if (slug && slug !== 'new') {
        loadDoc(slug);
      } else {
         setDoc(null);
         setIsEditing(true);
         setEditForm({
           slug: '', title: '', category: 'operations', isPublic: false, allowedRoles: ['internal_staff'], allowedUsers: [], blocks: [], tags: [], authorId: profile.uid
         });
         setLoading(false);
      }
    }
  }, [slug, profile]);

  const loadDoc = async (docSlug: string) => {
    setLoading(true);
    const res = await getWikiDoc(docSlug);
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
        authorId: res.data.authorId
      });
      setIsEditing(false);
    } else {
      setDoc(null);
      setEditForm({
        slug: docSlug, title: '', category: 'operations', isPublic: false, allowedRoles: ['internal_staff'], allowedUsers: [], blocks: [], tags: [], authorId: profile?.uid || ''
      });
      setIsEditing(false);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editForm.title || !editForm.slug) {
      alert("Title and Slug are required.");
      return;
    }
    setLoading(true);
    const res = await createOrUpdateWikiDoc({ ...editForm, authorId: profile?.uid || 'unknown' });
    if (res.success) {
      if (slug === 'new') {
        router.replace(`/profile/wiki/${editForm.slug}`);
      } else {
        await loadDoc(editForm.slug);
        setIsEditing(false);
      }
    } else {
      alert("Error saving: " + res.error);
    }
    setLoading(false);
  };

  const userRoles = profile?.roles || ['guest'];
  const isAdmin = profile?.isAdmin || false;
  const uid = profile?.uid || 'guest';

  const canSeeBlock = (block: WikiBlock) => {
    if (isAdmin) return true;
    if (block.visibility === 'public') return true;
    if (block.visibility === 'internal_staff' && (userRoles as string[]).includes('internal_staff')) return true;
    if (block.visibility === 'admin' && (userRoles as string[]).includes('admin')) return true;
    if (block.visibility === 'whitelist_only' && block.whitelistUsers?.includes(uid)) return true;
    return false;
  };

  const canSeeDoc = () => {
    if (!doc) return false;
    if (isAdmin) return true;
    if (doc.isPublic) return true;
    if (doc.allowedRoles.some((r: string) => (userRoles as string[]).includes(r))) return true;
    if (doc.allowedUsers.includes(uid)) return true;
    return false;
  };

  const hasAccess = canSeeDoc();

  // --- Front Face (Reader) ---
  const renderReader = () => (
    <Box sx={{ width: '100%', minHeight: '80vh', bgcolor: '#fff', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', p: { xs: 3, md: 6 }, display: 'flex', flexDirection: 'column' }}>
      {/* Reader Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 6, pb: 4, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1.5, bgcolor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
            <DocIcon sx={{ color: '#10b981', fontSize: 28 }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>
            Omni-Wiki {loading && <span style={{ opacity: 0.5, fontSize: '0.8rem', marginLeft: 8 }}>Loading...</span>}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isAdmin && doc && (
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setIsEditing(true)} sx={{ borderRadius: '100px', fontWeight: 700, borderColor: 'rgba(0,0,0,0.1)', color: '#0f172a' }}>
              Edit SOP
            </Button>
          )}
        </Box>
      </Box>

      {/* Reader Content */}
      <Box sx={{ flex: 1 }}>
        {loading ? (
           <Typography sx={{ textAlign: 'center', color: '#64748b', mt: 10 }}>Loading Document...</Typography>
        ) : !doc ? (
          <Box sx={{ textAlign: 'center', mt: 10 }}>
             <Typography sx={{ color: '#64748b', mb: 3 }}>Document not found.</Typography>
             {isAdmin && (
                <Button variant="contained" onClick={() => setIsEditing(true)} sx={{ bgcolor: '#0f172a', color: '#fff', borderRadius: '100px', px: 4 }}>
                   Create this Document
                </Button>
             )}
          </Box>
        ) : !hasAccess ? (
          <Box sx={{ textAlign: 'center', mt: 10 }}>
            <SecurityIcon sx={{ color: '#ef4444', fontSize: 60, opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>Access Denied</Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>Clearance level insufficient.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '800px', mx: 'auto' }}>
            <Box>
              <Typography variant="h2" sx={{ fontWeight: 900, color: '#0f172a', mb: 2, letterSpacing: '-0.02em', fontSize: { xs: '2.5rem', md: '3.5rem' } }}>{doc.title}</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                 <Chip label={doc.category} size="medium" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#059669', fontWeight: 700 }} />
                 {doc.isPublic ? (
                   <Chip label="Public" size="medium" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', fontWeight: 700 }} />
                 ) : (
                   <Chip label="Restricted" size="medium" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', fontWeight: 700 }} />
                 )}
              </Box>
            </Box>
            
            <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)', my: 2 }} />

            {/* Blocks */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {doc.blocks.filter(canSeeBlock).map((block: WikiBlock, index: number) => (
                <Box key={block.id}>
                  {isAdmin && (
                    <Typography variant="caption" sx={{ color: '#f59e0b', mb: 1, display: 'block', fontWeight: 700 }}>
                      [Admin View] Block {index + 1} - Visibility: {block.visibility}
                    </Typography>
                  )}
                  {block.type === 'TEXT' && (
                    <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: '#334155', fontSize: '1.1rem' }}>
                      {block.content}
                    </Typography>
                  )}
                  {block.type === 'PROMPT_BUILDER' && (
                    <PromptBuilderBlock block={block} />
                  )}
                </Box>
              ))}
              
              {doc.blocks.filter(canSeeBlock).length === 0 && (
                 <Typography sx={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', py: 6 }}>No visible steps available in this SOP.</Typography>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );

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

  // --- Back Face (Editor Studio) ---
  const renderEditor = () => (
    <Box sx={{ width: '100%', minHeight: '80vh', bgcolor: '#0f172a', borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', p: { xs: 3, md: 6 }, display: 'flex', flexDirection: 'column' }}>
       {/* Editor Header */}
       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 6, pb: 4, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1.5, bgcolor: 'rgba(96, 165, 250, 0.1)', borderRadius: '12px' }}>
            <EditIcon sx={{ color: '#60a5fa', fontSize: 28 }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>
            Wiki Studio {loading && <span style={{ opacity: 0.5, fontSize: '0.8rem', marginLeft: 8 }}>Saving...</span>}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            onClick={handleSave} 
            disabled={loading} 
            variant="contained" 
            startIcon={<SaveIcon />}
            sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, borderRadius: '100px', fontWeight: 800, px: 4 }}
          >
            Save Changes
          </Button>
          {slug !== 'new' && (
             <Button variant="text" onClick={() => setIsEditing(false)} sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
               Cancel
             </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '1000px', mx: 'auto', w: '100%' }}>
         {/* Settings Panel */}
         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, bgcolor: 'rgba(255,255,255,0.03)', p: 4, borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff' }}>Document Settings</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <TextField 
                label="Title" variant="outlined" 
                value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})}
                sx={{ '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '& .MuiInputBase-root': { color: '#fff' }, '& .MuiFormLabel-root': { color: 'rgba(255,255,255,0.7)' } }}
              />
              <TextField 
                label="Unique Slug" variant="outlined" 
                value={editForm.slug} onChange={e => setEditForm({...editForm, slug: e.target.value})}
                disabled={slug !== 'new'}
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
              <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                <FormControlLabel 
                  control={<Switch checked={editForm.isPublic} onChange={e => setEditForm({...editForm, isPublic: e.target.checked})} color="primary" />} 
                  label={<Typography sx={{ fontWeight: 700 }}>Is Public Document?</Typography>} 
                  sx={{ color: 'rgba(255,255,255,0.9)' }}
                />
              </Box>
            </Box>
         </Box>

         <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

         {/* Blocks Editor */}
         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff' }}>Content Blocks</Typography>
            <Button startIcon={<AddIcon />} variant="outlined" onClick={addBlock} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', borderRadius: '100px', fontWeight: 700 }}>
              Add Block
            </Button>
         </Box>

         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
           {editForm.blocks.map((block, index) => (
             <Box key={block.id} sx={{ bgcolor: 'rgba(255,255,255,0.05)', p: 4, borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Block {index + 1}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" onClick={() => moveBlock(index, 'up')} sx={{ color: 'rgba(255,255,255,0.5)', bgcolor: 'rgba(255,255,255,0.1)' }}><ArrowUpwardIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => moveBlock(index, 'down')} sx={{ color: 'rgba(255,255,255,0.5)', bgcolor: 'rgba(255,255,255,0.1)' }}><ArrowDownwardIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => removeBlock(index)} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.1)', ml: 2 }}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
                  <FormControl sx={{ '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } }}>
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Type</InputLabel>
                    <Select value={block.type} label="Type" onChange={e => updateBlock(index, { type: e.target.value as any })} sx={{ color: '#fff' }}>
                      <MenuItem value="TEXT">Text / Markdown</MenuItem>
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
                  <Box sx={{ mb: 3, bgcolor: 'rgba(0,0,0,0.3)', p: 3, borderRadius: '16px' }}>
                    <Typography variant="subtitle2" sx={{ color: '#60a5fa', mb: 1, display: 'block', fontWeight: 800 }}>Prompt Variables Setup</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 3, display: 'block' }}>
                      To add a dynamic input variable, use curly braces in your prompt content: {"{{variable_name}}"}. Then define it below.
                    </Typography>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => {
                        const newVars = [...(block.variables || []), { name: 'new_var', label: 'New Variable' }];
                        updateBlock(index, { variables: newVars });
                      }}
                      sx={{ color: '#60a5fa', borderColor: '#60a5fa', mb: 3, fontWeight: 700, borderRadius: '100px' }}
                    >
                      + Add Variable
                    </Button>
                    {block.variables?.map((v, vIndex) => (
                      <Box key={vIndex} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField 
                          size="small" placeholder="Variable Name (e.g. topic)" value={v.name} 
                          onChange={e => {
                            const newVars = [...(block.variables || [])];
                            newVars[vIndex].name = e.target.value;
                            updateBlock(index, { variables: newVars });
                          }}
                          sx={{ flex: 1, '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '& .MuiInputBase-root': { color: '#fff' } }}
                        />
                        <TextField 
                          size="small" placeholder="Label (e.g. Enter Topic)" value={v.label} 
                          onChange={e => {
                            const newVars = [...(block.variables || [])];
                            newVars[vIndex].label = e.target.value;
                            updateBlock(index, { variables: newVars });
                          }}
                          sx={{ flex: 1, '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '& .MuiInputBase-root': { color: '#fff' } }}
                        />
                        <IconButton 
                          size="small" color="error" 
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
                  </Box>
                )}

                <TextField 
                  multiline fullWidth minRows={6}
                  label={block.type === 'PROMPT_BUILDER' ? "Prompt Template" : "Content (Markdown)"}
                  value={block.content}
                  onChange={e => updateBlock(index, { content: e.target.value })}
                  sx={{ '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '& .MuiInputBase-root': { color: '#fff', fontFamily: 'monospace', fontSize: '1.1rem' }, '& .MuiFormLabel-root': { color: 'rgba(255,255,255,0.7)' } }}
                />
             </Box>
           ))}
           {editForm.blocks.length === 0 && (
             <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
               <Typography sx={{ color: 'rgba(255,255,255,0.5)', mb: 2, fontSize: '1.1rem' }}>No blocks added yet.</Typography>
               <Button startIcon={<AddIcon />} variant="contained" onClick={addBlock} sx={{ bgcolor: '#fff', color: '#0f172a', borderRadius: '100px', fontWeight: 800, '&:hover': { bgcolor: '#e2e8f0' } }}>
                 Add First Block
               </Button>
             </Box>
           )}
         </Box>
      </Box>
    </Box>
  );

  const flipContainerSx = { position: 'relative' as const, width: '100%', perspective: '2000px' };
  const flipperSx = { width: '100%', position: 'relative' as const, transition: 'transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)', transformStyle: 'preserve-3d' as const, transform: isEditing ? 'rotateY(180deg)' : 'rotateY(0deg)' };
  const faceSx = { width: '100%', backfaceVisibility: 'hidden' as const, WebkitBackfaceVisibility: 'hidden' as const };
  const backFaceSx = { ...faceSx, position: 'absolute' as const, top: 0, left: 0, transform: 'rotateY(180deg)' };

  return (
    <Box sx={{ flex: 1, minHeight: 0, height: '100%', overflowY: 'auto', overflowX: 'hidden', bgcolor: '#f8fafc', WebkitOverflowScrolling: 'touch' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        {/* Floating Nav Button */}
        {!isEditing && (
          <Box sx={{ mb: 2 }}>
            <Button
              onClick={() => router.push(`/profile/wiki`)}
              startIcon={<ArrowBackIcon />}
              sx={{ color: '#64748b', fontWeight: 700, '&:hover': { color: '#0f172a', bgcolor: 'rgba(0,0,0,0.05)' }, borderRadius: '100px', px: 2 }}
            >
              Back to Hub
            </Button>
          </Box>
        )}

        <Box sx={flipContainerSx}>
          <Box sx={flipperSx}>
             <Box sx={faceSx}>{renderReader()}</Box>
             <Box sx={backFaceSx}>{renderEditor()}</Box>
          </Box>
        </Box>

      </Container>
    </Box>
  );
}
