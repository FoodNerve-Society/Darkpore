const fs = require('fs');
const path = 'C:/Users/Darkpore/.gemini/antigravity/brain/b3e68355-9283-48ec-983b-5aeb8f7e3524/.system_generated/logs/transcript.jsonl';
const lines = fs.readFileSync(path, 'utf8').split('\n').filter(Boolean);

let fileLines1 = [];
let fileLines2 = [];

for (const line of lines) {
    const obj = JSON.parse(line);
    if (obj.type === 'ACTION_RESULT') {
        const text = obj.content || '';
        if (text.includes('File Path: `file:///C:/Users/Darkpore/Documents/darkpore-web/app/modular-society/%5Btenant%5D/%28authenticated%29/trade/page.tsx`')) {
            const outputLines = text.split('\n');
            const startIndex = outputLines.findIndex(l => l.match(/^\d+:/));
            const endIndex = outputLines.findIndex(l => l.startsWith('The above content does NOT show'));
            
            const extracted = outputLines.slice(startIndex, endIndex === -1 ? undefined : endIndex).map(l => {
                const match = l.match(/^\d+:(.*)/);
                return match ? match[1].substring(1) : l; // substring(1) to remove leading space
            });
            
            if (text.includes('Showing lines 1 to 800')) {
                fileLines1 = extracted;
            } else if (text.includes('Showing lines 800 to 1562')) {
                fileLines2 = extracted;
            }
        }
    }
}

if (fileLines1.length > 0 && fileLines2.length > 0) {
    const full = fileLines1.concat(fileLines2.slice(1));
    fs.writeFileSync('C:/Users/Darkpore/Documents/darkpore-web/app/modular-society/[tenant]/(authenticated)/trade/page.tsx', full.join('\n'));
    console.log('RECOVERED successfully: ' + full.length + ' lines');
} else {
    console.log('Failed to recover. Parts found: 1=' + fileLines1.length + ', 2=' + fileLines2.length);
}
