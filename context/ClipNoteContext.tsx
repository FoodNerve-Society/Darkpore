'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ClipNote, ClipAttachment, ClipFilterOptions } from '@/types/clipNotes';

interface ClipNoteContextType {
  notes: ClipNote[];
  isOpen: boolean;
  activeClipId: string | null;
  currentFilter: ClipFilterOptions;
  openClipDrawer: (initialFilter?: ClipFilterOptions, clipId?: string) => void;
  closeClipDrawer: () => void;
  createNote: (content: string, title?: string, attachments?: ClipAttachment[], tags?: string[]) => ClipNote;
  updateNote: (id: string, updates: Partial<ClipNote>) => void;
  deleteNote: (id: string) => void;
  pinNoteToScope: (noteId: string, attachment: ClipAttachment) => void;
  unpinNoteFromScope: (noteId: string, scope: ClipAttachment['scope'], identifier?: string) => void;
  setFilter: (filter: ClipFilterOptions) => void;
  
  // Smart contextual query helpers
  getNotesForPair: (commodity: string, category: string) => ClipNote[];
  getNotesForArticle: (articleId: string) => ClipNote[];
  getNotesForBlock: (blockRole: string, articleId?: string) => ClipNote[];
  allTags: string[];
}

const ClipNoteContext = createContext<ClipNoteContextType | undefined>(undefined);

const STORAGE_KEY = 'foodnerve_global_clip_notes_v1';

export function ClipNoteProvider({ children, tenantId }: { children: React.ReactNode; tenantId?: string }) {
  const [notes, setNotes] = useState<ClipNote[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<ClipFilterOptions>({ scope: 'all' });

  // 1. Hydrate from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    } catch (e) {
      console.error('[ClipNotes] Failed to load from storage:', e);
    }
  }, []);

  // 2. Persist to LocalStorage on update
  const persistNotes = useCallback((updated: ClipNote[]) => {
    setNotes(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('[ClipNotes] Failed to persist to storage:', e);
    }
  }, []);

  const openClipDrawer = useCallback((initialFilter?: ClipFilterOptions, clipId?: string) => {
    if (initialFilter) setCurrentFilter(initialFilter);
    if (clipId) setActiveClipId(clipId);
    setIsOpen(true);
  }, []);

  const closeClipDrawer = useCallback(() => {
    setIsOpen(false);
    setActiveClipId(null);
  }, []);

  const createNote = useCallback((
    content: string,
    title?: string,
    attachments: ClipAttachment[] = [{ scope: 'global' }],
    tags: string[] = []
  ): ClipNote => {
    const newNote: ClipNote = {
      id: `clip_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      tenantId,
      title: title || '',
      content,
      attachments,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    persistNotes([newNote, ...notes]);
    return newNote;
  }, [notes, tenantId, persistNotes]);

  const updateNote = useCallback((id: string, updates: Partial<ClipNote>) => {
    persistNotes(notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
  }, [notes, persistNotes]);

  const deleteNote = useCallback((id: string) => {
    persistNotes(notes.filter(n => n.id !== id));
  }, [notes, persistNotes]);

  const pinNoteToScope = useCallback((noteId: string, attachment: ClipAttachment) => {
    persistNotes(notes.map(n => {
      if (n.id !== noteId) return n;
      const exists = n.attachments.some(a => 
        a.scope === attachment.scope && 
        a.commodity === attachment.commodity && 
        a.category === attachment.category &&
        a.articleId === attachment.articleId &&
        a.blockRole === attachment.blockRole
      );
      if (exists) return n;
      return {
        ...n,
        attachments: [...n.attachments, attachment],
        updatedAt: new Date().toISOString()
      };
    }));
  }, [notes, persistNotes]);

  const unpinNoteFromScope = useCallback((noteId: string, scope: ClipAttachment['scope'], identifier?: string) => {
    persistNotes(notes.map(n => {
      if (n.id !== noteId) return n;
      return {
        ...n,
        attachments: n.attachments.filter(a => {
          if (a.scope !== scope) return true;
          if (scope === 'commodity_category' && identifier) return `${a.commodity}_${a.category}` !== identifier;
          if (scope === 'article' && identifier) return a.articleId !== identifier;
          if (scope === 'block' && identifier) return a.blockRole !== identifier;
          return false;
        }),
        updatedAt: new Date().toISOString()
      };
    }));
  }, [notes, persistNotes]);

  const getNotesForPair = useCallback((commodity: string, category: string) => {
    return notes.filter(n => n.attachments.some(a => 
      a.scope === 'commodity_category' && 
      (!a.commodity || a.commodity.toLowerCase() === commodity.toLowerCase()) &&
      (!a.category || a.category.toLowerCase() === category.toLowerCase())
    ));
  }, [notes]);

  const getNotesForArticle = useCallback((articleId: string) => {
    return notes.filter(n => n.attachments.some(a => a.scope === 'article' && a.articleId === articleId));
  }, [notes]);

  const getNotesForBlock = useCallback((blockRole: string, articleId?: string) => {
    return notes.filter(n => n.attachments.some(a => {
      if (a.scope === 'block' && a.blockRole === blockRole) {
        if (articleId && a.articleId) return a.articleId === articleId;
        return true;
      }
      return false;
    }));
  }, [notes]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach(n => n.tags?.forEach(t => set.add(t)));
    return Array.from(set);
  }, [notes]);

  return (
    <ClipNoteContext.Provider value={{
      notes,
      isOpen,
      activeClipId,
      currentFilter,
      openClipDrawer,
      closeClipDrawer,
      createNote,
      updateNote,
      deleteNote,
      pinNoteToScope,
      unpinNoteFromScope,
      setFilter: setCurrentFilter,
      getNotesForPair,
      getNotesForArticle,
      getNotesForBlock,
      allTags
    }}>
      {children}
    </ClipNoteContext.Provider>
  );
}

export function useClipNotes() {
  const context = useContext(ClipNoteContext);
  if (!context) throw new Error('useClipNotes must be used within a ClipNoteProvider');
  return context;
}
