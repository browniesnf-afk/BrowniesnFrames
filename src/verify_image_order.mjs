import fs from 'fs';

const userUploadedDir = 'C:/Users/91934/.gemini/antigravity/brain/c92294b0-6704-483a-a29d-1e4c541b0e6c/.user_uploaded';
const publicDir = 'C:/Users/91934/.gemini/antigravity/scratch/brownies-and-frames/public/images';

// 1. media__1784992647877.jpg = Gifts box with satin ribbon & 'Made with Love' tag
fs.copyFileSync(`${userUploadedDir}/media__1784992647877.jpg`, `${publicDir}/home_gifts.jpg`);

// 2. media__1784992647892.jpg = Light wooden 4-photo collage frame with 'Forever' text & heart
fs.copyFileSync(`${userUploadedDir}/media__1784992647892.jpg`, `${publicDir}/home_frames.jpg`);

console.log('Explicitly mapped and copied:');
console.log('media__1784992647877.jpg -> home_gifts.jpg (Peach gift box with satin bow)');
console.log('media__1784992647892.jpg -> home_frames.jpg (Wooden 4-photo collage frame)');
