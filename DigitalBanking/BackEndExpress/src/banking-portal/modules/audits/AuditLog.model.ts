import { Schema, model, Types } from "mongoose";
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
