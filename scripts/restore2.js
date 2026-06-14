const fs = require('fs');

const maps = [
  'C:/Users/Darkpore/Documents/darkpore-web/.next/dev/static/chunks/_0.hczjm._.js.map',
  'C:/Users/Darkpore/Documents/darkpore-web/.next/dev/static/chunks/_0w45eih._.js.map',
  'C:/Users/Darkpore/Documents/darkpore-web/.next/dev/static/chunks/_0y4ydg6._.js.map'
];

for (const mapPath of maps) {
  try {
    const mapContent = fs.readFileSync(mapPath, 'utf8');
    const mapData = JSON.parse(mapContent);
    
    for (let i = 0; i < mapData.sourcesContent.length; i++) {
      const content = mapData.sourcesContent[i];
      if (content && content.includes('SPIKY_TITLE_TEMPLATES')) {
        console.log(`Found original in ${mapPath} at index ${i}`);
        fs.writeFileSync('C:/Users/Darkpore/Documents/darkpore-web/app/modular-society/[tenant]/(authenticated)/components/forms/CreateLearnContentForm.tsx', content, 'utf8');
        console.log('Restored successfully!');
        process.exit(0);
      }
    }
  } catch(e) {
    console.error(e.message);
  }
}
console.log('Not found in any map files.');
