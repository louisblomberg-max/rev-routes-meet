import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Image upload validation
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  // Allow empty type for HEIC files where browser can't detect MIME
  if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Invalid file type. Please use JPEG, PNG, WebP, or HEIC.';
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `File too large. Maximum size is ${MAX_IMAGE_SIZE_MB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`;
  }
  return null;
}
