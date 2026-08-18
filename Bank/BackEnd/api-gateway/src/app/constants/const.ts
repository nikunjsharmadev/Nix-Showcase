import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
export const PROCESS = process;
export const ENV = PROCESS.env;
export const PORT = Number(ENV.PORT || 3000);
export const isDevelopmentEnv = ENV.TYPE === 'dev';
export const HOSTNAME: string = isDevelopmentEnv ? ENV.HOST_DEV! : ENV.HOST_PROD!;
export const SERVERCONFIGS = {
  key: fs.readFileSync(path.join(PROCESS.cwd(), 'certs', 'private.key')),
  cert: fs.readFileSync(path.join(PROCESS.cwd(), 'certs', 'certificate.crt')),
} as const;
