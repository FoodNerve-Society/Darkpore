const fs = require('fs');

const pagePath = 'app/modular-society/[tenant]/(authenticated)/learn/page.tsx';
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Remove the ternary condition and Dashboard component from the top of backContent
const partToRemove = `      {(!selectedDraftId || selectedDraftId === null) && selectedDraftId !== 'new' ? (
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
        <>`;

const partToReplaceWith = `      {/* Premium Gradient Header Bar - Adapts to Content Type */}`;

const startIndex = content.indexOf(`      {(!selectedDraftId || selectedDraftId === null) && selectedDraftId !== 'new' ? (`);
if (startIndex === -1) {
    console.log("Could not find start index");
    process.exit(1);
}

const endIndex = content.indexOf(`        <>`, startIndex) + `        <>`.length;

content = content.substring(0, startIndex) + partToReplaceWith + content.substring(endIndex);

// 2. Fix the back button action
const oldBackBtn = `<IconButton
                    onClick={() => setIsFlipped(false)}
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: 'rgba(0,0,0,0.03)',`;

const newBackBtn = `<IconButton
                    onClick={() => {
                      if ((!selectedDraftId || selectedDraftId === null) && selectedDraftId !== 'new') {
                        setIsFlipped(false);
                      } else {
                        setSelectedDraftId(null);
                        setCreateContentType('');
                      }
                    }}
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: 'rgba(0,0,0,0.03)',`;

content = content.replace(oldBackBtn, newBackBtn);

// 3. Fix the title text
const oldTitle = `<Typography sx={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.01em', transition: 'color 0.3s ease' }}>
                      Create {currentConfig.label}
                    </Typography>`;

const newTitle = `<Typography sx={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.01em', transition: 'color 0.3s ease' }}>
                      {(!selectedDraftId || selectedDraftId === null) && selectedDraftId !== 'new' ? 'Creator Studio' : \`Create \${currentConfig.label}\`}
                    </Typography>`;

content = content.replace(oldTitle, newTitle);

// 4. Inject the Dashboard BEFORE the CreateLearnContentForm
const formStart = `{/* Form Body — takes remaining space */}
                <CreateLearnContentForm`;

const newFormStart = `{/* Form Body / Dashboard */}
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
                <CreateLearnContentForm`;

content = content.replace(formStart, newFormStart);

// 5. Remove the trailing </> for the old ternary
const formEnd = `initialType={createContentType}
                />
        </>
      )}
    </Paper>`;

const newFormEnd = `initialType={createContentType}
                />
                )}
    </Paper>`;

content = content.replace(formEnd, newFormEnd);

fs.writeFileSync(pagePath, content, 'utf8');
console.log("Successfully fixed ternary logic completely");
