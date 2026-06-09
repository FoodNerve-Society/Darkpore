const fs = require('fs');
const c = fs.readFileSync('app/modular-society/[tenant]/(authenticated)/support/launch/page.tsx', 'utf8');
let lNum = 1;
for(let i=0; i<c.length; i++) {
  if (c[i] === '\n') lNum++;
  if (c[i] === '`') {
    console.log('Backtick at line', lNum);
  }
}
