// @ts-nocheck
"use client";

import React, { useState, Suspense, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  Paper,
  Avatar,
  alpha,
  Skeleton,
  Button,
  Tooltip,
  IconButton,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  LocationOn as LocationIcon,
  Bolt as BoltIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { TradeListing } from "@/lib/db/society";
import { useSociety } from "@/context/SocietyContext";
import FlipContainer from "../components/shared/FlipContainer";
import CreateListingForm from "./components/CreateListingForm";
import ListingStudioDashboard from "./components/ListingStudioDashboard";
import { getUserDrafts, deleteTradeListing, getTradeListings } from "@/lib/actions/trade";

// ── Colors ────────────────────────────────────────────────
const EMERALD = "#10b981";
const EMERALD_DARK = "#059669";
const FLASH_RED = "#ef4444";

const glassCard = {
  bgcolor: "rgba(255, 255, 255, 0.03)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(0, 0, 0, 0.08)",
  borderRadius: "20px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.04)",
  transition: "all 0.3s ease",
};

// ── Shared Paper Styles ──────────────────────────────────
const sharedPaperSx = {
  flex: 1,
  m: { xs: 1, md: 2 },
  minHeight: 0,
  height: { xs: 'calc(100% - 16px)', md: 'calc(100% - 32px)' },
  bgcolor: '#ffffff',
  borderRadius: 4,
  boxShadow: { xs: '0 8px 32px rgba(0,0,0,0.06)', md: '0 10px 40px rgba(0,0,0,0.04)' },
  overflowY: 'auto',
  overflowX: 'hidden',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
};

// ── Mock Data (until backend is fully wired) ────────────────
const MOCK_LISTINGS: TradeListing[] = [
  {
    id: "l1",
    category: "flash-sale",
    title: "10 Crates of Ripe Tomatoes (Must Go Today)",
    description: "Harvested yesterday, need to move them quickly.",
    priceOrAsk: "₦12,000 / crate",
    location: "Mile 12 Market",
    lga: "Kosofe",
    postedBy: { name: "Alhaja Food Supply", avatarUrl: "", isVerified: true },
    postedAt: new Date().toISOString(),
    urgency: "expiring",
    status: "active",
    isBoosted: true,
    imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop",
  },
  {
    id: "l2",
    category: "group-buy",
    title: "Community Solar Generator (10kVA)",
    description: "Looking for 5 people to co-own and share power for our processing hub.",
    priceOrAsk: "₦450,000 / slot",
    location: "Ikeja Tech Hub",
    lga: "Ikeja",
    postedBy: { name: "Oluwaseun GreenTech", avatarUrl: "", isVerified: true },
    postedAt: new Date().toISOString(),
    urgency: "normal",
    status: "active",
    slots: { filled: 2, total: 5 },
    isBoosted: false,
    imageUrl: "https://images.unsplash.com/photo-1509391366360-1e97f52cefd3?w=800&auto=format&fit=crop",
  },
  {
    id: "l3",
    category: "swap",
    title: "Tractor Time for Fertilizer",
    description: "I have 2 days of tractor usage, need 10 bags of NPK fertilizer.",
    priceOrAsk: "Barter",
    location: "Ogbomoso Farm",
    lga: "Ogbomoso",
    postedBy: { name: "Kunle Farms", avatarUrl: "", isVerified: false },
    postedAt: new Date().toISOString(),
    urgency: "normal",
    status: "active",
    swapOffer: "Tractor",
    swapWant: "Fertilizer",
    isBoosted: false,
    imageUrl: "https://images.unsplash.com/photo-1592982537447-6f2a6a0a3824?w=800&auto=format&fit=crop",
  },
  {
    id: "l4",
    category: "jobs",
    title: "Harvest Supervisor Needed (2 Weeks)",
    description: "Looking for an experienced supervisor for our tomato harvest.",
    priceOrAsk: "₦50,000 / week",
    location: "Abeokuta Farms",
    lga: "Abeokuta North",
    postedBy: { name: "Ogun AgriCorp", avatarUrl: "", isVerified: true },
    postedAt: new Date().toISOString(),
    urgency: "urgent",
    status: "active",
    isBoosted: true,
    jobSource: "verified_tenant",
    compType: "fiat",
    imageUrl: "https://images.unsplash.com/photo-1595841696677-647fa58d20ae?w=800&auto=format&fit=crop",
  },
  {
    id: "l5",
    category: "volunteer",
    title: "Translate Agronomy Guide to Yoruba",
    description: "Help us translate our latest pest-control guide for local farmers.",
    priceOrAsk: "500 NP",
    location: "Remote",
    lga: "Virtual",
    postedBy: { name: "FoodNerve Core", avatarUrl: "", isVerified: true },
    postedAt: new Date().toISOString(),
    urgency: "normal",
    status: "active",
    isBoosted: false,
    jobSource: "internal_foodnerve",
    compType: "volunteer",
    npReward: 500,
    imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop",
  },
];

// ════════════════════════════════════════════════════════════
// UI COMPONENTS
// ════════════════════════════════════════════════════════════

function CategoryAccentBar({ category }: { category: string }) {
  let color = EMERALD;
  if (category === "flash-sale") color = FLASH_RED;
  if (category === "group-buy") color = "#3b82f6";
  if (category === "swap") color = "#8b5cf6";
  if (category === "jobs") color = "#1e293b"; // Dark premium slate
  if (category === "volunteer") color = "#ec4899"; // Pink for NP

  return (
    <Box sx={{ width: "100%", height: 4, background: `linear-gradient(90deg, ${color} 0%, transparent 100%)` }} />
  );
}

function ListingCard({ listing, isGrid = false, onDraftClick }: { listing: TradeListing, isGrid?: boolean, onDraftClick?: (id: string) => void }) {
  const router = useRouter();
  
  return (
    <Paper
      elevation={0}
      onClick={() => {
        if (listing.status === 'draft' && onDraftClick) {
          onDraftClick(listing.id);
        } else {
          router.push(`/society/trade/${listing.id}`);
        }
      }}
      sx={{
        ...glassCard,
        minWidth: isGrid ? 0 : { xs: 280, sm: 300 },
        maxWidth: isGrid ? '100%' : 320,
        width: isGrid ? '100%' : 'auto',
        scrollSnapAlign: "start",
        flexShrink: 0,
        cursor: "pointer",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 32px ${alpha(EMERALD, 0.15)}`,
          borderColor: alpha(EMERALD, 0.3),
        }
      }}
    >
      {/* Image */}
      <Box sx={{ height: 160, position: "relative", bgcolor: alpha(EMERALD, 0.05) }}>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: listing.imageUrl ? `url(${listing.imageUrl})` : `linear-gradient(135deg, ${alpha(EMERALD, 0.6)} 0%, ${alpha('#3b82f6', 0.6)} 100%)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Avatar / Organization Logo Overlay */}
        <Box sx={{ position: "absolute", bottom: 12, right: 12 }}>
          <Avatar 
            src={listing.postedBy?.avatarUrl || ""}
            sx={{ 
              width: 48, height: 48, 
              border: "3px solid #fff", 
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              bgcolor: alpha(EMERALD, 0.9), 
              color: "#fff", 
              fontWeight: 800 
            }}
          >
            {listing.postedBy?.name?.charAt(0) || "U"}
          </Avatar>
        </Box>
        {listing.urgency === "expiring" && (
          <Chip
            icon={<BoltIcon sx={{ fontSize: 14 }} />}
            label="EXPIRING SOON"
            size="small"
            sx={{
              position: "absolute", top: 12, left: 12,
              bgcolor: FLASH_RED, color: "#fff", fontWeight: 800, fontSize: "0.7rem",
              "& .MuiChip-icon": { color: "#fff" }
            }}
          />
        )}
      </Box>

      <CategoryAccentBar category={listing.category} />

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
           <Typography variant="caption" sx={{ color: EMERALD_DARK, fontWeight: 700, textTransform: "uppercase" }}>
             {listing.category.replace("-", " ")}
           </Typography>
           <Typography variant="caption" color="text.secondary">
             2h ago
           </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 1, color: "#000" }}>
          {listing.title}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {listing.description}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <Box>
             <Typography variant="h6" sx={{ fontWeight: 900, color: EMERALD_DARK, lineHeight: 1 }}>
               {listing.priceOrAsk}
             </Typography>
             <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
               <LocationIcon sx={{ fontSize: 12, color: "text.secondary" }} />
               <Typography variant="caption" color="text.secondary">{listing.location}</Typography>
             </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

function HorizontalScrollRow({ title, emoji, items, onDraftClick }: { title: string, emoji: string, items: any[], onDraftClick?: (id: string) => void }) {
  if (!items || items.length === 0) return null;
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, px: { xs: 2, md: 4 } }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#000" }}>
          {emoji} {title}
        </Typography>
        <Button sx={{ color: EMERALD_DARK, fontWeight: 700, fontSize: "0.8rem" }}>View All</Button>
      </Box>
      <Box
        sx={{
          display: "flex", gap: 2, overflowX: "auto", pb: 2, px: { xs: 2, md: 4 }, scrollSnapType: "x mandatory",
          "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none",
        }}
      >
        {items.map((item) => (
          <ListingCard key={item.id} listing={item} onDraftClick={onDraftClick} />
        ))}
      </Box>
    </Box>
  );
}

