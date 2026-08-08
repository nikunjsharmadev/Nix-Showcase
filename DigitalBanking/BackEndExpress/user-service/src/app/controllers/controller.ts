import type { Request, Response } from 'express';
import { AuthService, UserService } from '../services/index.js';
import { BadRequestError } from '../utils/index.js';
import { ACCESS_TOKEN_AGE, COOKIE_OPTIONS, REFRESH_TOKEN_AGE } from '../constants/const.js';
// CONTROLLERS
// AUTH
export function AuthController() {
  const authService = AuthService;
  async function refresh(req: Request, res: Response): Promise<void> {
    const result = await authService().refreshToken(req.cookies.refreshToken);
    const { accessToken, refreshToken, user } = result;
    res
      .cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: ACCESS_TOKEN_AGE })
      .cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: REFRESH_TOKEN_AGE })
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
      .cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: ACCESS_TOKEN_AGE })
      .cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: REFRESH_TOKEN_AGE })
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
