'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Paper,
  Divider,
  TextField,
  Tooltip,
  Alert,
  alpha,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinkIcon from '@mui/icons-material/Link';
import PaletteIcon from '@mui/icons-material/Palette';
import MovieIcon from '@mui/icons-material/Movie';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BusinessIcon from '@mui/icons-material/Business';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import SparkleIcon from '@mui/icons-material/AutoAwesome';
import { motion, AnimatePresence } from 'framer-motion';

import { usePromptAssistant } from '@/context/PromptAssistantContext';
import { CORRIDOR_PRESETS } from '../CreateLivestreamForm';

export interface LivestreamThumbnailGeneratorSidePaneProps {
  open: boolean;
  onClose: () => void;
  onOpen?: () => void;
  title: string;
  category: string;
  subcategory?: string;
  format?: string;
  timeframe?: 'past' | 'present' | 'future' | string;
  hubTitle?: string;
  hubColor?: string;
  currentCoverUrl?: string;
  onApplyThumbnail: (thumbnail: string | File) => void;
}

interface StylePreset {
  id: string;
  name: string;
  tagline: string;
  icon: React.ReactNode;
  color: string;
  keywords: string;
  cameraSetting: string;
}

const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'cinematic_documentary',
    name: 'Cinematic Field Documentary',
    tagline: '35mm anamorphic, golden hour natural light, genuine agricultural realism',
    icon: <MovieIcon sx={{ fontSize: 18 }} />,
    color: '#f59e0b',
    keywords: 'documentary photograph, warm sunset golden hour, authentic African agricultural field, rich earthy tones, subtle atmospheric dust particles, natural bokeh, 8k resolution, dignified documentary tone',
    cameraSetting: 'shot on ARRI Alexa 35, Cooke Anamorphic 40mm T2.3 lens, color graded for cinema',
  },
  {
    id: 'agritech_3d',
    name: 'Modern Agritech & Data',
    tagline: 'Precision greenhouse, drone telemetry HUD, clean futuristic operations',
    icon: <PrecisionManufacturingIcon sx={{ fontSize: 18 }} />,
    color: '#10b981',
    keywords: 'modern agritech facility, clean glass greenhouse, autonomous drone telemetry, subtle cyan and emerald holographic data overlay, clean industrial minimalism, soft diffuse lighting, octane render aesthetic, 8k',
    cameraSetting: 'photographed with Hasselblad H6D-100c, 50mm f/4, studio volumetric lighting',
  },
  {
    id: 'studio_broadcast',
    name: 'Studio Broadcast & Keynote',
    tagline: 'Dark cinema stage, emerald rim lighting, prestige executive presentation',
    icon: <LiveTvIcon sx={{ fontSize: 18 }} />,
    color: '#8b5cf6',
    keywords: 'prestige television broadcast stage, dark graphite background, striking emerald and sapphire rim lighting, curved ambient LED screens, high production value, sophisticated executive keynote aesthetic',
    cameraSetting: 'broadcast television studio rig, Sony Venice 2, 85mm prime lens, dramatic chiaroscuro',
  },
  {
    id: 'editorial_magazine',
    name: 'Editorial Magazine Cover',
    tagline: 'Medium-format portrait, high-contrast lighting, Forbes Africa prestige',
    icon: <MenuBookIcon sx={{ fontSize: 18 }} />,
    color: '#ec4899',
    keywords: 'Hasselblad medium format portrait, high-contrast studio chiaroscuro lighting, deep shadows, crisp organic highlights, Forbes Africa editorial style, dignified and commanding human presence',
    cameraSetting: 'Hasselblad X2D 100C, 90mm f/2.5 lens, Profoto softbox studio strobe',
  },
  {
    id: 'infrastructure_aerial',
    name: 'Logistics Corridor & Silos',
    tagline: 'Wide drone panorama, monumental grain silos, cold-chain transport fleet',
    icon: <BusinessIcon sx={{ fontSize: 18 }} />,
    color: '#3b82f6',
    keywords: 'cinematic wide drone establishing shot, massive modern grain storage silos, refrigerated freight transport trucks, sunrise mist over productive agricultural trade corridor, industrial scale, hyper-detailed landscape',
    cameraSetting: 'DJI Inspire 3 drone camera, Zenmuse X9-8K Air, 24mm full frame, atmospheric morning haze',
  },
];

