import type { Request, Response, NextFunction } from 'express';
import { model, Schema, Types } from 'mongoose';
import type { InferSchemaType } from 'mongoose';
// MODELS
// USER
export const _user = {
  id: Types.ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['customer', 'employee', 'admin'],
    default: 'customer',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  termsAcceptedAt: Date,
  termsVersion: String,
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
} as const;
const userSchema = new Schema(_user, {
  versionKey: false,
  timestamps: true,
});
export type TUser = InferSchemaType<typeof userSchema>;
export const User = model('User', userSchema);
// ACCOUNT
export const accountSchema = new Schema(
  {
    _Id: Types.ObjectId,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accountNumber: String,
    accountType: {
      type: String,
      enum: ['Savings', 'Checking', 'Credit'],
    },
    balance: Number,
    currency: {
      type: String,
      default: 'CAD',
    },
    status: {
      type: String,
      enum: ['Active', 'Frozen', 'Closed'],
      default: 'Active',
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
export const Account = model('Account', accountSchema);
// AUDIT-LOG
export const auditLogSchema = new Schema(
  {
    _id: Types.ObjectId,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: ['login', 'logout', 'transfer', 'update_user, create_account'],
    },
    entity: {
      type: String,
      enum: ['users', 'accounts', 'transactions'],
    },
    entityId: Types.ObjectId,
    ipAddress: String,
    userAgent: String,
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
export const AuditLog = model('AuditLog', auditLogSchema);
// BENIFICIARY
export const beneficiarySchema = new Schema(
  {
    _Id: Types.ObjectId,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: String,
    bankName: String,
    accountNumber: String,
    nickname: String,
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
export const Beneficiary = model('Beneficiary', beneficiarySchema);
// NOTIFICATION
export const notificationSchema = new Schema(
  {
    _Id: Types.ObjectId,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: String,
    message: String,
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'error'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
export const Notification = model('Notification', notificationSchema);
// TRANSACTION
export const transactionSchema = new Schema(
  {
    _Id: Types.ObjectId,
    account: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: Number,
    currency: String,
    fromAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    toAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    description: String,
    referenceNumber: String,
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
export const Transaction = model('Transaction', transactionSchema);
//------------------------------------------------------------------------------
// TYPES
declare global {
  namespace Express {
    interface Request {
      user: { id: string; email: string; role: string };
    }
  }
}
export type IUser = Omit<TUser, 'createdAt' | 'updatedAt' | 'isActive' | 'isVerified' | 'passwordHash'>;
export type CreateRequest = IUser & { password: string };
export type UpdateRequest = {};
export type DeleteRequest = {};
export type UserResponse = IUser & { id?: string; varificationLink?: string };
export type ApiMethodType = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;
export type decodedUser = { id: string; email: string; role: string; purpose?: string };
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
