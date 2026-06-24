import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import user from "../users/user.model.js";
import { STRING_CONSTANT } from "../../shared/constants/messages.constants.js";
export const verifyEmail = async (token: any): Promise<void> => {
  try {
    const payload = jwt.verify(token as string, process.env.JWT_SECRET!) as {
      userId: string;
      purpose: string;
    };
    await user.findByIdAndUpdate(payload.userId, { isVerified: true });
  } catch {
    throw new Error(STRING_CONSTANT.error.emailVerification);
  }
};
export const login = async (email: string, password: string) => {
  const currentUser = await user.findOne({ email });
  if (!currentUser) {
    throw new Error(STRING_CONSTANT.error.credentials);
  }
  if (!currentUser.isVerified) {
    throw new Error(STRING_CONSTANT.error.emailVerifyFirst);
  }
  if (currentUser.passwordHash) {
    const isValid = await argon2.verify(currentUser.passwordHash, password);
    if (!isValid) {
      throw new Error(STRING_CONSTANT.error.credentials);
    }
    const token = jwt.sign(
      {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" },
    );
    return { token };
  }
  return {};
};
