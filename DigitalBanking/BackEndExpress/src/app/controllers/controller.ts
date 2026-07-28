import type { Request, Response, NextFunction } from 'express';
import { AuthService, UserService, JwtService } from '../services/index.js';
import { BadRequestError, UnauthorizedError } from '../utils/index.js';
// CONTROLLERS
// AUTH
export function AuthController() {
  const authService = AuthService;
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
    const result = await authService().getLoginAccessToken(email, password);
    const { accessToken, user } = result;
    res
      .cookie('access_token', accessToken, {
        httpOnly: true,
        secure: false, // change on production: true
        sameSite: 'lax', // change on production: none
        maxAge: 1000 * 60 * 60 * 24,
      })
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
    const token = req.cookies.access_token;
    if (!token) throw new UnauthorizedError();
    const jwtService = JwtService;
    const decoded = jwtService().verify(token);
    if (typeof decoded.id === 'string' && typeof decoded.email === 'string' && typeof decoded.role === 'string') {
      req.user = { ...decoded };
    }
    next();
  }
  return { authenticate };
}
