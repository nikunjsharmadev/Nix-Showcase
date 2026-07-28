import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import argon2 from 'argon2';
import { User } from '../models/index.js';
import { Role, type CreateRequest, type decodedUser, type UserResponse } from '../types/index.js';
import { ApiError, BadRequestError, toUserResponse, toUserResponseList, UnauthorizedError } from '../utils/index.js';
import { ENV } from '../constants/index.js';
// SERVICES
// JWT
export function JwtService() {
  function sign(payload: decodedUser): string {
    return jwt.sign(payload, ENV.JWT_SECRET!, { expiresIn: '24h' });
  }
  function verify(token: string): decodedUser {
    return jwt.verify(token, ENV.JWT_SECRET!) as decodedUser;
  }
  return { sign, verify };
}
// AUTH
export function AuthService() {
  const userService = UserService;
  const jwtService = JwtService;
  async function getLoggedUser(userId: string): Promise<UserResponse> {
    const user = await User.findOne({ id: userId });
    if (!user) throw new UnauthorizedError();
    const loggedUser: UserResponse = toUserResponse(user);
    return { id: user._id.toString(), ...loggedUser };
  }
  function resetToken(): { token: string; hashedToken: string } {
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    return { token, hashedToken };
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
    const { token, hashedToken } = resetToken();
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    user = await user.save();
    if (!user) throw new BadRequestError();
    const resetLink = `${ENV.FRONTEND_LOCAL}/reset-password?email=${email}&token=${token}`;
    return { resetLink };
  }
  async function getLoginAccessToken(email: string, password: string): Promise<{ user: UserResponse & { id: string }; accessToken: string }> {
    const currentUser = await User.findOne({ email });
    if (!currentUser) throw new UnauthorizedError();
    const { passwordHash, isVerified } = currentUser;
    if (!isVerified) throw new ApiError(401, 'user is not verified');
    if (!passwordHash) throw new UnauthorizedError();
    const isValid = await argon2.verify(passwordHash! as string, password);
    if (!isValid) throw new UnauthorizedError();
    const id = currentUser._id.toString();
    const role = currentUser.role;
    const responseUser: UserResponse = toUserResponse(currentUser);
    const accessToken: string = jwtService().sign({ id, email, role });
    const user: UserResponse & { id: string } = { id, ...responseUser };
    return { user, accessToken };
  }
  async function getCookie(email: string): Promise<{ cookieName: string; refereshToken: string }> {
    const currentUser = await User.findOne({ email });
    if (!currentUser) throw new BadRequestError();
    const rememberMe = false; // need to update when impementing feature
    const refreshToken = [];
    if (!rememberMe) throw new BadRequestError();
    const refereshToken = crypto.randomBytes(64).toString('hex');
    const tokenObj = {
      userId: currentUser._id.toString(),
      token: refereshToken,
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    };
    refreshToken.push(tokenObj);
    return {
      cookieName: 'refreshToken',
      refereshToken,
    };
  }
  async function registerUser(req: CreateRequest): Promise<UserResponse> {
    return await userService().createUser(req);
  }
  async function verifyEmail(token: string): Promise<{ isVerified: boolean }> {
    if (typeof token !== 'string' || !token) throw new BadRequestError();
    const payload = jwtService().verify(token);
    const user = await User.findByIdAndUpdate(payload.id, { isVerified: true });
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
    return `${ENV.FRONTEND_LOCAL}/verify-email?token=${verificationToken}`;
  }
  function generateVerificationToken(id: string, email: string, role: string): string {
    return jwtService().sign({ id, email, role, purpose: 'email-verification' });
  }
  return {
    getCookie,
    verifyEmail,
    registerUser,
    resetPassword,
    resendVerifyEmail,
    getLoginAccessToken,
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
