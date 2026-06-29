const fs = require('fs');
const path = 'app/modular-society/[tenant]/(authenticated)/components/forms/CreatorStudioDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix the wrapper gap
content = content.replace(
  `<Box sx={{ display: 'flex', gap: 4, overflowX: expandedStartType ? 'hidden' : 'auto', pt: 2, pb: expandedStartType ? 0 : 5, mb: 2, '&::-webkit-scrollbar': { height: 0 }, px: 1, mx: -1, transition: 'all 0.5s ease', flex: expandedStartType ? 1 : '0 0 auto' }}>`,
  `<Box sx={{ display: 'flex', gap: expandedStartType ? 0 : 4, overflowX: expandedStartType ? 'hidden' : 'auto', pt: 2, pb: expandedStartType ? 0 : 5, mb: 2, '&::-webkit-scrollbar': { height: 0 }, transition: 'all 0.5s ease', flex: expandedStartType ? 1 : '0 0 auto' }}>`
);

// 2. Fix the header to add breadcrumb
const headerOld = `<Box>
                      <Typography sx={{ color: opt.color, fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Start Fresh</Typography>
                      <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900, letterSpacing: '-0.02em', mt: 0.5 }}>{opt.title}</Typography>
                    </Box>
                  </Box>`;

const headerNew = `<Box sx={{ display: 'flex', alignItems: 'center', gap: {xs: 1.5, md: 3}, flexWrap: 'wrap' }}>
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
                  </Box>`;
                  
content = content.replace(headerOld, headerNew);

// 3. Fix the categories pillar wrapper to hide fully when locked
const leftBoxOld = `{/* Left: Categories (Rounded Glass Pillars) */}
                      <Box sx={{ 
                        flex: categoryLocked ? '0 0 120px' : '1', 
                        height: { xs: categoryLocked ? '120px' : '100%', md: '100%' }, 
                        transition: 'all 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)', 
                        display: 'flex', flexDirection: { xs: 'row', md: 'column' }, gap: 2, 
                        overflowX: { xs: 'auto', md: 'visible' }, overflowY: { xs: 'hidden', md: 'auto' }, pr: 2, pb: 2 
                      }}>`;

const leftBoxNew = `{/* Left: Categories (Rounded Glass Pillars) */}
                      <Box sx={{ 
                        flex: categoryLocked ? '0 0 0px' : '1', 
                        opacity: categoryLocked ? 0 : 1,
                        height: '100%', 
                        transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)', 
                        display: 'flex', flexDirection: { xs: 'row', md: 'column' }, gap: 2, 
                        overflow: 'hidden', pr: categoryLocked ? 0 : 2, pb: 2 
                      }}>`;

content = content.replace(leftBoxOld, leftBoxNew);

fs.writeFileSync(path, content, 'utf8');
console.log("Layout fixed!");
