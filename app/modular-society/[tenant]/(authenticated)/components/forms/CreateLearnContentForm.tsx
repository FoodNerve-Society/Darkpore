'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { 
  Box, Typography, TextField, Button, Chip, 
  CircularProgress, alpha, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Alert,
  Divider, Avatar, Paper
} from '@mui/material';
import {
  Article as ArticleIcon,
  VideoLibrary as VideoIcon,
  School as ClassIcon,
  LiveTv as LivestreamIcon,
  PictureAsPdf as ReportIcon,
  CloudUpload as UploadIcon,
  AutoAwesome as SparkleIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  RadioButtonChecked as RadioButtonCheckedIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  SwapHoriz as SwapHorizIcon,
  AccountCircle as AccountCircleIcon,
  Business as BusinessIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Check as CheckIcon,
  DragIndicator as DragIndicatorIcon,
  Link as LinkIcon,
  Replay as ReplayIcon,
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
  CalendarMonth as CalendarIcon,
  Verified as VerifiedIcon,
  FavoriteBorder as FavoriteBorderIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Share as ShareIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createLearnContent, CreateLearnContentPayload, ArticleBlockPayload } from '@/lib/actions/learn';
import { useSociety } from '@/context/SocietyContext';
import PremiumCard from '@/components/PremiumCard';
import { useParams } from 'next/navigation';
import { getTenantConfig } from '@/lib/cms';
import { MICRO_CTAS, MACRO_CTAS } from '@/lib/cms/ctas';
import { useStorageUpload } from '@/hooks/useStorageUpload';
import { ArticleBlockRenderer } from '@/components/learn/ArticleBlockRenderer';
import PremiumTextField from '@/components/PremiumTextField';
import PremiumAutocomplete from '@/components/PremiumAutocomplete';
import PremiumButton from '@/components/PremiumButton';
import PremiumMarkdownEditor from '@/components/PremiumMarkdownEditor';
import PremiumVideoPlayer from '@/components/learn/blocks/PremiumVideoPlayer';

