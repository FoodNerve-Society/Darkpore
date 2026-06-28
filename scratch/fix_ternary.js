const fs = require('fs');

const pagePath = 'app/modular-society/[tenant]/(authenticated)/learn/page.tsx';
let content = fs.readFileSync(pagePath, 'utf8');

// Fix challengesData bug
content = content.replace("challengesData={challengesData}", "challengesData={tenantConfig.com.homepage.challenges}");

const targetStr = `      {(!selectedDraftId || selectedDraftId === null) && selectedDraftId !== 'new' ? (
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
        <>
          <Box sx={{ height: 4, width: '100%', background: \`linear-gradient(90deg, \${currentConfig.color} 0%, \${currentConfig.color}88 50%, #7c3aed 100%)\`, flexShrink: 0, transition: 'background 0.5s ease' }} />`;

const replacement1 = `      {/* Premium Gradient Header Bar - Adapts to Content Type */}
      <Box sx={{ height: 4, width: '100%', background: \`linear-gradient(90deg, \${currentConfig.color} 0%, \${currentConfig.color}88 50%, #7c3aed 100%)\`, flexShrink: 0, transition: 'background 0.5s ease' }} />`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacement1);
} else {
    console.log("Could not find targetStr");
    process.exit(1);
}

// Fix back button action
content = content.replace(
    `<IconButton
                    onClick={() => setIsFlipped(false)}`,
    `<IconButton
                    onClick={() => {
                      if ((!selectedDraftId || selectedDraftId === null) && selectedDraftId !== 'new') {
                        setIsFlipped(false);
                      } else {
                        setSelectedDraftId(null);
                        setCreateContentType('');
                      }
                    }}`
);

// Fix title text
content = content.replace(
    `Create {currentConfig.label}`,
    `{(!selectedDraftId || selectedDraftId === null) && selectedDraftId !== 'new' ? 'Creator Studio' : \`Create \${currentConfig.label}\`}`
);

// Place ternary before CreateLearnContentForm
const formStart = `{/* Form Body — takes remaining space */}
                <CreateLearnContentForm`;

const replacementForm = `{/* Dashboard vs Form Ternary */}
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

content = content.replace(formStart, replacementForm);

// Remove the closing </> at the end of the form area
const formEnd = `initialType={createContentType}
                />
        </>
      )}
    </Paper>`;

const replacementFormEnd = `initialType={createContentType}
                />
      )}
    </Paper>`;

content = content.replace(formEnd, replacementFormEnd);

fs.writeFileSync(pagePath, content, 'utf8');
console.log("Successfully fixed ternary logic");
