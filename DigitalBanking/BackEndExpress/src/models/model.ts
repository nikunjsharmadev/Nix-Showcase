import { model, Schema, Types } from "mongoose";
import type { InferSchemaType } from "mongoose";
const user = {
  _Id: Types.ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  passwordHash: String,
  role: {
    type: String,
    enum: ["customer", "employee", "admin"],
    default: "customer",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
} as const;
const userSchema = new Schema(user, { versionKey: false, timestamps: true });
export type TUser = InferSchemaType<typeof userSchema>;
export const User = model("User", userSchema);

const accountSchema = new Schema(
  {
    _Id: Types.ObjectId,
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accountNumber: String,
    accountType: {
      type: String,
      enum: ["Savings", "Checking", "Credit"],
    },
    balance: Number,
    currency: {
      type: String,
      default: "CAD",
    },
    status: {
      type: String,
      enum: ["Active", "Frozen", "Closed"],
      default: "Active",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
export const Account = model("Account", accountSchema);
const auditLogSchema = new Schema(
  {
    _id: Types.ObjectId,
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ["login", "logout", "transfer", "update_user, create_account"],
    },
    entity: {
      type: String,
      enum: ["users", "accounts", "transactions"],
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
export const AuditLog = model("AuditLog", auditLogSchema);
const beneficiarySchema = new Schema(
  {
    _Id: Types.ObjectId,
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
export const Beneficiary = model("Beneficiary", beneficiarySchema);
const notificationSchema = new Schema(
  {
    _Id: Types.ObjectId,
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: String,
    message: String,
    type: {
      type: String,
      enum: ["info", "warning", "success", "error"],
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
export const Notification = model("Notification", notificationSchema);
const transactionSchema = new Schema(
  {
    _Id: Types.ObjectId,
    account: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: Number,
    currency: String,
    fromAccountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    toAccountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    description: String,
    referenceNumber: String,
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
export const Transaction = model("Transaction", transactionSchema);
