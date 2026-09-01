'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { 
  Popover, Menu, MenuItem, 
  Box, Typography, TextField, Button, Chip, 
  CircularProgress, alpha, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Alert,
  Divider, Avatar, Paper, Autocomplete
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
  Build as BuildIcon,
  Edit as EditIcon,
  AutoAwesome as AutoAwesomeIcon,
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
import EcosystemJobPicker from '@/components/learn/EcosystemJobPicker';
import { useClipNotes } from '@/context/ClipNoteContext';
import { ClipNoteDrawer } from '../clips/ClipNoteDrawer';
import { BlockClipAttachmentPill } from '../clips/BlockClipAttachmentPill';
import { ArticleActionHub } from './ArticleActionHub';
import { PipelineGenerationModal } from './PipelineGenerationModal';
import { StreamDraftingModal } from './StreamDraftingModal';
import { ScratchpadModal } from './ScratchpadModal';
import { BlockScratchpadModal } from './BlockScratchpadModal';
import { EditorialPromptSidePane } from './EditorialPromptSidePane';
import { GeneratedBlockResult } from '@/lib/actions/articleDraftPipeline';
import { ParsedStreamBlock } from '@/lib/utils/articleStreamParser';

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
  MATRIX_DESCRIPTIONS,
  BLOCK_DEFINITIONS,
  ArticleFormat, 
  ArticleEra, 
  SopBlock, 
  BlockType 
} from '@/lib/config/articleBlueprints';