// ----------------------------------------------------------------------
// POLL OPTIONS EDITOR
// ----------------------------------------------------------------------
function PollOptionsEditor({ initialOptions, onChange, color }: { initialOptions: string, onChange: (opts: string) => void, color: string }) {
  const [options, setOptions] = useState<string[]>(() => {
    if (!initialOptions) return [];
    try {
      const parsed = JSON.parse(initialOptions);
      if (Array.isArray(parsed)) return parsed.map(o => String(o).trim()).filter(Boolean);
    } catch(e) {}
    if (initialOptions.includes('|||')) return initialOptions.split('|||').map(o => o.trim()).filter(Boolean);
    return initialOptions.split(',').map(o => o.trim()).filter(Boolean);
  });
  const [newOption, setNewOption] = useState('');

  const handleAdd = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      const newOpts = [...options, newOption.trim()];
      setOptions(newOpts);
      onChange(JSON.stringify(newOpts));
      setNewOption('');
    }
  };

  const handleRemove = (idx: number) => {
    const newOpts = options.filter((_, i) => i !== idx);
    setOptions(newOpts);
    onChange(JSON.stringify(newOpts));
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Poll Options
      </Typography>

      {options.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {options.map((opt, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fff', p: 1.5, px: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <DragIndicatorIcon sx={{ color: 'rgba(0,0,0,0.2)', fontSize: 18 }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{opt}</Typography>
              </Box>
              <IconButton size="small" onClick={() => handleRemove(i)} color="error" sx={{ '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}>
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <PremiumTextField
          fullWidth size="small" placeholder="Add an option..."
          value={newOption} onChange={e => setNewOption(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          colorTheme={color}
        />
        <PremiumButton baseColor={color} onClick={handleAdd}>
          Add
        </PremiumButton>
      </Box>
    </Box>
  );
}

const AIImagePromptDisplay = ({ promptText, color }: { promptText: string, color: string }) => {
  const [copied, setCopied] = useState(false);
  if (!promptText) return null;
  return (
    <Box sx={{ mt: 1, mb: 1, p: 2, borderRadius: '12px', bgcolor: alpha(color, 0.05), border: `1px dashed ${alpha(color, 0.3)}`, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: color, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <SparkleIcon sx={{ fontSize: 14 }} /> AI Image Prompt
        </Typography>
        <Button 
          size="small" 
          onClick={() => { navigator.clipboard.writeText(promptText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          sx={{ minWidth: 'auto', p: '4px 8px', fontSize: '0.7rem', fontWeight: 700, borderRadius: '6px', color: copied ? '#10b981' : color, bgcolor: copied ? 'rgba(16,185,129,0.1)' : alpha(color, 0.1) }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </Box>
      <Typography sx={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic', lineHeight: 1.5 }}>
        "{promptText}"
      </Typography>
    </Box>
  );
};

// ----------------------------------------------------------------------
// EVIDENCE GALLERY EDITOR
// ----------------------------------------------------------------------
function EvidenceGalleryEditor({ initialItems, onChange, color, blockId, uploadFn, uploading }: { initialItems: any[], onChange: (items: any[]) => void, color: string, blockId: string, uploadFn: any, uploading: boolean }) {
  const [items, setItems] = useState<any[]>(initialItems && initialItems.length > 0 ? initialItems : [{ url: '', caption: '', sourceName: '', sourceUrl: '' }]);

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    onChange(newItems);
  };

  const updateItemFields = (index: number, fields: Record<string, string>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...fields };
    setItems(newItems);
    onChange(newItems);
  };

  const addItem = () => {
    const newItems = [...items, { url: '', caption: '', sourceName: '', sourceUrl: '' }];
    setItems(newItems);
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    if (newItems.length === 0) newItems.push({ url: '', caption: '', sourceName: '', sourceUrl: '' });
    setItems(newItems);
    onChange(newItems);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {items.map((item, i) => (
        <Box key={i} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, p: 2, border: '1px solid rgba(0,0,0,0.05)', borderRadius: 3, bgcolor: '#f8fafc', position: 'relative' }}>
          {items.length > 1 && (
            <IconButton onClick={() => removeItem(i)} size="small" sx={{ position: 'absolute', top: 8, right: 8, color: '#ef4444' }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
          <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <PremiumTextField
                fullWidth label={`Media/Embed URL`} size="small" colorTheme={color}
                placeholder="https://... or paste Twitter URL" value={item.url || ''} onChange={e => updateItem(i, 'url', e.target.value)}
              />
            </Box>
            <PremiumTextField
              fullWidth label="Caption" size="small" colorTheme={color}
              placeholder="Describe this visual..." value={item.caption || ''} onChange={e => updateItem(i, 'caption', e.target.value)}
            />
            {item.imagePrompt && <AIImagePromptDisplay promptText={item.imagePrompt} color={color} />}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <PremiumTextField
                fullWidth label="Source Name (Optional)" size="small" colorTheme={color}
                placeholder="e.g. World Bank" value={item.sourceName || ''} onChange={e => updateItem(i, 'sourceName', e.target.value)}
              />
              <PremiumTextField
                fullWidth label="Source URL (Optional)" size="small" colorTheme={color}
                placeholder="https://..." value={item.sourceUrl || ''} onChange={e => updateItem(i, 'sourceUrl', e.target.value)}
              />
            </Box>
          </Box>
          <Box component="label" sx={{ flex: 1, borderRadius: '16px', overflow: 'hidden', bgcolor: 'rgba(0,0,0,0.02)', border: '2px dashed', borderColor: item.url ? 'transparent' : 'rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180, cursor: 'pointer', position: 'relative', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
            <input type="file" hidden accept="image/*,video/*" onChange={(e) => {
              if (e.target.files?.[0]) {
                const file = e.target.files[0];
                const objUrl = uploadFn(blockId, file);
                const isVideo = file.type.startsWith('video/');
                updateItemFields(i, { url: objUrl, mediaType: isVideo ? 'video' : 'image' });
              }
            }} />
            {item.url ? (
              item.mediaType === 'video' || (item.url.match(/\.(mp4|webm|ogg)$/i) !== null) ? (
                <Box sx={{ width: '100%', height: '100%' }}>
                  <PremiumVideoPlayer src={item.url} autoPlay={false} />
                </Box>
              ) : (
                <img src={item.url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              )
            ) : (
              <>
                <ImageIcon sx={{ fontSize: 40, color: 'rgba(0,0,0,0.2)', mb: 1 }} />
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>Click to upload media</Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem', mt: 0.5 }}>or paste an Embed URL</Typography>
              </>
            )}
          </Box>
        </Box>
      ))}
      <Button variant="outlined" onClick={addItem} startIcon={<AddIcon />} sx={{ alignSelf: 'flex-start', borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
        Add Another Image
      </Button>
    </Box>
  );
}

// ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
// CONSTANTS & TYPES
// ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ

const ACCENT = '#f59e0b';
const ACCENT_DARK = '#d97706';

const CONTENT_TYPES = [
  { value: 'article', label: 'Article', color: '#3b82f6', icon: <Box sx={{ p: 1, borderRadius: 2, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', display: 'flex', boxShadow: '0 4px 10px rgba(59,130,246,0.3)' }}><ArticleIcon sx={{ fontSize: 24 }} /></Box>, desc: 'Interactive Block Builder' },
  { value: 'video', label: 'Video', color: '#ef4444', icon: <Box sx={{ p: 1, borderRadius: 2, background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: '#fff', display: 'flex', boxShadow: '0 4px 10px rgba(239,68,68,0.3)' }}><VideoIcon sx={{ fontSize: 24 }} /></Box>, desc: 'Recorded tutorial' },
  { value: 'class', label: 'Masterclass', color: '#8b5cf6', icon: <Box sx={{ p: 1, borderRadius: 2, background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: '#fff', display: 'flex', boxShadow: '0 4px 10px rgba(139,92,246,0.3)' }}><ClassIcon sx={{ fontSize: 24 }} /></Box>, desc: 'Multi-module course' },
  { value: 'livestream', label: 'Livestream', color: '#10b981', icon: <Box sx={{ p: 1, borderRadius: 2, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', display: 'flex', boxShadow: '0 4px 10px rgba(16,185,129,0.3)' }}><LivestreamIcon sx={{ fontSize: 24 }} /></Box>, desc: 'Live broadcast event' },
  { value: 'report', label: 'Report', color: '#f59e0b', icon: <Box sx={{ p: 1, borderRadius: 2, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', display: 'flex', boxShadow: '0 4px 10px rgba(245,158,11,0.3)' }}><ReportIcon sx={{ fontSize: 24 }} /></Box>, desc: 'PDF document' },
] as const;

const SLIDESHOW_IMAGES = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200',
];

import { 
  getBlueprint, 
  FORMAT_CONFIG, 
  ERA_CONFIG, 
  ArticleFormat, 
  ArticleEra, 
  SopBlock, 
  BlockType 
} from '@/lib/config/articleBlueprints';

const BLOCK_DEFINITIONS: Record<BlockType, { label: string, color: string }> = {
  subheading: { label: 'Spiky Title', color: '#64748b' },
  exec_summary: { label: 'Key Takeaways', color: '#10b981' },
  highlight_card: { label: 'Big Stat Card', color: '#8b5cf6' },
  core_interactive: { label: 'Main Analysis', color: '#3b82f6' },
  media: { label: 'Evidence Gallery', color: '#0ea5e9' },
  myth_fact: { label: 'Myth vs Reality', color: '#ef4444' },
  pull_quote: { label: 'Strong Quote', color: '#f59e0b' },
  live_poll: { label: 'Quick Poll', color: '#d946ef' },
  data_embed: { label: 'Embedded Data', color: '#14b8a6' },
  strategic_directive: { label: 'Strategic Directive', color: '#111827' },
  call_to_action: { label: 'Call to Action', color: '#f59e0b' },
};



// ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
// SPIKY TITLE TEMPLATES
// ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
const SPIKY_TITLE_TEMPLATES: Record<string, string[]> = {
  past: [
    "The [Failed Buzzword] Illusion: Why [Old Tech/Policy] Actually Destroyed [Value Chain Actor] in [Location], and Why [Target Persona] Must [Action]",
    "The Death of [Old System]: How [Macro Shock] Killed [Location]'s [Sector] in the Early 2020s, and Why [Target Persona] Must [Action]",
    "The [Metric/Dollar Amount] Mistake: Why [Location]'s [Value Chain Actors] Completely Abandoned [Failed Project], and Why [Target Persona] Must [Action]",
    "From [Good Intention] to [Bad Outcome]: The Tragic Legacy of [Old Method] for [Location]'s [Value Chain Actor], and Why [Target Persona] Must [Action]"
  ],
  present: [
    "The [Metric/Percentage] Paradox: Why [Location]'s [Value Chain Actor] is Surviving by [Unexpected Hack], and Why [Target Persona] Must [Action]",
    "Bypassing the [Broken Gatekeeper]: How [Value Chain Actor] in [Location] Are Using [New Method] Right Now, and Why [Target Persona] Must [Action]",
    "The Unspoken Truth About [Trend]: Why [Location]'s [Sector] Now Relies on [Controversial/Messy Fix], and Why [Target Persona] Must [Action]",
    "[Factor A] vs. [Factor B]: Why Only [Specific Winner] Can Afford to [Action] in 2026 [Location], and Why [Target Persona] Must [Action]"
  ],
  future: [
    "The End of [Current Bottleneck]: How [Emerging Tech] Will Permanently Disrupt [Location]'s [Sector] by [Year], and Why [Target Persona] Must [Action]",
    "[Action Verb] the [Old Way]: Why [Value Chain Actor] Will Use [New Tech] to Bypass [Gatekeeper], and Why [Target Persona] Must [Action]",
    "From [Old Concept] to [New Concept]: The 2030 Roadmap for [Location]'s [Value Chain Actor], and Why [Target Persona] Must [Action]",
    "The [Metric/Market Size] Takeover: Why [Emerging Tech/Policy] is the Ultimate Bet for [Location] by 2030, and Why [Target Persona] Must [Action]"
  ]
};

const EXEC_SUMMARY_LABELS: Record<string, [string, string, string]> = {
  past: ["The Original Promise", "The Friction Point", "The Loss"],
  present: ["The Crisis", "The Workaround", "The Actor Affected"],
  future: ["The Dying Paradigm", "The Disruption", "The Year"]
};

// ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
// SORTABLE WRAPPER
// ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
function SortableBlockWrapper({ id, reorderUnlocked, children }: { id: string, reorderUnlocked: boolean, children: (attributes: any, listeners: any, setNodeRef: any, style: any, isDragging: boolean) => React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !reorderUnlocked });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    position: 'relative' as const,
  };

  return (
    <>
      {children(attributes, listeners, setNodeRef, style, isDragging)}
    </>
  );
}

// ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
// ANIMATIONS
// ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ

const slideUpFade = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
// COMPONENT
// ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ

export default function CreateLearnContentForm({ 
  onSuccess, 
  onCancel,
  postingAs = 'personal',
  selectedOrgId = null,
  onTypeChange,
  draftId = null,
  initialTaxonomy = null,
  initialType = 'article',
  initialDraftData = null
}: { 
  onSuccess?: () => void, 
  onCancel?: () => void,
  postingAs?: 'personal' | 'organization',
  selectedOrgId?: string | null,
  onTypeChange?: (type: string) => void,
  draftId?: string | null,
  initialTaxonomy?: {
    category?: string;
    subcategory?: string;
    timeframe?: string;
    commodity?: string;
    format?: ArticleFormat;
    targetDate?: string;
    title?: string;
    description?: string;
  } | null,
  initialType?: string,
  initialDraftData?: any
}) {
  const { profile } = useSociety();
  const params = useParams();
  const tenantId = (params?.tenant as string) || 'food';
  const tenantConfig = getTenantConfig(tenantId);
  const challenges = tenantConfig.com.homepage.challenges;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});
  
  const { uploadFile, uploading } = useStorageUpload();

  // Wizard State
  const [step, setStep] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);

  const isBlockComplete = (b: any) => {
    switch (b.type) {
      case 'subheading': return !!b.content.text;
      case 'exec_summary': return !!b.content.point1 && !!b.content.point2 && !!b.content.point3;
      case 'myth_fact': return b.content.pairs && b.content.pairs.length > 0 && !!b.content.pairs[0].myth && !!b.content.pairs[0].fact;
      case 'core_interactive': return !!b.content.bionicText;
      case 'pull_quote': return !!b.content.quote && !!b.content.attribution;
      case 'media': return !!b.content.mediaUrl;
      case 'highlight_card': return !!b.content.imageUrl && !!b.content.caption;
      case 'data_embed': return !!b.content.iframeUrl;
      case 'live_poll': return !!b.content.question && !!b.content.options;
      default: return false;
    }
  };

  const handleImageUpload = (blockId: string, field: string, file: File) => {
    setPendingFiles(prev => ({ ...prev, [blockId]: file }));
    const objectUrl = URL.createObjectURL(file);
    updateBlock(blockId, field, objectUrl);
  };

  const registerNestedUpload = (blockId: string, file: File) => {
    const objectUrl = URL.createObjectURL(file);
    // Use a composite key including the unique blob URL so we can store multiple files per block
    setPendingFiles(prev => ({ ...prev, [`${blockId}::${objectUrl}`]: file }));
    return objectUrl;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDESHOW_IMAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Step 2: Category Accordion
  const [activeAccordionIdx, setActiveAccordionIdx] = useState(0);
  const [categoryLocked, setCategoryLocked] = useState(false);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'past'|'present'|'future'|''>('');
  const [showTitleSection, setShowTitleSection] = useState(false);
  const accordionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(draftId && draftId !== 'new' ? draftId : null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-cycle accordion when not locked
  useEffect(() => {
    if (step !== 2 || categoryLocked) return;
    accordionTimerRef.current = setInterval(() => {
      setActiveAccordionIdx(prev => (prev + 1) % challenges.length);
    }, 3000);
    return () => {
      if (accordionTimerRef.current) clearInterval(accordionTimerRef.current);
    };
  }, [step, categoryLocked, challenges.length]);

  const handleCategorySelect = useCallback((idx: number, catId: string) => {
    setActiveAccordionIdx(idx);
    setSelectedCategory(catId);
    setCategoryLocked(true);
    setSelectedSubcategory('');
    setSelectedTimeframe('');
    setShowTitleSection(false);
    if (accordionTimerRef.current) clearInterval(accordionTimerRef.current);
    // Show subcategories quickly so it slides up alongside the lock animation
    setTimeout(() => setShowSubcategories(true), 50);
  }, []);

  const handleSubcategorySelect = useCallback((subId: string) => {
    setSelectedSubcategory(subId);
  }, []);

  const handleTimeframeSelect = useCallback((tf: 'past'|'present'|'future') => {
    setSelectedTimeframe(tf);
    setBlocks([]);
    setTimeout(() => setShowTitleSection(true), 400);
  }, []);

  const handleResetCategory = useCallback(() => {
    setCategoryLocked(false);
    setShowSubcategories(false);
    setSelectedSubcategory('');
    setSelectedTimeframe('');
    setShowTitleSection(false);
  }, []);

  // Core fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CreateLearnContentPayload['type'] | ''>('');
  
  const activeThemeColor = CONTENT_TYPES.find(c => c.value === type)?.color || ACCENT;
  
  const handleTypeSelect = (newType: CreateLearnContentPayload['type']) => {
    setType(newType);
    if (onTypeChange) onTypeChange(newType);
  };
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('Soybeans, Nuts and Meals');
  const [selectedFormat, setSelectedFormat] = useState<ArticleFormat>('brief');
  const [selectedEra, setSelectedEra] = useState<ArticleEra>('present');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  useEffect(() => {
    if (initialTaxonomy) {
      setType((initialType as any) || 'article');
      if (initialTaxonomy.commodity) setSelectedCommodity(initialTaxonomy.commodity);
      if (initialTaxonomy.category) setSelectedCategory(initialTaxonomy.category);
      if (initialTaxonomy.subcategory) setSelectedSubcategory(initialTaxonomy.subcategory);
      if (initialTaxonomy.format) setSelectedFormat(initialTaxonomy.format);
      if (initialTaxonomy.timeframe) {
        setSelectedTimeframe(initialTaxonomy.timeframe as any);
        setSelectedEra(initialTaxonomy.timeframe as any);
      }
      if (initialTaxonomy.targetDate) setTargetDate(initialTaxonomy.targetDate);
      if (initialTaxonomy.title) setTitle(initialTaxonomy.title);
      if (initialTaxonomy.description) setDescription(initialTaxonomy.description);
      setStep(3); // Jump directly to builder
    }
  }, [initialTaxonomy, initialType]);

  useEffect(() => {
    if (initialDraftData) {
      setType(initialDraftData.type as any);
      if (initialDraftData.title) setTitle(initialDraftData.title || '');
      if (initialDraftData.description) setDescription(initialDraftData.description || '');
      if (initialDraftData.commodity) setSelectedCommodity(initialDraftData.commodity);
      if (initialDraftData.category) setSelectedCategory(initialDraftData.category || '');
      if (initialDraftData.subcategory) setSelectedSubcategory(initialDraftData.subcategory || '');
      if (initialDraftData.format) setSelectedFormat(initialDraftData.format);
      if (initialDraftData.timeframe) {
        setSelectedTimeframe(initialDraftData.timeframe as any);
        setSelectedEra(initialDraftData.timeframe as any);
      }
      
      if (initialDraftData.targetDate) {
        try {
          const d = new Date(initialDraftData.targetDate);
          setTargetDate(d.toISOString());
        } catch (e) {
          console.error('Invalid targetDate format', e);
        }
      }
      
      const sourceBlocks = initialDraftData.articleBlocks || initialDraftData.article?.blocks;
      if (sourceBlocks) {
        // Sort blocks by orderIndex just in case
        const sorted = [...sourceBlocks].sort((a: any, b: any) => a.orderIndex - b.orderIndex);
        const validBlocks = sorted
          .filter((b: any) => BLOCK_DEFINITIONS[b.blockType])
          .map((b: any) => ({
            id: b.id || Math.random().toString(36).substring(7),
            type: b.blockType as BlockType,
            content: typeof b.content === 'string' ? JSON.parse(b.content) : (b.content || {})
          }));
        setBlocks(validBlocks);
      }
      
      setStep(3); // Jump directly to builder
    }
  }, [initialDraftData]);

  // Media fields
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [classModules, setClassModules] = useState<number>(1);
  const [reportPdfUrl, setReportPdfUrl] = useState('');
  const [reportPages, setReportPages] = useState<number>(1);
  const [targetDate, setTargetDate] = useState<string>('');

  // Blocks fields (For Articles)
  const [blocks, setBlocks] = useState<Array<{ id: string, type: BlockType, content: Record<string, any>, role?: string, sopDesc?: string, sopHint?: string }>>([]);
  const [flippedBlockId, setFlippedBlockId] = useState<string | null>(null);
  const [reorderUnlocked, setReorderUnlocked] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mediaUrlMode, setMediaUrlMode] = useState<Record<string, boolean>>({});

  const toggleUrlMode = (id: string) => {
    setMediaUrlMode(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (flippedBlockId) {
      setTimeout(() => {
        const el = document.getElementById(`block-${flippedBlockId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 250); // slight delay to allow flip animation to settle
    }
  }, [flippedBlockId]);

  // --- ACTION ITEMS CHECKLIST ---
  const actionItems = useMemo(() => {
    const items: Array<{ id: string, text: string }> = [];
    if (step !== 3) return items;
    
    blocks.forEach((b) => {
      // Missing Images
      const imageBlocks = ['highlight_card', 'quote_card', 'image_slider', 'interactive_poll', 'expert_analysis', 'pull_quote'];
      if (imageBlocks.includes(b.type)) {
        if (b.type === 'pull_quote' && (!b.content.avatarUrl || b.content.avatarUrl.trim() === '')) {
          items.push({ id: b.id, text: `Upload avatar for ${BLOCK_DEFINITIONS[b.type as keyof typeof BLOCK_DEFINITIONS]?.label || 'Block'}` });
        } else if (b.type !== 'pull_quote' && (!b.content.imageUrl || b.content.imageUrl.trim() === '')) {
          items.push({ id: b.id, text: `Upload image for ${BLOCK_DEFINITIONS[b.type as keyof typeof BLOCK_DEFINITIONS]?.label || 'Block'}` });
        }
      }
      
      // Missing Media Items (Evidence Block)
      if (b.type === 'media') {
        const hasMissingMedia = Array.isArray(b.content.items) && b.content.items.some((item: any) => !item.url || item.url.trim() === '');
        if (hasMissingMedia || !b.content.items || b.content.items.length === 0) {
          items.push({ id: b.id, text: `Upload media for Evidence Gallery` });
        }
      }
      
      // Missing CTA
      if (b.type === 'call_to_action') {
        if (!b.content.url || b.content.url.trim() === '') {
          items.push({ id: b.id, text: `Configure Final CTA URL` });
        }
      }
    });
    
    return items;
  }, [blocks, step]);

  const [isActionItemsMinimized, setIsActionItemsMinimized] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const resetFrameworkOrder = useCallback(() => {
    const framework = getBlueprint(selectedFormat, selectedEra);
    if (!framework) return;
    
    const availableBlocks = [...blocks];
    const newBlocks: any[] = [];
    
    // Match blocks in exact framework order
    for (const fDef of framework) {
      const matchIdx = availableBlocks.findIndex(b => b.type === fDef.type);
      if (matchIdx !== -1) {
        newBlocks.push(availableBlocks[matchIdx]);
        availableBlocks.splice(matchIdx, 1);
      }
    }
    
    // Add any leftovers
    newBlocks.push(...availableBlocks);
    
    setBlocks(newBlocks);
    setReorderUnlocked(false);
    setShowResetModal(false);
  }, [blocks, selectedFormat, selectedEra]);

  const generateSlug = (t: string) => t.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleAddBlock = (bType: BlockType) => {
    const newBlock = { id: Math.random().toString(), type: bType, content: {} };
    // Initialize default fields based on type
    if (bType === 'myth_fact') newBlock.content = { myth: '', fact: '' };
    if (bType === 'live_poll') newBlock.content = { question: '', options: 'Yes,No' };
    if (bType === 'pull_quote') newBlock.content = { quote: '', attribution: '' };
    if (bType === 'exec_summary') newBlock.content = { points: '' };
    if (bType === 'core_interactive') newBlock.content = { bionicText: '', anchorQuestion: '', imageUrl: '' };
    if (bType === 'subheading') newBlock.content = { text: '' };
    
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, key: string, val: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content: { ...b.content, [key]: val } } : b));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
    if (flippedBlockId === id) setFlippedBlockId(null);
    setPendingFiles(prev => {
      const newFiles = { ...prev };
      Object.keys(newFiles).forEach(k => {
        if (k === id || k.startsWith(`${id}::`)) delete newFiles[k];
      });
      return newFiles;
    });
  };

  const moveBlock = useCallback((index: number, direction: 'up' | 'down') => {
    setBlocks(prev => {
      const next = [...prev];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      [next[index], next[targetIdx]] = [next[targetIdx], next[index]];
      return next;
    });
  }, []);

  const applyFramework = useCallback((fmt: ArticleFormat = selectedFormat, era: ArticleEra = selectedEra) => {
    const framework = getBlueprint(fmt, era);
    if (!framework) return;
    const newBlocks = framework.map((sop) => {
      const content: Record<string, any> = {};
      if (sop.type === 'myth_fact') Object.assign(content, { myth: '', fact: '' });
      if (sop.type === 'live_poll') Object.assign(content, { question: '', options: 'Yes,No' });
      if (sop.type === 'pull_quote') Object.assign(content, { quote: '', attribution: '' });
      if (sop.type === 'exec_summary') Object.assign(content, { points: description || '' });
      if (sop.type === 'core_interactive') Object.assign(content, { bionicText: '', anchorQuestion: '', imageUrl: '' });
      if (sop.type === 'subheading') Object.assign(content, { text: title || '' });
      if (sop.type === 'highlight_card') Object.assign(content, { imageUrl: '', caption: '' });
      if (sop.type === 'media') Object.assign(content, { mediaUrl: '', caption: '' });
      return { id: Math.random().toString(), type: sop.type, content, role: sop.role, sopDesc: sop.desc, sopHint: sop.hint };
    });
    setBlocks(newBlocks);
    setFlippedBlockId(newBlocks[0]?.id || null);
  }, [selectedFormat, selectedEra, title, description]);

  const getBlockFillStats = (block: typeof blocks[0]) => {
    const c = block.content;
    let filled = 0;
    let total = 1;
    switch (block.type as string) {
      case 'subheading':
        total = 1; if (c.text) filled = 1; break;
      case 'core_interactive': case 'deep_dive':
        total = 1; if (c.bionicText || c.text || c.heading) filled = 1; break;
      case 'myth_fact': 
        const mfItems = c.pairs || [];
        total = Math.max(1, mfItems.length) * 2;
        mfItems.forEach((i: any) => { if (i.myth) filled++; if (i.fact) filled++; });
        break;
      case 'key_takeaways': case 'action_plan':
        const ktItems = c.items || [];
        total = Math.max(1, ktItems.length);
        ktItems.forEach((i: any) => { if (i.text) filled++; });
        break;
      case 'media': case 'evidence_gallery':
        const egItems = c.items || [];
        total = Math.max(1, egItems.length);
        egItems.forEach((i: any) => { if (i.url || i.mediaUrl) filled++; });
        break;
      case 'live_poll': case 'quick_poll':
        const rawOpts = c.options || [];
        const optsArray = Array.isArray(rawOpts) ? rawOpts : (typeof rawOpts === 'string' ? rawOpts.split(',').filter(Boolean).map(s => ({text: s.trim()})) : []);
        total = 1 + Math.max(2, optsArray.length);
        if (c.question) filled++;
        optsArray.forEach((o: any) => { if (o.text || o.label) filled++; });
        break;
      case 'pull_quote': case 'expert_quote':
        total = 2; // Usually quote and author are required, role is optional
        if (c.quote || c.text) filled++;
        if (c.author || c.attribution) filled++;
        break;
      case 'exec_summary': 
        total = 3; 
        if (c.point1) filled++; 
        if (c.point2) filled++; 
        if (c.point3) filled++; 
        break;
      case 'highlight_card': 
        total = 1; if (c.caption || c.text || c.imageUrl) filled = 1; break;
      case 'strategic_directive': 
        total = 6;
        if (c.urgencyLevel) filled++; if (c.targetPersona) filled++;
        if (c.point1) filled++; if (c.point2) filled++; if (c.point3) filled++;
        if (c.microCtaId) filled++;
        break;
      case 'call_to_action': 
        total = 1; if (c.macroCtaId || c.text) filled = 1; break;
      default: 
        total = 1; if (Object.values(c).some(v => !!v)) filled = 1; break;
    }
    return { filled, total };
  };

  const isBlockFilled = (block: typeof blocks[0]) => {
    const stats = getBlockFillStats(block);
    return stats.filled >= stats.total;
  };

  const handleSubmit = async (isPublish = true) => {
    if (loading) return;
    
    let finalTitle = title;
    let finalDesc = description;

    if (type === 'article') {
      const spikyBlock = blocks.find(b => b.type === 'subheading');
      if (spikyBlock && spikyBlock.content.text) {
        finalTitle = spikyBlock.content.text;
      }
      // Description is optional for articles, but we can derive it from exec_summary if needed
      const summaryBlock = blocks.find(b => b.type === 'exec_summary');
      if (summaryBlock && summaryBlock.content.point1) {
        finalDesc = summaryBlock.content.point1;
      }
    }

    // Removed strict Title and Description validation as requested.
    // The backend payload mapping natively falls back to "Draft Content" and "No description provided."
    
    if (isPublish && blocks.length > 0) {
      const incompleteBlocks = blocks.filter(b => !isBlockFilled(b));
      if (incompleteBlocks.length > 0) {
        // Collect friendly names for the incomplete blocks
        const blockNames = incompleteBlocks.map(b => {
          const def = BLOCK_DEFINITIONS[b.type as keyof typeof BLOCK_DEFINITIONS];
          return def ? def.label : 'Unknown Block';
        });
        
        // Remove duplicates and join
        const uniqueNames = Array.from(new Set(blockNames)).join(', ');
        setError(`Cannot publish yet. The following blocks are missing information: ${uniqueNames}`);
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Upload pending files first
      let finalBlocks = [...blocks];
      const pendingBlockIds = Object.keys(pendingFiles);
      
      for (const pendingKey of pendingBlockIds) {
        const file = pendingFiles[pendingKey];
        const res = await uploadFile(file);
        if (res?.secure_url) {
          // If the key is composite (e.g. blockId::blobUrl), extract the blockId. Otherwise it's the raw blockId.
          const blockId = pendingKey.includes('::') ? pendingKey.split('::')[0] : pendingKey;
          const targetBlobUrl = pendingKey.includes('::') ? pendingKey.split('::').slice(1).join('::') : null;

          finalBlocks = finalBlocks.map(b => {
            if (b.id === blockId) {
              const newContent = JSON.parse(JSON.stringify(b.content)); // deep clone
              
              const replaceBlobDeep = (obj: any) => {
                if (!obj) return;
                Object.keys(obj).forEach(k => {
                  if (typeof obj[k] === 'string' && obj[k].startsWith('blob:')) {
                    // If targetBlobUrl is specified, only replace exact matches. Otherwise replace any blob (legacy behavior)
                    if (!targetBlobUrl || obj[k] === targetBlobUrl) {
                      obj[k] = res.secure_url;
                    }
                  } else if (typeof obj[k] === 'object' && obj[k] !== null) {
                    replaceBlobDeep(obj[k]);
                  }
                });
              };
              
              replaceBlobDeep(newContent);
              return { ...b, content: newContent };
            }
            return b;
          });
        }
      }

      let finalThumbnailUrl = thumbnailUrl;
      if (type === 'article') {
        const imageBlock = finalBlocks.find(b => b.content.imageUrl || b.content.mediaUrl);
        if (imageBlock) {
          finalThumbnailUrl = imageBlock.content.imageUrl || imageBlock.content.mediaUrl;
        }
      }

      let finalAuthorId = profile?.uid;
      let finalAuthorName = profile?.displayName;
      let finalAuthorAvatarUrl = profile?.avatarUrl;

      if (postingAs === 'organization' && selectedOrgId) {
        const org = profile?.organizations?.find(o => o.id === selectedOrgId);
        if (org) {
          finalAuthorId = org.id;
          finalAuthorName = org.name;
          finalAuthorAvatarUrl = org.logoUrl;
        }
      }

      const payload: CreateLearnContentPayload = {
        id: currentDraftId || undefined,
        title: finalTitle.trim() || 'Draft Content',
        slug: generateSlug(finalTitle.trim() || 'Draft Content'),
        description: finalDesc.trim() || 'No description provided.',
        type: type as "article" | "video" | "class" | "livestream" | "report",
        bottleneckTags: selectedSubcategory ? [selectedSubcategory, selectedCategory] : [selectedCategory],
        category: selectedCategory,
        subcategory: selectedSubcategory,
        timeframe: selectedTimeframe,
        thumbnailUrl: finalThumbnailUrl,
        authorId: finalAuthorId,
        authorName: finalAuthorName,
        authorAvatarUrl: finalAuthorAvatarUrl,
        
        articleBlocks: type === 'article' ? finalBlocks.map((b, idx) => ({
          blockType: b.type,
          orderIndex: idx,
          content: JSON.stringify(b.content)
        })) : undefined,
        
        videoUrl: (type === 'video' || type === 'livestream') ? videoUrl : undefined,
        videoDuration: type === 'video' ? duration : undefined,
        livestreamUrl: type === 'livestream' ? videoUrl : undefined,
        classModules: type === 'class' ? classModules : undefined,
        classDuration: type === 'class' ? duration : undefined,
        reportPdfUrl: type === 'report' ? reportPdfUrl : undefined,
        reportPages: type === 'report' ? reportPages : undefined,
        targetDate: targetDate || undefined,
      };

      const result = await createLearnContent(payload, !isPublish);
      if (result.success) {
        if (isPublish) {
          onSuccess?.();
        } else {
          setCurrentDraftId(result.id);
          setSuccessMsg(`Draft saved successfully at ${new Date().toLocaleTimeString()}`);
          scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <Box ref={scrollContainerRef} sx={{ flex: 1, overflowY: 'auto', px: { xs: 2.5, sm: 3.5 }, pt: 3, pb: { xs: 15, md: 20 }, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px', '& .MuiAlert-message': { fontWeight: 600 } }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {successMsg && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: '12px', '& .MuiAlert-message': { fontWeight: 600 } }} onClose={() => setSuccessMsg(null)}>
            {successMsg}
          </Alert>
        )}

        {/* STEP 3: CONTENT / BLOCKS */}
        {step === 3 && (
          <Box sx={{ animation: 'fadeIn 0.3s', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {type === 'article' ? (
              <Box sx={{ width: '100%' }}>
                {/* ═══════════════════════ CONTEXT HEADER ═══════════════════════ */}
                {(() => {
                  const fMeta = FORMAT_CONFIG[selectedFormat] || FORMAT_CONFIG.brief;
                  const eMeta = ERA_CONFIG[selectedEra] || ERA_CONFIG.present;
                  const currentChallenge = challenges.find(c => c.id === selectedCategory) || challenges[0];
                  const catName = currentChallenge?.title || 'Challenge';
                  const subcategoriesList = currentChallenge?.subcategories || [];
                  const activeSubObj = subcategoriesList.find(s => s.id === selectedSubcategory);
                  const subName = activeSubObj?.title || 'Select Subcategory';
                  
                  let formattedPublishDate = 'Scheduled in Calendar';
                  if (targetDate) {
                    try {
                      formattedPublishDate = format(new Date(targetDate), 'EEE, MMM d, yyyy');
                    } catch (e) {}
                  }

                  return (
                    <Box sx={{
                      display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', gap: 2,
                      mb: 4, p: '14px 20px', borderRadius: '18px',
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.03) 0%, rgba(15, 23, 42, 0.08) 100%)',
                      border: '1px solid rgba(15, 23, 42, 0.06)',
                      backdropFilter: 'blur(16px)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,1), 0 4px 12px rgba(0,0,0,0.02)',
                      width: '100%'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        {/* Studio Root */}
                        <Box 
                          onClick={() => onCancel?.()} 
                          sx={{ 
                            display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.75, borderRadius: '10px',
                            cursor: 'pointer', transition: 'all 0.2s ease', color: '#0f172a', bgcolor: 'rgba(255,255,255,0.8)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            '&:hover': { bgcolor: '#fff', transform: 'translateY(-1px)' }
                          }}
                        >
                          <ArticleIcon sx={{ fontSize: 18, color: ACCENT }} />
                          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem' }}>Studio</Typography>
                        </Box>

                        <Typography sx={{ color: 'rgba(15, 23, 42, 0.3)', fontWeight: 400 }}>/</Typography>

                        {/* Commodity Pill */}
                        <Chip
                          label={`🌾 ${selectedCommodity}`}
                          size="small"
                          sx={{ bgcolor: '#fff', color: '#0f172a', fontWeight: 800, border: '1px solid rgba(0,0,0,0.08)' }}
                        />

                        {/* Category */}
                        <Chip
                          label={`💼 ${catName}`}
                          size="small"
                          sx={{ bgcolor: 'rgba(0,0,0,0.04)', color: '#334155', fontWeight: 700 }}
                        />

                        {/* Calendar Publish Badge */}
                        <Chip
                          icon={<CalendarIcon sx={{ fontSize: 14 }} />}
                          label={`📅 Publishes ${formattedPublishDate}`}
                          size="small"
                          sx={{ bgcolor: alpha(ACCENT, 0.12), color: ACCENT_DARK, fontWeight: 800, border: `1px solid ${alpha(ACCENT, 0.25)}` }}
                        />
                      </Box>

                      {/* Right Status Badge */}
                      <Chip 
                        icon={draftId && draftId !== 'new' ? <AccessTimeIcon sx={{ fontSize: 14 }} /> : <AddIcon sx={{ fontSize: 14 }} />}
                        label={draftId && draftId !== 'new' ? 'EDITING DRAFT' : 'NEW BRIEF'} 
                        size="small" 
                        sx={{ 
                          bgcolor: draftId && draftId !== 'new' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                          color: draftId && draftId !== 'new' ? '#d97706' : '#059669', 
                          fontWeight: 800, border: `1px solid ${draftId && draftId !== 'new' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                          px: 1, height: 26, '& .MuiChip-icon': { color: 'inherit' }
                        }} 
                      />
                    </Box>
                  );
                })()}

                {/* ═══════════════════════ EMPTY STATE: BLUEPRINT SETUP & LOADER STATION ═══════════════════════ */}
                {blocks.length === 0 && (() => {
                  const currentChallenge = challenges.find(c => c.id === selectedCategory) || challenges[0];
                  const subcategoriesList = currentChallenge?.subcategories || [];
                  const activeFormatMeta = FORMAT_CONFIG[selectedFormat] || FORMAT_CONFIG.brief;
                  const activeEraMeta = ERA_CONFIG[selectedEra] || ERA_CONFIG.present;
                  const currentBlueprint = getBlueprint(selectedFormat, selectedEra);

                  const formatsList: ArticleFormat[] = ['brief', 'memo', 'playbook', 'comparison', 'culture'];
                  const erasList: ArticleEra[] = ['past', 'present', 'future'];

                  return (
                    <Box sx={{ mb: 6, animation: 'fadeIn 0.3s ease' }}>
                      {/* Title & Setup Controls Card */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 3, md: 4 }, mb: 4, borderRadius: '24px',
                          border: '1px solid rgba(0,0,0,0.08)',
                          bgcolor: '#ffffff',
                          boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
                        }}
                      >
                        {/* 1. Article Headline */}
                        <Box sx={{ mb: 3.5 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
                            Article Title
                          </Typography>
                          <PremiumTextField
                            colorTheme={activeFormatMeta.color}
                            placeholder="e.g. Structuring a ₦500M Off-Taker SPV: Unit Economics for Soybeans"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            fullWidth
                          />
                        </Box>

                        {/* 2. Subcategory Picker */}
                        <Box sx={{ mb: 3.5 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
                            1. Subcategory Focus (10 Available in {currentChallenge?.title})
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {subcategoriesList.map(sub => {
                              const isSelected = selectedSubcategory === sub.id;
                              return (
                                <Chip
                                  key={sub.id}
                                  label={sub.title}
                                  onClick={() => setSelectedSubcategory(sub.id)}
                                  sx={{
                                    bgcolor: isSelected ? '#0f172a' : 'rgba(0,0,0,0.04)',
                                    color: isSelected ? '#fff' : '#334155',
                                    fontWeight: isSelected ? 800 : 600,
                                    border: isSelected ? '1px solid #0f172a' : '1px solid rgba(0,0,0,0.06)',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    '&:hover': { bgcolor: isSelected ? '#0f172a' : 'rgba(0,0,0,0.08)' }
                                  }}
                                />
                              );
                            })}
                          </Box>
                        </Box>

                        {/* 3. Format Picker (The 5 Lenses) */}
                        <Box sx={{ mb: 3.5 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
                            2. Article Format (The Editorial Lens)
                          </Typography>
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' }, gap: 1.5 }}>
                            {formatsList.map(fmt => {
                              const meta = FORMAT_CONFIG[fmt];
                              const isSelected = selectedFormat === fmt;
                              return (
                                <Box
                                  key={fmt}
                                  onClick={() => setSelectedFormat(fmt)}
                                  sx={{
                                    p: 2, borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s',
                                    bgcolor: isSelected ? alpha(meta.color, 0.1) : 'rgba(0,0,0,0.02)',
                                    border: `2px solid ${isSelected ? meta.color : 'rgba(0,0,0,0.06)'}`,
                                    display: 'flex', flexDirection: 'column', gap: 0.5,
                                    '&:hover': { borderColor: meta.color, transform: 'translateY(-2px)' }
                                  }}
                                >
                                  <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: isSelected ? meta.color : '#0f172a' }}>
                                    {meta.emoji} {meta.label}
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.3 }}>
                                    {meta.desc}
                                  </Typography>
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>

                        {/* 4. Era Picker (The 3 Timelines) */}
                        <Box sx={{ mb: 2 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
                            3. Era (The Data & Time State)
                          </Typography>
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                            {erasList.map(era => {
                              const meta = ERA_CONFIG[era];
                              const isSelected = selectedEra === era;
                              return (
                                <Box
                                  key={era}
                                  onClick={() => {
                                    setSelectedEra(era);
                                    setSelectedTimeframe(era as any);
                                  }}
                                  sx={{
                                    p: 2, borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s',
                                    bgcolor: isSelected ? alpha(meta.color, 0.1) : 'rgba(0,0,0,0.02)',
                                    border: `2px solid ${isSelected ? meta.color : 'rgba(0,0,0,0.06)'}`,
                                    display: 'flex', flexDirection: 'column', gap: 0.5,
                                    '&:hover': { borderColor: meta.color, transform: 'translateY(-2px)' }
                                  }}
                                >
                                  <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: isSelected ? meta.color : '#0f172a' }}>
                                    {meta.emoji} {meta.label}
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.3 }}>
                                    {meta.desc}
                                  </Typography>
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>
                      </Paper>

                      {/* Header of Framework Blueprint */}
                      <Box sx={{ textAlign: 'center', mb: 4, pt: 1 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: '1.6rem', color: '#0f172a', mb: 0.5 }}>
                          {activeFormatMeta.emoji} {activeFormatMeta.label} · {activeEraMeta.label}
                        </Typography>
                        <Typography sx={{ color: '#64748b', fontSize: '0.95rem', maxWidth: 600, mx: 'auto', fontWeight: 500 }}>
                          Tailored {currentBlueprint.length}-block SOP framework structured for African agro-intelligence.
                        </Typography>
                      </Box>

                      {/* Live Reactive Timeline Preview */}
                      <Box sx={{ position: 'relative', pl: { xs: 3, md: 5 }, maxWidth: 800, mx: 'auto', mb: 4 }}>
                        <Box sx={{
                          position: 'absolute', left: { xs: 12, md: 20 }, top: 12, bottom: 12,
                          width: 3, background: `linear-gradient(180deg, ${activeFormatMeta.color} 0%, ${alpha(activeFormatMeta.color, 0.1)} 100%)`,
                          borderRadius: 2,
                        }} />

                        {currentBlueprint.map((sop, idx) => {
                          const bDef = BLOCK_DEFINITIONS[sop.type] || { label: sop.type, color: activeFormatMeta.color };
                          return (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, position: 'relative' }}>
                              <Box sx={{
                                position: 'absolute', left: { xs: -21.5, md: -33.5 },
                                width: 24, height: 24, borderRadius: '50%',
                                bgcolor: '#fff', border: `3px solid ${bDef.color}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                mt: 1.5, zIndex: 2, boxShadow: `0 2px 8px ${alpha(bDef.color, 0.3)}`
                              }}>
                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#0f172a' }}>{idx + 1}</Typography>
                              </Box>
                              <Box sx={{
                                flex: 1, p: 2.5, borderRadius: '16px',
                                border: `1px solid rgba(0,0,0,0.08)`,
                                background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)`,
                                backdropFilter: 'blur(8px)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                '&:hover': { transform: 'translateX(4px)', borderColor: alpha(bDef.color, 0.3), boxShadow: `0 8px 24px rgba(0,0,0,0.06)` },
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                                  <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{sop.role}</Typography>
                                  <Chip label={bDef.label} size="small" sx={{ height: 20, fontSize: '0.68rem', bgcolor: alpha(bDef.color, 0.15), color: bDef.color, fontWeight: 800 }} />
                                </Box>
                                <Typography sx={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.4 }}>{sop.desc}</Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>

                      {/* CTA to Load Framework */}
                      <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Button
                          variant="contained"
                          onClick={() => applyFramework(selectedFormat, selectedEra)}
                          startIcon={<SparkleIcon />}
                          sx={{
                            bgcolor: activeFormatMeta.color, color: '#fff', fontWeight: 800, px: 6, py: 1.8, borderRadius: '18px',
                            fontSize: '1.05rem', letterSpacing: '0.01em',
                            boxShadow: `0 8px 24px ${alpha(activeFormatMeta.color, 0.4)}`,
                            '&:hover': { bgcolor: alpha(activeFormatMeta.color, 0.9), transform: 'translateY(-2px)', boxShadow: `0 12px 32px ${alpha(activeFormatMeta.color, 0.5)}` },
                            transition: 'all 0.2s',
                          }}
                        >
                          🚀 Load This Framework ({currentBlueprint.length} Blocks)
                        </Button>
                      </Box>
                    </Box>
                  );
                })()}


                {/* ΓöÇΓöÇΓöÇ ACTIVE BLOCK CANVAS ΓöÇΓöÇΓöÇ */}
                {blocks.length > 0 && (
                  <Box>
                    {/* Canvas header + Reorder toggle */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                      <Box>
                        <Typography sx={{ fontWeight: 900, fontSize: '1.6rem', color: '#0f172a', letterSpacing: '-0.02em' }}>Block Canvas</Typography>
                        <Typography sx={{ color: '#475569', fontSize: '0.95rem', mt: 0.5, fontWeight: 500 }}>
                          Tap a card to flip it and edit. <strong style={{ color: '#0f172a' }}>{blocks.filter(b => isBlockFilled(b)).length}</strong> of <strong style={{ color: '#0f172a' }}>{blocks.length}</strong> blocks filled.
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Tooltip title="Reset Builder">
                          <IconButton onClick={() => setShowResetModal(true)} sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.05)', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}>
                            <ReplayIcon />
                          </IconButton>
                        </Tooltip>
                        {reorderUnlocked && (
                          <Button
                            onClick={() => setShowResetModal(true)}
                            size="small"
                            sx={{ color: '#ef4444', fontWeight: 700, borderRadius: '12px', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}
                          >
                            Reset Order
                          </Button>
                        )}
                        <Button
                          startIcon={reorderUnlocked ? <LockOpenIcon sx={{ fontSize: 18 }} /> : <LockIcon sx={{ fontSize: 18 }} />}
                          onClick={() => {
                            if (!reorderUnlocked) {
                              setShowReorderModal(true);
                            } else {
                              setReorderUnlocked(false);
                            }
                          }}
                          size="medium"
                          sx={{
                          color: reorderUnlocked ? ACCENT : '#475569',
                          fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em',
                          borderRadius: '14px', px: 2.5, py: 1,
                          border: `2px solid ${reorderUnlocked ? alpha(ACCENT, 0.5) : 'rgba(0,0,0,0.1)'}`,
                          bgcolor: reorderUnlocked ? alpha(ACCENT, 0.05) : 'rgba(255,255,255,0.5)',
                          backdropFilter: 'blur(8px)',
                          '&:hover': { bgcolor: reorderUnlocked ? alpha(ACCENT, 0.1) : 'rgba(255,255,255,0.8)', borderColor: reorderUnlocked ? ACCENT : 'rgba(0,0,0,0.2)' },
                          transition: 'all 0.2s',
                        }}
                      >
                        {reorderUnlocked ? 'Lock Order' : 'Reorder'}
                      </Button>
                    </Box>
                  </Box>

                  {/* Block cards */}
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                        {blocks.map((b, i) => {
                          const isFlipped = flippedBlockId === b.id;
                          const fillStats = getBlockFillStats(b);
                          const filled = fillStats.filled >= fillStats.total;
                          const fillPercent = Math.min(100, Math.round((fillStats.filled / fillStats.total) * 100));
                          const bDef = BLOCK_DEFINITIONS[b.type] || { color: '#ccc', label: 'Unknown Block' };
                          const color = bDef.color;
                          
                          const hasImageField = ['highlight_card', 'media', 'data_embed'].includes(b.type);
                          const imageUrl = b.content.imageUrl || b.content.mediaUrl;

                          return (
                            <SortableBlockWrapper key={b.id} id={b.id} reorderUnlocked={reorderUnlocked}>
                              {(attributes, listeners, setNodeRef, style, isDragging) => (
                                <Box id={`block-${b.id}`} ref={setNodeRef} style={style} sx={{ perspective: '1600px', mb: 2.5, scrollMarginTop: '120px', ...(isDragging ? { opacity: 0.8, filter: 'brightness(1.05)', zIndex: 50 } : {}) }}>
                                  <Box sx={{
                                    position: 'relative',
                                    transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    transformStyle: 'preserve-3d',
                                    transformOrigin: 'center center',
                                    transform: isFlipped ? 'rotateX(-180deg)' : 'none',
                                  }}>
                            {/* ΓòÉΓòÉΓòÉΓòÉ FRONT FACE ΓòÉΓòÉΓòÉΓòÉ */}
                            <Box
                              onClick={() => !isFlipped && setFlippedBlockId(b.id)}
                              sx={{
                                backfaceVisibility: 'hidden',
                                position: isFlipped ? 'absolute' : 'relative',
                                width: '100%', top: 0,
                                borderRadius: '20px',
                                border: `1px solid ${filled ? alpha(color, 0.8) : alpha(color, 0.15)}`,
                                background: filled 
                                  ? `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`
                                  : `linear-gradient(to right, ${alpha(color, 0.2)} ${fillPercent}%, rgba(255,255,255,0.95) ${fillPercent}%, rgba(248,250,252,0.9) 100%)`,
                                backdropFilter: 'blur(16px)',
                                boxShadow: filled ? `0 12px 32px ${alpha(color, 0.3)}` : `0 8px 32px rgba(0,0,0,0.04)`,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                '&:hover': {
                                  borderColor: filled ? color : alpha(color, 0.6),
                                  boxShadow: filled ? `0 16px 48px ${alpha(color, 0.4)}` : `0 12px 48px rgba(0,0,0,0.08)`,
                                  transform: 'translateY(-2px)'
                                },
                              }}
                            >
                              {fillPercent > 0 && (
                                <Typography sx={{ 
                                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
                                  fontWeight: 900, fontSize: { xs: '2rem', md: '3.5rem' }, 
                                  color: filled ? 'rgba(255,255,255,0.15)' : alpha(color, 0.1), pointerEvents: 'none', letterSpacing: '0.05em',
                                  textTransform: 'uppercase', whiteSpace: 'nowrap', zIndex: 0
                                }}>
                                  {filled ? 'COMPLETED' : `${fillStats.filled} / ${fillStats.total} FILLED`}
                                </Typography>
                              )}
                              <Box sx={{ display: 'flex', alignItems: 'stretch', position: 'relative', zIndex: 1 }}>
                                {/* Left accent bar */}
                                <Box sx={{
                                  width: filled ? 0 : 6, flexShrink: 0,
                                  background: filled
                                    ? `transparent`
                                    : `linear-gradient(180deg, ${alpha(color, 0.4)} 0%, ${alpha(color, 0.1)} 100%)`,
                                }} />
                                <Box sx={{ p: { xs: 2, md: 3 }, flex: 1, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                                  {/* Number badge */}
                                  <Box sx={{
                                    width: 44, height: 44, borderRadius: '14px', flexShrink: 0,
                                    bgcolor: filled ? 'rgba(255,255,255,0.2)' : alpha(color, 0.1), 
                                    border: filled ? '1px solid rgba(255,255,255,0.3)' : `1px solid ${alpha(color, 0.2)}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: filled ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.3s ease'
                                  }}>
                                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: filled ? '#fff' : color }}>{i + 1}</Typography>
                                  </Box>
                                  {/* Info */}
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
                                      <Typography sx={{ fontWeight: 800, color: filled ? '#fff' : '#0f172a', fontSize: { xs: '1.05rem', md: '1.15rem' }, letterSpacing: '-0.01em' }}>
                                        {b.role || bDef.label}
                                      </Typography>
                                      <Chip label={bDef.label} size="small" sx={{ height: 24, fontSize: '0.7rem', bgcolor: filled ? 'rgba(255,255,255,0.2)' : alpha(color, 0.15), color: filled ? '#fff' : color, fontWeight: 700, border: `1px solid ${filled ? 'rgba(255,255,255,0.3)' : alpha(color, 0.2)}` }} />
                                    </Box>
                                    <Typography sx={{ color: filled ? 'rgba(255,255,255,0.8)' : '#64748b', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                                      {filled ? 'Content added — tap to edit' : (b.sopDesc || 'Tap to fill this block')}
                                    </Typography>
                                  </Box>
                                  {/* Image Thumbnail */}
                                  {hasImageField && imageUrl && (
                                    <Box sx={{ width: 60, height: 44, borderRadius: 2, flexShrink: 0, overflow: 'hidden', border: filled ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(0,0,0,0.1)', display: { xs: 'none', md: 'block' } }}>
                                      <img src={imageUrl} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    </Box>
                                  )}
                                  {/* Reorder / Delete controls */}
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                                    {reorderUnlocked && (
                                      <Box {...attributes} {...listeners} sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' }, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1, color: filled ? 'rgba(255,255,255,0.7)' : '#94a3b8', '&:hover': { color: filled ? '#fff' : '#0f172a' } }}>
                                        <DragIndicatorIcon />
                                      </Box>
                                    )}
                                    <IconButton size="small" onClick={() => removeBlock(b.id)} sx={{ bgcolor: filled ? 'rgba(255,255,255,0.15)' : 'rgba(239,68,68,0.05)', color: filled ? '#fff' : '#ef4444', border: filled ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(239,68,68,0.1)', '&:hover': { bgcolor: '#ef4444', color: '#fff', borderColor: '#ef4444' } }}>
                                      <DeleteIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                  </Box>
                                </Box>
                              </Box>
                            </Box>

                            {/* ΓòÉΓòÉΓòÉΓòÉ BACK FACE (FORM) ΓòÉΓòÉΓòÉΓòÉ */}
                            <Box sx={{
                              backfaceVisibility: 'hidden',
                              transform: 'rotateX(180deg)',
                              position: isFlipped ? 'relative' : 'absolute',
                              width: '100%', top: 0,
                              borderRadius: '20px',
                              border: `1px solid ${alpha(color, 0.4)}`,
                              background: `linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.95) 100%)`,
                              backdropFilter: 'blur(20px)',
                              boxShadow: `0 16px 48px rgba(0,0,0,0.08)`,
                              overflow: 'hidden',
                            }}>
                              {/* Back header */}
                              <Box sx={{
                                display: 'flex', alignItems: 'center', gap: 2,
                                px: 3, py: 2,
                                borderBottom: `1px solid rgba(0,0,0,0.06)`,
                                background: alpha(color, 0.05),
                              }}>
                                <Box sx={{ width: 32, height: 32, borderRadius: '10px', bgcolor: alpha(color, 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${alpha(color, 0.2)}` }}>
                                  <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color }}>{i + 1}</Typography>
                                </Box>
                                <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', flex: 1 }}>
                                  {b.role || bDef.label}
                                </Typography>
                                {b.sopHint && (
                                  <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic', display: { xs: 'none', md: 'block' }, fontWeight: 500 }}>
                                    e.g. &ldquo;{b.sopHint}&rdquo;
                                  </Typography>
                                )}
                                <Tooltip title="Done editing">
                                  <IconButton
                                    size="medium"
                                    onClick={() => setFlippedBlockId(null)}
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

                              {/* Back form fields */}
                              <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <Box sx={{ p: 2, borderRadius: '12px', bgcolor: alpha(color, 0.05), border: `1px solid ${alpha(color, 0.1)}` }}>
                                  <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem', mb: 0.5 }}>Why this block matters:</Typography>
                                  <Typography sx={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                    {b.sopDesc || "Provides critical structure and context to your audience."}
                                  </Typography>
                                </Box>
                                {b.type === 'subheading' && (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {selectedTimeframe && (
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {SPIKY_TITLE_TEMPLATES[selectedTimeframe as keyof typeof SPIKY_TITLE_TEMPLATES]?.map((tmpl, idx) => (
                                          <Chip 
                                            key={idx} 
                                            label={tmpl.replace(/\[.*?\]/g, '___')} 
                                            onClick={() => updateBlock(b.id, 'text', tmpl)}
                                            sx={{ bgcolor: alpha(color, 0.05), color, border: `1px solid ${alpha(color, 0.2)}`, fontWeight: 600, '&:hover': { bgcolor: alpha(color, 0.1) } }}
                                          />
                                        ))}
                                      </Box>
                                    )}
                                      <PremiumTextField colorTheme={color}
                                        fullWidth  label="Spiky Header Text (Pattern: [Bold Part]: [Italic Part])" placeholder={b.sopHint || ''}
                                        value={b.content.text || ''} 
                                        multiline minRows={2}
                                        onChange={e => {
                                          updateBlock(b.id, 'text', e.target.value);
                                        }}
                                        helperText={`${(b.content.text || '').length} / 150 characters max`}
                                        sx={{ 
                                          '& .MuiOutlinedInput-root': { borderRadius: '14px', color: '#0f172a', bgcolor: 'rgba(0,0,0,0.02)', '& fieldset': { borderColor: 'rgba(0,0,0,0.15)' }, '&:hover fieldset': { borderColor: alpha(color, 0.5) }, '&.Mui-focused fieldset': { borderColor: color, borderWidth: 2 } }, 
                                          '& .MuiInputLabel-root': { color: '#475569', fontWeight: 600 },
                                          '& .MuiFormHelperText-root': { textAlign: 'right', fontWeight: 600, color: (b.content.text || '').length > 150 ? '#ef4444' : 'text.secondary' }
                                        }}
                                      />
                                  </Box>
                                )}
                                {b.type === 'core_interactive' && (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <PremiumTextField colorTheme={color}
                                      fullWidth  label="Heading (Optional)"
                                      placeholder="Section Heading" value={b.content.heading || ''} onChange={e => updateBlock(b.id, 'heading', e.target.value)}
                                      
                                    />
                                    <PremiumMarkdownEditor colorTheme={color}
                                      fullWidth multiline rows={8}  label="Deep Analysis (Multiple Paragraphs)"
                                      placeholder={b.sopDesc || ''} value={b.content.bionicText || ''} onChange={(e: any) => updateBlock(b.id, 'bionicText', e.target.value)}
                                      
                                    />
                                    <PremiumTextField colorTheme={color}
                                      fullWidth  label="Discussion Prompt (Optional)"
                                      placeholder={b.sopHint || 'What is your experience with this?'} value={b.content.discussionPrompt || ''} onChange={e => updateBlock(b.id, 'discussionPrompt', e.target.value)}
                                      
                                    />
                                  </Box>
                                )}
                                  {b.type === 'myth_fact' && (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                      {(b.content.pairs || [{ myth: '', fact: '' }]).map((pair: any, idx: number) => (
                                        <Box key={idx} sx={{ 
                                          display: 'flex', flexDirection: 'column', gap: 2, 
                                          p: 3, borderRadius: '16px', 
                                          bgcolor: alpha(color, 0.02),
                                          border: `1px solid ${alpha(color, 0.1)}`,
                                          position: 'relative'
                                        }}>
                                          {idx > 0 && (
                                            <IconButton onClick={() => {
                                              const newPairs = (b.content.pairs || [{ myth: '', fact: '' }]).filter((_: any, i: number) => i !== idx);
                                              updateBlock(b.id, 'pairs', newPairs);
                                            }} sx={{ position: 'absolute', top: 8, right: 8, color: '#ef4444' }}>
                                              <DeleteIcon fontSize="small" />
                                            </IconButton>
                                          )}
                                          
                                          <PremiumMarkdownEditor colorTheme={color}
                                            fullWidth multiline rows={4} label={`Myth ${idx + 1}`}
                                            placeholder="What stakeholders believed..." value={pair.myth} onChange={(e: any) => {
                                              const newPairs = [...(b.content.pairs || [{ myth: '', fact: '' }])];
                                              newPairs[idx].myth = e.target.value;
                                              updateBlock(b.id, 'pairs', newPairs);
                                            }}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', color: '#0f172a', bgcolor: alpha(color, 0.03), '& fieldset': { borderColor: alpha(color, 0.2) }, '&:hover fieldset': { borderColor: alpha(color, 0.5) }, '&.Mui-focused fieldset': { borderColor: color, borderWidth: 2 } }, '& .MuiInputLabel-root': { color: '#475569', fontWeight: 600 } }}
                                          />
                                          <PremiumMarkdownEditor colorTheme={color}
                                            fullWidth multiline rows={4} label={`Reality ${idx + 1}`}
                                            placeholder="What actually happened..." value={pair.fact} onChange={(e: any) => {
                                              const newPairs = [...(b.content.pairs || [{ myth: '', fact: '' }])];
                                              newPairs[idx].fact = e.target.value;
                                              updateBlock(b.id, 'pairs', newPairs);
                                            }}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', color: '#0f172a', bgcolor: alpha(color, 0.03), '& fieldset': { borderColor: alpha(color, 0.2) }, '&:hover fieldset': { borderColor: alpha(color, 0.5) }, '&.Mui-focused fieldset': { borderColor: color, borderWidth: 2 } }, '& .MuiInputLabel-root': { color: '#475569', fontWeight: 600 } }}
                                          />
                                        </Box>
                                      ))}
                                      <Button
                                        
                                        onClick={() => {
                                          const newPairs = [...(b.content.pairs || [{ myth: '', fact: '' }]), { myth: '', fact: '' }];
                                          updateBlock(b.id, 'pairs', newPairs);
                                        }}
                                        sx={{ 
                                          alignSelf: 'flex-start', borderRadius: '12px', textTransform: 'none', fontWeight: 700, 
                                          px: 3, py: 1.5,
                                          background: `linear-gradient(135deg, ${alpha(color, 0.1)}, ${alpha(color, 0.2)})`,
                                          color: color, 
                                          border: `1px solid ${alpha(color, 0.3)}`,
                                          backdropFilter: 'blur(8px)',
                                          boxShadow: `0 4px 12px ${alpha(color, 0.1)}`,
                                          transition: 'all 0.3s ease',
                                          '&:hover': { 
                                            background: `linear-gradient(135deg, ${alpha(color, 0.15)}, ${alpha(color, 0.3)})`,
                                            boxShadow: `0 6px 16px ${alpha(color, 0.2)}`,
                                            transform: 'translateY(-1px)'
                                          } 
                                        }}
                                      >
                                        + Add Another Myth/Fact Pair
                                      </Button>
                                    <PremiumTextField colorTheme={color}
                                      fullWidth  label="Discussion Prompt (Optional)"
                                      placeholder="Is this myth still prevalent in your sector?" value={b.content.discussionPrompt || ''} onChange={e => updateBlock(b.id, 'discussionPrompt', e.target.value)}
                                      
                                    />
                                  </Box>
                                )}
                                {b.type === 'live_poll' && (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <PremiumTextField colorTheme={color}
                                      fullWidth  label="Poll Question"
                                      placeholder={b.sopHint || ''} value={b.content.question || ''} onChange={e => updateBlock(b.id, 'question', e.target.value)}
                                      
                                    />
                                    <PollOptionsEditor 
                                      initialOptions={b.content.options || ''} 
                                      onChange={opts => updateBlock(b.id, 'options', opts)} 
                                      color={color} 
                                    />
                                    <PremiumTextField colorTheme={color}
                                      fullWidth  label="Discussion Prompt (Optional)"
                                      placeholder="Why did you vote this way?" value={b.content.discussionPrompt || ''} onChange={e => updateBlock(b.id, 'discussionPrompt', e.target.value)}
                                      
                                    />
                                  </Box>
                                )}
                                {b.type === 'strategic_directive' && (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <PremiumAutocomplete
                                      label="Urgency Level"
                                      value={b.content.urgencyLevel || ''}
                                      options={[
                                        { label: '🟡 MONITOR', value: 'MONITOR' },
                                        { label: '🟠 PREPARE', value: 'PREPARE' },
                                        { label: '🔴 EXECUTE NOW', value: 'EXECUTE NOW' }
                                      ]}
                                      onChange={(event, val: any) => updateBlock(b.id, 'urgencyLevel', val?.value || val)}
                                      colorTheme={color}
                                    />
                                    <PremiumTextField colorTheme={color}
                                      fullWidth label="Target Persona (e.g., Policymakers, VCs)"
                                      placeholder="Agri-Tech VCs" value={b.content.targetPersona || ''} onChange={e => updateBlock(b.id, 'targetPersona', e.target.value)}
                                    />
                                    <PremiumMarkdownEditor colorTheme={color}
                                      fullWidth multiline rows={2} label="🎯 Point 1: The Threat/Reality"
                                      placeholder="What happens if they ignore this?" value={b.content.point1 || ''} onChange={e => updateBlock(b.id, 'point1', e.target.value)}
                                    />
                                    <PremiumMarkdownEditor colorTheme={color}
                                      fullWidth multiline rows={2} label="➔ Point 2: The Immediate Action"
                                      placeholder="Halt, Dismantle, Deploy..." value={b.content.point2 || ''} onChange={e => updateBlock(b.id, 'point2', e.target.value)}
                                    />
                                    <PremiumMarkdownEditor colorTheme={color}
                                      fullWidth multiline rows={2} label="📡 Point 3: The Long-Term Pivot"
                                      placeholder="How to convert this into a monopoly" value={b.content.point3 || ''} onChange={e => updateBlock(b.id, 'point3', e.target.value)}
                                    />
                                    <PremiumAutocomplete
                                      label="Micro CTA (Tactical Link)"
                                      value={b.content.microCtaId || ''}
                                      options={MICRO_CTAS.map(cta => ({ label: cta.text, value: cta.id }))}
                                      onChange={(event, val: any) => updateBlock(b.id, 'microCtaId', val?.value || val)}
                                      colorTheme={color}
                                    />
                                  </Box>
                                )}
                                {b.type === 'call_to_action' && (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <PremiumAutocomplete
                                      label="Macro CTA (Platform Growth Banner)"
                                      value={b.content.macroCtaId || ''}
                                      options={MACRO_CTAS.map(cta => ({ label: cta.hook, value: cta.id }))}
                                      onChange={(event, val: any) => updateBlock(b.id, 'macroCtaId', val?.value || val)}
                                      colorTheme={color}
                                    />
                                  </Box>
                                )}
                                {b.type === 'pull_quote' && (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <PremiumMarkdownEditor colorTheme={color}
                                      fullWidth multiline rows={3}  label="Quote Text"
                                      placeholder={b.sopHint || ''} value={b.content.quote || ''} onChange={(e: any) => updateBlock(b.id, 'quote', e.target.value)}
                                      
                                    />
                                    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                                      <PremiumTextField colorTheme={color}
                                        fullWidth  label="Attribution"
                                        placeholder="Name, Title" value={b.content.attribution || ''} onChange={e => updateBlock(b.id, 'attribution', e.target.value)}
                                        
                                      />
                                        <Box sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                                          {mediaUrlMode[b.id] ? (
                                            <PremiumTextField colorTheme={color}
                                              fullWidth  label="Avatar/Logo URL (Optional)"
                                              placeholder="https://..." value={b.content.avatarUrl || ''} onChange={e => updateBlock(b.id, 'avatarUrl', e.target.value)}
                                              
                                            />
                                          ) : (
                                            <Button
                                               component="label" fullWidth
                                              sx={{ height: 56, borderRadius: '14px', borderStyle: 'dashed', borderWidth: 2, color: color, borderColor: alpha(color, 0.4), '&:hover': { borderColor: color, bgcolor: alpha(color, 0.05) }, justifyContent: 'flex-start', px: 2 }}
                                            >
                                              <input type="file" hidden accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(b.id, 'avatarUrl', e.target.files[0]); }} />
                                              {uploading ? <CircularProgress size={24} color="inherit" /> : (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                  <UploadIcon />
                                                  <Typography sx={{ fontWeight: 700, textTransform: 'none' }}>Upload Avatar</Typography>
                                                </Box>
                                              )}
                                            </Button>
                                          )}
                                          <Tooltip title={mediaUrlMode[b.id] ? "Switch to Upload" : "Paste URL instead"}>
                                            <IconButton onClick={(e) => { e.stopPropagation(); toggleUrlMode(b.id); }} sx={{ bgcolor: alpha(color, 0.1), color, '&:hover': { bgcolor: alpha(color, 0.2) }, width: 48, height: 48, borderRadius: '14px', flexShrink: 0 }}>
                                              {mediaUrlMode[b.id] ? <UploadIcon /> : <LinkIcon />}
                                            </IconButton>
                                          </Tooltip>
                                        </Box>
                                    </Box>
                                    <PremiumTextField colorTheme={color}
                                      fullWidth  label="Discussion Prompt (Optional)"
                                      placeholder="What are your thoughts on this quote?" value={b.content.discussionPrompt || ''} onChange={e => updateBlock(b.id, 'discussionPrompt', e.target.value)}
                                      
                                    />
                                  </Box>
                                )}
                                {b.type === 'exec_summary' && (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {[0, 1, 2].map(idx => (
                                      <PremiumMarkdownEditor colorTheme={color}
                                        key={idx}
                                        fullWidth  
                                        multiline minRows={2}
                                        label={selectedTimeframe ? EXEC_SUMMARY_LABELS[selectedTimeframe as keyof typeof EXEC_SUMMARY_LABELS][idx] : `Summary Point ${idx + 1}`}
                                        value={b.content[`point${idx + 1}`] || ''} onChange={(e: any) => updateBlock(b.id, `point${idx + 1}`, e.target.value)}
                                        
                                      />
                                    ))}
                                  </Box>
                                )}
                                {b.type === 'highlight_card' && (
                                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                                    <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                                        <PremiumAutocomplete
                                          options={['Autopsy', 'Critical', 'Current Reality', 'Failure', 'Forecast', 'Insight', 'Post-Mortem', 'Prediction', 'Root Cause', 'Solution', 'Status Quo', 'Strategy', 'Success', 'Trend', 'Vision', 'Warning']}
                                          freeSolo
                                          colorTheme={color}
                                          label="Status Tag"
                                          value={b.content.label || ''}
                                          onChange={(e, newValue) => updateBlock(b.id, 'label', newValue || '')}
                                          onInputChange={(e, newInputValue) => updateBlock(b.id, 'label', newInputValue)}
                                          fullWidth
                                          sx={{ flex: 1 }}
                                        />
                                      </Box>
                                      <PremiumMarkdownEditor colorTheme={color}
                                        fullWidth  label="Caption / Statistic"
                                        multiline minRows={3}
                                        placeholder={b.sopHint || 'What collapsed and when?'} value={b.content.caption || ''} onChange={(e: any) => updateBlock(b.id, 'caption', e.target.value)}
                                        
                                      />
                                      {b.content.imagePrompt && <AIImagePromptDisplay promptText={b.content.imagePrompt} color={color} />}
                                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        {mediaUrlMode[b.id] ? (
                                          <PremiumTextField colorTheme={color}
                                            fullWidth  label="Background Image URL"
                                            placeholder="https://..." value={b.content.imageUrl || ''} onChange={e => updateBlock(b.id, 'imageUrl', e.target.value)}
                                            
                                          />
                                        ) : (
                                          <Button
                                             component="label" fullWidth
                                            sx={{ height: 56, borderRadius: '14px', borderStyle: 'dashed', borderWidth: 2, color: color, borderColor: alpha(color, 0.4), '&:hover': { borderColor: color, bgcolor: alpha(color, 0.05) }, justifyContent: 'flex-start', px: 2 }}
                                          >
                                            <input type="file" hidden accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(b.id, 'imageUrl', e.target.files[0]); }} />
                                            {uploading ? <CircularProgress size={24} color="inherit" /> : (
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <UploadIcon />
                                                <Typography sx={{ fontWeight: 700, textTransform: 'none' }}>Upload Image</Typography>
                                              </Box>
                                            )}
                                          </Button>
                                        )}
                                        <Tooltip title={mediaUrlMode[b.id] ? "Switch to Upload" : "Paste URL instead"}>
                                          <IconButton onClick={(e) => { e.stopPropagation(); toggleUrlMode(b.id); }} sx={{ bgcolor: alpha(color, 0.1), color, '&:hover': { bgcolor: alpha(color, 0.2) }, width: 48, height: 48, borderRadius: '14px', flexShrink: 0 }}>
                                            {mediaUrlMode[b.id] ? <UploadIcon /> : <LinkIcon />}
                                          </IconButton>
                                        </Tooltip>
                                      </Box>
                                    </Box>
                                    <Box sx={{ flex: 1, borderRadius: '14px', overflow: 'hidden', bgcolor: 'rgba(0,0,0,0.03)', border: '1px dashed rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
                                      {b.content.imageUrl ? (
                                        <img src={b.content.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                      ) : (
                                        <Typography sx={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>Image Preview</Typography>
                                      )}
                                    </Box>
                                  </Box>
                                )}
                                {b.type === 'data_embed' && (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <PremiumTextField colorTheme={color}
                                      fullWidth  label="Data Embed URL"
                                      placeholder="https://dune.com/embeds/..." value={b.content.iframeUrl || ''} onChange={e => updateBlock(b.id, 'iframeUrl', e.target.value)}
                                      helperText="Paste the URL of the chart or dashboard you want to embed. We will securely sandbox it."
                                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', color: '#0f172a', bgcolor: 'rgba(0,0,0,0.02)', '& fieldset': { borderColor: 'rgba(0,0,0,0.15)' }, '&:hover fieldset': { borderColor: alpha(color, 0.5) }, '&.Mui-focused fieldset': { borderColor: color, borderWidth: 2 } }, '& .MuiInputLabel-root': { color: '#475569', fontWeight: 600 }, '& .MuiFormHelperText-root': { color: '#64748b' } }}
                                    />
                                  </Box>
                                )}
                                {b.type === 'media' && (
                                  <Box sx={{ p: 1 }}>
                                    <EvidenceGalleryEditor
                                      initialItems={b.content.items || []}
                                      onChange={(newItems) => updateBlock(b.id, 'items', newItems)}
                                      color={color}
                                      blockId={b.id}
                                      uploadFn={registerNestedUpload}
                                      uploading={uploading}
                                    />
                                    <PremiumTextField colorTheme={color}
                                      fullWidth  label="Discussion Prompt (Optional)"
                                      placeholder="What stands out to you in this evidence?" value={b.content.discussionPrompt || ''} onChange={e => updateBlock(b.id, 'discussionPrompt', e.target.value)}
                                      sx={{ mt: 3, '& .MuiOutlinedInput-root': { borderRadius: '14px', color: '#0f172a', bgcolor: 'rgba(0,0,0,0.02)', '& fieldset': { borderColor: 'rgba(0,0,0,0.15)' }, '&:hover fieldset': { borderColor: alpha(color, 0.5) }, '&.Mui-focused fieldset': { borderColor: color, borderWidth: 2 } }, '& .MuiInputLabel-root': { color: '#475569', fontWeight: 600 } }}
                                    />
                                  </Box>
                                )}
                                {b.type === 'data_embed' && (
                                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                                    <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                      <PremiumTextField colorTheme={color}
                                        fullWidth  label="Embed URL or Code"
                                        placeholder="Paste embed code or URL..." value={b.content.embedUrl || ''} onChange={e => updateBlock(b.id, 'embedUrl', e.target.value)}
                                        
                                      />
                                      <PremiumTextField colorTheme={color}
                                        fullWidth  label="Caption"
                                        placeholder="Describe this data..." value={b.content.caption || ''} onChange={e => updateBlock(b.id, 'caption', e.target.value)}
                                        
                                      />
                                    </Box>
                                    <Box sx={{ flex: 1, borderRadius: '14px', overflow: 'hidden', bgcolor: 'rgba(0,0,0,0.03)', border: '1px dashed rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
                                      <Typography sx={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center', px: 2 }}>{b.content.embedUrl ? 'Data Embed Active' : 'Embed Preview'}</Typography>
                                    </Box>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                                  </Box>
                                </Box>
                              )}
                            </SortableBlockWrapper>
                      );
                    })}
                      </SortableContext>
                    </DndContext>

                    {/* ΓöÇΓöÇΓöÇ ADD BLOCK BAR ΓöÇΓöÇΓöÇ */}
                    <Box sx={{
                      mt: 4, p: 3, borderRadius: '24px',
                      background: 'rgba(255,255,255,0.8)',
                      border: '1px dashed rgba(0,0,0,0.15)',
                      backdropFilter: 'blur(12px)',
                    }}>
                      <Typography sx={{ color: '#0f172a', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>
                        + Add Custom Block
                      </Typography>
                      <Box sx={{
                        display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1,
                        '&::-webkit-scrollbar': { display: 'none' },
                      }}>
                        {Object.entries(BLOCK_DEFINITIONS).map(([key, def]) => (
                          <Chip
                            key={key}
                            label={def.label}
                            onClick={() => handleAddBlock(key as BlockType)}
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
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>Content Details</Typography>
                
                <PremiumTextField 
                  colorTheme={activeThemeColor} 
                  label="Title" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  fullWidth 
                />
                <PremiumTextField 
                  colorTheme={activeThemeColor} 
                  label="Description" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  fullWidth 
                  multiline 
                  rows={3} 
                />

                <Box sx={{ mb: 2, width: { xs: '100%', md: '50%' } }}>
                  <PremiumTextField
                    colorTheme={activeThemeColor}
                    label="Scheduled Publish Date (Optional)"
                    type="datetime-local"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                    Leave blank to publish immediately or keep as an unscheduled draft.
                  </Typography>
                </Box>

                {(type === 'video' || type === 'livestream') && (
                  <PremiumTextField colorTheme={activeThemeColor} label={type === 'livestream' ? "Livestream URL" : "Video URL"} value={videoUrl} onChange={e => setVideoUrl(e.target.value)} fullWidth />
                )}
                {type === 'report' && (
                  <PremiumTextField colorTheme={activeThemeColor} label="PDF URL" value={reportPdfUrl} onChange={e => setReportPdfUrl(e.target.value)} fullWidth />
                )}

                <PremiumTextField 
                  colorTheme={activeThemeColor} 
                  label="Thumbnail URL (Optional)" 
                  value={thumbnailUrl} 
                  onChange={e => setThumbnailUrl(e.target.value)} 
                  fullWidth 
                />
              </Box>
            )}
          </Box>
        )}

      </Box>

      {/* FOOTER */}
      <Box sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        {step < 3 ? (
          <Button 
            variant="contained" 
            onClick={() => setStep(step + 1)} 
            disabled={(step === 1 && !type) || (step === 2 && !selectedTimeframe)}
            sx={{ 
              bgcolor: activeThemeColor, 
              fontWeight: 700, 
              px: 3, 
              borderRadius: 2,
              '&:disabled': {
                bgcolor: 'rgba(0,0,0,0.12)',
              }
            }} 
            endIcon={<ArrowForwardIcon />}
          >
            Next Step
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              
              onClick={() => setPreviewOpen(true)}
              startIcon={<SparkleIcon sx={{ color: '#8b5cf6' }} />}
              sx={{
                borderColor: 'rgba(139,92,246,0.3)',
                color: '#64748b',
                bgcolor: 'rgba(139,92,246,0.05)',
                fontWeight: 800,
                borderRadius: '12px',
                px: 3,
                '&:hover': {
                  bgcolor: 'rgba(139,92,246,0.1)',
                  borderColor: '#8b5cf6',
                  color: '#0f172a',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Preview
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              sx={{
                bgcolor: 'rgba(245, 158, 11, 0.1)',
                color: '#d97706',
                fontWeight: 800,
                borderRadius: '12px',
                px: 3,
                '&:hover': {
                  bgcolor: 'rgba(245, 158, 11, 0.2)',
                  color: '#b45309'
                }
              }}
            >
              {loading ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button 
              variant="contained" 
              onClick={() => handleSubmit(true)} 
              disabled={loading} 
              sx={{ 
                bgcolor: activeThemeColor, 
                fontWeight: 800, 
                px: 4, 
                borderRadius: '12px',
                opacity: (blocks.length > 0 && !blocks.every(b => isBlockFilled(b))) ? 0.5 : 1
              }}
            >
              {loading ? 'Publishing...' : 'Publish'}
            </Button>
          </Box>
        )}
      </Box>

      {/* PREMIUM PREVIEW DIALOG */}
      <Dialog 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        maxWidth={false}
        sx={{ 
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(0,0,0,0.2)',
          '& .MuiDialog-paper': { 
            width: '85vw',
            height: '85vh',
            maxHeight: '85vh',
            bgcolor: '#f8fafc',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
            position: 'relative'
          } 
        }}
      >
        {/* Floating Glassy Pill Header */}
        <Box sx={{ 
          position: 'absolute', top: 24, right: 24, zIndex: 10,
          display: 'flex', alignItems: 'center', gap: 1.5,
          p: 1, pr: 1.5, pl: 2,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)',
          backdropFilter: 'blur(16px)',
          borderRadius: '100px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.5)'
        }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 1 }}>
            <SparkleIcon sx={{ color: '#8b5cf6', fontSize: 16 }} /> Preview
          </Typography>
          <Box sx={{ width: '1px', height: 16, bgcolor: 'rgba(0,0,0,0.1)' }} />
          <IconButton onClick={() => setPreviewOpen(false)} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.04)', color: '#0f172a', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 3, md: 6, lg: 8 }, display: 'flex', justifyContent: 'center', bgcolor: '#fff' }}>
          <Box sx={{ width: '100%', maxWidth: 800 }}>
            {/* Content Blocks */}
            {blocks.map((b) => (
              <Box key={b.id} sx={{ mb: 5, position: 'relative' }}>
                <ArticleBlockRenderer 
                  block={{ id: b.id, blockType: b.type, content: b.content }} 
                  themeMode="light" 
                  accentColor={selectedTimeframe === 'past' ? '#ef4444' : selectedTimeframe === 'present' ? '#10b981' : '#3b82f6'} 
                  author={{ 
                    name: [profile?.prefixes?.[0], profile?.firstName || "You", profile?.lastName, profile?.suffixes?.[0]].filter(Boolean).join(' '), 
                    avatarUrl: profile?.avatarUrl || "https://i.pravatar.cc/150?u=preview",
                    isVerified: true
                  }}
                  onOpenInsights={() => console.log('Insights clicked in preview')}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Dialog>

      {/* ΓöÇΓöÇΓöÇ MODALS ΓöÇΓöÇΓöÇ */}
      <Dialog open={showReorderModal} onClose={() => setShowReorderModal(false)} sx={{ '& .MuiDialog-paper': { borderRadius: '24px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.4rem', color: '#0f172a' }}>
          Unlock Reordering?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#475569', fontWeight: 500, fontSize: '1.05rem', lineHeight: 1.6 }}>
            The current block order is scientifically optimized for the <strong style={{ color: '#0f172a' }}>{selectedTimeframe?.toUpperCase()}</strong> framework.
            <br /><br />
            Reordering blocks may reduce the pedagogical impact and reader engagement of your briefing. Are you sure you want to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowReorderModal(false)} sx={{ color: '#64748b', fontWeight: 700 }}>
            Keep Suggested Order
          </Button>
          <Button onClick={() => { setReorderUnlocked(true); setShowReorderModal(false); }} variant="contained" sx={{ bgcolor: '#0f172a', color: '#fff', borderRadius: '12px', fontWeight: 800, '&:hover': { bgcolor: '#1e293b' } }}>
            Unlock Reorder
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showResetModal} onClose={() => setShowResetModal(false)} sx={{ '& .MuiDialog-paper': { borderRadius: '24px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.4rem', color: '#ef4444' }}>
          Reset Block Order?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#475569', fontWeight: 500, fontSize: '1.05rem', lineHeight: 1.6 }}>
            This will reorganize your blocks back into the original <strong style={{ color: '#0f172a' }}>{selectedTimeframe?.toUpperCase()}</strong> sequence.
            <br /><br />
            Your typed contents will <strong>not</strong> be deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowResetModal(false)} sx={{ color: '#64748b', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button onClick={resetFrameworkOrder} variant="contained" sx={{ bgcolor: '#ef4444', color: '#fff', borderRadius: '12px', fontWeight: 800, '&:hover': { bgcolor: '#dc2626' } }}>
            Reset Order
          </Button>
        </DialogActions>
      </Dialog>
      {/* FLOATING ACTION ITEMS CHECKLIST */}
      {step === 3 && actionItems.length > 0 && (
        <Box sx={{
          position: 'fixed',
          bottom: { xs: 80, md: 40 },
          left: { xs: 20, md: 40 }, // Moved to left to avoid covering submit buttons on the right
          zIndex: 1000,
          width: { xs: 'calc(100% - 40px)', sm: 340 },
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          animation: `${slideUpFade} 0.4s cubic-bezier(0.16, 1, 0.3, 1)`,
        }}>
          {/* Header */}
          <Box sx={{ 
            px: 3, py: 2, 
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SparkleIcon sx={{ color: '#fbbf24', fontSize: 18 }} />
              <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                Action Items
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label={`${actionItems.length} left`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800, fontSize: '0.7rem', height: 22 }}
              />
              <IconButton 
                size="small" 
                onClick={() => setIsActionItemsMinimized(!isActionItemsMinimized)}
                sx={{ color: '#fff', p: 0.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                {isActionItemsMinimized ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />}
              </IconButton>
            </Box>
          </Box>
          
          {/* List */}
          <Box sx={{ 
            p: isActionItemsMinimized ? 0 : 2, 
            maxHeight: isActionItemsMinimized ? 0 : '300px', 
            overflowY: 'auto',
            opacity: isActionItemsMinimized ? 0 : 1,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: isActionItemsMinimized ? 'none' : 'block' // Ensure it doesn't take space/clicks when hidden
          }}>
            {actionItems.map((item, i) => (
              <Box 
                key={`${item.id}-${i}`}
                onClick={() => {
                  setFlippedBlockId(item.id);
                  const el = document.getElementById(`block-${item.id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                sx={{
                  display: 'flex', alignItems: 'flex-start', gap: 1.5,
                  p: 1.5, borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' }
                }}
              >
                <Box sx={{ 
                  width: 20, height: 20, borderRadius: '50%', 
                  border: '2px solid rgba(0,0,0,0.15)', mt: 0.2, flexShrink: 0 
                }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', lineHeight: 1.4 }}>
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

    </Box>
  );
}
