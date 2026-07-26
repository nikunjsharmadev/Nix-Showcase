import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/index.js';
import { JwtService } from '../services/index.js';
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
