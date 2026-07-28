import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'path';
import mongoose from 'mongoose';
import type { CorsOptions } from 'cors';
import type { HelmetOptions } from 'helmet';
dotenv.config();
// CONSTS
export const PROCESS = process;
export const ENV = PROCESS.env;
export const HOSTNAME: string = ENV.TYPE === 'dev' ? ENV.HOST_DEV! : ENV.HOST_PROD!;
export const PORT = Number(ENV.PORT || 3000);
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
export const UPLOAD_DIR = path.join(__dirname, ENV.UPLOAD_PATH!);
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
export const CHARS_SET = 'abcdefghijklmnopqrstuvwxyz';
export const ERROR_MESSAGES = {
  internal: `Internal server error, try again later`,
  pageNotFound: `Try with different API endpoint, no url found: {url}`,
} as const;
export const CORS_CONFIG: CorsOptions = {
  origin: ENV.FRONTEND_DEV!,
  credentials: true,
} as const;
export const HELMET_CONFIG: HelmetOptions = {
  contentSecurityPolicy: false,
  referrerPolicy: { policy: 'no-referrer' },
  strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true },
  xFrameOptions: { action: 'deny' },
  crossOriginResourcePolicy: {
    policy: 'cross-origin',
  },
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
