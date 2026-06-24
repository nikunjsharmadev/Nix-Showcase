import express, { type Request, type Response } from "express";
import { API_ROUTES, STRING_CONSTANT } from "../../shared/constants/index.js";
import { login, verifyEmail } from "./auth.controller.js";
import { registerUser } from "../users/user.controller.js";
import { asyncHandler } from "../../utils/async-handler.js";
const router = express.Router();
router.get(API_ROUTES.auth.server, (req: Request, res: Response) => {
  res.status(200).json({
    message: STRING_CONSTANT.apiStatus.auth,
  });
});
router.route(API_ROUTES.auth.verifyEmail).get(asyncHandler(verifyEmail));
router.route(API_ROUTES.auth.register).post(asyncHandler(registerUser));
router.route(API_ROUTES.auth.login).post(asyncHandler(login));
export const AuthRoutes = router;
