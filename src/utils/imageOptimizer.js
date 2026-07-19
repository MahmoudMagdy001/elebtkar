// ponytail: Client-side compression and WebP conversion via Canvas to keep system lightweight.

/**
 * Optimizes an image file by resizing (if needed) and converting it to compressed WebP.
 * @param {File} file - The original image file.
 * @param {number} maxDimension - The maximum width or height.
 * @param {number} quality - WebP compression quality (0.0 to 1.0).
 * @returns {Promise<File>} - Resolves with the optimized WebP image File.
 */
export async function optimizeImage(file, maxDimension = 1920, quality = 0.8) {
  if (!file || !file.type.startsWith('image/')) return file;
  
  // If it's already webp and small, skip canvas processing
  if (file.type === 'image/webp' && file.size < 500 * 1024) return file;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Constraint checking
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Image optimization failed (canvas to blob)'));
              return;
            }
            const optimizedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, "") + ".webp",
              {
                type: 'image/webp',
                lastModified: Date.now(),
              }
            );
            resolve(optimizedFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => reject(new Error('Image loading error'));
    };
    reader.onerror = () => reject(new Error('File reading error'));
  });
}
