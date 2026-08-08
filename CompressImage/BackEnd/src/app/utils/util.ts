import dotenv from 'dotenv';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
dotenv.config();
import multer from 'multer';
import { constantFactory } from '../consts/index.js';
import { ApiError } from '../models/model.js';
// UTILS
const createUtils = () => {
  const { UPLOAD_DIR, UPLOAD_FIELDS, CHARS_SET } = constantFactory;
  // CHECK SERVER HEALTH
  const checkAppHealth = (_: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Welcome to CompressImage APIs App',
    });
  };
  // GET RANDOM NAMES
  const getRandomName = (length = 5) => {
    const chars = Array.from({ length }, () => CHARS_SET[Math.floor(Math.random() * CHARS_SET.length)]);
    return makeFirstCharCapital(chars.join(''));
  };
  const makeFirstCharCapital = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  // ERROR HANDLING SERVER
  const handleFatalError = (err: Error) => {
    console.error(err);
    process.exit(1);
  };
  // ERROR HANDLING APIs
  const catchApiError = (err: Error, req: Request, res: Response, _next: NextFunction) => {
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
  };
  const consoleError = (err: unknown, req: Request) => {
    console.error({
      message: err instanceof Error ? err.message : `Internal server error`,
      stack: err instanceof Error ? err.stack : undefined,
      url: req.originalUrl,
      method: req.method,
      error: err,
    });
  };
  // PAGENOTFOUND 404
  const pageNotFound = (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Try with different API endpoint, no url found: '${req.originalUrl}'`,
    });
  };
  // ASYNC ROUTE WRAPPER HANDLER
  const asyncWrapper = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): Promise<void> => {
      return fn(req, res, next).catch(next);
    };
  };
  // LOG RESPONSE PROCESS TIME OF APIS
  const logTime = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const time = Date.now() - start;
      console.info(`${req.method} ${req.originalUrl} took ${time / 1000} seconds ⌛⌛`);
    });
    next();
  };
  // GET MULTER CONFIGS
  const getUploadStorageConfig = () => {
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
  };

  return {
    checkAppHealth,
    getRandomName,
    makeFirstCharCapital,
    handleFatalError,
    catchApiError,
    consoleError,
    pageNotFound,
    asyncWrapper,
    logTime,
    getUploadStorageConfig,
  };
};
export const utilFactory = createUtils();
