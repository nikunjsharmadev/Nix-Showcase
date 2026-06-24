import { Schema, model, Types } from "mongoose";
const userSchema = new Schema(
  {
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
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
export default model("User", userSchema);
