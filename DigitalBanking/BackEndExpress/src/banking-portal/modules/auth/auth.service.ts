import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import user from "../users/User.model.js";
import { STRING_CONSTANT } from "../../shared/constants/messages.constants.js";
import {
  generateVerificationToken,
  getEmailVerificationLink,
} from "../users/user.service.js";
import { toUserResponse } from "../users/user.mapper.js";
import crypto from "crypto";
export const verifyEmail = async (token: any): Promise<void> => {
  try {
    const payload = jwt.verify(token as string, process.env.JWT_SECRET!) as {
      userId: string;
      purpose: string;
    };
    await user.findByIdAndUpdate(payload.userId, { isVerified: true });
    return;
  } catch {
    throw new Error(STRING_CONSTANT.error.emailVerification);
  }
};
export const resendVerifyEmail = async (email: string) => {
  try {
    const existingUser = await user.findOne({
      email,
    });
    if (existingUser) {
      const userResponse = toUserResponse(existingUser);
      userResponse.varificationLink = getEmailVerificationLink(
        generateVerificationToken(existingUser.id),
      );
      return userResponse;
    }
    throw new Error(STRING_CONSTANT.error.notFound);
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
    const accessToken = jwt.sign(
      {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" },
    );

    //Remember me code
    // const rememberMe = false;
    // const refreshToken = [];
    // if (rememberMe) {
    //   const refereshToken = crypto.randomBytes(64).toString("hex");
    //   refreshToken.push({ userId: currentUser.id, token: refereshToken });
    //   res.cookie("refreshToken", refreshToken, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: "strict",
    //     maxAge: 30 * 24 * 60 * 60 * 1000,
    //   });
    // }
    return { accessToken };
  }
  return {};
};
