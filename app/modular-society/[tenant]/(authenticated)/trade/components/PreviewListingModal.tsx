'use client';

import * as React from 'react';
import { 
  Modal, Box, Typography, Button, IconButton, alpha, Chip, Avatar, Container, Paper, Tooltip 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedIcon from '@mui/icons-material/Verified';
import ShareIcon from '@mui/icons-material/Share';
import ShieldIcon from '@mui/icons-material/Shield';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PaymentsIcon from '@mui/icons-material/Payments';
import CategoryIcon from '@mui/icons-material/Category';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import EmailIcon from '@mui/icons-material/Email';
import { foodChallenges } from '@/lib/cms/food/challenges';

const EMERALD = "#10b981";
const PURPLE = "#7c3aed";
const BLUE = "#0284c7";

const glassCard = {
  background: "#ffffff",
  borderRadius: "24px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 20px -4px rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
};

interface PreviewListingModalProps {
  open: boolean;
  onClose: () => void;
  data: {
    title: string;
    companyName: string;
    companyLogoUrl?: string;
    category?: string;
    sector?: string;
    jobFunction?: string;
    locationString?: string;
    duration?: string;
    deadline?: string;
    startDate?: string;
    endDate?: string;
    compTypeString?: string;
    minSalary?: string;
    maxSalary?: string;
    currency?: string;
    npAmount?: string;
    description: string;
    color?: string;
    applicationMethod?: string;
    applicationUrl?: string;
    applicationEmail?: string;
    externalButtonText?: string;
    challenges?: any[];
    requireResume?: boolean;
    requireCoverLetter?: boolean;
    requirePortfolio?: boolean;
    workModel?: string;
    isExternal?: boolean;
    rank?: number;
    poster?: {
      name?: string;
      avatarUrl?: string;
      rank?: number;
      username?: string;
      role?: string;
    };
  };
}

export interface EnrichedChallenge {
  id: string;
  title: string;
  desc: string;
  imageUrl: string;
  categoryLabel: string;
  groupName?: string;
}

export function formatDeadlineRemaining(deadline?: string | Date): { text: string; hint: string } {
  if (!deadline) {
    return { text: "Actively Hiring", hint: "Open for Operators" };
  }

  let targetDate: Date | null = null;
  if (deadline instanceof Date) {
    targetDate = deadline;
  } else if (typeof deadline === 'string') {
    const trimmed = deadline.trim();
    if (!trimmed) return { text: "Actively Hiring", hint: "Open for Operators" };

    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      if (parts.length === 3) {
        targetDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T23:59:59`);
      } else {
        targetDate = new Date(trimmed);
      }
    } else {
      targetDate = new Date(trimmed.includes('T') ? trimmed : `${trimmed}T23:59:59`);
    }
  }

  if (!targetDate || isNaN(targetDate.getTime())) {
    return { text: "Actively Hiring", hint: "Open for Operators" };
  }

  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { text: "Application Closed", hint: "Deadline passed" };
  }

  const totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (totalDays <= 1) {
    const hours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));
    return { text: `${hours} hours left`, hint: "Closes today" };
  }

  if (totalDays < 60) {
    return { 
      text: `${totalDays} days left`, 
      hint: `Closes in ${totalDays} days` 
    };
  }

  if (totalDays < 365) {
    const months = Math.round(totalDays / 30);
    return { 
      text: `${months} month${months > 1 ? 's' : ''} left`, 
      hint: `Approx. ${totalDays} days remaining` 
    };
  }

  const years = (totalDays / 365).toFixed(1).replace('.0', '');
  return { 
    text: `${years} year${Number(years) > 1 ? 's' : ''} left`, 
    hint: `Approx. ${totalDays} days remaining` 
  };
}

export function getEnrichedChallenges(rawChallenges: any): EnrichedChallenge[] {
  if (!rawChallenges) return [];

  let list = rawChallenges;
  if (typeof list === 'string') {
    try {
      list = JSON.parse(list);
    } catch (e) {
      list = [list];
    }
  }

  if (!Array.isArray(list) || list.length === 0) return [];

  const allSubs = foodChallenges.flatMap(c => (c.subcategories || []).map(s => ({ ...s, parentTitle: c.title, parentId: c.id, parentImage: c.imageUrl })));

  const currentYear = new Date().getFullYear();

  return list.map(item => {
    const term = (typeof item === 'string' ? item : item.title || item.id || '').toLowerCase().trim();
    
    // Check main challenges
    const matchedC = foodChallenges.find(c => c.id.toLowerCase() === term || c.title.toLowerCase().includes(term));
    if (matchedC) {
      return {
        id: matchedC.id,
        title: matchedC.title,
        desc: matchedC.desc || matchedC.longDesc || `Prioritized agricultural bottleneck in the FoodNerve ${currentYear} Master Plan.`,
        imageUrl: matchedC.imageUrl || '/images/challenges/capital.webp',
        categoryLabel: 'Systemic Challenge',
        groupName: 'FoodNerve Pillar'
      };
    }

    // Check subcategories
    const matchedS = allSubs.find(s => s.id.toLowerCase() === term || s.shortName.toLowerCase().includes(term) || s.title.toLowerCase().includes(term));
    if (matchedS) {
      return {
        id: matchedS.id,
        title: matchedS.shortName || matchedS.title,
        desc: matchedS.desc || 'High-impact intervention domain addressing value-chain execution.',
        imageUrl: matchedS.imageUrl || matchedS.parentImage || '/images/challenges/harvest-to-market.webp',
        categoryLabel: matchedS.groupName || 'Subcategory Focus',
        groupName: matchedS.parentTitle
      };
    }

    // Fallback
    const displayTitle = typeof item === 'string' ? item : (item.title || item.label || 'Ecosystem Challenge');
    return {
      id: term || 'custom',
      title: displayTitle,
      desc: `Targeted field intervention directly contributing to FoodNerve ${currentYear} ecosystem outcomes.`,
      imageUrl: '/images/challenges/people.webp',
      categoryLabel: 'Ecosystem Focus',
      groupName: 'Agricultural Transformation'
    };
  });
}

/**
 * Robust Markdown-to-HTML parser supporting multi-level headers, nested lists,
 * bold, italics, underlines, links, code, blockquotes, and paragraph spacing.
 */
export function parseMarkdownToHtml(markdown: string, color: string = '#10b981'): string {
  if (!markdown) return '';

  const clean = markdown.replace(/\r\n/g, '\n');
  const lines = clean.split('\n');
  const processedLines: string[] = [];
  let inUl = false;
  let inOl = false;
  let inQuote = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const ulMatch = line.match(/^\s*[-*]\s+(.*)$/);
    const olMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
    const quoteMatch = line.match(/^\s*>\s?(.*)$/);
    const h1Match = line.match(/^#\s+(.*)$/);
    const h2Match = line.match(/^##\s+(.*)$/);
    const h3Match = line.match(/^###\s+(.*)$/);
    const h4Match = line.match(/^####\s+(.*)$/);
    const hrMatch = line.match(/^(\*\*\*|---|___)$/);

    if (ulMatch) {
      if (!inUl) {
        if (inOl) { processedLines.push('</ol>'); inOl = false; }
        if (inQuote) { processedLines.push('</blockquote>'); inQuote = false; }
        processedLines.push('<ul class="md-ul">');
        inUl = true;
      }
      processedLines.push(`<li>${ulMatch[1]}</li>`);
      continue;
    } else if (inUl) {
      processedLines.push('</ul>');
      inUl = false;
    }

    if (olMatch) {
      if (!inOl) {
        if (inUl) { processedLines.push('</ul>'); inUl = false; }
        if (inQuote) { processedLines.push('</blockquote>'); inQuote = false; }
        processedLines.push('<ol class="md-ol">');
        inOl = true;
      }
      processedLines.push(`<li>${olMatch[2]}</li>`);
      continue;
    } else if (inOl) {
      processedLines.push('</ol>');
      inOl = false;
    }

    if (quoteMatch) {
      if (!inQuote) {
        if (inUl) { processedLines.push('</ul>'); inUl = false; }
        if (inOl) { processedLines.push('</ol>'); inOl = false; }
        processedLines.push('<blockquote class="md-quote">');
        inQuote = true;
      }
      processedLines.push(`<p>${quoteMatch[1]}</p>`);
      continue;
    } else if (inQuote) {
      processedLines.push('</blockquote>');
      inQuote = false;
    }

    if (h1Match) {
      processedLines.push(`<h1 class="md-h1">${h1Match[1]}</h1>`);
      continue;
    }
    if (h2Match) {
      processedLines.push(`<h2 class="md-h2">${h2Match[1]}</h2>`);
      continue;
    }
    if (h3Match) {
      processedLines.push(`<h3 class="md-h3">${h3Match[1]}</h3>`);
      continue;
    }
    if (h4Match) {
      processedLines.push(`<h4 class="md-h4">${h4Match[1]}</h4>`);
      continue;
    }
    if (hrMatch) {
      processedLines.push('<hr class="md-hr" />');
      continue;
    }

    if (line.trim() === '') {
      processedLines.push('<div class="md-spacer"></div>');
    } else {
      processedLines.push(`<p class="md-p">${line}</p>`);
    }
  }

  if (inUl) processedLines.push('</ul>');
  if (inOl) processedLines.push('</ol>');
  if (inQuote) processedLines.push('</blockquote>');

  let result = processedLines.join('\n');

  // Inline formatting
  result = result
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/<u>(.*?)<\/u>/g, '<span style="text-decoration: underline;">$1</span>')
    .replace(/`([^`]+)`/g, '<code class="md-code">$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, `<a href="$2" target="_blank" rel="noopener noreferrer" style="color: ${color}; text-decoration: underline; font-weight: 600;">$1</a>`);

  return result;
}

export default function PreviewListingModal({ open, onClose, data }: PreviewListingModalProps) {
  const [isSaved, setIsSaved] = React.useState(false);

  const {
    title,
    companyName,
    companyLogoUrl,
    category,
    sector,
    jobFunction,
    locationString,
    duration,
    deadline,
    compTypeString,
    minSalary,
    maxSalary,
    currency = 'NGN',
    npAmount,
    description,
    color = '#10b981',
    applicationMethod = 'native',
    externalButtonText = 'Apply on Company Site',
    challenges = [],
    requireResume = true,
    requireCoverLetter = false,
    workModel = 'On-Site Operations',
    rank = 1
  } = data;

  const orgRank = rank || 1;
  const enrichedChallenges = React.useMemo(() => getEnrichedChallenges(challenges), [challenges]);

  const themeColor = category === 'volunteer' ? '#ec4899' : category === 'internship' ? '#3b82f6' : (color || '#10b981');
  const posterName = companyName || 'FoodNerve Operator';
  const initial = posterName.charAt(0).toUpperCase() || 'F';

  const posterObj = data.poster || {};
  const posterUserName = posterObj.name || 'FoodNerve Operator';
  const posterUserAvatar = posterObj.avatarUrl || '';
  const posterUserRank = posterObj.rank || 1;
  const posterUserRole = posterObj.role || (posterUserRank >= 4 ? 'Ecosystem Pillar' : 'Talent Scout');
  const posterUsername = posterObj.username || '';
  const posterProfileUrl = posterUsername ? `/@u-${posterUsername}` : '#';

  // Format Salary / Compensation Text
  let salaryDisplay = 'Competitive';
  if (compTypeString === 'Volunteer/NP' || category === 'volunteer') {
    salaryDisplay = npAmount ? `${npAmount} NP Reward` : 'Volunteer Role';
  } else if (minSalary && maxSalary) {
    salaryDisplay = `${currency} ${Number(minSalary).toLocaleString()} - ${Number(maxSalary).toLocaleString()}`;
  } else if (minSalary) {
    salaryDisplay = `${currency} ${Number(minSalary).toLocaleString()}+`;
  } else if (maxSalary) {
    salaryDisplay = `Up to ${currency} ${Number(maxSalary).toLocaleString()}`;
  }

  // Application Button Details
  const getApplyButtonDetails = () => {
    if (applicationMethod === 'external') {
      return {
        icon: <OpenInNewIcon />,
        label: externalButtonText || 'Apply on Company Site',
        color: BLUE
      };
    }
    if (applicationMethod === 'email') {
      return {
        icon: <EmailIcon />,
        label: 'Apply via Verified Email',
        color: PURPLE
      };
    }
    return {
      icon: <RocketLaunchIcon />,
      label: 'Apply with Profile',
      color: themeColor
    };
  };

  const applyBtn = getApplyButtonDetails();
  const timelineInfo = formatDeadlineRemaining(deadline);

  const specSegments = [
    {
      id: "location",
      icon: <LocationOnIcon sx={{ fontSize: 19, color: BLUE }} />,
      color: BLUE,
      label: "LOCATION & BASE",
      value: locationString || "Pan-African",
      hint: workModel || "On-Site Operations"
    },
    {
      id: "compensation",
      icon: <PaymentsIcon sx={{ fontSize: 19, color: "#059669" }} />,
      color: "#059669",
      label: "SALARY / COMPENSATION",
      value: salaryDisplay,
      hint: category === "volunteer" ? "NervePoints Reward" : "Monthly Compensation"
    },
    {
      id: "function",
      icon: <CategoryIcon sx={{ fontSize: 19, color: PURPLE }} />,
      color: PURPLE,
      label: "VALUE CHAIN FUNCTION",
      value: jobFunction || sector || "Agro-Enterprise Logistics",
      hint: "Ecosystem Function"
    },
    {
      id: "timeline",
      icon: <HourglassEmptyIcon sx={{ fontSize: 19, color: "#e11d48" }} />,
      color: "#e11d48",
      label: "TIMELINE & STATUS",
      value: timelineInfo.text,
      hint: duration ? `${duration} Engagement` : timelineInfo.hint
    }
  ];

  const parsedMarkdownHtml = React.useMemo(() => {
    return parseMarkdownToHtml(description, themeColor);
  }, [description, themeColor]);

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      sx={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 1.5, sm: 2, md: 4 },
        '& .MuiBackdrop-root': { 
          backgroundColor: 'rgba(15, 23, 42, 0.45)', 
          backdropFilter: 'blur(10px)', 
          WebkitBackdropFilter: 'blur(10px)' 
        } 
      }}
    >
      <Box sx={{
        width: { xs: '96vw', sm: '88vw', md: '82vw', lg: '1200px' },
        height: { xs: '92vh', sm: '86vh' },
        overflow: 'hidden',
        bgcolor: '#ffffff', 
        borderRadius: '24px', 
        boxShadow: `0 32px 128px ${alpha(themeColor, 0.18)}`,
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column',
        border: `1px solid ${alpha('#000', 0.06)}`,
        backgroundImage: `radial-gradient(circle at top right, ${alpha(themeColor, 0.05)}, transparent 500px), radial-gradient(circle at bottom left, ${alpha(themeColor, 0.02)}, transparent 400px)`,
      }}>
        
        {/* ── FLOATING GLASSY PILL HEADER AT TOP RIGHT ── */}
        <Box sx={{ 
          position: 'absolute', top: { xs: 16, sm: 24 }, right: { xs: 16, sm: 24 }, zIndex: 100,
          display: 'flex', alignItems: 'center', gap: 1.5,
          p: 1, pr: 1.5, pl: 2,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.85) 100%)',
          backdropFilter: 'blur(16px)',
          borderRadius: '100px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255,255,255,0.7)'
        }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 1 }}>
            Preview
          </Typography>
          <Box sx={{ width: '1px', height: 16, bgcolor: 'rgba(0,0,0,0.1)' }} />
          <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.04)', color: '#0f172a', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* ── SCROLLABLE PREVIEW CONTENT (EXACT FOODNERVE.COM /CAREERS/ID VIEW) ── */}
        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          p: { xs: 2.5, sm: 4, md: 5 },
          pt: { xs: 7, sm: 5 },
          pb: { xs: 8, md: 6 },
          scrollbarWidth: 'thin',
          scrollbarColor: `${alpha('#000', 0.1)} transparent`,
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: alpha('#000', 0.1), borderRadius: '10px' },
          '&::-webkit-scrollbar-thumb:hover': { backgroundColor: alpha('#000', 0.2) },
        }}>
          <Container maxWidth="xl" sx={{ p: '0 !important' }}>

            {/* ── TOP UTILITY ACTION BAR ── */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", mb: 3, pr: { xs: 8, sm: 12 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <Chip
                  label={category === "volunteer" ? "VOLUNTEER" : category === "internship" ? "INTERNSHIP" : "PAID JOB"}
                  sx={{
                    bgcolor: `${themeColor}15`,
                    color: themeColor,
                    fontWeight: 900,
                    fontSize: "0.74rem",
                    borderRadius: "8px",
                    border: `1px solid ${themeColor}30`,
                    px: 0.5,
                  }}
                />
                <IconButton 
                  onClick={() => setIsSaved(!isSaved)} 
                  sx={{ bgcolor: "#ffffff", border: "1px solid #e2e8f0", color: isSaved ? themeColor : "#64748b", "&:hover": { bgcolor: "#f8fafc" } }}
                >
                  {isSaved ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
                </IconButton>
                <Tooltip title="Share job link">
                  <IconButton sx={{ bgcolor: "#ffffff", border: "1px solid #e2e8f0", color: "#64748b", "&:hover": { bgcolor: "#f8fafc" } }}>
                    <ShareIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* ── HERO HEADER CARD (MULTI-COLOR RIBBON) ── */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3.5, md: 4 },
                borderRadius: { xs: "20px", md: "24px" },
                border: "1px solid #e2e8f0",
                background: `linear-gradient(135deg, #ffffff 40%, ${themeColor}12 100%)`,
                boxShadow: "0 10px 30px -10px rgba(0,0,0,0.04)",
                position: "relative",
                overflow: "hidden",
                mb: 4,
              }}
            >
              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "flex-start" }, justifyContent: "space-between", gap: 3, mb: 3.5 }}>
                <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}>
                  {companyLogoUrl ? (
                    <Box
                      sx={{
                        p: 0.8,
                        borderRadius: "14px",
                        bgcolor: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Box
                        component="img"
                        src={companyLogoUrl}
                        alt={posterName}
                        sx={{
                          maxHeight: { xs: 46, md: 54 },
                          maxWidth: { xs: 120, md: 160 },
                          objectFit: "contain",
                          display: "block",
                        }}
                      />
                    </Box>
                  ) : (
                    <Avatar
                      sx={{
                        width: { xs: 52, md: 60 },
                        height: { xs: 52, md: 60 },
                        bgcolor: `${themeColor}15`,
                        color: themeColor,
                        fontWeight: 900,
                        borderRadius: "14px",
                        fontSize: "1.4rem",
                      }}
                    >
                      {initial}
                    </Avatar>
                  )}

                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 800, color: "#475569", fontSize: "0.95rem" }}>
                        {posterName}
                      </Typography>
                      {/* Only Rank 4+ organizations are verified */}
                      {orgRank >= 4 && (
                        <Tooltip title="Rank 4 Verified Organization">
                          <VerifiedIcon sx={{ fontSize: 16, color: EMERALD, verticalAlign: 'middle' }} />
                        </Tooltip>
                      )}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, bgcolor: "rgba(100, 116, 139, 0.1)", color: "#475569", px: 0.8, py: 0.2, borderRadius: "6px" }}>
                        <Typography sx={{ fontSize: "0.65rem", fontWeight: 800 }}>RANK {orgRank}</Typography>
                      </Box>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a", fontSize: { xs: "1.35rem", md: "1.85rem" }, lineHeight: 1.25 }}>
                      {title || 'Untitled Role'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: { xs: "100%", sm: "auto" }, minWidth: { sm: 200 } }}>
                  <Button
                    variant="contained"
                    endIcon={applyBtn.icon}
                    sx={{
                      bgcolor: applyBtn.color,
                      color: "#ffffff",
                      fontWeight: 800,
                      borderRadius: "14px",
                      py: 1.4,
                      px: 3,
                      fontSize: "0.95rem",
                      textTransform: "none",
                      boxShadow: `0 10px 25px -5px ${alpha(applyBtn.color, 0.5)}`,
                      "&:hover": { bgcolor: alpha(applyBtn.color, 0.9), transform: "scale(1.02)" },
                      transition: "all 0.2s",
                    }}
                  >
                    {applyBtn.label}
                  </Button>
                </Box>
              </Box>

              {/* ── MULTI-COLOR SEGMENTED 4-POINT RIBBON BAR ── */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  borderRadius: "18px",
                  bgcolor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 16px -2px rgba(0,0,0,0.03)",
                  overflow: "hidden",
                  mt: 3,
                }}
              >
                {specSegments.map((item, idx) => (
                  <Box
                    key={item.id}
                    sx={{
                      flex: 1,
                      p: { xs: 2, sm: 2.2 },
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      bgcolor: "#ffffff",
                      borderRight: { md: idx < specSegments.length - 1 ? "1px solid #e2e8f0" : "none" },
                      borderBottom: { xs: idx < specSegments.length - 1 ? "1px solid #e2e8f0" : "none", md: "none" },
                      transition: "all 0.2s ease",
                      "&:hover": { bgcolor: alpha(item.color, 0.02) },
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        bgcolor: alpha(item.color, 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          color: item.color,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          lineHeight: 1.1,
                          mb: 0.4,
                        }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        noWrap
                        sx={{
                          fontSize: { xs: "0.95rem", sm: "1.05rem" },
                          fontWeight: 800,
                          color: "#0f172a",
                          lineHeight: 1.2,
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* ── TWO-COLUMN MAIN CONTENT ── */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "8fr 4fr" }, gap: 4 }}>
              
              {/* Left Column: Responsibilities, Challenges, Requirements */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
                
                {/* Full Description Card with Rich Markdown Styling */}
                <Paper elevation={0} sx={{ ...glassCard, p: { xs: 3, md: 4 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a", mb: 2.5, fontSize: "1.2rem", letterSpacing: '-0.01em' }}>
                    Role Overview & Responsibilities
                  </Typography>
                  <Box
                    sx={{
                      color: "#334155",
                      fontFamily: 'inherit',
                      '& .md-h1': { fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', mt: 3, mb: 1.5 },
                      '& .md-h2': { fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', mt: 3, mb: 1.2 },
                      '& .md-h3': { fontSize: '1.12rem', fontWeight: 800, color: '#0f172a', mt: 2.5, mb: 1 },
                      '& .md-h4': { fontSize: '1rem', fontWeight: 700, color: '#0f172a', mt: 2, mb: 0.8 },
                      '& .md-p': { fontSize: '0.96rem', lineHeight: 1.8, color: '#334155', mb: 1.2 },
                      '& .md-ul, & .md-ol': { pl: 3, mb: 2, color: '#334155', fontSize: '0.96rem' },
                      '& .md-ul li, & .md-ol li': { mb: 0.6, lineHeight: 1.7 },
                      '& .md-quote': { borderLeft: `4px solid ${alpha(themeColor, 0.4)}`, pl: 2, my: 2, fontStyle: 'italic', color: '#64748b' },
                      '& .md-code': { bgcolor: '#f1f5f9', px: 0.8, py: 0.2, borderRadius: '4px', fontSize: '0.85em', fontFamily: 'monospace', color: '#0f172a' },
                      '& .md-hr': { border: 'none', borderTop: '1px solid #e2e8f0', my: 3 },
                      '& .md-spacer': { height: '8px' },
                      '& strong': { color: '#0f172a', fontWeight: 700 },
                      '& em': { fontStyle: 'italic' }
                    }}
                  >
                    {description ? (
                      <div dangerouslySetInnerHTML={{ __html: parsedMarkdownHtml }} />
                    ) : (
                      <Typography sx={{ color: '#94a3b8', fontStyle: 'italic' }}>No description provided yet.</Typography>
                    )}
                  </Box>
                </Paper>

                {/* Application Requirements Card */}
                <Paper elevation={0} sx={{ ...glassCard, p: { xs: 3, md: 4 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a", mb: 2, fontSize: "1.1rem" }}>
                    Application Requirements
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <CheckCircleIcon sx={{ color: themeColor, fontSize: 20 }} />
                      <Typography sx={{ color: "#334155", fontSize: "0.92rem", fontWeight: 600 }}>
                        Official application processed via FoodNerve Society Trust Protocol
                      </Typography>
                    </Box>
                    {requireResume && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <CheckCircleIcon sx={{ color: themeColor, fontSize: 20 }} />
                        <Typography sx={{ color: "#334155", fontSize: "0.92rem", fontWeight: 600 }}>
                          Curriculum Vitae / Professional Resume required
                        </Typography>
                      </Box>
                    )}
                    {requireCoverLetter && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <CheckCircleIcon sx={{ color: themeColor, fontSize: 20 }} />
                        <Typography sx={{ color: "#334155", fontSize: "0.92rem", fontWeight: 600 }}>
                          Cover Letter / Statement of Purpose required
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Box>

              {/* Right Column: Hiring Org Dossier & Fast Actions */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
                
                {/* Organization Profile Card */}
                <Paper elevation={0} sx={{ ...glassCard, p: 3.5 }}>
                  <Typography variant="overline" sx={{ color: "#94a3b8", fontWeight: 800, letterSpacing: "0.08em" }}>
                    Hiring Organization
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1.5, mb: 2 }}>
                    {companyLogoUrl ? (
                      <Box
                        sx={{
                          p: 0.6,
                          borderRadius: "12px",
                          bgcolor: "#f1f5f9",
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Box
                          component="img"
                          src={companyLogoUrl}
                          alt={posterName}
                          sx={{
                            maxHeight: 36,
                            maxWidth: 85,
                            objectFit: "contain",
                            display: "block",
                          }}
                        />
                      </Box>
                    ) : (
                      <Avatar sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: `${themeColor}15`, color: themeColor, fontWeight: 900 }}>
                        {initial}
                      </Avatar>
                    )}
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                        <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.05rem" }}>{posterName}</Typography>
                        {orgRank >= 4 && (
                          <VerifiedIcon sx={{ fontSize: 16, color: "#10b981" }} />
                        )}
                      </Box>
                      <Typography sx={{ fontSize: "0.78rem", color: "#64748b" }}>Rank {orgRank} Society Operator</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ color: "#475569", fontSize: "0.85rem", lineHeight: 1.6, mb: 2 }}>
                    Official verified ecosystem participant registered in the FoodNerve Directory.
                  </Typography>
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 700,
                      borderColor: "#e2e8f0",
                      color: "#0f172a",
                      "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
                    }}
                  >
                    View Organization Profile
                  </Button>
                </Paper>

                {/* Job Poster Dossier Card */}
                <Paper
                  elevation={0}
                  sx={{
                    ...glassCard,
                    p: 3.5,
                    borderRadius: "24px",
                    border: "1px solid #e2e8f0",
                    background: "linear-gradient(135deg, #ffffff 60%, rgba(248,250,252,0.9) 100%)",
                    boxShadow: "0 4px 20px -4px rgba(0,0,0,0.04)",
                    transition: "all 0.25s ease",
                    "&:hover": {
                      borderColor: alpha(themeColor, 0.4),
                      transform: "translateY(-2px)",
                      boxShadow: `0 12px 28px -6px rgba(0,0,0,0.08), 0 0 0 1px ${alpha(themeColor, 0.2)}`
                    }
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      color: "#94a3b8",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      fontSize: "0.72rem",
                      display: "block",
                      mb: 1.5
                    }}
                  >
                    Curated & Posted By
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Avatar
                      src={posterUserAvatar}
                      alt={posterUserName}
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "14px",
                        bgcolor: alpha(themeColor, 0.1),
                        color: themeColor,
                        fontWeight: 900,
                        fontSize: "1.05rem",
                        border: `2px solid ${alpha(themeColor, 0.2)}`
                      }}
                    >
                      {posterUserName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            color: "#0f172a",
                            fontSize: "1rem",
                            lineHeight: 1.3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {posterUserName}
                        </Typography>
                        {posterUserRank >= 4 && (
                          <VerifiedIcon sx={{ fontSize: 16, color: "#10b981" }} />
                        )}
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.4, flexWrap: "wrap" }}>
                        <Chip
                          label={`Rank ${posterUserRank}`}
                          size="small"
                          sx={{
                            bgcolor: alpha(themeColor, 0.1),
                            color: themeColor,
                            fontWeight: 800,
                            fontSize: "0.68rem",
                            height: 20,
                            borderRadius: "6px"
                          }}
                        />
                        <Typography sx={{ fontSize: "0.76rem", color: "#64748b", fontWeight: 600 }}>
                          {posterUserRole}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Typography sx={{ color: "#475569", fontSize: "0.83rem", lineHeight: 1.55, mb: 2.5 }}>
                    Verified ecosystem participant actively stewarding talent and opportunities across the FoodNerve network.
                  </Typography>

                  <Button
                    fullWidth
                    variant="outlined"
                    component="a"
                    href={posterProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      borderRadius: "14px",
                      textTransform: "none",
                      fontWeight: 800,
                      fontSize: "0.86rem",
                      py: 1.2,
                      borderColor: "#e2e8f0",
                      color: "#0f172a",
                      bgcolor: "#ffffff",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                      "&:hover": {
                        borderColor: themeColor,
                        bgcolor: alpha(themeColor, 0.04),
                        color: themeColor
                      }
                    }}
                  >
                    View Poster Profile
                  </Button>
                </Paper>

                {/* Trust & Verification Card (Only if poster or org is Rank 4+) */}
                {(posterUserRank >= 4 || orgRank >= 4) && (
                  <Paper elevation={0} sx={{ ...glassCard, p: 3.5, bgcolor: alpha(EMERALD, 0.04), border: `1px solid ${alpha(EMERALD, 0.2)}` }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                      <ShieldIcon sx={{ color: EMERALD }} />
                      <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem" }}>FoodNerve Trust Protocol</Typography>
                    </Box>
                    <Typography sx={{ color: "#475569", fontSize: "0.82rem", lineHeight: 1.6 }}>
                      This listing is verified under FoodNerve's Pan-African agricultural labor and commerce framework.
                    </Typography>
                  </Paper>
                )}

                {/* Ecosystem Impact & Challenge Focus (Right Column - Invisible Background) */}
                {enrichedChallenges.length > 0 && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 0.5 }}>
                    <Box sx={{ mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: "1.05rem", letterSpacing: "-0.01em" }}>
                        Ecosystem Impact & Challenge Focus
                      </Typography>
                      <Typography sx={{ color: "#64748b", fontSize: "0.82rem", mt: 0.4, lineHeight: 1.5 }}>
                        This position directly addresses core agricultural bottlenecks in the FoodNerve {new Date().getFullYear()} Master Plan:
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {enrichedChallenges.map((item, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            borderRadius: "20px",
                            bgcolor: "#ffffff",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 16px -2px rgba(0,0,0,0.04)",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            transition: "all 0.25s ease",
                            "&:hover": {
                              borderColor: alpha(themeColor, 0.4),
                              transform: "translateY(-2px)",
                              boxShadow: `0 12px 24px -6px rgba(0,0,0,0.08), 0 0 0 1px ${alpha(themeColor, 0.2)}`,
                              "& img": {
                                transform: "scale(1.04)"
                              }
                            }
                          }}
                        >
                          {/* Card Image */}
                          <Box
                            sx={{
                              width: "100%",
                              height: 140,
                              position: "relative",
                              overflow: "hidden",
                              bgcolor: alpha(themeColor, 0.08),
                              flexShrink: 0
                            }}
                          >
                            <Box
                              component="img"
                              src={item.imageUrl}
                              alt={item.title}
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                                transition: "transform 0.4s ease"
                              }}
                            />
                          </Box>

                          {/* Card Content */}
                          <Box sx={{ p: 2.5 }}>
                            <Typography
                              sx={{
                                fontWeight: 800,
                                fontSize: "0.98rem",
                                color: "#0f172a",
                                lineHeight: 1.35,
                                mb: 1
                              }}
                            >
                              {item.title}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.82rem",
                                color: "#475569",
                                lineHeight: 1.6,
                                display: "-webkit-box",
                                WebkitLineClamp: 4,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden"
                              }}
                            >
                              {item.desc}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

              </Box>
            </Box>

          </Container>
        </Box>

      </Box>
    </Modal>
  );
}
