import type { Request, Response } from "express";
import * as authService from "./auth.service.js";
import { STRING_CONSTANT } from "../../shared/constants/messages.constants.js";
export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token } = req.query;
    if (token) {
      await authService.verifyEmail(token);
    }
    res.status(200).json({
      success: true,
      message: STRING_CONSTANT.success.emailVerified,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: STRING_CONSTANT.error.internalServer,
    });
  }
};
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: STRING_CONSTANT.error.internalServer,
    });
  }
};
