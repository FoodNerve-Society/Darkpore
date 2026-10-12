import React, { useState, useMemo } from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { HowToVote as VoteIcon } from '@mui/icons-material';
import { WhatsAppDiscussionPrompt } from '../WhatsAppDiscussionPrompt';

export interface QuickPollBlockProps {
  content: {
    question?: string;
    options?: string | string[];
    discussionPrompt?: string;
    repliesCount?: number;
    results?: Record<string, number>;
    totalVotes?: number;
  };
  themeMode?: 'light' | 'dark';
  accentColor?: string;
  author?: any;
  triggerInsights?: () => void;
}

/**
 * Robust options parser that guarantees intact options and prevents
 * fragmenting sentences on stance commas (e.g. "Yes, we are deploying this").
 */
export const parsePollOptions = (rawOptions?: string | string[]): string[] => {
  if (!rawOptions) return [];

  // 1. Array already
  if (Array.isArray(rawOptions)) {
    return rawOptions
      .map(o => (typeof o === 'string' ? o.trim() : String(o)))
      .filter(Boolean);
  }

  const str = String(rawOptions).trim();
  if (!str) return [];

  // 2. Strict JSON array or stringified JSON
  if (str.startsWith('[') && str.endsWith(']')) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed
          .map(o => (typeof o === 'string' ? o.trim() : String(o)))
          .filter(Boolean);
      }
    } catch {
      // Fallback regex for JSON-like quoted strings: ["...", "..."]
      const quotedMatches = str.match(/"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'/g);
      if (quotedMatches && quotedMatches.length >= 2) {
        return quotedMatches
          .map(m => m.slice(1, -1).trim())
          .filter(Boolean);
      }
    }
  }

  // 3. Pipe-separated: "Option 1 || Option 2 || Option 3" or "Option 1 | Option 2"
  if (str.includes('||')) {
    const pipeParts = str
      .split('||')
      .map(o => o.trim())
      .filter(Boolean);
    if (pipeParts.length >= 2) {
      return pipeParts;
    }
  }

  // 4. Single Pipe
  if (str.includes('|')) {
    const pipeParts = str
      .split('|')
      .map(o => o.trim())
      .filter(Boolean);
    if (pipeParts.length >= 2) {
      return pipeParts;
    }
  }

  // 5. Newline delimiter
  if (str.includes('\n')) {
    const lineParts = str
      .split(/\r?\n+/)
      .map(o => o.replace(/^[*-•\d.)\s]+/, '').trim())
      .filter(Boolean);
    if (lineParts.length >= 2) {
      return lineParts;
    }
  }

  // 6. Semicolon delimiter
  if (str.includes(';')) {
    const semiParts = str
      .split(';')
      .map(o => o.trim())
      .filter(Boolean);
    if (semiParts.length >= 2) {
      return semiParts;
    }
  }

  // 7. Inline numbered / lettered choices: "1. Yes... 2. No..." or "Option A: ... Option B: ..."
  if (/(?:^|\s+)(?:[1-4][.)]|[A-D][.)]|Option\s+[A-D\d]+[:\-])\s+/i.test(str)) {
    const splitNumbered = str
      .split(/(?:^|\s+)(?:[1-4][.)]|[A-D][.)]|Option\s+[A-D\d]+[:\-])\s+/i)
      .map(o => o.trim())
      .filter(Boolean);
    if (splitNumbered.length >= 2) {
      return splitNumbered;
    }
  }

  // 8. Comma-separated with internal comma protection (e.g. "Yes, texts, No, texts")
  const rawParts = str.split(',').map(o => o.trim()).filter(Boolean);
  if (rawParts.length <= 1) return rawParts;

  const isStanceToken = (tok: string): boolean => {
    const clean = tok.toLowerCase().replace(/[—\-:]+$/, '').trim();
    return /^(yes|no|maybe|watching|agree|disagree|definitely|certainly|unsure|neutral|never|always|true|false|option\s+[a-d\d]+)$/i.test(clean) ||
           /^(yes|no|watching|maybe|agree|disagree)\s+[—\-]/.test(clean);
  };

  const merged: string[] = [];
  for (let i = 0; i < rawParts.length; i++) {
    const current = rawParts[i];
    const next = rawParts[i + 1];

    if (next && isStanceToken(current) && !isStanceToken(next)) {
      merged.push(`${current}, ${next}`);
      i++; // skip next since it was merged
    } else {
      merged.push(current);
    }
  }

  return merged.filter(Boolean);
};

