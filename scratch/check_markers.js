const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
  if (filePath.includes('node_modules') || filePath.includes('.next') || filePath.includes('.git') || filePath.includes('scratch')) return;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('<<<<<<<') || content.includes('>>>>>>>')) {
      console.log("FOUND MERGE MARKER IN:", filePath);
    }
  } catch (e) {}
}

function walk(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'scratch') {
        walk(fullPath);
      }
    } else {
      checkFile(fullPath);
    }
  });
}

console.log("Checking project files for merge conflict markers...");
walk('C:\\Users\\Darkpore\\Documents\\Darkpore-Web');
console.log("Done checking.");
