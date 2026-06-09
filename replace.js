const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const directories = [
  'lib/cms/energy'
];

let files = [];
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    if (fs.statSync(dir).isDirectory()) {
      files = files.concat(walkSync(dir));
    } else {
      files.push(dir);
    }
  }
});

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content
    .replace(/Bottleneck/g, 'Challenge')
    .replace(/bottleneck/g, 'challenge')
    .replace(/BOTTLENECKS/g, 'CHALLENGES');
    
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
});
