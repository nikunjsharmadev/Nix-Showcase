import User from "./User.model.js";
import jwt from "jsonwebtoken";
import type { CreateRequest, UserResponse } from "./user.interface.js";
import { Role } from "../../shared/types/roles.js";
import { STRING_CONSTANT } from "../../shared/constants/index.js";
import { toUserResponse } from "./user.mapper.js";
import argon2 from "argon2";
import { UnauthorizedError } from "../../errors/unauthorized.error.js";
export const createUser = async function (
  data: CreateRequest,
): Promise<UserResponse> {
  try {
    const existingUser = await User.findOne({
      email: data.email,
    });
    if (existingUser) {
      throw new Error(STRING_CONSTANT.error.emailExist);
    }
    const passwordHash = await argon2.hash(data.password);
    const isValid = await argon2.verify(passwordHash, data.password);
    if (!isValid) {
      throw new UnauthorizedError(STRING_CONSTANT.error.unauthorized);
    }
    const user = await User.create({
      ...data,
      passwordHash,
      role: data.role ?? Role.CUSTOMER,
      isVerified: false,
    });
    if (!user) {
      throw new Error(STRING_CONSTANT.error.registration);
    }
    const userResponse = toUserResponse(user);
    userResponse.varificationLink = getEmailVerificationLink(
      generateVerificationToken(user.id),
    );
    return userResponse;
  } catch (error) {
    throw error;
  }
};
export const resendVerifyEmail = () => {};
export const generateVerificationToken = (userId: string) => {
  return jwt.sign(
    {
      userId,
      purpose: "email-verification",
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "24h",
    },
  );
};
export const getEmailVerificationLink = (verificationToken: string) => {
  return `${process.env.FRONTEND_URL_LOCAL}/verify-email?token=${verificationToken}`;
};
export const getUsers = async function (page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [users, totalItems] = await Promise.all([
    User.find().skip(skip).limit(limit),
    User.countDocuments(),
  ]);
  const totalPages = Math.ceil(totalItems / limit);
  return {
    data: users,
    totalItems,
    totalPages,
    page,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