function GridScrollRow({ items, onDraftClick }: { items: any[], onDraftClick?: (id: string) => void }) {
  if (!items || items.length === 0) return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 8, textAlign: 'center' }}>
      <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>No listings found in this category.</Typography>
    </Box>
  );
  return (
    <Box sx={{ px: { xs: 2, md: 4 }, pb: 8 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 3 }}>
        {items.map(item => <ListingCard key={item.id} listing={item} isGrid={true} onDraftClick={onDraftClick} />)}
      </Box>
    </Box>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════

export default function TradePage() {
  const { profile } = useSociety();
  const [isFlipped, setIsFlipped] = useState(false);
  const [postingAs, setPostingAs] = useState<'personal' | 'organization'>('personal');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  // Dashboard / Form State
  const [drafts, setDrafts] = useState<any[]>([]);
  const [feedListings, setFeedListings] = useState<any[]>(MOCK_LISTINGS);

  const fetchListings = () => {
    const userId = profile?.uid || profile?.id;
    if (userId) {
      getUserDrafts(userId).then(res => {
        if (res.success && res.drafts) {
          setDrafts(res.drafts);
        }
      });
    }
    // Fetch actual db listings for jobs and volunteering
    getTradeListings({ categories: ['jobs', 'volunteer'] }).then(res => {
      if (res.success && res.listings) {
        setFeedListings(prev => {
          const others = prev.filter((l: any) => l.category !== 'jobs' && l.category !== 'volunteer');
          return [...others, ...res.listings];
        });
      }
    });
  };

  useEffect(() => {
    fetchListings();
  }, [profile?.uid, profile?.id]);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [createCategory, setCreateCategory] = useState<string>('');
  const [createSelections, setCreateSelections] = useState<{ primary: string, secondary: string, tertiary?: string } | null>(null);
  const [fastIngestPayload, setFastIngestPayload] = useState<any>(null);
  const [sessionKey, setSessionKey] = useState(0);
  
  const [activeTab, setActiveTab] = useState("All Listings");
  const [searchOpen, setSearchOpen] = useState(false);
  const tabRefs = useRef(new Map<string, HTMLDivElement | null>());
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const tab = tabRefs.current.get(activeTab);
      if (tab) {
        tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const FILTERS = ["All Listings", "Flash Sales", "Group-Buy", "Swaps", "Paid Jobs", "Internships", "Volunteer (NP)"];

  const FrontContent = (
    <Paper elevation={0} sx={sharedPaperSx}>
      {/* Header Mini Container */}
      <Box sx={{ 
        px: { xs: 1, md: 2 }, 
        pt: isScrolled ? { xs: 1, md: 1 } : { xs: 1, md: 2 }, 
        mb: isScrolled ? 1 : 3,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
      }}>
        <Paper elevation={0} sx={{ 
          p: isScrolled ? { xs: 1.5, md: 2 } : { xs: 2.5, md: 4 }, 
          borderRadius: { xs: '20px', md: '28px' }, 
          background: `linear-gradient(135deg, ${alpha(EMERALD, 0.04)} 0%, ${alpha(EMERALD, 0.12)} 100%)`, 
          backdropFilter: 'blur(16px)',
          border: `1px solid ${alpha(EMERALD, 0.15)}`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.8), 0 ${isScrolled ? 4 : 8}px ${isScrolled ? 16 : 32}px ${alpha(EMERALD, 0.06)}`,
          display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: isScrolled ? 1.5 : 3,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <Box>
            <Typography variant={isScrolled ? "h6" : "h5"} sx={{ fontWeight: 900, color: "#000", transition: 'all 0.4s ease' }}>
              Marketplace & Opportunities
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: "text.secondary", mt: 0.5, fontWeight: 500,
                maxHeight: isScrolled ? 0 : 50, opacity: isScrolled ? 0 : 1, overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}
            >
              Access flash sales, community group-buys, resource swaps, and discover paid or volunteer roles.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'stretch', md: 'flex-end' }, gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsFlipped(true)}
              sx={{
                background: `linear-gradient(135deg, ${EMERALD} 0%, ${EMERALD_DARK} 100%)`,
                color: "#ffffff",
                fontWeight: 800,
                borderRadius: "14px",
                textTransform: "none",
                boxShadow: `0 4px 12px ${alpha(EMERALD, 0.3)}`,
                flexShrink: 0,
                px: isScrolled ? 2 : 3, py: isScrolled ? 0.8 : 1.2,
                "&:hover": { background: `linear-gradient(135deg, ${EMERALD_DARK} 0%, #047857 100%)`, transform: 'translateY(-1px)' },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                width: { xs: '100%', md: 'auto' }
              }}
            >
              Post Listing
            </Button>
            
            {!isScrolled && drafts.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1, width: '100%', alignItems: { xs: 'stretch', md: 'flex-end' } }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: EMERALD_DARK, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {drafts.length} Active Draft{drafts.length === 1 ? '' : 's'}
                </Typography>
                {drafts.slice(0, 3).map((draft: any) => (
                  <Box 
                    key={draft.id}
                    onClick={() => { setIsFlipped(true); setSelectedDraftId(draft.id); }}
                    sx={{ 
                      display: 'flex', alignItems: 'center', gap: 1, p: 1, borderRadius: '8px', 
                      cursor: 'pointer', bgcolor: 'rgba(255,255,255,0.5)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      '&:hover': { bgcolor: '#fff', borderColor: alpha(EMERALD, 0.3), transform: { md: 'translateX(-4px)', xs: 'translateX(4px)' } },
                      transition: 'all 0.2s', width: { xs: '100%', md: '220px' }
                    }}
                  >
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: EMERALD, boxShadow: `0 0 8px ${EMERALD}`, flexShrink: 0 }} />
                    <Typography sx={{ 
                      fontSize: '0.75rem', fontWeight: 700, color: '#334155', 
                      noWrap: true, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' 
                    }}>
                      {draft.title || "Untitled Draft"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Filter Segmented Menu */}
      <Box sx={{ 
        px: { xs: 2, md: 4 }, 
        mb: isScrolled ? 2 : 4, 
        display: 'flex', alignItems: 'center',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <IconButton 
          onClick={() => setSearchOpen(!searchOpen)}
          sx={{ 
            mr: 1, width: 44, height: 44, flexShrink: 0,
            color: searchOpen ? EMERALD : 'text.secondary',
            bgcolor: searchOpen ? alpha(EMERALD, 0.15) : 'transparent',
            '&:hover': { color: EMERALD, transform: 'scale(1.05)', bgcolor: alpha(EMERALD, 0.2) }
          }}
        >
          {searchOpen ? <CloseIcon /> : <SearchIcon />}
        </IconButton>

        <Box sx={{ flex: 1, overflowX: "auto", display: 'flex', alignItems: 'center', gap: 0.5, py: 2, px: 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          {FILTERS.map((filter, index) => {
            const isActive = activeTab === filter;
            const isFirst = index === 0;
            const isLast = index === FILTERS.length - 1;
            
            return (
              <Box
                key={filter}
                ref={(el) => { tabRefs.current.set(filter, el as HTMLDivElement | null); }}
                onClick={() => setActiveTab(filter)}
                sx={{
                  px: isActive ? 4 : 3, py: 1.25, position: 'relative', zIndex: 2,
                  color: isActive ? 'white' : EMERALD,
                  cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 700, fontSize: '0.85rem',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: isActive 
                    ? '999px !important' 
                    : (isFirst 
                        ? '999px 12px 12px 999px !important' 
                        : isLast 
                            ? '12px 999px 999px 12px !important' 
                            : '12px !important'),
                  background: isActive 
                      ? `linear-gradient(135deg, ${EMERALD} 0%, ${EMERALD_DARK} 100%)` 
                      : alpha(EMERALD, 0.08),
                  boxShadow: isActive ? `0 4px 12px ${alpha(EMERALD, 0.3)}` : 'none',
                  '&:hover': { 
                      color: isActive ? 'white' : EMERALD_DARK,
                      background: isActive ? `linear-gradient(135deg, ${EMERALD} 0%, ${EMERALD_DARK} 100%)` : alpha(EMERALD, 0.15),
                  }
                }}
              >
                {filter}
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box 
        sx={{ flex: 1, overflowY: 'auto' }}
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          if (target.scrollTop > 30) {
            if (!isScrolled) setIsScrolled(true);
          } else {
            if (isScrolled) setIsScrolled(false);
          }
        }}
      >
        {activeTab === "All Listings" ? (
          <>
            <HorizontalScrollRow title="Urgent Flash Sales" emoji="🚨" items={feedListings.filter(l => l.category === "flash-sale")} />
            <HorizontalScrollRow title="Paid Opportunities" emoji="💰" items={feedListings.filter(l => l.category === "jobs" && l.metadata?.commitment !== 'volunteer' && l.metadata?.commitment !== 'internship')} />
            <HorizontalScrollRow title="Internships" emoji="🎓" items={feedListings.filter(l => l.category === "jobs" && l.metadata?.commitment === 'internship')} />
            <HorizontalScrollRow title="Volunteer & Earn NP" emoji="🤝" items={feedListings.filter(l => l.category === "volunteer" || (l.category === "jobs" && l.metadata?.commitment === 'volunteer'))} />
            <HorizontalScrollRow title="Community Group-Buys" emoji="🛒" items={feedListings.filter(l => l.category === "group-buy")} />
            <HorizontalScrollRow title="Barter & Swaps" emoji="♻️" items={feedListings.filter(l => l.category === "swap")} />
            <Box sx={{ height: { xs: 80, md: 24 } }} />
          </>
        ) : (
          <>
            {activeTab === "Flash Sales" && <GridScrollRow items={feedListings.filter(l => l.category === "flash-sale")} />}
            {activeTab === "Paid Jobs" && <GridScrollRow items={feedListings.filter(l => l.category === "jobs" && l.metadata?.commitment !== 'volunteer' && l.metadata?.commitment !== 'internship')} />}
            {activeTab === "Internships" && <GridScrollRow items={feedListings.filter(l => l.category === "jobs" && l.metadata?.commitment === 'internship')} />}
            {activeTab === "Volunteer (NP)" && <GridScrollRow items={feedListings.filter(l => l.category === "volunteer" || (l.category === "jobs" && l.metadata?.commitment === 'volunteer'))} />}
            {activeTab === "Group-Buy" && <GridScrollRow items={feedListings.filter(l => l.category === "group-buy")} />}
            {activeTab === "Swaps" && <GridScrollRow items={feedListings.filter(l => l.category === "swap")} />}
          </>
        )}
      </Box>
    </Paper>
  );

  const BackContent = (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        m: { xs: 1, md: 2 },
        minHeight: 0,
        height: { xs: 'calc(100% - 16px)', md: 'calc(100% - 32px)' },
        bgcolor: '#ffffff',
        borderRadius: 4,
        boxShadow: { xs: '0 8px 32px rgba(0,0,0,0.06)', md: '0 10px 40px rgba(0,0,0,0.04)' },
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Premium Gradient Header Bar */}
      <Box sx={{ height: 4, width: '100%', background: `linear-gradient(90deg, ${EMERALD} 0%, ${EMERALD_DARK} 50%, #7c3aed 100%)`, flexShrink: 0, transition: 'background 0.5s ease' }} />
      <Box
        sx={{
          px: { xs: 2.5, md: 3.5 },
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          flexShrink: 0,
        }}
      >
        <Tooltip title={(!selectedDraftId || selectedDraftId === null) && selectedDraftId !== 'new' ? "Close Studio" : "Back to Dashboard"}>
          <IconButton
            onClick={() => {
              if ((!selectedDraftId || selectedDraftId === null) && selectedDraftId !== 'new') {
                setIsFlipped(false);
              } else {
                setCreateCategory('');
                setSelectedDraftId(null);
              }
            }}
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'rgba(0,0,0,0.03)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ opacity: 0.5 }}>Studio</span>
            <span style={{ opacity: 0.5 }}>/</span>
            <span style={{ textTransform: 'capitalize' }}>
              {(!selectedDraftId || selectedDraftId === null) && selectedDraftId !== 'new' ? 'Overview' : (selectedDraftId === 'new' ? `Create ${createSelections?.primary || createCategory || 'Listing'}` : 'Edit Listing')}
            </span>
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', fontWeight: 600, mt: 0.2 }}>
            Publishing as {postingAs === 'personal' ? (profile?.displayName || 'Unknown') : (profile?.organizations?.find(o => o.id === selectedOrgId)?.name || 'Organization')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Post as Personal">
            <IconButton 
              onClick={() => setPostingAs('personal')}
              sx={{ 
                bgcolor: postingAs === 'personal' ? 'rgba(0,0,0,0.04)' : 'transparent', 
                width: 36, height: 36,
                border: postingAs === 'personal' ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' }
              }}
            >
              <Avatar src={profile?.avatarUrl} sx={{ width: 24, height: 24 }} />
            </IconButton>
          </Tooltip>

          {profile?.organizations && profile.organizations.length > 0 && (
            <Tooltip title="Post as Organization">
              <IconButton 
                onClick={() => setPostingAs('organization')}
                sx={{ 
                  bgcolor: postingAs === 'organization' ? 'rgba(0,0,0,0.04)' : 'transparent', 
                  width: 36, height: 36,
                  border: postingAs === 'organization' ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' }
                }}
              >
                <BusinessIcon sx={{ color: postingAs === 'organization' ? '#0f172a' : '#94a3b8', fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          )}

          {postingAs === 'organization' && profile?.organizations && profile.organizations.length > 0 && (
            <Select
              size="small"
              value={selectedOrgId || profile.organizations[0]?.id || ''}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              renderValue={(selected) => {
                const org = profile.organizations?.find((o: any) => o.id === selected);
                if (!org) return null;
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={org.logoUrl} sx={{ width: 20, height: 20 }} />
                    <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 700, fontSize: '0.85rem' }}>
                      {org.name}
                    </Typography>
                  </Box>
                );
              }}
              sx={{
                ml: 0.5,
                height: 36,
                minWidth: { xs: 60, sm: 140 },
                borderRadius: '12px',
                bgcolor: 'rgba(0,0,0,0.02)',
                '& .MuiOutlinedInput-notchedOutline': { border: '1px solid rgba(0,0,0,0.08)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { border: '1px solid rgba(0,0,0,0.15)' },
                '& .MuiSelect-select': { py: 0, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700, fontSize: '0.85rem' }
              }}
            >
              {profile.organizations.map((org: any) => (
                <MenuItem key={org.id} value={org.id} sx={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Avatar src={org.logoUrl} sx={{ width: 20, height: 20 }} />
                  {org.name}
                </MenuItem>
              ))}
            </Select>
          )}
        </Box>
      </Box>

      {/* Dashboard vs Form Body */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {(!selectedDraftId || selectedDraftId === null) && selectedDraftId !== 'new' ? (
          <ListingStudioDashboard
            userName={
              profile?.firstName 
                ? `${profile.prefixes && profile.prefixes.length > 0 ? profile.prefixes.join(' ') + ' ' : ''}${profile.firstName}`
                : (profile?.displayName ? profile.displayName.split(' ')[0] : 'Creative')
            }
            drafts={drafts}
            onStartFresh={(category, selections, ingestData) => {
              setCreateCategory(category);
              if (selections) setCreateSelections(selections);
              setFastIngestPayload(ingestData || null);
              setSelectedDraftId('new');
              setSessionKey(prev => prev + 1);
            }}
            onEditDraft={(draftId) => {
              setSelectedDraftId(draftId);
            }}
            onDeleteDraft={async (draftId) => {
              const userId = profile?.uid || profile?.id;
              if (userId) {
                const res = await deleteTradeListing(draftId, userId);
                if (res.success) {
                  setDrafts(drafts.filter((d: any) => d.id !== draftId));
                }
              }
            }}
          />
        ) : (
          <CreateListingForm 
            key={sessionKey}
            draftData={selectedDraftId !== 'new' ? drafts.find((d: any) => d.id === selectedDraftId) : undefined}
            initialCategory={selectedDraftId !== 'new' ? drafts.find((d: any) => d.id === selectedDraftId)?.category : createCategory}
            initialSelections={selectedDraftId !== 'new' ? drafts.find((d: any) => d.id === selectedDraftId)?.metadata?.selections : createSelections}
            onCancel={() => {
              setCreateCategory('');
              setCreateSelections(null);
              setFastIngestPayload(null);
              setSelectedDraftId(null);
            }}
            onSuccess={() => {
              setIsFlipped(false);
              fetchListings();
            }}
            postingAs={postingAs}
            selectedOrgId={selectedOrgId || (profile?.organizations?.[0]?.id ?? null)}
            fastIngestData={selectedDraftId === 'new' ? fastIngestPayload : undefined}
          />
        )}
      </Box>
    </Paper>
  );

  return (
    <Suspense fallback={<Skeleton variant="rounded" width="100%" height={400} sx={{ borderRadius: "20px" }} />}>
      <FlipContainer 
        isFlipped={isFlipped}
        frontContent={FrontContent}
        backContent={BackContent}
      />
    </Suspense>
  );
}
