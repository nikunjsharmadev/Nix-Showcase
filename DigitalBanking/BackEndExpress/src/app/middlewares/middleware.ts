import type { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/index.js';
import { JwtService } from '../services/index.js';
// AUTH
export function AuthMiddleware() {
  async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new BadRequestError();
    const token = authHeader.substring(7);
    const jwtService = JwtService();
    const decoded = jwtService.verify(token);
    req.user = decoded;
    next();
  }
  return { authenticate };
}
