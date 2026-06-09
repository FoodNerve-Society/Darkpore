const fs = require('fs');
let code = fs.readFileSync('lib/cms/food/challenges.ts', 'utf8');

code = code.replace(/s approach to solving it\.',/g, "");

fs.writeFileSync('lib/cms/food/challenges.ts', code);
console.log('Fixed syntax!');
