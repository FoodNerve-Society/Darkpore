const fs = require('fs');
const path = require('path');

const mapPath = 'C:/Users/Darkpore/Documents/darkpore-web/.next/dev/static/chunks/_0y4ydg6._.js.map';
const mapContent = fs.readFileSync(mapPath, 'utf8');

const mapData = JSON.parse(mapContent);
console.log(mapData.sources.filter(s => s.toLowerCase().includes('createlearncontent')));
