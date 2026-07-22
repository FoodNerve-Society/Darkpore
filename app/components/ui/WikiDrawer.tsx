'use client';

import React, { useEffect, useState } from 'react';
import { useWiki } from '../providers/WikiProvider';
import { getWikiDoc, WikiBlock } from '@/lib/actions/wiki';
import { useSociety } from '@/context/SocietyContext';
import { useRouter } from 'next/navigation';

// MUI Imports
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import DocIcon from '@mui/icons-material/Description';
import SecurityIcon from '@mui/icons-material/Security';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

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
              slotProps={{
                input: { sx: { color: '#fff' } } as any,
                inputLabel: { sx: { color: 'rgba(255,255,255,0.7)' } } as any
              }}
              sx={{ '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } }}
            />
          ))}
        </Box>
      )}

      <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: '8px', mb: 2 }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
          {block.content}
        </Typography>
      </Box>

      <Button variant="contained" startIcon={<ContentCopyIcon />} onClick={handleCopy} sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}>
        Copy Final Prompt
      </Button>
    </Box>
  );
}

// --- Main Drawer Component ---
export function WikiDrawer() {
  const { isOpen, closeWiki, activeDocId } = useWiki();
  const { profile, activeOrg } = useSociety();
  const router = useRouter();
  
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && activeDocId) {
      loadDoc(activeDocId);
    } else {
      setDoc(null);
    }
  }, [isOpen, activeDocId, profile]);

  const loadDoc = async (slug: string) => {
    setLoading(true);
    const res = await getWikiDoc(slug);
    if (res.success && res.data) {
      setDoc(res.data);
    } else {
      setDoc(null);
    }
    setLoading(false);
  };

  const userRoles = profile?.roles || ['guest'];
  const isAdmin = profile?.isAdmin || false;
  const uid = profile?.uid || 'guest';

  // Helper to check if current user can see a block
  const canSeeBlock = (block: WikiBlock) => {
    if (isAdmin) return true;
    if (block.visibility === 'public') return true;
    if (block.visibility === 'internal_staff' && (userRoles as string[]).includes('internal_staff')) return true;
    if (block.visibility === 'admin' && (userRoles as string[]).includes('admin')) return true;
    if (block.visibility === 'whitelist_only' && block.whitelistUsers?.includes(uid)) return true;
    return false;
  };

  // Helper to check if current user can see the document
  const canSeeDoc = () => {
    if (!doc) return false;
    if (isAdmin) return true;
    if (doc.isPublic) return true;
    if (doc.allowedRoles.some((r: string) => (userRoles as string[]).includes(r))) return true;
    if (doc.allowedUsers.includes(uid)) return true;
    return false;
  };

  const hasAccess = canSeeDoc();

  const glassSx = {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column' as const,
    width: { xs: '100vw', sm: 450 },
    height: '100%',
  };

  return (
    <Drawer anchor="right" open={isOpen} onClose={closeWiki}>
      <Box sx={glassSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DocIcon sx={{ color: '#10b981' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
              Omni-Wiki Reader {loading && <span style={{ opacity: 0.5, fontSize: '0.8rem', marginLeft: 8 }}>Loading...</span>}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {doc && (
              <IconButton 
                onClick={() => {
                  closeWiki();
                  router.push(`/profile/wiki/${doc.slug}`);
                }} 
                sx={{ color: '#60a5fa' }}
                title="Open Full Page"
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton onClick={closeWiki} sx={{ color: 'rgba(255,255,255,0.7)' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 4 } }}>
          {!doc && !loading ? (
            <Box sx={{ textAlign: 'center', mt: 10 }}>
               <Typography sx={{ color: 'rgba(255,255,255,0.5)', mb: 3 }}>Document not found.</Typography>
            </Box>
          ) : !hasAccess && !loading ? (
            <Box sx={{ textAlign: 'center', mt: 10 }}>
              <SecurityIcon sx={{ color: '#ef4444', fontSize: 60, opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Access Denied</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Clearance level insufficient.</Typography>
            </Box>
          ) : doc ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '800px', mx: 'auto' }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{doc.title}</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                 <Chip label={doc.category} size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }} />
                 {doc.isPublic ? (
                   <Chip label="Public" size="small" sx={{ bgcolor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }} />
                 ) : (
                   <Chip label="Restricted" size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }} />
                 )}
              </Box>
              
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />

              {/* RENDER BLOCKS */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {doc.blocks.filter(canSeeBlock).map((block: WikiBlock, index: number) => (
                  <Box key={block.id}>
                    {isAdmin && (
                      <Typography variant="caption" sx={{ color: '#f59e0b', mb: 1, display: 'block' }}>
                        [Admin View] Visibility: {block.visibility}
                      </Typography>
                    )}
                    {block.type === 'TEXT' && (
                      <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: 'rgba(255,255,255,0.85)' }}>
                        {block.content}
                      </Typography>
                    )}
                    {block.type === 'PROMPT_BUILDER' && (
                      <PromptBuilderBlock block={block} />
                    )}
                  </Box>
                ))}
                
                {doc.blocks.filter(canSeeBlock).length === 0 && (
                   <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>No visible steps available in this SOP.</Typography>
                )}
              </Box>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Drawer>
  );
}
