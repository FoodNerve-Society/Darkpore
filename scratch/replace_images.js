const fs = require('fs');

function replaceImages() {
    const file = 'lib/cms/food/challenges.ts';
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    let outLines = [];
    let currentContextId = null;
    let contextType = null;
    
    for (let line of lines) {
        const idMatch = line.match(/id:\s*'([^']+)'/);
        if (idMatch) {
            currentContextId = idMatch[1];
            contextType = 'subcategories';
        }
        
        if (line.includes('longDesc:')) {
            contextType = 'challenges';
        }
        
        if (line.includes('imageUrl:') && currentContextId) {
            const newUrl = `'/images/${contextType}/${currentContextId}.webp'`;
            line = line.replace(/imageUrl:\s*'[^']+'/, `imageUrl: ${newUrl}`);
        }
        
        outLines.push(line);
    }
    
    fs.writeFileSync(file, outLines.join('\n'), 'utf8');
}

replaceImages();
