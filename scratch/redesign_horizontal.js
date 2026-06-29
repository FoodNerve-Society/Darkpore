const fs = require('fs');
const path = 'app/modular-society/[tenant]/(authenticated)/components/forms/CreatorStudioDashboard.tsx';

let content = fs.readFileSync(path, 'utf8');

// We are going to replace everything from "      <Box sx={{ display: 'flex', gap: expandedStartType ? 0 : 4"
// Down to "      {/* Hide the drafts section completely if we are expanded in Focus Mode */}"

const startMarker = `      <Box sx={{ display: 'flex', gap: expandedStartType ? 0 : 4`;
const endMarker = `      {/* Hide the drafts section completely if we are expanded in Focus Mode */}`;

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Markers not found");
  process.exit(1);
}

const replacement = `
      {/* Outer Start Fresh Row */}
      <Box 
        id="start-fresh-scroll-container"
        sx={{ 
          display: 'flex', gap: 4, overflowX: 'auto', pt: 2, pb: 5, mb: 2, 
          '&::-webkit-scrollbar': { height: 0 }, transition: 'all 0.5s ease', flex: expandedStartType ? 1 : '0 0 auto',
          scrollBehavior: 'smooth'
        }}
      >
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
            <Paper 
              key={opt.title} 
              id={\`start-fresh-card-\${opt.type}\`}
              onClick={() => { 
                if (!expandedStartType) {
                  setExpandedStartType(opt.type);
                  // Scroll into view
                  setTimeout(() => {
                    const el = document.getElementById(\`start-fresh-card-\${opt.type}\`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                  }, 100);
                } 
              }} 
              sx={{ 
              flex: isExpanded ? '0 0 85vw' : '0 0 260px',
              maxWidth: isExpanded ? '1200px' : '260px',
              height: isExpanded ? '100%' : 'auto',
              minHeight: isExpanded ? 650 : 'auto',
              opacity: isHidden ? 0.3 : 1, overflow: 'hidden', p: isExpanded ? 0 : 3.5, 
              display: 'flex', flexDirection: 'column', gap: 2, borderRadius: isExpanded ? '32px' : '28px', cursor: isExpanded ? 'default' : 'pointer',
              background: isExpanded ? 'rgba(15, 23, 42, 0.85)' : opt.grad, 
              backdropFilter: isExpanded ? 'blur(40px)' : 'none',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: isExpanded ? \`0 24px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)\` : \`inset 0 2px 10px rgba(255,255,255,0.2), 0 10px 30px \${alpha(opt.color, 0.4)}\`,
              position: 'relative', transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
              transform: isHidden ? 'scale(0.9)' : 'scale(1)',
              '&:hover': !isExpanded ? { transform: 'translateY(-4px) scale(1)', boxShadow: \`inset 0 2px 10px rgba(255,255,255,0.3), 0 16px 40px \${alpha(opt.color, 0.5)}\` } : {}
            }}>
              
              {/* Radial glow for expanded state */}
              {isExpanded && (
                <Box sx={{ position: 'absolute', top: '50%', left: '20%', width: '600px', height: '600px', background: \`radial-gradient(circle, \${alpha(opt.color, 0.15)} 0%, transparent 70%)\`, transform: 'translate(-50%, -50%)', zIndex: 0, pointerEvents: 'none' }} />
              )}

              {isExpanded ? (
                <Box sx={{ p: {xs: 3, md: 4}, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                  <IconButton onClick={handleStartFreshClose} sx={{ position: 'absolute', top: 24, right: 24, color: 'rgba(255,255,255,0.6)', bgcolor: 'rgba(255,255,255,0.05)', zIndex: 50, transition: 'all 0.3s', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', transform: 'rotate(90deg)' } }}>
                    <CloseIcon />
                  </IconButton>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: alpha(opt.color, 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center', color: opt.color }}>
                      {opt.icon}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: {xs: 1.5, md: 3}, flexWrap: 'wrap' }}>
                      <Box>
                        <Typography sx={{ color: opt.color, fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Start Fresh</Typography>
                        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900, letterSpacing: '-0.02em', mt: 0.5 }}>{opt.title}</Typography>
                      </Box>
                      
                      {/* BREADCRUMB */}
                      {categoryLocked && selectedCategory && (
                        <>
                          <ArrowForwardIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }} />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1, borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Box sx={{ width: 24, height: 24, borderRadius: '6px', backgroundImage: \`url(\${challengesData.find((c: any) => c.id === selectedCategory)?.imageUrl})\`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>{challengesData.find((c: any) => c.id === selectedCategory)?.title}</Typography>
                            <IconButton 
                              size="small" 
                              onClick={(e) => { e.stopPropagation(); handleResetCategory(); }}
                              sx={{ ml: 1, color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </>
                      )}
                    </Box>
                  </Box>

                  {/* Horizontal Flow layout */}
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    
                    {/* Top: Categories (Horizontal Accordion) */}
                    <Box sx={{ 
                      display: categoryLocked ? 'none' : 'flex', 
                      gap: 2, overflowX: 'auto', flexShrink: 0, pb: 2,
                      '&::-webkit-scrollbar': { height: 0 }
                    }}>
                      {challengesData.map((chal, idx) => {
                        const isActive = activeAccordionIdx === idx;
                        return (
                          <Box key={chal.id} onClick={(e) => { e.stopPropagation(); handleCategorySelect(idx, chal.id); }}
                            sx={{
                              flex: isActive ? '0 0 320px' : '0 0 160px',
                              height: '140px',
                              overflow: 'hidden', position: 'relative', borderRadius: '24px',
                              cursor: 'pointer',
                              border: '1px solid', borderColor: isActive ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.05)',
                              transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                              transformOrigin: 'center center',
                              '&:hover': {
                                flex: isActive ? '0 0 320px' : '0 0 180px',
                                borderColor: 'rgba(255,255,255,0.2)',
                              }
                            }}>
                            <Box sx={{ position: 'absolute', inset: 0, backgroundImage: \`url(\${chal.imageUrl})\`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'transform 0.8s', transform: isActive ? 'scale(1.03)' : 'scale(1)', '&::after': { content: '""', position: 'absolute', inset: 0, background: isActive ? 'linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.8) 100%)' : 'rgba(15,23,42,0.7)', transition: 'background 0.5s' } }} />
                            <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2.5, zIndex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: isActive ? '1.2rem' : '1rem', letterSpacing: '-0.01em', lineHeight: 1.2, transition: 'all 0.4s' }}>{chal.title}</Typography>
                              {isActive && chal.desc && (
                                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{chal.desc}</Typography>
                              )}
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>

                    {/* Bottom: Subcategories & Timeframe */}
                    {categoryLocked && (
                      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden', opacity: showSubcategories ? 1 : 0, transform: showSubcategories ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
                        <Box sx={{ display: 'flex', width: '200%', height: '100%', transform: selectedSubcategory ? 'translateX(-50%)' : 'translateX(0)', transition: 'transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
                          
                          {/* View 1: Subcategories */}
                          <Box sx={{ width: '50%', height: '100%', overflowY: 'auto', p: {xs:0, md:1}, pr: {md: 3}, pb: 8 }}>
                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', mb: 3 }}>Select Topic</Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2, pb: 2 }}>
                              {challengesData.find((c: any) => c.id === selectedCategory)?.subcategories?.map((sub: any) => {
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
                          <Box sx={{ width: '50%', height: '100%', overflowY: 'auto', p: {xs:0, md:1}, pr: {md: 3}, pb: 8, display: 'flex', flexDirection: 'column' }}>
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

`;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);

fs.writeFileSync(path, content, 'utf8');
console.log("Successfully redesigned horizontal flow!");
