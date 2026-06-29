const fs = require('fs');
const path = 'app/modular-society/[tenant]/(authenticated)/components/forms/CreatorStudioDashboard.tsx';

let content = fs.readFileSync(path, 'utf8');

const targetStart = `<Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>Start Fresh</Typography>`;
const targetEnd = `{/* Drafts Section */}`;

const startIndex = content.indexOf(targetStart);
const endIndex = content.indexOf(targetEnd);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find targets");
    process.exit(1);
}

const replacement = `{expandedStartType === null && (
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em', transition: 'opacity 0.3s' }}>Start Fresh</Typography>
      )}
      
      <Box sx={{ display: 'flex', gap: 4, overflowX: expandedStartType ? 'hidden' : 'auto', pt: 2, pb: expandedStartType ? 0 : 5, mb: 2, '&::-webkit-scrollbar': { height: 0 }, px: 1, mx: -1, transition: 'all 0.5s ease', flex: expandedStartType ? 1 : '0 0 auto' }}>
        {[{
          type: 'article', title: "Intelligence Brief", desc: "Write an in-depth article or report.",
          icon: <ArticleIcon sx={{ fontSize: 32 }} />, color: "#3b82f6", grad: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)"
        },
        {
          type: 'video', title: "Video Insights", desc: "Share short-form video analysis.",
          icon: <VideoLibraryIcon sx={{ fontSize: 32 }} />, color: "#ef4444", grad: "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)"
        },
        {
          type: 'livestream', title: "Schedule Livestream", desc: "Host a live session.",
          icon: <LiveTvIcon sx={{ fontSize: 32 }} />, color: "#10b981", grad: "linear-gradient(135deg, #065f46 0%, #10b981 100%)"
        },
        {
          type: 'class', title: "Masterclass", desc: "Create a multi-module learning experience.",
          icon: <SchoolIcon sx={{ fontSize: 32 }} />, color: "#8b5cf6", grad: "linear-gradient(135deg, #5b21b6 0%, #8b5cf6 100%)"
        }].map((opt) => {
          const isExpanded = expandedStartType === opt.type;
          const isHidden = expandedStartType !== null && expandedStartType !== opt.type;

          return (
            <Paper key={opt.title} onClick={() => { if (!expandedStartType) setExpandedStartType(opt.type); }} sx={{ 
              flex: isHidden ? '0 0 0%' : (isExpanded ? '1 1 100%' : '0 0 auto'),
              minWidth: isHidden ? 0 : (isExpanded ? '100%' : 260), 
              maxWidth: isHidden ? 0 : (isExpanded ? '100%' : 300), 
              height: isExpanded ? '100%' : 'auto',
              minHeight: isExpanded ? 600 : 'auto',
              opacity: isHidden ? 0 : 1, overflow: 'hidden', p: isExpanded ? 0 : 3.5, 
              display: 'flex', flexDirection: 'column', gap: 2, borderRadius: isExpanded ? '32px' : '28px', cursor: isExpanded ? 'default' : 'pointer',
              background: isExpanded ? 'rgba(15, 23, 42, 0.85)' : opt.grad, 
              backdropFilter: isExpanded ? 'blur(40px)' : 'none',
              border: isExpanded ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.1)',
              boxShadow: isExpanded ? \`0 24px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)\` : \`inset 0 2px 10px rgba(255,255,255,0.2), 0 10px 30px \${alpha(opt.color, 0.4)}\`,
              position: 'relative', transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
              '&:hover': !isExpanded ? { transform: 'translateY(-4px)', boxShadow: \`inset 0 2px 10px rgba(255,255,255,0.3), 0 16px 40px \${alpha(opt.color, 0.5)}\` } : {}
            }}>
              
              {/* Radial glow for expanded state */}
              {isExpanded && (
                <Box sx={{ position: 'absolute', top: '50%', left: '20%', width: '600px', height: '600px', background: \`radial-gradient(circle, \${alpha(opt.color, 0.15)} 0%, transparent 70%)\`, transform: 'translate(-50%, -50%)', zIndex: 0, pointerEvents: 'none' }} />
              )}

              {isExpanded ? (
                <Box sx={{ p: 4, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                  <IconButton onClick={handleStartFreshClose} sx={{ position: 'absolute', top: 24, right: 24, color: 'rgba(255,255,255,0.6)', bgcolor: 'rgba(255,255,255,0.05)', zIndex: 50, transition: 'all 0.3s', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', transform: 'rotate(90deg)' } }}>
                    <CloseIcon />
                  </IconButton>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: alpha(opt.color, 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center', color: opt.color }}>
                      {opt.icon}
                    </Box>
                    <Box>
                      <Typography sx={{ color: opt.color, fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Start Fresh</Typography>
                      <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900, letterSpacing: '-0.02em', mt: 0.5 }}>{opt.title}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ flex: 1, position: 'relative' }}>
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 4 } }}>
                      
                      {/* Left: Categories (Rounded Glass Pillars) */}
                      <Box sx={{ 
                        flex: categoryLocked ? '0 0 120px' : '1', 
                        height: { xs: categoryLocked ? '120px' : '100%', md: '100%' }, 
                        transition: 'all 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)', 
                        display: 'flex', flexDirection: { xs: 'row', md: 'column' }, gap: 2, 
                        overflowX: { xs: 'auto', md: 'visible' }, overflowY: { xs: 'hidden', md: 'auto' }, pr: 2, pb: 2 
                      }}>
                        {challengesData.map((chal, idx) => {
                          const isActive = activeAccordionIdx === idx;
                          const isLocked = categoryLocked;
                          return (
                            <Box key={chal.id} onClick={(e) => {
                              if (!isLocked) {
                                e.stopPropagation();
                                handleCategorySelect(idx, chal.id);
                              } else if (selectedCategory === chal.id) {
                                e.stopPropagation();
                                handleResetCategory();
                              }
                            }}
                            sx={{
                              flex: isLocked ? (selectedCategory === chal.id ? '0 0 auto' : '0 0 0%') : (isActive ? '3' : '1'),
                              minHeight: { xs: '100%', md: isLocked ? (selectedCategory === chal.id ? '100px' : 0) : '80px' },
                              minWidth: { xs: isLocked ? (selectedCategory === chal.id ? '100px' : 0) : '100px', md: '100%' },
                              opacity: isLocked && selectedCategory !== chal.id ? 0 : 1,
                              overflow: 'hidden', position: 'relative', borderRadius: isLocked ? '24px' : '32px',
                              cursor: isLocked && selectedCategory !== chal.id ? 'default' : 'pointer',
                              border: '1px solid', borderColor: isActive && !isLocked ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.05)',
                              transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                              transformOrigin: 'left center',
                              '&:hover': {
                                flex: !isLocked ? (isActive ? '3' : '1.5') : undefined,
                                borderColor: !isLocked ? 'rgba(255,255,255,0.2)' : undefined,
                              }
                            }}>
                              <Box sx={{ position: 'absolute', inset: 0, backgroundImage: \`url(\${chal.imageUrl})\`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'transform 0.8s', transform: isActive ? 'scale(1.03)' : 'scale(1)', '&::after': { content: '""', position: 'absolute', inset: 0, background: isActive && !isLocked ? 'linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.8) 100%)' : 'rgba(15,23,42,0.7)', transition: 'background 0.5s' } }} />
                              <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2.5, zIndex: 1, display: 'flex', flexDirection: 'column', gap: 0.5, transition: 'all 0.5s', opacity: isLocked && selectedCategory === chal.id ? 0 : 1 }}>
                                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: isActive ? '1.2rem' : '0.95rem', letterSpacing: '-0.01em', lineHeight: 1.2, transition: 'all 0.4s' }}>{chal.title}</Typography>
                                {isActive && !isLocked && chal.desc && (
                                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{chal.desc}</Typography>
                                )}
                              </Box>
                              {/* Context Chip Mode when Locked */}
                              {isLocked && selectedCategory === chal.id && (
                                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
                                  <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '0.85rem', textAlign: 'center', lineHeight: 1.2 }}>{chal.title}</Typography>
                                </Box>
                              )}
                            </Box>
                          );
                        })}
                      </Box>

                      {/* Right: Subcategories & Timeframe */}
                      {categoryLocked && (
                        <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden', opacity: showSubcategories ? 1 : 0, transform: showSubcategories ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
                          <Box sx={{ display: 'flex', width: '200%', height: { xs: 'auto', md: '100%' }, transform: selectedSubcategory ? 'translateX(-50%)' : 'translateX(0)', transition: 'transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
                            
                            {/* View 1: Subcategories */}
                            <Box sx={{ width: '50%', height: { xs: 'auto', md: '100%' }, overflowY: { xs: 'visible', md: 'auto' }, p: {xs:0, md:1}, pr: {md: 3}, pb: 8 }}>
                              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', mb: 3 }}>Select Topic</Typography>
                              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, pb: 2 }}>
                                {challengesData.find(c => c.id === selectedCategory)?.subcategories?.map((sub: any) => {
                                  const isSubActive = selectedSubcategory === sub.id;
                                  return (
                                    <Box key={sub.id} onClick={(e) => { e.stopPropagation(); setSelectedSubcategory(sub.id); }} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: '24px', cursor: 'pointer', border: '1px solid', borderColor: isSubActive ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.05)', bgcolor: isSubActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)', transition: 'all 0.3s', '&:hover': { bgcolor: isSubActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)', transform: 'translateY(-2px)' } }}>
                                      <Box sx={{ width: 56, height: 56, borderRadius: '16px', overflow: 'hidden', flexShrink: 0, backgroundImage: \`url(\${sub.imageUrl})\`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid rgba(255,255,255,0.1)' }} />
                                      <Box>
                                        <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}>{sub.title}</Typography>
                                      </Box>
                                    </Box>
                                  );
                                })}
                              </Box>
                            </Box>

                            {/* View 2: Timeframe */}
                            <Box sx={{ width: '50%', height: { xs: 'auto', md: '100%' }, overflowY: { xs: 'visible', md: 'auto' }, p: {xs:0, md:1}, pr: {md: 3}, pb: 8, display: 'flex', flexDirection: 'column' }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', mb: 5 }}>
                                <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>What era of intelligence is this?</Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', mt: 1 }}>Choose the strategic lens for your briefing.</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%', maxWidth: 500 }}>
                                {[
                                  { key: 'past', emoji: '🕰️', label: 'The Autopsy', desc: 'Break down something that no longer works.', color: '#ef4444' },
                                  { key: 'present', emoji: '🔥', label: 'The Playbook', desc: 'Share strategies that are working right now.', color: '#10b981' },
                                  { key: 'future', emoji: '🔮', label: 'The Thesis', desc: 'Predict what will work tomorrow.', color: '#3b82f6' },
                                ].map(tf => (
                                  <Box key={tf.key} onClick={(e) => { e.stopPropagation(); finalizeTaxonomy(tf.key); }} sx={{ display: 'flex', alignItems: 'center', p: 3, borderRadius: '24px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s', '&:hover': { background: 'rgba(255,255,255,0.06)', borderColor: alpha(tf.color, 0.4), transform: 'translateY(-2px)' } }}>
                                    <Box sx={{ fontSize: 40, mr: 3 }}>{tf.emoji}</Box>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.01em', mb: 0.5 }}>{tf.label}</Typography>
                                      <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', fontWeight: 500 }}>{tf.desc}</Typography>
                                    </Box>
                                    <ArrowForwardIcon sx={{ color: tf.color, opacity: 0.5 }} />
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              ) : (
                <>
                  <Box sx={{ position: 'absolute', bottom: -20, right: -20, opacity: 0.15, transform: 'scale(3)', color: '#fff' }}>{opt.icon}</Box>
                  <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', mb: 2, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', position: 'relative', zIndex: 2 }}>{opt.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.01em', position: 'relative', zIndex: 2 }}>{opt.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, lineHeight: 1.5, position: 'relative', zIndex: 2 }}>{opt.desc}</Typography>
                </>
              )}
            </Paper>
          );
        })}
      </Box>

      {/* Hide the drafts section completely if we are expanded in Focus Mode */}
      {!expandedStartType && (
        <Box sx={{ mt: 6 }}>
`;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex + 22);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully redesigned Start Fresh flow');
