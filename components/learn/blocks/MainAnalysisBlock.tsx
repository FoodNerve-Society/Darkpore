import React from 'react';
import { Box, Typography } from '@mui/material';

type MainAnalysisBlockProps = {
  content: {
    bionicText?: string;
    heading?: string;
    anchorQuestion?: string; // legacy support
    discussionPrompt?: string;
    imageUrl?: string;
  };
  themeMode?: 'light' | 'dark';
};

export const MainAnalysisBlock: React.FC<MainAnalysisBlockProps> = ({ content, themeMode = 'light' }) => {
  const isDark = themeMode === 'dark';

  const MOCK_REPLIES = [
    { id: 1, user: "Dr. Sarah Jenkins", avatar: "https://i.pravatar.cc/150?u=sarah", text: "I've seen this happen in our engineering team. It's usually a communication breakdown." },
    { id: 2, user: "Marcus T.", avatar: "https://i.pravatar.cc/150?u=marcus", text: "Exactly! We implemented a twice-a-week sync and it completely eliminated the bottleneck." }
  ];

  const headingText = content.heading || content.anchorQuestion;
  const isComplete = !!content.bionicText && content.bionicText.trim().length > 0;

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    const paragraphs = text.split(/\n+/).filter(p => p.trim() !== '');
    
    return paragraphs.map((p, i) => {
      let html = p
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(new RegExp('<u>(.*?)</u>', 'g'), '<span style="text-decoration: underline;">$1</span>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #8b5cf6; text-decoration: underline;">$1</a>');
      
      return (
        <Typography 
          key={i}
          sx={{ 
            color: isDark ? 'rgba(255,255,255,0.85)' : '#334155', 
            fontFamily: '"Playfair Display", serif',
            fontSize: { xs: '1.1rem', md: '1.25rem' }, 
            lineHeight: 1.9,
            letterSpacing: '0.01em',
            mb: 2.5, // Creates the one-line paragraph spacing
            '& strong': { fontWeight: 800, color: isDark ? '#fff' : '#0f172a' },
            '& em': { fontStyle: 'italic', color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' },
            '& a': { color: '#8b5cf6', textDecoration: 'underline', transition: 'opacity 0.2s', '&:hover': { opacity: 0.8 } }
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    });
  };

  return (
    <Box sx={{ my: 4 }}>
      {/* Heading */}
      {headingText && (
        <Typography sx={{ 
          fontWeight: 900, 
          fontSize: '1.8rem', 
          mb: 3,
          letterSpacing: '-0.03em',
          background: isDark ? 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)' : 'linear-gradient(135deg, #0f172a 0%, #475569 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {headingText}
        </Typography>
      )}

      {/* Image (Optional) */}
      {content.imageUrl && (
        <Box sx={{ my: 3, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
          <img src={content.imageUrl} alt="Analysis Graphic" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </Box>
      )}

      {/* The Meat (Bionic Text) */}
      {content.bionicText && (
        <Box sx={{ mb: 2 }}>
          {renderMarkdown(content.bionicText)}
        </Box>
      )}

      {/* Threaded Discussion Prompt */}
      {isComplete && (
        <Box sx={{ mt: 8, position: 'relative' }}>
          <Box sx={{ 
            p: { xs: 3, md: 4 }, 
            borderRadius: '24px', 
            bgcolor: isDark ? 'rgba(139, 92, 246, 0.05)' : 'rgba(139, 92, 246, 0.08)', 
            backdropFilter: 'blur(24px)',
            border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)'}`,
            boxShadow: isDark ? 'inset 0 0 0 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.2)' : 'none',
            display: 'flex', 
            alignItems: 'center',
            gap: 3,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 2,
            '&:hover': {
              transform: 'translateY(-2px)',
              bgcolor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
              boxShadow: isDark ? '0 12px 30px rgba(139, 92, 246, 0.15)' : '0 12px 30px rgba(139, 92, 246, 0.12)',
              borderColor: isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.3)',
              '& .discuss-icon': { transform: 'scale(1.1) rotate(5deg)' }
            }
          }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: '#8b5cf6', letterSpacing: '0.05em' }}>
                  Deep Dive
                </Typography>
                <Box sx={{ px: 1, py: 0.25, borderRadius: '10px', bgcolor: 'rgba(139,92,246,0.15)', color: '#8b5cf6', fontSize: '0.7rem', fontWeight: 800 }}>
                  24 Replies
                </Box>
              </Box>
              <Typography sx={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: 600, fontSize: '1.15rem' }}>
                {content.discussionPrompt || "What are your main takeaways from this analysis?"}
              </Typography>
            </Box>
            <Box className="discuss-icon" sx={{ 
              width: 44, height: 44, borderRadius: '50%', 
              bgcolor: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', flexShrink: 0,
              boxShadow: '0 4px 12px rgba(139,92,246,0.3)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontSize: '1.2rem'
            }}>
              💬
            </Box>
          </Box>

          {/* Thread Preview */}
          <Box sx={{ pl: 4, pt: 2, display: 'flex', flexDirection: 'column', gap: 2, position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: -20, bottom: 24, left: 32, width: 2, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
            
            {MOCK_REPLIES.map(reply => (
              <Box key={reply.id} sx={{ 
                p: 2, pl: 2.5, borderRadius: '16px', 
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`,
                display: 'flex', gap: 2, alignItems: 'flex-start',
                position: 'relative',
                width: '90%', ml: 'auto'
              }}>
                <img src={reply.avatar} alt={reply.user} style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(139,92,246,0.3)' }} />
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: isDark ? '#e2e8f0' : '#475569' }}>{reply.user}</Typography>
                  <Typography sx={{ fontSize: '0.9rem', color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', mt: 0.25, lineHeight: 1.4 }}>{reply.text}</Typography>
                </Box>
              </Box>
            ))}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: '10%', pl: 1, cursor: 'pointer', '&:hover p': { color: '#8b5cf6', textDecoration: 'underline' } }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#8b5cf6' }} />
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'rgba(139,92,246,0.5)' }} />
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8', transition: 'color 0.2s' }}>
                View all 24 replies
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};
