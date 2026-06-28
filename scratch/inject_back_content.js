const fs = require('fs');

const pagePath = 'app/modular-society/[tenant]/(authenticated)/learn/page.tsx';
const content = fs.readFileSync(pagePath, 'utf8');

const startMarker = "  const backContent = (";
const endMarker = "  return (";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex);

if (startIndex === -1 || endIndex === -1) {
    console.log("Could not find start or end index");
    process.exit(1);
}

const newBackContent = `  const backContent = (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        m: { xs: 0, md: 2 },
        minHeight: { xs: '100vh', md: 'calc(100vh - 32px)' },
        bgcolor: '#ffffff',
        borderRadius: { xs: 0, md: 4 },
        boxShadow: { xs: 'none', md: '0 10px 40px rgba(0,0,0,0.04)' },
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Premium Gradient Header Bar - Adapts to Content Type */}
      <Box sx={{ height: 4, width: '100%', background: \`linear-gradient(90deg, \${currentConfig.color} 0%, \${currentConfig.color}88 50%, #7c3aed 100%)\`, flexShrink: 0, transition: 'background 0.5s ease' }} />
      <Box
        sx={{
          px: { xs: 2.5, md: 3.5 },
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          flexShrink: 0,
        }}
      >
        <IconButton
          onClick={() => {
            if ((!selectedDraftId || selectedDraftId === null) && selectedDraftId !== 'new') {
              setIsFlipped(false);
            } else {
              setCreateContentType('');
              setSelectedDraftId(null);
            }
          }}
          sx={{
            width: 36,
            height: 36,
            bgcolor: 'rgba(0,0,0,0.03)',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.01em', transition: 'color 0.3s ease' }}>
            {(!selectedDraftId || selectedDraftId === null) && selectedDraftId !== 'new' ? 'Creator Studio' : \`Create \${currentConfig.label}\`}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', fontWeight: 600, mt: 0.2 }}>
            Publishing as {postingAs === 'personal' ? (profile?.displayName || 'Unknown') : (profile?.organizations?.find(o => o.id === selectedOrgId)?.name || 'Organization')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Post as Personal">
            <IconButton 
              onClick={() => setPostingAs('personal')}
              sx={{ 
                bgcolor: postingAs === 'personal' ? 'rgba(0,0,0,0.04)' : 'transparent', 
                width: 36, height: 36,
                border: postingAs === 'personal' ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' }
              }}
            >
              <Avatar src={profile?.avatarUrl} sx={{ width: 24, height: 24 }} />
            </IconButton>
          </Tooltip>

          {profile?.organizations && profile.organizations.length > 0 && (
            <Tooltip title="Post as Organization">
              <IconButton 
                onClick={() => setPostingAs('organization')}
                sx={{ 
                  bgcolor: postingAs === 'organization' ? 'rgba(0,0,0,0.04)' : 'transparent', 
                  width: 36, height: 36,
                  border: postingAs === 'organization' ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' }
                }}
              >
                <BusinessIcon sx={{ color: postingAs === 'organization' ? '#0f172a' : '#94a3b8', fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          )}

          {postingAs === 'organization' && profile?.organizations && profile.organizations.length > 0 && (
            <Select
              size="small"
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              renderValue={(selected) => {
                const org = profile.organizations?.find((o: any) => o.id === selected);
                if (!org) return null;
                return (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={org.logoUrl} sx={{ width: 20, height: 20 }} />
                    <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 700, fontSize: '0.85rem' }}>
                      {org.name}
                    </Typography>
                  </Box>
                );
              }}
              sx={{
                ml: 0.5,
                height: 36,
                minWidth: { xs: 60, sm: 140 },
                borderRadius: '12px',
                bgcolor: 'rgba(0,0,0,0.02)',
                '& .MuiOutlinedInput-notchedOutline': { border: '1px solid rgba(0,0,0,0.08)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { border: '1px solid rgba(0,0,0,0.15)' },
                '& .MuiSelect-select': { py: 0, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700, fontSize: '0.85rem' }
              }}
            >
              {profile.organizations.map((org: any) => (
                <MenuItem key={org.id} value={org.id} sx={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Avatar src={org.logoUrl} sx={{ width: 20, height: 20 }} />
                  {org.name}
                </MenuItem>
              ))}
            </Select>
          )}
        </Box>
      </Box>

      {(!selectedDraftId || selectedDraftId === null) && selectedDraftId !== 'new' ? (
        <CreatorStudioDashboard
          drafts={drafts}
          challengesData={tenantConfig.com.homepage.challenges}
          onStartFresh={(type, taxonomy) => {
            setCreateContentType(type);
            setDraftTaxonomy(taxonomy);
            setSelectedDraftId('new');
          }}
          onEditDraft={(draftId) => {
            setSelectedDraftId(draftId);
          }}
          onDeleteDraft={async (draftId) => {
            await deleteLearnContent(draftId);
            setDrafts(drafts.filter((d: any) => d.id !== draftId));
          }}
        />
      ) : (
        <CreateLearnContentForm 
          key={sessionKey}
          onSuccess={() => {
            setIsFlipped(false);
            // Small delay to let the flip animation finish before wiping the form
            setTimeout(() => {
              setCreateContentType('');
              setSelectedDraftId(null);
              setSessionKey(k => k + 1);
            }, 600);
          }} 
          onCancel={() => {
            setCreateContentType('');
            setSelectedDraftId(null);
          }} 
          postingAs={postingAs}
          selectedOrgId={selectedOrgId}
          onTypeChange={(t) => setCreateContentType(t)}
          draftId={selectedDraftId}
          initialTaxonomy={draftTaxonomy}
          initialType={createContentType}
        />
      )}
    </Paper>
  );

`;

const newContent = content.substring(0, startIndex) + newBackContent + content.substring(endIndex);

fs.writeFileSync(pagePath, newContent, 'utf8');
console.log("Successfully replaced backContent");
