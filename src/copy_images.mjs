import fs from 'fs';

const brainDir = 'C:/Users/91934/.gemini/antigravity/brain/c92294b0-6704-483a-a29d-1e4c541b0e6c';
const publicDir = 'C:/Users/91934/.gemini/antigravity/scratch/brownies-and-frames/public/images';

fs.copyFileSync(`${brainDir}/cozy_lifestyle_brownies_1784991858160.jpg`, `${publicDir}/home_brownies.jpg`);
fs.copyFileSync(`${brainDir}/cozy_lifestyle_frames_1784991872908.jpg`, `${publicDir}/home_frames.jpg`);
fs.copyFileSync(`${brainDir}/cozy_lifestyle_gifts_1784991886285.jpg`, `${publicDir}/home_gifts.jpg`);

console.log('Cozy lifestyle images successfully copied to public/images!');
