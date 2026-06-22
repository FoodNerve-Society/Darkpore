import React from 'react';
import { notFound } from 'next/navigation';
import { Box, Container, Typography, Avatar, Divider } from '@mui/material';
import { getLearnContentBySlug } from '@/lib/actions/learn';
import { ArticleBlockRenderer } from '@/components/learn/ArticleBlockRenderer';

export default async function LearnContentPage({ params }: { params: { tenant: string, slug: string } }) {
  const content = await getLearnContentBySlug(params.slug);

  if (!content) {
    notFound();
  }

  // Determine which layout to show based on the type
  // For now, focusing on 'article'
  if (content.type !== 'article' || !content.article) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h4">Content type {content.type} rendering is coming soon.</Typography>
      </Container>
    );
  }

  const { article } = content;

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', pt: 12, pb: 16 }}>
      <Container maxWidth="md">
        {/* Article Header */}
        <Box sx={{ mb: 6 }}>
          {/* Tags */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            {(() => {
              try {
                const tags = JSON.parse(content.bottleneckTags);
                return tags.map((tag: string, i: number) => (
                  <Box key={i} sx={{ 
                    px: 2, py: 0.5, borderRadius: '12px', 
                    bgcolor: 'rgba(0,0,0,0.04)', color: '#475569', 
                    fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' 
                  }}>
                    {tag}
                  </Box>
                ));
              } catch {
                return null;
              }
            })()}
          </Box>

          <Typography variant="h1" sx={{ color: '#0f172a', fontWeight: 900, fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1.1, letterSpacing: '-0.02em', mb: 3 }}>
            {content.title}
          </Typography>

          <Typography sx={{ color: '#475569', fontSize: { xs: '1.2rem', md: '1.5rem' }, lineHeight: 1.5, mb: 4, fontWeight: 500 }}>
            {content.description}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={content.authorAvatarUrl || ''} sx={{ width: 48, height: 48 }} />
            <Box>
              <Typography sx={{ color: '#0f172a', fontWeight: 700 }}>{content.authorName || 'Anonymous'}</Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                {new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(content.createdAt))}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Thumbnail if present */}
        {content.thumbnailUrl && (
          <Box sx={{ mb: 6, borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <img src={content.thumbnailUrl} alt={content.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
          </Box>
        )}

        {/* Article Blocks */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {article.blocks.map((block: any) => (
            <ArticleBlockRenderer 
              key={block.id} 
              block={{ id: block.id, blockType: block.blockType, content: block.content }} 
              themeMode="light" 
            />
          ))}
        </Box>

        <Divider sx={{ my: 8 }} />
        
        {/* End of article / author bio / footer can go here */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ color: '#64748b', fontWeight: 600 }}>End of Briefing.</Typography>
        </Box>

      </Container>
    </Box>
  );
}
