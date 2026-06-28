import React from 'react';
import { Box, Typography, alpha, Button, Paper } from '@mui/material';
import {
  GpsFixed as TargetIcon,
  DoubleArrow as ActionIcon,
  Radar as PivotIcon,
  ArrowForward as ArrowIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { MICRO_CTAS } from '../../../lib/cms/ctas';

export interface StrategicDirectiveBlockProps {
  content: {
    urgencyLevel?: 'MONITOR' | 'PREPARE' | 'EXECUTE NOW';
    targetPersona?: string;
    microCtaId?: string;
    point1?: string; // The Threat/Reality
    point2?: string; // The Action/Bottleneck
    point3?: string; // The Pivot/Exploit
  };
  themeMode?: 'light' | 'dark';
  accentColor?: string;
}

// ==========================================
// OPTION 1: EXECUTIVE MEMO (For EXECUTE NOW)
// ==========================================
const ExecutiveMemoVariant: React.FC<StrategicDirectiveBlockProps> = ({ content, themeMode }) => {
  const isDark = themeMode === 'dark';
  const bgColor = isDark ? '#1e2025' : '#fcfbf9'; 
  const textColor = isDark ? '#f3f4f6' : '#111827';
  const mutedTextColor = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#374151' : '#e5e7eb';

  const urgencyColor = '#dc2626'; // Always Red for Execute Now

  const points = [
    { text: content.point1, title: "The Threat" },
    { text: content.point2, title: "Immediate Action" },
    { text: content.point3, title: "The Long-Term Pivot" },
  ].filter(p => !!p.text);

  if (points.length === 0) return null;

  return (
    <Box sx={{ my: 6, display: 'flex', justifyContent: 'center' }}>
      <Paper elevation={isDark ? 0 : 3} sx={{
        width: '100%',
        maxWidth: '800px',
        bgcolor: bgColor,
        borderRadius: 0, // Sharp corners like paper
        border: `1px solid ${borderColor}`,
        borderTop: `4px solid ${urgencyColor}`, // Top accent line
        p: { xs: 4, md: 6 },
        position: 'relative'
      }}>
        
        {/* Header Section */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: `2px solid ${borderColor}`,
          pb: 3,
          mb: 4
        }}>
          <Box>
            <Typography sx={{ 
              fontFamily: 'serif', 
              fontSize: '1.75rem', 
              fontWeight: 800, 
              color: textColor,
              letterSpacing: '-0.02em',
              mb: 1
            }}>
              Strategic Directive
            </Typography>
            <Typography sx={{ 
              fontFamily: 'monospace', 
              fontSize: '0.75rem', 
              color: mutedTextColor,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              ID: {Math.random().toString(36).substr(2, 6).toUpperCase()} // CONFIDENTIAL
            </Typography>
          </Box>

          {/* Urgency Stamp */}
          <Box sx={{
            border: `2px solid ${urgencyColor}`,
            px: 2,
            py: 1,
            transform: 'rotate(-2deg)',
            display: 'inline-block'
          }}>
            <Typography sx={{
              color: urgencyColor,
              fontFamily: 'monospace',
              fontWeight: 900,
              fontSize: '0.85rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase'
            }}>
              EXECUTE NOW
            </Typography>
          </Box>
        </Box>

        {content.targetPersona && (
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ color: mutedTextColor, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>
              ATTN: Target Persona
            </Typography>
            <Typography sx={{ color: textColor, fontSize: '1rem', fontWeight: 600, fontFamily: 'serif' }}>
              {content.targetPersona}
            </Typography>
          </Box>
        )}

        {/* Points */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {points.map((point, idx) => {
            let html = point.text!
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(new RegExp('<u>(.*?)</u>', 'g'), '<span style="text-decoration: underline;">$1</span>')
              .replace(/\[(.*?)\]\((.*?)\)/g, `<a href="$2" target="_blank" rel="noopener noreferrer" style="color: ${urgencyColor}; text-decoration: underline;">$1</a>`);

            return (
              <Box key={idx}>
                <Typography sx={{ 
                  color: textColor, 
                  fontSize: '1.1rem', 
                  fontWeight: 800,
                  mb: 1,
                  fontFamily: 'serif'
                }}>
                  0{idx + 1}. {point.title}
                </Typography>
                <Box sx={{ 
                  color: textColor, 
                  lineHeight: 1.8, 
                  fontSize: '1.05rem',
                  fontWeight: 400,
                  '& p': { m: 0 },
                  '& strong': { fontWeight: 700 },
                  '& a': { color: urgencyColor, textDecoration: 'none', borderBottom: `1px solid ${urgencyColor}` },
                  fontFamily: 'var(--font-inter), Inter, sans-serif'
                }} dangerouslySetInnerHTML={{ __html: html }} />
              </Box>
            )
          })}
        </Box>

        {/* Micro-CTA Button */}
        {content.microCtaId && (
          <Box sx={{ mt: 6, pt: 4, borderTop: `1px solid ${borderColor}`, display: 'flex' }}>
            {(() => {
              const cta = MICRO_CTAS.find(c => c.id === content.microCtaId) || MICRO_CTAS[0];
              return (
                <Button
                  variant="contained"
                  href={cta.url}
                  endIcon={<ArrowIcon fontSize="small" />}
                  disableElevation
                  sx={{
                    bgcolor: textColor,
                    color: bgColor,
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    borderRadius: 0,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: urgencyColor,
                      color: '#fff'
                    }
                  }}
                >
                  {cta.text}
                </Button>
              );
            })()}
          </Box>
        )}
      </Paper>
    </Box>
  );
};


// ==========================================
// OPTION 2: ACTION TIMELINE (For PREPARE & MONITOR)
// ==========================================
const ActionTimelineVariant: React.FC<StrategicDirectiveBlockProps> = ({ content, themeMode }) => {
  const isDark = themeMode === 'dark';
  const bgColor = isDark ? '#111827' : '#ffffff'; 
  const textColor = isDark ? '#f9fafb' : '#111827';
  const mutedTextColor = isDark ? '#9ca3af' : '#6b7280';
  const borderColor = isDark ? '#374151' : '#e5e7eb';

  const urgency = content.urgencyLevel || 'MONITOR';
  const urgencyColor = urgency === 'PREPARE' ? '#f59e0b' : '#3b82f6'; // Amber or Blue

  const points = [
    { text: content.point1, title: "The Threat", icon: <TargetIcon fontSize="small" />, color: '#ef4444' }, // Threat is red
    { text: content.point2, title: "Immediate Action", icon: <ActionIcon fontSize="small" />, color: '#f59e0b' }, // Action is amber
    { text: content.point3, title: "The Long-Term Pivot", icon: <PivotIcon fontSize="small" />, color: '#10b981' }, // Pivot is green
  ].filter(p => !!p.text);

  if (points.length === 0) return null;

  return (
    <Box sx={{ my: 6, display: 'flex', justifyContent: 'center' }}>
      <Paper elevation={isDark ? 0 : 1} sx={{
        width: '100%',
        maxWidth: '800px',
        bgcolor: bgColor,
        borderRadius: '16px',
        border: `1px solid ${borderColor}`,
        p: { xs: 3, md: 5 },
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Soft gradient background glow based on urgency */}
        <Box sx={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: '100px',
          background: `linear-gradient(to bottom, ${alpha(urgencyColor, 0.1)}, transparent)`,
          pointerEvents: 'none'
        }} />

        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 5, position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography sx={{ color: urgencyColor, fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 0.5 }}>
              Strategic Directive
            </Typography>
            <Typography sx={{ color: textColor, fontWeight: 800, fontSize: '1.5rem', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
              Action Sequence: {urgency}
            </Typography>
          </Box>
          {content.targetPersona && (
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ color: mutedTextColor, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Target Persona
              </Typography>
              <Typography sx={{ color: textColor, fontWeight: 700 }}>
                {content.targetPersona}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Timeline Sequence */}
        <Box sx={{ position: 'relative', pl: 1, zIndex: 1 }}>
          {/* Vertical Line */}
          <Box sx={{
            position: 'absolute',
            top: '20px', bottom: '40px', left: '27px',
            width: '2px',
            bgcolor: alpha(borderColor, 0.6),
            zIndex: -1
          }} />

          {points.map((point, idx) => {
            let html = point.text!
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(new RegExp('<u>(.*?)</u>', 'g'), '<span style="text-decoration: underline;">$1</span>')
              .replace(/\[(.*?)\]\((.*?)\)/g, `<a href="$2" target="_blank" rel="noopener noreferrer" style="color: ${point.color}; text-decoration: underline;">$1</a>`);

            return (
              <Box key={idx} sx={{ display: 'flex', gap: 3, mb: idx === points.length - 1 ? 0 : 5 }}>
                {/* Node Icon */}
                <Box sx={{ 
                  width: 36, height: 36, borderRadius: '50%',
                  bgcolor: bgColor,
                  border: `2px solid ${point.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  color: point.color,
                  mt: 0.5,
                  boxShadow: `0 0 15px ${alpha(point.color, 0.2)}`
                }}>
                  {point.icon}
                </Box>
                
                {/* Content */}
                <Box sx={{ flex: 1, pt: 0.5 }}>
                  <Typography sx={{ color: point.color, fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
                    Step 0{idx + 1} // {point.title}
                  </Typography>
                  <Box sx={{ 
                    color: textColor, 
                    lineHeight: 1.7, 
                    fontSize: '1.05rem',
                    '& p': { m: 0 },
                    '& strong': { fontWeight: 700 },
                    '& a': { color: point.color, textDecoration: 'none' },
                    fontFamily: 'var(--font-inter), Inter, sans-serif'
                  }} dangerouslySetInnerHTML={{ __html: html }} />
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Micro-CTA Button */}
        {content.microCtaId && (
          <Box sx={{ mt: 5, pl: { xs: 0, md: '60px' } }}>
            {(() => {
              const cta = MICRO_CTAS.find(c => c.id === content.microCtaId) || MICRO_CTAS[0];
              return (
                <Button
                  variant="contained"
                  href={cta.url}
                  endIcon={<ArrowIcon fontSize="small" />}
                  disableElevation
                  sx={{
                    bgcolor: alpha(urgencyColor, 0.1),
                    color: urgencyColor,
                    fontFamily: 'var(--font-inter), Inter, sans-serif',
                    fontWeight: 700,
                    px: 3,
                    py: 1.5,
                    borderRadius: '8px',
                    textTransform: 'none',
                    border: `1px solid ${alpha(urgencyColor, 0.2)}`,
                    '&:hover': {
                      bgcolor: urgencyColor,
                      color: '#fff'
                    }
                  }}
                >
                  {cta.text}
                </Button>
              );
            })()}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

// ==========================================
// MAIN EXPORT
// ==========================================
export const StrategicDirectiveBlock: React.FC<StrategicDirectiveBlockProps> = (props) => {
  const urgency = props.content.urgencyLevel || 'MONITOR';

  // Dynamic Routing based on urgency
  if (urgency === 'EXECUTE NOW') {
    return <ExecutiveMemoVariant {...props} />;
  }

  return <ActionTimelineVariant {...props} />;
};