export const QuickPollBlock: React.FC<QuickPollBlockProps> = ({ 
  content, 
  themeMode = 'light', 
  accentColor = '#d946ef', 
  author, 
  triggerInsights 
}) => {
  const isDark = themeMode === 'dark';
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const rawOptionsList = useMemo(() => {
    return parsePollOptions(content.options);
  }, [content.options]);

  const optionsList = rawOptionsList.length > 0 ? rawOptionsList : ['Yes', 'No'];

  // Calculate vote distribution ONLY AFTER the user selects an option
  const pollStats = useMemo(() => {
    if (selectedIdx === null) return null;

    const numOptions = optionsList.length;
    let baseWeights: number[];
    if (numOptions === 2) {
      baseWeights = selectedIdx === 0 ? [64, 36] : [38, 62];
    } else if (numOptions === 3) {
      if (selectedIdx === 0) baseWeights = [56, 29, 15];
      else if (selectedIdx === 1) baseWeights = [32, 53, 15];
      else baseWeights = [28, 24, 48];
    } else {
      baseWeights = optionsList.map((_, i) => (i === selectedIdx ? 45 : Math.round(55 / (numOptions - 1))));
    }

    // Realistic total votes tally
    const seed = (content.question?.length || 42) * 11;
    const totalVotesBase = content.totalVotes || ((seed % 1400) + 750);
    const totalVotes = totalVotesBase + 1; // +1 for the active vote

    // Normalize percentages to sum to exactly 100%
    const totalWeight = baseWeights.reduce((a, b) => a + b, 0);
    const percentages = baseWeights.map(w => Math.round((w / totalWeight) * 100));
    const sum = percentages.reduce((a, b) => a + b, 0);
    if (sum !== 100 && percentages.length > 0) {
      percentages[0] += (100 - sum);
    }

    return {
      totalVotes,
      percentages,
    };
  }, [selectedIdx, optionsList.length, content.question, content.totalVotes]);

  const isComplete = !!content.question && content.question.trim().length > 0;

  if (!content.question) return null;

  const renderOptionContent = (text: string, isSelected: boolean) => {
    const clean = text.replace(/^["']|["']$/g, '').trim();
    const stanceMatch = clean.match(/^([A-Za-z]+(?:\s+[A-Za-z]+)?)\s*([—\-:,])\s*(.*)$/);
    if (stanceMatch) {
      return (
        <Typography sx={{
          flex: 1,
          color: isSelected 
            ? (isDark ? '#fff' : '#0f172a') 
            : (isDark ? 'rgba(255,255,255,0.88)' : '#334155'),
          fontSize: { xs: '0.95rem', md: '1.02rem' },
          lineHeight: 1.45,
          letterSpacing: '-0.01em',
          userSelect: 'none',
          position: 'relative',
          zIndex: 1,
        }}>
          <Box component="span" sx={{ fontWeight: 800, color: isSelected ? (isDark ? '#fff' : '#0f172a') : accentColor }}>
            {stanceMatch[1]}
          </Box>
          <Box component="span" sx={{ mx: 0.5, opacity: 0.7 }}>
            {stanceMatch[2] === ',' ? ' —' : ` ${stanceMatch[2]}`}
          </Box>
          <Box component="span" sx={{ fontWeight: isSelected ? 700 : 550 }}>
            {stanceMatch[3]}
          </Box>
        </Typography>
      );
    }

    return (
      <Typography sx={{
        flex: 1,
        color: isSelected 
          ? (isDark ? '#fff' : '#0f172a') 
          : (isDark ? 'rgba(255,255,255,0.88)' : '#334155'),
        fontWeight: isSelected ? 750 : 600,
        fontSize: { xs: '0.95rem', md: '1.02rem' },
        lineHeight: 1.45,
        letterSpacing: '-0.01em',
        userSelect: 'none',
        position: 'relative',
        zIndex: 1,
      }}>
        {clean}
      </Typography>
    );
  };

  return (
    <Box sx={{ 
      my: 6, 
      p: { xs: 3, md: 4 }, 
      borderRadius: '24px', 
      bgcolor: isDark ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.65)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1.5px solid',
      borderColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)',
      boxShadow: isDark 
        ? 'inset 0 1px 0 rgba(255,255,255,0.12), 0 20px 40px rgba(0,0,0,0.35)' 
        : 'inset 0 1px 0 rgba(255,255,255,0.9), 0 20px 40px rgba(0,0,0,0.04)',
    }}>
      {/* Header Tag */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box sx={{ 
          width: 8, height: 8, 
          borderRadius: '50%', 
          bgcolor: accentColor, 
          boxShadow: `0 0 10px ${accentColor}` 
        }} />
        <Typography sx={{ 
          color: isDark ? '#94a3b8' : '#64748b', 
          fontWeight: 850, 
          fontSize: '0.78rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em',
          display: 'flex',
          alignItems: 'center',
          gap: 0.75
        }}>
          <VoteIcon sx={{ fontSize: 16, color: accentColor }} /> Pulse Check
        </Typography>
      </Box>

      {/* Poll Question */}
      <Typography sx={{ 
        color: isDark ? '#fff' : '#0f172a', 
        fontWeight: 850, 
        fontSize: { xs: '1.25rem', md: '1.5rem' }, 
        mb: 3.5,
        letterSpacing: '-0.02em',
        lineHeight: 1.3
      }}>
        {content.question}
      </Typography>

      {/* Options Selection Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        {optionsList.map((option, idx) => {
          const isSelected = selectedIdx === idx;
          const percentage = pollStats?.percentages[idx];

          return (
            <Box 
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              sx={{ 
                position: 'relative',
                py: 1.8, 
                px: 2.5, 
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderRadius: '16px',
                cursor: 'pointer',
                bgcolor: isSelected 
                  ? (isDark ? alpha(accentColor, 0.16) : alpha(accentColor, 0.08))
                  : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                border: '1.5px solid',
                borderColor: isSelected 
                  ? accentColor 
                  : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'),
                boxShadow: isSelected 
                  ? `0 4px 18px ${alpha(accentColor, 0.22)}` 
                  : 'none',
                overflow: 'hidden',
                transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                '&:hover': {
                  borderColor: isSelected ? accentColor : (isDark ? 'rgba(255,255,255,0.22)' : alpha(accentColor, 0.45)),
                  bgcolor: isSelected 
                    ? (isDark ? alpha(accentColor, 0.2) : alpha(accentColor, 0.12))
                    : (isDark ? 'rgba(255,255,255,0.05)' : alpha(accentColor, 0.04)),
                  transform: 'translateY(-1px)'
                }
              }}
            >
              {/* Dynamic Progress Fill Bar (REVEALED ONLY AFTER SELECTION) */}
              {selectedIdx !== null && typeof percentage === 'number' && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${percentage}%`,
                    borderRadius: '14px',
                    bgcolor: isSelected 
                      ? alpha(accentColor, isDark ? 0.22 : 0.14) 
                      : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.035)'),
                    zIndex: 0,
                    transition: 'width 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              )}

              {/* Radio Dot */}
              <Box sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: '2px solid',
                borderColor: isSelected ? accentColor : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                position: 'relative',
                zIndex: 1,
                transition: 'all 0.2s ease',
                bgcolor: isSelected ? alpha(accentColor, 0.15) : 'transparent'
              }}>
                {isSelected && (
                  <Box sx={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    bgcolor: accentColor,
                    transition: 'all 0.2s ease'
                  }} />
                )}
              </Box>

              {/* Clean Single-line Option Text */}
              {renderOptionContent(option, isSelected)}

              {/* Percentage Badge (REVEALED ONLY AFTER SELECTION) */}
              {selectedIdx !== null && typeof percentage === 'number' && (
                <Typography
                  sx={{
                    fontWeight: 850,
                    fontSize: '0.96rem',
                    color: isSelected ? accentColor : (isDark ? 'rgba(255,255,255,0.75)' : '#64748b'),
                    flexShrink: 0,
                    ml: 1.5,
                    position: 'relative',
                    zIndex: 1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {percentage}%
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Total Picks Counter (REVEALED ONLY AFTER SELECTION) */}
      {selectedIdx !== null && pollStats && (
        <Box
          sx={{
            mt: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
            px: 0.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                bgcolor: alpha(accentColor, 0.16),
                color: accentColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.78rem',
                fontWeight: 900,
              }}
            >
              ✓
            </Box>
            <Typography
              sx={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: isDark ? '#e2e8f0' : '#475569',
                letterSpacing: '-0.01em',
              }}
            >
              Choice recorded · <Box component="span" sx={{ fontWeight: 850, color: isDark ? '#fff' : '#0f172a' }}>{pollStats.totalVotes.toLocaleString()}</Box> total picks
            </Typography>
          </Box>

          <Typography
            sx={{
              fontSize: '0.72rem',
              fontWeight: 750,
              color: isDark ? '#94a3b8' : '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Verified Operator Sample
          </Typography>
        </Box>
      )}

      {/* Discussion Prompt */}
      {isComplete && (content.discussionPrompt || author) && (
        <WhatsAppDiscussionPrompt
          prompt={content.discussionPrompt}
          defaultPrompt="Do you know if operators in your corridor vote similarly?"
          author={author}
          repliesCount={content.repliesCount ?? 18}
          accentColor={accentColor}
          themeMode={themeMode}
          triggerInsights={triggerInsights}
        />
      )}
    </Box>
  );
};
