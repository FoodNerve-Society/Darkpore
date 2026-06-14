const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Darkpore/Documents/darkpore-web/app/modular-society/[tenant]/(authenticated)/components/forms/CreateLearnContentForm.tsx', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('live_poll')) console.log(`${i+1}: ${l}`);
});