export default function LivestreamThumbnailGeneratorSidePane({
  open,
  onClose,
  onOpen,
  title,
  category,
  subcategory = '',
  format = 'industry_teardown',
  timeframe = 'present',
  hubTitle = 'Production & Capital',
  hubColor = '#10b981',
  currentCoverUrl = '',
  onApplyThumbnail,
}: LivestreamThumbnailGeneratorSidePaneProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Dock assistant coordination
  const [isDockVisible, setIsDockVisible] = useState(false);
  const { suspendDock, setHasEditorDock } = usePromptAssistant();

  useEffect(() => {
    if (open) {
      setIsDockVisible(false);
      suspendDock(true);
      setHasEditorDock(true);
    } else {
      suspendDock(false);
    }
    return () => {
      suspendDock(false);
      setHasEditorDock(false);
    };
  }, [open, suspendDock, setHasEditorDock]);

  // Active state
  const [selectedStyleId, setSelectedStyleId] = useState<string>('cinematic_documentary');
  const [activeModelTab, setActiveModelTab] = useState<number>(0); // 0: Midjourney, 1: DALL-E 3, 2: Imagen 3, 3: SDXL/Flux
  const [customSubjectDetails, setCustomSubjectDetails] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Ingestion inputs
  const [inputUrl, setInputUrl] = useState<string>('');
  const [urlApplySuccess, setUrlApplySuccess] = useState<boolean>(false);
  const [urlApplyError, setUrlApplyError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Selected Style Preset
  const activeStyle = useMemo(() => {
    return STYLE_PRESETS.find((s) => s.id === selectedStyleId) || STYLE_PRESETS[0];
  }, [selectedStyleId]);

  // Corridor context narrative
  const corridorNarrative = useMemo(() => {
    switch (category) {
      case 'capital':
        return 'African agricultural trading floor, commodity escrow desks, sovereign investment allocators, dynamic ag-fund liquidity charts';
      case 'land':
        return 'expansive fertile acreage along river basin corridors, mechanized tractors harvesting grain clusters, organized land tenure borders';
      case 'inputs':
        return 'high-yield certified seed trial plots, bio-stimulant blenders, agriscientists analyzing crop genetics in pristine field laboratories';
      case 'energy':
        return 'off-grid solar cold-chain packhouse, photovoltaic mini-grid arrays, refrigerated logistics haulage in semi-arid corridor';
      case 'insecurity':
        return 'secure haulage logistics corridor, GPS fleet telematics dispatch, safe aggregation transit checkpoint in northern agrarian belt';
      case 'post-harvest':
        return 'industrial dry grain silos, automated bagging lines, jetty grain transshipment barges, sealed hermetic storage warehouse';
      case 'people-talent':
        return 'master agronomists training youthful farm operators, digital soil health tablet scanning, collaborative agricultural cooperative leadership';
      default:
        return 'commercial African agribusiness value chain, modern harvesting machinery, structured farmer cooperative aggregation hub';
    }
  }, [category]);

  const cleanTitle = useMemo(() => {
    return title.trim() || 'Modern African Agribusiness & Value Chain Livestream';
  }, [title]);

  // Master Prompts per Engine
  const prompts = useMemo(() => {
    const subject = customSubjectDetails.trim()
      ? customSubjectDetails.trim()
      : corridorNarrative;

    // 1. Midjourney v6
    const midjourney = `/imagine prompt: A 16:9 cinema broadcast stage backdrop for a live stream titled "${cleanTitle}". Visual narrative: ${subject}. Visual style: ${activeStyle.keywords}. Camera setup: ${activeStyle.cameraSetting}. Wide angle, high dynamic range, masterwork editorial composition, clean negative space for overlays --ar 16:9 --style raw --v 6.0 --no text, words, font, typography, watermark, logo, banner, blurry, low resolution, 3d render plastic`;

    // 2. DALL-E 3 (ChatGPT Plus / OpenAI API)
    const dalle = `A wide 16:9 widescreen cinematic editorial photograph for a high-profile live stream backdrop titled "${cleanTitle}".\n\nSubject: ${subject}.\n\nStyle & Aesthetics: ${activeStyle.name}. ${activeStyle.keywords}. Camera: ${activeStyle.cameraSetting}.\n\nComposition Guidelines: 16:9 aspect ratio (1792x1024), centered-to-lower focus with clean upper and lower framing. Rich atmospheric depth, realistic lighting and textures.\n\nCRITICAL RESTRICTION: Absolutely no text, no letters, no logos, no typography, and no fake watermarks anywhere in the image.`;

    // 3. Google Imagen 3 (Gemini / Vertex)
    const imagen = `Cinematic 16:9 broadcast stage photograph representing "${cleanTitle}". Scene depicts ${subject}. Stylized as ${activeStyle.keywords}. Shot with ${activeStyle.cameraSetting}. Natural cinematic depth, authentic African agribusiness atmosphere, dramatic lighting with vivid contrast. Widescreen 16:9 framing, ultra sharp focus, photographic masterpiece. No text, watermark, or lettering.`;

    // 4. Flux.1 / Stable Diffusion XL
    const fluxPositive = `masterpiece, 8k uhd, 16:9 widescreen broadcast cover, "${cleanTitle}", ${subject}, ${activeStyle.keywords}, ${activeStyle.cameraSetting}, hyper-realistic photography, award-winning lighting, crisp detail`;
    const fluxNegative = `text, typography, watermark, signature, logo, letters, words, ugly, deformed, blurry, low quality, oversaturated cartoon, plastic skin, bad anatomy`;

    return {
      midjourney,
      dalle,
      imagen,
      fluxPositive,
      fluxNegative,
    };
  }, [cleanTitle, customSubjectDetails, corridorNarrative, activeStyle]);

  const activePromptText = useMemo(() => {
    switch (activeModelTab) {
      case 0:
        return prompts.midjourney;
      case 1:
        return prompts.dalle;
      case 2:
        return prompts.imagen;
      case 3:
        return `Positive Prompt:\n${prompts.fluxPositive}\n\nNegative Prompt:\n${prompts.fluxNegative}`;
      default:
        return prompts.midjourney;
    }
  }, [activeModelTab, prompts]);

  const handleCopyPrompt = (textToCopy: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedNotification(label);
      setTimeout(() => setCopiedNotification(null), 3000);
    }
  };

  const handleApplyUrl = () => {
    setUrlApplyError(null);
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setUrlApplyError('Please enter a valid image URL');
      return;
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setUrlApplyError('Image URL must start with http:// or https://');
      return;
    }

    onApplyThumbnail(trimmed);
    setUrlApplySuccess(true);
    setTimeout(() => {
      setUrlApplySuccess(false);
      onClose();
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      onApplyThumbnail(file);
      setUrlApplySuccess(true);
      setTimeout(() => {
        setUrlApplySuccess(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <>
      {/* ── FLOATING RESTORE DOCK (WHEN MINIMIZED) ── */}
      <AnimatePresence>
        {isDockVisible && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1350,
            }}
          >
            <Paper
              elevation={0}
              onClick={() => {
                setIsDockVisible(false);
                if (onOpen) onOpen();
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2.25,
                py: 1.25,
                borderRadius: '999px',
                bgcolor: 'rgba(15, 23, 42, 0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(139, 92, 246, 0.4)',
                boxShadow: '0 12px 36px rgba(139, 92, 246, 0.35), 0 4px 12px rgba(0, 0, 0, 0.5)',
                cursor: 'pointer',
                color: '#ffffff',
                transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px) scale(1.02)',
                  borderColor: '#a855f7',
                  boxShadow: '0 16px 44px rgba(168, 85, 247, 0.45)',
                },
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 12px rgba(168, 85, 247, 0.6)',
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 16, color: '#fff' }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.02em' }}>
                AI Thumbnail Generator
              </Typography>
              <Chip
                size="small"
                label="16:9 Canvas"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  color: '#e2e8f0',
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  height: 22,
                }}
              />
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN LIQUID GLASS SLIDE-OVER DRAWER ── */}
      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100vw', sm: '85vw', md: '54vw', lg: '46vw' },
              minWidth: { sm: 540, md: 620 },
              maxWidth: { xl: 860 },
              height: { xs: '88vh', sm: '100%' },
              maxHeight: { xs: '88vh', sm: '100%' },
              borderRadius: { xs: '24px 24px 0 0', sm: 0 },
              bgcolor: '#f8fafc',
              boxShadow: { xs: '0 -12px 40px rgba(0, 0, 0, 0.18)', sm: '-16px 0 48px rgba(0, 0, 0, 0.18)' },
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1300,
              overflow: 'hidden',
            },
          },
        }}
      >
        {/* Floating Top Controls (Minimize & Close) */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 14, sm: 20 },
            right: { xs: 14, sm: 24 },
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            zIndex: 50,
          }}
        >
          {/* Minimize Button */}
          <IconButton
            onClick={() => {
              onClose();
              setIsDockVisible(true);
            }}
            title="Minimize to dock"
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              color: '#475569',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: '#ffffff',
                color: '#0f172a',
                transform: 'scale(1.08)',
              },
            }}
          >
            <RemoveIcon sx={{ fontSize: 18 }} />
          </IconButton>

          {/* Close Button */}
          <IconButton
            onClick={onClose}
            title="Close generator"
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              bgcolor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              color: '#475569',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: '#ffffff',
                color: '#ef4444',
                transform: 'scale(1.08)',
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* ── HEADER HERO ── */}
        <Box
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            pb: 2,
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            borderBottom: '1px solid #e2e8f0',
            pr: { xs: 12, sm: 16 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '11px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.35)',
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              16:9 Thumbnail Generator
            </Typography>
            <Chip
              size="small"
              label="Cinema Stage"
              sx={{
                bgcolor: 'rgba(139, 92, 246, 0.1)',
                color: '#7c3aed',
                fontWeight: 800,
                fontSize: '0.72rem',
                border: '1px solid rgba(139, 92, 246, 0.25)',
              }}
            />
          </Box>
          <Typography sx={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500, lineHeight: 1.45 }}>
            Master prompts customized to your broadcast title, corridor ecosystem, and visual aesthetics. Copy to your favorite AI generator and apply instantly.
          </Typography>

          {/* Active Broadcast Context Pill */}
          <Box
            sx={{
              mt: 2,
              p: 1.25,
              px: 1.75,
              borderRadius: '12px',
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: hubColor || '#10b981',
                boxShadow: `0 0 8px ${hubColor || '#10b981'}`,
              }}
            />
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', flex: 1 }} noWrap>
              {cleanTitle}
            </Typography>
            <Chip
              size="small"
              label={CORRIDOR_PRESETS.find(p => p.key === category)?.shortName || 'Corridor'}
              sx={{
                bgcolor: alpha(hubColor, 0.12),
                color: hubColor,
                fontWeight: 800,
                fontSize: '0.68rem',
                height: 20,
              }}
            />
          </Box>
        </Box>

        {/* ── SCROLLABLE BODY ── */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: { xs: 2.5, sm: 3.5 },
            display: 'flex',
            flexDirection: 'column',
            gap: 3.5,
          }}
        >
          {/* STEP 1: VISUAL STYLE PRESETS */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaletteIcon sx={{ fontSize: 18, color: '#6366f1' }} />
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  1. Choose Visual Style Preset
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                Tap to switch prompt tone
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
              {STYLE_PRESETS.map((preset) => {
                const isSelected = preset.id === selectedStyleId;
                return (
                  <Paper
                    key={preset.id}
                    elevation={0}
                    onClick={() => setSelectedStyleId(preset.id)}
                    sx={{
                      p: 1.75,
                      borderRadius: '16px',
                      cursor: 'pointer',
                      bgcolor: isSelected ? alpha(preset.color, 0.08) : '#ffffff',
                      border: `1.5px solid ${isSelected ? preset.color : '#e2e8f0'}`,
                      boxShadow: isSelected ? `0 6px 20px ${alpha(preset.color, 0.2)}` : '0 1px 3px rgba(0,0,0,0.02)',
                      transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.75,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        borderColor: preset.color,
                        bgcolor: alpha(preset.color, 0.06),
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '8px',
                            bgcolor: alpha(preset.color, 0.15),
                            color: preset.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {preset.icon}
                        </Box>
                        <Typography sx={{ fontWeight: 850, fontSize: '0.84rem', color: isSelected ? preset.color : '#0f172a' }}>
                          {preset.name}
                        </Typography>
                      </Box>
                      {isSelected && (
                        <CheckCircleIcon sx={{ fontSize: 18, color: preset.color }} />
                      )}
                    </Box>
                    <Typography sx={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.35 }}>
                      {preset.tagline}
                    </Typography>
                  </Paper>
                );
              })}
            </Box>
          </Box>

          {/* STEP 2: ENGINE SELECTION & MASTER PROMPT TERMINAL */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesomeIcon sx={{ fontSize: 18, color: '#8b5cf6' }} />
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  2. Master Image Prompts (Copy-Ready)
                </Typography>
              </Box>
              {copiedNotification && (
                <Chip
                  size="small"
                  icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#10b981 !important' }} />}
                  label={`Copied for ${copiedNotification}!`}
                  sx={{
                    bgcolor: 'rgba(16, 185, 129, 0.12)',
                    color: '#065f46',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                />
              )}
            </Box>

            {/* Model Tabs */}
            <Tabs
              value={activeModelTab}
              onChange={(_, val) => setActiveModelTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                bgcolor: 'rgba(15, 23, 42, 0.04)',
                p: 0.5,
                borderRadius: '12px',
                minHeight: 40,
                mb: 1.5,
                '& .MuiTabs-indicator': { display: 'none' },
                '& .MuiTab-root': {
                  minHeight: 32,
                  py: 0.75,
                  px: 1.75,
                  borderRadius: '9px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  color: '#64748b',
                  '&.Mui-selected': {
                    bgcolor: '#ffffff',
                    color: '#0f172a',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  },
                },
              }}
            >
              <Tab label="Midjourney v6" />
              <Tab label="DALL-E 3 (ChatGPT)" />
              <Tab label="Google Imagen 3" />
              <Tab label="Flux.1 / SDXL" />
            </Tabs>

            {/* Terminal Container */}
            <Paper
              elevation={0}
              sx={{
                p: 2.25,
                borderRadius: '18px',
                bgcolor: '#0f172a',
                color: '#f8fafc',
                border: '1.5px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.75,
              }}
            >
              {/* Terminal Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ display: 'flex', gap: 0.6 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ef4444' }} />
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981' }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace', fontWeight: 700, ml: 1 }}>
                    {activeModelTab === 0 && 'MIDJOURNEY_V6_PROMPT.terminal'}
                    {activeModelTab === 1 && 'DALLE3_OPENAI_PROMPT.txt'}
                    {activeModelTab === 2 && 'GOOGLE_IMAGEN3_PROMPT.txt'}
                    {activeModelTab === 3 && 'FLUX_SDXL_PROMPT.txt'}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label="16:9 Widescreen"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: '#38bdf8',
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    height: 20,
                  }}
                />
              </Box>

              {/* Prompt Body */}
              <Box
                sx={{
                  bgcolor: 'rgba(0, 0, 0, 0.45)',
                  p: 2,
                  borderRadius: '12px',
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  lineHeight: 1.6,
                  color: '#e2e8f0',
                  maxHeight: 200,
                  overflowY: 'auto',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  userSelect: 'all',
                }}
              >
                {activePromptText}
              </Box>

              {/* Terminal Action Footer */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.25 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleCopyPrompt(activePromptText, activeModelTab === 0 ? 'Midjourney' : activeModelTab === 1 ? 'DALL-E 3' : activeModelTab === 2 ? 'Imagen 3' : 'Flux/SDXL')}
                  startIcon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    bgcolor: '#3b82f6',
                    px: 2,
                    py: 0.75,
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                    '&:hover': {
                      bgcolor: '#2563eb',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  Copy Prompt to Clipboard
                </Button>

                {/* Quick Launch Links */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Tooltip title="Open Discord / Midjourney" arrow>
                    <Button
                      size="small"
                      href="https://www.midjourney.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                      sx={{
                        color: '#94a3b8',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        '&:hover': { color: '#ffffff' },
                      }}
                    >
                      Midjourney
                    </Button>
                  </Tooltip>
                  <Tooltip title="Open ChatGPT Plus DALL-E 3" arrow>
                    <Button
                      size="small"
                      href="https://chatgpt.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                      sx={{
                        color: '#94a3b8',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        '&:hover': { color: '#ffffff' },
                      }}
                    >
                      ChatGPT DALL-E
                    </Button>
                  </Tooltip>
                  <Tooltip title="Open Google Gemini (Imagen 3)" arrow>
                    <Button
                      size="small"
                      href="https://gemini.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                      sx={{
                        color: '#94a3b8',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        '&:hover': { color: '#ffffff' },
                      }}
                    >
                      Gemini
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* STEP 3: INSTANT IMAGE APPLICATION (URL OR UPLOAD) */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <CloudUploadIcon sx={{ fontSize: 18, color: '#10b981' }} />
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                3. Apply Generated Thumbnail
              </Typography>
            </Box>

            {urlApplySuccess && (
              <Alert severity="success" sx={{ mb: 2, borderRadius: '12px', fontWeight: 700 }}>
                Thumbnail successfully applied to broadcast stage!
              </Alert>
            )}

            {urlApplyError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '12px', fontWeight: 700 }}>
                {urlApplyError}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Option A: Paste Generated Image URL */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '16px',
                  bgcolor: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinkIcon sx={{ fontSize: 17, color: '#64748b' }} />
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>
                    Option A: Instant Image URL (Midjourney / Discord / Web Link)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="https://cdn.midjourney.com/... or https://images.unsplash.com/..."
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        fontSize: '0.84rem',
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleApplyUrl}
                    startIcon={<CheckCircleIcon />}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      bgcolor: '#10b981',
                      px: 2.25,
                      flexShrink: 0,
                      boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
                      '&:hover': {
                        bgcolor: '#059669',
                      },
                    }}
                  >
                    Apply URL
                  </Button>
                </Box>
              </Paper>

              {/* Option B: Direct File Upload */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '16px',
                  bgcolor: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1.5,
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhotoCameraIcon sx={{ fontSize: 17, color: '#64748b' }} />
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>
                      Option B: Upload Generated Image File
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.74rem', color: '#94a3b8', mt: 0.25 }}>
                    Accepts PNG, JPG, or WEBP (16:9 widescreen recommended)
                  </Typography>
                </Box>

                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  accept="image/*"
                  onChange={handleFileUpload}
                />

                <Button
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 750,
                    fontSize: '0.82rem',
                    borderColor: '#cbd5e1',
                    color: '#334155',
                    px: 2,
                    '&:hover': {
                      borderColor: '#94a3b8',
                      bgcolor: '#f8fafc',
                    },
                  }}
                >
                  Choose File
                </Button>
              </Paper>

              {/* Option C: Curated Corridor Presets Quick Select */}
              <Box sx={{ pt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Option C: Quick Apply Curated Corridor Cover
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    overflowX: 'auto',
                    pb: 1,
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                  }}
                >
                  {CORRIDOR_PRESETS.map((preset) => (
                    <Box
                      key={preset.key}
                      onClick={() => {
                        onApplyThumbnail(preset.url);
                        setUrlApplySuccess(true);
                        setTimeout(() => {
                          setUrlApplySuccess(false);
                          onClose();
                        }, 900);
                      }}
                      sx={{
                        flexShrink: 0,
                        width: 140,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: '1.5px solid #e2e8f0',
                        transition: 'all 0.2s ease',
                        bgcolor: '#ffffff',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          borderColor: preset.color,
                          boxShadow: `0 4px 14px ${alpha(preset.color, 0.2)}`,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          height: 70,
                          backgroundImage: `url(${preset.url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                      <Box sx={{ p: 1, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#1e293b' }} noWrap>
                          {preset.shortName}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ── FOOTER DRAWER ACTIONS ── */}
        <Box
          sx={{
            p: 2,
            px: { xs: 2.5, sm: 3.5 },
            bgcolor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button
            variant="text"
            onClick={onClose}
            sx={{
              color: '#64748b',
              fontWeight: 750,
              fontSize: '0.84rem',
              textTransform: 'none',
            }}
          >
            Close Assistant
          </Button>

          <Button
            variant="contained"
            onClick={() => handleCopyPrompt(activePromptText, 'Selected Engine')}
            startIcon={<ContentCopyIcon />}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.84rem',
              bgcolor: '#0f172a',
              px: 2.5,
              py: 0.85,
              '&:hover': {
                bgcolor: '#1e293b',
              },
            }}
          >
            Copy Master Prompt
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
