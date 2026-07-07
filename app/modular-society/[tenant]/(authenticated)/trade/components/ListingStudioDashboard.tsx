import React, { useState } from 'react';
import { Box, Typography, Paper, Chip, IconButton, alpha, Tooltip, Button } from '@mui/material';
import {
  Add as AddIcon,
  Minimize as MinimizeIcon,
  Storefront as StorefrontIcon,
  VolunteerActivism as VolunteerIcon,
  FlashOn as FlashIcon,
  Handshake as HandshakeIcon,
  SwapHoriz as SwapIcon,
  DeleteOutlined as DeleteOutlineIcon,
  Edit as EditIcon,
  ArrowForward as ArrowForwardArrow
} from '@mui/icons-material';

const EMERALD = "#10b981";

const LISTING_OPTIONS = [
  {
    type: 'jobs', title: "Paid Jobs", desc: "Hire talent or post work opportunities.",
    icon: <StorefrontIcon sx={{ fontSize: 32 }} />, color: "#1e293b", grad: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", emoji: "👷"
  },
  {
    type: 'flash-sale', title: "Flash Sale", desc: "Sell perishable goods quickly.",
    icon: <FlashIcon sx={{ fontSize: 32 }} />, color: "#ef4444", grad: "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)", emoji: "⚡"
  },
  {
    type: 'group-buy', title: "Group-Buy", desc: "Pool resources to share costs.",
    icon: <HandshakeIcon sx={{ fontSize: 32 }} />, color: "#3b82f6", grad: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)", emoji: "🤝"
  },
  {
    type: 'swap', title: "Swap/Barter", desc: "Trade goods directly without cash.",
    icon: <SwapIcon sx={{ fontSize: 32 }} />, color: "#8b5cf6", grad: "linear-gradient(135deg, #5b21b6 0%, #8b5cf6 100%)", emoji: "♻️"
  },
  {
    type: 'opportunities', title: "Opportunities", desc: "Grants, RFPs, fellowships.",
    icon: <VolunteerIcon sx={{ fontSize: 32 }} />, color: "#10b981", grad: "linear-gradient(135deg, #065f46 0%, #10b981 100%)", emoji: "💡"
  }
];

