import type { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/unauthorized.error.js";
import { STRING_CONSTANT } from "../shared/constants/messages.constants.js";
import type { Role } from "../shared/types/roles.js";
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError(STRING_CONSTANT.error.authHeader);
    }
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
        email: string;
        role: string;
      };
      req.user = decoded;
      next();
    } catch {
      throw new UnauthorizedError(STRING_CONSTANT.error.notValidToken);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      message: STRING_CONSTANT.error.internalServer,
      success: false,
    });
  }
};
export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: STRING_CONSTANT.error.unauthorized,
      });
    }
    if (!roles.includes(req.user.role as Role)) {
      return res.status(403).json({
        message: STRING_CONSTANT.error.forbidden,
      });
    }
    next();
  };
};
