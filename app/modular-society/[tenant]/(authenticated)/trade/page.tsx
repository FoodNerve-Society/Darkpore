// @ts-nocheck
"use client";

import React, { useState, Suspense, useRef, useEffect } from "react";
import {
  Box,
  Card,
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
  AccessTime as AccessTimeIcon,
  ArrowForward as ArrowForwardIcon,
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
import { getUserDrafts, deleteTradeListing, getTradeListings, getUserPublishedListings, getOrgTradeListings } from "@/lib/actions/trade";
import PremiumAutocomplete from "@/components/PremiumAutocomplete";

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
  m: { xs: 0.5, sm: 1, md: 2 },
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
    title: "Swap: Logistics Van for Cold Storage Space",
    description: "I have a delivery van available 3 days a week. Looking to swap for cold storage space.",
    priceOrAsk: "Value Exchange",
    location: "Surulere",
    lga: "Surulere",
    postedBy: { name: "Transit Pro", avatarUrl: "", isVerified: false },
    postedAt: new Date().toISOString(),
    urgency: "normal",
    status: "active",
    isBoosted: false,
  },
  {
    id: "l4",
    category: "jobs",
    title: "Senior Agronomist (Full-Time)",
    description: "Leading a 50-hectare cassava project.",
    priceOrAsk: "₦350,000 / month",
    location: "Epe Farm Settlement",
    lga: "Epe",
    postedBy: { name: "AgriCorp Nig", avatarUrl: "", isVerified: true },
    postedAt: new Date().toISOString(),
    urgency: "normal",
    status: "active",
    isBoosted: true,
  },
  {
    id: "l5",
    category: "volunteer",
    title: "Market Data Collector (Weekend)",
    description: "Help us track tomato prices at Mile 12. Earn NP points.",
    priceOrAsk: "250 NP / Shift",
    location: "Mile 12",
    lga: "Kosofe",
    postedBy: { name: "FoodNerve Foundation", avatarUrl: "", isVerified: true },
    postedAt: new Date().toISOString(),
    urgency: "normal",
    status: "active",
    isBoosted: false,
  },
];

// ════════════════════════════════════════════════════════════
// UI COMPONENTS
// ════════════════════════════════════════════════════════════

function getJobColor(cat: string) {
  if (cat === "volunteer") return "#ec4899"; // Pink for NP Volunteering
  if (cat === "internship" || cat === "internships") return "#3b82f6"; // Blue for Internships
  return "#10b981"; // Emerald for Jobs
}

function getMarketplaceColor(cat: string) {
  if (cat === "flash-sale") return FLASH_RED;
  if (cat === "group-buy") return "#3b82f6";
  if (cat === "swap") return "#8b5cf6";
  return EMERALD;
}

