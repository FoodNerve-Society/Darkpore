'use client';

import React from 'react';
import { Box, Chip, Tooltip, IconButton, alpha } from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { useClipNotes } from '@/context/ClipNoteContext';

export function BlockClipAttachmentPill({
  blockRole,
  blockContent,
  commodity,
  category,
  articleId,
  onInsert
}: {
  blockRole: string;
  blockContent?: string;
  commodity?: string;
  category?: string;
  articleId?: string;
  onInsert?: (text: string) => void;
}) {
  const { getNotesForBlock, openClipDrawer, createNote } = useClipNotes();
  const attachedNotes = getNotesForBlock(blockRole, articleId);

  const handleQuickClipBlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!blockContent) return;
    createNote(
      blockContent,
      `Clip from ${blockRole}`,
      [
        { scope: 'block', blockRole, articleId, commodity, category },
        ...(commodity && category ? [{ scope: 'commodity_category' as const, commodity, category, articleId }] : [])
      ]
    );
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      {attachedNotes.length > 0 && (
        <Tooltip title={`View ${attachedNotes.length} research note(s) pinned to this block`}>
          <Chip
            icon={<PushPinIcon sx={{ fontSize: 13, color: '#059669 !important' }} />}
            label={`${attachedNotes.length} Note${attachedNotes.length > 1 ? 's' : ''}`}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              openClipDrawer({ scope: 'block', blockRole, articleId });
            }}
            sx={{
              height: 22,
              fontSize: '0.68rem',
              fontWeight: 800,
              bgcolor: alpha('#059669', 0.12),
              color: '#059669',
              border: `1px solid ${alpha('#059669', 0.3)}`,
              cursor: 'pointer',
              '&:hover': { bgcolor: alpha('#059669', 0.2) }
            }}
          />
        </Tooltip>
      )}

      {blockContent && (
        <Tooltip title="Clip this block's content to Global Notes">
          <IconButton
            size="small"
            onClick={handleQuickClipBlock}
            sx={{
              p: 0.5,
              borderRadius: '8px',
              color: '#94a3b8',
              '&:hover': { color: '#059669', bgcolor: alpha('#059669', 0.08) }
            }}
          >
            <NoteAddIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
