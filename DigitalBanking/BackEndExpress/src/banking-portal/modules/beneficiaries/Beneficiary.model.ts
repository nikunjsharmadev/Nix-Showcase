import { Schema, model, Types } from "mongoose";
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
