'use client';

import React, { useCallback } from 'react';
import { Box, Typography } from '@mui/material';
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
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import SortableWikiBlock from './SortableWikiBlock';

export default function WikiBlockBuilder({
  blocks,
  onBlocksChange,
  expandedBlockId,
  setExpandedBlockId,
  reorderUnlocked,
  getBlockFillStats
}: {
  blocks: any[];
  onBlocksChange: (blocks: any[]) => void;
  expandedBlockId: string | null;
  setExpandedBlockId: (id: string | null) => void;
  reorderUnlocked: boolean;
  getBlockFillStats: (b: any) => { filled: number; total: number; percent: number };
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(item => item.id === active.id);
      const newIndex = blocks.findIndex(item => item.id === over.id);
      onBlocksChange(arrayMove(blocks, oldIndex, newIndex));
    }
  }, [blocks, onBlocksChange]);

  const updateBlock = (id: string, updates: any) => {
    const newBlocks = blocks.map(b => b.id === id ? { ...b, ...updates } : b);
    onBlocksChange(newBlocks);
  };

  const removeBlock = (id: string) => {
    const newBlocks = blocks.filter(b => b.id !== id);
    onBlocksChange(newBlocks);
    if (expandedBlockId === id) setExpandedBlockId(null);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {blocks.map((block, index) => {
            const isExpanded = expandedBlockId === block.id;
            const stats = getBlockFillStats(block);
            const isComplete = stats.filled === stats.total;

            return (
              <SortableWikiBlock 
                key={block.id}
                block={block}
                index={index}
                isExpanded={isExpanded}
                reorderUnlocked={reorderUnlocked}
                onUpdate={updateBlock}
                onRemove={removeBlock}
                onToggleExpand={() => setExpandedBlockId(isExpanded ? null : block.id)}
                isComplete={isComplete}
              />
            );
          })}
          
          {blocks.length === 0 && (
            <Typography sx={{ color: '#94a3b8', textAlign: 'center', my: 6, fontStyle: 'italic' }}>
              No blocks added yet. Click "Add Block" to start building your template.
            </Typography>
          )}
        </Box>
      </SortableContext>
    </DndContext>
  );
}