export default function ListingStudioDashboard({
  drafts = [],
  onStartFresh,
  onEditDraft,
  onDeleteDraft,
  userName
}: {
  drafts: any[];
  onStartFresh: (category: string) => void;
  onEditDraft: (draftId: string) => void;
  onDeleteDraft: (draftId: string) => void;
  userName?: string;
}) {
  const [expandedStartType, setExpandedStartType] = useState<string | null>(null);

  const activeOption = LISTING_OPTIONS.find(o => o.type === expandedStartType);

  const handleOpenCreator = (type: string) => {
    setExpandedStartType(type);
  };

  const handleClose = () => {
    setExpandedStartType(null);
  };

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Morning' : currentHour < 18 ? 'Afternoon' : 'Evening';

  return (
    <Box sx={{
      p: { xs: 2, sm: 4, md: 6, lg: 8 }, mx: 'auto', width: '100%', flex: 1, overflowY: 'auto',
      background: 'radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 40%)',
    }}>
      {/* Greeting */}
      <Box sx={{ mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Typography variant="h3" sx={{ fontFamily: 'Caveat, cursive', color: EMERALD, mb: 1 }}>
          Good {greeting}, {userName || 'Creative'}.
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', mb: 1.5, color: '#1e293b' }}>
          Welcome to the Studio
        </Typography>
        <Chip
          label={`${drafts.length} active draft${drafts.length !== 1 ? 's' : ''} in your workspace`}
          size="small"
          sx={{ bgcolor: 'rgba(0,0,0,0.04)', color: 'text.secondary', fontWeight: 600, borderRadius: '8px' }}
        />
      </Box>

      {/* ================================================================ */}
      {/* START FRESH SECTION                                              */}
      {/* ================================================================ */}

      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>
        Start Fresh
      </Typography>

      <Box sx={{
        display: 'flex', 
        gap: expandedStartType ? 0 : 3, 
        overflowX: expandedStartType ? 'visible' : 'auto', 
        pt: 1, pb: expandedStartType ? 0 : 5, mb: 2,
        '&::-webkit-scrollbar': { height: 0 }, 
        px: expandedStartType ? 0 : 0.5, 
        mx: expandedStartType ? 0 : -0.5,
        transition: 'gap 0.4s ease, padding 0.4s ease, margin 0.4s ease'
      }}>
        {LISTING_OPTIONS.map((opt) => {
          const isExpanded = expandedStartType === opt.type;
          const isHidden = expandedStartType !== null && expandedStartType !== opt.type;

          return (
            <Paper
              key={opt.type}
              onClick={() => {
                if (!expandedStartType) handleOpenCreator(opt.type);
              }}
              elevation={0}
              sx={{
                flex: isHidden ? '0 0 0%' : (isExpanded ? '0 0 100%' : '0 0 auto'),
                minWidth: isHidden ? 0 : (isExpanded ? '100%' : 280),
                maxWidth: isHidden ? 0 : (isExpanded ? '100%' : 280),
                height: isExpanded ? 'auto' : (isHidden ? 0 : 320),
                opacity: isHidden ? 0 : 1,
                p: isExpanded ? 0 : (isHidden ? 0 : 3.5),
                display: 'flex', flexDirection: 'column', gap: 2,
                borderRadius: '28px', cursor: isExpanded ? 'default' : 'pointer',
                background: isExpanded ? `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)` : opt.grad,
                border: isHidden ? 'none' : '1px solid rgba(255,255,255,0.15)',
                boxShadow: isHidden ? 'none' : `inset 0 2px 10px rgba(255,255,255,0.2), 0 10px 30px ${alpha(opt.color, 0.25)}`,
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                '&:hover': !isExpanded ? {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: `inset 0 2px 10px rgba(255,255,255,0.3), 0 24px 48px ${alpha(opt.color, 0.4)}`,
                  borderColor: 'rgba(255,255,255,0.3)',
                  '& .sf-icon': { transform: 'scale(1.1) rotate(-5deg)', bgcolor: 'rgba(255,255,255,0.3)' }
                } : {}
              }}
            >
              {!isExpanded ? (
                <>
                  <Box sx={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.12, transform: 'scale(4)', pointerEvents: 'none', color: '#fff' }}>
                    {opt.icon}
                  </Box>
                  <Box className="sf-icon" sx={{
                    p: 1.5, borderRadius: '18px', bgcolor: 'rgba(255,255,255,0.18)',
                    color: '#fff', width: 'fit-content',
                    backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)',
                    transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  }}>
                    {opt.icon}
                  </Box>
                  <Box sx={{ position: 'relative', zIndex: 1, mt: 1 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', mb: 0.5, color: '#fff', letterSpacing: '-0.02em' }}>
                      {opt.emoji} {opt.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, fontWeight: 500 }}>
                      {opt.desc}
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box sx={{ p: 4, width: '100%', height: 'auto', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  {/* Container Header & Minimize Button */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                        {opt.icon}
                      </Box>
                      <Box>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                          {opt.title} Setup
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', mt: 0.5 }}>
                          Ready to create?
                        </Typography>
                      </Box>
                    </Box>
                    <Tooltip title="Minimize">
                      <IconButton onClick={(e) => { e.stopPropagation(); handleClose(); }} sx={{ color: 'rgba(255,255,255,0.8)', bgcolor: 'rgba(0,0,0,0.15)', '&:hover': { bgcolor: 'rgba(0,0,0,0.3)', color: '#fff' } }}>
                        <MinimizeIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
                    <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
                        Start a new {opt.title} listing
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 4 }}>
                        {opt.desc} You'll be able to add images, location, pricing, and all the relevant details in the next step.
                      </Typography>
                      
                      <Button
                        variant="contained"
                        onClick={() => onStartFresh(opt.type)}
                        endIcon={<ArrowForwardArrow />}
                        sx={{
                          bgcolor: opt.color,
                          color: '#fff',
                          fontWeight: 800,
                          px: 4, py: 1.5,
                          borderRadius: '16px',
                          textTransform: 'none',
                          fontSize: '1.05rem',
                          boxShadow: `0 8px 24px ${alpha(opt.color, 0.4)}`,
                          '&:hover': { bgcolor: opt.color, filter: 'brightness(1.1)', transform: 'translateY(-2px)' },
                          transition: 'all 0.2s'
                        }}
                      >
                        Start Listing
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
            </Paper>
          );
        })}
      </Box>

      {/* ================================================================ */}
      {/* YOUR DRAFTS SECTION                                              */}
      {/* ================================================================ */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>
          Your Drafts
        </Typography>

        {drafts.length === 0 ? (
          <Box sx={{ 
            p: 4, borderRadius: '20px', border: '2px dashed rgba(0,0,0,0.06)', 
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            bgcolor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)'
          }}>
            <Typography sx={{ fontWeight: 700, color: '#94a3b8', mb: 1 }}>No active drafts</Typography>
            <Typography variant="body2" sx={{ color: '#cbd5e1' }}>Select a format above to start a new listing.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {drafts.map((draft) => {
              const opt = LISTING_OPTIONS.find(o => o.type === draft.category) || LISTING_OPTIONS[0];
              return (
                <Paper key={draft.id} elevation={0} sx={{
                  p: 2.5, borderRadius: '20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
                  backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' },
                  flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 }
                }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%' }}>
                    <Box sx={{ 
                      width: 48, height: 48, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: opt.grad, color: '#fff', flexShrink: 0, boxShadow: `0 4px 12px ${alpha(opt.color, 0.3)}`
                    }}>
                      {opt.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Chip label={opt.title} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: alpha(opt.color, 0.1), color: opt.color }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#FF416C', animation: 'pulseGlow 2s infinite' }} />
                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#FF416C', letterSpacing: '0.05em' }}>IN PROGRESS</Typography>
                        </Box>
                      </Box>
                      <Typography sx={{ fontWeight: 800, color: '#1e293b', fontSize: '1.05rem', lineHeight: 1.3, mb: 0.5 }}>
                        {draft.title || 'Untitled Listing'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                        Last edited {draft.lastEdited || 'recently'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                      <IconButton onClick={() => onDeleteDraft(draft.id)} sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.05)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}>
                        <DeleteOutlineIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                      <Button
                        variant="contained"
                        onClick={() => onEditDraft(draft.id)}
                        endIcon={<ArrowForwardArrow />}
                        sx={{
                          bgcolor: '#1e293b', color: '#fff', borderRadius: '12px', fontWeight: 700, px: 2, py: 1, textTransform: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          '&:hover': { bgcolor: '#0f172a' }
                        }}
                      >
                        Resume
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>

    </Box>
  );
}
