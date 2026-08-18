import dotenv from 'dotenv';
dotenv.config();
import { fileURLToPath } from 'node:url';
import path from 'path';
import mongoose from 'mongoose';
import type { CorsOptions } from 'cors';
import type { HelmetOptions } from 'helmet';
import type { CookieOptions } from 'express';
import type { Options } from 'express-rate-limit';
// CONSTS
export const PROCESS = process;
export const ENV = PROCESS.env;
export const PORT = Number(ENV.PORT || 3000);
export const isDevelopmentEnv = ENV.TYPE === 'dev';
export const HOSTNAME: string = isDevelopmentEnv ? ENV.HOST_DEV! : ENV.HOST_PROD!;
export const FRONTEND: string = isDevelopmentEnv ? ENV.FRONTEND_DEV! : ENV.FRONTEND_PROD!;
export const ACCESS_TOKEN_AGE: number = 30 * 24 * 60 * 60 * 1000;
export const REFRESH_TOKEN_AGE: number = 1 * 24 * 60 * 60 * 1000;
export const HSTS_AGE: number = 365 * 24 * 60 * 60;
const __FILENAME = fileURLToPath(import.meta.url);
const __DIRNAME = path.dirname(__FILENAME);
export const UPLOAD_DIR = path.join(__DIRNAME, ENV.UPLOAD_PATH!);
export const UPLOAD_FIELDS = [
  { name: 'images', maxCount: Number(ENV.MAX_IMAGE_UPLOAD_COUNT) },
  { name: 'videos', maxCount: Number(ENV.MAX_VIDEO_UPLOAD_COUNT) },
  { name: 'documents', maxCount: Number(ENV.MAX_DOCUMENT_UPLOAD_COUNT) },
] as const;
export const MONGOOSE_OPTIONS: mongoose.ConnectOptions = {
  autoIndex: true,
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
} as const;
export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: isDevelopmentEnv ? 'none' : 'lax',
};
export const CORS_CONFIG: CorsOptions = {
  origin: FRONTEND!,
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
} as const;
export const HELMET_CONFIG: HelmetOptions = {
  contentSecurityPolicy: false,
  referrerPolicy: { policy: 'no-referrer' },
  strictTransportSecurity: { maxAge: HSTS_AGE, includeSubDomains: true },
  xFrameOptions: { action: 'deny' },
  crossOriginResourcePolicy: {
    policy: 'cross-origin',
  },
} as const;
export const RATE_LIMIT_CONFIG: Partial<Options> | undefined = {
  windowMs: 15 * 60 * 1000,
  limit: 100,
} as const;
export const CHARS_SET = 'abcdefghijklmnopqrstuvwxyz' as const;
export const ERROR_MESSAGES = {
  internal: `Internal server error, try again later`,
  pageNotFound: `Try with different API endpoint, no url found: {url}`,
} as const;
export const API_ROUTES = {
  root: '/',
  auth: {
    root: '/auth',
    server: '/server',
    register: '/register',
    login: '/login',
    resendVerifyEmail: '/resend-verify-email',
    verifyEmail: '/verify-email',
    forgotPasswordLink: '/forgot-password-link',
    resetPassword: '/reset-password',
    me: '/me',
    refresh: '/refresh',
  },
  users: {
    root: '/users',
    server: '/server',
  },
} as const;
export const STRING_CONSTANT = {
  apiStatus: {
    root: 'Bank api up and running',
    user: 'User api up and running',
    auth: 'Auth api up and running',
  },
  success: {
    success: 'Success',
    userFetch: 'Users fetched successfully',
    emailVerified: 'Email verified',
    passwordReset: 'Password reset successfully',
  },
  messages: {
    resetLinkSent: 'Reset link already sent',
    linkSent: 'Reset link sent to your email address',
    varificationEmail: 'Email sent for varification, check your inbox',
  },
  error: {
    notFound: 'Not found',
    unauthorized: 'Unauthorized',
    badRequest: 'Bad request',
    forbidden: 'Forbidden',
    internalServer: 'Internal server error',
    notValidToken: 'Not valid token provided',
    authHeader: 'No auth header provided',
    emailExist: 'Email already exists',
    credentials: 'Invalid credentials',
    registration: 'Registration failed',
    login: 'Login failed',
    emailVerification: 'Email verification failed',
    emailVerifyFirst: 'Verify your email first',
    noUser: 'User not found',
  },
} as const;
