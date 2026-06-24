import dotenv from "dotenv";
import type { Request, Response } from "express";
import { createUser, getUsers as SgetUsers } from "./user.service.js";
import type { PaginationResponse } from "../../shared/interfaces/pagination.interface.js";
import type { UserResponse } from "./user.interface.js";
import { toUserResponseList } from "./user.mapper.js";
import { STRING_CONSTANT } from "../../shared/constants/messages.constants.js";
dotenv.config();
export const registerUser = async function (
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const user = await createUser(req.body);
    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    internalServer(error, res);
  }
};
export const getUsers = async function (req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await SgetUsers(page, limit);
    const response: PaginationResponse<UserResponse> = {
      success: true,
      message: STRING_CONSTANT.success.userFetch,
      data: toUserResponseList(result.data),
      pagination: {
        page: result.page,
        limit: result.limit,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    };
    res.json(response);
  } catch (error) {
    internalServer(error, res);
  }
};
export const profile = async (req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    data: {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role,
    },
  });
};
const internalServer = (error: unknown, res: Response) => {
  if (error instanceof Error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
    return;
  }
  res.status(500).json({
    message: STRING_CONSTANT.error.internalServer,
    success: false,
  });
};
