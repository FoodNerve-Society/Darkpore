const fs = require('fs');
const path = require('path');

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
    try {
      const step = JSON.parse(l);
      if (step.tool_calls) {
        for (const tc of step.tool_calls) {
          if (tc.name === 'write_to_file' || tc.name === 'default_api:write_to_file') {
            const args = tc.args || tc.arguments;
            let tf = args.TargetFile;
            if (tf && tf.startsWith('"')) tf = JSON.parse(tf);
            
            if (tf && (tf.includes('trade\\create\\page.tsx') || tf.includes('support\\launch\\page.tsx') || tf.includes('trade\\page.tsx'))) {
              let code = args.CodeContent;
              if (code && code.startsWith('"')) code = JSON.parse(code);
              
              const newPath = tf.replace('app\\society\\(authenticated)', 'app\\modular-society\\[tenant]\\(authenticated)').replace('app/society/(authenticated)', 'app/modular-society/[tenant]/(authenticated)');
              console.log('Restoring', newPath);
              fs.mkdirSync(path.dirname(newPath), { recursive: true });
              fs.writeFileSync(newPath, code);
            }
          }
        }
      }
    } catch(e) { }
  }
}
