const fs = require('fs');
const mapContent = fs.readFileSync('C:/Users/Darkpore/Documents/darkpore-web/.next/dev/static/chunks/_0y4ydg6._.js.map', 'utf8');
const mapData = JSON.parse(mapContent);
console.log(Object.keys(mapData));
if (mapData.sections) {
  console.log("Has sections:", mapData.sections.length);
  const firstMap = mapData.sections[0].map;
  console.log("Section 0 map keys:", Object.keys(firstMap));
  if (firstMap.sourcesContent) {
    console.log("Section 0 sourcesContent length:", firstMap.sourcesContent.length);
  }
}
