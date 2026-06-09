const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (const [search, replace] of replacements) {
        content = content.replace(new RegExp(search, 'g'), replace);
    }
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
    }
}

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const targetDir = "C:\\Users\\Darkpore\\Documents\\Darkpore-Web\\app\\modular-society\\[tenant]\\(authenticated)";

const replacements = [
    // Layout
    ["bgcolor: '#f8fafc'", "bgcolor: '#0a120d'"],
    
    // Glass cards
    ['background: "rgba\\(255, 255, 255, 0.65\\)"', 'background: "rgba(255, 255, 255, 0.03)"'],
    ['background: "rgba\\(255, 255, 255, 0.8\\)"', 'background: "rgba(255, 255, 255, 0.05)"'],
    ['border: "1px solid rgba\\(255, 255, 255, 0.4\\)"', 'border: "1px solid rgba(255, 255, 255, 0.08)"'],
    
    // MUI Text Colors (optional, but good for dark mode contrast if not handled by ThemeRegistry)
    ['color: "text.primary"', 'color: "#ffffff"'],
    ['color: "text.secondary"', 'color: "rgba(255, 255, 255, 0.7)"'],
    
    // Default backgrounds
    ['bgcolor: "#ffffff"', 'bgcolor: "rgba(255, 255, 255, 0.03)"'],
    ["bgcolor: '#ffffff'", "bgcolor: 'rgba(255, 255, 255, 0.03)'"],
    ['bgcolor: "white"', 'bgcolor: "rgba(255, 255, 255, 0.03)"'],
    ["bgcolor: 'white'", "bgcolor: 'rgba(255, 255, 255, 0.03)'"]
];

walkDir(targetDir, (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        replaceInFile(filePath, replacements);
    }
});
