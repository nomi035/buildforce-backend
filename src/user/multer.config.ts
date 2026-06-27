import { memoryStorage } from 'multer';

export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/mpeg',
];

export const governmentIdUploadOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
};

export const introVideoUploadOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
};
