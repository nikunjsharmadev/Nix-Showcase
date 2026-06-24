import { Schema, model, Types } from "mongoose";
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
