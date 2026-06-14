const fs = require('fs');

const chunkPath = 'C:/Users/Darkpore/Documents/darkpore-web/.next/dev/static/chunks/_0y4ydg6._.js';
const chunk = fs.readFileSync(chunkPath, 'utf8');

// Find the module definition for CreateLearnContentForm
const startIdx = chunk.indexOf('"[project]/app/modular-society/[tenant]/(authenticated)/components/forms/CreateLearnContentForm.tsx');

if (startIdx === -1) {
  console.log("Module not found.");
  process.exit(1);
}

// Extract a massive block of code from that point
const extracted = chunk.substring(startIdx, startIdx + 200000);

// Stop at the next module definition or just save it
fs.writeFileSync('C:/Users/Darkpore/Documents/darkpore-web/extracted_form.js', extracted, 'utf8');
console.log("Extracted to extracted_form.js");
