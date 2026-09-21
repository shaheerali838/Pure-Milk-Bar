const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(srcPath);
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace cn import
  const cnImportRegex = /import\s+\{\s*cn\s*\}\s+from\s+['"][^'"]*utils\/cn['"];?/;
  if (cnImportRegex.test(content)) {
    const replacement = `import { clsx } from "clsx";\nimport { twMerge } from "tailwind-merge";\n\nconst cn = (...inputs) => twMerge(clsx(inputs));`;
    content = content.replace(cnImportRegex, replacement);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    count++;
  }
});

console.log('Modified files:', count);