const FORMAT_SHORT_DESCRIPTIONS: Record<ArticleFormat, string> = {
  brief: "Systemic market bottlenecks and real-time forces.",
  memo: "Capital deployment, TAM thesis, and investor returns.",
  playbook: "Step-by-step field protocols and operator survival SOPs.",
  comparison: "Rigorous showdown between models, tech, or locations.",
  culture: "Frontline human stories, labor dynamics, and incentives.",
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
    `[Factor A] vs. [Factor B]: Why Only [Specific Winner] Can Afford to [Action] in ${new Date().getFullYear()} [Location], and Why [Target Persona] Must [Action]`
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
      case 'strategic_directive': return !!b.content.urgencyLevel && !!b.content.targetPersona;
      case 'call_to_action': return !!b.content.macroCtaId;
      case 'comparison_matrix': return !!b.content.optionAName && !!b.content.optionBName;
      case 'unit_economics_card': return !!b.content.tam || !!b.content.targetIrr;
      case 'protocol_steps': return Array.isArray(b.content.steps) && b.content.steps.length > 0;
      case 'timeline_tracker': return Array.isArray(b.content.milestones) && b.content.milestones.length > 0;
      case 'persona_dossier': return !!b.content.name && !!b.content.fieldQuote;
      case 'ecosystem_embed': return !!b.content.title && !!b.content.ctaLink;
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
  const [isBlueprintCardFlipped, setIsBlueprintCardFlipped] = useState(false);
  const [blueprintConfigStep, setBlueprintConfigStep] = useState<1 | 2>(1);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [articleEditorMode, setArticleEditorMode] = useState<'framework' | 'canvas'>('framework');

  const blueprintFrontCardRef = useRef<HTMLDivElement>(null);
  const blueprintBackCardRef = useRef<HTMLDivElement>(null);

  const { openClipDrawer, getNotesForPair, getNotesForBlock } = useClipNotes();
  const currentPairNotes = useMemo(() => {
    if (!selectedCommodity || !selectedCategory) return [];
    return getNotesForPair(selectedCommodity, selectedCategory);
  }, [getNotesForPair, selectedCommodity, selectedCategory]);

  const handleSaveBlueprintConfig = useCallback(() => {
    setIsBlueprintCardFlipped(false);
    setTimeout(() => {
      blueprintFrontCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  }, []);

  // Smooth scroll to selected item (or top) on step transition
  useEffect(() => {
    if (!isBlueprintCardFlipped) return;

    const timeout = setTimeout(() => {
      if (blueprintConfigStep === 1) {
        const selectedSubEl = document.querySelector('[data-selected-subcategory="true"]');
        if (selectedSubEl) {
          selectedSubEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (blueprintBackCardRef.current) {
          blueprintBackCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else if (blueprintConfigStep === 2) {
        const selectedLensEl = document.querySelector('[data-selected-lens="true"]');
        const selectedEraEl = document.querySelector('[data-selected-era="true"]');
        if (selectedLensEl) {
          selectedLensEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (selectedEraEl) {
          selectedEraEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (blueprintBackCardRef.current) {
          blueprintBackCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [blueprintConfigStep, isBlueprintCardFlipped]);

  const normalizeSubcategoryString = (str?: string): string => {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/^[\s#0-9.-]+/, '') // strip leading numbers like "1.", "01 - ", "#1 "
      .replace(/\s*\(.*?\)\s*$/, '') // strip trailing brackets
      .replace(/&/g, ' and ') // normalize & to and
      .replace(/[^a-z0-9\s]/g, ' ') // replace special chars with spaces
      .replace(/\s+/g, ' ') // collapse multiple spaces
      .trim();
  };

  const isSubcategoryMatch = useCallback((sub: { id: string; title: string; desc?: string; shortName?: string }, targetVal?: string): boolean => {
    if (!targetVal) return false;
    
    const normTarget = normalizeSubcategoryString(targetVal);
    if (!normTarget) return false;
    
    const normId = normalizeSubcategoryString(sub.id);
    const normTitle = normalizeSubcategoryString(sub.title);
    const normShortName = normalizeSubcategoryString((sub as any).shortName);
    
    // 1. Exact normalized match
    if (normId === normTarget || normTitle === normTarget || normShortName === normTarget) return true;
    
    // 2. Direct inclusion match
    if (normTarget.length >= 3) {
      if (normId && (normId.includes(normTarget) || normTarget.includes(normId))) return true;
      if (normTitle && (normTitle.includes(normTarget) || normTarget.includes(normTitle))) return true;
      if (normShortName && (normShortName.includes(normTarget) || normTarget.includes(normShortName))) return true;
    }

    // 3. Token overlap match
    const targetWords = normTarget.split(' ').filter(w => w.length > 2 && !['and', 'the', 'for', 'with'].includes(w));
    const titleWords = normTitle.split(' ').filter(w => w.length > 2 && !['and', 'the', 'for', 'with'].includes(w));
    if (targetWords.length > 0 && titleWords.length > 0) {
      const matchingWords = targetWords.filter(tw => titleWords.some(titleW => titleW.includes(tw) || tw.includes(titleW)));
      if (matchingWords.length >= Math.min(2, targetWords.length)) {
        return true;
      }
    }

    // 4. Raw string inclusion check
    const rawSubFull = (sub.title || '').toLowerCase();
    const rawTargetFull = targetVal.toLowerCase();
    if (rawSubFull.includes(rawTargetFull) || rawTargetFull.includes(rawSubFull)) return true;

    return false;
  }, []);

  const resolveChallenge = useCallback((catIdentifier?: string) => {
    if (!catIdentifier) return challenges[0];
    const clean = catIdentifier.toLowerCase().trim();
    const byId = challenges.find(c => c.id.toLowerCase() === clean);
    if (byId) return byId;
    const byTitle = challenges.find(c => c.title.toLowerCase() === clean);
    if (byTitle) return byTitle;
    const byInc = challenges.find(c => c.title.toLowerCase().includes(clean) || clean.includes(c.title.toLowerCase()) || clean.includes(c.id.toLowerCase()) || c.id.toLowerCase().includes(clean));
    if (byInc) return byInc;
    return challenges[0];
  }, [challenges]);

  const currentSelectedChallenge = useMemo(() => {
    return resolveChallenge(selectedCategory);
  }, [resolveChallenge, selectedCategory]);

  const subcategoriesInSelectedCategory = useMemo(() => {
    return (currentSelectedChallenge?.subcategories || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      description: s.desc || s.description || '',
      imageUrl: s.imageUrl || currentSelectedChallenge?.imageUrl || '',
      groupName: s.groupName || '',
      categoryId: currentSelectedChallenge?.id || '',
      categoryTitle: currentSelectedChallenge?.title || ''
    }));
  }, [currentSelectedChallenge]);

  const activeSubcategoryObj = useMemo(() => {
    if (!selectedSubcategory) return null;
    return subcategoriesInSelectedCategory.find(s => s.id === selectedSubcategory || isSubcategoryMatch(s, selectedSubcategory)) || null;
  }, [subcategoriesInSelectedCategory, selectedSubcategory, isSubcategoryMatch]);

  const isSubcategoryValid = Boolean(activeSubcategoryObj);
  const isBlueprintFilled = Boolean(
    isSubcategoryValid && 
    selectedFormat && 
    selectedEra
  );
  const currentBlueprint = useMemo(() => getBlueprint(selectedFormat, selectedEra) || [], [selectedFormat, selectedEra]);
  const activeFormatMeta = FORMAT_CONFIG[selectedFormat] || FORMAT_CONFIG.brief;
  const activeEraMeta = ERA_CONFIG[selectedEra] || ERA_CONFIG.present;

  const initialTaxonomyKey = useMemo(() => {
    if (!initialTaxonomy) return null;
    return JSON.stringify(initialTaxonomy);
  }, [initialTaxonomy]);
  const prevTaxonomyKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!initialTaxonomy || initialTaxonomyKey === prevTaxonomyKeyRef.current) return;
    prevTaxonomyKeyRef.current = initialTaxonomyKey;

    setType((initialType as any) || 'article');
    if (initialTaxonomy.commodity) setSelectedCommodity(initialTaxonomy.commodity);

    let targetCat = resolveChallenge(initialTaxonomy.category);
    let finalSubId = '';

    const rawSub = initialTaxonomy.subcategory || (initialTaxonomy as any).subcategoryId;
    if (rawSub) {
      // Search in target category first
      const currentSubs = (targetCat.subcategories || []).map((s: any) => ({ id: s.id, title: s.title, shortName: s.shortName }));
      const matchInCat = currentSubs.find((s: any) => isSubcategoryMatch(s, rawSub));
      if (matchInCat) {
        finalSubId = matchInCat.id;
      } else {
        // Search across other challenges if mismatched
        for (const chal of challenges) {
          const cSubs = (chal.subcategories || []).map((s: any) => ({ id: s.id, title: s.title, shortName: s.shortName }));
          const found = cSubs.find((s: any) => isSubcategoryMatch(s, rawSub));
          if (found) {
            targetCat = chal;
            finalSubId = found.id;
            break;
          }
        }
        if (!finalSubId) finalSubId = rawSub;
      }
    }

    setSelectedCategory(targetCat.id);
    setSelectedSubcategory(finalSubId);

    if (initialTaxonomy.format) {
      const rawFmt = String(initialTaxonomy.format).toLowerCase().trim();
      const validFmt: ArticleFormat = ['brief', 'memo', 'playbook', 'comparison', 'culture'].includes(rawFmt)
        ? (rawFmt as ArticleFormat)
        : 'brief';
      setSelectedFormat(validFmt);
    }

    const rawEraSource = initialTaxonomy.timeframe || (initialTaxonomy as any).era;
    if (rawEraSource) {
      const rawEraStr = String(rawEraSource).toLowerCase().trim();
      const validEra: ArticleEra = rawEraStr.includes('past') ? 'past' : rawEraStr.includes('futur') ? 'future' : 'present';
      setSelectedTimeframe(validEra as any);
      setSelectedEra(validEra);
    }

    if (initialTaxonomy.targetDate) setTargetDate(initialTaxonomy.targetDate);
    if (initialTaxonomy.title) setTitle(initialTaxonomy.title);
    if (initialTaxonomy.description) setDescription(initialTaxonomy.description);

    // Keep blocks empty initially so the creator sees the Framework Blueprint preview & "Load This Framework" button
    setBlocks([]);
    setArticleEditorMode('framework');
    setStep(3); // Jump directly to builder
  }, [initialTaxonomyKey, initialTaxonomy, initialType, challenges, isSubcategoryMatch, resolveChallenge]);

  useEffect(() => {
    if (initialDraftData) {
      setType(initialDraftData.type || (initialType as any) || 'article');
      if (initialDraftData.title) setTitle(initialDraftData.title || '');
      if (initialDraftData.description) setDescription(initialDraftData.description || '');
      if (initialDraftData.commodity) setSelectedCommodity(initialDraftData.commodity);
      if (initialDraftData.category) setSelectedCategory(initialDraftData.category || '');
      
      const rawSub = initialDraftData.subcategory || (initialDraftData as any).subcategoryId;
      if (rawSub) {
        const matched = subcategoriesInSelectedCategory.find(s => isSubcategoryMatch(s, rawSub));
        if (matched) {
          setSelectedSubcategory(matched.id);
        } else {
          setSelectedSubcategory(rawSub);
        }
      }

      if (initialDraftData.format) {
        const rawFmt = String(initialDraftData.format).toLowerCase().trim();
        const validFmt: ArticleFormat = ['brief', 'memo', 'playbook', 'comparison', 'culture'].includes(rawFmt)
          ? (rawFmt as ArticleFormat)
          : 'brief';
        setSelectedFormat(validFmt);
      }

      const rawEraSource = initialDraftData.timeframe || (initialDraftData as any).era;
      if (rawEraSource) {
        const rawEraStr = String(rawEraSource).toLowerCase().trim();
        const validEra: ArticleEra = rawEraStr.includes('past') ? 'past' : rawEraStr.includes('futur') ? 'future' : 'present';
        setSelectedTimeframe(validEra as any);
        setSelectedEra(validEra);
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
      if (sourceBlocks && sourceBlocks.length > 0) {
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
        setArticleEditorMode('canvas');
      } else {
        setArticleEditorMode('framework');
      }
      
      setStep(3); // Jump directly to builder
    }
  }, [initialDraftData, initialType, subcategoriesInSelectedCategory, isSubcategoryMatch]);

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
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [isPromptSidePaneOpen, setIsPromptSidePaneOpen] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [activeScratchpadBlock, setActiveScratchpadBlock] = useState<{ block: any, index: number } | null>(null);
  const [canvasAnchorFormat, setCanvasAnchorFormat] = useState<null | HTMLElement>(null);
  const [canvasAnchorEra, setCanvasAnchorEra] = useState<null | HTMLElement>(null);

  const toggleUrlMode = (id: string) => {
    setMediaUrlMode(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePipelineSuccess = useCallback((result: { title: string; description: string; blocks: GeneratedBlockResult[] }) => {
    if (result.title) setTitle(result.title);
    if (result.description) setDescription(result.description);
    if (result.blocks && result.blocks.length > 0) {
      const framework = getBlueprint(selectedFormat, selectedEra);
      const hydrated = result.blocks.map((b, idx) => {
        const sop = framework[idx];
        return {
          id: `block_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
          type: (sop?.type || b.type) as BlockType,
          role: sop?.role || b.role || 'Analysis',
          sopDesc: sop?.desc || '',
          sopHint: sop?.hint || '',
          content: b.content || {}
        };
      });
      setBlocks(hydrated);
      setArticleEditorMode('canvas');
    }
  }, [selectedFormat, selectedEra]);

  const handleSwitchCanvasBlueprint = useCallback((newFmt: ArticleFormat, newEra: ArticleEra) => {
    setSelectedFormat(newFmt);
    setSelectedEra(newEra);
    setSelectedTimeframe(newEra as any);
    
    const targetBlueprint = getBlueprint(newFmt, newEra);
    if (!targetBlueprint) return;
    
    // Re-map existing blocks while preserving entered content
    setBlocks(prevBlocks => {
      const existingPool = [...prevBlocks];
      const remappedBlocks: Array<{ id: string; type: BlockType; content: Record<string, any>; role?: string; sopDesc?: string; sopHint?: string }> = targetBlueprint.map((sop, idx) => {
        const existingIdx = existingPool.findIndex(b => b.type === sop.type);
        if (existingIdx !== -1) {
          const matched = existingPool[existingIdx];
          existingPool.splice(existingIdx, 1);
          return {
            ...matched,
            role: sop.role,
            sopDesc: sop.desc,
            sopHint: sop.hint
          };
        }
        // New block scaffold needed by new blueprint
        const defaultContent: Record<string, any> = {};
        if (sop.type === 'myth_fact') Object.assign(defaultContent, { myth: '', fact: '' });
        if (sop.type === 'live_poll') Object.assign(defaultContent, { question: '', options: 'Yes,No' });
        if (sop.type === 'pull_quote') Object.assign(defaultContent, { quote: '', attribution: '' });
        if (sop.type === 'exec_summary') Object.assign(defaultContent, { points: description || '' });
        if (sop.type === 'core_interactive') Object.assign(defaultContent, { bionicText: '', anchorQuestion: '', imageUrl: '' });
        if (sop.type === 'subheading') Object.assign(defaultContent, { text: title || '' });
        if (sop.type === 'comparison_matrix') Object.assign(defaultContent, { 
          optionAName: '', optionBName: '', winnerVerdict: '', 
          rows: [
            { criterion: 'CAPEX', optionAValue: '', optionBValue: '', winner: 'A' },
            { criterion: 'OPEX / mo', optionAValue: '', optionBValue: '', winner: 'B' },
            { criterion: 'Payback Period', optionAValue: '', optionBValue: '', winner: 'A' }
          ] 
        });
        if (sop.type === 'unit_economics_card') Object.assign(defaultContent, { 
          tam: '', targetIrr: '', ticketSize: '', paybackPeriod: '', grossMargin: '', primaryRisk: '', dealThesis: '' 
        });
        if (sop.type === 'protocol_steps') Object.assign(defaultContent, { 
          steps: [
            { stepNumber: 1, title: 'Initial Setup & Triage', role: 'Lead Operator', timeWindow: 'Day 1', description: '', checklist: ['Verify field safety protocols', 'Log baseline metrics'] }
          ] 
        });
        if (sop.type === 'timeline_tracker') Object.assign(defaultContent, { 
          milestones: [
            { dateOrYear: 'Milestone 1', title: 'Primary Catalyst', description: '', status: 'Trigger' }
          ] 
        });
        if (sop.type === 'persona_dossier') Object.assign(defaultContent, { 
          name: '', roleAndLocation: '', age: '', monthlyTurnover: '', bio: '', fieldQuote: '', avatarUrl: '' 
        });
        if (sop.type === 'ecosystem_embed') Object.assign(defaultContent, { 
          embedType: 'job', title: '', organization: '', location: '', compensationOrTarget: '', ctaText: 'Apply Now', ctaLink: '' 
        });
        return {
          id: `block_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
          type: sop.type as BlockType,
          content: defaultContent,
          role: sop.role,
          sopDesc: sop.desc,
          sopHint: sop.hint
        };
      });
      
      // Append any leftover custom blocks
      remappedBlocks.push(...existingPool);
      return remappedBlocks;
    });
  }, [title, description]);

  const handleStreamSync = useCallback((payload: { title?: string; description?: string; blocks: ParsedStreamBlock[] }) => {
    if (payload.title) setTitle(payload.title);
    if (payload.description) setDescription(payload.description);
    if (payload.blocks && payload.blocks.length > 0) {
      const hydrated = payload.blocks.map((b, idx) => ({
        id: `block_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        type: b.type,
        role: b.role,
        sopDesc: b.sopDesc || '',
        sopHint: '',
        content: b.content || {}
      }));
      setBlocks(hydrated);
      setArticleEditorMode('canvas');
    }
  }, []);

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
    if (bType === 'comparison_matrix') newBlock.content = { 
      optionAName: '', optionBName: '', winnerVerdict: '', 
      rows: [
        { criterion: 'CAPEX', optionAValue: '', optionBValue: '', winner: 'A' },
        { criterion: 'OPEX / mo', optionAValue: '', optionBValue: '', winner: 'B' },
        { criterion: 'Payback Period', optionAValue: '', optionBValue: '', winner: 'A' }
      ] 
    };
    if (bType === 'unit_economics_card') newBlock.content = { 
      tam: '', targetIrr: '', ticketSize: '', paybackPeriod: '', grossMargin: '', primaryRisk: '', dealThesis: '' 
    };
    if (bType === 'protocol_steps') newBlock.content = { 
      steps: [
        { stepNumber: 1, title: 'Isolate & Inspect Hardware', role: 'Operations Lead', timeWindow: 'Day 1', description: '', checklist: ['Verify power source is isolated', 'Document serial numbers'] }
      ] 
    };
    if (bType === 'timeline_tracker') newBlock.content = { 
      milestones: [
        { dateOrYear: 'Phase 1', title: 'Initiation & Infrastructure', description: '', status: 'Milestone' }
      ] 
    };
    if (bType === 'persona_dossier') newBlock.content = { 
      name: '', roleAndLocation: '', age: '', monthlyTurnover: '', bio: '', fieldQuote: '', avatarUrl: '' 
    };
    if (bType === 'ecosystem_embed') newBlock.content = { 
      embedType: 'job', title: '', organization: '', location: '', compensationOrTarget: '', ctaText: 'Apply Now', ctaLink: '' 
    };
    
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
      if (sop.type === 'comparison_matrix') Object.assign(content, { 
        optionAName: '', optionBName: '', winnerVerdict: '', 
        rows: [
          { criterion: 'CAPEX', optionAValue: '', optionBValue: '', winner: 'A' },
          { criterion: 'OPEX / mo', optionAValue: '', optionBValue: '', winner: 'B' },
          { criterion: 'Payback Period', optionAValue: '', optionBValue: '', winner: 'A' }
        ] 
      });
      if (sop.type === 'unit_economics_card') Object.assign(content, { 
        tam: '', targetIrr: '', ticketSize: '', paybackPeriod: '', grossMargin: '', primaryRisk: '', dealThesis: '' 
      });
      if (sop.type === 'protocol_steps') Object.assign(content, { 
        steps: [
          { stepNumber: 1, title: 'Initial Setup & Triage', role: 'Lead Operator', timeWindow: 'Day 1', description: '', checklist: ['Verify field safety protocols', 'Log baseline metrics'] }
        ] 
      });
      if (sop.type === 'timeline_tracker') Object.assign(content, { 
        milestones: [
          { dateOrYear: 'Milestone 1', title: 'Primary Catalyst', description: '', status: 'Trigger' }
        ] 
      });
      if (sop.type === 'persona_dossier') Object.assign(content, { 
        name: '', roleAndLocation: '', age: '', monthlyTurnover: '', bio: '', fieldQuote: '', avatarUrl: '' 
      });
      if (sop.type === 'ecosystem_embed') Object.assign(content, { 
        embedType: 'job', title: '', organization: '', location: '', compensationOrTarget: '', ctaText: 'Apply Now', ctaLink: '' 
      });
      return { id: Math.random().toString(), type: sop.type, content, role: sop.role, sopDesc: sop.desc, sopHint: sop.hint };
    });
    setBlocks(newBlocks);
    setFlippedBlockId(newBlocks[0]?.id || null);
    setArticleEditorMode('canvas');
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
      case 'comparison_matrix':
        total = 3;
        if (c.optionAName) filled++;
        if (c.optionBName) filled++;
        if (Array.isArray(c.rows) && c.rows.length > 0) filled++;
        break;
      case 'unit_economics_card':
        total = 3;
        if (c.tam) filled++;
        if (c.targetIrr) filled++;
        if (c.primaryRisk || c.paybackPeriod || c.grossMargin) filled++;
        break;
      case 'protocol_steps':
        total = 1;
        if (Array.isArray(c.steps) && c.steps.length > 0 && c.steps.some((s: any) => s.title)) filled = 1;
        break;
      case 'timeline_tracker':
        total = 1;
        if (Array.isArray(c.milestones) && c.milestones.length > 0 && c.milestones.some((m: any) => m.title)) filled = 1;
        break;
      case 'persona_dossier':
        total = 3;
        if (c.name) filled++;
        if (c.roleAndLocation || c.monthlyTurnover) filled++;
        if (c.fieldQuote || c.bio) filled++;
        break;
      case 'ecosystem_embed':
        total = 3;
        if (c.title) filled++;
        if (c.organization || c.location) filled++;
        if (c.ctaLink || c.ctaText) filled++;
        break;
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

                      {/* Right Controls: Mode Switcher */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title={articleEditorMode === 'framework' ? "Viewing Framework Configurator" : "Tap to Switch to Framework Configurator"}>
                          <Chip 
                            icon={draftId && draftId !== 'new' ? <AccessTimeIcon sx={{ fontSize: 14 }} /> : <AddIcon sx={{ fontSize: 14 }} />}
                            label={`${draftId && draftId !== 'new' ? 'EDITING' : 'NEW'} ${eMeta.label.toUpperCase()} ${fMeta.label.toUpperCase()}`}
                            onClick={() => setArticleEditorMode(articleEditorMode === 'framework' ? 'canvas' : 'framework')}
                            size="small" 
                            sx={{ 
                              bgcolor: draftId && draftId !== 'new' ? 'rgba(245, 158, 11, 0.12)' : alpha(fMeta.color, 0.12), 
                              color: draftId && draftId !== 'new' ? '#d97706' : fMeta.color, 
                              fontWeight: 900, 
                              border: `1.5px solid ${draftId && draftId !== 'new' ? 'rgba(245, 158, 11, 0.3)' : alpha(fMeta.color, 0.35)}`,
                              px: 1.25, height: 28, fontSize: '0.74rem', letterSpacing: '0.04em',
                              cursor: 'pointer',
                              transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: `0 4px 12px ${draftId && draftId !== 'new' ? 'rgba(245, 158, 11, 0.2)' : alpha(fMeta.color, 0.25)}`
                              },
                              '& .MuiChip-icon': { color: 'inherit' }
                            }} 
                          />
                        </Tooltip>
                      </Box>
                    </Box>
                  );
                })()}

                {/* ═══════════════════════ FRAMEWORK & BLUEPRINT PREVIEW SPACE ═══════════════════════ */}
                {articleEditorMode === 'framework' && (() => {
                  const currentChallenge = challenges.find(c => c.id === selectedCategory) || challenges[0];
                  const subcategoriesList = currentChallenge?.subcategories || [];
                  const activeFormatMeta = FORMAT_CONFIG[selectedFormat] || FORMAT_CONFIG.brief;
                  const activeEraMeta = ERA_CONFIG[selectedEra] || ERA_CONFIG.present;
                  const currentBlueprint = getBlueprint(selectedFormat, selectedEra);
                  const selectedSubObj = activeSubcategoryObj;

                  const formatsList: ArticleFormat[] = ['brief', 'memo', 'playbook', 'comparison', 'culture'];
                  const erasList: ArticleEra[] = ['past', 'present', 'future'];

                  const blueprintFilledCount = (isSubcategoryValid ? 1 : 0) + (selectedFormat ? 1 : 0) + (selectedEra ? 1 : 0);
                  const isBlueprintFilled = blueprintFilledCount === 3;
                  const blueprintFillPercent = Math.round((blueprintFilledCount / 3) * 100);

                  return (
                    <Box sx={{ mb: 6, animation: 'fadeIn 0.3s ease' }}>
                      {/* 3D Flipping Blueprint Configuration Block */}
                      <Box sx={{ perspective: '1600px', mb: 4 }}>
                        <Box sx={{
                          position: 'relative',
                          transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          transformStyle: 'preserve-3d',
                          transformOrigin: 'center center',
                          transform: isBlueprintCardFlipped ? 'rotateX(-180deg)' : 'none',
                        }}>
                          {/* ═══ FRONT FACE (SUMMARY & COMPLETED STATE) ═══ */}
                          <Box
                            ref={blueprintFrontCardRef}
                            onClick={() => !isBlueprintCardFlipped && setIsBlueprintCardFlipped(true)}
                            sx={{
                              backfaceVisibility: 'hidden',
                              position: isBlueprintCardFlipped ? 'absolute' : 'relative',
                              width: '100%', top: 0,
                              borderRadius: '24px',
                              border: `1.5px solid ${isBlueprintFilled ? alpha(activeFormatMeta.color, 0.8) : alpha(activeFormatMeta.color, 0.18)}`,
                              background: isBlueprintFilled 
                                ? `linear-gradient(135deg, ${activeFormatMeta.color} 0%, ${alpha(activeFormatMeta.color, 0.88)} 100%)`
                                : `linear-gradient(to right, ${alpha(activeFormatMeta.color, 0.2)} ${blueprintFillPercent}%, rgba(255,255,255,0.95) ${blueprintFillPercent}%, rgba(248,250,252,0.9) 100%)`,
                              backdropFilter: 'blur(16px)',
                              boxShadow: isBlueprintFilled ? `0 16px 40px ${alpha(activeFormatMeta.color, 0.35)}` : `0 8px 32px rgba(0,0,0,0.04)`,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                              '&:hover': {
                                borderColor: isBlueprintFilled ? activeFormatMeta.color : alpha(activeFormatMeta.color, 0.6),
                                boxShadow: isBlueprintFilled ? `0 20px 50px ${alpha(activeFormatMeta.color, 0.45)}` : `0 12px 48px rgba(0,0,0,0.08)`,
                                transform: 'translateY(-2px)'
                              },
                            }}
                          >
                            {/* Watermark */}
                            <Typography sx={{ 
                              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
                              fontWeight: 900, fontSize: { xs: '1.8rem', md: '3.2rem' }, 
                              color: isBlueprintFilled ? 'rgba(255,255,255,0.12)' : alpha(activeFormatMeta.color, 0.08), pointerEvents: 'none', letterSpacing: '0.05em',
                              textTransform: 'uppercase', whiteSpace: 'nowrap', zIndex: 0
                            }}>
                              {isBlueprintFilled ? 'BLUEPRINT CONFIGURED' : `${blueprintFilledCount} / 3 CONFIGURED`}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'stretch', position: 'relative', zIndex: 1 }}>
                              {/* Left accent bar */}
                              <Box sx={{
                                width: isBlueprintFilled ? 0 : 6, flexShrink: 0,
                                background: `linear-gradient(180deg, ${alpha(activeFormatMeta.color, 0.6)} 0%, ${alpha(activeFormatMeta.color, 0.15)} 100%)`,
                              }} />

                              <Box sx={{ p: { xs: 2.5, md: 3.5 }, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {/* Top Row: Icon + Title + Tap to Edit Badge */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{
                                      width: 48, height: 48, borderRadius: '14px', flexShrink: 0,
                                      bgcolor: isBlueprintFilled ? 'rgba(255,255,255,0.22)' : alpha(activeFormatMeta.color, 0.1),
                                      border: isBlueprintFilled ? '1px solid rgba(255,255,255,0.35)' : `1px solid ${alpha(activeFormatMeta.color, 0.25)}`,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      boxShadow: isBlueprintFilled ? '0 4px 16px rgba(0,0,0,0.1)' : 'none',
                                    }}>
                                      <SparkleIcon sx={{ fontSize: 24, color: isBlueprintFilled ? '#fff' : activeFormatMeta.color }} />
                                    </Box>

                                    <Box sx={{ flex: 1, minWidth: 220 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                                        <Typography sx={{ fontWeight: 900, color: isBlueprintFilled ? '#fff' : '#0f172a', fontSize: { xs: '1.15rem', md: '1.25rem' }, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                                          {isBlueprintFilled ? `${activeFormatMeta.emoji} ${activeFormatMeta.label} · ${activeEraMeta.label} Era` : 'Editorial Blueprint Setup'}
                                        </Typography>

                                        {isBlueprintFilled && selectedSubObj?.title && (
                                          <Chip
                                            icon={<span style={{ fontSize: '0.9rem', marginLeft: '6px' }}>🎯</span>}
                                            label={<span><strong>Focus:</strong> {(selectedSubObj.title || '').replace(/\s*\(.*?\)\s*$/, '').trim()}</span>}
                                            size="small"
                                            sx={{
                                              height: 24, fontSize: '0.74rem', fontWeight: 600,
                                              bgcolor: 'rgba(255,255,255,0.22)', color: '#fff',
                                              border: '1px solid rgba(255,255,255,0.35)',
                                              '& .MuiChip-label': { px: 1 }
                                            }}
                                          />
                                        )}
                                      </Box>

                                      <Typography sx={{ color: isBlueprintFilled ? 'rgba(255,255,255,0.92)' : '#64748b', fontSize: '0.86rem', fontWeight: 500, mt: 0.5 }}>
                                        {isBlueprintFilled 
                                          ? (MATRIX_DESCRIPTIONS[`${selectedFormat}_${selectedEra}`] || activeFormatMeta.desc)
                                          : 'Tap this block to configure subcategory focus, editorial lens & timeline era'}
                                      </Typography>
                                    </Box>
                                  </Box>

                                  {/* Tap to Edit Indicator */}
                                  <Box sx={{
                                    display: 'flex', alignItems: 'center', gap: 0.75,
                                    px: 1.75, py: 0.75, borderRadius: '12px',
                                    bgcolor: isBlueprintFilled ? 'rgba(255,255,255,0.2)' : alpha(activeFormatMeta.color, 0.1),
                                    border: `1px solid ${isBlueprintFilled ? 'rgba(255,255,255,0.35)' : alpha(activeFormatMeta.color, 0.25)}`,
                                    color: isBlueprintFilled ? '#fff' : activeFormatMeta.color,
                                    backdropFilter: 'blur(8px)',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                      bgcolor: isBlueprintFilled ? 'rgba(255,255,255,0.3)' : alpha(activeFormatMeta.color, 0.18),
                                      transform: 'scale(1.02)'
                                    }
                                  }}>
                                    <EditIcon sx={{ fontSize: 16 }} />
                                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 800 }}>
                                      {isBlueprintFilled ? 'Tap to Edit' : 'Tap to Configure'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            </Box>
                          </Box>

                          {/* ═══ BACK FACE (FORM CONFIGURATOR) ═══ */}
                          <Box
                            ref={blueprintBackCardRef}
                            sx={{
                              backfaceVisibility: 'hidden',
                              transform: 'rotateX(-180deg)',
                              position: isBlueprintCardFlipped ? 'relative' : 'absolute',
                              width: '100%', top: 0,
                              borderRadius: '24px',
                              border: `1px solid ${alpha(activeFormatMeta.color, 0.4)}`,
                              background: `linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.98) 100%)`,
                              backdropFilter: 'blur(20px)',
                              boxShadow: `0 20px 50px rgba(0,0,0,0.08)`,
                              overflow: 'hidden',
                            }}
                          >
                            {/* Header */}
                            <Box sx={{
                              display: 'flex', alignItems: 'center', gap: 2,
                              px: { xs: 2.5, md: 3.5 }, py: 2.5,
                              borderBottom: '1px solid rgba(0,0,0,0.06)',
                              background: alpha(activeFormatMeta.color, 0.05),
                            }}>
                              {/* Top-Left: Back Icon Button (Step 2 Only) or Category Sparkle Badge (Step 1) */}
                              {blueprintConfigStep === 2 ? (
                                <Tooltip title="Back to Subcategories">
                                  <IconButton
                                    size="small"
                                    onClick={() => setBlueprintConfigStep(1)}
                                    sx={{
                                      width: 38, height: 38, borderRadius: '12px',
                                      bgcolor: '#fff',
                                      color: activeFormatMeta.color,
                                      border: `1px solid ${alpha(activeFormatMeta.color, 0.25)}`,
                                      boxShadow: `0 2px 8px rgba(0,0,0,0.04)`,
                                      transition: 'all 0.2s ease',
                                      '&:hover': {
                                        bgcolor: alpha(activeFormatMeta.color, 0.1),
                                        borderColor: activeFormatMeta.color,
                                        transform: 'scale(1.06)'
                                      }
                                    }}
                                  >
                                    <ArrowBackIcon sx={{ fontSize: 18, color: activeFormatMeta.color }} />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Box sx={{
                                  width: 38, height: 38, borderRadius: '12px',
                                  bgcolor: alpha(activeFormatMeta.color, 0.15),
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  border: `1px solid ${alpha(activeFormatMeta.color, 0.2)}`
                                }}>
                                  <SparkleIcon sx={{ fontSize: 20, color: activeFormatMeta.color }} />
                                </Box>
                              )}
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', lineHeight: 1.25 }}>
                                  {blueprintConfigStep === 1
                                    ? `1. Select Subcategory (${currentSelectedChallenge?.title || 'Challenge'})`
                                    : `2. Choose Editorial Lens (${selectedSubObj?.title || 'Subcategory'})`}
                                </Typography>
                                <Typography sx={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 500, mt: 0.25 }}>
                                  {blueprintConfigStep === 1
                                    ? 'Tap any subcategory card below to choose your strategic focal point.'
                                    : `Targeting: ${selectedSubObj?.title || 'Selected Subcategory'} · Pick a format across Past, Present, or Future Era.`}
                                </Typography>
                              </Box>
                              <Tooltip title="Done Configuring">
                                <IconButton
                                  size="medium"
                                  onClick={handleSaveBlueprintConfig}
                                  sx={{
                                    bgcolor: activeFormatMeta.color, color: '#fff',
                                    boxShadow: `0 4px 12px ${alpha(activeFormatMeta.color, 0.3)}`,
                                    '&:hover': { bgcolor: alpha(activeFormatMeta.color, 0.9), transform: 'scale(1.05)' },
                                  }}
                                >
                                  <CheckIcon sx={{ fontSize: 22, fontWeight: 900 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>

                            {/* Form body */}
                            <Box sx={{ p: { xs: 2.5, md: 3.5 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                              
                              {/* ═══ STEP 1: SUBCATEGORY FOCUS (HORIZONTAL IMAGE CARDS) ═══ */}
                              {blueprintConfigStep === 1 && (
                                <Box sx={{ animation: 'fadeIn 0.25s ease', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  {/* Subcategories Grid of Horizontal Cards */}
                                  <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
                                    gap: 2,
                                    height: 'auto',
                                  }}>
                                    {subcategoriesInSelectedCategory.map((sub) => {
                                      const isSelected = selectedSubcategory === sub.id || activeSubcategoryObj?.id === sub.id || isSubcategoryMatch(sub, selectedSubcategory);
                                      const rawTitle = sub.title || '';
                                      // Parse: break into main name and bracket description
                                      const bracketMatch = rawTitle.match(/^(.*?)\s*\((.+)\)\s*$/);
                                      const mainTitle = bracketMatch ? bracketMatch[1].trim() : rawTitle.trim();
                                      const bracketDesc = bracketMatch ? bracketMatch[2].trim() : '';

                                      return (
                                        <Box
                                          key={sub.id}
                                          data-selected-subcategory={isSelected ? "true" : "false"}
                                          onClick={() => {
                                            setSelectedSubcategory(sub.id);
                                            setTimeout(() => {
                                              setBlueprintConfigStep(2);
                                            }, 120);
                                          }}
                                          sx={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            height: 'auto',
                                            minHeight: { xs: 115, sm: 125 },
                                            borderRadius: '18px',
                                            border: `2px solid ${isSelected ? activeFormatMeta.color : 'rgba(0,0,0,0.06)'}`,
                                            bgcolor: isSelected ? alpha(activeFormatMeta.color, 0.06) : '#ffffff',
                                            boxShadow: isSelected ? `0 8px 24px ${alpha(activeFormatMeta.color, 0.22)}` : '0 2px 10px rgba(0,0,0,0.03)',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                            '&:hover': {
                                              transform: 'translateY(-2px)',
                                              borderColor: isSelected ? activeFormatMeta.color : alpha(activeFormatMeta.color, 0.4),
                                              boxShadow: `0 8px 20px ${alpha(activeFormatMeta.color, 0.15)}`
                                            }
                                          }}
                                        >
                                          {/* Left: Image on side (Wider) */}
                                          <Box sx={{
                                            width: { xs: 135, sm: 165, md: 180 },
                                            minWidth: { xs: 135, sm: 165, md: 180 },
                                            alignSelf: 'stretch',
                                            position: 'relative',
                                            bgcolor: 'rgba(0,0,0,0.04)',
                                            overflow: 'hidden'
                                          }}>
                                            {sub.imageUrl ? (
                                              <img
                                                src={sub.imageUrl}
                                                alt={mainTitle}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => {
                                                  (e.currentTarget as HTMLElement).style.display = 'none';
                                                }}
                                              />
                                            ) : (
                                              <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(activeFormatMeta.color, 0.08) }}>
                                                <Typography sx={{ fontSize: '1.8rem' }}>🌱</Typography>
                                              </Box>
                                            )}
                                            <Box sx={{
                                              position: 'absolute', inset: 0,
                                              background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.12) 100%)'
                                            }} />
                                          </Box>

                                          {/* Right: Text & Selection */}
                                          <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                                            <Box>
                                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 0.75 }}>
                                                {/* Sleek Selection Radio Pill */}
                                                <Box sx={{
                                                  display: 'flex', alignItems: 'center', gap: 0.5,
                                                  px: 1.25, py: 0.35, borderRadius: '12px',
                                                  bgcolor: isSelected ? activeFormatMeta.color : 'rgba(0,0,0,0.04)',
                                                  color: isSelected ? '#fff' : '#94a3b8',
                                                  transition: 'all 0.2s'
                                                }}>
                                                  <Box sx={{
                                                    width: 14, height: 14, borderRadius: '50%',
                                                    bgcolor: isSelected ? '#fff' : 'transparent',
                                                    border: isSelected ? 'none' : '2px solid #cbd5e1',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                  }}>
                                                    {isSelected && (
                                                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: activeFormatMeta.color }} />
                                                    )}
                                                  </Box>
                                                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: isSelected ? '#fff' : '#64748b' }}>
                                                    {isSelected ? 'Selected' : 'Select'}
                                                  </Typography>
                                                </Box>
                                              </Box>

                                              {/* Main Name */}
                                              <Typography sx={{
                                                fontWeight: 800, fontSize: { xs: '0.94rem', md: '1rem' }, color: isSelected ? activeFormatMeta.color : '#0f172a',
                                                lineHeight: 1.3, mb: bracketDesc ? 0.75 : 0
                                              }}>
                                                {mainTitle}
                                              </Typography>

                                              {/* Things in bracket becomes description */}
                                              {bracketDesc && (
                                                <Typography sx={{
                                                  color: '#64748b', fontSize: '0.78rem', lineHeight: 1.45,
                                                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                                }}>
                                                  {bracketDesc}
                                                </Typography>
                                              )}
                                            </Box>
                                          </Box>
                                        </Box>
                                      );
                                    })}
                                  </Box>
                                </Box>
                              )}

                               {/* ═══ STEP 2: ARTICLE TYPES LIST WITH ERA OPTIONS ═══ */}
                               {blueprintConfigStep === 2 && (
                                 <Box sx={{ animation: 'fadeIn 0.25s ease', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                   {/* Informative Guidance Banner */}
                                   <Box sx={{
                                     p: 1.5,
                                     px: 2,
                                     borderRadius: '14px',
                                     bgcolor: alpha(activeFormatMeta.color, 0.06),
                                     border: `1px dashed ${alpha(activeFormatMeta.color, 0.3)}`,
                                     display: 'flex',
                                     alignItems: 'center',
                                     justifyContent: 'space-between',
                                     flexWrap: 'wrap',
                                     gap: 1
                                   }}>
                                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                       <Typography sx={{ fontSize: '0.9rem' }}>💡</Typography>
                                       <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                                         Select an <strong>Article Type</strong> below, then choose its <strong>Time Horizon (Era)</strong> to unlock its blueprint blocks.
                                       </Typography>
                                     </Box>
                                     {selectedFormat && selectedEra && (
                                       <Chip
                                         label={`Selected: ${activeFormatMeta.label} · ${activeEraMeta.label} Era`}
                                         size="small"
                                         sx={{ bgcolor: activeFormatMeta.color, color: '#fff', fontWeight: 800, fontSize: '0.7rem', height: 22 }}
                                       />
                                     )}
                                   </Box>

                                   {/* Vertical List of the 5 Article Types with Era Selectors */}
                                   <Box sx={{
                                     display: 'flex',
                                     flexDirection: 'column',
                                     gap: 1.75,
                                     height: 'auto',
                                   }}>
                                     {formatsList.map((fmt) => {
                                       const fmtMeta = FORMAT_CONFIG[fmt];
                                       const isFormatSelected = String(selectedFormat).toLowerCase().trim() === String(fmt).toLowerCase().trim();
                                       const shortDesc = FORMAT_SHORT_DESCRIPTIONS[fmt] || fmtMeta.desc;
                                       const blueprint = getBlueprint(fmt, selectedEra);

                                       return (
                                         <Box
                                           key={fmt}
                                           data-selected-lens={isFormatSelected ? "true" : "false"}
                                           onClick={() => {
                                             setSelectedFormat(fmt);
                                           }}
                                           sx={{
                                             p: { xs: 2, sm: 2.25 },
                                             borderRadius: '20px',
                                             border: `2px solid ${isFormatSelected ? fmtMeta.color : 'rgba(0,0,0,0.06)'}`,
                                             bgcolor: isFormatSelected ? alpha(fmtMeta.color, 0.04) : '#ffffff',
                                             boxShadow: isFormatSelected ? `0 8px 24px ${alpha(fmtMeta.color, 0.16)}` : '0 2px 8px rgba(0,0,0,0.02)',
                                             display: 'flex',
                                             flexDirection: { xs: 'column', md: 'row' },
                                             alignItems: { xs: 'flex-start', md: 'center' },
                                             justifyContent: 'space-between',
                                             gap: 2,
                                             cursor: 'pointer',
                                             position: 'relative',
                                             transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                             '&:hover': {
                                               transform: 'translateY(-2px)',
                                               borderColor: isFormatSelected ? fmtMeta.color : alpha(fmtMeta.color, 0.35),
                                               boxShadow: `0 8px 20px ${alpha(fmtMeta.color, 0.12)}`
                                             }
                                           }}
                                         >
                                           {/* Left: Emoji + Format Title + 5-8 word Description + Blueprint count */}
                                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
                                             {/* Format Icon Squircle */}
                                             <Box sx={{
                                               width: 44, height: 44, borderRadius: '14px',
                                               bgcolor: alpha(fmtMeta.color, isFormatSelected ? 0.18 : 0.1),
                                               color: fmtMeta.color,
                                               display: 'flex', alignItems: 'center', justifyContent: 'center',
                                               fontSize: '1.35rem', flexShrink: 0,
                                               border: `1.5px solid ${alpha(fmtMeta.color, isFormatSelected ? 0.4 : 0.2)}`,
                                               transition: 'all 0.2s'
                                             }}>
                                               {fmtMeta.emoji}
                                             </Box>

                                             <Box sx={{ flex: 1, minWidth: 0 }}>
                                               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                 <Typography sx={{ fontWeight: 900, fontSize: '1.02rem', color: isFormatSelected ? fmtMeta.color : '#0f172a' }}>
                                                   {fmtMeta.label}
                                                 </Typography>
                                                 {/* Only show block count when this format is selected and has an active era */}
                                                 {isFormatSelected && selectedEra && (
                                                   <Chip
                                                     label={`${blueprint.length} Blocks`}
                                                     size="small"
                                                     sx={{
                                                       height: 20, fontSize: '0.66rem', fontWeight: 800,
                                                       bgcolor: alpha(fmtMeta.color, 0.15),
                                                       color: fmtMeta.color,
                                                     }}
                                                   />
                                                 )}
                                               </Box>
                                               <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, mt: 0.25 }}>
                                                 {shortDesc}
                                               </Typography>
                                             </Box>
                                           </Box>

                                           {/* Right: Era Switcher with Guidance Label */}
                                           <Box
                                             onClick={(e) => e.stopPropagation()}
                                             sx={{
                                               display: 'flex',
                                               flexDirection: 'column',
                                               gap: 0.5,
                                               width: { xs: '100%', md: 'auto' },
                                             }}
                                           >
                                             <Typography sx={{
                                               fontSize: '0.66rem',
                                               fontWeight: 800,
                                               color: isFormatSelected ? fmtMeta.color : '#94a3b8',
                                               textTransform: 'uppercase',
                                               letterSpacing: '0.04em',
                                               textAlign: { xs: 'left', md: 'right' },
                                               px: 0.5
                                             }}>
                                               {isFormatSelected ? 'Selected Horizon' : 'Choose Era'}
                                             </Typography>

                                             <Box
                                               sx={{
                                                 display: 'flex',
                                                 alignItems: 'center',
                                                 gap: 1,
                                                 bgcolor: isFormatSelected ? alpha(fmtMeta.color, 0.06) : 'rgba(0,0,0,0.03)',
                                                 p: 0.6,
                                                 borderRadius: '16px',
                                                 border: `1px solid ${isFormatSelected ? alpha(fmtMeta.color, 0.2) : 'rgba(0,0,0,0.05)'}`,
                                                 width: { xs: '100%', md: 'auto' },
                                                 justifyContent: { xs: 'space-between', md: 'flex-end' }
                                               }}
                                             >
                                               {erasList.map((era) => {
                                                 const eraMeta = ERA_CONFIG[era];
                                                 const isEraActive = isFormatSelected && String(selectedEra).toLowerCase().trim() === String(era).toLowerCase().trim();

                                                 return (
                                                   <Box
                                                     key={era}
                                                     onClick={() => {
                                                       setSelectedFormat(fmt);
                                                       setSelectedEra(era);
                                                       setSelectedTimeframe(era as any);
                                                     }}
                                                     sx={{
                                                       display: 'flex',
                                                       alignItems: 'center',
                                                       gap: 0.75,
                                                       px: { xs: 1.5, sm: 1.75 },
                                                       py: 0.65,
                                                       borderRadius: '12px',
                                                       cursor: 'pointer',
                                                       bgcolor: isEraActive ? eraMeta.color : '#ffffff',
                                                       color: isEraActive ? '#ffffff' : '#475569',
                                                       border: `1.5px solid ${isEraActive ? eraMeta.color : 'rgba(0,0,0,0.08)'}`,
                                                       boxShadow: isEraActive ? `0 4px 14px ${alpha(eraMeta.color, 0.35)}` : '0 1px 3px rgba(0,0,0,0.02)',
                                                       transition: 'all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                                       flex: { xs: 1, md: 'none' },
                                                       justifyContent: 'center',
                                                       '&:hover': {
                                                         transform: 'scale(1.03)',
                                                         borderColor: eraMeta.color,
                                                         bgcolor: isEraActive ? eraMeta.color : alpha(eraMeta.color, 0.08)
                                                       }
                                                     }}
                                                   >
                                                     <Typography sx={{ fontSize: '0.85rem' }}>{eraMeta.emoji}</Typography>
                                                     <Typography sx={{ fontSize: '0.78rem', fontWeight: 800 }}>
                                                       {eraMeta.label}
                                                     </Typography>
                                                   </Box>
                                                 );
                                               })}
                                             </Box>
                                           </Box>
                                         </Box>
                                       );
                                     })}
                                   </Box>
                                 </Box>
                               )}
                               {/* ═══ UNIFIED BOTTOM ACTION & PROGRESS CONTAINER ═══ */}
                               <Box sx={{
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'space-between',
                                 flexWrap: 'wrap',
                                 gap: 2,
                                 pt: 2,
                                 borderTop: '1px solid rgba(0,0,0,0.06)'
                               }}>
                                 {/* Left: Current selection status label */}
                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                   <Typography sx={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                                     {blueprintConfigStep === 1
                                       ? (isSubcategoryValid ? `Selected: ${activeSubcategoryObj?.title}` : 'Tap a subcategory to proceed')
                                       : `Selected Lens: ${activeFormatMeta.label} (${activeEraMeta.label})`
                                     }
                                   </Typography>
                                 </Box>

                                 {/* Center: Integrated Compact Progress Stepper */}
                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                   <Box
                                     onClick={() => setBlueprintConfigStep(1)}
                                     sx={{
                                       display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.5, borderRadius: '20px',
                                       cursor: 'pointer',
                                       bgcolor: blueprintConfigStep === 1 ? alpha(activeFormatMeta.color, 0.12) : 'rgba(0,0,0,0.04)',
                                       border: `1px solid ${blueprintConfigStep === 1 ? activeFormatMeta.color : 'transparent'}`,
                                       transition: 'all 0.2s'
                                     }}
                                   >
                                     <Box sx={{
                                       width: 18, height: 18, borderRadius: '50%',
                                       bgcolor: isSubcategoryValid ? activeFormatMeta.color : (blueprintConfigStep === 1 ? alpha(activeFormatMeta.color, 0.3) : 'rgba(0,0,0,0.15)'),
                                       color: isSubcategoryValid ? '#fff' : (blueprintConfigStep === 1 ? activeFormatMeta.color : '#64748b'),
                                       display: 'flex', alignItems: 'center', justifyContent: 'center',
                                       fontSize: '0.68rem', fontWeight: 900
                                     }}>
                                       {isSubcategoryValid ? '✓' : '1'}
                                     </Box>
                                     <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, color: blueprintConfigStep === 1 ? activeFormatMeta.color : '#64748b' }}>
                                       Subcategory
                                     </Typography>
                                   </Box>

                                   <Box sx={{ width: 14, height: 2, bgcolor: isBlueprintFilled ? activeFormatMeta.color : 'rgba(0,0,0,0.1)' }} />

                                   <Box
                                     onClick={() => { if (isSubcategoryValid) setBlueprintConfigStep(2); }}
                                     sx={{
                                       display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.5, borderRadius: '20px',
                                       cursor: isSubcategoryValid ? 'pointer' : 'default',
                                       bgcolor: blueprintConfigStep === 2 ? alpha(activeFormatMeta.color, 0.12) : 'rgba(0,0,0,0.04)',
                                       border: `1px solid ${blueprintConfigStep === 2 ? activeFormatMeta.color : 'transparent'}`,
                                       transition: 'all 0.2s',
                                       opacity: isSubcategoryValid ? 1 : 0.6
                                     }}
                                   >
                                     <Box sx={{
                                       width: 18, height: 18, borderRadius: '50%',
                                       bgcolor: isBlueprintFilled ? activeFormatMeta.color : (blueprintConfigStep === 2 ? alpha(activeFormatMeta.color, 0.3) : 'rgba(0,0,0,0.15)'),
                                       color: isBlueprintFilled ? '#fff' : (blueprintConfigStep === 2 ? activeFormatMeta.color : '#64748b'),
                                       display: 'flex', alignItems: 'center', justifyContent: 'center',
                                       fontSize: '0.68rem', fontWeight: 900
                                     }}>
                                       {isBlueprintFilled ? '✓' : '2'}
                                     </Box>
                                     <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, color: blueprintConfigStep === 2 ? activeFormatMeta.color : '#64748b' }}>
                                       15 Lenses
                                     </Typography>
                                   </Box>
                                 </Box>

                                 {/* Right: Next / Save Action Button */}
                                 <Box>
                                   {blueprintConfigStep === 1 ? (
                                     <Button
                                       variant="contained"
                                       disabled={!selectedSubcategory}
                                       onClick={() => setBlueprintConfigStep(2)}
                                       endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
                                       sx={{
                                         bgcolor: activeFormatMeta.color, color: '#fff', fontWeight: 800, px: 3.5, py: 0.85, borderRadius: '12px',
                                         boxShadow: `0 4px 14px ${alpha(activeFormatMeta.color, 0.3)}`,
                                         '&:hover': { bgcolor: alpha(activeFormatMeta.color, 0.9) }
                                       }}
                                     >
                                       Next
                                     </Button>
                                   ) : (
                                     <Button
                                       variant="contained"
                                       onClick={handleSaveBlueprintConfig}
                                       startIcon={<CheckIcon sx={{ fontSize: 18 }} />}
                                       sx={{
                                         bgcolor: activeFormatMeta.color, color: '#fff', fontWeight: 800, px: 4, py: 0.85, borderRadius: '12px',
                                         boxShadow: `0 4px 14px ${alpha(activeFormatMeta.color, 0.3)}`,
                                         '&:hover': { bgcolor: alpha(activeFormatMeta.color, 0.9) }
                                       }}
                                     >
                                       Save
                                     </Button>
                                   )}
                                 </Box>
                               </Box>

                             </Box>
                           </Box>
                         </Box>
                       </Box>

                      {/* Header of Framework Blueprint */}
                      <Box sx={{ textAlign: 'center', mb: 4, pt: 1 }}>
                        <Typography sx={{ fontWeight: 900, fontSize: '1.6rem', color: '#0f172a', mb: 0.5 }}>
                          {activeFormatMeta.emoji} {activeFormatMeta.label} · {activeEraMeta.label}
                        </Typography>
                        <Typography sx={{ color: '#64748b', fontSize: '0.95rem', maxWidth: 600, mx: 'auto', fontWeight: 500 }}>
                          Recommended {currentBlueprint.length} blocks to structure this type of article.
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
                              <PremiumCard
                                variant="glass"
                                baseColor={bDef.color}
                                sx={{
                                  flex: 1, p: 2.5, borderRadius: '18px',
                                  transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                  '&:hover': { transform: 'translateX(6px)', borderColor: alpha(bDef.color, 0.4), boxShadow: `0 8px 24px ${alpha(bDef.color, 0.12)}` },
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{sop.role}</Typography>
                                    <Chip label={bDef.label} size="small" sx={{ height: 20, fontSize: '0.68rem', bgcolor: alpha(bDef.color, 0.15), color: bDef.color, fontWeight: 800 }} />
                                  </Box>
                                  {/* Block Scratchpad Trigger */}
                                {(() => {
                                  const blockNotesList = getNotesForBlock(sop.role || sop.type, draftId || 'new');
                                  const count = blockNotesList.length;
                                  return (
                                    <Tooltip title="Open Block Scratchpad & Purpose Directive">
                                      <Chip
                                        icon={<span style={{ fontSize: '0.82rem' }}>📝</span>}
                                        label={count > 0 ? `Notes (${count})` : "Scratchpad"}
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveScratchpadBlock({
                                            block: {
                                              id: `blueprint_${idx}`,
                                              type: sop.type as BlockType,
                                              role: sop.role,
                                              sopDesc: sop.desc,
                                              sopHint: sop.hint,
                                              content: {}
                                            },
                                            index: idx
                                          });
                                        }}
                                        sx={{
                                          height: 26,
                                          fontSize: '0.72rem',
                                          fontWeight: 800,
                                          bgcolor: count > 0 ? alpha('#16a34a', 0.14) : 'rgba(0,0,0,0.04)',
                                          color: count > 0 ? '#16a34a' : '#475569',
                                          border: `1.5px solid ${count > 0 ? alpha('#16a34a', 0.35) : 'rgba(0,0,0,0.08)'}`,
                                          cursor: 'pointer',
                                          transition: 'all 0.18s',
                                          '&:hover': {
                                            bgcolor: count > 0 ? alpha('#16a34a', 0.22) : 'rgba(0,0,0,0.08)',
                                            transform: 'translateY(-1px)',
                                            borderColor: '#16a34a'
                                          }
                                        }}
                                      />
                                    </Tooltip>
                                  );
                                })()}
                                </Box>
                                <Typography sx={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.4 }}>{sop.desc}</Typography>
                              </PremiumCard>
                            </Box>
                          );
                        })}
                      </Box>

                      {/* ═══ START / IGNORE CALL TO ACTION CARD ═══ */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 3, md: 3.75 },
                          borderRadius: '28px',
                          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(30, 41, 59, 0.94) 100%)',
                          backdropFilter: 'blur(24px)',
                          border: `1.5px solid rgba(255, 255, 255, 0.12)`,
                          boxShadow: `0 24px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
                          display: 'flex',
                          flexDirection: { xs: 'column', md: 'row' },
                          alignItems: { xs: 'center', md: 'center' },
                          justifyContent: 'space-between',
                          gap: { xs: 2.5, md: 4 },
                          position: 'relative',
                          overflow: 'hidden',
                          mt: 4,
                          maxWidth: 800,
                          mx: 'auto'
                        }}
                      >
                        {/* Subtle Ambient Radial Glow */}
                        <Box sx={{
                          position: 'absolute',
                          top: -40,
                          right: -40,
                          width: 200,
                          height: 200,
                          borderRadius: '50%',
                          background: `radial-gradient(circle, ${alpha(activeFormatMeta.color, 0.25)} 0%, transparent 70%)`,
                          pointerEvents: 'none',
                          filter: 'blur(20px)'
                        }} />

                        {/* Left Content */}
                        <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' }, position: 'relative', zIndex: 1 }}>
                          <Typography sx={{ color: '#ffffff', fontWeight: 900, fontSize: { xs: '1.25rem', md: '1.4rem' }, letterSpacing: '-0.025em', mb: 0.75, lineHeight: 1.2 }}>
                            Ready to draft this article?
                          </Typography>
                          <Typography sx={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.9rem', lineHeight: 1.55, maxWidth: 500, fontWeight: 450 }}>
                            Spend 1 minute to auto-draft all {currentBlueprint.length} blocks with AgroLLM, or choose Ignore to write yourself.
                          </Typography>
                        </Box>

                        {/* Right Buttons: Start & Ignore */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                          <Button
                            variant="contained"
                            onClick={() => setIsPromptSidePaneOpen(true)}
                            startIcon={<AutoAwesomeIcon sx={{ fontSize: 18 }} />}
                            sx={{
                              bgcolor: activeFormatMeta.color,
                              color: '#fff',
                              fontWeight: 900,
                              px: 3.75,
                              py: 1.35,
                              borderRadius: '16px',
                              fontSize: '0.95rem',
                              textTransform: 'none',
                              letterSpacing: '0.01em',
                              boxShadow: `0 8px 24px ${alpha(activeFormatMeta.color, 0.5)}`,
                              transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                              '&:hover': {
                                bgcolor: alpha(activeFormatMeta.color, 0.9),
                                transform: 'translateY(-2px)',
                                boxShadow: `0 12px 30px ${alpha(activeFormatMeta.color, 0.65)}`
                              }
                            }}
                          >
                            Start
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              applyFramework(selectedFormat, selectedEra);
                              setArticleEditorMode('canvas');
                            }}
                            sx={{
                              borderColor: 'rgba(255, 255, 255, 0.2)',
                              color: 'rgba(255, 255, 255, 0.9)',
                              fontWeight: 800,
                              px: 3.25,
                              py: 1.35,
                              borderRadius: '16px',
                              fontSize: '0.95rem',
                              textTransform: 'none',
                              bgcolor: 'rgba(255, 255, 255, 0.04)',
                              backdropFilter: 'blur(10px)',
                              transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                              '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.45)',
                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                                color: '#fff',
                                transform: 'translateY(-2px)'
                              }
                            }}
                          >
                            Ignore
                          </Button>
                        </Box>
                      </Paper>
                    </Box>
                  );
                })()}


                {/* ═══ ACTIVE BLOCK CANVAS ═══ */}
                {articleEditorMode === 'canvas' && (
                  <Box sx={{ animation: 'fadeIn 0.25s ease' }}>
                    {/* ═══ CANVAS BLUEPRINT & TEMPORAL LENS SWITCHER ═══ */}
                    {(() => {
                      const fMeta = FORMAT_CONFIG[selectedFormat] || FORMAT_CONFIG.brief;
                      const eMeta = ERA_CONFIG[selectedEra] || ERA_CONFIG.present;
                      const activeSubObj = subcategoriesInSelectedCategory.find(s => s.id === selectedSubcategory || isSubcategoryMatch(s, selectedSubcategory));

                      return (
                        <Paper
                          elevation={0}
                          sx={{
                            mb: 3.5,
                            p: { xs: 1.5, sm: 2 },
                            borderRadius: '20px',
                            background: 'rgba(255, 255, 255, 0.92)',
                            backdropFilter: 'blur(20px)',
                            border: `1.5px solid ${alpha(fMeta.color, 0.25)}`,
                            boxShadow: `0 8px 28px ${alpha(fMeta.color, 0.08)}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 1.5
                          }}
                        >
                          {/* Left: Interactive Lens Trigger Pills */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                            <Typography sx={{ fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                              Active Blueprint:
                            </Typography>

                            {/* Format Trigger Pill */}
                            <Button
                              onClick={(e) => setCanvasAnchorFormat(e.currentTarget)}
                              endIcon={<ArrowDownIcon sx={{ fontSize: 16, transition: 'transform 0.2s', transform: canvasAnchorFormat ? 'rotate(180deg)' : 'none' }} />}
                              sx={{
                                bgcolor: alpha(fMeta.color, 0.1),
                                color: fMeta.color,
                                fontWeight: 900,
                                fontSize: '0.86rem',
                                px: 2,
                                py: 0.65,
                                borderRadius: '14px',
                                border: `1.5px solid ${alpha(fMeta.color, 0.35)}`,
                                textTransform: 'none',
                                boxShadow: `0 2px 10px ${alpha(fMeta.color, 0.12)}`,
                                '&:hover': {
                                  bgcolor: alpha(fMeta.color, 0.18),
                                  borderColor: fMeta.color,
                                  transform: 'translateY(-1px)'
                                },
                                transition: 'all 0.18s'
                              }}
                            >
                              <span style={{ marginRight: 7, fontSize: '0.95rem' }}>{fMeta.emoji}</span>
                              {fMeta.label}
                            </Button>

                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>
                              in
                            </Typography>

                            {/* Era Trigger Pill */}
                            <Button
                              onClick={(e) => setCanvasAnchorEra(e.currentTarget)}
                              endIcon={<ArrowDownIcon sx={{ fontSize: 16, transition: 'transform 0.2s', transform: canvasAnchorEra ? 'rotate(180deg)' : 'none' }} />}
                              sx={{
                                bgcolor: alpha(eMeta.color, 0.1),
                                color: eMeta.color,
                                fontWeight: 900,
                                fontSize: '0.86rem',
                                px: 2,
                                py: 0.65,
                                borderRadius: '14px',
                                border: `1.5px solid ${alpha(eMeta.color, 0.35)}`,
                                textTransform: 'none',
                                boxShadow: `0 2px 10px ${alpha(eMeta.color, 0.12)}`,
                                '&:hover': {
                                  bgcolor: alpha(eMeta.color, 0.18),
                                  borderColor: eMeta.color,
                                  transform: 'translateY(-1px)'
                                },
                                transition: 'all 0.18s'
                              }}
                            >
                              <span style={{ marginRight: 7, fontSize: '0.95rem' }}>{eMeta.emoji}</span>
                              {eMeta.label} Horizon
                            </Button>
                          </Box>

                          {/* Right: Block Count & Blueprint Switcher */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Chip
                              label={`${blocks.length} SOP Blocks`}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                fontSize: '0.74rem',
                                bgcolor: alpha(fMeta.color, 0.12),
                                color: fMeta.color,
                                borderRadius: '10px',
                                height: 26,
                                border: `1px solid ${alpha(fMeta.color, 0.25)}`
                              }}
                            />

                            <Tooltip title="View Framework Blueprint Preview">
                              <Button
                                size="small"
                                onClick={() => setArticleEditorMode('framework')}
                                startIcon={<SparkleIcon sx={{ fontSize: 15 }} />}
                                sx={{
                                  borderRadius: '12px',
                                  fontSize: '0.76rem',
                                  fontWeight: 800,
                                  px: 1.5,
                                  py: 0.65,
                                  bgcolor: 'rgba(0,0,0,0.04)',
                                  color: '#475569',
                                  border: '1px solid rgba(0,0,0,0.08)',
                                  textTransform: 'none',
                                  '&:hover': { bgcolor: 'rgba(0,0,0,0.08)', color: '#0f172a' }
                                }}
                              >
                                Blueprint
                              </Button>
                            </Tooltip>
                          </Box>

                          {/* ═══ FORMAT POPOVER (GLASSY, NO BACKDROP DIMMING) ═══ */}
                          <Popover
                            open={Boolean(canvasAnchorFormat)}
                            anchorEl={canvasAnchorFormat}
                            onClose={() => setCanvasAnchorFormat(null)}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                            slotProps={{
                              backdrop: {
                                sx: {
                                  bgcolor: 'transparent',
                                  backdropFilter: 'none'
                                }
                              },
                              paper: {
                                elevation: 0,
                                sx: {
                                  mt: 1.25,
                                  p: 1.25,
                                  borderRadius: '22px',
                                  width: { xs: 290, sm: 340 },
                                  background: 'rgba(255, 255, 255, 0.96)',
                                  backdropFilter: 'blur(28px)',
                                  border: '1.5px solid rgba(0,0,0,0.08)',
                                  boxShadow: '0 20px 48px -8px rgba(0,0,0,0.16), 0 8px 24px -4px rgba(0,0,0,0.08)',
                                  animation: 'fadeIn 0.15s ease'
                                }
                              }
                            }}
                          >
                            <Box sx={{ px: 1.5, pt: 1, pb: 1, borderBottom: '1px solid rgba(0,0,0,0.05)', mb: 0.75 }}>
                              <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>
                                Switch Article Format
                              </Typography>
                              <Typography sx={{ fontSize: '0.74rem', color: '#64748b', mt: 0.25 }}>
                                Reconfigures the 12 SOP blocks sequence
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {(['brief', 'memo', 'playbook', 'comparison', 'culture'] as ArticleFormat[]).map(fmt => {
                                const meta = FORMAT_CONFIG[fmt];
                                const isSelected = selectedFormat === fmt;
                                const shortDesc = FORMAT_SHORT_DESCRIPTIONS[fmt] || meta.desc;
                                return (
                                  <Box
                                    key={fmt}
                                    onClick={() => {
                                      handleSwitchCanvasBlueprint(fmt, selectedEra);
                                      setCanvasAnchorFormat(null);
                                    }}
                                    sx={{
                                      p: 1.2,
                                      borderRadius: '16px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: 1.5,
                                      bgcolor: isSelected ? alpha(meta.color, 0.08) : 'transparent',
                                      border: `1.5px solid ${isSelected ? alpha(meta.color, 0.35) : 'transparent'}`,
                                      transition: 'all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                      '&:hover': {
                                        bgcolor: alpha(meta.color, 0.12),
                                        transform: 'translateX(3px)'
                                      }
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                                      <Box sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: '12px',
                                        bgcolor: isSelected ? meta.color : alpha(meta.color, 0.12),
                                        color: isSelected ? '#fff' : meta.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.1rem',
                                        flexShrink: 0,
                                        boxShadow: isSelected ? `0 4px 12px ${alpha(meta.color, 0.35)}` : 'none'
                                      }}>
                                        {meta.emoji}
                                      </Box>
                                      <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{
                                          fontWeight: 800,
                                          fontSize: '0.88rem',
                                          color: isSelected ? meta.color : '#0f172a',
                                          lineHeight: 1.2
                                        }}>
                                          {meta.label}
                                        </Typography>
                                        <Typography sx={{
                                          fontSize: '0.72rem',
                                          color: '#64748b',
                                          mt: 0.25,
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}>
                                          {shortDesc}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    {isSelected && (
                                      <Box sx={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: '50%',
                                        bgcolor: meta.color,
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                      }}>
                                        <CheckIcon sx={{ fontSize: 14 }} />
                                      </Box>
                                    )}
                                  </Box>
                                );
                              })}
                            </Box>
                          </Popover>

                          {/* ═══ ERA POPOVER (GLASSY, NO BACKDROP DIMMING) ═══ */}
                          <Popover
                            open={Boolean(canvasAnchorEra)}
                            anchorEl={canvasAnchorEra}
                            onClose={() => setCanvasAnchorEra(null)}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                            slotProps={{
                              backdrop: {
                                sx: {
                                  bgcolor: 'transparent',
                                  backdropFilter: 'none'
                                }
                              },
                              paper: {
                                elevation: 0,
                                sx: {
                                  mt: 1.25,
                                  p: 1.25,
                                  borderRadius: '22px',
                                  width: { xs: 290, sm: 340 },
                                  background: 'rgba(255, 255, 255, 0.96)',
                                  backdropFilter: 'blur(28px)',
                                  border: '1.5px solid rgba(0,0,0,0.08)',
                                  boxShadow: '0 20px 48px -8px rgba(0,0,0,0.16), 0 8px 24px -4px rgba(0,0,0,0.08)',
                                  animation: 'fadeIn 0.15s ease'
                                }
                              }
                            }}
                          >
                            <Box sx={{ px: 1.5, pt: 1, pb: 1, borderBottom: '1px solid rgba(0,0,0,0.05)', mb: 0.75 }}>
                              <Typography sx={{ fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>
                                Select Temporal Horizon
                              </Typography>
                              <Typography sx={{ fontSize: '0.74rem', color: '#64748b', mt: 0.25 }}>
                                Shifts narrative timeframe & analytical depth
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {(['past', 'present', 'future'] as ArticleEra[]).map(era => {
                                const meta = ERA_CONFIG[era];
                                const isSelected = selectedEra === era;
                                const eraDesc = era === 'past' ? 'Historical context, antecedents & root causes'
                                  : era === 'present' ? 'Live realities, market dynamics & operational bottlenecks'
                                  : 'Strategic foresight, emerging trends & next-gen playbook';
                                return (
                                  <Box
                                    key={era}
                                    onClick={() => {
                                      handleSwitchCanvasBlueprint(selectedFormat, era);
                                      setCanvasAnchorEra(null);
                                    }}
                                    sx={{
                                      p: 1.2,
                                      borderRadius: '16px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: 1.5,
                                      bgcolor: isSelected ? alpha(meta.color, 0.08) : 'transparent',
                                      border: `1.5px solid ${isSelected ? alpha(meta.color, 0.35) : 'transparent'}`,
                                      transition: 'all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                      '&:hover': {
                                        bgcolor: alpha(meta.color, 0.12),
                                        transform: 'translateX(3px)'
                                      }
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                                      <Box sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: '12px',
                                        bgcolor: isSelected ? meta.color : alpha(meta.color, 0.12),
                                        color: isSelected ? '#fff' : meta.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.1rem',
                                        flexShrink: 0,
                                        boxShadow: isSelected ? `0 4px 12px ${alpha(meta.color, 0.35)}` : 'none'
                                      }}>
                                        {meta.emoji}
                                      </Box>
                                      <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{
                                          fontWeight: 800,
                                          fontSize: '0.88rem',
                                          color: isSelected ? meta.color : '#0f172a',
                                          lineHeight: 1.2
                                        }}>
                                          {meta.label} Horizon
                                        </Typography>
                                        <Typography sx={{
                                          fontSize: '0.72rem',
                                          color: '#64748b',
                                          mt: 0.25,
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}>
                                          {eraDesc}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    {isSelected && (
                                      <Box sx={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: '50%',
                                        bgcolor: meta.color,
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                      }}>
                                        <CheckIcon sx={{ fontSize: 14 }} />
                                      </Box>
                                    )}
                                  </Box>
                                );
                              })}
                            </Box>
                          </Popover>
                        </Paper>
                      );
                    })()}




                    {/* Canvas header + Reorder toggle */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
                      <Box>
                        <Typography sx={{ fontWeight: 900, fontSize: '1.6rem', color: '#0f172a', letterSpacing: '-0.02em' }}>Block Canvas</Typography>
                        <Typography sx={{ color: '#475569', fontSize: '0.95rem', mt: 0.5, fontWeight: 500 }}>
                          Tap a card to flip it and edit. <strong style={{ color: '#0f172a' }}>{blocks.filter(b => isBlockFilled(b)).length}</strong> of <strong style={{ color: '#0f172a' }}>{blocks.length}</strong> blocks filled.
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        {/* Scratchpad Trigger */}
                        <Button
                          startIcon={<span style={{ fontSize: '1.05rem' }}>📝</span>}
                          onClick={() => setIsScratchpadOpen(true)}
                          size="medium"
                          sx={{
                            color: '#059669',
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            textTransform: 'none',
                            borderRadius: '14px',
                            px: 2.2,
                            py: 0.9,
                            border: `1.5px solid ${alpha('#059669', 0.35)}`,
                            bgcolor: alpha('#059669', 0.08),
                            backdropFilter: 'blur(8px)',
                            boxShadow: `0 2px 10px ${alpha('#059669', 0.1)}`,
                            '&:hover': { bgcolor: alpha('#059669', 0.16), borderColor: '#059669', transform: 'translateY(-1px)' },
                            transition: 'all 0.2s',
                          }}
                        >
                          Scratchpad
                        </Button>

                        {/* Prompts Trigger */}
                        <Tooltip title="Open Editorial Prompt Terminal & Block Re-prompter">
                          <Button
                            startIcon={<SparkleIcon sx={{ fontSize: 16 }} />}
                            onClick={() => setIsPromptSidePaneOpen(true)}
                            size="medium"
                            sx={{
                              color: '#475569',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              textTransform: 'none',
                              borderRadius: '14px',
                              px: 2,
                              py: 0.9,
                              border: '1.5px solid rgba(0,0,0,0.08)',
                              bgcolor: 'rgba(255,255,255,0.6)',
                              backdropFilter: 'blur(8px)',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)', color: '#0f172a', borderColor: 'rgba(0,0,0,0.18)' },
                              transition: 'all 0.2s',
                            }}
                          >
                            Prompts
                          </Button>
                        </Tooltip>

                        {/* Reset Builder */}
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

                        {/* Reorder Button */}
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
                                    <Tooltip title="Open Block Scratchpad">
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveScratchpadBlock({ block: b, index: i });
                                        }}
                                        sx={{
                                          bgcolor: filled ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.04)',
                                          color: filled ? '#fff' : '#475569',
                                          border: filled ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(0,0,0,0.08)',
                                          '&:hover': { bgcolor: alpha('#16a34a', 0.15), color: '#16a34a' }
                                        }}
                                      >
                                        <span style={{ fontSize: '0.85rem' }}>📝</span>
                                      </IconButton>
                                    </Tooltip>
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
                                {/* Block Scratchpad Trigger */}
                                {(() => {
                                  const blockNotesList = getNotesForBlock(b.role || b.type, draftId || 'new');
                                  const count = blockNotesList.length;
                                  return (
                                    <Tooltip title="Open Block Scratchpad & Purpose Directive">
                                      <Chip
                                        icon={<span style={{ fontSize: '0.82rem' }}>📝</span>}
                                        label={count > 0 ? `Notes (${count})` : "Scratchpad"}
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveScratchpadBlock({ block: b, index: i });
                                        }}
                                        sx={{
                                          height: 26,
                                          fontSize: '0.72rem',
                                          fontWeight: 800,
                                          bgcolor: count > 0 ? alpha('#16a34a', 0.14) : 'rgba(0,0,0,0.04)',
                                          color: count > 0 ? '#16a34a' : '#475569',
                                          border: `1.5px solid ${count > 0 ? alpha('#16a34a', 0.35) : 'rgba(0,0,0,0.08)'}`,
                                          cursor: 'pointer',
                                          transition: 'all 0.18s',
                                          '&:hover': {
                                            bgcolor: count > 0 ? alpha('#16a34a', 0.22) : 'rgba(0,0,0,0.08)',
                                            transform: 'translateY(-1px)',
                                            borderColor: '#16a34a'
                                          }
                                        }}
                                      />
                                    </Tooltip>
                                  );
                                })()}
                                <Tooltip title="Re-draft or refine this block with AgroLLM">
                                  <Chip
                                    icon={<AutoAwesomeIcon sx={{ fontSize: 13, color: `${color} !important` }} />}
                                    label="AI Refine"
                                    size="small"
                                    onClick={() => setIsPromptSidePaneOpen(true)}
                                    sx={{
                                      bgcolor: alpha(color, 0.1),
                                      color: color,
                                      fontWeight: 800,
                                      fontSize: '0.72rem',
                                      border: `1px solid ${alpha(color, 0.25)}`,
                                      cursor: 'pointer',
                                      height: 26,
                                      '&:hover': { bgcolor: alpha(color, 0.2), transform: 'translateY(-1px)' }
                                    }}
                                  />
                                </Tooltip>
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
                                {b.type === 'comparison_matrix' && (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                      <PremiumTextField
                                        colorTheme={color}
                                        fullWidth label="Option A Name (e.g. Solar Milling)"
                                        placeholder="Solar Milling (Decentralized)"
                                        value={b.content.optionAName || ''}
                                        onChange={e => updateBlock(b.id, 'optionAName', e.target.value)}
                                      />
                                      <PremiumTextField
                                        colorTheme={color}
                                        fullWidth label="Option B Name (e.g. Diesel Milling)"
                                        placeholder="Diesel Generator Milling"
                                        value={b.content.optionBName || ''}
                                        onChange={e => updateBlock(b.id, 'optionBName', e.target.value)}
                                      />
                                    </Box>

                                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                      Comparison Criteria Breakdown
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                      {(b.content.rows || []).map((row: any, rIdx: number) => (
                                        <Box key={rIdx} sx={{ p: 2, borderRadius: '14px', bgcolor: alpha(color, 0.03), border: `1px solid ${alpha(color, 0.15)}`, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                            <PremiumTextField
                                              colorTheme={color}
                                              size="small"
                                              label={`Criterion ${rIdx + 1} (e.g. CAPEX)`}
                                              value={row.criterion || ''}
                                              onChange={e => {
                                                const nextRows = [...(b.content.rows || [])];
                                                nextRows[rIdx].criterion = e.target.value;
                                                updateBlock(b.id, 'rows', nextRows);
                                              }}
                                              sx={{ flex: 2 }}
                                            />
                                            <PremiumAutocomplete
                                              label="Advantage"
                                              size="small"
                                              value={row.winner || 'Tie'}
                                              options={[{ label: `Option A (${b.content.optionAName || 'A'})`, value: 'A' }, { label: `Option B (${b.content.optionBName || 'B'})`, value: 'B' }, { label: 'Equal / Tie', value: 'Tie' }]}
                                              onChange={(e, val: any) => {
                                                const nextRows = [...(b.content.rows || [])];
                                                nextRows[rIdx].winner = val?.value || val;
                                                updateBlock(b.id, 'rows', nextRows);
                                              }}
                                              colorTheme={color}
                                              sx={{ flex: 1.2 }}
                                            />
                                            {rIdx > 0 && (
                                              <IconButton size="small" color="error" onClick={() => {
                                                const nextRows = (b.content.rows || []).filter((_: any, i: number) => i !== rIdx);
                                                updateBlock(b.id, 'rows', nextRows);
                                              }}>
                                                <DeleteIcon fontSize="small" />
                                              </IconButton>
                                            )}
                                          </Box>
                                          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                                            <PremiumTextField
                                              colorTheme={color}
                                              size="small"
                                              label={`Option A (${b.content.optionAName || 'A'})`}
                                              placeholder="$12,000 upfront"
                                              value={row.optionAValue || ''}
                                              onChange={e => {
                                                const nextRows = [...(b.content.rows || [])];
                                                nextRows[rIdx].optionAValue = e.target.value;
                                                updateBlock(b.id, 'rows', nextRows);
                                              }}
                                            />
                                            <PremiumTextField
                                              colorTheme={color}
                                              size="small"
                                              label={`Option B (${b.content.optionBName || 'B'})`}
                                              placeholder="$4,500 + $800/mo diesel"
                                              value={row.optionBValue || ''}
                                              onChange={e => {
                                                const nextRows = [...(b.content.rows || [])];
                                                nextRows[rIdx].optionBValue = e.target.value;
                                                updateBlock(b.id, 'rows', nextRows);
                                              }}
                                            />
                                          </Box>
                                        </Box>
                                      ))}

                                      <Button
                                        onClick={() => {
                                          const nextRows = [...(b.content.rows || []), { criterion: '', optionAValue: '', optionBValue: '', winner: 'A' }];
                                          updateBlock(b.id, 'rows', nextRows);
                                        }}
                                        sx={{
                                          alignSelf: 'flex-start', borderRadius: '12px', textTransform: 'none', fontWeight: 700,
                                          px: 2.5, py: 1, bgcolor: alpha(color, 0.08), color, border: `1px dashed ${alpha(color, 0.3)}`,
                                          '&:hover': { bgcolor: alpha(color, 0.15) }
                                        }}
                                      >
                                        + Add Comparison Row
                                      </Button>
                                    </Box>

                                    <PremiumTextField
                                      colorTheme={color}
                                      fullWidth
                                      label="Winner Verdict / Strategic Takeaway"
                                      placeholder="Solar milling reaches breakeven in month 14 and insulates operators from fuel shocks."
                                      value={b.content.winnerVerdict || ''}
                                      onChange={e => updateBlock(b.id, 'winnerVerdict', e.target.value)}
                                    />
                                  </Box>
                                )}
                                {b.type === 'unit_economics_card' && (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                                      <PremiumTextField
                                        colorTheme={color}
                                        label="TAM (Addressable Market)"
                                        placeholder="$450M West Africa"
                                        value={b.content.tam || ''}
                                        onChange={e => updateBlock(b.id, 'tam', e.target.value)}
                                      />
                                      <PremiumTextField
                                        colorTheme={color}
                                        label="Target IRR"
                                        placeholder="32.5%"
                                        value={b.content.targetIrr || ''}
                                        onChange={e => updateBlock(b.id, 'targetIrr', e.target.value)}
                                      />
                                      <PremiumTextField
                                        colorTheme={color}
                                        label="Ticket / Deal Size"
                                        placeholder="$500k - $2M"
                                        value={b.content.ticketSize || ''}
                                        onChange={e => updateBlock(b.id, 'ticketSize', e.target.value)}
                                      />
                                      <PremiumTextField
                                        colorTheme={color}
                                        label="Gross Margin"
                                        placeholder="44%"
                                        value={b.content.grossMargin || ''}
                                        onChange={e => updateBlock(b.id, 'grossMargin', e.target.value)}
                                      />
                                      <PremiumTextField
                                        colorTheme={color}
                                        label="Payback Period"
                                        placeholder="18 - 24 Months"
                                        value={b.content.paybackPeriod || ''}
                                        onChange={e => updateBlock(b.id, 'paybackPeriod', e.target.value)}
                                      />
                                      <PremiumTextField
                                        colorTheme={color}
                                        label="Primary Downside Risk"
                                        placeholder="FX devaluation & off-taker default"
                                        value={b.content.primaryRisk || ''}
                                        onChange={e => updateBlock(b.id, 'primaryRisk', e.target.value)}
                                      />
                                    </Box>

                                    <PremiumMarkdownEditor
                                      colorTheme={color}
                                      fullWidth multiline rows={3}
                                      label="Investment Thesis & Margin Engine"
                                      placeholder="Why this unit economic structure creates defensible alpha in the current market..."
                                      value={b.content.dealThesis || ''}
                                      onChange={(e: any) => updateBlock(b.id, 'dealThesis', e.target.value)}
                                    />
                                  </Box>
                                )}
                                {b.type === 'protocol_steps' && (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                    {(b.content.steps || []).map((step: any, sIdx: number) => (
                                      <Box key={sIdx} sx={{ p: 2.5, borderRadius: '16px', bgcolor: alpha(color, 0.03), border: `1px solid ${alpha(color, 0.15)}`, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                          <Typography sx={{ fontWeight: 900, color: color, fontSize: '0.95rem' }}>
                                            Step {sIdx + 1}
                                          </Typography>
                                          {sIdx > 0 && (
                                            <IconButton size="small" color="error" onClick={() => {
                                              const nextSteps = (b.content.steps || []).filter((_: any, i: number) => i !== sIdx);
                                              updateBlock(b.id, 'steps', nextSteps);
                                            }}>
                                              <DeleteIcon fontSize="small" />
                                            </IconButton>
                                          )}
                                        </Box>

                                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr' }, gap: 1.5 }}>
                                          <PremiumTextField
                                            colorTheme={color}
                                            size="small"
                                            label="Step Action Title"
                                            placeholder="Isolate Cold Storage Compressor"
                                            value={step.title || ''}
                                            onChange={e => {
                                              const nextSteps = [...(b.content.steps || [])];
                                              nextSteps[sIdx].title = e.target.value;
                                              updateBlock(b.id, 'steps', nextSteps);
                                            }}
                                          />
                                          <PremiumTextField
                                            colorTheme={color}
                                            size="small"
                                            label="Assigned Role"
                                            placeholder="Field Engineer"
                                            value={step.role || ''}
                                            onChange={e => {
                                              const nextSteps = [...(b.content.steps || [])];
                                              nextSteps[sIdx].role = e.target.value;
                                              updateBlock(b.id, 'steps', nextSteps);
                                            }}
                                          />
                                          <PremiumTextField
                                            colorTheme={color}
                                            size="small"
                                            label="Time Window"
                                            placeholder="Day 1 (08:00)"
                                            value={step.timeWindow || ''}
                                            onChange={e => {
                                              const nextSteps = [...(b.content.steps || [])];
                                              nextSteps[sIdx].timeWindow = e.target.value;
                                              updateBlock(b.id, 'steps', nextSteps);
                                            }}
                                          />
                                        </Box>

                                        <PremiumMarkdownEditor
                                          colorTheme={color}
                                          fullWidth multiline rows={2}
                                          label="Step Execution Protocol Details"
                                          placeholder="Specific operational teardown instructions..."
                                          value={step.description || ''}
                                          onChange={(e: any) => {
                                            const nextSteps = [...(b.content.steps || [])];
                                            nextSteps[sIdx].description = e.target.value;
                                            updateBlock(b.id, 'steps', nextSteps);
                                          }}
                                        />

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                                            Checklist Items
                                          </Typography>
                                          {(step.checklist || []).map((chk: string, cIdx: number) => (
                                            <Box key={cIdx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                              <PremiumTextField
                                                colorTheme={color}
                                                size="small"
                                                fullWidth
                                                placeholder={`Action item ${cIdx + 1}`}
                                                value={chk}
                                                onChange={e => {
                                                  const nextSteps = [...(b.content.steps || [])];
                                                  nextSteps[sIdx].checklist = [...(nextSteps[sIdx].checklist || [])];
                                                  nextSteps[sIdx].checklist[cIdx] = e.target.value;
                                                  updateBlock(b.id, 'steps', nextSteps);
                                                }}
                                              />
                                              {cIdx > 0 && (
                                                <IconButton size="small" onClick={() => {
                                                  const nextSteps = [...(b.content.steps || [])];
                                                  nextSteps[sIdx].checklist = (nextSteps[sIdx].checklist || []).filter((_: any, i: number) => i !== cIdx);
                                                  updateBlock(b.id, 'steps', nextSteps);
                                                }}>
                                                  <DeleteIcon fontSize="small" />
                                                </IconButton>
                                              )}
                                            </Box>
                                          ))}
                                          <Button
                                            size="small"
                                            onClick={() => {
                                              const nextSteps = [...(b.content.steps || [])];
                                              nextSteps[sIdx].checklist = [...(nextSteps[sIdx].checklist || []), ''];
                                              updateBlock(b.id, 'steps', nextSteps);
                                            }}
                                            sx={{ alignSelf: 'flex-start', fontSize: '0.75rem', textTransform: 'none', fontWeight: 700, color }}
                                          >
                                            + Add Checklist Item
                                          </Button>
                                        </Box>
                                      </Box>
                                    ))}

                                    <Button
                                      onClick={() => {
                                        const nextSteps = [...(b.content.steps || []), { stepNumber: (b.content.steps || []).length + 1, title: '', role: '', timeWindow: '', description: '', checklist: [''] }];
                                        updateBlock(b.id, 'steps', nextSteps);
                                      }}
                                      sx={{
                                        alignSelf: 'flex-start', borderRadius: '12px', textTransform: 'none', fontWeight: 700,
                                        px: 3, py: 1.25, bgcolor: alpha(color, 0.08), color, border: `1px dashed ${alpha(color, 0.3)}`,
                                        '&:hover': { bgcolor: alpha(color, 0.15) }
                                      }}
                                    >
                                      + Add Execution Step
                                    </Button>
                                  </Box>
                                )}
                                {b.type === 'timeline_tracker' && (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                    {(b.content.milestones || []).map((m: any, mIdx: number) => (
                                      <Box key={mIdx} sx={{ p: 2, borderRadius: '14px', bgcolor: alpha(color, 0.03), border: `1px solid ${alpha(color, 0.15)}`, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 2fr 1fr' }, gap: 1.5, flex: 1 }}>
                                            <PremiumTextField
                                              colorTheme={color}
                                              size="small"
                                              label="Year / Date / Phase"
                                              placeholder="Q1 2023 / 2030 Horizon"
                                              value={m.dateOrYear || ''}
                                              onChange={e => {
                                                const nextM = [...(b.content.milestones || [])];
                                                nextM[mIdx].dateOrYear = e.target.value;
                                                updateBlock(b.id, 'milestones', nextM);
                                              }}
                                            />
                                            <PremiumTextField
                                              colorTheme={color}
                                              size="small"
                                              label="Milestone Event Title"
                                              placeholder="Anchor Borrowers Default Wave"
                                              value={m.title || ''}
                                              onChange={e => {
                                                const nextM = [...(b.content.milestones || [])];
                                                nextM[mIdx].title = e.target.value;
                                                updateBlock(b.id, 'milestones', nextM);
                                              }}
                                            />
                                            <PremiumTextField
                                              colorTheme={color}
                                              size="small"
                                              label="Status Tag"
                                              placeholder="Failure Trigger / Milestone"
                                              value={m.status || ''}
                                              onChange={e => {
                                                const nextM = [...(b.content.milestones || [])];
                                                nextM[mIdx].status = e.target.value;
                                                updateBlock(b.id, 'milestones', nextM);
                                              }}
                                            />
                                          </Box>
                                          {mIdx > 0 && (
                                            <IconButton size="small" color="error" onClick={() => {
                                              const nextM = (b.content.milestones || []).filter((_: any, i: number) => i !== mIdx);
                                              updateBlock(b.id, 'milestones', nextM);
                                            }}>
                                              <DeleteIcon fontSize="small" />
                                            </IconButton>
                                          )}
                                        </Box>
                                        <PremiumMarkdownEditor
                                          colorTheme={color}
                                          fullWidth multiline rows={2}
                                          label="Milestone Description & Significance"
                                          placeholder="What happened at this point in the timeline..."
                                          value={m.description || ''}
                                          onChange={(e: any) => {
                                            const nextM = [...(b.content.milestones || [])];
                                            nextM[mIdx].description = e.target.value;
                                            updateBlock(b.id, 'milestones', nextM);
                                          }}
                                        />
                                      </Box>
                                    ))}

                                    <Button
                                      onClick={() => {
                                        const nextM = [...(b.content.milestones || []), { dateOrYear: '', title: '', description: '', status: '' }];
                                        updateBlock(b.id, 'milestones', nextM);
                                      }}
                                      sx={{
                                        alignSelf: 'flex-start', borderRadius: '12px', textTransform: 'none', fontWeight: 700,
                                        px: 3, py: 1.25, bgcolor: alpha(color, 0.08), color, border: `1px dashed ${alpha(color, 0.3)}`,
                                        '&:hover': { bgcolor: alpha(color, 0.15) }
                                      }}
                                    >
                                      + Add Timeline Milestone
                                    </Button>
                                  </Box>
                                )}
                                {b.type === 'persona_dossier' && (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr' }, gap: 2 }}>
                                      <PremiumTextField
                                        colorTheme={color}
                                        label="Operator / Trader Full Name"
                                        placeholder="Hajiya Amina Bello"
                                        value={b.content.name || ''}
                                        onChange={e => updateBlock(b.id, 'name', e.target.value)}
                                      />
                                      <PremiumTextField
                                        colorTheme={color}
                                        label="Role & Location"
                                        placeholder="Onion Aggregator, Kano"
                                        value={b.content.roleAndLocation || ''}
                                        onChange={e => updateBlock(b.id, 'roleAndLocation', e.target.value)}
                                      />
                                      <PremiumTextField
                                        colorTheme={color}
                                        label="Monthly Turnover / Volume"
                                        placeholder="4,200 Bags / ₦48M"
                                        value={b.content.monthlyTurnover || ''}
                                        onChange={e => updateBlock(b.id, 'monthlyTurnover', e.target.value)}
                                      />
                                    </Box>

                                    <PremiumMarkdownEditor
                                      colorTheme={color}
                                      fullWidth multiline rows={3}
                                      label="Raw Field Quote (Voice of the Ground)"
                                      placeholder="Direct unvarnished testimony from the operator..."
                                      value={b.content.fieldQuote || ''}
                                      onChange={(e: any) => updateBlock(b.id, 'fieldQuote', e.target.value)}
                                    />

                                    <PremiumMarkdownEditor
                                      colorTheme={color}
                                      fullWidth multiline rows={2}
                                      label="Background & Operating Reality"
                                      placeholder="Context on their operations, family labor, and local network..."
                                      value={b.content.bio || ''}
                                      onChange={(e: any) => updateBlock(b.id, 'bio', e.target.value)}
                                    />

                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                      <Box sx={{ flex: 1 }}>
                                        {mediaUrlMode[b.id] ? (
                                          <PremiumTextField
                                            colorTheme={color}
                                            fullWidth label="Avatar/Photo URL"
                                            placeholder="https://..."
                                            value={b.content.avatarUrl || ''}
                                            onChange={e => updateBlock(b.id, 'avatarUrl', e.target.value)}
                                          />
                                        ) : (
                                          <Button
                                            component="label" fullWidth
                                            sx={{ height: 56, borderRadius: '14px', borderStyle: 'dashed', borderWidth: 2, color, borderColor: alpha(color, 0.4), '&:hover': { borderColor: color, bgcolor: alpha(color, 0.05) }, justifyContent: 'flex-start', px: 2 }}
                                          >
                                            <input type="file" hidden accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleImageUpload(b.id, 'avatarUrl', e.target.files[0]); }} />
                                            {uploading ? <CircularProgress size={24} color="inherit" /> : (
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <UploadIcon />
                                                <Typography sx={{ fontWeight: 700, textTransform: 'none' }}>Upload Persona Photo</Typography>
                                              </Box>
                                            )}
                                          </Button>
                                        )}
                                      </Box>
                                      <Tooltip title={mediaUrlMode[b.id] ? "Switch to Upload" : "Paste URL instead"}>
                                        <IconButton onClick={(e) => { e.stopPropagation(); toggleUrlMode(b.id); }} sx={{ bgcolor: alpha(color, 0.1), color, '&:hover': { bgcolor: alpha(color, 0.2) }, width: 48, height: 48, borderRadius: '14px', flexShrink: 0 }}>
                                          {mediaUrlMode[b.id] ? <UploadIcon /> : <LinkIcon />}
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </Box>
                                )}
                                {b.type === 'ecosystem_embed' && (
                                  <EcosystemJobPicker
                                    blockId={b.id}
                                    content={b.content}
                                    articleCommodity={selectedCommodity}
                                    articleCategory={selectedCategory}
                                    articleSubcategory={subcategoriesInSelectedCategory.find(s => s.id === selectedSubcategory)?.title || selectedSubcategory}
                                    colorTheme={color}
                                    userId={profile?.uid}
                                    userOrgs={profile?.organizations || []}
                                    onSelectJob={(jobData) => {
                                      setBlocks(blocks.map(blk => blk.id === b.id ? {
                                        ...blk,
                                        content: {
                                          ...blk.content,
                                          ...jobData
                                        }
                                      } : blk));
                                    }}
                                    onUpdateField={(key, val) => updateBlock(b.id, key, val)}
                                     onClear={() => {
                                       setBlocks(blocks.map(blk => blk.id === b.id ? {
                                         ...blk,
                                         content: {
                                           embedType: 'job',
                                           title: '',
                                           organization: '',
                                           location: '',
                                           compensationOrTarget: '',
                                           ctaText: 'Apply Now',
                                           ctaLink: '',
                                           jobId: ''
                                         }
                                       } : blk));
                                     }}
                                   />
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

                    {/* ─── ADD BLOCK BAR ─── */}
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
              <Box sx={{ animation: 'fadeIn 0.3s', maxWidth: 600, mx: 'auto', width: '100%', mt: 8, textAlign: 'center' }}>
                <Paper sx={{ p: 6, borderRadius: '32px', bgcolor: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.06)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>
                  <Box sx={{ width: 80, height: 80, borderRadius: '24px', bgcolor: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                    <BuildIcon sx={{ fontSize: 40, color: '#64748b' }} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, mb: 1.5, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    Space Not Yet Built
                  </Typography>
                  <Typography sx={{ color: '#475569', mb: 4, fontWeight: 500, fontSize: '1.05rem', maxWidth: 400, mx: 'auto' }}>
                    The builder for this content type is currently under construction in the FoodNerve ecosystem.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => onCancel?.()}
                    sx={{
                      bgcolor: '#0f172a', color: '#fff', px: 4, py: 1.5, borderRadius: '16px', fontWeight: 800,
                      '&:hover': { bgcolor: '#1e293b', transform: 'translateY(-2px)' }
                    }}
                  >
                    Go Back to Studio
                  </Button>
                </Paper>
              </Box>
            )}
          </Box>
        )}

      </Box>

      {/* FOOTER */}
      {!(type === 'article' && articleEditorMode === 'framework') && (
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
            /* ═══ STANDARD ACTIONS IN CANVAS MODE ═══ */
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
      )}

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

      {/* ═══ GLOBAL SLIDE-OVER CLIP NOTES DRAWER ═══ */}
      <ClipNoteDrawer
        currentCommodity={selectedCommodity}
        currentCategory={selectedCategory}
        currentArticleId={draftId || 'new'}
      />

      {/* ═══ 5-STEP AGROLLM DRAFTING PIPELINE MODAL ═══ */}
      <PipelineGenerationModal
        open={isPipelineModalOpen}
        onClose={() => setIsPipelineModalOpen(false)}
        commodity={selectedCommodity}
        category={selectedCategory}
        subcategory={subcategoriesInSelectedCategory.find(s => s.id === selectedSubcategory)?.title || selectedSubcategory}
        format={selectedFormat}
        era={selectedEra}
        title={title || (activeSubcategoryObj?.title ? `${activeSubcategoryObj.title} Analysis` : 'Agribusiness Strategic Intelligence')}
        description={description}
        pinnedClips={currentPairNotes.map(n => n.content)}
        onSuccess={handlePipelineSuccess}
        onFallbackManual={() => {
          applyFramework(selectedFormat, selectedEra);
          setArticleEditorMode('canvas');
        }}
      />

      {/* ═══ STREAM DRAFTING & TOKEN INGESTION MODAL ═══ */}
      <StreamDraftingModal
        open={isStreamModalOpen}
        onClose={() => setIsStreamModalOpen(false)}
        format={selectedFormat}
        era={selectedEra}
        commodity={selectedCommodity}
        category={selectedCategory}
        currentTitle={title}
        currentDescription={description}
        currentBlocks={blocks}
        onSyncToCanvas={handleStreamSync}
      />

      {/* ═══ EDITORIAL PROMPT SYSTEM & BLOCK REFINER SIDE PANE ═══ */}
      
      {/* ═══ SCRATCHPAD MODAL (80vw x 80vh) ═══ */}
      
      {/* ═══ BLOCK SCRATCHPAD MODAL ═══ */}
      <BlockScratchpadModal
        open={Boolean(activeScratchpadBlock)}
        onClose={() => setActiveScratchpadBlock(null)}
        block={activeScratchpadBlock?.block || null}
        blockIndex={activeScratchpadBlock?.index || 0}
        format={selectedFormat}
        era={selectedEra}
        commodity={selectedCommodity}
        category={selectedCategory}
        currentTitle={title}
      />

      <ScratchpadModal
        open={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
        commodity={selectedCommodity}
        category={selectedCategory}
        subcategory={subcategoriesInSelectedCategory.find(s => s.id === selectedSubcategory)?.title || selectedSubcategory}
        format={selectedFormat}
        era={selectedEra}
        currentTitle={title}
        blocks={blocks}
        onReorderBlocks={(newBlocks) => setBlocks(newBlocks)}
      />

      <EditorialPromptSidePane
        open={isPromptSidePaneOpen}
        onClose={() => setIsPromptSidePaneOpen(false)}
        format={selectedFormat}
        era={selectedEra}
        commodity={selectedCommodity}
        category={selectedCategory}
        subcategory={subcategoriesInSelectedCategory.find(s => s.id === selectedSubcategory)?.title || selectedSubcategory}
        currentTitle={title}
        blocks={blocks}
        pinnedClips={currentPairNotes.map(n => n.content)}
        onUpdateBlockContent={(blockId, newContent) => updateBlock(blockId, 'content', newContent)}
      />

    </Box>
  );
}
