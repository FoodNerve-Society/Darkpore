const fs = require('fs');
const path = require('path');

const mapPath = 'C:/Users/Darkpore/Documents/darkpore-web/.next/dev/static/chunks/_0y4ydg6._.js.map';
const mapContent = fs.readFileSync(mapPath, 'utf8');

const mapData = JSON.parse(mapContent);

const targetIndex = mapData.sources.findIndex(src => src.includes('CreateLearnContentForm.tsx'));

if (targetIndex === -1) {
  console.log("Could not find CreateLearnContentForm.tsx in sources array!");
  process.exit(1);
}

const originalCode = mapData.sourcesContent[targetIndex];

fs.writeFileSync('C:/Users/Darkpore/Documents/darkpore-web/app/modular-society/[tenant]/(authenticated)/components/forms/CreateLearnContentForm.tsx', originalCode, 'utf8');

console.log("SUCCESS! Restored from source map.");
