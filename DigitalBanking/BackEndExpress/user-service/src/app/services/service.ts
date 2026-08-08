import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import argon2 from 'argon2';
import { User, type UserDocument } from '../models/index.js';
import { Role, type CreateRequest, type decodedUser, type RefreshTokenUser, type UserResponse } from '../types/index.js';
import { ApiError, BadRequestError, toUserResponse, toUserResponseList, UnauthorizedError } from '../utils/index.js';
import { COOKIE_OPTIONS, ENV, FRONTEND } from '../constants/index.js';
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
