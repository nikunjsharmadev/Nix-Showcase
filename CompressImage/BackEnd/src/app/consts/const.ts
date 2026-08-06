import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
// CONST
export const PROCESS = process;
export const ENV = PROCESS.env;
export const PORT = Number(ENV.PORT || 3000);
export const isDevelopmentEnv = ENV.TYPE === 'dev';
export const HOSTNAME: string = isDevelopmentEnv ? ENV.HOST_DEV! : ENV.HOST_PROD!;
export const FRONTEND: string = isDevelopmentEnv ? ENV.FRONTEND_DEV! : ENV.FRONTEND_PROD!;
export const UPLOAD_DIR = path.join(PROCESS.cwd(), ENV.UPLOAD_PATH!);
export const UPLOAD_FIELDS = [
  {
    name: 'images',
    maxCount: Number(ENV.MAX_IMAGE_UPLOAD_COUNT),
  },
  {
    name: 'videos',
    maxCount: Number(ENV.MAX_VIDEO_UPLOAD_COUNT),
  },
  {
    name: 'documents',
    maxCount: Number(ENV.MAX_DOCUMENT_UPLOAD_COUNT),
  },
];
export const CHARS_SET = 'abcdefghijklmnopqrstuvwxyz';
