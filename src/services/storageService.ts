import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import { optimizeImage } from '../utils/imageOptimizer';

export interface UploadProgressCallback {
  (progress: number): void;
}

export interface UploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Please upload JPG, PNG, WebP, or AVIF images.`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller file.`,
    };
  }

  return { valid: true };
}

/**
 * Upload an image to Firebase Storage inside products/{categorySlug}/{productId}/{filename}
 */
export async function uploadProductImage(
  file: File,
  categorySlug: string,
  productId: string,
  onProgress?: UploadProgressCallback,
  shouldOptimize = true
): Promise<UploadResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  let fileToUpload = file;
  if (shouldOptimize) {
    try {
      const optimized = await optimizeImage(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.85,
        convertToWebP: true,
      });
      fileToUpload = optimized.file;
    } catch (err) {
      console.warn('Image optimization skipped, uploading original file', err);
    }
  }

  const cleanFileName = `${Date.now()}-${fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const storagePath = `products/${categorySlug || 'general'}/${productId}/${cleanFileName}`;
  const storageRef = ref(storage, storagePath);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload, {
      contentType: fileToUpload.type,
      customMetadata: {
        productId,
        categorySlug,
        originalName: file.name,
      },
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress?.(progress);
      },
      (error) => {
        console.error('Firebase Storage upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url,
            path: storagePath,
            name: cleanFileName,
            size: fileToUpload.size,
          });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

/**
 * Upload category cover image
 */
export async function uploadCategoryCover(
  file: File,
  categorySlug: string,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) throw new Error(validation.error);

  const optimized = await optimizeImage(file, { maxWidth: 1200, quality: 0.85 });
  const cleanFileName = `cover-${Date.now()}-${optimized.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const storagePath = `categories/${categorySlug}/${cleanFileName}`;
  const storageRef = ref(storage, storagePath);

  const uploadTask = uploadBytesResumable(storageRef, optimized.file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress?.(progress);
      },
      reject,
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          url,
          path: storagePath,
          name: cleanFileName,
          size: optimized.file.size,
        });
      }
    );
  });
}

/**
 * Delete image from Firebase Storage
 */
export async function deleteStorageImage(storagePath: string): Promise<void> {
  if (!storagePath) return;
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.warn('Storage delete warning:', error);
  }
}
