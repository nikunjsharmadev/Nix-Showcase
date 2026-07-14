import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import argon2 from 'argon2';
import { User } from '../models/index.js';
import { Role, type CreateRequest, type decodedUser, type UserResponse } from '../types/index.js';
import { BadRequestError, toUserResponse, toUserResponseList } from '../utils/index.js';
// JWT
export function JwtService() {
  function sign(payload: object): string {
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '24h' });
  }
  function verify(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET! as string) as decodedUser;
  }
  return { sign, verify };
}
// AUTH
export function AuthService() {
  const userService = UserService;
  const jwtService = JwtService;
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
    const resetLink = `${process.env.FRONTEND_URL_LOCAL}/reset-password?email=${email}&token=${token}`;
    return { resetLink };
  }
  async function getLoginAccessToken(email: string, password: string): Promise<{ accessToken: string }> {
    const currentUser = await User.findOne({ email });
    if (!currentUser || !currentUser.isVerified || !currentUser.passwordHash) throw new BadRequestError();
    const isValid = await argon2.verify(currentUser.passwordHash, password);
    if (!isValid) throw new BadRequestError();
    const { _id, role } = currentUser;
    const accessToken: string = jwtService().sign({ _id, email, role });
    return { accessToken };
  }
  async function getCookie(email: string): Promise<{ cookiName: string; refereshToken: string }> {
    const currentUser = await User.findOne({ email });
    if (!currentUser) throw new BadRequestError();
    const rememberMe = false; // need to update when impementing feature
    const refreshToken = [];
    if (!rememberMe) throw new BadRequestError();
    const refereshToken = crypto.randomBytes(64).toString('hex');
    const tokenObj = {
      userId: currentUser.id,
      token: refereshToken,
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    };
    refreshToken.push(tokenObj);
    return {
      cookiName: 'refreshToken',
      refereshToken,
    };
  }
  async function registerUser(req: CreateRequest): Promise<UserResponse> {
    return await userService().createUser(req);
  }
  async function verifyEmail(token: string): Promise<{ isVerified: boolean }> {
    if (typeof token !== 'string' || !token) throw new BadRequestError();
    const payload = jwtService().verify(token);
    const user = await User.findByIdAndUpdate(payload.userId, { isVerified: true });
    if (!user) throw new BadRequestError();
    return { isVerified: true };
  }
  async function resendVerifyEmail(email: string): Promise<{ verificationLink: string }> {
    const existingUser = await User.findOne({ email });
    if (!existingUser) throw new BadRequestError();
    const token = generateVerificationToken(existingUser.id);
    const verificationLink = getEmailVerificationLink(token);
    return { verificationLink };
  }
  function getEmailVerificationLink(verificationToken: string) {
    return `${process.env.FRONTEND_URL_LOCAL}/verify-email?token=${verificationToken}`;
  }
  function generateVerificationToken(userId: string): string {
    return jwtService().sign({ userId, purpose: 'email-verification' });
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
  };
}
// USER
export function UserService() {
  const authService = AuthService;
  async function createUser(req: CreateRequest): Promise<UserResponse> {
    const existingUser = await User.findOne({ email: req.email });
    if (existingUser) throw new BadRequestError();
    const passwordHash = await argon2.hash(req.password);
    const isValid = await argon2.verify(passwordHash, req.password);
    if (!isValid) throw new BadRequestError();
    const user = await User.create({ ...req, passwordHash, role: req.role ?? Role.CUSTOMER, isVerified: false });
    if (!user) throw new BadRequestError();
    const userResponse = toUserResponse(user);
    const token = authService().generateVerificationToken(user.id);
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
