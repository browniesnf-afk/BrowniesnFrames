import { supabase } from '../supabase/client';

/**
 * Client-Side Image Compression & Resizing
 * Resizes image dimensions to max 1200x1200px and compresses to ~150-350KB JPEG
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<File> {
  // If file is already smaller than 150KB, return as-is
  if (file.size < 150 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate aspect ratio fit
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const fileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
          const compressedFile = new File([blob], fileName, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });

          console.log(
            `Original file size: ${(file.size / 1024).toFixed(1)} KB -> Compressed: ${(compressedFile.size / 1024).toFixed(1)} KB`
          );
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => resolve(file);
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Delete image file from Supabase Storage bucket when removed or replaced
 */
export async function deleteStorageImage(bucketName: string, imageUrl: string) {
  if (!imageUrl || !imageUrl.includes('supabase.co')) return;
  try {
    const parts = imageUrl.split(`/${bucketName}/`);
    if (parts.length > 1) {
      const filePath = parts[1];
      const { error } = await supabase.storage.from(bucketName).remove([filePath]);
      if (error) {
        console.warn(`Notice deleting storage object (${filePath}):`, error.message);
      } else {
        console.log(`Deleted unused storage image: ${filePath}`);
      }
    }
  } catch (err) {
    console.warn('Error deleting old storage image:', err);
  }
}
