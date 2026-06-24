import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app.error.js";
import { STRING_CONSTANT } from "../shared/constants/messages.constants.js";
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: STRING_CONSTANT.error.internalServer,
  });
};
