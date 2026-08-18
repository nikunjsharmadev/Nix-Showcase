import https from 'https';
import fs from 'fs';
import dotenv from 'dotenv';
import express from 'express';
import type { Express, Request, Response, NextFunction, Router, RequestHandler, CookieOptions } from 'express';
import path from 'path';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import helmet from 'helmet';
import type { HelmetOptions } from 'helmet';
import jwt from 'jsonwebtoken';
import { model, Schema, Types } from 'mongoose';
import type { InferSchemaType } from 'mongoose';
import argon2 from 'argon2';
import crypto from 'crypto';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import rateLimit, { type Options } from 'express-rate-limit';
import compression from 'compression';
dotenv.config();
//-------------------------------------------------------------------------------
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
export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: isDevelopmentEnv ? 'none' : 'lax',
};
export const UPLOAD_DIR = path.join(PROCESS.cwd(), ENV.UPLOAD_PATH!);
export const UPLOAD_FIELDS = [
  { name: 'images', maxCount: Number(ENV.MAX_IMAGE_UPLOAD_COUNT) },
  { name: 'videos', maxCount: Number(ENV.MAX_VIDEO_UPLOAD_COUNT) },
  { name: 'documents', maxCount: Number(ENV.MAX_DOCUMENT_UPLOAD_COUNT) },
] as const;
export const MONGOOSE_OPTIONS: mongoose.ConnectOptions = {
  autoIndex: false,
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
//------------------------------------------------------------------------------
// MODELS
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
// not found error
export class NotFoundError extends ApiError {
  constructor(message = STRING_CONSTANT.error.notFound) {
    super(404, message);
  }
}
// internal server error
export class InternalServer extends ApiError {
  constructor(message = STRING_CONSTANT.error.internalServer) {
    super(500, message);
  }
}
// USER
export const _user = {
  id: Types.ObjectId,
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true,
    index: true,
  },
  phone: String,
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['customer', 'employee', 'admin'],
    default: 'customer',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  refreshTokenHash: String,
  refreshTokenExpiry: Date,
  termsAcceptedAt: Date,
  termsVersion: String,
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
} as const;
const userSchema = new Schema(_user, {
  versionKey: false,
  timestamps: true,
});
export type TUser = InferSchemaType<typeof userSchema>;
export const User = model<TUser>('User', userSchema);
export type UserDocument = mongoose.Document<unknown, {}, TUser> & TUser;
// ACCOUNT
export const accountSchema = new Schema(
  {
    _Id: Types.ObjectId,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accountNumber: String,
    accountType: {
      type: String,
      enum: ['Savings', 'Checking', 'Credit'],
    },
    balance: Number,
    currency: {
      type: String,
      default: 'CAD',
    },
    status: {
      type: String,
      enum: ['Active', 'Frozen', 'Closed'],
      default: 'Active',
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
export const Account = model('Account', accountSchema);
// AUDIT-LOG
export const auditLogSchema = new Schema(
  {
    _id: Types.ObjectId,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: ['login', 'logout', 'transfer', 'update_user, create_account'],
    },
    entity: {
      type: String,
      enum: ['users', 'accounts', 'transactions'],
    },
    entityId: Types.ObjectId,
    ipAddress: String,
    userAgent: String,
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
export const AuditLog = model('AuditLog', auditLogSchema);
// BENIFICIARY
export const beneficiarySchema = new Schema(
  {
    _Id: Types.ObjectId,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: String,
    bankName: String,
    accountNumber: String,
    nickname: String,
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
export const Beneficiary = model('Beneficiary', beneficiarySchema);
// NOTIFICATION
export const notificationSchema = new Schema(
  {
    _Id: Types.ObjectId,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: String,
    message: String,
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'error'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
export const Notification = model('Notification', notificationSchema);
// TRANSACTION
export const transactionSchema = new Schema(
  {
    _Id: Types.ObjectId,
    account: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: Number,
    currency: String,
    fromAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    toAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    description: String,
    referenceNumber: String,
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
export const Transaction = model('Transaction', transactionSchema);
//------------------------------------------------------------------------------
// TYPES
declare global {
  namespace Express {
    interface Request {
      user: { id: string; email: string; role: string };
    }
  }
}
export type IUser = Omit<TUser, 'createdAt' | 'updatedAt' | 'isActive' | 'isVerified' | 'passwordHash'>;
export type CreateRequest = IUser & { password: string };
export type UpdateRequest = {};
export type DeleteRequest = {};
export type UserResponse = IUser & { id?: string; varificationLink?: string };
export type ApiMethodType = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;
export type decodedUser = { id: string; email: string; role: string; purpose?: string };
export type IPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};
export type PaginationResponse<T> = {
  data: T[];
  success: boolean;
  message: string;
  pagination: IPagination;
};
export enum Role {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
  CUSTOMER = 'customer',
}
export type RefreshTokenUser = { user: UserResponse & { id: string }; accessToken: string; refreshToken: string };
//-------------------------------------------------------------------------------
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
  PROCESS.exit(1);
}
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
    message: `${ERROR_MESSAGES.internal}`,
    code: 500,
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
  return (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return fn(req, res, next).catch(next);
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
//--------------------------------------------------------------------------
// SERVICES
// JWT
export function JwtService() {
  function sign(payload: decodedUser): string {
    return jwt.sign(payload, ENV.JWT_SECRET!, { algorithm: 'HS256', expiresIn: '1m' });
  }
  function verify(token: string): decodedUser {
    try {
      const decodedUser = jwt.verify(token, ENV.JWT_SECRET!, { algorithms: ['HS256'] });
      return decodedUser as decodedUser;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError(401, 'Access token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ApiError(401, 'Invalid token');
      }
      throw error;
    }
  }
  return { sign, verify };
}
// AUTH
export function AuthService() {
  const userService = UserService;
  const jwtService = JwtService;
  async function refreshToken(refreshToken: string): Promise<RefreshTokenUser> {
    const hashToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const user = await User.findOne({ refreshTokenHash: hashToken });
    if (!user) throw new UnauthorizedError();
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const newHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    user.refreshTokenHash = newHash;
    await user.save();
    const id = user._id.toString();
    const accessToken: string = jwtService().sign({ id, email: user.email!, role: user.role });
    const responseUser: UserResponse = toUserResponse(user);
    const user_: UserResponse & { id: string } = { id, ...responseUser };
    return { refreshToken: newRefreshToken, accessToken, user: user_ };
  }
  async function getAuthorizeUser(email: string, password: string): Promise<UserDocument> {
    const currentUser = await User.findOne({ email });
    if (!currentUser) throw new UnauthorizedError();
    const { passwordHash, isVerified } = currentUser;
    if (!isVerified) throw new ApiError(401, 'user is not verified');
    if (!passwordHash) throw new UnauthorizedError();
    const isValid = await argon2.verify(passwordHash! as string, password);
    if (!isValid) throw new UnauthorizedError();
    return currentUser;
  }
  async function getLoggedUser(userId: string): Promise<UserResponse> {
    const user = await User.findOne({ id: userId });
    if (!user) throw new UnauthorizedError();
    const loggedUser: UserResponse = toUserResponse(user);
    return { id: user._id.toString(), ...loggedUser };
  }
  function resetToken(): { token: string; hashToken: string } {
    const token = crypto.randomBytes(64).toString('hex');
    const hashToken = crypto.createHash('sha256').update(token).digest('hex');
    return { token, hashToken };
  }
  function getHashedToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
  async function resetPassword(token: string, email: string, newPassword: string): Promise<{ isPasswordReset: boolean }> {
    const hashedToken = getHashedToken(token);
    const user = await User.findOne({ email, resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: new Date() } });
    if (!user) throw new BadRequestError();
    user.passwordHash = await argon2.hash(newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    return { isPasswordReset: true };
  }
  async function getPasswordResetLink(email: string) {
    let user = await User.findOne({ email });
    if (!user) throw new BadRequestError();
    const { token, hashToken } = resetToken();
    user.resetPasswordToken = hashToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    user = await user.save();
    if (!user) throw new BadRequestError();
    const resetLink = `${FRONTEND}/reset-password?email=${email}&token=${token}`;
    return { resetLink };
  }
  async function Login(email: string, password: string): Promise<RefreshTokenUser> {
    const currentUser: UserDocument = await getAuthorizeUser(email, password);
    if (!(currentUser && currentUser._id)) throw new UnauthorizedError();
    const id = currentUser._id.toString();
    const role = currentUser.role;
    const responseUser: UserResponse = toUserResponse(currentUser);
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    currentUser.refreshTokenHash = refreshHash;
    const accessToken: string = jwtService().sign({ id, email, role });
    await currentUser.save();
    const user: UserResponse & { id: string } = { id, ...responseUser };
    return { user, refreshToken, accessToken };
  }
  async function registerUser(req: CreateRequest): Promise<UserResponse> {
    return await userService().createUser(req);
  }
  async function verifyEmail(token: string): Promise<{ isVerified: boolean }> {
    if (typeof token !== 'string' || !token) throw new BadRequestError();
    const payload = jwtService().verify(token);
    const user = await User.findByIdAndUpdate(payload!.id, { isVerified: true });
    if (!user) throw new BadRequestError();
    return { isVerified: true };
  }
  async function resendVerifyEmail(email: string): Promise<{ verificationLink: string }> {
    const existingUser = await User.findOne({ email });
    if (!existingUser) throw new BadRequestError();
    const token = generateVerificationToken(existingUser._id.toString(), existingUser.email || '', existingUser.role || '');
    const verificationLink = getEmailVerificationLink(token);
    return { verificationLink };
  }
  function getEmailVerificationLink(verificationToken: string) {
    return `${FRONTEND}/verify-email?token=${verificationToken}`;
  }
  function generateVerificationToken(id: string, email: string, role: string): string {
    return jwtService().sign({ id, email, role, purpose: 'email-verification' });
  }
  return {
    refreshToken,
    verifyEmail,
    registerUser,
    resetPassword,
    resendVerifyEmail,
    Login,
    getPasswordResetLink,
    getEmailVerificationLink,
    generateVerificationToken,
    getLoggedUser,
  };
}
// USER
export function UserService() {
  const authService = AuthService;
  async function createUser(req: CreateRequest): Promise<UserResponse> {
    const existingUser = await User.findOne({ email: req.email });
    if (existingUser) throw new ApiError(401, 'User already exist');
    const passwordHash = await argon2.hash(req.password);
    const isValid = await argon2.verify(passwordHash, req.password);
    if (!isValid) throw new ApiError(401, 'check password policy');
    const user = await User.create({ ...req, passwordHash, role: req.role ?? Role.CUSTOMER, isVerified: false, termsAcceptedAt: new Date().toISOString(), termsVersion: 'v1.0' });
    if (!user) throw new ApiError(401, 'User not registered, try again later');
    const userResponse = toUserResponse(user);
    const token = authService().generateVerificationToken(user._id.toString(), user.email || '', user.role || '');
    userResponse.varificationLink = authService().getEmailVerificationLink(token);
    return userResponse;
  }
  async function getPaginatedUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [users, totalItems] = await Promise.all([User.find().skip(skip).limit(limit), User.countDocuments()]);
    const totalPages = Math.ceil(totalItems / limit);
    const data = toUserResponseList(users);
    return {
      data,
      page: page,
      limit: limit,
      totalItems: totalItems,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
  return {
    createUser,
    getPaginatedUsers,
  };
}
//--------------------------------------------------------------------------
// CONTROLLERS
// AUTH
export function AuthController() {
  const authService = AuthService;
  async function refresh(req: Request, res: Response): Promise<void> {
    const result = await authService().refreshToken(req.cookies.refreshToken);
    const { accessToken, refreshToken, user } = result;
    res
      .cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 1 * 60 * 1000 })
      .cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 1 * 60 * 1000 })
      .status(200)
      .json({
        success: true,
        data: user,
      });
  }
  async function me(req: Request, res: Response): Promise<void> {
    const { id } = req.user;
    const result = await authService().getLoggedUser(id);
    res.status(200).json({ success: true, data: result });
  }
  async function getResetPasswordLink(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const result = await authService().getPasswordResetLink(email);
    res.status(200).json({
      success: true,
      data: result,
    });
  }
  async function resetPassword(req: Request, res: Response): Promise<void> {
    const { token, email, newPassword } = req.body;
    const result = await authService().resetPassword(token, email, newPassword);
    res.status(200).json({ success: true, data: result });
  }
  async function login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const result = await authService().Login(email, password);
    const { accessToken, user, refreshToken } = result;
    res
      .cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 1 * 60 * 1000 })
      .cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 1 * 60 * 1000 })
      .status(200)
      .json({
        success: true,
        data: user,
      });
  }
  async function registerUser(req: Request, res: Response): Promise<void> {
    const result = await authService().registerUser(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  }
  async function verifyEmail(req: Request, res: Response): Promise<void> {
    const { token } = req.query;
    if (typeof token !== 'string') throw new BadRequestError();
    const result = await authService().verifyEmail(token);
    res.status(200).json({
      success: true,
      data: result,
    });
  }
  async function resendVerifyEmail(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const result = await authService().resendVerifyEmail(email);
    res.status(200).json({
      success: true,
      data: result,
    });
  }
  return {
    refresh,
    login,
    verifyEmail,
    registerUser,
    resetPassword,
    resendVerifyEmail,
    getResetPasswordLink,
    me,
  };
}
// USER
export function UserController() {
  const userService = UserService;
  async function registerUser(req: Request, res: Response): Promise<void> {
    const result = await userService().createUser(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  }
  async function getPaginatedUsers(req: Request, res: Response) {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const result = await userService().getPaginatedUsers(page, limit);
    res.status(200).json({
      success: true,
      data: result,
    });
  }
  return { registerUser, getPaginatedUsers };
}
//--------------------------------------------------------------------------
// MIDDLEWARES
// AUTH
export function AuthMiddleware() {
  async function authenticate(req: Request, _: Response, next: NextFunction): Promise<void> {
    const token = req.cookies.accessToken;
    if (!token) throw new UnauthorizedError();
    const jwtService = JwtService;
    const decoded = jwtService().verify(token)!;
    if (typeof decoded.id === 'string' && typeof decoded.email === 'string' && typeof decoded.role === 'string') {
      req.user = { ...decoded };
    }
    next();
  }
  return { authenticate };
}
//--------------------------------------------------------------------------
// ROUTES
// app
export function AppRoutes() {
  const router = express.Router();
  router.use(`${API_ROUTES.auth.root}`, AuthRoutes(router));
  router.use(`${API_ROUTES.users.root}`, UserRoutes(router));
  return router;
}
// auth
export function AuthRoutes(router: Router) {
  const authCtrl = AuthController;
  const authMiddleware = AuthMiddleware;
  const authPaths = API_ROUTES.auth;
  router.post(`${authPaths.register}`, asyncWrapper(authCtrl().registerUser));
  router.get(`${authPaths.verifyEmail}`, asyncWrapper(authCtrl().verifyEmail));
  router.post(`${authPaths.login}`, asyncWrapper(authCtrl().login));
  router.post(`${authPaths.resendVerifyEmail}`, asyncWrapper(authCtrl().resendVerifyEmail));
  router.post(`${authPaths.forgotPasswordLink}`, asyncWrapper(authCtrl().getResetPasswordLink));
  router.post(`${authPaths.resetPassword}`, asyncWrapper(authCtrl().resetPassword));
  router.get(`${authPaths.me}`, asyncWrapper(authMiddleware().authenticate), asyncWrapper(authCtrl().me));
  router.get(`${authPaths.refresh}`, asyncWrapper(authCtrl().refresh));
  return router;
}
// user
export function UserRoutes(router: Router) {
  const userCtrl = UserController;
  const authMiddleware = AuthMiddleware;
  const userPaths = API_ROUTES.users;
  router.use(asyncWrapper(authMiddleware().authenticate));
  router.get(userPaths.root, authorizeWrapper(Role.ADMIN), asyncWrapper(userCtrl().getPaginatedUsers));
  router.post(userPaths.root, asyncWrapper(userCtrl().registerUser));
  return router;
}
//------------------------------------------------------------------------
// APP USE MIDDLEWARES
export function AppUse(app: Express) {
  app.disable('x-powered-by');
  app.use(helmet(HELMET_CONFIG));
  app.use(cookieParser());
  app.use(express.json());
  app.use(compression());
  app.use(rateLimit(RATE_LIMIT_CONFIG));
  app.use('/api/v1', AppRoutes());
  app.use(pageNotFound);
  app.use(catchApiError);
}
//-------------------------------------------------------------------------
// DATABASE
export async function Database() {
  const dbUrl = isDevelopmentEnv ? ENV.DB_DEV! : ENV.DB_PROD!;
  if (!dbUrl) throw new Error('database url missing');
  try {
    await mongoose.connect(dbUrl, MONGOOSE_OPTIONS);
    console.info('✅ Database connection Success');
    if (mongoose.connection.db) {
      mongoose.connection.db.admin().command({ ping: 1 });
      console.info('Pinged your deployment successfully, connected to MongoDB!');
    }
  } catch (e) {
    console.error(e);
    console.error('❌ Database connection failed');
    PROCESS.exit(1);
  }
}
//-------------------------------------------------------------------------
// APP
export function App() {
  const app = express();
  app.use(logTime);
  app.use(cors(CORS_CONFIG));
  app.get('/api/v1', asyncWrapper(checkAppHealth));
  AppUse(app);
  Database();
  return app;
}
//-------------------------------------------------------------------------
// SERVER
async function Server() {
  try {
    const options = {
      key: fs.readFileSync(path.join(PROCESS.cwd(), 'certs', 'private.key')),
      cert: fs.readFileSync(path.join(PROCESS.cwd(), 'certs', 'certificate.crt')),
    };
    const server = https.createServer(options, App());
    server.listen(PORT, HOSTNAME, () => {
      console.info(`server is up👍 and running🏃🏃 on:
        Url: https://${HOSTNAME}:${PORT}`);
    });
  } catch (err) {
    console.error(err);
    PROCESS.exit(1);
  }
}
Server().catch(handleFatalError);
PROCESS.on('uncaughtException', handleFatalError);
PROCESS.on('unhandledRejection', handleFatalError);
