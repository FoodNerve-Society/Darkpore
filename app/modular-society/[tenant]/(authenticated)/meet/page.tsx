// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Paper, InputBase, IconButton, Chip, Stack, alpha, CircularProgress, Avatar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import ContactsIcon from '@mui/icons-material/Contacts';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import VerifiedIcon from '@mui/icons-material/Verified';
import BusinessIcon from '@mui/icons-material/Business';
import FlipContainer from '../components/shared/FlipContainer';

// Context & Actions
import { useSociety } from '@/context/SocietyContext';
import { getCommunitiesAndGroups, getGroupFeed, searchRolodex } from '@/lib/actions/meet';

// New Meet Components
import RolodexSearchBarFront from './components/RolodexSearchBar';
import ChatInterface from './components/chat/ChatInterface';
import { initiateConversation } from '@/lib/actions/chat';
import { Message as MessageIcon } from '@mui/icons-material';

// ============================================================
// SHARED PAPER STYLES (matches Learn, Profile, Support)
// ============================================================
const sharedPaperSx = {
  flex: 1,
  m: { xs: 0, md: 2 },
  minHeight: { xs: '100vh', md: 'calc(100vh - 32px)' },
  bgcolor: '#ffffff',
  borderRadius: { xs: 0, md: 4 },
  boxShadow: { xs: 'none', md: '0 10px 40px rgba(0,0,0,0.04)' },
  overflow: 'hidden',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  pb: 12
};

