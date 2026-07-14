import type { Request, Response, NextFunction } from 'express';
import type { TUser } from '../models/index.js';
// TYPES
declare global {
  namespace Express {
    interface Request {
      user: { userId: string; email: string; role: string };
    }
  }
}
export type IUser = Omit<TUser, 'createdAt' | 'updatedAt' | 'isActive' | 'isVerified'>;
export type CreateRequest = IUser & { password: string };
export type UpdateRequest = {};
export type DeleteRequest = {};
export type UserResponse = IUser & { varificationLink?: string };
export type ApiMethodType = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;
export type decodedUser = { userId: string; email: string; role: string };
export type IPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};
export type PaginationResponse<T> = {
  data: T[];
  success: boolean;
  message: string;
  pagination: IPagination;
};
export enum Role {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
  CUSTOMER = 'customer',
}
