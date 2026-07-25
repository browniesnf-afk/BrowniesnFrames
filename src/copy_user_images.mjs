import fs from 'fs';
import path from 'path';

const userUploadedDir = 'C:/Users/91934/.gemini/antigravity/brain/c92294b0-6704-483a-a29d-1e4c541b0e6c/.user_uploaded';
const publicDir = 'C:/Users/91934/.gemini/antigravity/scratch/brownies-and-frames/public/images';

const files = fs.readdirSync(userUploadedDir).map(f => ({
  name: f,
  fullPath: path.join(userUploadedDir, f),
  mtime: fs.statSync(path.join(userUploadedDir, f)).mtimeMs
})).sort((a, b) => b.mtime - a.mtime);

console.log('Recent uploaded files:', files.slice(0, 4));

// The two most recently uploaded user images:
// One is gifts box (peach/tan ribbon bow), one is frames (wooden 4-photo collage frame)
// Let's identify or copy them!

if (files.length >= 2) {
  // Let's check image size/names or copy recent 2
  const latest1 = files[0].fullPath; // frame or gift
  const latest2 = files[1].fullPath; // frame or gift

  console.log('Copying latest 2 user uploaded images...');
  
  // Let's inspect file contents or check order
  // Image 1 (gifts box) was attached first, Image 2 (frames) was attached second
  // In mtime sort: latest1 is frames (media__1784992733191), latest2 is gifts (media__1784992733190)
  
  fs.copyFileSync(files.find(f => f.name.includes('1784992733190'))?.fullPath || files[1].fullPath, `${publicDir}/home_gifts.jpg`);
  fs.copyFileSync(files.find(f => f.name.includes('1784992733191'))?.fullPath || files[0].fullPath, `${publicDir}/home_frames.jpg`);

  console.log('Successfully copied user reference images to public/images/home_gifts.jpg and home_frames.jpg!');
}
