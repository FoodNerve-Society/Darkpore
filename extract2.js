const fs = require('fs');

const ids = [
  'c460925d-9c56-4fc5-93b7-d43594522dce',
  'dd05273f-94e9-4026-93b2-1cd6a0b8a311',
  '064adba7-8b21-4f79-92fa-a5c71107e517'
];

for (const id of ids) {
  const logFile = `C:\\Users\\Darkpore\\.gemini\\antigravity\\brain\\${id}\\.system_generated\\logs\\transcript.jsonl`;
  if (!fs.existsSync(logFile)) continue;
  
  const lines = fs.readFileSync(logFile, 'utf8').split('\n');
  for (const l of lines) {
    if (!l) continue;
    
    // We want trade/page.tsx, trade/create/page.tsx, support/launch/page.tsx, etc.
    if (l.includes('trade\\\\create\\\\page.tsx') || l.includes('support\\\\launch\\\\page.tsx') || l.includes('trade\\\\page.tsx')) {
      const match = l.match(/"CodeContent":"(.*?)","Description"/);
      if (match) {
        try {
          const code = JSON.parse('"' + match[1] + '"');
          const tfMatch = l.match(/"TargetFile":"(.*?)"/);
          if (tfMatch) {
            const tf = JSON.parse('"' + tfMatch[1] + '"');
            const newPath = tf.replace(/\\society\\\(authenticated\)/g, '\\modular-society\\[tenant]\\(authenticated)');
            console.log('Restoring', newPath);
            fs.writeFileSync(newPath, code);
          }
        } catch(e) {
          console.error('Failed to parse', e);
        }
      }
    }
  }
}
