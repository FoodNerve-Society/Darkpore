const fs = require('fs');

const path = 'app/modular-society/[tenant]/(authenticated)/components/forms/CreatorStudioDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

const draftsTargetStart = `{/* Drafts Section */}`;
const draftsTargetEnd = `    </Box>
  );
}`;

const startIndex = content.indexOf(draftsTargetStart);
const endIndex = content.indexOf(draftsTargetEnd);

if (startIndex === -1 || endIndex === -1) {
    console.log("Could not find start or end index");
    process.exit(1);
}

const replacement = `{/* Drafts Section */}
      <Box sx={{ mt: 6 }}>
        <style>{\`
          @keyframes pulseDot {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          }
        \`}</style>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
            Active Drafts
          </Typography>
          <Chip label={\`\${drafts.length} In Progress\`} size="small" sx={{ fontWeight: 800, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#059669', borderRadius: '8px', px: 0.5 }} />
        </Box>

        {drafts.length === 0 ? (
          <Paper sx={{ p: 5, borderRadius: '24px', border: '2px dashed rgba(0,0,0,0.08)', bgcolor: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: '#94a3b8', fontWeight: 600 }}>No active drafts found.</Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {drafts.map((draft: any) => {
              const typeColor = draft.type === 'article' ? '#3b82f6' : draft.type === 'video' ? '#ef4444' : draft.type === 'livestream' ? '#10b981' : draft.type === 'class' ? '#8b5cf6' : '#64748b';
              
              return (
                <Paper 
                  key={draft.id} 
                  onClick={() => onEditDraft(draft.id)} 
                  sx={{ 
                    p: { xs: 2.5, md: 3 }, 
                    borderRadius: '24px', 
                    background: 'rgba(255,255,255,0.5)', 
                    backdropFilter: 'blur(30px)', 
                    border: '1px solid rgba(255,255,255,0.9)', 
                    boxShadow: '0 8px 32px rgba(0,0,0,0.04), inset 0 2px 10px rgba(255,255,255,0.6)', 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    position: 'relative', 
                    overflow: 'hidden', 
                    cursor: 'pointer', 
                    transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)', 
                    '&:hover': { 
                      background: 'rgba(255,255,255,0.7)',
                      borderColor: alpha(typeColor, 0.4), 
                      boxShadow: \`0 16px 48px rgba(0,0,0,0.06), inset 0 2px 10px rgba(255,255,255,1), 0 0 0 1px \${alpha(typeColor, 0.2)}\`, 
                      transform: 'translateY(-3px) scale(1.01)', 
                      '& .delete-btn': { opacity: 1, transform: 'translateX(0)' },
                      '& .resume-btn': { bgcolor: '#0f172a', color: '#fff' },
                      '& .resume-arrow': { transform: 'translateX(4px)' }
                    } 
                  }}
                >
                  {/* Left side: Type, Title, Metadata */}
                  <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: alpha(typeColor, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: typeColor, flexShrink: 0 }}>
                      {draft.type === 'article' ? <ArticleIcon /> : draft.type === 'video' ? <VideoLibraryIcon /> : draft.type === 'livestream' ? <LiveTvIcon /> : <SchoolIcon />}
                    </Box>
                    
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: typeColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {draft.type}
                        </Typography>
                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.2)' }} />
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                          Updated {new Date(draft.updatedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, fontSize: '1.2rem', color: '#0f172a', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                        {draft.title || 'Untitled Draft'}
                      </Typography>
                      
                      {/* Content Snapshot / Taxonomy Info if available */}
                      {(draft.category || draft.timeframe) && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          {draft.category && <Chip label={draft.category} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, bgcolor: 'rgba(0,0,0,0.04)' }} />}
                          {draft.timeframe && <Chip label={draft.timeframe} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, bgcolor: 'rgba(0,0,0,0.04)' }} />}
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Right side: Actions */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: { xs: 2, sm: 0 }, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'flex-end', sm: 'auto' } }}>
                    
                    {/* Pulsing "In Progress" */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5, mr: 2 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', animation: 'pulseDot 2s infinite' }} />
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', letterSpacing: '0.05em' }}>IN PROGRESS</Typography>
                    </Box>

                    <Tooltip title="Delete Draft">
                      <IconButton 
                        className="delete-btn" 
                        onClick={(e) => { e.stopPropagation(); onDeleteDraft(draft.id); }} 
                        sx={{ 
                          opacity: { xs: 1, sm: 0 }, 
                          transform: { xs: 'none', sm: 'translateX(10px)' }, 
                          transition: 'all 0.3s', 
                          color: '#ef4444', 
                          bgcolor: 'rgba(239, 68, 68, 0.05)',
                          '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)' } 
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Box 
                      className="resume-btn"
                      sx={{ 
                        display: 'flex', alignItems: 'center', gap: 1, 
                        px: 2.5, py: 1.2, borderRadius: '12px', 
                        bgcolor: 'rgba(0,0,0,0.03)', color: '#334155', 
                        fontWeight: 800, fontSize: '0.85rem',
                        transition: 'all 0.3s'
                      }}
                    >
                      Resume
                      <ArrowForwardIcon className="resume-arrow" sx={{ fontSize: 16, transition: 'transform 0.3s' }} />
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>
`;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully redesigned drafts card and section');
