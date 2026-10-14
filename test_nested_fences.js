// Test unescaped quotes repair
function repairJsonString(jsonStr) {
  // First attempt: direct parse with trailing comma cleanup
  const clean = jsonStr.replace(/,\s*([\]}])/g, '$1');
  try {
    return JSON.parse(clean);
  } catch (e1) {
    // Attempt 1: Fix unescaped newlines/tabs inside string values
    try {
      const sanitizedNewlines = clean.replace(
        /"([^"\\]*(?:\\.[^"\\]*)*)"/g,
        (match, inner) =>
          '"' +
          inner
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t') +
          '"'
      );
      return JSON.parse(sanitizedNewlines);
    } catch (e2) {
      // Attempt 2: Relaxed quote repair
      // Match patterns where a quote is surrounded by word characters (e.g. the "killer stat" here)
      // and escape it as \"
      try {
        const repairedQuotes = clean.replace(
          /(?<=:\s*"[^"]*?)"([^"]+?)"(?=[^"]*?"\s*[,\]}])/g,
          '\\"$1\\"'
        );
        return JSON.parse(repairedQuotes);
      } catch (e3) {
        // Attempt 3: Line-by-line repair for "key": "value with "inner quotes" "
        try {
          const lines = clean.split('\n');
          const fixedLines = lines.map(line => {
            const m = line.match(/^(\s*"[a-zA-Z0-9_-]+"\s*:\s*)"(.*)"(\s*,?\s*)$/);
            if (m) {
              const prefix = m[1];
              let val = m[2];
              const suffix = m[3];
              // Any quote inside val that is not preceded by \ should be escaped
              val = val.replace(/(?<!\\)"/g, '\\"');
              return `${prefix}"${val}"${suffix}`;
            }
            return line;
          });
          return JSON.parse(fixedLines.join('\n'));
        } catch (e4) {
          throw e1;
        }
      }
    }
  }
}

const inputWithQuotes = `{
  "title": "Field Reality",
  "speakerNotes": "Look at the "killer stat" here, this is the "Mile 12" bottleneck",
  "stat": "₦340B Lost"
}`;

console.log('Result with unescaped quotes:');
console.log(repairJsonString(inputWithQuotes));
