/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Image compression and scaling utility
 * Scales large phone photos / screenshots down to a crisp, lightweight base64 string
 * Prevents payload size limits and accelerates AI processing.
 */

export interface CompressedImageResult {
  dataUrl: string;
  base64: string;
  mimeType: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}

export async function compressImage(
  fileOrDataUrl: File | string,
  maxDimension: number = 1600,
  quality: number = 0.82
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    let originalSize = 0;
    let mimeType = 'image/jpeg';

    const processDataUrl = (dataUrl: string) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Fill white background in case of transparent PNG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64 = compressedDataUrl.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

        resolve({
          dataUrl: compressedDataUrl,
          base64,
          mimeType: 'image/jpeg',
          width,
          height,
          originalSize,
          compressedSize: Math.round((base64.length * 3) / 4),
        });
      };

      img.onerror = (err) => reject(new Error('Failed to load image for processing'));
      img.src = dataUrl;
    };

    if (typeof fileOrDataUrl === 'string') {
      originalSize = fileOrDataUrl.length;
      processDataUrl(fileOrDataUrl);
    } else {
      originalSize = fileOrDataUrl.size;
      mimeType = fileOrDataUrl.type || 'image/jpeg';
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        processDataUrl(result);
      };
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
