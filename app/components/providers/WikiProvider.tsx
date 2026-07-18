'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type WikiMode = 'drawer' | 'modal';
export type UserRole = 'guest' | 'author' | 'internal_staff' | 'super_admin';

interface WikiContextType {
  isOpen: boolean;
  activeDocId: string | null;
  mode: WikiMode;
  userRole: UserRole;
  openWiki: (docId: string, customMode?: WikiMode) => void;
  closeWiki: () => void;
  setUserRole: (role: UserRole) => void; // For testing
}

const WikiContext = createContext<WikiContextType | undefined>(undefined);

export function WikiProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [mode, setMode] = useState<WikiMode>('drawer');
  const [userRole, setUserRole] = useState<UserRole>('author'); // Mocking default

  const openWiki = (docId: string, customMode: WikiMode = 'drawer') => {
    setActiveDocId(docId);
    setMode(customMode);
    setIsOpen(true);
  };

  const closeWiki = () => {
    setIsOpen(false);
    // Optional: delay clearing activeDocId so animation is smooth
    setTimeout(() => setActiveDocId(null), 300);
  };

  return (
    <WikiContext.Provider value={{ isOpen, activeDocId, mode, userRole, openWiki, closeWiki, setUserRole }}>
      {children}
    </WikiContext.Provider>
  );
}

export function useWiki() {
  const context = useContext(WikiContext);
  if (context === undefined) {
    throw new Error('useWiki must be used within a WikiProvider');
  }
  return context;
}
