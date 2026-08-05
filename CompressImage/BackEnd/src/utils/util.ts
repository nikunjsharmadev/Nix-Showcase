import dotenv from 'dotenv';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
dotenv.config();
import multer from 'multer';
import { UPLOAD_DIR, UPLOAD_FIELDS, CHARS_SET } from '../consts/index.js';

// CHECK SERVER HEALTH
export async function checkAppHealth(req: Request, res: Response, next: NextFunction) {
  res.status(200).json({
    success: true,
    message: 'Welcome to CompressImage APIs App',
  });
}
// GET RANDOM NAMES
export function getRandomName(length = 5) {
  const chars = Array.from({ length }, () => CHARS_SET[Math.floor(Math.random() * CHARS_SET.length)]);
  return makeFirstCharCapital(chars.join(''));
}
export function makeFirstCharCapital(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
// ERROR HANDLING SERVER
export function handleFatalError(err: Error) {
  console.error(err);
  process.exit(1);
}
// ERROR HANDLING APIs
/**
 * Apis error handling
 */
export function catchApiError(err: Error, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    consoleError(err, req);
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.statusCode,
    });
  }
  consoleError(err, req);
  return res.status(500).json({
    success: false,
    message: `Internal server error`,
    code: 500,
  });
}
export function consoleError(err: unknown, req: Request) {
  console.error({
    message: err instanceof Error ? err.message : `Internal server error`,
    stack: err instanceof Error ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    error: err,
  });
}
// ERROR CUSTOM CLASS
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public success = false,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
  }
}
// PAGENOTFOUND 404
export function pageNotFound(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({
    success: false,
    message: `Try with different API endpoint, no url found: '${req.originalUrl}'`,
  });
}
// ASYNC ROUTE WRAPPER HANDLER
export function asyncWrapper(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return fn(req, res, next).catch(next);
  };
}
// LOG RESPONSE PROCESS TIME OF APIS
export function logTime(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const time = Date.now() - start;
    console.info(`${req.method} ${req.originalUrl} took ${time / 1000} seconds ⌛⌛`);
  });
  next();
}
// GET MULTER CONFIGS
export function getUploadStorageConfig() {
  const destination = function (_: Request, __: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, UPLOAD_DIR);
  };
  const filename = function (_: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    cb(null, `${Date.now()}-${file.originalname}`);
  };
  const multerDiskstorage = { destination, filename };
  const storage = multer.diskStorage(multerDiskstorage);
  const upload = multer({ storage });
  return upload.fields(UPLOAD_FIELDS);
}
