import type { CorsOptions } from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import fs from 'fs';
// CONST
const createConstants = () => {
  const PROCESS = process;
  const ENV = PROCESS.env;
  const PORT = Number(ENV['PORT'] || 3000);
  const isDevelopmentEnv = ENV['TYPE'] === 'dev';
  const HOSTNAME: string = isDevelopmentEnv ? ENV['HOST_DEV']! : ENV['HOST_PROD']!;
  const FRONTEND: string = isDevelopmentEnv ? ENV['FRONTEND_DEV']! : ENV['FRONTEND_PROD']!;
  const UPLOAD_DIR = path.join(PROCESS.cwd(), ENV['UPLOAD_PATH']!);
  const UPLOAD_FIELDS = [
    {
      name: 'images',
      maxCount: Number(ENV['MAX_IMAGE_UPLOAD_COUNT']),
    },
    {
      name: 'videos',
      maxCount: Number(ENV['MAX_VIDEO_UPLOAD_COUNT']),
    },
    {
      name: 'documents',
      maxCount: Number(ENV['MAX_DOCUMENT_UPLOAD_COUNT']),
    },
  ];
  const CHARS_SET = 'abcdefghijklmnopqrstuvwxyz';
  const REDIS_CONNECTION = {
    connection: {
      host: ENV['REDIS_HOST'],
      port: Number(ENV['REDIS_PORT']),
    },
  } as const;
  const CORS_OPTIONS = {
    cors: {
      origin: FRONTEND,
      methods: ['GET', 'POST'],
      credentials: true,
    } as CorsOptions,
  };
  const HTTPS_CERTIFICATE_CONFIG = {
    key: fs.readFileSync(path.join(PROCESS.cwd(), 'certs', 'private.key')),
    cert: fs.readFileSync(path.join(PROCESS.cwd(), 'certs', 'certificate.crt')),
  } as const;
  const SERVER_RUN_MESSAGE = `server is up 👍 and running 🏃🏃🏃🏃... on: https://${HOSTNAME}:${PORT}`;
  return {
    PROCESS,
    ENV,
    PORT,
    isDevelopmentEnv,
    HOSTNAME,
    UPLOAD_DIR,
    UPLOAD_FIELDS,
    CHARS_SET,
    REDIS_CONNECTION,
    CORS_OPTIONS,
    HTTPS_CERTIFICATE_CONFIG,
    SERVER_RUN_MESSAGE,
  };
};
export const constantFactory = createConstants();