// ── 1. JOB / HUMAN CAPITAL CARD (.com Hero Design) ──────────
function JobListingCard({ listing, isGrid = false, onDraftClick }: { listing: TradeListing, isGrid?: boolean, onDraftClick?: (id: string) => void }) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const isDraft = listing.status === 'draft';
  const displayTitle = listing.title || 'Untitled Draft';
  
  const categoryColor = getJobColor(listing.category);
  const posterName = listing.postedBy?.name || listing.organization?.name || 'FoodNerve Operator';
  const avatarUrl = listing.postedBy?.avatarUrl || listing.organization?.logoUrl || listing.companyLogo || '';
  const initial = posterName.charAt(0).toUpperCase() || 'O';
  
  const categoryLabel = listing.category === 'volunteer' ? 'VOLUNTEER (NP)' :
                        (listing.category === 'internship' || listing.category === 'internships') ? 'INTERNSHIP' :
                        'JOB';

  return (
    <Card
      variant="outlined"
      onClick={() => {
        if (isDraft && onDraftClick) {
          onDraftClick(listing.id);
        } else {
          router.push(`/trade/${listing.id}`);
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        minWidth: isGrid ? 0 : { xs: '80vw', sm: 290, md: 320 },
        maxWidth: isGrid ? '100%' : { xs: '82vw', sm: 330, md: 340 },
        width: isGrid ? '100%' : 'auto',
        scrollSnapAlign: "start",
        flexShrink: 0,
        cursor: "pointer",
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        boxShadow: isHovered 
          ? `0 20px 40px -8px ${categoryColor}30, 0 0 0 1px ${categoryColor}40` 
          : '0 4px 20px -4px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.05)',
        transform: isHovered ? 'translateY(-6px)' : 'none',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        p: { xs: 2.5, sm: 3 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, #ffffff 10%, ${categoryColor}12 100%)`,
      }}
    >
      <Box>
        {/* Top Row: Organization Avatar + Category Pill */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
          {avatarUrl ? (
            <Box
              sx={{
                p: 0.6,
                borderRadius: '12px',
                bgcolor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Box
                component="img"
                src={avatarUrl}
                alt={posterName}
                sx={{
                  maxHeight: 34,
                  maxWidth: 75,
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </Box>
          ) : (
            <Avatar
              sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: `${categoryColor}15`, 
                color: categoryColor, 
                fontWeight: 900, 
                borderRadius: '10px' 
              }}
            >
              {initial}
            </Avatar>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {listing.urgency === 'expiring' && (
              <Chip
                icon={<BoltIcon sx={{ fontSize: 12, color: `${FLASH_RED} !important` }} />}
                label="URGENT"
                size="small"
                sx={{
                  bgcolor: `${FLASH_RED}15`,
                  color: FLASH_RED,
                  fontWeight: 900,
                  fontSize: '0.62rem',
                  height: 24,
                  borderRadius: '6px',
                  letterSpacing: '0.04em',
                  boxShadow: `inset 0 0 0 1px ${FLASH_RED}30`,
                }}
              />
            )}
            <Chip
              label={categoryLabel}
              size="small"
              sx={{
                bgcolor: `${categoryColor}15`,
                color: categoryColor,
                fontWeight: 900,
                fontSize: '0.65rem',
                height: 24,
                borderRadius: '6px',
                letterSpacing: '0.05em',
                boxShadow: `inset 0 0 0 1px ${categoryColor}30`,
              }}
            />
          </Box>
        </Box>
        
        {/* Main Body: Poster Name, Title, and Metadata Pills */}
        <Box sx={{ mb: 2.5, flex: 1 }}>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, mb: 0.5, letterSpacing: '0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {posterName}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1.25, fontSize: { xs: '1.05rem', sm: '1.18rem' }, mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {displayTitle}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {listing.location && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0', px: 1.25, py: 0.4, borderRadius: '8px', color: '#475569', fontSize: '0.74rem', fontWeight: 700 }}>
                <LocationIcon sx={{ fontSize: 13, color: categoryColor }} /> {listing.location}
              </Box>
            )}
            {listing.priceOrAsk && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0', px: 1.25, py: 0.4, borderRadius: '8px', color: '#0f172a', fontSize: '0.74rem', fontWeight: 800 }}>
                💰 {listing.priceOrAsk}
              </Box>
            )}
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0', px: 1.25, py: 0.4, borderRadius: '8px', color: '#475569', fontSize: '0.74rem', fontWeight: 700 }}>
              <AccessTimeIcon sx={{ fontSize: 13, color: categoryColor }} /> {isDraft ? 'Draft' : 'Actively Open'}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Dashed Action Footer */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', pt: 2, mt: 'auto' }}>
        <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: categoryColor }}>
          {isDraft ? 'Edit Draft' : 'View Details'}
        </Typography>
        <Box sx={{ 
          width: 32, 
          height: 32, 
          borderRadius: '50%', 
          bgcolor: isHovered ? categoryColor : `${categoryColor}15`, 
          color: isHovered ? '#ffffff' : categoryColor, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          transition: 'all 0.3s ease',
          transform: isHovered ? 'translateX(3px)' : 'none',
        }}>
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </Box>
      </Box>
    </Card>
  );
}

