import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import { fileURLToPath } from 'node:url';
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
export const UPLOAD_DIR = path.join(__dirname, process.env.UPLOAD_PATH!);
export const UPLOAD_FIELDS = [
  {
    name: 'images',
    maxCount: Number(process.env.MAX_IMAGE_UPLOAD_COUNT),
  },
  {
    name: 'videos',
    maxCount: Number(process.env.MAX_VIDEO_UPLOAD_COUNT),
  },
  {
    name: 'documents',
    maxCount: Number(process.env.MAX_DOCUMENT_UPLOAD_COUNT),
  },
];
export const CHARS_SET = 'abcdefghijklmnopqrstuvwxyz';
