const fs = require('fs');
const path = 'C:/Users/Darkpore/.gemini/antigravity/brain/b3e68355-9283-48ec-983b-5aeb8f7e3524/.system_generated/logs/transcript.jsonl';
const lines = fs.readFileSync(path, 'utf8').split('\n').filter(Boolean);

for (const line of lines) {
    const obj = JSON.parse(line);
    if (obj.type === 'ACTION_RESULT') {
        const text = obj.content || '';
        if (text.includes('Showing lines 1 to 800') && text.includes('File Path:')) {
            fs.writeFileSync('C:/Users/Darkpore/Documents/darkpore-web/found1.txt', text);
        }
        if (text.includes('Showing lines 800 to 1562') && text.includes('File Path:')) {
            fs.writeFileSync('C:/Users/Darkpore/Documents/darkpore-web/found2.txt', text);
        }
    }
}
console.log('Done dump');
