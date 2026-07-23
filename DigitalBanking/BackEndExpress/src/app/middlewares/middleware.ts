import type { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/index.js';
import { JwtService } from '../services/index.js';
// AUTH
export function AuthMiddleware() {
  async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const token = req.cookies.access_token;
    if (!token) throw new UnauthorizedError();
    const jwtService = JwtService;
    const decoded = jwtService().verify(token);
    req.user = decoded;
    next();
  }
  return { authenticate };
}
