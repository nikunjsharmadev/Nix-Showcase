import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { CHARS_SET, STRING_CONSTANT, ERROR_MESSAGES } from '../constants/index.js';
import type { IUser, Role, UserResponse } from '../types/index.js';
// UTILS
// user response mapper
export const toUserResponse = (user_: any): UserResponse => {
  return {
    firstName: user_.firstName,
    lastName: user_.lastName,
    email: user_.email,
    phone: user_.phone,
    role: user_.role,
  };
};
// user response list mapper -> []
export const toUserResponseList = (users: any[]): UserResponse[] => {
  return users.map(toUserResponse);
};
// check server health
export async function checkAppHealth(_req: Request, res: Response, _next: NextFunction) {
  res.status(200).json({ success: true, status: 'UP', timestamp: new Date().toISOString(), message: 'Welcome to Banking APIs App' });
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
// ERROR CUSTOM CLASS
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
    Error.captureStackTrace?.(this, this.constructor);
  }
}
// badrequest error
export class BadRequestError extends ApiError {
  constructor(message = STRING_CONSTANT.error.badRequest) {
    super(400, message);
  }
}
// unauthorized error
export class UnauthorizedError extends ApiError {
  constructor(message = STRING_CONSTANT.error.unauthorized) {
    super(401, message);
  }
}
// forbidden error
export class Forbidden extends ApiError {
  constructor(message = STRING_CONSTANT.error.forbidden) {
    super(403, message);
  }
}
/**
 * not found error class
 */
export class NotFoundError extends ApiError {
  constructor(message = STRING_CONSTANT.error.notFound) {
    super(404, message);
  }
}
/**
 * internal server error class
 */
export class InternalServer extends ApiError {
  constructor(message = STRING_CONSTANT.error.internalServer) {
    super(500, message);
  }
}
/**
 * Apis error handling
 */
export function catchApiError(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    consoleError(err, req);
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }
  consoleError(err, req);
  return res.status(500).json({
    success: false,
    message: `${ERROR_MESSAGES.internal}`,
  });
}
export function consoleError(err: unknown, req: Request) {
  console.error({
    message: err instanceof Error ? err.message : `${ERROR_MESSAGES.internal}`,
    stack: err instanceof Error ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    error: err,
  });
}
/**
 * page not found incase wrong api path
 */
export function pageNotFound(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({
    success: false,
    message: ERROR_MESSAGES.pageNotFound.replace('{url}', req.originalUrl),
  });
}
// ASYNC ROUTE WRAPPER HANDLER
export function asyncWrapper(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
// LOG RESPONSE PROCESS TIME OF APIS
export function logTime(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    const time = Date.now() - start;
    console.info(`${req.method} ${req.originalUrl} took ${time / 1000} seconds ⌛⌛`);
  });
  next();
}
export function authorizeWrapper(...roles: Role[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: STRING_CONSTANT.error.unauthorized });
      return;
    }
    if (!roles.includes(user.role as Role)) {
      res.status(403).json({ success: false, message: STRING_CONSTANT.error.forbidden });
      return;
    }
    next();
  };
}
