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

files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  if (content.includes('addToCart')) {
    console.log(`Found addToCart in: ${path.relative('C:/Users/91934/.gemini/antigravity/scratch/brownies-and-frames', filePath)}`);
  }
});
