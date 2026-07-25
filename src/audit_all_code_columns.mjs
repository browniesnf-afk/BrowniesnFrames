import fs from 'fs';
import path from 'path';

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles('C:/Users/91934/.gemini/antigravity/scratch/brownies-and-frames/src');
console.log(`Found ${files.length} code files. Scanning for Supabase usage...\n`);

files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  if (content.includes('.from(')) {
    console.log(`=== File: ${path.relative('C:/Users/91934/.gemini/antigravity/scratch/brownies-and-frames', filePath)} ===`);
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('.from(') || line.includes('insert(') || line.includes('update(') || line.includes('upsert(') || line.includes('select(')) {
        console.log(`  L${index + 1}: ${line.trim()}`);
      }
    });
    console.log('');
  }
});
