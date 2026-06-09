const fs = require('fs');
const path = require('path');

function extract(id) {
  const file = `C:\\Users\\Darkpore\\.gemini\\antigravity\\brain\\${id}\\.system_generated\\logs\\transcript.jsonl`;
  if (!fs.existsSync(file)) {
      console.log('File not found', file);
      return;
  }
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  for (const l of lines) {
    if (!l) continue;
    try {
      const step = JSON.parse(l);
      if (step.tool_calls) {
        for (const tc of step.tool_calls) {
          if (tc.name === 'write_to_file' || tc.name === 'default_api:write_to_file') {
            let argsStr = tc.args || (tc.function && tc.function.arguments);
            let args = typeof argsStr === 'string' ? JSON.parse(argsStr) : argsStr;
            
            if (args && args.TargetFile) {
              let tf = args.TargetFile;
              // strip literal quotes
              if (tf.startsWith('"')) tf = JSON.parse(tf);
              
              let code = args.CodeContent;
              if (code && code.startsWith('"')) code = JSON.parse(code);

              let newPath = tf.replace(/society[\\/]\(authenticated\)/g, 'modular-society\\[tenant]\\(authenticated)');
              newPath = newPath.replace('society/(authenticated)', 'modular-society/[tenant]/(authenticated)');
              
              if (newPath.includes('trade\\page.tsx') || newPath.includes('trade\\create\\page.tsx') || newPath.includes('support\\launch\\page.tsx') || newPath.includes('support\\page.tsx')) {
                console.log('Restoring', newPath);
                fs.mkdirSync(path.dirname(newPath), { recursive: true });
                fs.writeFileSync(newPath, code);
              }
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}

extract('c460925d-9c56-4fc5-93b7-d43594522dce'); // trade
extract('064adba7-8b21-4f79-92fa-a5c71107e517'); // support
