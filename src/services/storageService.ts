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
  isLocalFallback?: boolean;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/jpg'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Please upload JPG, PNG, or WebP images.`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 15MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller file.`,
    };
  }

  return { valid: true };
}

/**
 * Upload an image to Firebase Storage with automatic timeout and instant WebP fallback.
 * If Firebase Storage is unavailable (bucket not provisioned, unauthorized, or network timeout),
 * it seamlessly returns an optimized WebP data URL so admin operations never hang.
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

  onProgress?.(15);

  // 1. Optimize and compress image into crisp, lightweight WebP
  let fileToUpload = file;
  let optimizedDataUrl = '';

  if (shouldOptimize) {
    try {
      const optimized = await optimizeImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.82,
        convertToWebP: true,
      });
      fileToUpload = optimized.file;
      optimizedDataUrl = optimized.dataUrl;
    } catch (err) {
      console.warn('Image optimization skipped, using original file:', err);
    }
  }

  onProgress?.(30);

  const cleanFileName = `${Date.now()}-${fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const storagePath = `products/${categorySlug || 'general'}/${productId}/${cleanFileName}`;

  // If optimization didn't produce dataUrl, read file as fallback
  if (!optimizedDataUrl) {
    optimizedDataUrl = await new Promise<string>((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.onerror = () => rej(new Error('Failed to read image file'));
      reader.readAsDataURL(fileToUpload);
    });
  }

  // 2. Try Firebase Storage with a strict 4-second timeout
  return new Promise<UploadResult>((resolve) => {
    let hasResolved = false;
    let uploadTask: any = null;

    const safeResolve = (result: UploadResult) => {
      if (!hasResolved) {
        hasResolved = true;
        onProgress?.(100);
        resolve(result);
      }
    };

    // Timeout: if Firebase Storage doesn't connect or upload within 4 seconds,
    // seamlessly fall back to the optimized WebP image
    const timeoutId = setTimeout(() => {
      if (!hasResolved) {
        console.warn(
          'Firebase Storage upload timed out after 4s (likely bucket unprovisioned or offline). Falling back to optimized WebP image.'
        );
        try {
          if (uploadTask && typeof uploadTask.cancel === 'function') {
            uploadTask.cancel();
          }
        } catch (_) {}

        safeResolve({
          url: optimizedDataUrl,
          path: '',
          name: cleanFileName,
          size: fileToUpload.size,
          isLocalFallback: true,
        });
      }
    }, 4000);

    try {
      const storageRef = ref(storage, storagePath);
      uploadTask = uploadBytesResumable(storageRef, fileToUpload, {
        contentType: fileToUpload.type,
        customMetadata: {
          productId,
          categorySlug,
          originalName: file.name,
        },
      });

      uploadTask.on(
        'state_changed',
        (snapshot: any) => {
          if (snapshot.totalBytes > 0) {
            const rawProg = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 70);
            onProgress?.(30 + rawProg);
          }
        },
        (error: any) => {
          clearTimeout(timeoutId);
          console.warn('Firebase Storage upload error, using optimized fallback:', error.message);
          safeResolve({
            url: optimizedDataUrl,
            path: '',
            name: cleanFileName,
            size: fileToUpload.size,
            isLocalFallback: true,
          });
        },
        async () => {
          clearTimeout(timeoutId);
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            safeResolve({
              url,
              path: storagePath,
              name: cleanFileName,
              size: fileToUpload.size,
              isLocalFallback: false,
            });
          } catch (err) {
            console.warn('getDownloadURL failed, using fallback data URL:', err);
            safeResolve({
              url: optimizedDataUrl,
              path: '',
              name: cleanFileName,
              size: fileToUpload.size,
              isLocalFallback: true,
            });
          }
        }
      );
    } catch (e: any) {
      clearTimeout(timeoutId);
      console.warn('Firebase Storage initialization failed, using fallback data URL:', e);
      safeResolve({
        url: optimizedDataUrl,
        path: '',
        name: cleanFileName,
        size: fileToUpload.size,
        isLocalFallback: true,
      });
    }
  });
}

/**
 * Upload category cover image with resilient fallback
 */
export async function uploadCategoryCover(
  file: File,
  categorySlug: string,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) throw new Error(validation.error);

  onProgress?.(20);

  const optimized = await optimizeImage(file, { maxWidth: 1000, quality: 0.82, convertToWebP: true });
  const cleanFileName = `cover-${Date.now()}-${optimized.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const storagePath = `categories/${categorySlug}/${cleanFileName}`;

  onProgress?.(40);

  return new Promise<UploadResult>((resolve) => {
    let hasResolved = false;
    let uploadTask: any = null;

    const safeResolve = (result: UploadResult) => {
      if (!hasResolved) {
        hasResolved = true;
        onProgress?.(100);
        resolve(result);
      }
    };

    const timeoutId = setTimeout(() => {
      if (!hasResolved) {
        try {
          if (uploadTask && typeof uploadTask.cancel === 'function') {
            uploadTask.cancel();
          }
        } catch (_) {}
        safeResolve({
          url: optimized.dataUrl,
          path: '',
          name: cleanFileName,
          size: optimized.file.size,
          isLocalFallback: true,
        });
      }
    }, 4000);

    try {
      const storageRef = ref(storage, storagePath);
      uploadTask = uploadBytesResumable(storageRef, optimized.file);

      uploadTask.on(
        'state_changed',
        (snapshot: any) => {
          if (snapshot.totalBytes > 0) {
            const rawProg = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 60);
            onProgress?.(40 + rawProg);
          }
        },
        (err: any) => {
          clearTimeout(timeoutId);
          console.warn('Category cover cloud upload failed, using fallback:', err.message);
          safeResolve({
            url: optimized.dataUrl,
            path: '',
            name: cleanFileName,
            size: optimized.file.size,
            isLocalFallback: true,
          });
        },
        async () => {
          clearTimeout(timeoutId);
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            safeResolve({
              url,
              path: storagePath,
              name: cleanFileName,
              size: optimized.file.size,
              isLocalFallback: false,
            });
          } catch (_) {
            safeResolve({
              url: optimized.dataUrl,
              path: '',
              name: cleanFileName,
              size: optimized.file.size,
              isLocalFallback: true,
            });
          }
        }
      );
    } catch (_) {
      clearTimeout(timeoutId);
      safeResolve({
        url: optimized.dataUrl,
        path: '',
        name: cleanFileName,
        size: optimized.file.size,
        isLocalFallback: true,
      });
    }
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
