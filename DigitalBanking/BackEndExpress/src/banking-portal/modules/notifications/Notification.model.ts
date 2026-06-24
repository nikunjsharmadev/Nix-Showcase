import { Schema, Types, model } from "mongoose";
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
