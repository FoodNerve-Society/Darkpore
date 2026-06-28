import os

file_path = r"C:\Users\Darkpore\Documents\darkpore-web\app\modular-society\[tenant]\(authenticated)\learn\page.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix challengesData bug
content = content.replace("challengesData={challengesData}", "challengesData={tenantConfig.com.homepage.challenges}")

# Now fix the ternary
target_str = """      {(!selectedDraftId || selectedDraftId === null) && selectedDraftId !== 'new' ? (
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
          <Box sx={{ height: 4, width: '100%', background: `linear-gradient(90deg, ${currentConfig.color} 0%, ${currentConfig.color}88 50%, #7c3aed 100%)`, flexShrink: 0, transition: 'background 0.5s ease' }} />"""

replacement1 = """      {/* Premium Gradient Header Bar - Adapts to Content Type */}
      <Box sx={{ height: 4, width: '100%', background: `linear-gradient(90deg, ${currentConfig.color} 0%, ${currentConfig.color}88 50%, #7c3aed 100%)`, flexShrink: 0, transition: 'background 0.5s ease' }} />"""

if target_str in content:
    content = content.replace(target_str, replacement1)
else:
    print("Could not find target_str")
    exit(1)

# Fix back button action
old_back_btn = """<IconButton
                    onClick={() => setIsFlipped(false)}"""
new_back_btn = """<IconButton
                    onClick={() => {
                      if ((!selectedDraftId || selectedDraftId === null) && selectedDraftId !== 'new') {
                        setIsFlipped(false);
                      } else {
                        setSelectedDraftId(null);
                        setCreateContentType('');
                      }
                    }}"""
content = content.replace(old_back_btn, new_back_btn)

# Fix title text
old_title = "Create {currentConfig.label}"
new_title = "{(!selectedDraftId || selectedDraftId === null) && selectedDraftId !== 'new' ? 'Creator Studio' : `Create ${currentConfig.label}`}"
content = content.replace(old_title, new_title)

# Place ternary before CreateLearnContentForm
form_start = """{/* Form Body — takes remaining space */}
                <CreateLearnContentForm"""

replacement_form = """{/* Dashboard vs Form Ternary */}
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
                <CreateLearnContentForm"""
content = content.replace(form_start, replacement_form)

# Remove the closing </> at the end of the form area
form_end = """initialType={createContentType}
                />
        </>
      )}
    </Paper>"""

replacement_form_end = """initialType={createContentType}
                />
      )}
    </Paper>"""

content = content.replace(form_end, replacement_form_end)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully fixed ternary logic in page.tsx")
