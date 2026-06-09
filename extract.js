const fs = require('fs');
const path = require('path');

const ids = [
  'c460925d-9c56-4fc5-93b7-d43594522dce', // Trade
  'dd05273f-94e9-4026-93b2-1cd6a0b8a311', // Learn
  '064adba7-8b21-4f79-92fa-a5c71107e517'  // Support
];

const basePath = 'C:\\Users\\Darkpore\\.gemini\\antigravity\\brain';

for (const id of ids) {
  const logFile = path.join(basePath, id, '.system_generated', 'logs', 'transcript.jsonl');
  if (fs.existsSync(logFile)) {
    const lines = fs.readFileSync(logFile, 'utf8').split('\n');
    for (const line of lines) {
      if (!line) continue;
      try {
        const step = JSON.parse(line);
        if (step.tool_calls) {
          for (const tc of step.tool_calls) {
            if (tc.name === 'write_to_file' || tc.name === 'default_api:write_to_file') {
              let tf = tc.args.TargetFile || tc.arguments?.TargetFile;
              if (tf && tf.startsWith('"')) tf = JSON.parse(tf);
              
              let code = tc.args.CodeContent || tc.arguments?.CodeContent;
              if (code && code.startsWith('"')) code = JSON.parse(code);

              if (tf && code) {
                const newPath = tf.replace('app\\society\\(authenticated)', 'app\\modular-society\\[tenant]\\(authenticated)').replace('app/society/(authenticated)', 'app/modular-society/[tenant]/(authenticated)');
                console.log('Restoring', newPath);
                fs.mkdirSync(path.dirname(newPath), { recursive: true });
                fs.writeFileSync(newPath, code);
              }
            }
          }
        }
      } catch (e) {}
    }
  }
}
console.log('Done restoring from backups.');