// ── 2. MARKETPLACE CARD (Flash Sales, Group Buy, Swaps) ──────
function MarketplaceCard({ listing, isGrid = false, onDraftClick }: { listing: TradeListing, isGrid?: boolean, onDraftClick?: (id: string) => void }) {
  const router = useRouter();
  const isDraft = listing.status === 'draft';
  const displayTitle = listing.title || 'Untitled Draft';
  const color = getMarketplaceColor(listing.category);
  const posterName = listing.postedBy?.name || listing.organization?.name || 'FoodNerve Operator';
  const avatarUrl = listing.postedBy?.avatarUrl || listing.organization?.logoUrl || '';

  return (
    <Paper
      elevation={0}
      onClick={() => {
        if (isDraft && onDraftClick) {
          onDraftClick(listing.id);
        } else {
          router.push(`/trade/${listing.id}`);
        }
      }}
      sx={{
        ...glassCard,
        minWidth: isGrid ? 0 : { xs: '80vw', sm: 290, md: 320 },
        maxWidth: isGrid ? '100%' : { xs: '82vw', sm: 320 },
        width: isGrid ? '100%' : 'auto',
        scrollSnapAlign: "start",
        flexShrink: 0,
        cursor: "pointer",
        overflow: "hidden",
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#ffffff',
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 32px ${alpha(color, 0.18)}`,
          borderColor: alpha(color, 0.35),
        }
      }}
    >
      {/* Image Container with Badges & Avatar */}
      <Box sx={{ height: 160, position: "relative", bgcolor: alpha(color, 0.05) }}>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: listing.imageUrl ? `url(${listing.imageUrl})` : `linear-gradient(135deg, ${alpha(color, 0.7)} 0%, ${alpha('#3b82f6', 0.7)} 100%)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        
        {/* Poster Avatar Overlay */}
        <Box sx={{ position: "absolute", bottom: 12, right: 12 }}>
          <Avatar 
            src={avatarUrl}
            sx={{ 
              width: 44, height: 44, 
              border: "3px solid #fff", 
              boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
              bgcolor: alpha(color, 0.95), 
              color: "#fff", 
              fontWeight: 800 
            }}
          >
            {posterName.charAt(0).toUpperCase()}
          </Avatar>
        </Box>

        {/* Category-Specific Pills */}
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
        {listing.category === 'group-buy' && listing.slots && (
          <Chip
            label={`${listing.slots.filled}/${listing.slots.total} SLOTS`}
            size="small"
            sx={{
              position: "absolute", top: 12, left: 12,
              bgcolor: '#3b82f6', color: "#fff", fontWeight: 800, fontSize: "0.7rem"
            }}
          />
        )}
        {listing.category === 'swap' && (
          <Chip
            label="SWAP / BARTER"
            size="small"
            sx={{
              position: "absolute", top: 12, left: 12,
              bgcolor: '#8b5cf6', color: "#fff", fontWeight: 800, fontSize: "0.7rem"
            }}
          />
        )}
      </Box>

      {/* Accent Line */}
      <Box sx={{ width: "100%", height: 4, background: `linear-gradient(90deg, ${color} 0%, transparent 100%)` }} />

      {/* Card Details */}
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, alignItems: 'center' }}>
           <Typography variant="caption" sx={{ color, fontWeight: 800, textTransform: "uppercase", letterSpacing: '0.04em' }}>
             {listing.category.replace("-", " ")}
           </Typography>
           <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
             2h ago
           </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.25, mb: 1, color: "#0f172a", display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {displayTitle}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>
          {listing.description}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", pt: 1.5, borderTop: '1px dashed #e2e8f0' }}>
          <Box>
             <Typography variant="h6" sx={{ fontWeight: 900, color, lineHeight: 1 }}>
               {listing.priceOrAsk}
             </Typography>
             {listing.location && (
               <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.75 }}>
                 <LocationIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                 <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{listing.location}</Typography>
               </Box>
             )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

// ── 3. ROUTER / DISPATCHER ──────────────────────────────────
function ListingCard({ listing, isGrid = false, onDraftClick }: { listing: TradeListing, isGrid?: boolean, onDraftClick?: (id: string) => void }) {
  const isJobOrHumanCapital = 
    listing.category === 'jobs' || 
    listing.category === 'volunteer' || 
    listing.category === 'internships' || 
    listing.category === 'internship';
  
  if (isJobOrHumanCapital) {
    return <JobListingCard listing={listing} isGrid={isGrid} onDraftClick={onDraftClick} />;
  }
  return <MarketplaceCard listing={listing} isGrid={isGrid} onDraftClick={onDraftClick} />;
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
          display: "flex", gap: 2, overflowX: "auto", pb: 2, px: { xs: 1.5, sm: 2.5, md: 4 }, scrollSnapType: "x mandatory",
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
  const [workspaceTabs, setWorkspaceTabs] = useState<any[]>([]);
  const [feedListings, setFeedListings] = useState<any[]>(MOCK_LISTINGS);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [editingListingData, setEditingListingData] = useState<any>(null);
  const [createCategory, setCreateCategory] = useState<string>('');
  const [createSelections, setCreateSelections] = useState<{ primary: string, secondary: string, tertiary?: string } | null>(null);
  const [fastIngestPayload, setFastIngestPayload] = useState<any>(null);
  const [sessionKey, setSessionKey] = useState(0);

  const handleEditListing = async (id: string) => {
    const localDraft = drafts.find((d: any) => d.id === id);
    if (localDraft) {
      setEditingListingData(localDraft);
      if (localDraft.organizationId) {
        setPostingAs('organization');
        setSelectedOrgId(localDraft.organizationId);
      }
      setSelectedDraftId(id);
    } else {
      const { getTradeListingById } = await import('@/lib/actions/trade');
      const res = await getTradeListingById(id);
      if (res.success && res.listing) {
        setEditingListingData(res.listing);
        if (res.listing.organizationId) {
          setPostingAs('organization');
          setSelectedOrgId(res.listing.organizationId);
        }
        setSelectedDraftId(id);
      }
    }
  };

  const fetchListings = () => {
    const userId = profile?.uid || profile?.id;
    if (userId) {
      // Fetch Workspace Data
      Promise.all([
        getUserDrafts(userId),
        getUserPublishedListings(userId)
      ]).then(async ([draftsRes, publishedData]) => {
        const userDrafts = draftsRes.success ? draftsRes.drafts : [];
        const userPublished = publishedData || [];
        
        let personalItems: any[] = [
          ...userDrafts.map((d: any) => ({ id: d.id, title: d.title, type: d.category, status: d.status, date: d.postedAt, authorName: profile.displayName })),
          ...userPublished.map((p: any) => ({ id: p.id, title: p.title, type: p.category, status: p.status, date: p.postedAt, authorName: profile.displayName }))
        ];
        // Sort newest first
        personalItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        let newTabs: any[] = [{ id: 'personal', label: 'Personal', items: personalItems }];

        if (profile.organizations && profile.organizations.length > 0) {
          for (const org of profile.organizations) {
            const orgContentRes = await getOrgTradeListings(org.id);
            const orgItems: any[] = [];
            if (orgContentRes.success && orgContentRes.all) {
              orgContentRes.all.forEach((o: any) => {
                orgItems.push({
                  id: o.id, title: o.title, type: o.category, status: o.status, date: o.postedAt, authorName: o.postedById === userId ? profile.displayName : 'Team Member' 
                });
              });
            }
            newTabs.push({ id: org.id, label: org.name, logoUrl: org.logoUrl, items: orgItems });
          }
        }
        
        setWorkspaceTabs(newTabs);
        setDrafts(userDrafts);
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
                    onClick={() => { setIsFlipped(true); handleEditListing(draft.id); }}
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
            <HorizontalScrollRow title="Urgent Flash Sales" emoji="🚨" items={feedListings.filter(l => l.category === "flash-sale")} onDraftClick={(id) => { setIsFlipped(true); handleEditListing(id); }} />
            <HorizontalScrollRow title="Paid Opportunities" emoji="💰" items={feedListings.filter(l => l.category === "jobs" && l.metadata?.commitment !== 'volunteer' && l.metadata?.commitment !== 'internship')} onDraftClick={(id) => { setIsFlipped(true); handleEditListing(id); }} />
            <HorizontalScrollRow title="Internships" emoji="🎓" items={feedListings.filter(l => l.category === "jobs" && l.metadata?.commitment === 'internship')} onDraftClick={(id) => { setIsFlipped(true); handleEditListing(id); }} />
            <HorizontalScrollRow title="Volunteer & Earn NP" emoji="🤝" items={feedListings.filter(l => l.category === "volunteer" || (l.category === "jobs" && l.metadata?.commitment === 'volunteer'))} onDraftClick={(id) => { setIsFlipped(true); handleEditListing(id); }} />
            <HorizontalScrollRow title="Community Group-Buys" emoji="🛒" items={feedListings.filter(l => l.category === "group-buy")} onDraftClick={(id) => { setIsFlipped(true); handleEditListing(id); }} />
            <HorizontalScrollRow title="Barter & Swaps" emoji="♻️" items={feedListings.filter(l => l.category === "swap")} onDraftClick={(id) => { setIsFlipped(true); handleEditListing(id); }} />
            <Box sx={{ height: { xs: 80, md: 24 } }} />
          </>
        ) : (
          <>
            {activeTab === "Flash Sales" && <GridScrollRow items={feedListings.filter(l => l.category === "flash-sale")} onDraftClick={(id) => { setIsFlipped(true); handleEditListing(id); }} />}
            {activeTab === "Paid Jobs" && <GridScrollRow items={feedListings.filter(l => l.category === "jobs" && l.metadata?.commitment !== 'volunteer' && l.metadata?.commitment !== 'internship')} onDraftClick={(id) => { setIsFlipped(true); handleEditListing(id); }} />}
            {activeTab === "Internships" && <GridScrollRow items={feedListings.filter(l => l.category === "jobs" && l.metadata?.commitment === 'internship')} onDraftClick={(id) => { setIsFlipped(true); handleEditListing(id); }} />}
            {activeTab === "Volunteer (NP)" && <GridScrollRow items={feedListings.filter(l => l.category === "volunteer" || (l.category === "jobs" && l.metadata?.commitment === 'volunteer'))} onDraftClick={(id) => { setIsFlipped(true); handleEditListing(id); }} />}
            {activeTab === "Group-Buy" && <GridScrollRow items={feedListings.filter(l => l.category === "group-buy")} onDraftClick={(id) => { setIsFlipped(true); handleEditListing(id); }} />}
            {activeTab === "Swaps" && <GridScrollRow items={feedListings.filter(l => l.category === "swap")} onDraftClick={(id) => { setIsFlipped(true); handleEditListing(id); }} />}
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
                setEditingListingData(null);
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
            <Box sx={{ ml: 1, width: 240 }}>
              <PremiumAutocomplete
                colorTheme="#10b981"
                label="Select Organization"
                options={profile.organizations}
                getOptionLabel={(opt: any) => opt.name || ''}
                value={profile.organizations.find((o: any) => o.id === selectedOrgId) || profile.organizations[0] || null}
                onChange={(e, val) => setSelectedOrgId(val ? val.id : null)}
                renderOption={(props: any, opt: any) => (
                  <Box component="li" {...props} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Avatar src={opt.logoUrl} sx={{ width: 24, height: 24 }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{opt.name}</Typography>
                  </Box>
                )}
              />
            </Box>
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
            workspaceTabs={workspaceTabs}
            onStartFresh={(category, selections, ingestData) => {
              setCreateCategory(category);
              if (selections) setCreateSelections(selections);
              setFastIngestPayload(ingestData || null);
              setSelectedDraftId('new');
              setEditingListingData(null);
              setSessionKey(prev => prev + 1);
            }}
            onEditDraft={(draftId) => {
              handleEditListing(draftId);
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
            draftData={selectedDraftId !== 'new' ? (editingListingData || drafts.find((d: any) => d.id === selectedDraftId)) : undefined}
            initialCategory={selectedDraftId !== 'new' ? (editingListingData?.category || drafts.find((d: any) => d.id === selectedDraftId)?.category) : createCategory}
            initialSelections={selectedDraftId !== 'new' ? (editingListingData?.metadata?.selections || drafts.find((d: any) => d.id === selectedDraftId)?.metadata?.selections) : createSelections}
            onCancel={() => {
              setCreateCategory('');
              setCreateSelections(null);
              setFastIngestPayload(null);
              setSelectedDraftId(null);
              setEditingListingData(null);
            }}
            onSuccess={() => {
              setIsFlipped(false);
              fetchListings();
            }}
            postingAs={postingAs}
            selectedOrgId={selectedOrgId || (profile?.organizations?.[0]?.id ?? null)}
            onPostingAsChange={(val) => setPostingAs(val)}
            onOrgIdChange={(val) => setSelectedOrgId(val)}
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
