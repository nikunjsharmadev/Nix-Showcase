import type { Request, Response } from "express";
import * as authService from "./auth.service.js";
import { STRING_CONSTANT } from "../../shared/constants/messages.constants.js";
import User from "../users/User.model.js";
import { createResetToken, getHashedToken } from "./password-reset.service.js";
import argon2 from "argon2";
export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token } = req.query;
    if (!token) {
      res.status(400).json({
        message: STRING_CONSTANT.error.notValidToken,
      });
      return;
    }
    await authService.verifyEmail(token);
    res.status(200).json({
      success: true,
      message: STRING_CONSTANT.success.emailVerified,
    });
  } catch (error) {
    return internalServerError(res, error);
  }
};
export const resendVerifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;
    const result = await authService.resendVerifyEmail(email);
    if (result) {
      res.status(200).json({
        success: true,
        data: result,
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: STRING_CONSTANT.error.notFound,
    });
  } catch (error) {
    return internalServerError(res, error);
  }
};
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    if (result) {
      res.status(200).json({
        success: true,
        data: result,
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: STRING_CONSTANT.error.login,
    });
  } catch (error) {
    return internalServerError(res, error);
  }
};
export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(201).json({ message: STRING_CONSTANT.messages.resetLinkSent });
      return;
    }
    const { token, hasedToken } = createResetToken();
    user.resetPasswordToken = hasedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    const resetLink = `${process.env.FRONTEND_URL_LOCAL}/reset-password?email=${email}&token=${token}`;
    // await sendEmail(email, resetLink);
    res.status(201).json({
      success: true,
      resetLink,
    });
  } catch (error) {
    return internalServerError(res, error);
  }
};
export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token, email, newPassword } = req.body;
    const hashedToken = getHashedToken(token);
    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
      res.status(400).json({
        message: STRING_CONSTANT.error.notValidToken,
      });
      return;
    }
    user.passwordHash = await argon2.hash(newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    res.status(201).json({
      message: STRING_CONSTANT.success.passwordReset,
    });
  } catch (error) {
    return internalServerError(res, error);
  }
};
const internalServerError = (res: Response, error: unknown) => {
  if (error instanceof Error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
    return;
  }
  res.status(500).json({
    success: false,
    message: STRING_CONSTANT.error.internalServer,
  });
};