// ============================================================
// THE BACK CANVAS (Rolodex Search Results)
// ============================================================
function SearchResultsCanvas({ onClear, isActive, onStartChat }: { onClear: () => void, isActive: boolean, onStartChat: (targetUid: string) => void }) {
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<{users: any[], orgs: any[]}>({ users: [], orgs: [] });
  const [loading, setLoading] = useState(false);

  const filterOptions = ['Verified', 'Rank 4+', 'Investors', 'Local (Lagos)', 'Online Now'];

  useEffect(() => {
    if (isActive) {
      setTimeout(() => inputRef.current?.focus(), 400);
    } else {
      setSearch('');
      setActiveFilters([]);
      setResults({ users: [], orgs: [] });
    }
  }, [isActive]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isActive && search.trim().length > 0) {
      setLoading(true);
      timeoutId = setTimeout(async () => {
        try {
          const res = await searchRolodex(search, activeFilters);
          setResults(res);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }, 400);
    } else {
      setResults({ users: [], orgs: [] });
    }
    return () => clearTimeout(timeoutId);
  }, [search, activeFilters, isActive]);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  return (
    <Paper elevation={0} sx={sharedPaperSx}>
      <Box sx={{ p: { xs: 3, md: 4 }, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -1, color: '#000', mb: 0.5 }}>
              Global Rolodex
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', fontWeight: 500 }}>
              Search the directory to build your network.
            </Typography>
          </Box>
          <Button startIcon={<SearchOffIcon />} onClick={onClear} sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600, bgcolor: 'rgba(0,0,0,0.04)', borderRadius: '20px', px: 2, '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' } }}>
            Close
          </Button>
        </Box>

        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.03)', borderRadius: '16px', px: 2, py: 1, boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <SearchIcon sx={{ color: '#6366f1', mr: 1.5 }} />
            <InputBase
              inputRef={inputRef}
              placeholder="Search the Rolodex (Names, Roles, Companies)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 1, fontSize: '1.05rem', fontWeight: 500, '& input::placeholder': { color: 'text.secondary', opacity: 0.7 } }}
            />
            {loading && <CircularProgress size={20} sx={{ color: '#6366f1' }} />}
            <IconButton sx={{ ml: 1, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', '&:hover': { bgcolor: alpha('#6366f1', 0.2) } }}>
              <TuneIcon />
            </IconButton>
          </Box>

          <Stack direction="row" spacing={1} sx={{ mt: 2, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
            {filterOptions.map(filter => (
              <Chip
                key={filter}
                label={filter}
                onClick={() => toggleFilter(filter)}
                sx={{ fontWeight: 600, fontSize: '0.8rem', borderRadius: '8px', bgcolor: activeFilters.includes(filter) ? '#6366f1' : 'rgba(0,0,0,0.04)', color: activeFilters.includes(filter) ? 'white' : 'text.secondary', border: 'none', transition: 'all 0.2s', '&:hover': { bgcolor: activeFilters.includes(filter) ? '#4f46e5' : 'rgba(0,0,0,0.08)' } }}
              />
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Results Grid */}
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc', overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
        {search.length > 0 ? (
          <Box>
            {/* People Results */}
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>People ({results.users.length})</Typography>
            <Stack spacing={2} sx={{ mb: 4 }}>
              {results.users.map(u => (
                <Box key={u.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'white', borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)', transform: 'translateY(-1px)' } }}>
                  <Avatar src={u.avatarUrl} sx={{ width: 48, height: 48, bgcolor: '#e2e8f0', fontWeight: 700 }}>{u.name?.[0]}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {u.name} {u.verified ? <VerifiedIcon sx={{ fontSize: 16, color: '#6366f1', verticalAlign: 'middle', ml: 0.5 }} /> : null}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{u.role} • Rank {u.rank}{u.specialization ? ` • ${u.specialization}` : ''}</Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<MessageIcon />}
                    onClick={() => onStartChat(u.firebaseUid)}
                    sx={{ borderRadius: 3, textTransform: 'none', borderColor: 'rgba(0,0,0,0.1)', color: 'text.primary' }}
                  >
                    Message (-100 NP)
                  </Button>
                </Box>
              ))}
              {results.users.length === 0 && !loading && <Typography variant="body2" color="text.secondary">No users found.</Typography>}
            </Stack>

            {/* Organization Results */}
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Organizations ({results.orgs.length})</Typography>
            <Stack spacing={2}>
              {results.orgs.map(org => (
                <Box key={org.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'white', borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)', transform: 'translateY(-1px)' } }}>
                  <Avatar sx={{ width: 48, height: 48, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1' }}><BusinessIcon /></Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {org.name} {org.verified ? <VerifiedIcon sx={{ fontSize: 16, color: '#6366f1', verticalAlign: 'middle', ml: 0.5 }} /> : null}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Organization • Rank {org.rank}</Typography>
                  </Box>
                </Box>
              ))}
              {results.orgs.length === 0 && !loading && <Typography variant="body2" color="text.secondary">No organizations found.</Typography>}
            </Stack>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', mt: 10 }}>
            <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1 }}>Start typing to search...</Typography>
            <Typography variant="body2" color="text.disabled">Search by name, role, university, or company to discover new connections.</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

// ============================================================
// MAIN MEET PAGE
// ============================================================
export default function MeetPage() {
  const { user } = useSociety();
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | undefined>(undefined);
  const [isStartingChat, setIsStartingChat] = useState(false);

  const handleStartChat = async (targetFirebaseUid: string) => {
    if (!user?.uid) return;
    setIsStartingChat(true);
    try {
      const res = await initiateConversation(user.uid, targetFirebaseUid);
      if (res.success) {
        setActiveChatId(res.conversationId);
        setIsFlipped(false); // Flip to front to view chat
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsStartingChat(false);
    }
  };

  // --- THE FRONT (Header + Chat Interface) ---
  const FrontContent = (
    <Paper elevation={0} sx={{ ...sharedPaperSx, pb: 0, position: 'relative' }}>
      
      {/* Floating Glass Header */}
      <Box sx={{ 
        position: 'absolute',
        top: 0, left: 0, right: 0,
        zIndex: 1200,
        px: { xs: 2, md: 3 }, 
        pt: { xs: 1.5, md: 2 }, 
        pb: { xs: 1.5, md: 2 }, 
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: { xs: 1, sm: 2 },
        bgcolor: 'rgba(255, 255, 255, 0.4)',
        backgroundImage: 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, rgba(255,255,255,0) 100%)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.1)'
      }}>
        <Box sx={{ flexShrink: 0 }}>
          <Typography sx={{ 
            fontFamily: 'Dosis, sans-serif',
            fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.75rem' },
            fontWeight: 800, 
            letterSpacing: -0.5, 
            mb: 0,
            background: 'linear-gradient(90deg, #6366f1 0%, #4338ca 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block',
            whiteSpace: 'nowrap'
          }}>
            Meet Experts
          </Typography>
        </Box>
        
        {/* Search Bar moved to top right */}
        <Box sx={{ width: { xs: '60%', md: '280px' } }}>
          <RolodexSearchBarFront onFocus={() => setIsFlipped(true)} />
        </Box>
      </Box>

      {/* Unified Messaging Interface fills the rest of the paper */}
      <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {isStartingChat && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, bgcolor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        )}
        <ChatInterface initialConversationId={activeChatId} />
      </Box>
    </Paper>
  );

  return (
    <FlipContainer 
      isFlipped={isFlipped}
      frontContent={FrontContent}
      backContent={<SearchResultsCanvas onClear={() => setIsFlipped(false)} isActive={isFlipped} onStartChat={handleStartChat} />}
    />
  );
}
