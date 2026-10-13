/**
 * Client-side image compression and WebP converter utility.
 * Optimizes images before upload to Firebase Storage to reduce storage usage,
 * accelerate customer load times, and improve mobile performance.
 */

export interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  convertToWebP?: boolean;
}

export async function optimizeImage(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<{ file: File; dataUrl: string; width: number; height: number }> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.85,
    convertToWebP = true,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio-preserved bounding box
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            maxHeight && (height = maxHeight);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas 2D context not available'));
        }

        // Draw image on canvas with high-quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = convertToWebP ? 'image/webp' : file.type;
        const extension = convertToWebP ? '.webp' : file.name.substring(file.name.lastIndexOf('.'));
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Failed to generate optimized image blob'));
            }

            const optimizedFile = new File([blob], `${cleanName}${extension}`, {
              type: mimeType,
              lastModified: Date.now(),
            });

            const dataUrl = canvas.toDataURL(mimeType, quality);
            resolve({
              file: optimizedFile,
              dataUrl,
              width,
              height,
            });
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image for optimization'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Generate a small thumbnail data URL for instant UI preview
 */
export async function generateThumbnail(file: File, size = 160): Promise<string> {
  const { dataUrl } = await optimizeImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    convertToWebP: true,
  });
  return dataUrl;
}
