'use client';

import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { IosShare as ShareIcon, EditOutlined as EditIcon, HistoryOutlined as HistoryIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSociety } from '@/context/SocietyContext';
import { SpikyTitleBlock } from './blocks/SpikyTitleBlock';
import { KeyTakeawaysBlock } from './blocks/KeyTakeawaysBlock';
import { BigStatCardBlock } from './blocks/BigStatCardBlock';
import { MainAnalysisBlock } from './blocks/MainAnalysisBlock';
import { EvidenceGalleryBlock } from './blocks/EvidenceGalleryBlock';
import { MythRealityBlock } from './blocks/MythRealityBlock';
import { StrongQuoteBlock } from './blocks/StrongQuoteBlock';
import { QuickPollBlock } from './blocks/QuickPollBlock';
import { EmbeddedDataBlock } from './blocks/EmbeddedDataBlock';
import { StrategicDirectiveBlock } from './blocks/StrategicDirectiveBlock';
import { CallToActionBlock } from './blocks/CallToActionBlock';
import { ComparisonMatrixBlock } from './blocks/ComparisonMatrixBlock';
import { UnitEconomicsCardBlock } from './blocks/UnitEconomicsCardBlock';
import { ProtocolStepsBlock } from './blocks/ProtocolStepsBlock';
import { TimelineTrackerBlock } from './blocks/TimelineTrackerBlock';
import { PersonaDossierBlock } from './blocks/PersonaDossierBlock';
import { EcosystemEmbedBlock } from './blocks/EcosystemEmbedBlock';
import { QuoteCardGeneratorModal } from './social/QuoteCardGeneratorModal';

type ArticleBlockRendererProps = {
  block: {
    id: string;
    blockType: string;
    content: string | Record<string, any>;
    revisionCount?: number;
  };
  themeMode?: 'light' | 'dark';
  accentColor?: string;
  onOpenInsights?: (blockId: string) => void;
  author?: any;
};

export const ArticleBlockRenderer: React.FC<ArticleBlockRendererProps> = ({ block, themeMode = 'light', accentColor, onOpenInsights, author }) => {
  const { profile } = useSociety();
  const canEdit = profile && profile.currentRank >= 4;

  let parsedContent: any = {};
  if (typeof block.content === 'string') {
    try {
      parsedContent = JSON.parse(block.content);
    } catch (e) {
      console.error('Failed to parse block content:', e);
      return null;
    }
  } else {
    parsedContent = block.content;
  }

  const triggerInsights = () => onOpenInsights?.(block.id);

  const renderBlock = () => {
    switch (block.blockType) {
      case 'subheading': return <SpikyTitleBlock content={parsedContent} themeMode={themeMode} accentColor={accentColor} />;
      case 'exec_summary': return <KeyTakeawaysBlock content={parsedContent} themeMode={themeMode} accentColor={accentColor} />;
      case 'highlight_card': return <BigStatCardBlock content={parsedContent} themeMode={themeMode} accentColor={accentColor} />;
      case 'core_interactive': return <MainAnalysisBlock content={parsedContent} themeMode={themeMode} accentColor={accentColor} author={author} triggerInsights={triggerInsights} />;
      case 'media': return <EvidenceGalleryBlock content={parsedContent} themeMode={themeMode} accentColor={accentColor} />;
      case 'myth_fact': return <MythRealityBlock content={parsedContent} themeMode={themeMode} accentColor={accentColor} author={author} triggerInsights={triggerInsights} />;
      case 'pull_quote': return <StrongQuoteBlock content={parsedContent} themeMode={themeMode} accentColor={accentColor} author={author} triggerInsights={triggerInsights} />;
      case 'live_poll': return <QuickPollBlock content={parsedContent} themeMode={themeMode} accentColor={accentColor} author={author} triggerInsights={triggerInsights} />;
      case 'strategic_directive': return <StrategicDirectiveBlock content={parsedContent} themeMode={themeMode} accentColor={accentColor} />;
      case 'data_embed': return <EmbeddedDataBlock content={parsedContent} themeMode={themeMode} accentColor={accentColor} />;
      case 'call_to_action': return <CallToActionBlock content={parsedContent} themeMode={themeMode} accentColor={accentColor} />;
      case 'comparison_matrix': return <ComparisonMatrixBlock content={parsedContent} themeMode={themeMode} accentColor={accentColor} />;
      case 'unit_economics_card': return <UnitEconomicsCardBlock content={parsedContent} themeMode={themeMode} accentColor={accentColor} />;
      case 'protocol_steps': return <ProtocolStepsBlock content={parsedContent} themeMode={themeMode} accentColor={accentColor} />;
      case 'timeline_tracker': return <TimelineTrackerBlock content={parsedContent} themeMode={themeMode} accentColor={accentColor} />;
      case 'persona_dossier': return <PersonaDossierBlock content={parsedContent} themeMode={themeMode} accentColor={accentColor} />;
      case 'ecosystem_embed': return <EcosystemEmbedBlock content={parsedContent} themeMode={themeMode} accentColor={accentColor} />;
      default: return null;
    }
  };

  const [modalOpen, setModalOpen] = useState(false);

  const blockContent = renderBlock();
  if (!blockContent) return null;

  return (
    <Box sx={{ position: 'relative', '&:hover .export-btn': { opacity: 1 } }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {blockContent}
      </motion.div>
      
      {/* Block Actions (visible on hover) */}
      <Box 
        className="export-btn"
        sx={{ 
          position: 'absolute', top: 16, right: 16, 
          opacity: 0, transition: 'opacity 0.2s', zIndex: 10,
          display: 'flex', gap: 1, alignItems: 'center'
        }}
      >
        {/* Insights Trigger removed - now handled internally by specific blocks */}

        {(block.revisionCount && block.revisionCount > 0) ? (
          <Tooltip title="View Edit History">
            <IconButton 
              sx={{ 
                bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                backdropFilter: 'blur(8px)',
                color: themeMode === 'dark' ? '#fff' : '#0f172a',
                '&:hover': { bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }
              }}
            >
              <HistoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}
        
        {canEdit && (
          <Tooltip title="Edit this Block">
            <IconButton 
              sx={{ 
                bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                backdropFilter: 'blur(8px)',
                color: themeMode === 'dark' ? '#fff' : '#0f172a',
                '&:hover': { bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Export Social Card">
          <IconButton 
            onClick={() => setModalOpen(true)}
            sx={{ 
              bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              backdropFilter: 'blur(8px)',
              color: themeMode === 'dark' ? '#fff' : '#0f172a',
              '&:hover': { bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }
            }}
          >
            <ShareIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {modalOpen && (
        <QuoteCardGeneratorModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          themeMode={themeMode}
          // Assuming the author info is passed down or fetched from context, 
          // For now, we will leave it generic in the renderer.
        >
          {blockContent}
        </QuoteCardGeneratorModal>
      )}
    </Box>
  );
};
