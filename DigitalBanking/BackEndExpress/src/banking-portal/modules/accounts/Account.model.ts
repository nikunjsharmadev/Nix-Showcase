import { Schema, model, Types } from "mongoose";
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
