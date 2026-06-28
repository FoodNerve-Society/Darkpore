const fs = require('fs');

const pagePath = 'app/modular-society/[tenant]/(authenticated)/learn/page.tsx';
let content = fs.readFileSync(pagePath, 'utf8');

const targetStart = `<Box sx={{ height: 4, width: '100%', background: \`linear-gradient(90deg, \${currentConfig.color} 0%, \${currentConfig.color}88 50%, #7c3aed 100%)\`, flexShrink: 0, transition: 'background 0.5s ease' }} />`;

const startIdx = content.indexOf(targetStart);
let endIdx = content.indexOf(`initialType={createContentType}`, startIdx);
if (endIdx !== -1) {
  endIdx = content.indexOf('/>', endIdx) + 2;
}

if (startIdx !== -1 && endIdx !== -1) {
  const extractedSection = content.substring(startIdx, endIdx);
  
  const replacement = `{(!selectedDraftId || selectedDraftId === null) && selectedDraftId !== 'new' ? (
        <CreatorStudioDashboard
          drafts={drafts}
          challengesData={challengesData}
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
          ` + extractedSection.replace(/\n/g, '\n          ') + `
        </>
      )}`;

  const newContent = content.substring(0, startIdx) + replacement + content.substring(endIdx);
  fs.writeFileSync(pagePath, newContent, 'utf8');
  console.log("Successfully updated backContent ternary");
} else {
  console.log("Could not find start/end bounds.", startIdx, endIdx);
}
